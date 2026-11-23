import React, { useEffect, useState } from 'react';
import { Download, FileSpreadsheet, X } from 'lucide-react';
import { api } from '../../lib/api';
import type { Marketplace, OrderFileResult } from '../../utils/clickReport';

// "Download Product Click Report": pick a period, optionally attach marketplace
// order exports for order matching, and download the 4-sheet Excel report.

const PERIODS = [
  { id: 'all', label: 'All time', days: 0 },
  { id: '7', label: 'Last 7 days', days: 7 },
  { id: '30', label: 'Last 30 days', days: 30 },
  { id: '90', label: 'Last 90 days', days: 90 },
  { id: 'custom', label: 'Custom dates', days: -1 },
];
const MARKETS: { id: Marketplace | 'auto'; label: string }[] = [
  { id: 'auto', label: 'Detect automatically' },
  { id: 'myntra', label: 'Myntra' },
  { id: 'amazon', label: 'Amazon' },
  { id: 'ajio', label: 'Ajio' },
  { id: 'flipkart', label: 'Flipkart' },
];
const inputCls = 'h-10 rounded-xl border border-gray-200 bg-white px-3 text-[12px] font-bold text-gray-700 focus:outline-none focus:border-priority-blue';

// IST midnight for a yyyy-mm-dd date input
const istMidnight = (d: string) => new Date(`${d}T00:00:00+05:30`);

export const ClickReportDialog: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [period, setPeriod] = useState('all');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [files, setFiles] = useState<{ file: File; market: Marketplace | 'auto' }[]>([]);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState<{ clicks: number; files: OrderFileResult[] } | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && !busy) onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose, busy]);

  const range = () => {
    const p = PERIODS.find((x) => x.id === period)!;
    if (p.days > 0) return { params: { from: new Date(Date.now() - p.days * 86_400_000).toISOString() }, label: p.label };
    if (p.days < 0) {
      const params: Record<string, string> = {};
      if (from) params.from = istMidnight(from).toISOString();
      if (to) params.to = new Date(istMidnight(to).getTime() + 86_400_000).toISOString();
      const fmt = (d: string) => d.split('-').reverse().join('-');
      return { params, label: `${from ? fmt(from) : 'start'} to ${to ? fmt(to) : 'today'}` };
    }
    return { params: {}, label: 'All time' };
  };

  const run = async () => {
    setError(''); setDone(null);
    try {
      const { params, label } = range();
      setBusy('Loading clicks…');
      const log = await api.getAdminClickLog(params);
      const report = await import('../../utils/clickReport');
      const orderFiles: OrderFileResult[] = [];
      for (const f of files) {
        setBusy(`Reading ${f.file.name}…`);
        orderFiles.push(await report.readOrderFile(f.file, log.products, f.market === 'auto' ? undefined : f.market));
      }
      await report.downloadClickReport({
        clicks: log.clicks, products: log.products, orderFiles, rangeLabel: label, onProgress: setBusy,
      });
      setDone({ clicks: log.clicks.length, files: orderFiles });
    } catch (e: any) {
      const msg = String(e?.message || '');
      setError(msg.includes('404')
        ? 'The report needs the latest server update. Try again once Render has redeployed the API.'
        : msg || 'Could not build the report');
    } finally {
      setBusy('');
    }
  };

  return (
    <div className="fixed inset-0 z-[210] bg-black/40 flex items-center justify-center p-4" onClick={() => !busy && onClose()}>
      <div role="dialog" aria-label="Download Product Click Report" className="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-5 md:p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <h2 className="text-[13px] font-black uppercase tracking-widest text-gray-900">Product Click Report</h2>
            <p className="text-[11px] text-gray-500 mt-1">
              Excel with 4 sheets: Click Summary, Detailed Click Log (one row per click, IST), Clicks vs Sales Orders and Product Performance.
            </p>
          </div>
          <button onClick={onClose} disabled={!!busy} aria-label="Close" className="h-9 w-9 shrink-0 rounded-xl hover:bg-gray-100 flex items-center justify-center text-gray-500">
            <X size={18} />
          </button>
        </div>

        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1.5">Period</label>
        <select className={`${inputCls} w-full`} value={period} onChange={(e) => setPeriod(e.target.value)}>
          {PERIODS.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
        </select>
        {period === 'custom' && (
          <div className="grid grid-cols-2 gap-2 mt-2">
            <input type="date" aria-label="From date" className={inputCls} value={from} onChange={(e) => setFrom(e.target.value)} />
            <input type="date" aria-label="To date" className={inputCls} value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
        )}

        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mt-5 mb-1.5">
          Marketplace order files (optional)
        </label>
        <p className="text-[11px] text-gray-500 mb-2">
          Attach the orders export from the Myntra, Amazon or Ajio seller panel (.csv or .xlsx) to match clicks with sales orders.
        </p>
        <label className="flex items-center justify-center gap-2 h-10 rounded-xl border border-dashed border-gray-300 text-[11px] font-bold text-gray-600 cursor-pointer hover:border-priority-blue hover:text-priority-blue">
          <FileSpreadsheet size={15} /> Add order file
          <input
            type="file"
            accept=".csv,.tsv,.txt,.xlsx"
            multiple
            className="hidden"
            onChange={(e) => {
              const picked = [...(e.target.files || [])].map((file) => ({ file, market: 'auto' as const }));
              setFiles((f) => [...f, ...picked]);
              e.target.value = '';
            }}
          />
        </label>
        {files.length > 0 && (
          <ul className="mt-2 space-y-1.5">
            {files.map((f, i) => (
              <li key={`${f.file.name}-${i}`} className="flex items-center gap-2">
                <span className="flex-1 min-w-0 truncate text-[12px] font-bold text-gray-800">{f.file.name}</span>
                <select
                  aria-label={`Marketplace for ${f.file.name}`}
                  className={`${inputCls} h-8 text-[11px]`}
                  value={f.market}
                  onChange={(e) => setFiles((all) => all.map((x, j) => (j === i ? { ...x, market: e.target.value as any } : x)))}
                >
                  {MARKETS.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
                </select>
                <button aria-label={`Remove ${f.file.name}`} onClick={() => setFiles((all) => all.filter((_, j) => j !== i))} className="text-gray-400 hover:text-red-600">
                  <X size={15} />
                </button>
              </li>
            ))}
          </ul>
        )}

        {error && <p className="mt-4 text-[12px] font-bold text-red-600">{error}</p>}
        {done && (
          <div className="mt-4 rounded-xl bg-green-50 p-3 text-[12px] text-green-800">
            <p className="font-bold">Report downloaded · {done.clicks.toLocaleString('en-IN')} clicks</p>
            {done.files.map((f) => (
              <p key={f.fileName}>
                {f.fileName}: {f.orders.length} orders read as {f.marketplace}, {f.matched} matched to website products
              </p>
            ))}
          </div>
        )}

        <button
          onClick={run}
          disabled={!!busy}
          className="mt-5 w-full h-11 rounded-xl bg-gray-900 text-white text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-60"
        >
          <Download size={15} /> {busy || 'Download Product Click Report'}
        </button>
      </div>
    </div>
  );
};
