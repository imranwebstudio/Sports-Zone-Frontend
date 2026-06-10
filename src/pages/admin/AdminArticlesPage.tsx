import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FiPlus, FiEdit2, FiTrash2, FiEye, FiUpload } from 'react-icons/fi';
import { articlesApi, categoriesApi, uploadApi } from '../../services/api';
import { Article, Category } from '../../types';
import { formatDate } from '../../utils';
import toast from 'react-hot-toast';

const emptyForm = {
  title: '', slug: '', excerpt: '', content: '',
  featuredImage: '', categoryId: '', status: 'DRAFT',
  isBreaking: false, isTrending: false, isFeatured: false,
  readTime: 5, tags: '', metaTitle: '', metaDescription: '',
};

export default function AdminArticlesPage() {
  const qc = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Article | null>(null);
  const [form, setForm] = useState<any>(emptyForm);
  const [uploading, setUploading] = useState(false);

  const { data: articleData } = useQuery({
    queryKey: ['admin-articles'],
    queryFn: () => articlesApi.getAllAdmin({ limit: 100 }).then((r) => r.data),
  });
  const { data: categories } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.getAll().then((r) => r.data),
  });

  const saveMutation = useMutation({
    mutationFn: (data: any) => editing
      ? articlesApi.update(editing.id, data)
      : articlesApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-articles'] });
      toast.success(editing ? 'Article updated' : 'Article created');
      setModalOpen(false);
      setEditing(null);
      setForm(emptyForm);
    },
    onError: () => toast.error('Failed to save article'),
  });

  const deleteMutation = useMutation({
    mutationFn: articlesApi.remove,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-articles'] }); toast.success('Article deleted'); },
  });

  const openNew = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (a: Article) => {
    setEditing(a);
    setForm({
      ...a,
      categoryId: a.category.id,
      tags: (a.tags || []).join(', '),
    });
    setModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await uploadApi.image(file);
      setForm((f: any) => ({ ...f, featuredImage: res.data.url }));
      toast.success('Image uploaded');
    } catch { toast.error('Upload failed'); }
    finally { setUploading(false); }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate({
      ...form,
      tags: form.tags ? form.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [],
    });
  };

  const articles: Article[] = articleData?.items || [];

  const statusBadge = (s: string) => {
    const map: Record<string, string> = {
      PUBLISHED: 'bg-brand-100 text-brand-700',
      DRAFT: 'bg-yellow-100 text-yellow-700',
      SCHEDULED: 'bg-blue-100 text-blue-700',
      ARCHIVED: 'bg-dark-100 text-dark-500',
    };
    return <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${map[s] || ''}`}>{s}</span>;
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-display font-bold text-dark-900">Articles</h2>
        <button onClick={openNew} className="btn-primary text-sm gap-2">
          <FiPlus className="w-4 h-4" /> New Article
        </button>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-dark-50 border-b border-dark-200">
              <tr>
                {['Title', 'Category', 'Status', 'Views', 'Published', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 font-semibold text-dark-600 text-xs uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {articles.map((a) => (
                <tr key={a.id} className="border-b border-dark-100 hover:bg-dark-50">
                  <td className="px-4 py-3 max-w-xs">
                    <p className="font-medium text-dark-800 line-clamp-1">{a.title}</p>
                    <div className="flex gap-1 mt-0.5">
                      {a.isBreaking && <span className="text-xs bg-red-100 text-red-600 px-1.5 rounded">Breaking</span>}
                      {a.isTrending && <span className="text-xs bg-orange-100 text-orange-600 px-1.5 rounded">Trending</span>}
                      {a.isFeatured && <span className="text-xs bg-purple-100 text-purple-600 px-1.5 rounded">Featured</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-dark-500">{a.category?.name}</td>
                  <td className="px-4 py-3">{statusBadge(a.status)}</td>
                  <td className="px-4 py-3 text-dark-500">{a.viewCount.toLocaleString()}</td>
                  <td className="px-4 py-3 text-dark-400 text-xs whitespace-nowrap">
                    {a.publishedAt ? formatDate(a.publishedAt) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <a href={`/news/${a.slug}`} target="_blank" rel="noreferrer" className="p-1.5 text-dark-400 hover:text-dark-700 rounded">
                        <FiEye className="w-4 h-4" />
                      </a>
                      <button onClick={() => openEdit(a)} className="p-1.5 text-dark-400 hover:text-brand-600 rounded">
                        <FiEdit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => { if (window.confirm('Delete this article?')) deleteMutation.mutate(a.id); }}
                        className="p-1.5 text-dark-400 hover:text-red-500 rounded"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {articles.length === 0 && (
                <tr><td colSpan={6} className="text-center py-10 text-dark-400">No articles yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-dark-200 flex items-center justify-between">
              <h3 className="text-lg font-display font-bold">{editing ? 'Edit Article' : 'New Article'}</h3>
              <button onClick={() => { setModalOpen(false); setEditing(null); }} className="p-2 hover:bg-dark-100 rounded-lg">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-dark-600 mb-1">Title *</label>
                  <input required value={form.title} onChange={(e) => setForm((f: any) => ({ ...f, title: e.target.value }))}
                    className="w-full border border-dark-300 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-dark-600 mb-1">Slug *</label>
                  <input required value={form.slug} onChange={(e) => setForm((f: any) => ({ ...f, slug: e.target.value }))}
                    className="w-full border border-dark-300 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-dark-600 mb-1">Category *</label>
                  <select required value={form.categoryId} onChange={(e) => setForm((f: any) => ({ ...f, categoryId: e.target.value }))}
                    className="w-full border border-dark-300 rounded-lg px-3 py-2 text-sm">
                    <option value="">Select category</option>
                    {categories?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-dark-600 mb-1">Excerpt</label>
                  <textarea rows={2} value={form.excerpt} onChange={(e) => setForm((f: any) => ({ ...f, excerpt: e.target.value }))}
                    className="w-full border border-dark-300 rounded-lg px-3 py-2 text-sm resize-none" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-dark-600 mb-1">Content * (HTML supported)</label>
                  <textarea required rows={10} value={form.content}
                    onChange={(e) => setForm((f: any) => ({ ...f, content: e.target.value }))}
                    className="w-full border border-dark-300 rounded-lg px-3 py-2 text-sm font-mono resize-y" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-dark-600 mb-1">Featured Image</label>
                  <div className="flex gap-2">
                    <input value={form.featuredImage} onChange={(e) => setForm((f: any) => ({ ...f, featuredImage: e.target.value }))}
                      placeholder="URL or upload" className="flex-1 border border-dark-300 rounded-lg px-3 py-2 text-sm" />
                    <label className="btn-ghost text-xs cursor-pointer flex items-center gap-1">
                      <FiUpload className="w-3.5 h-3.5" />
                      {uploading ? 'Uploading…' : 'Upload'}
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-dark-600 mb-1">Status</label>
                  <select value={form.status} onChange={(e) => setForm((f: any) => ({ ...f, status: e.target.value }))}
                    className="w-full border border-dark-300 rounded-lg px-3 py-2 text-sm">
                    {['DRAFT', 'PUBLISHED', 'SCHEDULED', 'ARCHIVED'].map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-dark-600 mb-1">Tags (comma-separated)</label>
                  <input value={form.tags} onChange={(e) => setForm((f: any) => ({ ...f, tags: e.target.value }))}
                    placeholder="football, world cup, messi" className="w-full border border-dark-300 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-dark-600 mb-1">Read Time (min)</label>
                  <input type="number" min="1" value={form.readTime} onChange={(e) => setForm((f: any) => ({ ...f, readTime: parseInt(e.target.value) }))}
                    className="w-full border border-dark-300 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div className="col-span-2 flex items-center gap-6">
                  {[
                    { key: 'isBreaking', label: 'Breaking News' },
                    { key: 'isTrending', label: 'Trending' },
                    { key: 'isFeatured', label: 'Featured' },
                  ].map(({ key, label }) => (
                    <label key={key} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={form[key]} onChange={(e) => setForm((f: any) => ({ ...f, [key]: e.target.checked }))} className="rounded" />
                      <span className="text-sm font-medium text-dark-700">{label}</span>
                    </label>
                  ))}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-dark-600 mb-1">Meta Title</label>
                  <input value={form.metaTitle} onChange={(e) => setForm((f: any) => ({ ...f, metaTitle: e.target.value }))}
                    className="w-full border border-dark-300 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-dark-600 mb-1">Meta Description</label>
                  <input value={form.metaDescription} onChange={(e) => setForm((f: any) => ({ ...f, metaDescription: e.target.value }))}
                    className="w-full border border-dark-300 rounded-lg px-3 py-2 text-sm" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => { setModalOpen(false); setEditing(null); }} className="btn-ghost">Cancel</button>
                <button type="submit" disabled={saveMutation.isPending} className="btn-primary">
                  {saveMutation.isPending ? 'Saving…' : editing ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
