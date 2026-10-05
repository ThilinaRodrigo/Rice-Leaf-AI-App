import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Trash2,
  Search,
  Filter,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  User,
  Eye,
  X,
} from 'lucide-react';
import { fetchAdminPosts, deleteAdminPost } from '../api/adminApi';
import type { CommunityPost } from '../types/admin';

const DISEASE_OPTIONS = [
  { label: 'All Diseases', value: 'All' },
  { label: 'Bacterial Leaf Blight', value: 'bacterial_leaf_blight' },
  { label: 'Brown Spot', value: 'brown_spot' },
  { label: 'Healthy Leaf', value: 'healthy' },
  { label: 'Leaf Scald', value: 'leaf_scald' },
  { label: 'Narrow Brown Spot', value: 'narrow_brown_spot' },
  { label: 'General Queries', value: 'general' },
];

export const PostsManager: React.FC = () => {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [selectedTag, setSelectedTag] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const loadPosts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdminPosts(selectedTag);
      setPosts(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load community posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, [selectedTag]);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleDelete = async (postId: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete post: "${title}"?`)) {
      return;
    }

    try {
      await deleteAdminPost(postId);
      showToast('Community post deleted successfully', 'success');
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    } catch (err: any) {
      showToast(err.message || 'Failed to delete post', 'error');
    }
  };

  const getImageUrl = (url?: string) => {
    if (!url) return null;
    if (url.startsWith('/uploads')) {
      const apiEnv = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';
      const host = apiEnv.replace('/api/v1', '');
      return `${host}${url}`;
    }
    return url;
  };

  const filteredPosts = posts.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.author_name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center space-x-2 px-4 py-3 rounded-lg shadow-lg text-white font-medium transition-all ${
            toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'
          }`}
        >
          {toast.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <MessageSquare className="w-7 h-7 text-emerald-500" />
            Community Posts & Solution Base
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Monitor, review, and moderate user-submitted crop disease remedies and field posts.
          </p>
        </div>

        <button
          onClick={loadPosts}
          disabled={loading}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all border border-slate-700"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
          <span>Refresh List</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search Input */}
        <div className="relative col-span-2">
          <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by post title, remedy details, or author name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        {/* Disease Tag Filter */}
        <div className="relative">
          <Filter className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <select
            value={selectedTag}
            onChange={(e) => setSelectedTag(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-emerald-500 transition-colors appearance-none cursor-pointer"
          >
            {DISEASE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Posts Table / Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-slate-900 border border-slate-800 rounded-2xl">
          <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin mb-3" />
          <p className="text-slate-400 text-sm">Loading community posts...</p>
        </div>
      ) : error ? (
        <div className="p-6 bg-red-950/40 border border-red-900/50 rounded-2xl text-center">
          <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
          <p className="text-red-300 font-bold">{error}</p>
        </div>
      ) : filteredPosts.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredPosts.map((post) => {
            const imgUrl = getImageUrl(post.image_url);
            return (
              <div
                key={post.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar: Author & Tag */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
                        <User className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-200">{post.author_name}</h4>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">
                          {post.author_role}
                        </span>
                      </div>
                    </div>

                    <span className="px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-800/80 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                      {post.disease_tag.replace(/_/g, ' ')}
                    </span>
                  </div>

                  {/* Title & Content */}
                  <h3 className="text-base font-bold text-white mb-1.5">{post.title}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed mb-4 line-clamp-3">
                    {post.content}
                  </p>

                  {/* Image Attachment Preview */}
                  {imgUrl && (
                    <div className="mb-4 relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 h-40">
                      <img
                        src={imgUrl}
                        alt={post.title}
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => setPreviewImage(imgUrl)}
                        className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-900 text-slate-200 transition-all"
                        title="Expand Image"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Footer Stats & Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 mt-2">
                  <div className="flex items-center space-x-4 text-xs font-semibold text-slate-400">
                    <span className="flex items-center space-x-1 text-emerald-400">
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>{post.likes_count}</span>
                    </span>
                    <span className="flex items-center space-x-1 text-red-400">
                      <ThumbsDown className="w-3.5 h-3.5" />
                      <span>{post.dislikes_count}</span>
                    </span>
                    <span className="flex items-center space-x-1 text-slate-300">
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{post.comments_count} Comments</span>
                    </span>
                  </div>

                  <button
                    onClick={() => handleDelete(post.id, post.title)}
                    className="p-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-900/50 transition-all flex items-center space-x-1.5 text-xs font-bold"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-slate-900 border border-slate-800 rounded-2xl">
          <MessageSquare className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-slate-200 font-bold text-base">No Community Posts Found</h3>
          <p className="text-slate-400 text-xs mt-1">
            No posts match your search or selected disease tag filter.
          </p>
        </div>
      )}

      {/* Image Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="relative max-w-3xl w-full bg-slate-900 border border-slate-800 rounded-2xl p-2">
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 text-slate-300 hover:text-white transition-all z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={previewImage}
              alt="Community Post Preview"
              className="w-full max-h-[80vh] object-contain rounded-xl"
            />
          </div>
        </div>
      )}
    </div>
  );
};
