import { Response } from 'express';
import { supabase } from '../config/supabase';
import { AuthRequest } from '../middleware/auth';

const DAY = 24 * 60 * 60 * 1000;
const MARKETPLACES = ['amazon', 'flipkart', 'myntra', 'ajio'] as const;
type Marketplace = (typeof MARKETPLACES)[number];

const OPEN_TICKET_STATUSES = ['open', 'in_review', 'waiting_customer'];
const TICKET_STATUSES = ['open', 'in_review', 'waiting_customer', 'resolved', 'closed'];
const INQUIRY_STATUSES = ['new', 'contacted', 'quoted', 'converted', 'closed'];

const iso = (msAgo: number) => new Date(Date.now() - msAgo).toISOString();

async function count(table: string, apply?: (q: any) => any): Promise<number> {
  let q: any = supabase.from(table).select('*', { count: 'exact', head: true });
  if (apply) q = apply(q);
  const { count: c, error } = await q;
  if (error) {
    console.warn(`insights count(${table}) failed:`, error.message);
    return 0;
  }
  return c ?? 0;
}

/**
 * Dashboard summary for a catalogue storefront whose sales happen on
 * marketplaces: outbound clicks, leads and enquiries rather than orders.
 */
export const getSummary = async (_req: AuthRequest, res: Response) => {
  try {
    const [productsRes, clicksRes, ticketsRes, inquiriesRes, applicationsRes] = await Promise.all([
      supabase
        .from('products')
        .select('id, name, image, stock, is_active, amazon_url, flipkart_url, myntra_url, ajio_url, amazon_clicks, flipkart_clicks, myntra_clicks, ajio_clicks'),
      supabase
        .from('marketplace_clicks')
        .select('product_id, marketplace, source, created_at')
        .gte('created_at', iso(30 * DAY))
        .order('created_at', { ascending: false })
        .limit(20000),
      supabase
        .from('support_tickets')
        .select('id, ticket_number, type, name, subject, status, created_at')
        .order('created_at', { ascending: false })
        .limit(50),
      supabase
        .from('corporate_inquiries')
        .select('id, reference_number, name, organisation_name, quantity, category, status, created_at')
        .order('created_at', { ascending: false })
        .limit(50),
      supabase
        .from('applications')
        .select('id, applicant_name, status, applied_at, jobs(title)')
        .order('applied_at', { ascending: false })
        .limit(50),
    ]);

    const products = (productsRes.data || []) as any[];
    const clicks = clicksRes.error ? [] : ((clicksRes.data || []) as any[]);
    const tickets = (ticketsRes.data || []) as any[];
    const inquiries = (inquiriesRes.data || []) as any[];
    const applications = (applicationsRes.data || []) as any[];

    // ── Marketplace clicks ──────────────────────────────────────────────
    const allTime: Record<Marketplace, number> = { amazon: 0, flipkart: 0, myntra: 0, ajio: 0 };
    for (const p of products) for (const m of MARKETPLACES) allTime[m] += Number(p[`${m}_clicks`]) || 0;

    const now = Date.now();
    const last7: Record<Marketplace, number> = { amazon: 0, flipkart: 0, myntra: 0, ajio: 0 };
    const last30: Record<Marketplace, number> = { amazon: 0, flipkart: 0, myntra: 0, ajio: 0 };
    let prev7 = 0;
    let fromChatbot30 = 0;
    const daily = new Map<string, number>();
    for (let i = 13; i >= 0; i--) daily.set(new Date(now - i * DAY).toISOString().slice(0, 10), 0);
    const productClicks30 = new Map<string, number>();

    for (const c of clicks) {
      const age = now - new Date(c.created_at).getTime();
      const m = c.marketplace as Marketplace;
      if (!(m in last30)) continue;
      last30[m]++;
      if (c.source === 'chatbot') fromChatbot30++;
      if (age <= 7 * DAY) last7[m]++;
      else if (age <= 14 * DAY) prev7++;
      const day = String(c.created_at).slice(0, 10);
      if (daily.has(day)) daily.set(day, (daily.get(day) || 0) + 1);
      if (c.product_id) productClicks30.set(c.product_id, (productClicks30.get(c.product_id) || 0) + 1);
    }

    const sum = (r: Record<string, number>) => Object.values(r).reduce((a, b) => a + b, 0);
    const byId = new Map(products.map((p) => [p.id, p]));

    const topAllTime = products
      .map((p) => ({
        id: p.id,
        name: p.name,
        image: p.image,
        clicks: MARKETPLACES.reduce((a, m) => a + (Number(p[`${m}_clicks`]) || 0), 0),
        byMarketplace: Object.fromEntries(MARKETPLACES.map((m) => [m, Number(p[`${m}_clicks`]) || 0])),
      }))
      .filter((p) => p.clicks > 0)
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 8);

    const top30 = [...productClicks30.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([id, n]) => ({ id, name: byId.get(id)?.name || 'Deleted product', image: byId.get(id)?.image, clicks: n }));

    // ── Catalogue health ────────────────────────────────────────────────
    const hasLink = (p: any) => MARKETPLACES.some((m) => String(p[`${m}_url`] || '').trim());
    const catalogue = {
      total: products.length,
      active: products.filter((p) => p.is_active !== false).length,
      withoutLinks: products.filter((p) => p.is_active !== false && !hasLink(p)).length,
      neverClicked: products.filter((p) => p.is_active !== false && hasLink(p) && MARKETPLACES.every((m) => !Number(p[`${m}_clicks`]))).length,
      lowStock: products
        .filter((p) => p.is_active !== false && (p.stock ?? 0) <= 5)
        .map((p) => ({ id: p.id, name: p.name, stock: p.stock ?? 0 })),
    };

    // ── Leads & enquiries ───────────────────────────────────────────────
    const openTickets = tickets.filter((t) => OPEN_TICKET_STATUSES.includes(t.status));
    const newInquiries = inquiries.filter((i) => i.status === 'new');
    const pendingApplications = applications.filter((a) => a.status === 'pending');

    const [usersTotal, usersNew30, chats7, openOrders] = await Promise.all([
      count('users', (q) => q.neq('role', 'admin')),
      count('users', (q) => q.neq('role', 'admin').gte('created_at', iso(30 * DAY))),
      count('chat_logs', (q) => q.gte('created_at', iso(7 * DAY))),
      count('orders', (q) => q.in('status', ['pending', 'confirmed', 'processing'])),
    ]);

    const activity = [
      ...tickets.slice(0, 10).map((t) => ({
        kind: 'ticket', id: t.id, at: t.created_at, status: t.status,
        title: t.subject || `${t.type || 'Support'} request`, detail: `${t.name} · ${t.ticket_number}`,
      })),
      ...inquiries.slice(0, 10).map((i) => ({
        kind: 'inquiry', id: i.id, at: i.created_at, status: i.status,
        title: `${i.organisation_name} — ${i.quantity} × ${i.category}`, detail: `${i.name} · ${i.reference_number}`,
      })),
      ...applications.slice(0, 10).map((a) => ({
        kind: 'application', id: a.id, at: a.applied_at, status: a.status,
        title: `${a.applicant_name} applied`, detail: a.jobs?.title || 'General application',
      })),
    ]
      .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
      .slice(0, 12);

    res.json({
      generatedAt: new Date().toISOString(),
      clickLogAvailable: !clicksRes.error,
      clicks: {
        allTime, allTimeTotal: sum(allTime),
        last7, last7Total: sum(last7), prev7Total: prev7,
        last30, last30Total: sum(last30), fromChatbot30,
        daily: [...daily.entries()].map(([date, n]) => ({ date, clicks: n })),
        topAllTime, top30,
      },
      catalogue,
      leads: {
        openTickets: openTickets.length,
        newInquiries: newInquiries.length,
        pendingApplications: pendingApplications.length,
      },
      customers: { total: usersTotal, new30: usersNew30 },
      chats7,
      openOrders,
      activity,
    });
  } catch (err: any) {
    console.error('insights summary failed:', err);
    res.status(500).json({ error: 'Could not load dashboard summary' });
  }
};

export const listTickets = async (_req: AuthRequest, res: Response) => {
  const { data, error } = await supabase
    .from('support_tickets')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(500);
  if (error) return res.status(500).json({ error: 'Could not load tickets' });
  res.json(data || []);
};

export const updateTicketStatus = async (req: AuthRequest, res: Response) => {
  const status = String(req.body?.status || '');
  if (!TICKET_STATUSES.includes(status)) return res.status(400).json({ error: 'Invalid ticket status' });
  const { data, error } = await supabase
    .from('support_tickets')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', req.params.id)
    .select()
    .single();
  if (error || !data) return res.status(404).json({ error: 'Ticket not found' });
  res.json(data);
};

export const listInquiries = async (_req: AuthRequest, res: Response) => {
  const { data, error } = await supabase
    .from('corporate_inquiries')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(500);
  if (error) return res.status(500).json({ error: 'Could not load inquiries' });
  res.json(data || []);
};

export const updateInquiryStatus = async (req: AuthRequest, res: Response) => {
  const status = String(req.body?.status || '');
  if (!INQUIRY_STATUSES.includes(status)) return res.status(400).json({ error: 'Invalid inquiry status' });
  const { data, error } = await supabase
    .from('corporate_inquiries')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', req.params.id)
    .select()
    .single();
  if (error || !data) return res.status(404).json({ error: 'Inquiry not found' });
  res.json(data);
};
