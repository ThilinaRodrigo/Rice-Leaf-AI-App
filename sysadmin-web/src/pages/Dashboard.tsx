import React, { useState, useEffect } from 'react';
import { fetchAdminStats, fetchAdminScans } from '../api/adminApi';
import type { AdminStats, AdminScan } from '../types/admin';
import { StatCard } from '../components/StatCard';
import { Header } from '../components/Header';
import { Users, Store, ScanLine, ShoppingBag, Activity } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentScans, setRecentScans] = useState<AdminScan[]>([]);

  const loadDashboardData = async () => {
    try {
      const [statsData, scansData] = await Promise.all([
        fetchAdminStats(),
        fetchAdminScans(),
      ]);
      setStats(statsData);
      setRecentScans(scansData.slice(0, 5));
    } catch (err) {
      console.error('Error loading admin dashboard data:', err);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const chartData = stats?.disease_breakdown
    ? Object.entries(stats.disease_breakdown).map(([key, count]) => ({
        name: key,
        scans: count,
      }))
    : [
        { name: 'BLB', scans: 45 },
        { name: 'Brown Spot', scans: 32 },
        { name: 'Healthy', scans: 88 },
        { name: 'Leaf Scald', scans: 19 },
        { name: 'Narrow Brown', scans: 12 },
      ];

  const PIE_COLORS = ['#ef4444', '#f97316', '#22c55e', '#a855f7', '#3b82f6'];

  return (
    <div className="flex-1 overflow-y-auto">
      <Header
        title="Agri-Network Overview"
        subtitle="Real-time Sri Lankan Rice Leaf Diagnostics & Agro Marketplace Analytics"
        onRefresh={loadDashboardData}
      />

      <div className="p-8 space-y-8">
        {/* KPI Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Registered Farmers"
            value={stats?.total_farmers ?? 0}
            icon={Users}
            color="emerald"
            subtitle="Active paddy cultivators"
          />
          <StatCard
            title="Agro Shop Owners"
            value={stats?.total_shop_owners ?? 0}
            icon={Store}
            color="amber"
            subtitle="Verified chemical stores"
          />
          <StatCard
            title="AI Scans Performed"
            value={stats?.total_scans ?? 0}
            icon={ScanLine}
            color="blue"
            subtitle="Leaf diagnostic checks"
          />
          <StatCard
            title="Marketplace Listings"
            value={stats?.total_products ?? 0}
            icon={ShoppingBag}
            color="purple"
            subtitle="Products available online"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Bar Chart: Outbreaks */}
          <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-slate-800 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-emerald-400" />
                  <span>Disease Diagnostic Frequency</span>
                </h3>
                <p className="text-xs text-slate-400">Total scans categorized by disease class</p>
              </div>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '12px' }}
                    labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                  />
                  <Bar dataKey="scans" fill="#10b981" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pie Chart: Proportion */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-col">
            <h3 className="text-lg font-bold text-white mb-1">Outbreak Ratio</h3>
            <p className="text-xs text-slate-400 mb-4">Proportion of diagnosed diseases</p>

            <div className="h-60 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="scans"
                  >
                    {chartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Recent Diagnostic Activity Table */}
        <div className="glass-panel rounded-2xl border border-slate-800 shadow-xl p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <ScanLine className="w-5 h-5 text-blue-400" />
            <span>Recent Diagnostic Scans</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-800/60 text-xs uppercase text-slate-400 font-bold">
                <tr>
                  <th className="p-3.5 rounded-l-xl">User / Farmer</th>
                  <th className="p-3.5">Diagnosis Label</th>
                  <th className="p-3.5">AI Confidence</th>
                  <th className="p-3.5 rounded-r-xl">Date & Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {recentScans.length > 0 ? (
                  recentScans.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="p-3.5 font-medium text-white">{s.user_name || 'Guest Farmer'}</td>
                      <td className="p-3.5 font-semibold text-emerald-400">{s.label}</td>
                      <td className="p-3.5">{(s.confidence * 100).toFixed(1)}%</td>
                      <td className="p-3.5 text-slate-400">
                        {new Date(s.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-slate-500">
                      No scan history available yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
