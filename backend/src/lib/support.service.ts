import crypto from 'crypto';

export type SupportTicketType = 'contact' | 'warranty';

export interface NewSupportTicket {
  type: SupportTicketType;
  name: string;
  email: string;
  phone?: string | null;
  order_reference?: string | null;
  product_name?: string | null;
  purchase_date?: string | null;
  subject: string;
  message: string;
}

export function generateTicketNumber(type: SupportTicketType, now = new Date()): string {
  const date = now.toISOString().slice(0, 10).replace(/-/g, '');
  const random = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `${type === 'warranty' ? 'WR' : 'CS'}-${date}-${random}`;
}

export async function createSupportTicket(input: NewSupportTicket) {
  const { supabase } = await import('../config/supabase');
  const ticketNumber = generateTicketNumber(input.type);
  const { data, error } = await supabase
    .from('support_tickets')
    .insert({
      ...input,
      ticket_number: ticketNumber,
      email: input.email.toLowerCase().trim(),
    })
    .select('id, ticket_number, status, created_at')
    .single();

  if (error || !data) {
    throw new Error(error?.message || 'Unable to create a support ticket');
  }

  return data;
}
