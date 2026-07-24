import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import * as Mailer from '../lib/mail';
import { escapeHtml } from '../lib/sanitize';
import { createSupportTicket } from '../lib/support.service';
import { AuthRequest } from '../middleware/auth';

export const submitWarrantyClaim = async (req: Request, res: Response) => {
  const { name, email, phone, order_id, product_name, purchase_date, issue } = req.body;

  try {
    const ticket = await createSupportTicket({
      type: 'warranty',
      name: name.trim(),
      email,
      phone: phone.trim(),
      order_reference: order_id.trim(),
      product_name: product_name.trim(),
      purchase_date,
      subject: `Warranty claim for ${product_name.trim()}`,
      message: issue.trim(),
    });

    const safe = {
      ticket: escapeHtml(ticket.ticket_number),
      name: escapeHtml(name),
      email: escapeHtml(email),
      phone: escapeHtml(phone),
      orderId: escapeHtml(order_id),
      product: escapeHtml(product_name),
      purchased: escapeHtml(purchase_date),
      issue: escapeHtml(issue),
    };

    void Mailer.sendEmail(
      'info@prioritybags.in',
      `[Warranty ${safe.ticket}] ${safe.product}`,
      `<h2>New warranty claim</h2>
       <p><strong>Ticket:</strong> ${safe.ticket}</p>
       <p><strong>Customer:</strong> ${safe.name} (${safe.email}, ${safe.phone})</p>
       <p><strong>Order:</strong> ${safe.orderId}</p>
       <p><strong>Product:</strong> ${safe.product}</p>
       <p><strong>Purchased:</strong> ${safe.purchased}</p>
       <p><strong>Issue:</strong></p><p style="white-space:pre-line">${safe.issue}</p>`,
    );

    void Mailer.sendEmail(
      email,
      `Warranty claim received — ${safe.ticket}`,
      `<h2>We received your warranty claim</h2>
       <p>Hi ${safe.name},</p>
       <p>Your reference number is <strong>${safe.ticket}</strong>.</p>
       <p>Our team will review the claim and respond within 2–3 business days. Keep this number for status enquiries.</p>`,
    );

    return res.status(201).json({
      message: 'Warranty claim submitted successfully.',
      ticket_number: ticket.ticket_number,
      status: ticket.status,
    });
  } catch (err: any) {
    console.error('Warranty claim error:', err);
    return res.status(500).json({ error: 'Unable to submit the warranty claim. Please try again.' });
  }
};

export const getPublicStatus = async (req: Request, res: Response) => {
  const ticketNumber = req.params.ticketNumber?.toUpperCase().trim();
  const email = String(req.query.email || '').toLowerCase().trim();
  if (!ticketNumber || !email) {
    return res.status(400).json({ error: 'Ticket number and email are required' });
  }

  const { data, error } = await supabase
    .from('support_tickets')
    .select('ticket_number, type, subject, status, created_at, updated_at')
    .eq('ticket_number', ticketNumber)
    .eq('email', email)
    .maybeSingle();

  if (error || !data) return res.status(404).json({ error: 'Support ticket not found' });
  return res.json(data);
};

export const listTickets = async (_req: AuthRequest, res: Response) => {
  const { data, error } = await supabase
    .from('support_tickets')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  return res.json(data || []);
};

export const updateTicketStatus = async (req: AuthRequest, res: Response) => {
  const validStatuses = ['open', 'in_review', 'waiting_customer', 'resolved', 'closed'];
  const status = String(req.body.status || '');
  if (!validStatuses.includes(status)) return res.status(400).json({ error: 'Invalid ticket status' });

  const { data, error } = await supabase
    .from('support_tickets')
    .update({ status })
    .eq('id', req.params.id)
    .select()
    .single();

  if (error || !data) return res.status(404).json({ error: 'Support ticket not found' });
  return res.json(data);
};
