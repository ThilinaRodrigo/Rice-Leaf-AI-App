import React, { useState, useEffect } from 'react';
import { fetchAdminScans } from '../api/adminApi';
import type { AdminScan } from '../types/admin';
import { Header } from '../components/Header';
import { Search, Eye, Calendar, User as UserIcon, X } from 'lucide-react';

export const ScansManager: React.FC = () => {
  const [scans, setScans] = useState<AdminScan[]>([]);
  const [search, setSearch] = useState('');
  const [diseaseFilter, setDiseaseFilter] = useState('All');
  const [selectedScan, setSelectedScan] = useState<AdminScan | null>(null);

  const loadScans = async () => {
    try {
      const data = await fetchAdminScans();
      setScans(data);
    } catch (err) {
      console.error('Error fetching admin scans:', err);
    }
  };

  useEffect(() => {
    loadScans();
  }, []);

  const filteredScans = scans.filter((s) => {
    const matchesSearch =
      s.label?.toLowerCase().includes(search.toLowerCase()) ||
      s.user_name?.toLowerCase().includes(search.toLowerCase());
    const matchesDisease = diseaseFilter === 'All' || s.label === diseaseFilter;
    return matchesSearch && matchesDisease;
  });

  const getDiseaseBadgeColor = (label: string) => {
    if (label.toLowerCase().includes('healthy')) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    if (label.toLowerCase().includes('bacterial')) return 'bg-red-500/10 text-red-400 border-red-500/20';
    return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <Header
        title="Diagnostic Scans Audit"
        subtitle="Review rice leaf scan history, diagnosis confidence scores, and leaf images"
        onRefresh={loadScans}
      />

      <div className="p-8 space-y-6">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 glass-panel p-4 rounded-2xl border border-slate-800">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-72">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search disease label or farmer..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <select
              value={diseaseFilter}
              onChange={(e) => setDiseaseFilter(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl py-2 px-3 text-sm text-slate-300 focus:outline-none focus:border-blue-500"
            >
              <option value="All">All Categories</option>
              <option value="Bacterial Leaf Blight (BLB)">Bacterial Leaf Blight</option>
              <option value="Brown Spot">Brown Spot</option>
              <option value="Healthy Leaf">Healthy Leaf</option>
              <option value="Leaf Scald">Leaf Scald</option>
              <option value="Narrow Brown Spot">Narrow Brown Spot</option>
            </select>
          </div>
        </div>

        {/* Scans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredScans.map((scan) => (
            <div
              key={scan.id}
              className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-xl hover:border-slate-700 transition-all group"
            >
              <div className="h-48 bg-slate-900 relative overflow-hidden flex items-center justify-center">
                <img
                  src={scan.image_url}
                  alt={scan.label}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    (e.target as any).src =
                      'https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?auto=format&fit=crop&w=500&q=60';
                  }}
                />
                <div className="absolute top-3 right-3">
                  <span className={`px-3 py-1 rounded-full border text-xs font-extrabold backdrop-blur-md ${getDiseaseBadgeColor(scan.label)}`}>
                    {scan.label}
                  </span>
                </div>
              </div>

              <div className="p-5 space-y-3">
                <div className="flex justify-between items-center text-xs text-slate-400">
                  <span className="flex items-center gap-1.5 text-slate-300 font-semibold">
                    <UserIcon className="w-3.5 h-3.5 text-slate-500" />
                    {scan.user_name || 'Guest Farmer'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(scan.created_at).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">AI Confidence</span>
                    <span className="text-lg font-black text-white">{(scan.confidence * 100).toFixed(1)}%</span>
                  </div>

                  <button
                    onClick={() => setSelectedScan(scan)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-400 hover:bg-blue-600 hover:text-white text-xs font-bold transition-all"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Inspect</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Image Inspection Modal */}
      {selectedScan && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-2xl p-6 rounded-3xl border border-slate-800 shadow-2xl relative">
            <button
              onClick={() => setSelectedScan(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>

            <h3 className="text-xl font-black text-white mb-1">Diagnostic Scan Detail</h3>
            <p className="text-xs text-slate-400 mb-6">Scan ID: {selectedScan.id}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="h-64 rounded-2xl overflow-hidden bg-slate-900 border border-slate-800">
                <img
                  src={selectedScan.image_url}
                  alt={selectedScan.label}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-4">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Diagnosed Condition
                  </span>
                  <span className={`inline-block px-3 py-1.5 rounded-xl border text-sm font-black ${getDiseaseBadgeColor(selectedScan.label)}`}>
                    {selectedScan.label}
                  </span>
                </div>

                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Confidence Level
                  </span>
                  <p className="text-2xl font-black text-white">{(selectedScan.confidence * 100).toFixed(1)}%</p>
                </div>

                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Farmer / User
                  </span>
                  <p className="text-sm font-semibold text-slate-200">{selectedScan.user_name || 'Guest Farmer'}</p>
                </div>

                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Scan Timestamp
                  </span>
                  <p className="text-xs text-slate-400">{new Date(selectedScan.created_at).toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
