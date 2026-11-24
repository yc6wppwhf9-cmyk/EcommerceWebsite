import React, { useEffect, useMemo, useState } from 'react';
import { Download, Search, X } from 'lucide-react';
import { api } from '../../lib/api';
import { ClickReportDialog } from './ClickReportDialog';
import { OUTSIDE_INDIA, UNKNOWN, ZONES, place } from '../../utils/indiaRegions';

// Full list behind "Most-clicked products → View all": every product with its
// marketplace clicks, filterable by period, marketplace, category, status and
// visitor location (zone / state / city, from the dated click log).

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
const DAY = 86_400_000;
type LogClick = {
  product_id: string | null; marketplace: Marketplace; created_at: string;
  zone: string; state: string; city: string;
};

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
  const [log, setLog] = useState<LogClick[] | null>(null);
  const [zone, setZone] = useState('all');
  const [state, setState] = useState('all');
  const [city, setCity] = useState('all');

  useEffect(() => {
    api.getAdminProductClicks()
      .then((d) => setRows(d.products || []))
      .catch((e) => setError(
        String(e?.message || '').includes('404')
          ? 'This list needs the latest server update. It will work once Render has redeployed the API.'
          : e?.message || 'Could not load products',
      ));
    // The dated click log carries each click's location; load it alongside.
    api.getAdminClickLog()
      .then((d) => setLog((d.clicks || []).map((c: any) => {
        const pl = place(c.city, c.region_code, c.country);
        return { product_id: c.product_id, marketplace: c.marketplace, created_at: c.created_at, zone: pl.zone, state: pl.state || UNKNOWN, city: pl.city || UNKNOWN };
      })))
      .catch(() => setLog([]));
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && !document.querySelector('[aria-label="Download Product Click Report"]')) onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [onClose]);

  useEffect(() => { setShown(PAGE); }, [query, period, market, category, status, clicked, sort, zone, state, city]);

  const locationOn = zone !== 'all' || state !== 'all' || city !== 'all';
  const located = useMemo(() => (log || []).filter((c) => c.zone !== UNKNOWN), [log]);
  const states = useMemo(
    () => [...new Set(located.filter((c) => zone === 'all' || c.zone === zone).map((c) => c.state))].filter((x) => x !== UNKNOWN).sort(),
    [located, zone],
  );
  const cities = useMemo(
    () => [...new Set(located.filter((c) => (zone === 'all' || c.zone === zone) && (state === 'all' || c.state === state)).map((c) => c.city))]
      .filter((x) => x !== UNKNOWN).sort(),
    [located, zone, state],
  );
  const locatedSince = useMemo(
    () => (located.length ? new Date(Math.min(...located.map((c) => Date.parse(c.created_at)))) : null),
    [located],
  );

  // Log clicks in the chosen period, marketplace and location, grouped by product.
  const byProduct = useMemo(() => {
    const cutoff = period === 'last7' ? Date.now() - 7 * DAY : period === 'last30' ? Date.now() - 30 * DAY : 0;
    const map = new Map<string, LogClick[]>();
    for (const c of log || []) {
      if (!c.product_id || Date.parse(c.created_at) < cutoff) continue;
      if (zone !== 'all' && c.zone !== zone) continue;
      if (state !== 'all' && c.state !== state) continue;
      if (city !== 'all' && c.city !== city) continue;
      if (!map.has(c.product_id)) map.set(c.product_id, []);
      map.get(c.product_id)!.push(c);
    }
    return map;
  }, [log, period, zone, state, city]);

  const top = (list: LogClick[], key: 'state' | 'city' | 'zone', n = 3) => {
    const m = new Map<string, number>();
    for (const c of list) if (c[key] && c[key] !== UNKNOWN && (market === 'all' || c.marketplace === market)) m.set(c[key], (m.get(c[key]) || 0) + 1);
    return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, n).map(([k, v]) => `${k} ${v}`).join(', ');
  };
  const counts = (r: Row): Record<Marketplace, number> => {
    if (!locationOn) return r[period];
    const out: Record<Marketplace, number> = { amazon: 0, myntra: 0, ajio: 0, flipkart: 0 };
    for (const c of byProduct.get(r.id) || []) out[c.marketplace]++;
    return out;
  };

  const categories = useMemo(
    () => [...new Set((rows || []).map((r) => r.category).filter(Boolean))].sort(),
    [rows],
  );

  const clicksOf = (r: Row) => {
    const c = counts(r);
    return market === 'all' ? MARKETPLACES.reduce((a, m) => a + (c[m.id] || 0), 0) : c[market] || 0;
  };

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
  }, [rows, query, period, market, category, status, clicked, sort, byProduct, locationOn]);

  const total = filtered.reduce((a, x) => a + x.n, 0);
  const periodLabel = PERIODS.find((p) => p.id === period)!.label;
  const marketLabel = market === 'all' ? 'All marketplaces' : MARKETPLACES.find((m) => m.id === market)!.label;
  const locationLabel = [city !== 'all' && city, state !== 'all' && state, zone !== 'all' && `${zone} zone`].filter(Boolean).join(', ');

  const download = async () => {
    const { default: writeXlsxFile } = await import('write-excel-file/browser');
    const cols: { header: string; width: number; value: (r: Row, n: number, i: number) => string | number }[] = [
      { header: 'Rank', width: 6, value: (_r, _n, i) => i + 1 },
      { header: 'Product', width: 48, value: (r) => r.name },
      { header: 'SKU', width: 16, value: (r) => r.sku || '' },
      { header: 'Category', width: 20, value: (r) => titleCase(r.category) },
      { header: 'Status', width: 8, value: (r) => (r.active ? 'Live' : 'Hidden') },
      { header: `Clicks (${[periodLabel, marketLabel, locationLabel].filter(Boolean).join(', ')})`, width: 22, value: (_r, n) => n },
      ...MARKETPLACES.map((m) => ({ header: m.label, width: 10, value: (r: Row) => counts(r)[m.id] || 0 })),
      { header: 'Top zones (recorded clicks)', width: 30, value: (r) => top(byProduct.get(r.id) || [], 'zone') },
      { header: 'Top states (recorded clicks)', width: 40, value: (r) => top(byProduct.get(r.id) || [], 'state', 5) },
      { header: 'Top cities (recorded clicks)', width: 40, value: (r) => top(byProduct.get(r.id) || [], 'city', 5) },
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
                {fmt(filtered.length)} products · {fmt(total)} clicks · {periodLabel} · {marketLabel}{locationLabel && ` · ${locationLabel}`}
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
          <select aria-label="Zone" className={selectCls} value={zone} onChange={(e) => { setZone(e.target.value); setState('all'); setCity('all'); }}>
            <option value="all">All zones</option>
            {ZONES.map((z) => <option key={z} value={z}>{z} zone</option>)}
            <option value={OUTSIDE_INDIA}>{OUTSIDE_INDIA}</option>
          </select>
          <select aria-label="State" className={selectCls} value={state} onChange={(e) => { setState(e.target.value); setCity('all'); }}>
            <option value="all">All states</option>
            {states.map((x) => <option key={x} value={x}>{x}</option>)}
          </select>
          <select aria-label="City" className={`${selectCls} col-span-2 md:col-span-1`} value={city} onChange={(e) => setCity(e.target.value)}>
            <option value="all">All cities</option>
            {cities.map((x) => <option key={x} value={x}>{x}</option>)}
          </select>
          {locationOn && (
            <p className="col-span-2 md:col-span-4 text-[11px] text-amber-700 bg-amber-50 rounded-lg px-3 py-2">
              {locatedSince
                ? `Location filters count only clicks with a recorded location (since ${locatedSince.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}). Older clicks have no location.`
                : 'No clicks with a location have been recorded yet. Location is recorded for new clicks once the database update has been run.'}
            </p>
          )}
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
                          MARKETPLACES.filter((m) => counts(r)[m.id]).map((m) => `${m.label} ${fmt(counts(r)[m.id])}`).join(' · '),
                        ].filter(Boolean).join(' · ')}
                      </p>
                      {top(byProduct.get(r.id) || [], 'state') && (
                        <p className="text-[10px] text-gray-500 truncate">Top states: {top(byProduct.get(r.id) || [], 'state')}</p>
                      )}
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
