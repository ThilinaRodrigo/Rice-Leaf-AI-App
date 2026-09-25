import React, { useState, useEffect } from 'react';
import { fetchAdminAds, updateAdStatus } from '../api/adminApi';
import type { ShopAd } from '../types/admin';
import { Header } from '../components/Header';
import { showConfirmDialog, showSuccessToast, showErrorAlert, customSwal } from '../utils/swal';
import { Search, CheckCircle, XCircle, Store, Phone, Tag, Clock, AlertTriangle } from 'lucide-react';

export const AdsManager: React.FC = () => {
  const [ads, setAds] = useState<ShopAd[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [loading, setLoading] = useState(false);

  const loadAds = async () => {
    setLoading(true);
    try {
      const data = await fetchAdminAds(statusFilter);
      setAds(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching admin ads:', err);
      setAds([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAds();
  }, [statusFilter]);

  const handleApprove = async (ad: ShopAd) => {
    const confirmed = await showConfirmDialog({
      title: 'Approve Shop Advertisement?',
      text: `Are you sure you want to approve "${ad.title}" by ${ad.shop_name}? It will become live in the Farmer Marketplace.`,
      confirmButtonText: 'Yes, Approve Ad',
      cancelButtonText: 'Cancel',
      icon: 'question',
    });
    if (!confirmed) return;

    try {
      await updateAdStatus(ad.id, 'approved');
      showSuccessToast('Advertisement approved and published to Marketplace!');
      loadAds();
    } catch (err: any) {
      showErrorAlert('Approval Failed', err.response?.data?.error || err.message || 'Error approving ad');
    }
  };

  const handleReject = async (ad: ShopAd) => {
    const { value: reason, isConfirmed } = await customSwal.fire({
      title: 'Reject Advertisement?',
      input: 'textarea',
      inputLabel: 'Rejection Reason for Shop Owner',
      inputPlaceholder: 'Please enter the reason for rejection (e.g. Unclear product image, inaccurate price unit)...',
      inputAttributes: {
        'aria-label': 'Type your rejection reason here',
      },
      showCancelButton: true,
      confirmButtonText: 'Reject Ad',
      cancelButtonText: 'Cancel',
      customClass: {
        popup: 'bg-slate-900 border border-slate-800 text-white rounded-3xl shadow-2xl p-6',
        title: 'text-white font-extrabold text-xl mb-2',
        input: 'bg-slate-950 text-white border border-slate-800 rounded-xl p-3 text-sm focus:border-red-500',
        confirmButton: 'bg-red-600 hover:bg-red-500 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition-all mx-1 cursor-pointer',
        cancelButton: 'bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-5 py-2.5 rounded-xl text-xs transition-all mx-1 cursor-pointer',
      },
      buttonsStyling: false,
    });

    if (!isConfirmed) return;

    try {
      await updateAdStatus(ad.id, 'rejected', reason || 'Does not meet Marketplace guidelines');
      showSuccessToast('Advertisement rejected.');
      loadAds();
    } catch (err: any) {
      showErrorAlert('Rejection Failed', err.response?.data?.error || err.message || 'Error rejecting ad');
    }
  };

  const parseTags = (raw: string[] | string): string[] => {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  };

  const formatTagLabel = (tagKey: string) => {
    return tagKey
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const safeAds = Array.isArray(ads) ? ads : [];

  const filteredAds = safeAds.filter((ad) => {
    if (!ad) return false;
    const matchesSearch =
      ad.title?.toLowerCase().includes(search.toLowerCase()) ||
      ad.shop_name?.toLowerCase().includes(search.toLowerCase()) ||
      ad.description?.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  const pendingCount = safeAds.filter((a) => a?.status === 'pending').length;

  return (
    <div className="flex-1 overflow-y-auto">
      <Header
        title="Shop Owner Ads Moderation"
        subtitle="Review pending shop advertisements, verify product images and disease tags before releasing to the Marketplace"
        onRefresh={loadAds}
      />

      <div className="p-8 space-y-6">
        {/* Controls & Filter Tabs */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 glass-panel p-4 rounded-2xl border border-slate-800">
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                statusFilter === 'pending'
                  ? 'bg-amber-500/20 border border-amber-500/40 text-amber-400 shadow-lg shadow-amber-500/10'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>Pending Moderation</span>
              {pendingCount > 0 && (
                <span className="bg-amber-500 text-slate-950 font-black px-2 py-0.5 rounded-full text-[10px]">
                  {pendingCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setStatusFilter('approved')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                statusFilter === 'approved'
                  ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 shadow-lg shadow-emerald-500/10'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <CheckCircle className="w-4 h-4" />
              <span>Approved Live Ads</span>
            </button>

            <button
              onClick={() => setStatusFilter('rejected')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                statusFilter === 'rejected'
                  ? 'bg-red-500/20 border border-red-500/40 text-red-400 shadow-lg shadow-red-500/10'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <XCircle className="w-4 h-4" />
              <span>Rejected Ads</span>
            </button>

            <button
              onClick={() => setStatusFilter('all')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                statusFilter === 'all'
                  ? 'bg-purple-500/20 border border-purple-500/40 text-purple-400 shadow-lg shadow-purple-500/10'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              All Ads
            </button>
          </div>

          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search ad title or shop name..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Ads Cards Grid */}
        {loading ? (
          <div className="p-12 text-center text-slate-500">Loading shop advertisements...</div>
        ) : filteredAds.length === 0 ? (
          <div className="glass-panel p-12 rounded-3xl border border-slate-800 text-center space-y-3">
            <Clock className="w-12 h-12 text-slate-600 mx-auto" />
            <h4 className="text-white font-bold text-base">No advertisements found</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              There are currently no shop advertisements matching your filter settings.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAds.map((ad) => {
              const tags = parseTags(ad.disease_tags);
              const fullImageUrl = ad.image_url?.startsWith('/uploads')
                ? `http://localhost:8080${ad.image_url}`
                : ad.image_url;

              return (
                <div
                  key={ad.id}
                  className="glass-panel rounded-3xl border border-slate-800 overflow-hidden shadow-xl flex flex-col justify-between"
                >
                  <div>
                    {/* Banner Image Preview */}
                    <div className="h-48 bg-slate-900 relative overflow-hidden">
                      <img
                        src={fullImageUrl}
                        alt={ad.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as any).src =
                            'https://images.unsplash.com/photo-1594381256940-7bcf6eb0f6b0?auto=format&fit=crop&w=500&q=60';
                        }}
                      />
                      <div className="absolute top-3 right-3">
                        {ad.status === 'pending' && (
                          <span className="px-3 py-1 rounded-full bg-amber-500/90 text-slate-950 font-black text-xs shadow-lg backdrop-blur-md flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            Pending Review
                          </span>
                        )}
                        {ad.status === 'approved' && (
                          <span className="px-3 py-1 rounded-full bg-emerald-500/90 text-slate-950 font-black text-xs shadow-lg backdrop-blur-md flex items-center gap-1">
                            <CheckCircle className="w-3.5 h-3.5" />
                            Approved
                          </span>
                        )}
                        {ad.status === 'rejected' && (
                          <span className="px-3 py-1 rounded-full bg-red-500/90 text-white font-black text-xs shadow-lg backdrop-blur-md flex items-center gap-1">
                            <XCircle className="w-3.5 h-3.5" />
                            Rejected
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-6 space-y-4">
                      {/* Shop Owner Info */}
                      <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-3">
                        <div className="flex items-center gap-2 text-slate-300 font-bold">
                          <Store className="w-4 h-4 text-emerald-400" />
                          <span>{ad.shop_name || 'Agro Shop Owner'}</span>
                        </div>
                        <div className="flex items-center gap-1 text-slate-400 font-mono">
                          <Phone className="w-3.5 h-3.5 text-slate-500" />
                          <span>{ad.contact_phone || 'N/A'}</span>
                        </div>
                      </div>

                      {/* Title & Price */}
                      <div>
                        <h3 className="font-extrabold text-white text-base leading-snug mb-1">
                          {ad.title}
                        </h3>
                        {ad.price_unit && (
                          <span className="text-sm font-black text-emerald-400 block">
                            {ad.price_unit}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                        {ad.description}
                      </p>

                      {/* Disease Tags */}
                      {tags.length > 0 && (
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2 flex items-center gap-1">
                            <Tag className="w-3 h-3 text-purple-400" />
                            <span>Linked Rice Disease Tags</span>
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {tags.map((tg, i) => (
                              <span
                                key={i}
                                className="px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-300 text-[11px] font-semibold"
                              >
                                {formatTagLabel(tg)}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Rejection Reason if applicable */}
                      {ad.status === 'rejected' && ad.rejection_reason && (
                        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold block">Rejection Reason:</span>
                            <span>{ad.rejection_reason}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Admin Actions Footer */}
                  <div className="p-4 bg-slate-900/60 border-t border-slate-800 flex items-center justify-end gap-2">
                    {ad.status !== 'approved' && (
                      <button
                        onClick={() => handleApprove(ad)}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Approve Ad</span>
                      </button>
                    )}

                    {ad.status !== 'rejected' && (
                      <button
                        onClick={() => handleReject(ad)}
                        className="flex-1 bg-red-500/10 hover:bg-red-500 border border-red-500/20 text-red-400 hover:text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Reject Ad</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
