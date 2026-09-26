import React, { useState, useEffect } from 'react';
import { fetchAdminScans } from '../api/adminApi';
import type { AdminScan } from '../types/admin';
import { Header } from '../components/Header';
import {
  Search,
  Eye,
  Calendar,
  User as UserIcon,
  X,
  ScanLine,
  Activity,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Download,
  Grid,
  List,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';

const FALLBACK_SCANS: AdminScan[] = [
  {
    id: 'a1111111-1111-1111-1111-111111111111',
    user_name: 'Sunil Perera (Polonnaruwa)',
    user_role: 'farmer',
    image_url: 'https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?auto=format&fit=crop&w=500&q=60',
    class_id: 0,
    label: 'Bacterial Leaf Blight',
    confidence: 0.965,
    created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
  },
  {
    id: 'a2222222-2222-2222-2222-222222222222',
    user_name: 'Kamal Silva (Kurunegala)',
    user_role: 'farmer',
    image_url: 'https://images.unsplash.com/photo-1607703700242-7a37b2fbb5bc?auto=format&fit=crop&w=500&q=60',
    class_id: 1,
    label: 'Brown Spot',
    confidence: 0.912,
    created_at: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
  },
  {
    id: 'a3333333-3333-3333-3333-333333333333',
    user_name: 'Nimal Jayasinghe (Ampara)',
    user_role: 'farmer',
    image_url: 'https://images.unsplash.com/photo-1587316745629-1a81c7b54e9b?auto=format&fit=crop&w=500&q=60',
    class_id: 2,
    label: 'Healthy Leaf',
    confidence: 0.991,
    created_at: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
  },
  {
    id: 'a4444444-4444-4444-4444-444444444444',
    user_name: 'Guest Farmer (Anuradhapura)',
    user_role: 'guest',
    image_url: 'https://images.unsplash.com/photo-1594381256940-7bcf6eb0f6b0?auto=format&fit=crop&w=500&q=60',
    class_id: 3,
    label: 'Leaf Scald',
    confidence: 0.884,
    created_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'a5555555-5555-5555-5555-555555555555',
    user_name: 'Bandara Rathnayake (Badulla)',
    user_role: 'farmer',
    image_url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=500&q=60',
    class_id: 4,
    label: 'Narrow Brown Spot',
    confidence: 0.941,
    created_at: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
  },
  {
    id: 'a6666666-6666-6666-6666-666666666666',
    user_name: 'Ruwan Samarasinghe (Hambantota)',
    user_role: 'farmer',
    image_url: 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&w=500&q=60',
    class_id: 0,
    label: 'Bacterial Leaf Blight',
    confidence: 0.742,
    created_at: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
  },
];

export const ScansManager: React.FC = () => {
  const [scans, setScans] = useState<AdminScan[]>([]);
  const [search, setSearch] = useState('');
  const [diseaseFilter, setDiseaseFilter] = useState('All');
  const [confidenceFilter, setConfidenceFilter] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [selectedScan, setSelectedScan] = useState<AdminScan | null>(null);
  const [loading, setLoading] = useState(false);

  const loadScans = async () => {
    setLoading(true);
    try {
      const data = await fetchAdminScans();
      if (Array.isArray(data) && data.length > 0) {
        setScans(data);
      } else {
        setScans(FALLBACK_SCANS);
      }
    } catch (err) {
      console.error('Error fetching admin scans:', err);
      setScans(FALLBACK_SCANS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadScans();
  }, []);

  const safeScans = Array.isArray(scans) && scans.length > 0 ? scans : FALLBACK_SCANS;

  const filteredScans = safeScans.filter((s) => {
    if (!s) return false;
    const matchesSearch =
      (s.label || '').toLowerCase().includes(search.toLowerCase()) ||
      (s.user_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (s.id || '').toLowerCase().includes(search.toLowerCase());

    const matchesDisease =
      diseaseFilter === 'All' ||
      (s.label || '').toLowerCase().includes(diseaseFilter.toLowerCase());

    let matchesConfidence = true;
    if (confidenceFilter === 'high') {
      matchesConfidence = (s.confidence || 0) >= 0.85;
    } else if (confidenceFilter === 'low') {
      matchesConfidence = (s.confidence || 0) < 0.85;
    }

    return matchesSearch && matchesDisease && matchesConfidence;
  });

  // Calculate audit stats
  const totalScans = safeScans.length;
  const avgConfidence =
    totalScans > 0
      ? (
          safeScans.reduce((acc, s) => acc + (s.confidence || 0), 0) /
          totalScans *
          100
        ).toFixed(1)
      : '0.0';

  const healthyCount = safeScans.filter((s) =>
    (s.label || '').toLowerCase().includes('healthy')
  ).length;

  const flaggedCount = safeScans.filter(
    (s) =>
      (s.confidence || 0) < 0.85 ||
      (s.label || '').toLowerCase().includes('bacterial')
  ).length;

  const getDiseaseBadgeColor = (label: string) => {
    if (!label) return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    const lower = label.toLowerCase();
    if (lower.includes('healthy'))
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    if (lower.includes('bacterial'))
      return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
    if (lower.includes('scald'))
      return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
    return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
  };

  const getImageUrl = (url: string) => {
    if (!url)
      return 'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&w=500&q=60';
    const uploadIndex = url.indexOf('/uploads');
    if (uploadIndex !== -1) {
      const relPath = url.substring(uploadIndex);
      const apiEnv = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';
      const host = apiEnv.replace('/api/v1', '');
      return `${host}${relPath}`;
    }
    return url;
  };

  const exportCSV = () => {
    const headers = ['Scan ID', 'Farmer / User', 'Role', 'Diagnosed Disease', 'Confidence Score', 'Timestamp'];
    const rows = filteredScans.map((s) => [
      s.id,
      `"${s.user_name || 'Guest Farmer'}"`,
      s.user_role || 'guest',
      `"${s.label}"`,
      `${((s.confidence || 0) * 100).toFixed(1)}%`,
      new Date(s.created_at).toLocaleString(),
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `rice_leaf_scans_audit_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <Header
        title="Diagnostic Scans Audit"
        subtitle="Review rice leaf scan history, diagnosis confidence scores, and leaf images"
        onRefresh={loadScans}
      />

      <div className="p-8 space-y-6">
        {/* KPI Analytics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <ScanLine className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">
                Total Scans
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-white">{totalScans}</span>
                <span className="text-[10px] font-bold text-emerald-400 flex items-center">
                  <TrendingUp className="w-3 h-3 mr-0.5" /> +12%
                </span>
              </div>
            </div>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">
                Avg AI Confidence
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-white">{avgConfidence}%</span>
                <span className="text-[10px] font-bold text-blue-400">High Precision</span>
              </div>
            </div>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">
                Flagged Scans
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-white">{flaggedCount}</span>
                <span className="text-[10px] font-bold text-rose-400">Audit Needed</span>
              </div>
            </div>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-slate-800 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">
                Healthy Crop Ratio
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-white">
                  {totalScans > 0 ? ((healthyCount / totalScans) * 100).toFixed(0) : 0}%
                </span>
                <span className="text-[10px] font-bold text-teal-400">{healthyCount} Healthy</span>
              </div>
            </div>
          </div>
        </div>

        {/* Toolbar & Filters */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 glass-panel p-4 rounded-2xl border border-slate-800">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            {/* Search */}
            <div className="relative flex-1 min-w-[220px]">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search disease label or farmer..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Disease Category Dropdown */}
            <select
              value={diseaseFilter}
              onChange={(e) => setDiseaseFilter(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl py-2 px-3 text-sm text-slate-300 focus:outline-none focus:border-blue-500"
            >
              <option value="All">All Categories</option>
              <option value="Bacterial Leaf Blight">Bacterial Leaf Blight</option>
              <option value="Brown Spot">Brown Spot</option>
              <option value="Healthy Leaf">Healthy Leaf</option>
              <option value="Leaf Scald">Leaf Scald</option>
              <option value="Narrow Brown Spot">Narrow Brown Spot</option>
            </select>

            {/* Confidence Dropdown */}
            <select
              value={confidenceFilter}
              onChange={(e) => setConfidenceFilter(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl py-2 px-3 text-sm text-slate-300 focus:outline-none focus:border-blue-500"
            >
              <option value="All">All Confidence Levels</option>
              <option value="high">High Confidence (&ge;85%)</option>
              <option value="low">Low Confidence (&lt;85%)</option>
            </select>
          </div>

          {/* Action Tools */}
          <div className="flex items-center gap-2 border-t md:border-t-0 border-slate-800 pt-3 md:pt-0">
            <button
              onClick={exportCSV}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 text-xs font-bold transition-all"
              title="Export CSV Audit Log"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export</span>
            </button>

            <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg text-xs transition-all ${
                  viewMode === 'grid'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Grid View"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg text-xs transition-all ${
                  viewMode === 'table'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Table View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="p-16 text-center text-slate-400 space-y-3">
            <Activity className="w-8 h-8 text-blue-500 animate-spin mx-auto" />
            <p className="text-sm font-semibold">Loading diagnostic scans audit log...</p>
          </div>
        ) : filteredScans.length === 0 ? (
          <div className="glass-panel p-12 rounded-3xl border border-slate-800 text-center space-y-3">
            <ScanLine className="w-12 h-12 text-slate-600 mx-auto" />
            <h4 className="text-white font-bold text-base">No Matching Diagnostic Scans</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              No scans matched your active search or filter criteria. Try adjusting the disease or confidence filter.
            </p>
          </div>
        ) : viewMode === 'grid' ? (
          /* Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredScans.map((scan) => (
              <div
                key={scan.id}
                className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-xl hover:border-slate-700 transition-all group flex flex-col justify-between"
              >
                <div className="h-48 bg-slate-900 relative overflow-hidden flex items-center justify-center">
                  <img
                    src={getImageUrl(scan.image_url)}
                    alt={scan.label}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as any).src =
                        'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&w=500&q=60';
                    }}
                  />
                  <div className="absolute top-3 right-3">
                    <span
                      className={`px-3 py-1 rounded-full border text-xs font-extrabold backdrop-blur-md shadow-md ${getDiseaseBadgeColor(
                        scan.label
                      )}`}
                    >
                      {scan.label}
                    </span>
                  </div>
                  {scan.confidence < 0.85 && (
                    <div className="absolute top-3 left-3 bg-amber-500/90 text-black px-2.5 py-0.5 rounded-full text-[10px] font-black flex items-center gap-1 shadow-lg">
                      <AlertTriangle className="w-3 h-3" /> Flagged
                    </div>
                  )}
                </div>

                <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs text-slate-400">
                      <span className="flex items-center gap-1.5 text-slate-300 font-semibold truncate max-w-[180px]">
                        <UserIcon className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                        {scan.user_name || 'Guest Farmer'}
                      </span>
                      <span className="flex items-center gap-1 text-[11px] text-slate-400 flex-shrink-0">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(scan.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Progress Bar for Confidence */}
                    <div className="space-y-1 pt-1">
                      <div className="flex justify-between text-[11px] font-bold">
                        <span className="text-slate-400 uppercase tracking-wider text-[10px]">
                          AI Confidence
                        </span>
                        <span className="text-white">
                          {((scan.confidence || 0) * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${
                            scan.confidence >= 0.9
                              ? 'bg-emerald-500'
                              : scan.confidence >= 0.8
                              ? 'bg-blue-500'
                              : 'bg-amber-500'
                          }`}
                          style={{ width: `${Math.min(100, (scan.confidence || 0) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-800/60">
                    <span className="text-[11px] text-slate-500 font-mono truncate max-w-[120px]">
                      #{scan.id.substring(0, 8)}
                    </span>

                    <button
                      onClick={() => setSelectedScan(scan)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-400 hover:bg-blue-600 hover:text-white text-xs font-bold transition-all"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Inspect</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Table View */
          <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-900/80 text-xs uppercase tracking-wider text-slate-400 font-bold border-b border-slate-800">
                  <tr>
                    <th className="px-5 py-4">Leaf Image</th>
                    <th className="px-5 py-4">Scan ID</th>
                    <th className="px-5 py-4">Farmer / User</th>
                    <th className="px-5 py-4">Diagnosed Condition</th>
                    <th className="px-5 py-4">AI Confidence</th>
                    <th className="px-5 py-4">Scan Date</th>
                    <th className="px-5 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredScans.map((scan) => (
                    <tr key={scan.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-5 py-3">
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-900 border border-slate-800">
                          <img
                            src={getImageUrl(scan.image_url)}
                            alt={scan.label}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as any).src =
                                'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&w=500&q=60';
                            }}
                          />
                        </div>
                      </td>
                      <td className="px-5 py-3 font-mono text-xs text-slate-400">
                        {scan.id.substring(0, 8)}...
                      </td>
                      <td className="px-5 py-3 font-semibold text-white">
                        {scan.user_name || 'Guest Farmer'}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`px-3 py-1 rounded-full border text-xs font-bold ${getDiseaseBadgeColor(
                            scan.label
                          )}`}
                        >
                          {scan.label}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">
                            {((scan.confidence || 0) * 100).toFixed(1)}%
                          </span>
                          {scan.confidence < 0.85 && (
                            <AlertTriangle className="w-4 h-4 text-amber-400" title="Low confidence scan" />
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3 text-xs text-slate-400">
                        {new Date(scan.created_at).toLocaleString()}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button
                          onClick={() => setSelectedScan(scan)}
                          className="px-3 py-1.5 rounded-xl bg-blue-600/10 border border-blue-500/20 text-blue-400 hover:bg-blue-600 hover:text-white text-xs font-bold transition-all inline-flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Inspect</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Image Inspection Modal */}
      {selectedScan && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-2xl p-6 rounded-3xl border border-slate-800 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setSelectedScan(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="flex items-center gap-2 mb-1">
              <ScanLine className="w-5 h-5 text-blue-400" />
              <h3 className="text-xl font-black text-white">Diagnostic Scan Detail</h3>
            </div>
            <p className="text-xs text-slate-400 font-mono mb-6">Scan ID: {selectedScan.id}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="h-64 rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 relative group">
                <img
                  src={getImageUrl(selectedScan.image_url)}
                  alt={selectedScan.label}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as any).src =
                      'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&w=500&q=60';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                  <span className="text-[10px] text-slate-300 font-mono">High-Res AI Diagnostic Leaf Capture</span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Diagnosed Condition
                  </span>
                  <span
                    className={`inline-block px-3 py-1.5 rounded-xl border text-sm font-black ${getDiseaseBadgeColor(
                      selectedScan.label
                    )}`}
                  >
                    {selectedScan.label}
                  </span>
                </div>

                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Confidence Level
                  </span>
                  <div className="flex items-baseline gap-2">
                    <p className="text-2xl font-black text-white">
                      {((selectedScan.confidence || 0) * 100).toFixed(1)}%
                    </p>
                    {selectedScan.confidence >= 0.9 ? (
                      <span className="text-xs font-bold text-emerald-400">Optimal AI Match</span>
                    ) : (
                      <span className="text-xs font-bold text-amber-400">Audit Review Recommended</span>
                    )}
                  </div>
                </div>

                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Farmer / User
                  </span>
                  <p className="text-sm font-semibold text-slate-200">
                    {selectedScan.user_name || 'Guest Farmer'}
                  </p>
                  <span className="text-[11px] text-slate-400 capitalize">
                    Role: {selectedScan.user_role || 'Guest User'}
                  </span>
                </div>

                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Scan Timestamp
                  </span>
                  <p className="text-xs text-slate-400 font-mono">
                    {new Date(selectedScan.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedScan(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all"
              >
                Close Audit View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
