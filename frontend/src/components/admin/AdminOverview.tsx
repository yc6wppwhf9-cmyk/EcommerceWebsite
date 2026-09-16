import React from 'react';
import { motion } from 'motion/react';
import { ShoppingBag, TrendingUp, Truck, AlertTriangle } from 'lucide-react';
import { Product } from '../../types';

interface AdminOverviewProps {
  orders: any[];
  products: Product[];
  onNavigateTab: (tab: string) => void;
}

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

export const AdminOverview: React.FC<AdminOverviewProps> = ({ orders, products, onNavigateTab }) => {
  const today = new Date();
  const todayOrders = orders.filter(o => new Date(o.created_at).toDateString() === today.toDateString());
  const todayRevenue = todayOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  const pendingActionCount = orders.filter(o => o.status === 'pending' || o.status === 'confirmed' || o.status === 'processing').length;
  const lowStockProducts = products.filter(p => (p.stock ?? 0) <= 5);

  return (
    <motion.div key="ov" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Today's Orders", value: todayOrders.length, icon: ShoppingBag, color: 'bg-priority-blue', sub: 'placed today' },
          { label: "Today's Revenue", value: `₹${todayRevenue.toLocaleString('en-IN')}`, icon: TrendingUp, color: 'bg-emerald-500', sub: 'from today\'s orders' },
          { label: 'Pending Actions', value: pendingActionCount, icon: Truck, color: 'bg-orange-500', sub: 'orders need attention' },
          { label: 'Low Stock Items', value: lowStockProducts.length, icon: AlertTriangle, color: lowStockProducts.length > 0 ? 'bg-red-500' : 'bg-gray-400', sub: 'items running low' },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className={`w-10 h-10 ${stat.color} rounded-xl flex items-center justify-center text-white mb-4`}>
              <stat.icon size={18} />
            </div>
            <p className="text-2xl font-black text-gray-900">{stat.value}</p>
            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1">{stat.label}</p>
            <p className="text-[9px] text-gray-300 font-bold uppercase mt-0.5">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Low stock alert */}
      {lowStockProducts.length > 0 && (
        <div className="bg-red-50 rounded-2xl border border-red-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} className="text-red-500" />
              <h3 className="text-[11px] font-black uppercase tracking-widest text-red-700">
                Low Stock — {lowStockProducts.length} item{lowStockProducts.length > 1 ? 's' : ''} need restocking
              </h3>
            </div>
            <button
              onClick={() => onNavigateTab('inventory')}
              className="text-[9px] font-black uppercase tracking-widest text-red-400 hover:text-red-600 underline decoration-dotted"
            >
              Manage all →
            </button>
          </div>
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {lowStockProducts.map(p => (
              <div key={p.id} className="flex items-center justify-between bg-white rounded-xl px-4 py-3 border border-red-50">
                <div className="flex items-center gap-3 min-w-0">
                  <img src={(p as any).image || (p.images?.[0]) || ''} className="w-8 h-8 object-contain shrink-0" />
                  <span className="text-[11px] font-black text-gray-800 truncate">{p.name}</span>
                </div>
                <span className={`ml-3 shrink-0 text-[10px] font-black px-2.5 py-1 rounded-full ${p.stock === 0 ? 'bg-red-500 text-white' : 'bg-orange-100 text-orange-700'}`}>
                  {p.stock === 0 ? 'Out of Stock' : `${p.stock} left`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent orders */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <h3 className="text-[11px] font-black uppercase tracking-widest text-gray-900 mb-5">Recent Orders</h3>
        {orders.length === 0 ? (
          <p className="text-[10px] text-gray-300 font-bold uppercase tracking-widest text-center py-8">No orders yet</p>
        ) : (
          <div className="space-y-0">
            {orders.slice(0, 6).map(order => (
              <div key={order.id} className="flex items-center justify-between gap-4 py-3.5 border-b border-gray-50 last:border-0">
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-black text-gray-900 truncate">{order.shipping_name}</p>
                  <p className="text-[9px] font-bold text-gray-400 uppercase mt-0.5">#ORD-{order.id.slice(0, 8).toUpperCase()} · {new Date(order.created_at).toLocaleDateString('en-IN')}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[12px] font-black text-gray-900">₹{Number(order.total).toLocaleString('en-IN')}</p>
                  <span className={`text-[8px] font-black px-2 py-0.5 rounded uppercase ${ORDER_STATUS_COLOR[order.status] ?? 'bg-gray-100 text-gray-600'}`}>{order.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};
