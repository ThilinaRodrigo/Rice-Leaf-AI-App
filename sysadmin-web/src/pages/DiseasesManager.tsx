import React, { useState, useEffect } from 'react';
import { fetchDiseases, createDisease, updateDisease, deleteDisease } from '../api/adminApi';
import type { Disease, DiseaseFactor, DiseaseAction } from '../types/admin';
import { Header } from '../components/Header';
import { showConfirmDialog, showSuccessToast, showErrorAlert } from '../utils/swal';
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  CheckCircle,
  ShieldCheck,
  X,
  Activity,
  PlusCircle,
  Trash,
} from 'lucide-react';

export const DiseasesManager: React.FC = () => {
  const [diseases, setDiseases] = useState<Disease[]>([]);
  const [search, setSearch] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingDisease, setEditingDisease] = useState<Disease | null>(null);

  // Form Fields
  const [classId, setClassId] = useState<number>(0);
  const [key, setKey] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [factors, setFactors] = useState<DiseaseFactor[]>([]);
  const [actions, setActions] = useState<DiseaseAction[]>([]);

  const [modalError, setModalError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadDiseases = async () => {
    try {
      const data = await fetchDiseases();
      // Normalize Factors and Actions if returned as raw JSON or string
      const parsedData = data.map((d) => ({
        ...d,
        factors: typeof d.factors === 'string' ? JSON.parse(d.factors) : d.factors || [],
        actions: typeof d.actions === 'string' ? JSON.parse(d.actions) : d.actions || [],
      }));
      setDiseases(parsedData);
    } catch (err) {
      console.error('Error fetching diseases:', err);
    }
  };

  useEffect(() => {
    loadDiseases();
  }, []);

  const openCreateModal = () => {
    setEditingDisease(null);
    setClassId(diseases.length > 0 ? Math.max(...diseases.map((d) => d.class_id)) + 1 : 0);
    setKey('');
    setName('');
    setCategory('Fungal');
    setDescription('');
    setFactors([
      { label: 'Humidity', value: 'High', color: '#3B82F6', icon: 'Droplet' },
      { label: 'Temp', value: '25-34°C', color: '#F97316', icon: 'Thermometer' },
    ]);
    setActions([{ title: '', subtitle: '' }]);
    setModalError('');
    setShowModal(true);
  };

  const openEditModal = (d: Disease) => {
    setEditingDisease(d);
    setClassId(d.class_id);
    setKey(d.key || '');
    setName(d.name || '');
    setCategory(d.category || '');
    setDescription(d.description || '');
    setFactors(Array.isArray(d.factors) ? [...d.factors] : []);
    setActions(Array.isArray(d.actions) ? [...d.actions] : []);
    setModalError('');
    setShowModal(true);
  };

  const handleDelete = async (classId: number, diseaseName: string) => {
    const confirmed = await showConfirmDialog({
      title: 'Delete Disease Record?',
      text: `Are you sure you want to delete "${diseaseName}" (Class ID: ${classId})? This action cannot be undone.`,
      confirmButtonText: 'Yes, Delete',
      cancelButtonText: 'Cancel',
      icon: 'warning',
    });
    if (!confirmed) return;

    try {
      await deleteDisease(classId);
      setDiseases(diseases.filter((d) => d.class_id !== classId));
      showSuccessToast('Disease record deleted successfully');
    } catch (err: any) {
      showErrorAlert('Delete Failed', err.response?.data?.error || err.message || 'Failed deleting disease record.');
    }
  };

  const handleAddFactor = () => {
    setFactors([...factors, { label: 'Factor', value: 'High', color: '#3B82F6', icon: 'Droplet' }]);
  };

  const handleRemoveFactor = (index: number) => {
    setFactors(factors.filter((_, i) => i !== index));
  };

  const handleFactorChange = (index: number, field: keyof DiseaseFactor, val: string) => {
    const updated = [...factors];
    updated[index] = { ...updated[index], [field]: val };
    setFactors(updated);
  };

  const handleAddAction = () => {
    setActions([...actions, { title: '', subtitle: '' }]);
  };

  const handleRemoveAction = (index: number) => {
    setActions(actions.filter((_, i) => i !== index));
  };

  const handleActionChange = (index: number, field: keyof DiseaseAction, val: string) => {
    const updated = [...actions];
    updated[index] = { ...updated[index], [field]: val };
    setActions(updated);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !category || !description) {
      setModalError('Please fill in Disease Name, Category, and Description.');
      return;
    }

    const actionText = editingDisease ? 'update this disease record' : 'create a new disease record';
    const confirmed = await showConfirmDialog({
      title: editingDisease ? 'Save Changes?' : 'Create Disease Record?',
      text: `Are you sure you want to ${actionText} with Class ID (ML Index) ${classId}?`,
      confirmButtonText: editingDisease ? 'Yes, Save Changes' : 'Yes, Create Record',
      cancelButtonText: 'Cancel',
      icon: 'question',
    });
    if (!confirmed) return;

    setModalError('');
    setSubmitting(true);
    try {
      const payload: Partial<Disease> = {
        class_id: Number(classId),
        key: key || name.toLowerCase().replace(/[^a-z0-9]+/g, '_'),
        name,
        category,
        description,
        factors,
        actions,
      };

      if (editingDisease) {
        await updateDisease(editingDisease.class_id, payload);
      } else {
        await createDisease(payload);
      }

      setShowModal(false);
      loadDiseases();
      showSuccessToast(editingDisease ? 'Disease record updated successfully' : 'Disease record created successfully');
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || 'Error saving disease data';
      setModalError(msg);
      showErrorAlert('Save Failed', msg);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredDiseases = diseases.filter(
    (d) =>
      d.name?.toLowerCase().includes(search.toLowerCase()) ||
      d.category?.toLowerCase().includes(search.toLowerCase()) ||
      d.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 overflow-y-auto">
      <Header
        title="Disease & Remedy Knowledge Base"
        subtitle="Manage Department of Agriculture (DOA) diagnostic records, environmental factors, and recommended remedies"
        onRefresh={loadDiseases}
      />

      <div className="p-8 space-y-6">
        {/* Top Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 glass-panel p-4 rounded-2xl border border-slate-800">
          <div className="relative flex-1 sm:w-80">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search disease name, pathogen, or remedy..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-lg shadow-emerald-600/25 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Disease</span>
          </button>
        </div>

        {/* Diseases Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredDiseases.map((d) => (
            <div
              key={d.class_id}
              className="glass-panel rounded-2xl border border-slate-800 p-6 shadow-xl space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-black">
                      {d.class_id}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-white text-lg">{d.name}</h3>
                      <p className="text-xs text-emerald-400 font-semibold">{d.category}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditModal(d)}
                      className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                      title="Edit Disease Guidelines"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(d.class_id, d.name)}
                      className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-colors"
                      title="Delete Disease Record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="text-sm text-slate-300 leading-relaxed bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                  {d.description}
                </p>

                {/* Environmental Factors Badge List */}
                {Array.isArray(d.factors) && d.factors.length > 0 && (
                  <div>
                    <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                      <Activity className="w-3.5 h-3.5 text-blue-400" />
                      <span>Environmental Factors</span>
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {d.factors.map((f, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs font-semibold"
                        >
                          <span className="text-slate-400">{f.label}:</span>
                          <span style={{ color: f.color || '#4ade80' }}>{f.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommended Actions */}
                {Array.isArray(d.actions) && d.actions.length > 0 && (
                  <div>
                    <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>DOA Recommended Actions & Remedies</span>
                    </h4>
                    <ul className="space-y-2">
                      {d.actions.map((act, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                          <div>
                            <span className="font-bold text-white">{act.title}</span>
                            {act.subtitle && (
                              <span className="text-slate-400 block mt-0.5">{act.subtitle}</span>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add / Edit Disease Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-2xl p-6 rounded-3xl border border-slate-800 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-extrabold text-white mb-1">
              {editingDisease ? 'Edit Disease Record' : 'Add New Disease Knowledge Record'}
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Configure classification ID, pathogen details, environmental triggers, and recommended remedies.
            </p>

            {modalError && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center font-semibold">
                {modalError}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                    Class ID (ML Index) *
                  </label>
                  <input
                    type="number"
                    value={classId}
                    onChange={(e) => setClassId(Number(e.target.value))}
                    placeholder="0"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                  <p className="text-[10px] text-emerald-400 mt-1">ML Model output index (editable)</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                    Disease Key (Identifier)
                  </label>
                  <input
                    type="text"
                    value={key}
                    onChange={(e) => setKey(e.target.value)}
                    placeholder="bacterial_leaf_blight"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                  Disease Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Bacterial Leaf Blight (BLB)"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                  Category / Pathogen *
                </label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="Bacterial (Xanthomonas oryzae)"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">
                  Description *
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="One of the most destructive diseases in Sri Lanka..."
                  rows={3}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Environmental Factors Builder */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-400 uppercase">
                    Environmental Factors
                  </label>
                  <button
                    type="button"
                    onClick={handleAddFactor}
                    className="flex items-center gap-1 text-xs text-emerald-400 font-bold hover:underline"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Add Factor</span>
                  </button>
                </div>

                {factors.map((fac, idx) => (
                  <div key={idx} className="flex gap-2 items-center bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                    <input
                      type="text"
                      placeholder="Label (e.g. Temp)"
                      value={fac.label}
                      onChange={(e) => handleFactorChange(idx, 'label', e.target.value)}
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white"
                    />
                    <input
                      type="text"
                      placeholder="Value (e.g. 25-34°C)"
                      value={fac.value}
                      onChange={(e) => handleFactorChange(idx, 'value', e.target.value)}
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveFactor(idx)}
                      className="p-1.5 text-red-400 hover:text-red-300"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* DOA Actions / Remedies Builder */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-400 uppercase">
                    DOA Recommended Actions & Remedies
                  </label>
                  <button
                    type="button"
                    onClick={handleAddAction}
                    className="flex items-center gap-1 text-xs text-emerald-400 font-bold hover:underline"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Add Remedy Action</span>
                  </button>
                </div>

                {actions.map((act, idx) => (
                  <div key={idx} className="space-y-2 bg-slate-900/60 p-3 rounded-xl border border-slate-800 relative">
                    <button
                      type="button"
                      onClick={() => handleRemoveAction(idx)}
                      className="absolute top-3 right-3 text-red-400 hover:text-red-300"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                    <input
                      type="text"
                      placeholder="Action Title (e.g. Apply Potassium Fertilizer)"
                      value={act.title}
                      onChange={(e) => handleActionChange(idx, 'title', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white font-bold"
                    />
                    <input
                      type="text"
                      placeholder="Details / Subtitle (e.g. Helps manage further spread)"
                      value={act.subtitle}
                      onChange={(e) => handleActionChange(idx, 'subtitle', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-slate-300"
                    />
                  </div>
                ))}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-slate-800 text-slate-300 py-3 rounded-xl font-bold text-xs hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl font-bold text-xs shadow-lg shadow-emerald-600/25 transition-all"
                >
                  {submitting ? 'Saving...' : editingDisease ? 'Save Changes' : 'Create Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
