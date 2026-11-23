import React, { useEffect, useMemo, useState } from 'react';
import { Download, Search, X } from 'lucide-react';
import { api } from '../../lib/api';
import { ClickReportDialog } from './ClickReportDialog';

// Full list behind "Most-clicked products → View all": every product with its
// marketplace clicks, filterable by period, marketplace, category and status.

type Marketplace = 'amazon' | 'myntra' | 'ajio' | 'flipkart';
type Period = 'allTime' | 'last30' | 'last7';
type Row = {
  id: string; name: string; slug: string; sku: string | null; image: string | null;
  active: boolean; category: string; listedOn: Marketplace[];
  allTime: Record<Marketplace, number>; last30: Record<Marketplace, number>; last7: Record<Marketplace, number>;
};

const MARKETPLACES: { id: Marketplace; label: string }[] = [
  { id: 'amazon', label: 'Amazon' },
  { id: 'myntra', label: 'Myntra' },
  { id: 'ajio', label: 'Ajio' },
  { id: 'flipkart', label: 'Flipkart' },
];
const PERIODS: { id: Period; label: string }[] = [
  { id: 'allTime', label: 'All time' },
  { id: 'last30', label: 'Last 30 days' },
  { id: 'last7', label: 'Last 7 days' },
];
const PAGE = 50;

const fmt = (n: number) => (n || 0).toLocaleString('en-IN');
const titleCase = (slug: string) => slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

const selectCls =
  'h-10 rounded-xl border border-gray-200 bg-white px-3 text-[12px] font-bold text-gray-700 focus:outline-none focus:border-priority-blue';

export const AdminProductClicks: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [period, setPeriod] = useState<Period>('allTime');
  const [market, setMarket] = useState<'all' | Marketplace>('all');
  const [category, setCategory] = useState('all');
  const [status, setStatus] = useState<'live' | 'hidden' | 'all'>('live');
  const [clicked, setClicked] = useState<'clicked' | 'never' | 'all'>('clicked');
  const [sort, setSort] = useState<'most' | 'least' | 'name'>('most');
  const [shown, setShown] = useState(PAGE);
  const [showReport, setShowReport] = useState(false);

  useEffect(() => {
    api.getAdminProductClicks()
      .then((d) => setRows(d.products || []))
      .catch((e) => setError(
        String(e?.message || '').includes('404')
          ? 'This list needs the latest server update. It will work once Render has redeployed the API.'
          : e?.message || 'Could not load products',
      ));
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && !document.querySelector('[aria-label="Download Product Click Report"]')) onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [onClose]);

  useEffect(() => { setShown(PAGE); }, [query, period, market, category, status, clicked, sort]);

  const categories = useMemo(
    () => [...new Set((rows || []).map((r) => r.category).filter(Boolean))].sort(),
    [rows],
  );

  const clicksOf = (r: Row) =>
    market === 'all'
      ? MARKETPLACES.reduce((a, m) => a + (r[period][m.id] || 0), 0)
      : r[period][market] || 0;

  const filtered = useMemo(() => {
    if (!rows) return [];
    const q = query.trim().toLowerCase();
    const list = rows
      .filter((r) => status === 'all' || (status === 'live' ? r.active : !r.active))
      .filter((r) => category === 'all' || r.category === category)
      .filter((r) => market === 'all' || r.listedOn.includes(market) || r[period][market] > 0)
      .filter((r) => !q || r.name.toLowerCase().includes(q) || (r.sku || '').toLowerCase().includes(q))
      .map((r) => ({ r, n: clicksOf(r) }))
      .filter(({ n }) => clicked === 'all' || (clicked === 'clicked' ? n > 0 : n === 0));
    list.sort((a, b) =>
      sort === 'name' ? a.r.name.localeCompare(b.r.name) : sort === 'least' ? a.n - b.n : b.n - a.n,
    );
    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, query, period, market, category, status, clicked, sort]);

  const total = filtered.reduce((a, x) => a + x.n, 0);
  const periodLabel = PERIODS.find((p) => p.id === period)!.label;
  const marketLabel = market === 'all' ? 'All marketplaces' : MARKETPLACES.find((m) => m.id === market)!.label;

  const download = async () => {
    const { default: writeXlsxFile } = await import('write-excel-file/browser');
    const cols: { header: string; width: number; value: (r: Row, n: number, i: number) => string | number }[] = [
      { header: 'Rank', width: 6, value: (_r, _n, i) => i + 1 },
      { header: 'Product', width: 48, value: (r) => r.name },
      { header: 'SKU', width: 16, value: (r) => r.sku || '' },
      { header: 'Category', width: 20, value: (r) => titleCase(r.category) },
      { header: 'Status', width: 8, value: (r) => (r.active ? 'Live' : 'Hidden') },
      { header: `Clicks (${periodLabel}, ${marketLabel})`, width: 18, value: (_r, n) => n },
      ...MARKETPLACES.map((m) => ({ header: m.label, width: 10, value: (r: Row) => r[period][m.id] || 0 })),
      { header: 'Website link', width: 60, value: (r) => `https://www.prioritybags.in/product/${r.slug}` },
    ];
    await writeXlsxFile(filtered.map((x, i) => ({ ...x, i })), {
      sheet: 'Product clicks',
      stickyRowsCount: 1,
      columns: cols.map((c) => ({
        header: { value: c.header, fontWeight: 'bold' as const },
        width: c.width,
        cell: (x: { r: Row; n: number; i: number }) => ({ value: c.value(x.r, x.n, x.i) }),
      })),
    } as any).toFile(`product-clicks-${period}-${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/40 flex items-stretch md:items-center justify-center md:p-6" onClick={onClose}>
      <div
        role="dialog"
        aria-label="All products by clicks"
        className="bg-white w-full max-w-5xl md:rounded-2xl shadow-2xl flex flex-col max-h-full md:max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 px-5 md:px-6 pt-5 pb-3">
          <div>
            <h2 className="text-[13px] font-black uppercase tracking-widest text-gray-900">All products by clicks</h2>
            {rows && (
              <p className="text-[11px] text-gray-400 mt-0.5">
                {fmt(filtered.length)} products · {fmt(total)} clicks · {periodLabel} · {marketLabel}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowReport(true)}
              className="h-9 px-3 rounded-xl bg-gray-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-black flex items-center gap-1.5"
            >
              <Download size={14} /> <span className="hidden sm:inline">Click report</span><span className="sm:hidden">Report</span>
            </button>
            {rows && filtered.length > 0 && (
              <button
                onClick={download}
                className="h-9 px-3 rounded-xl border border-gray-200 text-[10px] font-black uppercase tracking-widest text-gray-700 hover:border-priority-blue hover:text-priority-blue flex items-center gap-1.5"
              >
                <Download size={14} /> Excel
              </button>
            )}
            <button onClick={onClose} aria-label="Close" className="h-9 w-9 rounded-xl hover:bg-gray-100 flex items-center justify-center text-gray-500">
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="px-5 md:px-6 pb-4 border-b border-gray-100 grid grid-cols-2 md:grid-cols-4 gap-2">
          <label className="relative col-span-2 md:col-span-4">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search product name or SKU"
              className="w-full h-10 rounded-xl border border-gray-200 pl-9 pr-3 text-[13px] focus:outline-none focus:border-priority-blue"
            />
          </label>
          <select aria-label="Period" className={selectCls} value={period} onChange={(e) => setPeriod(e.target.value as Period)}>
            {PERIODS.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
          </select>
          <select aria-label="Marketplace" className={selectCls} value={market} onChange={(e) => setMarket(e.target.value as any)}>
            <option value="all">All marketplaces</option>
            {MARKETPLACES.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
          </select>
          <select aria-label="Category" className={selectCls} value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="all">All categories</option>
            {categories.map((c) => <option key={c} value={c}>{titleCase(c)}</option>)}
          </select>
          <select aria-label="Status" className={selectCls} value={status} onChange={(e) => setStatus(e.target.value as any)}>
            <option value="live">Live on site</option>
            <option value="hidden">Hidden</option>
            <option value="all">Live and hidden</option>
          </select>
          <select aria-label="Clicks" className={selectCls} value={clicked} onChange={(e) => setClicked(e.target.value as any)}>
            <option value="clicked">With clicks</option>
            <option value="never">No clicks</option>
            <option value="all">All products</option>
          </select>
          <select aria-label="Sort" className={selectCls} value={sort} onChange={(e) => setSort(e.target.value as any)}>
            <option value="most">Most clicks first</option>
            <option value="least">Fewest clicks first</option>
            <option value="name">Name A–Z</option>
          </select>
        </div>

        <div className="flex-1 overflow-y-auto px-5 md:px-6 py-2">
          {error ? (
            <p className="text-sm font-bold text-red-600 py-10 text-center">{error}</p>
          ) : !rows ? (
            <p className="text-[11px] font-black uppercase tracking-widest text-gray-300 py-10 text-center">Loading products…</p>
          ) : filtered.length === 0 ? (
            <p className="text-[11px] text-gray-400 py-10 text-center">No products match these filters.</p>
          ) : (
            <>
              <ol>
                {filtered.slice(0, shown).map(({ r, n }, i) => (
                  <li key={r.id} className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
                    <span className="w-7 text-[11px] font-black text-gray-300 text-right">{i + 1}</span>
                    <img src={r.image || ''} alt="" loading="lazy" className="w-10 h-10 object-contain rounded bg-gray-50 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <a
                        href={`/product/${r.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="block text-[12px] font-bold text-gray-900 truncate hover:text-priority-blue"
                      >
                        {r.name}
                      </a>
                      <p className="text-[10px] text-gray-400 truncate">
                        {[
                          titleCase(r.category),
                          !r.active && 'Hidden',
                          MARKETPLACES.filter((m) => r[period][m.id]).map((m) => `${m.label} ${fmt(r[period][m.id])}`).join(' · '),
                        ].filter(Boolean).join(' · ')}
                      </p>
                    </div>
                    <span className="text-[14px] font-black text-gray-900 tabular-nums">{fmt(n)}</span>
                  </li>
                ))}
              </ol>
              {shown < filtered.length && (
                <button
                  onClick={() => setShown((s) => s + PAGE)}
                  className="w-full my-3 h-10 rounded-xl border border-gray-200 text-[10px] font-black uppercase tracking-widest text-gray-700 hover:border-priority-blue hover:text-priority-blue"
                >
                  Show more ({fmt(filtered.length - shown)} left)
                </button>
              )}
            </>
          )}
        </div>
      </div>
      {showReport && <ClickReportDialog onClose={() => setShowReport(false)} />}
    </div>
  );
};
