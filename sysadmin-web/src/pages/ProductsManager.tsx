import React, { useState, useEffect, useRef } from 'react';
import {
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage,
} from '../api/adminApi';
import type { Product } from '../types/admin';
import { Header } from '../components/Header';
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  X,
  Upload,
  Check,
  Loader2,
  Link as LinkIcon,
  Package,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { showConfirmDialog, showSuccessToast, showErrorAlert } from '../utils/swal';

export const ProductsManager: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Modal state for Add/Edit
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [name, setName] = useState('');
  const [category, setCategory] = useState('Seeds');
  const [priceCents, setPriceCents] = useState(45000);
  const [priceUnit, setPriceUnit] = useState('Rs.450 / kg');
  const [imageUrl, setImageUrl] = useState('');
  const [stock, setStock] = useState(100);
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [modalError, setModalError] = useState('');

  // Image Upload States
  const [uploadMode, setUploadMode] = useState<'file' | 'url'>('file');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getFullImageUrl = (url?: string) => {
    if (!url) return '';
    if (url.startsWith('/uploads')) {
      const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';
      const serverDomain = apiBase.replace(/\/api\/v1\/?$/, '');
      return `${serverDomain}${url}`;
    }
    return url;
  };

  const loadProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchProducts();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('Error fetching products:', err);
      setError(
        err.response?.data?.error ||
          err.message ||
          'Unable to connect to backend server. Could not load marketplace products.'
      );
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const openCreateModal = () => {
    setEditingProduct(null);
    setName('');
    setCategory('Seeds');
    setPriceCents(45000);
    setPriceUnit('Rs.450 / kg');
    setImageUrl('');
    setImagePreview('');
    setStock(100);
    setDescription('');
    setIsActive(true);
    setModalError('');
    setUploadMode('file');
    setShowModal(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setCategory(p.category);
    setPriceCents(p.price_cents);
    setPriceUnit(p.price_unit || p.price || '');
    const currentImg = p.image_url || p.image || '';
    setImageUrl(currentImg);
    setImagePreview(getFullImageUrl(currentImg));
    setStock(p.stock);
    setDescription(p.description || '');
    setIsActive(p.is_active);
    setModalError('');
    setUploadMode(currentImg.startsWith('/uploads') ? 'file' : 'url');
    setShowModal(true);
  };

  const handleImageFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setModalError('Please choose a valid image file (PNG, JPG, JPEG, WEBP).');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setModalError('Image size cannot exceed 10MB.');
      return;
    }

    setUploadingImage(true);
    setModalError('');

    // Instant local preview
    const tempUrl = URL.createObjectURL(file);
    setImagePreview(tempUrl);

    try {
      const res = await uploadProductImage(file);
      setImageUrl(res.image_url);
      if (res.full_url) {
        setImagePreview(res.full_url);
      } else {
        setImagePreview(getFullImageUrl(res.image_url));
      }
      showSuccessToast('Image stored locally on server successfully!');
    } catch (err: any) {
      console.error('Upload failed:', err);
      const msg = err.response?.data?.error || err.message || 'Failed uploading image to server.';
      setModalError(msg);
      showErrorAlert('Upload Failed', msg);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleImageFile(file);
    }
  };

  const handleRemoveImage = () => {
    setImageUrl('');
    setImagePreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (id: string, prodName: string) => {
    const confirmed = await showConfirmDialog({
      title: 'Delete Product Listing?',
      text: `Are you sure you want to delete product "${prodName}"? This action cannot be undone.`,
      confirmButtonText: 'Yes, Delete Product',
      cancelButtonText: 'Cancel',
      icon: 'warning',
    });
    if (!confirmed) return;

    try {
      await deleteProduct(id);
      await loadProducts();
      showSuccessToast('Product deleted successfully');
    } catch (err: any) {
      showErrorAlert('Delete Failed', err.response?.data?.error || err.message || 'Failed deleting product.');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !category || !priceUnit || !imageUrl) {
      setModalError('Please fill in Name, Category, Price Unit, and upload or provide an Image.');
      return;
    }

    const actionText = editingProduct ? 'update product' : 'create new product';
    const confirmed = await showConfirmDialog({
      title: editingProduct ? 'Save Product Changes?' : 'Create New Product?',
      text: `Are you sure you want to ${actionText} "${name}"?`,
      confirmButtonText: editingProduct ? 'Yes, Save Changes' : 'Yes, Create Product',
      cancelButtonText: 'Cancel',
      icon: 'question',
    });
    if (!confirmed) return;

    setModalError('');
    try {
      const payload: Partial<Product> = {
        name,
        category,
        price_cents: Number(priceCents),
        price_unit: priceUnit,
        price: priceUnit,
        image_url: imageUrl,
        image: imageUrl,
        stock: Number(stock),
        description,
        is_active: isActive,
      };

      if (editingProduct) {
        await updateProduct(editingProduct.id, payload);
      } else {
        await createProduct(payload);
      }

      setShowModal(false);
      loadProducts();
      showSuccessToast(editingProduct ? 'Product updated successfully' : 'Product created successfully');
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || 'Error saving product';
      setModalError(msg);
      showErrorAlert('Save Failed', msg);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.category?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex-1 overflow-y-auto">
      <Header
        title="Agro Marketplace Administration"
        subtitle="Manage available seeds, fertilizers, sprayers, and farming tools"
        onRefresh={loadProducts}
      />

      <div className="p-8 space-y-6">
        {/* Top Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 glass-panel p-4 rounded-2xl border border-slate-800">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-72">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl py-2 px-3 text-sm text-slate-300 focus:outline-none focus:border-emerald-500"
            >
              <option value="All">All Categories</option>
              <option value="Fungicides & Remedies">Fungicides & Remedies</option>
              <option value="Seeds">Seeds</option>
              <option value="Fertilizers">Fertilizers</option>
              <option value="Sprayers">Sprayers</option>
              <option value="Tools">Tools</option>
            </select>
          </div>

          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-lg shadow-emerald-600/25 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </button>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="glass-panel p-4 rounded-2xl border border-red-500/30 bg-red-500/5 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
              <p className="text-xs text-red-300 font-semibold">{error}</p>
            </div>
            <button
              onClick={loadProducts}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* Product Grid / State Views */}
        {loading ? (
          <div className="p-16 text-center text-slate-400 space-y-3">
            <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mx-auto" />
            <p className="text-sm font-semibold">Loading marketplace products...</p>
          </div>
        ) : filteredProducts.length === 0 && !error ? (
          <div className="glass-panel p-12 rounded-3xl border border-slate-800 text-center space-y-3">
            <Package className="w-12 h-12 text-slate-600 mx-auto" />
            <h4 className="text-white font-bold text-base">No Marketplace Products Found</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              There are currently no products matching your search or category filter. You can add a new product using the button above.
            </p>
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/20 transition-all cursor-pointer mt-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Product</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((p) => {
              const displayImg = getFullImageUrl(p.image_url || p.image);
              const displayPrice = p.price_unit || p.price || `Rs.${(p.price_cents / 100).toFixed(0)}`;

              return (
                <div
                  key={p.id}
                  className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-xl flex flex-col justify-between group hover:border-slate-700 transition-all duration-200"
                >
                  <div>
                    <div className="h-44 bg-slate-900 relative overflow-hidden">
                      {displayImg ? (
                        <img
                          src={displayImg}
                          alt={p.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            // Hide broken image
                            (e.target as HTMLElement).style.display = 'none';
                            const parent = (e.target as HTMLElement).parentElement;
                            if (parent) {
                              parent.classList.add('flex', 'items-center', 'justify-center');
                            }
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-600">
                          <Package className="w-10 h-10 mb-1 opacity-40" />
                          <span className="text-[11px] font-semibold">No Image</span>
                        </div>
                      )}
                      <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-slate-900/80 border border-slate-700 text-slate-300 text-[11px] font-bold backdrop-blur-sm">
                        {p.category}
                      </span>
                    </div>

                    <div className="p-5">
                      <h4 className="font-extrabold text-white text-base mb-1 truncate" title={p.name}>
                        {p.name}
                      </h4>
                      <p className="text-xs text-slate-400 line-clamp-2 mb-3 min-h-[32px]">
                        {p.description || 'No description provided.'}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-black text-emerald-400">{displayPrice}</span>
                        <span className="text-xs text-slate-400 font-semibold">Stock: {p.stock}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-900/40 border-t border-slate-800/60 flex items-center justify-between">
                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                        p.is_active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                      }`}
                    >
                      {p.is_active ? 'Active' : 'Disabled'}
                    </span>

                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditModal(p)}
                        title="Edit Product"
                        className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id, p.name)}
                        title="Delete Product"
                        className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add/Edit Product Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-lg p-6 rounded-3xl border border-slate-800 shadow-2xl relative max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-extrabold text-white mb-1">
              {editingProduct ? 'Edit Marketplace Post' : 'Add New Marketplace Post'}
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Configure product details and upload product media directly to local storage.
            </p>

            {modalError && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center font-semibold">
                {modalError}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Certified Bg 352 Rice Seeds"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Fungicides & Remedies">Fungicides & Remedies</option>
                    <option value="Seeds">Seeds</option>
                    <option value="Fertilizers">Fertilizers</option>
                    <option value="Sprayers">Sprayers</option>
                    <option value="Tools">Tools</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                    Price Unit Label *
                  </label>
                  <input
                    type="text"
                    value={priceUnit}
                    onChange={(e) => setPriceUnit(e.target.value)}
                    placeholder="Rs.450 / kg"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Price in Cents</label>
                  <input
                    type="number"
                    value={priceCents}
                    onChange={(e) => setPriceCents(Number(e.target.value))}
                    placeholder="45000"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    value={stock}
                    onChange={(e) => setStock(Number(e.target.value))}
                    placeholder="100"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Product Image Section */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-slate-400 uppercase">
                    Product Image * <span className="text-[10px] text-emerald-400 lowercase">(Stored locally)</span>
                  </label>
                  <div className="flex gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
                    <button
                      type="button"
                      onClick={() => setUploadMode('file')}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                        uploadMode === 'file'
                          ? 'bg-emerald-600 text-white shadow'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Upload className="w-3 h-3" />
                      Upload File
                    </button>
                    <button
                      type="button"
                      onClick={() => setUploadMode('url')}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                        uploadMode === 'url'
                          ? 'bg-emerald-600 text-white shadow'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <LinkIcon className="w-3 h-3" />
                      Link URL
                    </button>
                  </div>
                </div>

                {uploadMode === 'file' ? (
                  <div className="space-y-3">
                    {/* Hidden input */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/webp"
                      onChange={handleFileChange}
                      className="hidden"
                    />

                    {imagePreview ? (
                      <div className="relative rounded-2xl overflow-hidden border border-slate-700 bg-slate-900 group">
                        <img
                          src={imagePreview}
                          alt="Product preview"
                          className="w-full h-44 object-cover"
                        />
                        {uploadingImage && (
                          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center text-white gap-2">
                            <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
                            <span className="text-xs font-bold">Uploading to local storage...</span>
                          </div>
                        )}
                        {!uploadingImage && (
                          <div className="absolute top-2 right-2 flex gap-1.5">
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="px-2.5 py-1 rounded-lg bg-slate-900/80 hover:bg-slate-900 text-white text-[11px] font-bold backdrop-blur-md border border-slate-700 transition-all cursor-pointer flex items-center gap-1"
                            >
                              <Upload className="w-3 h-3" />
                              Change
                            </button>
                            <button
                              type="button"
                              onClick={handleRemoveImage}
                              className="p-1 rounded-lg bg-red-600/80 hover:bg-red-600 text-white backdrop-blur-md transition-all cursor-pointer"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                        <div className="p-2.5 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                          <span className="truncate max-w-[280px] font-mono text-emerald-400">
                            {imageUrl || 'Local Image Selected'}
                          </span>
                          <span className="flex items-center gap-1 text-emerald-400 font-bold shrink-0">
                            <Check className="w-3.5 h-3.5" />
                            Ready
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-2 ${
                          isDragging
                            ? 'border-emerald-500 bg-emerald-500/10'
                            : 'border-slate-800 hover:border-slate-700 bg-slate-900/50 hover:bg-slate-900'
                        }`}
                      >
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-1">
                          <Upload className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">Click or drag image file here</p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            PNG, JPG, JPEG or WEBP (Max 10MB)
                          </p>
                        </div>
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">
                          Stores directly in local backend storage
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <input
                      type="text"
                      value={imageUrl}
                      onChange={(e) => {
                        setImageUrl(e.target.value);
                        setImagePreview(e.target.value);
                      }}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
                    />
                    {imageUrl && (
                      <div className="mt-2 rounded-xl overflow-hidden h-32 bg-slate-900 border border-slate-800">
                        <img
                          src={imageUrl}
                          alt="Preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="High yield paddy seed variety certified for Yala & Maha..."
                  rows={3}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded border-slate-800 bg-slate-900 text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                />
                <label htmlFor="isActive" className="text-xs font-bold text-slate-300 cursor-pointer">
                  Publish as Active in Marketplace
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-slate-800 text-slate-300 py-3 rounded-xl font-bold text-xs hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadingImage}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white py-3 rounded-xl font-bold text-xs shadow-lg shadow-emerald-600/25 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  {uploadingImage ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Uploading Media...</span>
                    </>
                  ) : (
                    <span>{editingProduct ? 'Save Changes' : 'Create Product'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsManager;
