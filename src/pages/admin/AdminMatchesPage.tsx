import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FiPlus, FiEdit2, FiTrash2, FiWifi, FiEye, FiChevronDown, FiLink, FiSearch, FiX } from 'react-icons/fi';
import dayjs from 'dayjs';
import { matchesApi, teamsApi, tournamentsApi, channelsApi, api } from '../../services/api';
import { Loader } from '../../components/ui/Loader';
import { Match, Team, Tournament } from '../../types';
import { formatMatchTime, matchStatusLabel } from '../../utils';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = ['UPCOMING', 'LIVE', 'HT', 'FINISHED', 'POSTPONED', 'CANCELLED'];
const DEST_OPTIONS = ['INTERNAL', 'EXTERNAL'];

// ─── Searchable team combobox ─────────────────────────────────────────────────

function TeamCombobox({ value, teams, onChange, placeholder }: {
  value: string;
  teams: Team[];
  onChange: (id: string) => void;
  placeholder?: string;
}) {
  const selected = teams.find((t) => t.id === value);
  const [query, setQuery] = useState(selected?.name || '');
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(selected?.name || '');
  }, [value, selected?.name]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = query
    ? teams.filter((t) => t.name.toLowerCase().includes(query.toLowerCase()))
    : teams;

  return (
    <div ref={ref} className="relative">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); if (value) onChange(''); }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder || 'Type to search team…'}
          className="w-full border border-dark-300 rounded-lg px-3 py-2 text-sm pr-7"
          autoComplete="off"
        />
        {value && (
          <button type="button" onClick={() => { onChange(''); setQuery(''); }}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-600">
            <FiX className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
      {/* validation shim — keeps "required" working without visible element */}
      <input type="text" value={value} required readOnly tabIndex={-1}
        className="sr-only" aria-hidden="true" />
      {open && filtered.length > 0 && (
        <ul className="absolute z-50 w-full mt-1 bg-white border border-dark-200 rounded-lg shadow-lg max-h-52 overflow-y-auto">
          {filtered.map((t) => (
            <li key={t.id}>
              <button
                type="button"
                onClick={() => { onChange(t.id); setQuery(t.name); setOpen(false); }}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-brand-50 hover:text-brand-700 ${t.id === value ? 'bg-brand-50 font-semibold text-brand-700' : ''}`}
              >
                {t.name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const emptyForm = {
  title: '', slug: '', homeTeamId: '', awayTeamId: '', tournamentId: '',
  matchTime: '', status: 'UPCOMING', homeScore: '', awayScore: '', minute: '',
  banner: '', isFeatured: false, isActive: true,
  destinationType: 'INTERNAL', externalUrl: '',
  metaTitle: '', metaDescription: '', externalId: '',
};

export default function AdminMatchesPage() {
  const qc = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Match | null>(null);
  const [channelMatchId, setChannelMatchId] = useState<string | null>(null);
  const [tableSearch, setTableSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterTournament, setFilterTournament] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [form, setForm] = useState<any>(emptyForm);
  const [channelForm, setChannelForm] = useState({ name: '', language: 'English', logo: '', destinationUrl: '', sortOrder: 0 });

  const { data: matchData } = useQuery({
    queryKey: ['admin-matches'],
    queryFn: () => matchesApi.getAll({ limit: 500 }).then((r) => r.data),
  });
  const { data: teams } = useQuery<Team[]>({
    queryKey: ['teams'],
    queryFn: () => teamsApi.getAll().then((r) => r.data),
  });
  const { data: tournaments } = useQuery<Tournament[]>({
    queryKey: ['tournaments'],
    queryFn: () => tournamentsApi.getAll().then((r) => r.data),
  });

  const saveMutation = useMutation({
    mutationFn: (data: any) => editing
      ? matchesApi.update(editing.id, data)
      : matchesApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-matches'] });
      toast.success(editing ? 'Match updated' : 'Match created');
      setModalOpen(false);
      setEditing(null);
      setForm(emptyForm);
    },
    onError: () => toast.error('Failed to save match'),
  });

  const deleteMutation = useMutation({
    mutationFn: matchesApi.remove,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-matches'] }); toast.success('Match deleted'); },
  });

  const addChannelMutation = useMutation({
    mutationFn: (data: any) => channelsApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-matches'] });
      toast.success('Channel added');
      setChannelForm({ name: '', language: 'English', logo: '', destinationUrl: '', sortOrder: 0 });
    },
    onError: () => toast.error('Failed to add channel'),
  });

  const removeChannelMutation = useMutation({
    mutationFn: channelsApi.remove,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-matches'] }); toast.success('Channel removed'); },
  });

  const autoLinkMutation = useMutation({
    mutationFn: () => api.post('/matches/auto-link', {}, { timeout: 120_000 }),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['admin-matches'] });
      const { linked, total } = res.data;
      if (linked > 0) toast.success(`Linked ${linked}/${total} matches to ESPN!`, { duration: 6000 });
      else toast.error(`0/${total} matches linked. Try "Import Real Schedule" instead.`, { duration: 8000 });
    },
    onError: (e: any) => toast.error(`Auto-link failed: ${e?.response?.data?.message || e?.message || 'unknown error'}`),
  });

  const importScheduleMutation = useMutation({
    mutationFn: () => api.post('/matches/import-espn-schedule', {}, { timeout: 300_000 }),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['admin-matches'] });
      const { created, updated, skipped, total, missingTeams } = res.data;
      const msg = `ESPN: ${created} new + ${updated} updated out of ${total} matches.`;
      if (created + updated > 0) toast.success(msg, { duration: 8000 });
      else toast.error(msg, { duration: 8000 });
      if (missingTeams?.length) toast(`⚠️ Missing teams: ${missingTeams.join(', ')}`, { duration: 10000 });
    },
    onError: (e: any) => toast.error(`Import failed: ${e?.response?.data?.message || e?.message || 'unknown error'}`),
  });

  const openNew = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (m: Match) => {
    setEditing(m);
    setForm({
      ...m,
      homeTeamId: m.homeTeam.id,
      awayTeamId: m.awayTeam.id,
      tournamentId: m.tournament.id,
      matchTime: m.matchTime ? dayjs(m.matchTime).format('YYYY-MM-DDTHH:mm') : '',
      homeScore: m.homeScore ?? '',
      awayScore: m.awayScore ?? '',
      minute: m.minute ?? '',
      banner: m.banner ?? '',
      externalUrl: m.externalUrl ?? '',
      externalId: (m as any).externalId ?? '',
    });
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...form,
      // Convert local datetime-input value to UTC ISO so the backend stores the correct time
      matchTime: form.matchTime ? new Date(form.matchTime).toISOString() : undefined,
      homeScore: form.homeScore !== '' ? parseInt(form.homeScore) : undefined,
      awayScore: form.awayScore !== '' ? parseInt(form.awayScore) : undefined,
      minute: form.minute !== '' ? parseInt(form.minute) : undefined,
      externalId: form.externalId !== '' ? form.externalId : undefined,
    };
    saveMutation.mutate(payload);
  };

  // Sort by matchTime so rows don't jump when status changes (backend sorts by status asc)
  const allMatches: Match[] = [...(matchData?.items || [])].sort(
    (a, b) => new Date(a.matchTime).getTime() - new Date(b.matchTime).getTime(),
  );

  const q = tableSearch.toLowerCase().trim();
  const matches = allMatches.filter((m) => {
    if (q && !m.homeTeam.name.toLowerCase().includes(q) && !m.awayTeam.name.toLowerCase().includes(q) && !m.tournament.name.toLowerCase().includes(q)) return false;
    if (filterStatus && m.status !== filterStatus) return false;
    if (filterTournament && m.tournament.id !== filterTournament) return false;
    if (filterDate && !dayjs(m.matchTime).format('YYYY-MM-DD').startsWith(filterDate)) return false;
    return true;
  });

  const hasFilters = q || filterStatus || filterTournament || filterDate;
  const clearFilters = () => { setTableSearch(''); setFilterStatus(''); setFilterTournament(''); setFilterDate(''); };

  const isBusy = saveMutation.isPending || deleteMutation.isPending || addChannelMutation.isPending || removeChannelMutation.isPending || autoLinkMutation.isPending || importScheduleMutation.isPending;

  return (
    <div className="space-y-5">
      {isBusy && <Loader fullscreen text={deleteMutation.isPending ? 'Deleting...' : 'Saving...'} />}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-xl font-display font-bold text-dark-900">Matches</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => importScheduleMutation.mutate()}
            disabled={importScheduleMutation.isPending || autoLinkMutation.isPending}
            title="Fetch the real WC 2026 schedule from ESPN and create any missing matches"
            className="btn-ghost text-sm gap-2 flex items-center border border-green-300 text-green-700 hover:bg-green-50"
          >
            <FiWifi className={`w-4 h-4 ${importScheduleMutation.isPending ? 'animate-pulse' : ''}`} />
            {importScheduleMutation.isPending ? 'Importing…' : 'Import Real Schedule'}
          </button>
          <button
            onClick={() => autoLinkMutation.mutate()}
            disabled={autoLinkMutation.isPending || importScheduleMutation.isPending}
            title="Auto-link existing matches to ESPN by matching team names and dates"
            className="btn-ghost text-sm gap-2 flex items-center"
          >
            <FiLink className={`w-4 h-4 ${autoLinkMutation.isPending ? 'animate-pulse' : ''}`} />
            {autoLinkMutation.isPending ? 'Linking…' : 'Auto-Link Fixtures'}
          </button>
          <button onClick={openNew} className="btn-primary text-sm gap-2">
            <FiPlus className="w-4 h-4" /> New Match
          </button>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap gap-2 items-center">
        {/* Text search */}
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
          <input
            type="text"
            value={tableSearch}
            onChange={(e) => setTableSearch(e.target.value)}
            placeholder="Search team…"
            className="border border-dark-300 rounded-lg pl-9 pr-8 py-2 text-sm w-48"
          />
          {tableSearch && (
            <button onClick={() => setTableSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-600">
              <FiX className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Status filter */}
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border border-dark-300 rounded-lg px-3 py-2 text-sm text-dark-700"
        >
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>

        {/* Tournament filter */}
        <select
          value={filterTournament}
          onChange={(e) => setFilterTournament(e.target.value)}
          className="border border-dark-300 rounded-lg px-3 py-2 text-sm text-dark-700"
        >
          <option value="">All Tournaments</option>
          {tournaments?.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>

        {/* Date filter */}
        <input
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          className="border border-dark-300 rounded-lg px-3 py-2 text-sm text-dark-700"
        />

        {/* Clear all */}
        {hasFilters && (
          <button onClick={clearFilters}
            className="flex items-center gap-1 text-sm text-red-500 hover:text-red-700 font-medium">
            <FiX className="w-3.5 h-3.5" /> Clear
          </button>
        )}

        <span className="text-xs text-dark-400 ml-1">{matches.length} result{matches.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-dark-50 border-b border-dark-200">
              <tr>
                {['Match', 'Tournament', 'Time', 'Status', 'Channels', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 font-semibold text-dark-600 text-xs uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matches.map((m) => (
                <React.Fragment key={m.id}>
                  <tr className="border-b border-dark-100 hover:bg-dark-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-dark-800">{m.homeTeam.name} vs {m.awayTeam.name}</p>
                      <div className="flex gap-1 mt-0.5">
                        {m.isFeatured && <span className="text-xs bg-brand-100 text-brand-700 px-1.5 py-0.5 rounded">Featured</span>}
                        {(m as any).externalId
                          ? <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded flex items-center gap-0.5"><FiLink className="w-2.5 h-2.5" /> API #{(m as any).externalId}</span>
                          : <span className="text-xs bg-dark-100 text-dark-400 px-1.5 py-0.5 rounded">No API link</span>
                        }
                      </div>
                    </td>
                    <td className="px-4 py-3 text-dark-600">{m.tournament.name}</td>
                    <td className="px-4 py-3 text-dark-500 text-xs whitespace-nowrap">{formatMatchTime(m.matchTime)}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1 w-fit ${
                        m.status === 'LIVE' ? 'bg-red-100 text-red-700' : 'bg-dark-100 text-dark-600'
                      }`}>
                        {m.status === 'LIVE' && <FiWifi className="w-3 h-3" />}
                        {matchStatusLabel[m.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setChannelMatchId(channelMatchId === m.id ? null : m.id)}
                        className="flex items-center gap-1 text-xs text-brand-600 hover:text-brand-700 font-medium"
                      >
                        {m.channels?.length || 0} channels <FiChevronDown className="w-3 h-3" />
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <a href={`/matches/${m.slug}`} target="_blank" rel="noreferrer" className="p-1.5 text-dark-400 hover:text-dark-700 rounded">
                          <FiEye className="w-4 h-4" />
                        </a>
                        <button onClick={() => openEdit(m)} className="p-1.5 text-dark-400 hover:text-brand-600 rounded">
                          <FiEdit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => { if (window.confirm('Delete this match?')) deleteMutation.mutate(m.id); }}
                          className="p-1.5 text-dark-400 hover:text-red-500 rounded"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Channel panel */}
                  {channelMatchId === m.id && (
                    <tr>
                      <td colSpan={6} className="bg-dark-50 px-6 py-4 border-b border-dark-200">
                        <p className="font-semibold text-dark-700 mb-3">Channels for {m.homeTeam.name} vs {m.awayTeam.name}</p>
                        <div className="space-y-2 mb-4">
                          {m.channels?.map((ch) => (
                            <div key={ch.id} className="flex items-center justify-between bg-white border border-dark-200 rounded-lg px-3 py-2">
                              <div>
                                <span className="font-medium text-dark-800">{ch.name}</span>
                                <span className="text-xs text-dark-400 ml-2">({ch.language})</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <a href={ch.destinationUrl} target="_blank" rel="noreferrer" className="text-xs text-brand-600 hover:underline truncate max-w-[150px]">
                                  {ch.destinationUrl}
                                </a>
                                <button onClick={() => removeChannelMutation.mutate(ch.id)} className="p-1 text-red-400 hover:text-red-600">
                                  <FiTrash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                          {(!m.channels || m.channels.length === 0) && (
                            <p className="text-sm text-dark-400">No channels yet.</p>
                          )}
                        </div>
                        <form
                          className="flex flex-wrap gap-2 items-end"
                          onSubmit={(e) => {
                            e.preventDefault();
                            addChannelMutation.mutate({ ...channelForm, matchId: m.id });
                          }}
                        >
                          <input required placeholder="Channel name" value={channelForm.name}
                            onChange={(e) => setChannelForm((f) => ({ ...f, name: e.target.value }))}
                            className="border border-dark-300 rounded-lg px-3 py-1.5 text-sm" />
                          <input placeholder="Language" value={channelForm.language}
                            onChange={(e) => setChannelForm((f) => ({ ...f, language: e.target.value }))}
                            className="border border-dark-300 rounded-lg px-3 py-1.5 text-sm w-28" />
                          <input required placeholder="Destination URL" value={channelForm.destinationUrl}
                            onChange={(e) => setChannelForm((f) => ({ ...f, destinationUrl: e.target.value }))}
                            className="border border-dark-300 rounded-lg px-3 py-1.5 text-sm flex-1 min-w-[200px]" />
                          <button type="submit" className="btn-primary text-xs py-1.5 gap-1">
                            <FiPlus className="w-3 h-3" /> Add Channel
                          </button>
                        </form>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
              {matches.length === 0 && (
                <tr><td colSpan={6} className="text-center py-10 text-dark-400">
                  {hasFilters ? 'No matches found for the selected filters.' : 'No matches yet. Create one!'}
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-dark-200 flex items-center justify-between">
              <h3 className="text-lg font-display font-bold text-dark-900">
                {editing ? 'Edit Match' : 'New Match'}
              </h3>
              <button onClick={() => { setModalOpen(false); setEditing(null); }} className="p-2 hover:bg-dark-100 rounded-lg">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-dark-600 mb-1">Match Title</label>
                  <input required value={form.title} onChange={(e) => setForm((f: any) => ({ ...f, title: e.target.value }))}
                    className="w-full border border-dark-300 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-dark-600 mb-1">Slug</label>
                  <input required value={form.slug} onChange={(e) => setForm((f: any) => ({ ...f, slug: e.target.value }))}
                    className="w-full border border-dark-300 rounded-lg px-3 py-2 text-sm" placeholder="man-utd-vs-barcelona" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-dark-600 mb-1">Home Team</label>
                  <TeamCombobox
                    value={form.homeTeamId}
                    teams={teams || []}
                    onChange={(id) => setForm((f: any) => ({ ...f, homeTeamId: id }))}
                    placeholder="Search home team…"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-dark-600 mb-1">Away Team</label>
                  <TeamCombobox
                    value={form.awayTeamId}
                    teams={teams || []}
                    onChange={(id) => setForm((f: any) => ({ ...f, awayTeamId: id }))}
                    placeholder="Search away team…"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-dark-600 mb-1">Tournament</label>
                  <select required value={form.tournamentId} onChange={(e) => setForm((f: any) => ({ ...f, tournamentId: e.target.value }))}
                    className="w-full border border-dark-300 rounded-lg px-3 py-2 text-sm">
                    <option value="">Select tournament</option>
                    {tournaments?.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-dark-600 mb-1">Match Time</label>
                  <input type="datetime-local" required value={form.matchTime}
                    onChange={(e) => setForm((f: any) => ({ ...f, matchTime: e.target.value }))}
                    className="w-full border border-dark-300 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-dark-600 mb-1">Status</label>
                  <select value={form.status} onChange={(e) => setForm((f: any) => ({ ...f, status: e.target.value }))}
                    className="w-full border border-dark-300 rounded-lg px-3 py-2 text-sm">
                    {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-dark-600 mb-1">Home Score</label>
                  <input type="number" min="0" value={form.homeScore}
                    onChange={(e) => setForm((f: any) => ({ ...f, homeScore: e.target.value }))}
                    className="w-full border border-dark-300 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-dark-600 mb-1">Away Score</label>
                  <input type="number" min="0" value={form.awayScore}
                    onChange={(e) => setForm((f: any) => ({ ...f, awayScore: e.target.value }))}
                    className="w-full border border-dark-300 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-dark-600 mb-1">Minute</label>
                  <input type="number" min="0" max="120" value={form.minute}
                    onChange={(e) => setForm((f: any) => ({ ...f, minute: e.target.value }))}
                    className="w-full border border-dark-300 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-dark-600 mb-1">Destination Type</label>
                  <select value={form.destinationType} onChange={(e) => setForm((f: any) => ({ ...f, destinationType: e.target.value }))}
                    className="w-full border border-dark-300 rounded-lg px-3 py-2 text-sm">
                    {DEST_OPTIONS.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                {form.destinationType === 'EXTERNAL' && (
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-dark-600 mb-1">External URL</label>
                    <input value={form.externalUrl} onChange={(e) => setForm((f: any) => ({ ...f, externalUrl: e.target.value }))}
                      placeholder="https://blogger.com/your-page" className="w-full border border-dark-300 rounded-lg px-3 py-2 text-sm" />
                  </div>
                )}
                <div className="col-span-2 flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm((f: any) => ({ ...f, isFeatured: e.target.checked }))} className="rounded" />
                    <span className="text-sm font-medium text-dark-700">Featured Match</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.isActive} onChange={(e) => setForm((f: any) => ({ ...f, isActive: e.target.checked }))} className="rounded" />
                    <span className="text-sm font-medium text-dark-700">Active</span>
                  </label>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => { setModalOpen(false); setEditing(null); }} className="btn-ghost">Cancel</button>
                <button type="submit" disabled={saveMutation.isPending} className="btn-primary">
                  {saveMutation.isPending ? 'Saving…' : editing ? 'Update Match' : 'Create Match'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
