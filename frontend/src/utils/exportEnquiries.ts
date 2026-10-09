// Builds a real .xlsx of corporate leads or support tickets for the admin
// Enquiries screen. The Excel writer is loaded only when someone exports.

type Row = Record<string, any>;
type Col = { header: string; width: number; value: (r: Row) => string };

const ist = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
      })
    : '';

const text = (v: unknown) => (v == null ? '' : String(v));

export const INQUIRY_COLUMNS: Col[] = [
  { header: 'Reference', width: 22, value: (r) => text(r.reference_number) },
  { header: 'Received (IST)', width: 22, value: (r) => ist(r.created_at) },
  { header: 'Status', width: 12, value: (r) => text(r.status) },
  { header: 'Name', width: 22, value: (r) => text(r.name) },
  { header: 'Organisation', width: 28, value: (r) => text(r.organisation_name) },
  { header: 'Email', width: 30, value: (r) => text(r.email) },
  { header: 'Phone', width: 16, value: (r) => text(r.phone) },
  { header: 'Category', width: 28, value: (r) => text(r.category) },
  { header: 'Quantity', width: 16, value: (r) => text(r.quantity) },
  { header: 'Budget', width: 24, value: (r) => text(r.approx_budget) },
  { header: 'Delivery location', width: 30, value: (r) => text(r.location) },
  { header: 'Notes', width: 60, value: (r) => text(r.notes) },
];

export const TICKET_COLUMNS: Col[] = [
  { header: 'Ticket', width: 22, value: (r) => text(r.ticket_number) },
  { header: 'Received (IST)', width: 22, value: (r) => ist(r.created_at) },
  { header: 'Status', width: 16, value: (r) => text(r.status).replace(/_/g, ' ') },
  { header: 'Type', width: 10, value: (r) => text(r.type) },
  { header: 'Name', width: 22, value: (r) => text(r.name) },
  { header: 'Email', width: 30, value: (r) => text(r.email) },
  { header: 'Phone', width: 16, value: (r) => text(r.phone) },
  { header: 'Subject', width: 36, value: (r) => text(r.subject) },
  { header: 'Product', width: 28, value: (r) => text(r.product_name) },
  { header: 'Order reference', width: 20, value: (r) => text(r.order_reference) },
  { header: 'Purchase date', width: 14, value: (r) => text(r.purchase_date) },
  { header: 'Message', width: 60, value: (r) => text(r.message) },
];

export async function downloadEnquiriesXlsx(kind: 'inquiries' | 'tickets', rows: Row[]) {
  const { default: writeXlsxFile } = await import('write-excel-file/browser');
  const cols = kind === 'inquiries' ? INQUIRY_COLUMNS : TICKET_COLUMNS;
  const date = new Date().toISOString().slice(0, 10);
  const name = kind === 'inquiries' ? 'corporate-bulk-enquiries' : 'support-tickets';

  await writeXlsxFile(rows, {
    sheet: kind === 'inquiries' ? 'Corporate enquiries' : 'Support tickets',
    stickyRowsCount: 1,
    columns: cols.map((c) => ({
      header: { value: c.header, fontWeight: 'bold' as const },
      width: c.width,
      cell: (r: Row) => ({ value: c.value(r), wrap: true }),
    })),
  }).toFile(`${name}-${date}.xlsx`);
}
