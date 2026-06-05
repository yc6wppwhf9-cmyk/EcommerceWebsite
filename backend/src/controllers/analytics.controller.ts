import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import * as Mailer from '../lib/mail';
import { config } from '../config/env';

// In-memory product view counters: productId -> Set of session ids active in last 15 min
const viewSessions = new Map<string, Map<string, number>>();
const VIEW_WINDOW_MS = 15 * 60 * 1000;

function cleanOldViews(productId: string) {
  const sessions = viewSessions.get(productId);
  if (!sessions) return;
  const cutoff = Date.now() - VIEW_WINDOW_MS;
  for (const [sid, ts] of sessions) {
    if (ts < cutoff) sessions.delete(sid);
  }
}

export const trackProductView = (req: Request, res: Response) => {
  const { product_id } = req.params;
  const sessionId = (req.headers['x-session-id'] as string) || req.ip || 'anon';

  if (!viewSessions.has(product_id)) viewSessions.set(product_id, new Map());
  cleanOldViews(product_id);
  viewSessions.get(product_id)!.set(sessionId, Date.now());

  res.json({ ok: true });
};

export const getProductViewCount = (req: Request, res: Response) => {
  const { product_id } = req.params;
  cleanOldViews(product_id);
  const count = viewSessions.get(product_id)?.size ?? 0;
  res.json({ count });
};

// ─── Abandoned Cart ────────────────────────────────────────────────────────
export const sendAbandonedCartEmails = async (_req: Request, res: Response) => {
  const cutoff = new Date(Date.now() - 60 * 60 * 1000).toISOString(); // 1 hour ago

  const { data: carts, error } = await supabase
    .from('cart_items')
    .select('user_id, updated_at, products(name, price, image), quantity')
    .lt('updated_at', cutoff)
    .is('abandoned_email_sent_at', null);

  if (error) return res.status(500).json({ error: error.message });

  // Group by user
  const byUser = new Map<string, any[]>();
  for (const row of (carts || [])) {
    if (!byUser.has(row.user_id)) byUser.set(row.user_id, []);
    byUser.get(row.user_id)!.push(row);
  }

  let sent = 0;
  for (const [userId, rows] of byUser) {
    const { data: user } = await supabase
      .from('users')
      .select('name, email')
      .eq('id', userId)
      .single();

    if (!user) continue;

    const items = rows.map(r => ({
      name: (r.products as any)?.name || 'Product',
      price: (r.products as any)?.price || 0,
      image: (r.products as any)?.image,
      quantity: r.quantity,
    }));

    await Mailer.sendEmail(
      user.email,
      'You left something in your cart! - Priority Bags',
      Mailer.getAbandonedCartTemplate(user.name, items, `${config.FRONTEND_URL}/checkout`)
    );

    // Mark as sent
    await supabase
      .from('cart_items')
      .update({ abandoned_email_sent_at: new Date().toISOString() })
      .eq('user_id', userId)
      .lt('updated_at', cutoff)
      .is('abandoned_email_sent_at', null);

    sent++;
  }

  res.json({ sent });
};
