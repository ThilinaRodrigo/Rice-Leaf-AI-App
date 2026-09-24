import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  color?: 'emerald' | 'blue' | 'purple' | 'amber' | 'indigo';
  subtitle?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  color = 'emerald',
  subtitle,
}) => {
  const colorMap = {
    emerald: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
    blue: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
    purple: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
    amber: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
    indigo: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400',
  };

  return (
    <div className="glass-panel rounded-2xl p-5 border border-slate-800 flex items-center justify-between shadow-xl">
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
          {title}
        </p>
        <h3 className="text-3xl font-black text-white tracking-tight">{value}</h3>
        {subtitle && <p className="text-[11px] text-slate-400 mt-1">{subtitle}</p>}
      </div>

      <div
        className={`w-14 h-14 rounded-2xl border flex items-center justify-center ${colorMap[color]}`}
      >
        <Icon className="w-7 h-7" />
      </div>
    </div>
  );
};
