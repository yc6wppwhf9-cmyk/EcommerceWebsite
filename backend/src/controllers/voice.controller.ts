import crypto from 'crypto';
import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { config } from '../config/env';
import { searchProducts } from './chat.controller';
import { createSupportTicket } from '../lib/support.service';

/**
 * Webhook for the Vapi phone assistant. Vapi POSTs { message: {...} } here for
 * tool calls (we must answer) and call events such as the end-of-call report.
 */

type ToolArgs = Record<string, any>;

const MARKETPLACES: [string, string][] = [
  ['amazon_url', 'Amazon'],
  ['flipkart_url', 'Flipkart'],
  ['myntra_url', 'Myntra'],
  ['ajio_url', 'Ajio'],
];

function secretMatches(provided: string | undefined): boolean {
  const expected = config.VAPI_WEBHOOK_SECRET;
  if (!expected || !provided) return false;
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function isAuthorised(req: Request): boolean {
  const header = req.headers['x-vapi-secret'];
  const fromHeader = Array.isArray(header) ? header[0] : header;
  const bearer = req.headers.authorization?.replace(/^Bearer\s+/i, '');
  return secretMatches(fromHeader) || secretMatches(bearer);
}

function parseArgs(raw: unknown): ToolArgs {
  if (typeof raw === 'string') {
    try { return JSON.parse(raw); } catch { return {}; }
  }
  return (raw as ToolArgs) || {};
}

/** Short, speakable product facts: name, price and where to buy it. */
async function toolSearchProducts(args: ToolArgs) {
  const products = await searchProducts({
    search: args.query ? String(args.query) : undefined,
    category: args.category ? String(args.category) : undefined,
    min_price: args.min_price ? Number(args.min_price) : undefined,
    max_price: args.max_price ? Number(args.max_price) : undefined,
    limit: 3,
  });
  if (!products.length) return 'No matching products found in the catalogue.';
  return products.map((p: any) => ({
    name: p.name,
    price_inr: p.price,
    available_on: MARKETPLACES.filter(([col]) => p[col]).map(([, label]) => label),
  }));
}

async function toolCheckTicketStatus(args: ToolArgs) {
  const ticket = String(args.ticket_number || '').toUpperCase().replace(/\s+/g, '').trim();
  if (!ticket) return 'Ask the caller for their ticket number, for example CS-20261008-6C4BAD.';
  const { data } = await supabase
    .from('support_tickets')
    .select('ticket_number, type, status, created_at, updated_at')
    .eq('ticket_number', ticket)
    .maybeSingle();
  if (!data) return `No ticket found with number ${ticket}.`;
  return data;
}

async function toolCreateTicket(args: ToolArgs, callerNumber: string | null) {
  const name = String(args.name || '').trim() || 'Phone caller';
  const summary = String(args.issue_summary || '').trim();
  if (!summary) return 'Ask the caller to describe the issue before creating a ticket.';
  const isWarranty = /damage|broken|defect|warranty|replace|torn|zip/i.test(summary);
  const ticket = await createSupportTicket({
    type: isWarranty ? 'warranty' : 'contact',
    name: name.slice(0, 120),
    email: String(args.email || '').trim().slice(0, 254),
    phone: (callerNumber || String(args.phone || '')).slice(0, 20) || null,
    product_name: args.product_name ? String(args.product_name).slice(0, 200) : null,
    subject: `Phone call: ${summary}`.slice(0, 200),
    message: summary,
  });
  return { ticket_number: ticket.ticket_number, status: ticket.status };
}

async function runTool(name: string, args: ToolArgs, callerNumber: string | null) {
  switch (name) {
    case 'search_products': return toolSearchProducts(args);
    case 'check_ticket_status': return toolCheckTicketStatus(args);
    case 'create_support_ticket': return toolCreateTicket(args, callerNumber);
    default: return `Unknown tool: ${name}`;
  }
}

/** Saves the call transcript and summary next to the website chat logs. */
async function saveCallReport(message: any) {
  const call = message.call || {};
  const transcript: string = message.artifact?.transcript || message.transcript || '';
  const summary: string = message.analysis?.summary || message.summary || '';
  try {
    await supabase.from('chat_logs').insert({
      session_id: `call:${call.id || 'unknown'}`,
      user_message: transcript || '(no transcript)',
      bot_response: [
        summary,
        message.artifact?.recordingUrl ? `Recording: ${message.artifact.recordingUrl}` : '',
        message.endedReason ? `Ended: ${message.endedReason}` : '',
      ].filter(Boolean).join('\n'),
      intent_category: 'phone_call',
      user_agent: call.customer?.number ? `caller ${call.customer.number}` : 'phone call',
    });
  } catch (err) {
    console.warn('Call report not saved:', err);
  }
}

export const vapiWebhook = async (req: Request, res: Response) => {
  if (!isAuthorised(req)) return res.status(401).json({ error: 'Unauthorised' });

  const message = req.body?.message || {};
  const callerNumber: string | null = message.call?.customer?.number || null;

  if (message.type === 'tool-calls') {
    const calls: any[] = message.toolCallList || message.toolCalls || [];
    const results = await Promise.all(calls.map(async (tc) => {
      const name = tc.function?.name || tc.name;
      const args = parseArgs(tc.function?.arguments ?? tc.arguments);
      try {
        const result = await runTool(name, args, callerNumber);
        return { toolCallId: tc.id, result: typeof result === 'string' ? result : JSON.stringify(result) };
      } catch (err) {
        console.error(`Vapi tool ${name} failed:`, err);
        return { toolCallId: tc.id, result: 'That lookup failed. Apologise and offer to take a message for the team.' };
      }
    }));
    return res.json({ results });
  }

  if (message.type === 'end-of-call-report') {
    await saveCallReport(message);
  }

  return res.json({ ok: true });
};
