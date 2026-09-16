import React from 'react';
import { motion } from 'motion/react';
import { Truck, Check, X, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { CloudinaryUpload } from '../CloudinaryUpload';

const ORDERS_PER_PAGE = 20;

const ORDER_NEXT: Record<string, { label: string; status: string; needsInvoice?: boolean }> = {
  pending:          { label: 'Confirm Order',    status: 'confirmed' },
  confirmed:        { label: 'Mark Processing',  status: 'processing' },
  processing:       { label: 'Mark as Shipped',  status: 'shipped', needsInvoice: true },
  shipped:          { label: 'Mark Delivered',   status: 'delivered' },
  return_requested: { label: 'Approve Return',   status: 'returned' },
};

const ORDER_STATUS_COLOR: Record<string, string> = {
  pending:          'bg-yellow-100 text-yellow-700',
  confirmed:        'bg-blue-100 text-blue-700',
  processing:       'bg-purple-100 text-purple-700',
  shipped:          'bg-indigo-100 text-indigo-700',
  delivered:        'bg-green-100 text-green-700',
  cancelled:        'bg-red-100 text-red-600',
  return_requested: 'bg-orange-100 text-orange-700',
  returned:         'bg-gray-100 text-gray-600',
};

const Pagination = ({ page, total, onPage }: { page: number; total: number; onPage: (p: number) => void }) => {
  if (total <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-3 pt-4">
      <button
        disabled={page === 1}
        onClick={() => onPage(page - 1)}
        className="p-2 rounded-xl bg-white border border-gray-200 disabled:opacity-30 hover:border-priority-blue transition-all"
      >
        <ChevronLeft size={14} />
      </button>
      <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
        Page {page} of {total}
      </span>
      <button
        disabled={page === total}
        onClick={() => onPage(page + 1)}
        className="p-2 rounded-xl bg-white border border-gray-200 disabled:opacity-30 hover:border-priority-blue transition-all"
      >
        <ChevronRight size={14} />
      </button>
    </div>
  );
};

interface AdminOrdersProps {
  orders: any[];
  orderStatusFilter: string;
  setOrderStatusFilter: (s: string) => void;
  ordersPage: number;
  setOrdersPage: (p: number | ((prev: number) => number)) => void;
  selectedOrderIds: Set<string>;
  setSelectedOrderIds: React.Dispatch<React.SetStateAction<Set<string>>>;
  bulkStatus: string;
  setBulkStatus: (s: string) => void;
  bulkUpdating: boolean;
  handleBulkStatusUpdate: () => Promise<void>;
  selectedOrder: any;
  setSelectedOrder: (o: any) => void;
  updateStatus: (orderId: string, status: string, invoiceUrl?: string) => Promise<void>;
  printLabel: (order: any) => void;
}

export const AdminOrders: React.FC<AdminOrdersProps> = ({
  orders,
  orderStatusFilter,
  setOrderStatusFilter,
  ordersPage,
  setOrdersPage,
  selectedOrderIds,
  setSelectedOrderIds,
  bulkStatus,
  setBulkStatus,
  bulkUpdating,
  handleBulkStatusUpdate,
  selectedOrder,
  setSelectedOrder,
  updateStatus,
  printLabel,
}) => {
  const filteredOrders = orderStatusFilter === 'all' ? orders : orders.filter(o => o.status === orderStatusFilter);
  const totalOrderPages = Math.ceil(filteredOrders.length / ORDERS_PER_PAGE);
  const paginatedOrders = filteredOrders.slice((ordersPage - 1) * ORDERS_PER_PAGE, ordersPage * ORDERS_PER_PAGE);
  const allPageSelected = paginatedOrders.length > 0 && paginatedOrders.every(o => selectedOrderIds.has(o.id));

  return (
    <motion.div key="ord" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex justify-between items-center bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h2 className="text-sm font-black text-gray-900 uppercase">Manage Orders</h2>
          <p className="text-[10px] font-bold text-gray-400 uppercase mt-0.5">{filteredOrders.length} of {orders.length} Orders</p>
        </div>
      </div>

      {/* Status filter tabs */}
      <div className="flex overflow-x-auto gap-2 pb-1">
        {['all', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'return_requested', 'cancelled', 'returned'].map(status => (
          <button
            key={status}
            onClick={() => { setOrderStatusFilter(status); setOrdersPage(1); setSelectedOrderIds(new Set()); }}
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider shrink-0 transition-all ${
              orderStatusFilter === status
                ? 'bg-priority-blue text-white shadow-md'
                : 'bg-white border border-gray-200 text-gray-500 hover:border-gray-300'
            }`}
          >
            {status === 'all' ? `All (${orders.length})` : `${status.replace(/_/g, ' ')} (${orders.filter(o => o.status === status).length})`}
          </button>
        ))}
      </div>

      {/* Bulk action bar */}
      {selectedOrderIds.size > 0 && (
        <div className="sticky top-4 z-10 bg-priority-blue text-white rounded-2xl p-4 flex flex-wrap items-center gap-3 shadow-xl">
          <span className="text-[11px] font-black">{selectedOrderIds.size} order{selectedOrderIds.size > 1 ? 's' : ''} selected</span>
          <select
            value={bulkStatus}
            onChange={e => setBulkStatus(e.target.value)}
            className="bg-white/20 text-white rounded-xl px-3 py-2 text-[10px] font-black outline-none border border-white/30"
          >
            <option value="">Set status…</option>
            <option value="confirmed">Confirmed</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <button
            onClick={handleBulkStatusUpdate}
            disabled={!bulkStatus || bulkUpdating}
            className="px-4 py-2 bg-white text-priority-blue rounded-xl text-[10px] font-black disabled:opacity-50 flex items-center gap-2"
          >
            {bulkUpdating ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
            Apply
          </button>
          <button onClick={() => setSelectedOrderIds(new Set())} className="ml-auto p-1.5 bg-white/20 rounded-lg hover:bg-white/30 transition-colors">
            <X size={14} />
          </button>
        </div>
      )}

      <div className="space-y-4">
        {/* Select all row */}
        {paginatedOrders.length > 0 && (
          <label className="flex items-center gap-2 px-2 cursor-pointer w-fit">
            <input
              type="checkbox"
              checked={allPageSelected}
              onChange={e => {
                const next = new Set(selectedOrderIds);
                paginatedOrders.forEach(o => e.target.checked ? next.add(o.id) : next.delete(o.id));
                setSelectedOrderIds(next);
              }}
              className="w-4 h-4 rounded accent-priority-blue"
            />
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              {allPageSelected ? 'Deselect page' : 'Select page'}
            </span>
          </label>
        )}

        {paginatedOrders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-16 text-center">
            <Truck size={32} className="mx-auto text-gray-200 mb-3" />
            <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">No orders with this status</p>
          </div>
        ) : paginatedOrders.map(order => (
          <div key={order.id} className={`bg-white p-6 rounded-2xl border transition-all ${selectedOrderIds.has(order.id) ? 'border-priority-blue ring-1 ring-priority-blue/20' : 'border-gray-200 hover:border-priority-blue'}`}>
            <div className="flex flex-col md:flex-row justify-between gap-6 mb-6">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={selectedOrderIds.has(order.id)}
                  onChange={e => {
                    const next = new Set(selectedOrderIds);
                    e.target.checked ? next.add(order.id) : next.delete(order.id);
                    setSelectedOrderIds(next);
                  }}
                  className="mt-1 w-4 h-4 rounded accent-priority-blue shrink-0"
                />
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-[11px] font-black text-gray-900">#ORD-{order.id.slice(0, 8).toUpperCase()}</span>
                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${ORDER_STATUS_COLOR[order.status] ?? 'bg-gray-100 text-gray-600'}`}>
                      {order.status}
                    </span>
                  </div>
                  <p className="text-sm font-black text-gray-900 mb-0.5">{order.shipping_name}</p>
                  <p className="text-[11px] font-bold text-gray-500">{order.shipping_phone} | {new Date(order.created_at).toLocaleDateString()}</p>
                  {order.return_reason && (
                    <p className="text-[10px] font-bold text-orange-600 mt-1 max-w-xs">Return: {order.return_reason}</p>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-black text-gray-900">₹ {order.total}</p>
                <p className="text-[10px] font-black text-priority-blue uppercase tracking-widest">{order.payment_method}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button onClick={() => printLabel(order)} className="px-4 py-2 bg-gray-900 text-white rounded-lg text-[10px] font-black uppercase flex items-center gap-2">
                <Truck size={14} /> Print Label
              </button>
              {ORDER_NEXT[order.status] && (
                ORDER_NEXT[order.status].needsInvoice ? (
                  <button onClick={() => setSelectedOrder(order)} className="px-4 py-2 bg-priority-blue text-white rounded-lg text-[10px] font-black uppercase flex items-center gap-2">
                    <Check size={14} /> {ORDER_NEXT[order.status].label}
                  </button>
                ) : (
                  <button onClick={() => updateStatus(order.id, ORDER_NEXT[order.status].status)} className="px-4 py-2 bg-priority-blue text-white rounded-lg text-[10px] font-black uppercase flex items-center gap-2">
                    <Check size={14} /> {ORDER_NEXT[order.status].label}
                  </button>
                )
              )}
            </div>

            {/* Expandable Section for Items */}
            <div className="mt-6 pt-4 border-t border-gray-100">
              <div className="flex gap-4 overflow-x-auto pb-2">
                {order.order_items?.map((item: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-3 min-w-[200px] bg-gray-50 p-2 rounded-xl">
                    <img src={item.image} className="w-10 h-10 object-contain" />
                    <div>
                      <p className="text-[10px] font-black text-gray-900 truncate w-32">{item.name}</p>
                      <p className="text-[8px] font-bold text-gray-400">QTY: {item.quantity} | ₹ {item.price}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <Pagination page={ordersPage} total={totalOrderPages} onPage={p => { setOrdersPage(p); setSelectedOrderIds(new Set()); }} />

      {/* Shipping Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-4 sm:p-8 max-w-lg w-full shadow-2xl">
            <h2 className="text-xl font-black text-gray-900 mb-2 uppercase italic tracking-tighter">Prepare Shipping</h2>
            <p className="text-xs font-bold text-gray-500 mb-8 uppercase tracking-widest underline decoration-priority-blue decoration-2">Order #ORD-{selectedOrder.id.slice(0, 8).toUpperCase()}</p>

            <div className="space-y-6">
              <CloudinaryUpload
                label="Attach Manual Invoice (PDF/Image)"
                value={selectedOrder.invoice_url || ''}
                onChange={(url) => setSelectedOrder({ ...selectedOrder, invoice_url: url })}
              />

              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                <p className="text-[10px] font-black text-blue-800 uppercase leading-snug">
                  Note: Changing status to "Shipped" will automatically email the customer with their tracking info and attached invoice.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => updateStatus(selectedOrder.id, 'shipped', selectedOrder.invoice_url)}
                  className="flex-1 py-4 bg-priority-blue text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-priority-blue/30"
                >
                  Confirm & Ship
                </button>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="px-8 py-4 bg-gray-100 text-gray-500 rounded-xl text-xs font-black uppercase tracking-widest"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};
