import React, { useCallback, useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  MousePointerClick, LifeBuoy, Building2, FileText, RefreshCw, AlertTriangle,
  Users, MessageSquareText, Package, TrendingUp, TrendingDown, Minus,
} from 'lucide-react';
import { api } from '../../lib/api';

interface AdminOverviewProps {
  onNavigateTab: (tab: string) => void;
}

type Marketplace = 'amazon' | 'flipkart' | 'myntra' | 'ajio';
const MARKETPLACE_LABEL: Record<Marketplace, string> = {
  amazon: 'Amazon', myntra: 'Myntra', flipkart: 'Flipkart', ajio: 'Ajio',
};

const KIND_META: Record<string, { label: string; tab: string; cls: string }> = {
  ticket: { label: 'Support', tab: 'enquiries', cls: 'bg-orange-50 text-orange-700' },
  inquiry: { label: 'Corporate', tab: 'enquiries', cls: 'bg-violet-50 text-violet-700' },
  application: { label: 'Job', tab: 'applications', cls: 'bg-sky-50 text-sky-700' },
};

const fmt = (n: number) => (n || 0).toLocaleString('en-IN');

const timeAgo = (iso: string) => {
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 3600) return `${Math.max(1, Math.round(s / 60))}m ago`;
  if (s < 86400) return `${Math.round(s / 3600)}h ago`;
  if (s < 86400 * 30) return `${Math.round(s / 86400)}d ago`;
  return new Date(iso).toLocaleDateString('en-IN');
};

const Card: React.FC<{ className?: string; children: React.ReactNode }> = ({ className = '', children }) => (
  <div className={`bg-white rounded-2xl border border-gray-100 p-5 md:p-6 shadow-sm ${className}`}>{children}</div>
);

const CardTitle: React.FC<{ children: React.ReactNode; action?: React.ReactNode }> = ({ children, action }) => (
  <div className="flex items-center justify-between gap-3 mb-4">
    <h3 className="text-[11px] font-black uppercase tracking-widest text-gray-900">{children}</h3>
    {action}
  </div>
);

const LinkButton: React.FC<{ onClick: () => void; children: React.ReactNode }> = ({ onClick, children }) => (
  <button onClick={onClick} className="text-[10px] font-black uppercase tracking-widest text-priority-blue hover:underline">
    {children}
  </button>
);

export const AdminOverview: React.FC<AdminOverviewProps> = ({ onNavigateTab }) => {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setData(await api.getAdminInsights());
    } catch (e: any) {
      const msg = String(e?.message || '');
      // The website and the API deploy separately (Vercel vs Render); a 404 here means the
      // API hasn't been redeployed with the dashboard endpoint yet.
      setError(
        msg.includes('404')
          ? 'The dashboard needs the latest server update. Merge the pending pull request into master so Render redeploys the API, then refresh.'
          : msg || 'Could not load dashboard',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (!data) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
        {error ? (
          <>
            <p className="text-sm font-bold text-red-600 mb-3">{error}</p>
            <button onClick={load} className="text-[11px] font-black uppercase tracking-widest text-priority-blue">Try again</button>
          </>
        ) : (
          <p className="text-[11px] font-black uppercase tracking-widest text-gray-300">Loading dashboard…</p>
        )}
      </div>
    );
  }

  const { clicks, catalogue, leads, customers, chats7, openOrders, activity } = data;
  const delta = clicks.last7Total - clicks.prev7Total;
  const hasDatedHistory = clicks.last30Total > 0;
  const maxDaily = Math.max(1, ...clicks.daily.map((d: any) => d.clicks));
  const marketplaces = (Object.keys(MARKETPLACE_LABEL) as Marketplace[])
    .map((m) => ({ m, all: clicks.allTime[m] || 0, d30: clicks.last30[m] || 0 }))
    .sort((a, b) => b.all - a.all);
  const maxMarket = Math.max(1, ...marketplaces.map((x) => x.all));

  const kpis = [
    {
      label: 'Marketplace clicks · 7 days',
      value: fmt(clicks.last7Total),
      sub: hasDatedHistory
        ? `${delta >= 0 ? '+' : ''}${fmt(delta)} vs previous 7 days`
        : `${fmt(clicks.allTimeTotal)} all-time`,
      trend: hasDatedHistory ? Math.sign(delta) : null,
      icon: MousePointerClick, color: 'bg-priority-blue', tab: null as string | null,
    },
    {
      label: 'Open support tickets', value: fmt(leads.openTickets),
      sub: leads.openTickets ? 'waiting for a reply' : 'all caught up',
      icon: LifeBuoy, color: leads.openTickets ? 'bg-orange-500' : 'bg-gray-400', tab: 'enquiries',
    },
    {
      label: 'New corporate leads', value: fmt(leads.newInquiries),
      sub: leads.newInquiries ? 'not contacted yet' : 'none waiting',
      icon: Building2, color: leads.newInquiries ? 'bg-violet-500' : 'bg-gray-400', tab: 'enquiries',
    },
    {
      label: 'Job applications to review', value: fmt(leads.pendingApplications),
      sub: 'status: pending',
      icon: FileText, color: leads.pendingApplications ? 'bg-sky-500' : 'bg-gray-400', tab: 'applications',
    },
  ];

  return (
    <motion.div key="ov" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
          Updated {new Date(data.generatedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
        </p>
        <button
          onClick={load}
          disabled={loading}
          className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-gray-900 disabled:opacity-50"
        >
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {/* KPI tiles */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map((k) => {
          const Trend = k.trend === 1 ? TrendingUp : k.trend === -1 ? TrendingDown : Minus;
          const body = (
            <>
              <div className={`w-10 h-10 ${k.color} rounded-xl flex items-center justify-center text-white mb-4`}>
                <k.icon size={18} />
              </div>
              <p className="text-2xl font-black text-gray-900">{k.value}</p>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1">{k.label}</p>
              <p className="text-[11px] text-gray-400 font-medium mt-1 flex items-center gap-1">
                {k.trend != null && <Trend size={12} className={k.trend === 1 ? 'text-emerald-600' : k.trend === -1 ? 'text-red-500' : 'text-gray-400'} />}
                {k.sub}
              </p>
            </>
          );
          return k.tab ? (
            <button
              key={k.label}
              onClick={() => onNavigateTab(k.tab!)}
              className="text-left bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:border-gray-300 hover:shadow transition-all"
            >
              {body}
            </button>
          ) : (
            <div key={k.label} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">{body}</div>
          );
        })}
      </div>

      {/* Clicks over time + marketplace split */}
      <div className="grid lg:grid-cols-5 gap-4">
        <Card className="lg:col-span-3">
          <CardTitle>Marketplace clicks · last 14 days</CardTitle>
          {hasDatedHistory ? (
            <div className="flex items-end gap-1.5 h-40" role="img" aria-label="Daily marketplace clicks, last 14 days">
              {clicks.daily.map((d: any) => {
                const label = new Date(d.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
                return (
                  <div key={d.date} className="group relative flex-1 h-full flex flex-col justify-end items-center">
                    <span className="pointer-events-none absolute -top-1 -translate-y-full whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-[10px] font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      {label}: {fmt(d.clicks)}
                    </span>
                    <div
                      className="w-full max-w-[22px] rounded-t bg-priority-blue group-hover:bg-[#0F1417] transition-colors"
                      style={{ height: `${Math.max(d.clicks ? 4 : 1, (d.clicks / maxDaily) * 100)}%`, opacity: d.clicks ? 1 : 0.25 }}
                    />
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-40 rounded-xl bg-gray-50 flex flex-col items-center justify-center text-center px-6">
              <p className="text-[12px] font-bold text-gray-600">Daily click history starts from today.</p>
              <p className="text-[11px] text-gray-400 mt-1">
                Earlier clicks were only counted as all-time totals ({fmt(clicks.allTimeTotal)} so far). This chart fills in as new clicks arrive.
              </p>
            </div>
          )}
          {hasDatedHistory && (
            <div className="flex justify-between mt-2 text-[10px] font-bold text-gray-400">
              <span>{new Date(clicks.daily[0].date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
              <span>Today</span>
            </div>
          )}
          {clicks.fromChatbot30 > 0 && (
            <p className="mt-3 text-[11px] text-gray-500">{fmt(clicks.fromChatbot30)} of the last 30 days' clicks came from the chatbot.</p>
          )}
        </Card>

        <Card className="lg:col-span-2">
          <CardTitle>Clicks by marketplace</CardTitle>
          <div className="space-y-4">
            {marketplaces.map(({ m, all, d30 }) => (
              <div key={m}>
                <div className="flex items-baseline justify-between text-[12px] mb-1.5">
                  <span className="font-bold text-gray-800">{MARKETPLACE_LABEL[m]}</span>
                  <span className="font-black text-gray-900">
                    {fmt(all)}
                    {hasDatedHistory && <span className="ml-2 text-[10px] font-bold text-gray-400">{fmt(d30)} in 30d</span>}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                  <div className="h-full rounded-full bg-priority-blue" style={{ width: `${(all / maxMarket) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
          <p className="mt-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">All-time · {fmt(clicks.allTimeTotal)} total</p>
        </Card>
      </div>

      {/* Top products + activity */}
      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <CardTitle action={<LinkButton onClick={() => onNavigateTab('inventory')}>Products →</LinkButton>}>
            Most-clicked products
          </CardTitle>
          {clicks.topAllTime.length === 0 ? (
            <p className="text-[11px] text-gray-400 py-6 text-center">No clicks yet.</p>
          ) : (
            <ol className="space-y-1">
              {clicks.topAllTime.map((p: any, i: number) => (
                <li key={p.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                  <span className="w-5 text-[11px] font-black text-gray-300">{i + 1}</span>
                  <img src={p.image || ''} alt="" className="w-9 h-9 object-contain rounded bg-gray-50 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-bold text-gray-900 truncate">{p.name}</p>
                    <p className="text-[10px] text-gray-400">
                      {(Object.keys(p.byMarketplace) as Marketplace[])
                        .filter((m) => p.byMarketplace[m])
                        .map((m) => `${MARKETPLACE_LABEL[m]} ${p.byMarketplace[m]}`)
                        .join(' · ')}
                    </p>
                  </div>
                  <span className="text-[13px] font-black text-gray-900">{fmt(p.clicks)}</span>
                </li>
              ))}
            </ol>
          )}
        </Card>

        <Card>
          <CardTitle action={<LinkButton onClick={() => onNavigateTab('enquiries')}>Enquiries →</LinkButton>}>
            Recent activity
          </CardTitle>
          {activity.length === 0 ? (
            <p className="text-[11px] text-gray-400 py-6 text-center">Nothing new yet.</p>
          ) : (
            <ul className="space-y-1">
              {activity.map((a: any) => {
                const meta = KIND_META[a.kind];
                return (
                  <li key={`${a.kind}-${a.id}`}>
                    <button
                      onClick={() => onNavigateTab(meta.tab)}
                      className="w-full flex items-center gap-3 py-2 border-b border-gray-50 text-left hover:bg-gray-50 rounded-lg px-1"
                    >
                      <span className={`shrink-0 text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded ${meta.cls}`}>{meta.label}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-bold text-gray-900 truncate">{a.title}</p>
                        <p className="text-[10px] text-gray-400 truncate">{a.detail} · {String(a.status).replace(/_/g, ' ')}</p>
                      </div>
                      <span className="shrink-0 text-[10px] font-bold text-gray-400">{timeAgo(a.at)}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>

      {/* Catalogue & audience */}
      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { icon: Package, label: 'Live products', value: fmt(catalogue.active), sub: `${fmt(catalogue.total)} in catalogue` },
          {
            icon: AlertTriangle, label: 'Never clicked', value: fmt(catalogue.neverClicked),
            sub: 'live products with no marketplace clicks yet',
          },
          { icon: Users, label: 'Registered customers', value: fmt(customers.total), sub: `${fmt(customers.new30)} joined in the last 30 days` },
          { icon: MessageSquareText, label: 'Chatbot conversations', value: fmt(chats7), sub: 'in the last 7 days', tab: 'chat-logs' },
        ].map((s: any) => (
          <button
            key={s.label}
            onClick={s.tab ? () => onNavigateTab(s.tab) : undefined}
            className={`text-left bg-white rounded-2xl border border-gray-100 p-5 shadow-sm ${s.tab ? 'hover:border-gray-300' : 'cursor-default'}`}
          >
            <div className="flex items-center gap-2 text-gray-400 mb-2">
              <s.icon size={14} />
              <span className="text-[10px] font-black uppercase tracking-widest">{s.label}</span>
            </div>
            <p className="text-xl font-black text-gray-900">{s.value}</p>
            <p className="text-[11px] text-gray-400 mt-0.5">{s.sub}</p>
          </button>
        ))}
      </div>

      {/* Only shown when something needs doing */}
      {(catalogue.withoutLinks > 0 || catalogue.lowStock.length > 0 || openOrders > 0) && (
        <Card className="border-red-100 bg-red-50/40">
          <CardTitle>Needs attention</CardTitle>
          <ul className="space-y-2 text-[12px] text-gray-700">
            {catalogue.withoutLinks > 0 && (
              <li>
                <strong>{fmt(catalogue.withoutLinks)}</strong> live product{catalogue.withoutLinks > 1 ? 's have' : ' has'} no marketplace link, so customers see "Coming soon".{' '}
                <LinkButton onClick={() => onNavigateTab('inventory')}>Fix →</LinkButton>
              </li>
            )}
            {catalogue.lowStock.length > 0 && (
              <li>
                <strong>{fmt(catalogue.lowStock.length)}</strong> product{catalogue.lowStock.length > 1 ? 's are' : ' is'} low on stock:{' '}
                {catalogue.lowStock.slice(0, 5).map((p: any) => `${p.name} (${p.stock})`).join(', ')}
                {catalogue.lowStock.length > 5 ? '…' : ''}
              </li>
            )}
            {openOrders > 0 && (
              <li>
                <strong>{fmt(openOrders)}</strong> website order{openOrders > 1 ? 's' : ''} waiting to be processed.{' '}
                <LinkButton onClick={() => onNavigateTab('orders')}>Open orders →</LinkButton>
              </li>
            )}
          </ul>
        </Card>
      )}
    </motion.div>
  );
};
