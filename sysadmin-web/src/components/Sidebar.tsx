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
  X,
} from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { useMobileNav } from '../context/NavigationContext';

export const Sidebar: React.FC = () => {
  const { logout, user } = useAdminAuth();
  const { isMobileOpen, closeMobile } = useMobileNav();

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
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          onClick={closeMobile}
          className="fixed inset-0 z-40 bg-black/75 backdrop-blur-xs lg:hidden transition-opacity duration-300"
          aria-hidden="true"
        />
      )}

      {/* Sidebar / Mobile Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 border-r border-slate-800 flex flex-col h-full transition-transform duration-300 ease-in-out lg:static lg:w-64 lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-900/20 shrink-0">
              <Leaf className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-extrabold text-white text-base tracking-tight leading-none">
                Rice Leaf AI
              </h1>
              <span className="text-[10px] font-semibold tracking-wider text-emerald-400 uppercase">
                SysAdmin Portal
              </span>
            </div>
          </div>

          {/* Close button on mobile */}
          <button
            onClick={closeMobile}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden transition-colors cursor-pointer"
            title="Close navigation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-5 space-y-1.5 overflow-y-auto">
          <div className="px-3 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Main Navigation
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={closeMobile}
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
            <div className="w-9 h-9 rounded-lg bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold text-sm shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">{user?.full_name || 'System Admin'}</p>
              <p className="text-[10px] text-slate-400 truncate">{user?.email || 'admin@riceleaf.lk'}</p>
            </div>
          </div>

          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white font-semibold text-xs transition-all duration-200 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
