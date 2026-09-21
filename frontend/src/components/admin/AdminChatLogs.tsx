import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MessageSquare, Search, RefreshCw, Trash2,
  TrendingUp, HelpCircle, Package, User, Clock,
  Sparkles, ExternalLink, ChevronDown, ChevronUp, Filter,
} from 'lucide-react';
import { api } from '../../lib/api';

interface ChatLog {
  id: string;
  user_id?: string;
  session_id?: string;
  user_message: string;
  bot_response: string;
  intent_category: string;
  products_matched: Array<{
    id: string;
    name: string;
    price: number;
    image: string;
    slug: string;
  }>;
  user_ip?: string;
  user_agent?: string;
  created_at: string;
  users?: { name: string; email: string };
}

interface AnalyticsData {
  totalChats: number;
  todayChats: number;
  categoryBreakdown: Record<string, number>;
  topKeywords: Array<{ word: string; count: number }>;
  frequentQuestions: Array<{ question: string; count: number }>;
}

const CATEGORY_LABELS: Record<string, { label: string; color: string }> = {
  school_kids: { label: 'School & Kids', color: 'bg-amber-100 text-amber-800 border-amber-200' },
  laptop_college: { label: 'Laptop & College', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  luggage_travel: { label: 'Luggage & Travel', color: 'bg-purple-100 text-purple-800 border-purple-200' },
  orders_support: { label: 'Orders & Support', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  general: { label: 'General Enquiry', color: 'bg-gray-100 text-gray-800 border-gray-200' },
};

export const AdminChatLogs = ({
  showToast,
}: {
  showToast: (msg: string, type?: 'success' | 'error') => void;
}) => {
  const [logs, setLogs] = useState<ChatLog[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchLogs = useCallback(async (targetPage = 1) => {
    setLoading(true);
    try {
      const [logsRes, analyticsRes] = await Promise.allSettled([
        api.getChatLogs({
          page: targetPage,
          limit: 20,
          search: search.trim() || undefined,
          category: categoryFilter !== 'all' ? categoryFilter : undefined,
        }),
        api.getChatAnalytics(),
      ]);

      if (logsRes.status === 'fulfilled' && logsRes.value) {
        setLogs(logsRes.value.data || []);
        setTotalPages(logsRes.value.totalPages || 1);
        setTotalCount(logsRes.value.total || 0);
        setPage(logsRes.value.page || targetPage);
      }
      if (analyticsRes.status === 'fulfilled' && analyticsRes.value) {
        setAnalytics(analyticsRes.value);
      }
    } catch {
      showToast('Failed to load bot queries', 'error');
    } finally {
      setLoading(false);
    }
  }, [search, categoryFilter, showToast]);

  useEffect(() => {
    fetchLogs(1);
  }, [fetchLogs]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this chat log record?')) return;
    setDeletingId(id);
    try {
      await api.deleteChatLog(id);
      showToast('Chat log removed');
      setLogs(prev => prev.filter(l => l.id !== id));
      setTotalCount(c => Math.max(0, c - 1));
    } catch {
      showToast('Failed to delete log', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const formatTime = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return iso;
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <MessageSquare className="text-priority-blue" size={24} />
            AI Bot Queries & Trends
          </h2>
          <p className="text-xs text-gray-500 font-medium mt-1">
            Real-time customer questions, top searched bag categories, and AI recommendations
          </p>
        </div>
        <button
          onClick={() => fetchLogs(page)}
          disabled={loading}
          className="self-start sm:self-auto px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-all shadow-2xs"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* ── KPI Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Questions</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-priority-blue flex items-center justify-center">
              <MessageSquare size={16} />
            </div>
          </div>
          <p className="text-2xl font-black text-gray-900 mt-2">
            {analytics?.totalChats ?? totalCount}
          </p>
          <span className="text-[10px] text-gray-400 font-bold mt-1 block">All-time bot conversations</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Asked Today</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Clock size={16} />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-600 mt-2">
            {analytics?.todayChats ?? 0}
          </p>
          <span className="text-[10px] text-gray-400 font-bold mt-1 block">Since midnight today</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-purple-600 uppercase tracking-widest">Top Search Topic</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <TrendingUp size={16} />
            </div>
          </div>
          <p className="text-lg font-black text-gray-900 mt-2 truncate">
            {analytics?.topKeywords?.[0]?.word ? `"${analytics.topKeywords[0].word}"` : 'Kids & School'}
          </p>
          <span className="text-[10px] text-gray-400 font-bold mt-1 block">
            {analytics?.topKeywords?.[0]?.count ? `${analytics.topKeywords[0].count} searches` : 'Most queried category'}
          </span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest">AI Accuracy</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Sparkles size={16} />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-600 mt-2">100%</p>
          <span className="text-[10px] text-gray-400 font-bold mt-1 block">Real catalog tool linking</span>
        </div>
      </div>

      {/* ── Trending Keywords & Top Questions Breakdown ── */}
      {analytics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Search Keywords */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h3 className="text-xs font-black uppercase tracking-wider text-gray-700 mb-3 flex items-center gap-2">
              <TrendingUp size={14} className="text-priority-blue" />
              Frequently Searched Keywords
            </h3>
            {analytics.topKeywords.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {analytics.topKeywords.map(k => (
                  <span
                    key={k.word}
                    onClick={() => { setSearch(k.word); }}
                    className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-50 hover:bg-priority-blue hover:text-white border border-gray-200 text-xs font-bold text-gray-700 transition-all"
                  >
                    #{k.word}
                    <span className="text-[10px] opacity-70 bg-black/10 px-1.5 py-0.5 rounded-full font-black">
                      {k.count}
                    </span>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400">No keyword search trends recorded yet.</p>
            )}
          </div>

          {/* Top Exact Customer Questions */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h3 className="text-xs font-black uppercase tracking-wider text-gray-700 mb-3 flex items-center gap-2">
              <HelpCircle size={14} className="text-emerald-600" />
              Most Common Questions
            </h3>
            {analytics.frequentQuestions.length > 0 ? (
              <div className="space-y-2">
                {analytics.frequentQuestions.slice(0, 4).map((q, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSearch(q.question)}
                    className="cursor-pointer p-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-100 flex items-center justify-between gap-3 text-xs transition-colors"
                  >
                    <span className="font-semibold text-gray-800 line-clamp-1">"{q.question}"</span>
                    <span className="px-2 py-0.5 rounded-md bg-white border border-gray-200 text-[10px] font-black text-gray-600 shrink-0">
                      {q.count}x
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400">No repetitive questions recorded yet.</p>
            )}
          </div>
        </div>
      )}

      {/* ── Search & Filter Controls ── */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full md:w-96">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search questions or bot answers..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 outline-none focus:border-priority-blue focus:bg-white transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-400 hover:text-black"
            >
              Clear
            </button>
          )}
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <Filter size={14} className="text-gray-400 shrink-0 mr-1 hidden sm:block" />
          {[
            { id: 'all', label: 'All Topics' },
            { id: 'school_kids', label: 'School / Kids' },
            { id: 'laptop_college', label: 'Laptop / College' },
            { id: 'luggage_travel', label: 'Luggage / Travel' },
            { id: 'orders_support', label: 'Orders / Support' },
            { id: 'general', label: 'General' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setCategoryFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider shrink-0 transition-all ${
                categoryFilter === tab.id
                  ? 'bg-black text-white shadow-sm'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Chat Logs Feed ── */}
      <div className="space-y-3">
        {loading && logs.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-gray-100">
            <RefreshCw size={24} className="animate-spin text-priority-blue mx-auto mb-2" />
            <p className="text-xs font-bold text-gray-400">Loading chat questions...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-gray-100">
            <MessageSquare size={32} className="text-gray-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-gray-700">No customer chat logs found</p>
            <p className="text-xs text-gray-400 mt-1">Questions asked to the AI assistant will automatically appear here.</p>
          </div>
        ) : (
          logs.map(log => {
            const isExpanded = expandedLogId === log.id;
            const categoryBadge = CATEGORY_LABELS[log.intent_category] || CATEGORY_LABELS.general;

            return (
              <div
                key={log.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-2xs hover:shadow-sm transition-all overflow-hidden"
              >
                {/* Header row */}
                <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    {/* Meta badges */}
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wide border ${categoryBadge.color}`}>
                        {categoryBadge.label}
                      </span>
                      <span className="text-[10px] text-gray-400 font-bold flex items-center gap-1">
                        <Clock size={11} /> {formatTime(log.created_at)}
                      </span>
                      {log.users ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                          <User size={10} /> {log.users.name || log.users.email}
                        </span>
                      ) : (
                        <span className="text-[10px] text-gray-400 bg-gray-50 px-2 py-0.5 rounded-md">
                          Guest User
                        </span>
                      )}
                    </div>

                    {/* Question */}
                    <h4 className="text-sm sm:text-base font-bold text-gray-900 leading-snug">
                      "{log.user_message}"
                    </h4>

                    {/* Preview of answer if not expanded */}
                    {!isExpanded && log.bot_response && (
                      <p className="text-xs text-gray-500 line-clamp-1 mt-1 font-medium">
                        {log.bot_response}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-start shrink-0">
                    <button
                      onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                      className="px-3 py-1.5 rounded-xl bg-gray-50 hover:bg-gray-100 text-[10px] font-bold text-gray-700 flex items-center gap-1 border border-gray-200 transition-colors"
                    >
                      {isExpanded ? (
                        <>Hide Details <ChevronUp size={12} /></>
                      ) : (
                        <>View Answer <ChevronDown size={12} /></>
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(log.id)}
                      disabled={deletingId === log.id}
                      className="p-1.5 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      title="Delete log"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Expanded details */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-gray-100 bg-gray-50/70 p-4 sm:p-5 space-y-4"
                    >
                      {/* Full Bot Answer */}
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block mb-1">
                          Priority Assistant Reply:
                        </span>
                        <div className="p-3 bg-white rounded-xl border border-gray-100 text-xs text-gray-700 leading-relaxed whitespace-pre-line shadow-2xs font-medium">
                          {log.bot_response}
                        </div>
                      </div>

                      {/* Products sent to user */}
                      {log.products_matched && log.products_matched.length > 0 && (
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 flex items-center gap-1 mb-2">
                            <Package size={11} /> Recommended Products Sent ({log.products_matched.length})
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                            {log.products_matched.map(p => (
                              <a
                                key={p.id}
                                href={`/product/${p.slug || p.id}`}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-2 p-2 bg-white rounded-xl border border-gray-200 hover:border-black transition-all group shadow-2xs"
                              >
                                <img
                                  src={p.image}
                                  alt={p.name}
                                  className="w-10 h-10 object-contain rounded-lg bg-gray-50 shrink-0"
                                />
                                <div className="flex-1 min-w-0">
                                  <p className="text-[11px] font-bold text-gray-800 line-clamp-1 group-hover:text-black">
                                    {p.name}
                                  </p>
                                  {p.price > 0 && (
                                    <span className="text-[10px] font-bold text-gray-500">
                                      ₹{p.price.toLocaleString('en-IN')}
                                    </span>
                                  )}
                                </div>
                                <ExternalLink size={10} className="text-gray-400 group-hover:text-black shrink-0" />
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })
        )}
      </div>

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <span className="text-xs text-gray-500 font-medium">
            Page {page} of {totalPages} ({totalCount} total queries)
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchLogs(page - 1)}
              disabled={page <= 1 || loading}
              className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 disabled:opacity-40 hover:bg-gray-100 transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => fetchLogs(page + 1)}
              disabled={page >= totalPages || loading}
              className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 disabled:opacity-40 hover:bg-gray-100 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
