import React, { useState, useEffect } from 'react';
import { fetchProducts, createProduct, updateProduct, deleteProduct } from '../api/adminApi';
import type { Product } from '../types/admin';
import { Header } from '../components/Header';
import { Plus, Edit2, Trash2, Search, X } from 'lucide-react';
import { showConfirmDialog, showSuccessToast, showErrorAlert } from '../utils/swal';

export const ProductsManager: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
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

  const loadProducts = async () => {
    try {
      const data = await fetchProducts();
      setProducts(data);
    } catch (err) {
      console.error('Error fetching products:', err);
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
    setStock(100);
    setDescription('');
    setIsActive(true);
    setModalError('');
    setShowModal(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setCategory(p.category);
    setPriceCents(p.price_cents);
    setPriceUnit(p.price_unit);
    setImageUrl(p.image_url);
    setStock(p.stock);
    setDescription(p.description || '');
    setIsActive(p.is_active);
    setModalError('');
    setShowModal(true);
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
      setProducts(products.filter((p) => p.id !== id));
      showSuccessToast('Product deleted successfully');
    } catch (err: any) {
      showErrorAlert('Delete Failed', err.response?.data?.error || err.message || 'Failed deleting product.');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !category || !priceUnit || !imageUrl) {
      setModalError('Please fill in Name, Category, Price Unit, and Image URL.');
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
        image_url: imageUrl,
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
              <option value="Seeds">Seeds</option>
              <option value="Fertilizers">Fertilizers</option>
              <option value="Sprayers">Sprayers</option>
              <option value="Tools">Tools</option>
            </select>
          </div>

          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-lg shadow-emerald-600/25 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </button>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((p) => (
            <div
              key={p.id}
              className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-xl flex flex-col justify-between"
            >
              <div>
                <div className="h-44 bg-slate-900 relative overflow-hidden">
                  <img
                    src={p.image_url}
                    alt={p.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as any).src =
                        'https://images.unsplash.com/photo-1594381256940-7bcf6eb0f6b0?auto=format&fit=crop&w=500&q=60';
                    }}
                  />
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-slate-900/80 border border-slate-700 text-slate-300 text-[11px] font-bold">
                    {p.category}
                  </span>
                </div>

                <div className="p-5">
                  <h4 className="font-extrabold text-white text-base mb-1">{p.name}</h4>
                  <p className="text-xs text-slate-400 line-clamp-2 mb-3">{p.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-black text-emerald-400">{p.price_unit}</span>
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
                    className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(p.id, p.name)}
                    className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add/Edit Product Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-lg p-6 rounded-3xl border border-slate-800 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-extrabold text-white mb-1">
              {editingProduct ? 'Edit Product Listing' : 'Add New Agro Product'}
            </h3>

            {modalError && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center font-semibold">
                {modalError}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Product Name *</label>
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
                    <option value="Seeds">Seeds</option>
                    <option value="Fertilizers">Fertilizers</option>
                    <option value="Sprayers">Sprayers</option>
                    <option value="Tools">Tools</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Price Unit Label *</label>
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

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Image URL *</label>
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
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

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-slate-800 text-slate-300 py-3 rounded-xl font-bold text-xs hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl font-bold text-xs shadow-lg shadow-emerald-600/25 transition-all"
                >
                  {editingProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
