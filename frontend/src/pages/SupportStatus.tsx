import { FormEvent, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AlertCircle, CheckCircle2, Loader2, Search } from 'lucide-react';
import { api } from '../lib/api';

const STATUS_LABELS: Record<string, string> = {
  open: 'Received',
  in_review: 'In review',
  waiting_customer: 'Waiting for your reply',
  resolved: 'Resolved',
  closed: 'Closed',
};

export const SupportStatus = () => {
  const [params] = useSearchParams();
  const [ticketNumber, setTicketNumber] = useState(params.get('ticket') || '');
  const [email, setEmail] = useState(params.get('email') || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [ticket, setTicket] = useState<Awaited<ReturnType<typeof api.getSupportStatus>> | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setTicket(null);
    try {
      setTicket(await api.getSupportStatus(ticketNumber.trim().toUpperCase(), email.trim()));
    } catch (err: any) {
      setError(err.message || 'We could not find that support request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container mx-auto px-4 py-24">
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-outfit font-black uppercase tracking-tight text-priority-dark">Track Support Request</h1>
          <p className="text-gray-500 mt-4">Enter the reference number and email used when you contacted us.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white border border-gray-100 shadow-xl rounded-3xl p-6 md:p-8 space-y-5">
          <div>
            <label htmlFor="support-ticket" className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Reference number</label>
            <input id="support-ticket" required value={ticketNumber} onChange={(event) => setTicketNumber(event.target.value)} placeholder="CS-20260724-ABC123" className="w-full rounded-xl border border-gray-200 px-4 py-3 uppercase outline-none focus:border-priority-blue" />
          </div>
          <div>
            <label htmlFor="support-email" className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Email address</label>
            <input id="support-email" required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-priority-blue" />
          </div>
          <button disabled={loading} className="w-full rounded-xl bg-priority-dark text-white py-4 font-black uppercase tracking-wider text-xs flex items-center justify-center gap-2 disabled:opacity-60">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            {loading ? 'Checking' : 'Check status'}
          </button>
        </form>

        {error && (
          <div role="alert" className="mt-6 flex gap-3 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {ticket && (
          <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-6 text-green-900">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle2 className="w-6 h-6" />
              <div>
                <p className="font-black">{STATUS_LABELS[ticket.status] || ticket.status}</p>
                <p className="text-xs font-mono">{ticket.ticket_number}</p>
              </div>
            </div>
            <p className="font-semibold">{ticket.subject}</p>
            <p className="text-sm mt-2 text-green-800">Last updated {new Date(ticket.updated_at).toLocaleString('en-IN')}.</p>
          </div>
        )}
      </div>
    </main>
  );
};
