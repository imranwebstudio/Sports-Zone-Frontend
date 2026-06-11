import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { FiWifi } from 'react-icons/fi';
import { matchesApi } from '../services/api';
import { Match, PaginatedResponse } from '../types';
import MatchCard from '../components/matches/MatchCard';
import AdBlock from '../components/ads/AdBlock';

const STATUS_TABS = [
  { label: 'All', value: '' },
  { label: '🔴 Live', value: 'LIVE' },
  { label: 'Upcoming', value: 'UPCOMING' },
  { label: 'Finished', value: 'FINISHED' },
];

export default function MatchesPage() {
  const [statusFilter, setStatusFilter] = useState('');

  const { data: matchData } = useQuery<PaginatedResponse<Match>>({
    queryKey: ['matches', 'all', statusFilter],
    queryFn: () => matchesApi.getAll({ limit: 50, ...(statusFilter ? { status: statusFilter } : {}) }).then((r) => r.data),
    refetchInterval: statusFilter === 'LIVE' ? 30_000 : false,
    staleTime: 20_000,
  });

  const matches = matchData?.items || [];

  return (
    <>
      <Helmet>
        <title>Live & Upcoming Matches | Live Football Arena</title>
        <meta name="description" content="Watch live football matches, upcoming fixtures, and finished results. Find all available stream channels." />
        <link rel="canonical" href="https://Live Football Arena.com/matches" />
      </Helmet>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-display font-bold text-dark-900 flex items-center gap-2">
            <FiWifi className="w-6 h-6 text-brand-500" /> Matches
          </h1>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                statusFilter === tab.value
                  ? 'bg-brand-600 text-white'
                  : 'bg-white border border-dark-200 text-dark-600 hover:border-brand-400'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <AdBlock slot="HEADER_BANNER" style={{ minHeight: 90 }} className="mb-6" />

        {matches.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {matches.map((m) => <MatchCard key={m.id} match={m} />)}
          </div>
        ) : (
          <div className="card p-16 text-center text-dark-400">
            <FiWifi className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-lg font-medium">No matches found</p>
            <p className="text-sm mt-1">Check back later for upcoming fixtures.</p>
          </div>
        )}
      </div>
    </>
  );
}
