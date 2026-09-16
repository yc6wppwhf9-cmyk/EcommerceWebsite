import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, X, Check, Tag, ToggleLeft, ToggleRight, Loader2 } from 'lucide-react';

interface AdminCouponsProps {
  coupons: any[];
  couponLoading: boolean;
  isAddingCoupon: boolean;
  setIsAddingCoupon: (v: boolean) => void;
  couponForm: {
    code: string;
    discount_type: 'percentage' | 'fixed';
    discount_value: string;
    max_uses: string;
    min_cart_value: string;
    start_date: string;
    end_date: string;
  };
  setCouponForm: React.Dispatch<React.SetStateAction<{
    code: string;
    discount_type: 'percentage' | 'fixed';
    discount_value: string;
    max_uses: string;
    min_cart_value: string;
    start_date: string;
    end_date: string;
  }>>;
  handleCreateCoupon: (e: React.FormEvent) => Promise<void>;
  handleToggleCoupon: (id: string, is_active: boolean) => Promise<void>;
}

export const AdminCoupons: React.FC<AdminCouponsProps> = ({
  coupons,
  couponLoading,
  isAddingCoupon,
  setIsAddingCoupon,
  couponForm,
  setCouponForm,
  handleCreateCoupon,
  handleToggleCoupon,
}) => {
  return (
    <motion.div key="coupons" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black uppercase tracking-tighter">Coupons & Offers</h2>
        <button
          onClick={() => setIsAddingCoupon(true)}
          className="flex items-center gap-2 px-5 py-3 bg-black text-white text-[11px] font-black uppercase tracking-widest rounded-xl hover:bg-gray-800 transition-colors"
        >
          <Plus size={14} /> New Coupon
        </button>
      </div>

      {/* Create Coupon Form */}
      <AnimatePresence>
        {isAddingCoupon && (
          <motion.form
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onSubmit={handleCreateCoupon}
            className="bg-white border border-gray-100 rounded-[2rem] p-8 shadow-sm space-y-6"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black uppercase tracking-tight">Create New Coupon</h3>
              <button type="button" onClick={() => setIsAddingCoupon(false)}>
                <X size={18} className="text-gray-400 hover:text-black" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest mb-1.5 text-gray-500">Coupon Code *</label>
                <input
                  required
                  value={couponForm.code}
                  onChange={e => setCouponForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                  placeholder="e.g. LAUNCH20"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-black/10"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest mb-1.5 text-gray-500">Discount Type *</label>
                <select
                  value={couponForm.discount_type}
                  onChange={e => setCouponForm(f => ({ ...f, discount_type: e.target.value as 'percentage' | 'fixed' }))}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-black/10"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount (₹)</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest mb-1.5 text-gray-500">
                  {couponForm.discount_type === 'percentage' ? 'Discount %' : 'Discount ₹'} *
                </label>
                <input
                  required type="number" min="1"
                  value={couponForm.discount_value}
                  onChange={e => setCouponForm(f => ({ ...f, discount_value: e.target.value }))}
                  placeholder={couponForm.discount_type === 'percentage' ? '20' : '100'}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-black/10"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest mb-1.5 text-gray-500">Max Uses (optional)</label>
                <input
                  type="number" min="1"
                  value={couponForm.max_uses}
                  onChange={e => setCouponForm(f => ({ ...f, max_uses: e.target.value }))}
                  placeholder="Unlimited"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-black/10"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest mb-1.5 text-gray-500">Min Cart Value ₹ (optional)</label>
                <input
                  type="number" min="0"
                  value={couponForm.min_cart_value}
                  onChange={e => setCouponForm(f => ({ ...f, min_cart_value: e.target.value }))}
                  placeholder="No minimum"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-black/10"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest mb-1.5 text-gray-500">Start Date (optional)</label>
                <input
                  type="datetime-local"
                  value={couponForm.start_date}
                  onChange={e => setCouponForm(f => ({ ...f, start_date: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-black/10"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest mb-1.5 text-gray-500">End Date (optional)</label>
                <input
                  type="datetime-local"
                  value={couponForm.end_date}
                  onChange={e => setCouponForm(f => ({ ...f, end_date: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-black/10"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full py-4 bg-black text-white text-[11px] font-black uppercase tracking-widest rounded-xl hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
            >
              <Check size={14} /> Create Coupon
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Coupons List */}
      {couponLoading ? (
        <div className="flex justify-center py-16"><Loader2 size={28} className="animate-spin text-gray-400" /></div>
      ) : coupons.length === 0 ? (
        <div className="bg-white rounded-[2rem] border border-gray-100 p-12 text-center">
          <Tag size={32} className="text-gray-300 mx-auto mb-3" />
          <p className="text-[11px] font-black uppercase tracking-widest text-gray-400">No coupons yet. Create your first offer!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {coupons.map((c: any) => (
            <div key={c.id} className="bg-white border border-gray-100 rounded-2xl px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${c.is_active ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                  <Tag size={18} />
                </div>
                <div>
                  <p className="text-sm font-black uppercase tracking-widest text-gray-900">{c.code}</p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">
                    {c.discount_type === 'percentage' ? `${c.discount_value}% off` : `₹${c.discount_value} off`}
                    {c.min_cart_value ? ` · Min ₹${c.min_cart_value}` : ''}
                    {c.max_uses ? ` · ${c.used_count}/${c.max_uses} used` : ` · ${c.used_count} used`}
                    {c.end_date ? ` · Expires ${new Date(c.end_date).toLocaleDateString('en-IN')}` : ''}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleToggleCoupon(c.id, c.is_active)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors ${c.is_active ? 'bg-green-50 text-green-700 hover:bg-red-50 hover:text-red-600' : 'bg-gray-100 text-gray-500 hover:bg-green-50 hover:text-green-600'}`}
              >
                {c.is_active ? <><ToggleRight size={16} /> Active</> : <><ToggleLeft size={16} /> Inactive</>}
              </button>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};
