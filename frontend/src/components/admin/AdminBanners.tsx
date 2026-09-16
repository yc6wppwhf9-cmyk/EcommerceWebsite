import React from 'react';
import { motion } from 'motion/react';
import { Image as ImageIcon, Check, Loader2 } from 'lucide-react';

const BANNER_OPTIONS = [
  { value: 'luggage', label: 'Luggage', url: '/luggage?theme=premium' },
  { value: 'backpacks', label: 'Backpack', url: '/backpacks?theme=premium' },
  { value: 'duffle', label: 'Duffle', url: '/duffle?theme=premium' },
];

interface AdminBannersProps {
  editorialBanner: { category: string; label: string; url: string };
  setEditorialBanner: React.Dispatch<React.SetStateAction<{ category: string; label: string; url: string }>>;
  saveEditorialBanner: () => Promise<void>;
  bannerSaving: boolean;
}

export const AdminBanners: React.FC<AdminBannersProps> = ({
  editorialBanner,
  setEditorialBanner,
  saveEditorialBanner,
  bannerSaving,
}) => {
  const inputCls = 'w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 focus:border-priority-blue outline-none transition-all placeholder:text-gray-400';

  return (
    <motion.div key="banners" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-8 md:p-12 max-w-xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-priority-blue/10 rounded-xl flex items-center justify-center text-priority-blue">
            <ImageIcon size={20} />
          </div>
          <div>
            <h2 className="text-sm font-black text-gray-900 uppercase tracking-tight">Banner Settings</h2>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Premium Page Editorial</p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-[10px] font-black text-priority-blue uppercase tracking-widest mb-2">
              Section 2 — Editorial Banner
            </label>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-4 leading-relaxed">
              Choose which product category the "Shop Now" button on the editorial image links to. Update this whenever the banner image changes.
            </p>

            {/* Preview thumbnail */}
            <div className="relative rounded-xl overflow-hidden mb-4 border border-gray-100" style={{ aspectRatio: '16/5' }}>
              <img src="/Traworld/section 2.png" alt="Editorial banner" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 flex items-end justify-center pb-3">
                <span className="border border-white text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5">
                  SHOP NOW → {editorialBanner.label.toUpperCase()}
                </span>
              </div>
            </div>

            <label className="block text-[10px] font-black text-gray-600 uppercase tracking-widest mb-2">
              Links to category:
            </label>
            <select
              value={editorialBanner.category}
              onChange={e => {
                const opt = BANNER_OPTIONS.find(o => o.value === e.target.value);
                if (opt) setEditorialBanner({ category: opt.value, label: opt.label, url: opt.url });
              }}
              className={inputCls}
            >
              {BANNER_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>

            <p className="text-[9px] text-gray-300 font-bold uppercase tracking-widest mt-2">
              Destination URL: {editorialBanner.url}
            </p>
          </div>

          <button
            onClick={saveEditorialBanner}
            disabled={bannerSaving}
            className="w-full bg-priority-blue text-white py-3.5 rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-priority-dark transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {bannerSaving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
            {bannerSaving ? 'Saving…' : 'Save Banner Setting'}
          </button>
        </div>
      </div>
    </motion.div>
  );
};
