import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Building2, LifeBuoy, RefreshCw, Mail, Phone, ChevronDown, ChevronUp } from 'lucide-react';
import { api } from '../../lib/api';

interface AdminEnquiriesProps {
  showToast: (msg: string, type?: 'success' | 'error') => void;
}

const INQUIRY_STATUSES = ['new', 'contacted', 'quoted', 'converted', 'closed'];
const TICKET_STATUSES = ['open', 'in_review', 'waiting_customer', 'resolved', 'closed'];
const OPEN_TICKET = ['open', 'in_review', 'waiting_customer'];

const STATUS_CLS: Record<string, string> = {
  new: 'bg-violet-100 text-violet-700',
  contacted: 'bg-sky-100 text-sky-700',
  quoted: 'bg-amber-100 text-amber-700',
  converted: 'bg-emerald-100 text-emerald-700',
  open: 'bg-orange-100 text-orange-700',
  in_review: 'bg-sky-100 text-sky-700',
  waiting_customer: 'bg-amber-100 text-amber-700',
  resolved: 'bg-emerald-100 text-emerald-700',
  closed: 'bg-gray-100 text-gray-600',
};

const label = (s: string) => s.replace(/_/g, ' ');
const when = (iso: string) =>
  new Date(iso).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

const Field: React.FC<{ k: string; v?: React.ReactNode }> = ({ k, v }) =>
  v ? (
    <div>
      <dt className="text-[9px] font-black uppercase tracking-widest text-gray-400">{k}</dt>
      <dd className="text-[12px] text-gray-800 mt-0.5 whitespace-pre-line break-words">{v}</dd>
    </div>
  ) : null;

export const AdminEnquiries: React.FC<AdminEnquiriesProps> = ({ showToast }) => {
  const [view, setView] = useState<'inquiries' | 'tickets'>('inquiries');
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);
  const [onlyOpen, setOnlyOpen] = useState(true);
  // The parent's showToast isn't memoised; keep load() stable so it doesn't refetch on every render.
  const toastRef = useRef(showToast);
  toastRef.current = showToast;

  const load = useCallback(async () => {
    setLoading(true);
    const [inq, tix] = await Promise.allSettled([api.listAdminInquiries(), api.listAdminTickets()]);
    if (inq.status === 'fulfilled') setInquiries(inq.value || []);
    if (tix.status === 'fulfilled') setTickets(tix.value || []);
    if (inq.status === 'rejected' || tix.status === 'rejected') toastRef.current('Some enquiries could not be loaded', 'error');
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const setStatus = async (kind: 'inquiries' | 'tickets', id: string, status: string) => {
    try {
      if (kind === 'inquiries') {
        const row = await api.updateAdminInquiryStatus(id, status);
        setInquiries((l) => l.map((x) => (x.id === id ? { ...x, ...row } : x)));
      } else {
        const row = await api.updateAdminTicketStatus(id, status);
        setTickets((l) => l.map((x) => (x.id === id ? { ...x, ...row } : x)));
      }
      showToast(`Marked as ${label(status)}`, 'success');
    } catch (e: any) {
      showToast(e?.message || 'Could not update status', 'error');
    }
  };

  const isOpen = (row: any) => (view === 'inquiries' ? !['converted', 'closed'].includes(row.status) : OPEN_TICKET.includes(row.status));
  const rows = (view === 'inquiries' ? inquiries : tickets).filter((r) => !onlyOpen || isOpen(r));
  const newInquiries = inquiries.filter((i) => i.status === 'new').length;
  const openTickets = tickets.filter((t) => OPEN_TICKET.includes(t.status)).length;

  return (
    <motion.div key="enq" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-xl bg-gray-100 p-1">
          {([
            ['inquiries', 'Corporate leads', Building2, newInquiries],
            ['tickets', 'Support tickets', LifeBuoy, openTickets],
          ] as const).map(([id, text, Icon, n]) => (
            <button
              key={id}
              onClick={() => { setView(id); setOpenId(null); }}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-[11px] font-black uppercase tracking-widest transition-colors ${
                view === id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <Icon size={14} /> {text}
              {n > 0 && <span className="ml-1 rounded-full bg-gray-900 text-white text-[10px] px-1.5 py-0.5">{n}</span>}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-4">
          <label className="inline-flex items-center gap-2 text-[11px] font-bold text-gray-600 cursor-pointer">
            <input type="checkbox" checked={onlyOpen} onChange={(e) => setOnlyOpen(e.target.checked)} className="accent-gray-900" />
            Only open
          </label>
          <button onClick={load} className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-gray-900">
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50">
        {loading && rows.length === 0 ? (
          <p className="p-10 text-center text-[11px] font-black uppercase tracking-widest text-gray-300">Loading…</p>
        ) : rows.length === 0 ? (
          <p className="p-10 text-center text-[12px] text-gray-400">
            {onlyOpen ? 'Nothing open. ' : 'Nothing here yet. '}
            {onlyOpen && <button onClick={() => setOnlyOpen(false)} className="text-priority-blue font-bold">Show all</button>}
          </p>
        ) : (
          rows.map((r) => {
            const expanded = openId === r.id;
            const statuses = view === 'inquiries' ? INQUIRY_STATUSES : TICKET_STATUSES;
            const title = view === 'inquiries'
              ? `${r.organisation_name} — ${r.quantity} × ${r.category}`
              : r.subject || `${label(r.type || 'support')} request`;
            const ref = view === 'inquiries' ? r.reference_number : r.ticket_number;
            return (
              <div key={r.id} className="p-4 md:p-5">
                <div className="flex flex-wrap md:flex-nowrap items-center gap-3">
                  <button onClick={() => setOpenId(expanded ? null : r.id)} className="flex-1 min-w-0 text-left">
                    <p className="text-[13px] font-bold text-gray-900 truncate">{title}</p>
                    <p className="text-[11px] text-gray-400 truncate">{r.name} · {ref} · {when(r.created_at)}</p>
                  </button>
                  <select
                    value={r.status}
                    onChange={(e) => setStatus(view, r.id, e.target.value)}
                    className={`text-[10px] font-black uppercase tracking-wider rounded-lg px-2.5 py-1.5 border-0 cursor-pointer ${STATUS_CLS[r.status] || 'bg-gray-100 text-gray-600'}`}
                    aria-label="Status"
                  >
                    {statuses.map((s) => <option key={s} value={s}>{label(s)}</option>)}
                  </select>
                  <button onClick={() => setOpenId(expanded ? null : r.id)} className="p-1 text-gray-400" aria-label={expanded ? 'Hide details' : 'Show details'}>
                    {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>

                {expanded && (
                  <div className="mt-4 rounded-xl bg-gray-50 p-4">
                    <div className="flex flex-wrap gap-2 mb-4">
                      <a href={`mailto:${r.email}?subject=${encodeURIComponent(`Re: ${ref}`)}`} className="inline-flex items-center gap-1.5 rounded-lg bg-gray-900 text-white px-3 py-1.5 text-[11px] font-bold">
                        <Mail size={12} /> Reply by email
                      </a>
                      {r.phone && (
                        <a href={`tel:${r.phone}`} className="inline-flex items-center gap-1.5 rounded-lg bg-white border border-gray-200 px-3 py-1.5 text-[11px] font-bold text-gray-800">
                          <Phone size={12} /> {r.phone}
                        </a>
                      )}
                    </div>
                    <dl className="grid sm:grid-cols-2 gap-4">
                      <Field k="Name" v={r.name} />
                      <Field k="Email" v={r.email} />
                      {view === 'inquiries' ? (
                        <>
                          <Field k="Organisation" v={r.organisation_name} />
                          <Field k="Category" v={r.category} />
                          <Field k="Quantity" v={r.quantity} />
                          <Field k="Budget" v={r.approx_budget} />
                          <Field k="Delivery location" v={r.location} />
                          <Field k="Notes" v={r.notes} />
                        </>
                      ) : (
                        <>
                          <Field k="Type" v={label(r.type || '')} />
                          <Field k="Order reference" v={r.order_reference} />
                          <Field k="Product" v={r.product_name} />
                          <Field k="Purchase date" v={r.purchase_date} />
                          <div className="sm:col-span-2"><Field k="Message" v={r.message} /></div>
                        </>
                      )}
                    </dl>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </motion.div>
  );
};
