import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FiPlus, FiEdit2, FiTrash2, FiUpload, FiToggleLeft, FiToggleRight } from 'react-icons/fi';
import { tournamentsApi, uploadApi } from '../../services/api';
import toast from 'react-hot-toast';

interface Tournament {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  country?: string;
  sport: string;
  sortOrder: number;
  isActive: boolean;
  _count?: { matches: number };
}

const emptyForm = { name: '', slug: '', logo: '', country: '', sport: 'Football', sortOrder: 0 };

export default function AdminTournamentsPage() {
  const qc = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Tournament | null>(null);
  const [form, setForm] = useState<any>(emptyForm);
  const [uploading, setUploading] = useState(false);

  const { data: tournaments } = useQuery<Tournament[]>({
    queryKey: ['tournaments-admin'],
    queryFn: () => tournamentsApi.getAll().then((r) => r.data),
  });

  const saveMutation = useMutation({
    mutationFn: (data: any) =>
      editing ? tournamentsApi.update(editing.id, data) : tournamentsApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tournaments-admin'] });
      toast.success('Saved');
      setModalOpen(false);
      setEditing(null);
      setForm(emptyForm);
    },
    onError: () => toast.error('Failed to save'),
  });

  const toggleMutation = useMutation({
    mutationFn: (t: Tournament) => tournamentsApi.update(t.id, { isActive: !t.isActive }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tournaments-admin'] }),
    onError: () => toast.error('Failed to update'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => tournamentsApi.remove(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['tournaments-admin'] }); toast.success('Deleted'); },
    onError: () => toast.error('Failed to delete'),
  });

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading(true);
    try { const res = await uploadApi.image(file); setForm((f: any) => ({ ...f, logo: res.data.url })); }
    catch { toast.error('Upload failed'); } finally { setUploading(false); }
  };

  const openNew = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (t: Tournament) => { setEditing(t); setForm({ name: t.name, slug: t.slug, logo: t.logo || '', country: t.country || '', sport: t.sport, sortOrder: t.sortOrder }); setModalOpen(true); };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-display font-bold text-dark-900">Tournaments</h2>
        <button onClick={openNew} className="btn-primary text-sm gap-2">
          <FiPlus className="w-4 h-4" /> New Tournament
        </button>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-dark-50 border-b border-dark-200">
              <tr>
                {['Logo', 'Name', 'Country', 'Sport', 'Order', 'Matches', 'Active', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 font-semibold text-dark-600 text-xs uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(tournaments || []).map((t) => (
                <tr key={t.id} className="border-b border-dark-100 hover:bg-dark-50">
                  <td className="px-4 py-3">
                    {t.logo
                      ? <img src={t.logo} alt={t.name} className="w-9 h-9 rounded object-contain border border-dark-200 bg-white p-0.5" />
                      : <div className="w-9 h-9 rounded bg-dark-100 flex items-center justify-center text-xs font-bold text-dark-400">{t.name.slice(0, 2)}</div>
                    }
                  </td>
                  <td className="px-4 py-3 font-medium text-dark-800">{t.name}</td>
                  <td className="px-4 py-3 text-dark-500">{t.country || '—'}</td>
                  <td className="px-4 py-3 text-dark-500">{t.sport}</td>
                  <td className="px-4 py-3 text-dark-500">{t.sortOrder}</td>
                  <td className="px-4 py-3 text-dark-500">{t._count?.matches ?? 0}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleMutation.mutate(t)} className="text-dark-400 hover:text-brand-600">
                      {t.isActive
                        ? <FiToggleRight className="w-6 h-6 text-brand-600" />
                        : <FiToggleLeft className="w-6 h-6" />}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(t)} className="p-1.5 text-dark-400 hover:text-brand-600 rounded">
                        <FiEdit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => { if (window.confirm('Delete tournament? This will fail if matches are linked.')) deleteMutation.mutate(t.id); }}
                        className="p-1.5 text-dark-400 hover:text-red-500 rounded"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {(!tournaments || tournaments.length === 0) && (
                <tr><td colSpan={8} className="text-center py-10 text-dark-400">No tournaments yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-5 border-b border-dark-200 flex items-center justify-between">
              <h3 className="font-display font-bold text-dark-900">{editing ? 'Edit Tournament' : 'New Tournament'}</h3>
              <button onClick={() => setModalOpen(false)} className="p-1.5 hover:bg-dark-100 rounded-lg">✕</button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(form); }} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-dark-600 mb-1">Tournament Name *</label>
                  <input required value={form.name} onChange={(e) => setForm((f: any) => ({ ...f, name: e.target.value }))}
                    className="w-full border border-dark-300 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-dark-600 mb-1">Slug *</label>
                  <input required value={form.slug} onChange={(e) => setForm((f: any) => ({ ...f, slug: e.target.value }))}
                    className="w-full border border-dark-300 rounded-lg px-3 py-2 text-sm" placeholder="premier-league" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-dark-600 mb-1">Country</label>
                  <input value={form.country} onChange={(e) => setForm((f: any) => ({ ...f, country: e.target.value }))}
                    className="w-full border border-dark-300 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-dark-600 mb-1">Sport</label>
                  <input value={form.sport} onChange={(e) => setForm((f: any) => ({ ...f, sport: e.target.value }))}
                    className="w-full border border-dark-300 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-dark-600 mb-1">Logo</label>
                  <div className="flex gap-2">
                    <input value={form.logo} onChange={(e) => setForm((f: any) => ({ ...f, logo: e.target.value }))}
                      placeholder="URL or upload" className="flex-1 border border-dark-300 rounded-lg px-3 py-2 text-sm" />
                    <label className="btn-ghost text-xs cursor-pointer flex items-center gap-1">
                      <FiUpload className="w-3.5 h-3.5" />{uploading ? '…' : 'Upload'}
                      <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                    </label>
                  </div>
                  {form.logo && <img src={form.logo} alt="preview" className="mt-2 h-10 object-contain" />}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-dark-600 mb-1">Sort Order</label>
                  <input type="number" value={form.sortOrder}
                    onChange={(e) => setForm((f: any) => ({ ...f, sortOrder: Number(e.target.value) }))}
                    className="w-full border border-dark-300 rounded-lg px-3 py-2 text-sm" />
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setModalOpen(false)} className="btn-ghost text-sm">Cancel</button>
                <button type="submit" disabled={saveMutation.isPending} className="btn-primary text-sm">
                  {saveMutation.isPending ? 'Saving…' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
