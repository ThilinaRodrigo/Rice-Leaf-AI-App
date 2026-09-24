import React from 'react';
import { ShieldCheck, RefreshCw } from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onRefresh?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle, onRefresh }) => {
  const { user } = useAdminAuth();

  return (
    <header className="sticky top-0 z-10 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-8 py-4 flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-black text-white tracking-tight">{title}</h2>
        {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-4">
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="p-2.5 rounded-xl border border-slate-800 bg-slate-800/50 text-slate-300 hover:text-white hover:bg-slate-800 transition-all duration-200"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        )}

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold">
          <ShieldCheck className="w-4 h-4 text-purple-400" />
          <span>SysAdmin Active</span>
        </div>

        <div className="h-8 w-px bg-slate-800 mx-1" />

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center font-bold text-emerald-400 text-sm">
            {user?.full_name?.charAt(0) || 'A'}
          </div>
        </div>
      </div>
    </header>
  );
};
