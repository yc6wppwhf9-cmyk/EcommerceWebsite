import React from 'react';
import { motion } from 'motion/react';
import { Search } from 'lucide-react';

interface AdminUsersProps {
  allUsers: any[];
  userSearch: string;
  setUserSearch: (s: string) => void;
}

export const AdminUsers: React.FC<AdminUsersProps> = ({
  allUsers,
  userSearch,
  setUserSearch,
}) => {
  return (
    <motion.div key="cust" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black uppercase tracking-tighter">
          Registered Users <span className="text-gray-400 text-lg">({allUsers.length})</span>
        </h2>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={userSearch}
            onChange={e => setUserSearch(e.target.value)}
            placeholder="Search name or email..."
            className="pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold focus:outline-none focus:border-priority-blue w-64"
          />
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="border-b border-gray-100 bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-500">Name</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-500">Email</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-500 hidden md:table-cell">Phone</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-500 hidden lg:table-cell">Joined</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-500">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {allUsers
              .filter(u => !userSearch || u.name?.toLowerCase().includes(userSearch.toLowerCase()) || u.email?.toLowerCase().includes(userSearch.toLowerCase()))
              .map(u => (
                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-priority-blue/10 text-priority-blue flex items-center justify-center text-xs font-black">
                        {(u.name || '?')[0].toUpperCase()}
                      </div>
                      <span className="text-sm font-bold text-gray-900">{u.name}</span>
                      {u.role === 'admin' && <span className="text-[9px] font-black uppercase tracking-widest bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">Admin</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs font-bold text-gray-600">{u.email}</td>
                  <td className="px-6 py-4 text-xs font-bold text-gray-500 hidden md:table-cell">{u.phone || '—'}</td>
                  <td className="px-6 py-4 text-xs font-bold text-gray-400 hidden lg:table-cell">{new Date(u.created_at).toLocaleDateString('en-IN')}</td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${u.is_verified ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-600'}`}>
                      {u.is_verified ? 'Verified' : 'Unverified'}
                    </span>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
        {allUsers.length === 0 && (
          <div className="text-center py-12 text-[11px] font-black uppercase tracking-widest text-gray-400">No users found</div>
        )}
      </div>
    </motion.div>
  );
};
