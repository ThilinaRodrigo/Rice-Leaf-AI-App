import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  ScanLine,
  ShoppingBag,
  BookOpen,
  ShieldAlert,
  LogOut,
  Leaf,
  Megaphone,
  MessageSquare,
} from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';

export const Sidebar: React.FC = () => {
  const { logout, user } = useAdminAuth();

  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'User Directory', path: '/users', icon: Users },
    { label: 'Leaf Scans Audit', path: '/scans', icon: ScanLine },
    { label: 'Ads Verification', path: '/ads', icon: Megaphone },
    { label: 'Community Posts', path: '/posts', icon: MessageSquare },
    { label: 'Agro Marketplace', path: '/products', icon: ShoppingBag },
    { label: 'Disease Remedies', path: '/diseases', icon: BookOpen },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-screen sticky top-0">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-800/80 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-900/20">
          <Leaf className="w-6 h-6" />
        </div>
        <div>
          <h1 className="font-extrabold text-white text-base tracking-tight leading-none">
            Rice Leaf AI
          </h1>
          <span className="text-[11px] font-semibold tracking-wider text-emerald-400 uppercase">
            SysAdmin Portal
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        <div className="px-3 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          Main Navigation
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/25 font-semibold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`
              }
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Admin User Info Footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/50">
        <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-800/40 mb-3 border border-slate-800">
          <div className="w-9 h-9 rounded-lg bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold text-sm">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white truncate">{user?.full_name || 'System Admin'}</p>
            <p className="text-[10px] text-slate-400 truncate">{user?.email || 'admin@riceleaf.lk'}</p>
          </div>
        </div>

        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white font-semibold text-xs transition-all duration-200"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
