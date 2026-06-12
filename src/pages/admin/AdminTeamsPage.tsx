import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FiPlus, FiEdit2, FiTrash2, FiUpload } from 'react-icons/fi';
import { teamsApi, uploadApi } from '../../services/api';
import { Loader } from '../../components/ui/Loader';
import { Team } from '../../types';
import toast from 'react-hot-toast';

const emptyForm = { name: '', slug: '', logo: '', country: '', sport: 'Football' };

export default function AdminTeamsPage() {
  const qc = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Team | null>(null);
  const [form, setForm] = useState<any>(emptyForm);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState('');

  const { data: teams } = useQuery<Team[]>({
    queryKey: ['teams', search],
    queryFn: () => teamsApi.getAll(search || undefined).then((r) => r.data),
  });

  const saveMutation = useMutation({
    mutationFn: (data: any) => editing ? teamsApi.update(editing.id, data) : teamsApi.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['teams'] }); toast.success('Saved'); setModalOpen(false); setEditing(null); setForm(emptyForm); },
    onError: () => toast.error('Failed to save'),
  });

  const deleteMutation = useMutation({
    mutationFn: teamsApi.remove,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['teams'] }); toast.success('Deleted'); },
  });

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading(true);
    try { const res = await uploadApi.image(file); setForm((f: any) => ({ ...f, logo: res.data.url })); }
    catch { toast.error('Upload failed'); } finally { setUploading(false); }
  };

  const isBusy = saveMutation.isPending || deleteMutation.isPending;

  return (
    <div className="space-y-5">
      {isBusy && <Loader fullscreen text={deleteMutation.isPending ? 'Deleting...' : 'Saving...'} />}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-display font-bold text-dark-900">Teams</h2>
        <button onClick={() => { setEditing(null); setForm(emptyForm); setModalOpen(true); }} className="btn-primary text-sm gap-2">
          <FiPlus className="w-4 h-4" /> New Team
        </button>
      </div>
      <div className="flex gap-3">
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search teams..." className="border border-dark-300 rounded-lg px-3 py-2 text-sm w-64" />
      </div>
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-dark-50 border-b border-dark-200">
              <tr>{['Logo', 'Name', 'Country', 'Sport', 'Actions'].map((h) => (
                <th key={h} className="text-left px-4 py-3 font-semibold text-dark-600 text-xs uppercase tracking-wide">{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {(teams || []).map((t) => (
                <tr key={t.id} className="border-b border-dark-100 hover:bg-dark-50">
                  <td className="px-4 py-3">
                    {t.logo
                      ? <img src={t.logo.startsWith('http') ? t.logo : `http://localhost:3001${t.logo}`} alt={t.name} className="w-9 h-9 rounded-full object-contain border border-dark-200" />
                      : <div className="w-9 h-9 rounded-full bg-dark-100 flex items-center justify-center text-xs font-bold text-dark-400">{t.name.slice(0,2)}</div>
                    }
                  </td>
                  <td className="px-4 py-3 font-medium text-dark-800">{t.name}</td>
                  <td className="px-4 py-3 text-dark-500">{t.country || '—'}</td>
                  <td className="px-4 py-3 text-dark-500">{t.sport}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => { setEditing(t); setForm({ ...t }); setModalOpen(true); }} className="p-1.5 text-dark-400 hover:text-brand-600 rounded"><FiEdit2 className="w-4 h-4" /></button>
                      <button onClick={() => { if (window.confirm('Delete team?')) deleteMutation.mutate(t.id); }} className="p-1.5 text-dark-400 hover:text-red-500 rounded"><FiTrash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {(!teams || teams.length === 0) && <tr><td colSpan={5} className="text-center py-10 text-dark-400">No teams yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-5 border-b border-dark-200 flex items-center justify-between">
              <h3 className="font-display font-bold text-dark-900">{editing ? 'Edit Team' : 'New Team'}</h3>
              <button onClick={() => setModalOpen(false)} className="p-1.5 hover:bg-dark-100 rounded-lg">✕</button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(form); }} className="p-5 space-y-4">
              {[{ key: 'name', label: 'Team Name *', required: true }, { key: 'slug', label: 'Slug *', required: true }, { key: 'country', label: 'Country' }].map(({ key, label, required }) => (
                <div key={key}>
                  <label className="block text-xs font-semibold text-dark-600 mb-1">{label}</label>
                  <input required={required} value={form[key] || ''} onChange={(e) => setForm((f: any) => ({ ...f, [key]: e.target.value }))} className="w-full border border-dark-300 rounded-lg px-3 py-2 text-sm" />
                </div>
              ))}
              <div>
                <label className="block text-xs font-semibold text-dark-600 mb-1">Logo</label>
                <div className="flex gap-2">
                  <input value={form.logo || ''} onChange={(e) => setForm((f: any) => ({ ...f, logo: e.target.value }))} placeholder="URL or upload" className="flex-1 border border-dark-300 rounded-lg px-3 py-2 text-sm" />
                  <label className="btn-ghost text-xs cursor-pointer flex items-center gap-1">
                    <FiUpload className="w-3.5 h-3.5" />{uploading ? '…' : 'Upload'}
                    <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                  </label>
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
