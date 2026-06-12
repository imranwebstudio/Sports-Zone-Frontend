import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { categoriesApi } from '../../services/api';
import { Loader } from '../../components/ui/Loader';
import toast from 'react-hot-toast';

const DEFAULT_CATEGORIES = [
  { name: 'Football', slug: 'football', color: '#16a34a' },
  { name: 'Cricket', slug: 'cricket', color: '#0284c7' },
  { name: 'Basketball', slug: 'basketball', color: '#ea580c' },
  { name: 'Tennis', slug: 'tennis', color: '#7c3aed' },
  { name: 'Formula 1', slug: 'formula-1', color: '#dc2626' },
  { name: 'World Cup', slug: 'world-cup', color: '#d97706' },
  { name: 'Transfers', slug: 'transfers', color: '#0891b2' },
  { name: 'International Football', slug: 'international-football', color: '#059669' },
  { name: 'Club Football', slug: 'club-football', color: '#2563eb' },
];

const emptyForm = { name: '', slug: '', description: '', color: '#16a34a', sortOrder: 0 };

export default function AdminCategoriesPage() {
  const qc = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<any>(emptyForm);

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.getAll().then((r) => r.data),
  });

  const saveMutation = useMutation({
    mutationFn: (data: any) => editing ? categoriesApi.update(editing.id, data) : categoriesApi.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['categories'] }); toast.success('Saved'); setModalOpen(false); setEditing(null); setForm(emptyForm); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: categoriesApi.remove,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['categories'] }); toast.success('Deleted'); },
  });

  const seedDefaults = async () => {
    for (const cat of DEFAULT_CATEGORIES) {
      try { await categoriesApi.create(cat); } catch { /* already exists */ }
    }
    qc.invalidateQueries({ queryKey: ['categories'] });
    toast.success('Default categories seeded');
  };

  const isBusy = saveMutation.isPending || deleteMutation.isPending;

  return (
    <div className="space-y-5">
      {isBusy && <Loader fullscreen text={deleteMutation.isPending ? 'Deleting...' : 'Saving...'} />}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-xl font-display font-bold text-dark-900">Categories</h2>
        <div className="flex gap-2">
          <button onClick={seedDefaults} className="btn-ghost text-sm">Seed Defaults</button>
          <button onClick={() => { setEditing(null); setForm(emptyForm); setModalOpen(true); }} className="btn-primary text-sm gap-2">
            <FiPlus className="w-4 h-4" /> New Category
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {(categories || []).map((c: any) => (
          <div key={c.id} className="card p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full" style={{ background: c.color || '#16a34a' }} />
              <div>
                <p className="font-semibold text-dark-800">{c.name}</p>
                <p className="text-xs text-dark-400">{c._count?.articles || 0} articles · /{c.slug}</p>
              </div>
            </div>
            <div className="flex gap-1">
              <button onClick={() => { setEditing(c); setForm({ ...c }); setModalOpen(true); }} className="p-1.5 text-dark-400 hover:text-brand-600 rounded"><FiEdit2 className="w-4 h-4" /></button>
              <button onClick={() => { if (window.confirm('Delete category?')) deleteMutation.mutate(c.id); }} className="p-1.5 text-dark-400 hover:text-red-500 rounded"><FiTrash2 className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
        {(!categories || categories.length === 0) && (
          <div className="col-span-3 card p-10 text-center text-dark-400">
            <p>No categories yet. Click "Seed Defaults" to add the standard sports categories.</p>
          </div>
        )}
      </div>
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-5 border-b border-dark-200 flex items-center justify-between">
              <h3 className="font-display font-bold">{editing ? 'Edit Category' : 'New Category'}</h3>
              <button onClick={() => setModalOpen(false)} className="p-1.5 hover:bg-dark-100 rounded-lg">✕</button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(form); }} className="p-5 space-y-4">
              {[{ key: 'name', label: 'Name *', required: true }, { key: 'slug', label: 'Slug *', required: true }, { key: 'description', label: 'Description' }].map(({ key, label, required }) => (
                <div key={key}>
                  <label className="block text-xs font-semibold text-dark-600 mb-1">{label}</label>
                  <input required={required} value={form[key] || ''} onChange={(e) => setForm((f: any) => ({ ...f, [key]: e.target.value }))} className="w-full border border-dark-300 rounded-lg px-3 py-2 text-sm" />
                </div>
              ))}
              <div>
                <label className="block text-xs font-semibold text-dark-600 mb-1">Accent Color</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={form.color || '#16a34a'} onChange={(e) => setForm((f: any) => ({ ...f, color: e.target.value }))} className="w-12 h-9 rounded cursor-pointer border border-dark-300" />
                  <input value={form.color || ''} onChange={(e) => setForm((f: any) => ({ ...f, color: e.target.value }))} className="flex-1 border border-dark-300 rounded-lg px-3 py-2 text-sm" />
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setModalOpen(false)} className="btn-ghost text-sm">Cancel</button>
                <button type="submit" disabled={saveMutation.isPending} className="btn-primary text-sm">
                  {saveMutation.isPending ? '…' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
