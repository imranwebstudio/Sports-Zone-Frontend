import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FiPlus, FiTrash2, FiToggleLeft, FiToggleRight } from 'react-icons/fi';
import { adsApi } from '../../services/api';
import toast from 'react-hot-toast';

const AD_SLOTS = [
  'HEADER_BANNER', 'LEFT_SIDEBAR_TOP', 'LEFT_SIDEBAR_BOTTOM',
  'RIGHT_SIDEBAR_TOP', 'RIGHT_SIDEBAR_BOTTOM', 'IN_ARTICLE_1',
  'IN_ARTICLE_2', 'BETWEEN_CONTENT', 'FOOTER_BANNER',
  'STICKY_MOBILE', 'MATCH_PAGE_TOP', 'MATCH_PAGE_BOTTOM', 'NATIVE_RECOMMENDATION',
];
const AD_NETWORKS = ['ADSENSE', 'EZOIC', 'MEDIA_NET', 'MONETAG', 'CUSTOM'];

const emptyForm = { name: '', slot: 'HEADER_BANNER', network: 'ADSENSE', code: '', position: 0, page: '' };

export default function AdminAdsPage() {
  const qc = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<any>(emptyForm);

  const { data: ads } = useQuery({
    queryKey: ['admin-ads'],
    queryFn: () => adsApi.getAll().then((r) => r.data),
  });

  const createMutation = useMutation({
    mutationFn: adsApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-ads'] });
      toast.success('Ad created');
      setModalOpen(false);
      setForm(emptyForm);
    },
    onError: () => toast.error('Failed to create ad'),
  });

  const toggleMutation = useMutation({
    mutationFn: adsApi.toggle,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-ads'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: adsApi.remove,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-ads'] }); toast.success('Ad deleted'); },
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-display font-bold text-dark-900">Advertisement Manager</h2>
          <p className="text-sm text-dark-500 mt-0.5">Manage ad slots for Google AdSense, Ezoic, Media.net, or custom HTML.</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn-primary text-sm gap-2">
          <FiPlus className="w-4 h-4" /> New Ad Slot
        </button>
      </div>

      {/* Integration Guide */}
      <div className="card p-5 bg-brand-50 border-brand-200">
        <h3 className="font-semibold text-brand-800 mb-2">Ad Network Integration Guide</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-brand-700">
          <div>
            <p className="font-medium mb-1">Google AdSense</p>
            <p className="text-xs">Paste the <code>&lt;script&gt;</code> + <code>&lt;ins&gt;</code> code from your AdSense dashboard into the "Ad Code" field.</p>
          </div>
          <div>
            <p className="font-medium mb-1">Ezoic</p>
            <p className="text-xs">Use Ezoic's placeholder code for your ad unit IDs. Select network "Ezoic".</p>
          </div>
          <div>
            <p className="font-medium mb-1">Media.net</p>
            <p className="text-xs">Copy the Media.net ad script and paste in the code field. Select network "Media.net".</p>
          </div>
        </div>
      </div>

      {/* Ad table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-dark-50 border-b border-dark-200">
              <tr>
                {['Name', 'Slot', 'Network', 'Position', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 font-semibold text-dark-600 text-xs uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(ads || []).map((ad: any) => (
                <tr key={ad.id} className="border-b border-dark-100 hover:bg-dark-50">
                  <td className="px-4 py-3 font-medium text-dark-800">{ad.name}</td>
                  <td className="px-4 py-3 text-xs text-dark-500 font-mono">{ad.slot}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs bg-dark-100 text-dark-600 px-2 py-0.5 rounded">{ad.network}</span>
                  </td>
                  <td className="px-4 py-3 text-dark-500">{ad.position}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleMutation.mutate(ad.id)} className="flex items-center gap-1 text-sm">
                      {ad.isActive ? (
                        <><FiToggleRight className="w-5 h-5 text-brand-500" /><span className="text-brand-600">Active</span></>
                      ) : (
                        <><FiToggleLeft className="w-5 h-5 text-dark-400" /><span className="text-dark-400">Inactive</span></>
                      )}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => { if (window.confirm('Delete this ad slot?')) deleteMutation.mutate(ad.id); }}
                      className="p-1.5 text-dark-400 hover:text-red-500 rounded"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {(!ads || ads.length === 0) && (
                <tr><td colSpan={6} className="text-center py-10 text-dark-400">No ad slots configured yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-dark-200 flex items-center justify-between">
              <h3 className="text-lg font-display font-bold">New Ad Slot</h3>
              <button onClick={() => { setModalOpen(false); setForm(emptyForm); }} className="p-2 hover:bg-dark-100 rounded-lg">✕</button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(form); }} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-dark-600 mb-1">Name *</label>
                <input required value={form.name} onChange={(e) => setForm((f: any) => ({ ...f, name: e.target.value }))}
                  placeholder="e.g., Header Banner - AdSense" className="w-full border border-dark-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-dark-600 mb-1">Slot Position *</label>
                  <select required value={form.slot} onChange={(e) => setForm((f: any) => ({ ...f, slot: e.target.value }))}
                    className="w-full border border-dark-300 rounded-lg px-3 py-2 text-sm">
                    {AD_SLOTS.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-dark-600 mb-1">Network</label>
                  <select value={form.network} onChange={(e) => setForm((f: any) => ({ ...f, network: e.target.value }))}
                    className="w-full border border-dark-300 rounded-lg px-3 py-2 text-sm">
                    {AD_NETWORKS.map((n) => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-dark-600 mb-1">Ad Code * (HTML/Script)</label>
                <textarea required rows={8} value={form.code}
                  onChange={(e) => setForm((f: any) => ({ ...f, code: e.target.value }))}
                  placeholder={'<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js">\n</script>\n<ins class="adsbygoogle" ...></ins>'}
                  className="w-full border border-dark-300 rounded-lg px-3 py-2 text-sm font-mono resize-y" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-dark-600 mb-1">Priority (lower = higher priority)</label>
                  <input type="number" value={form.position} onChange={(e) => setForm((f: any) => ({ ...f, position: parseInt(e.target.value) }))}
                    className="w-full border border-dark-300 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-dark-600 mb-1">Page (leave blank for all)</label>
                  <input value={form.page} onChange={(e) => setForm((f: any) => ({ ...f, page: e.target.value }))}
                    placeholder="e.g., match, article" className="w-full border border-dark-300 rounded-lg px-3 py-2 text-sm" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => { setModalOpen(false); setForm(emptyForm); }} className="btn-ghost">Cancel</button>
                <button type="submit" disabled={createMutation.isPending} className="btn-primary">
                  {createMutation.isPending ? 'Saving…' : 'Create Ad Slot'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
