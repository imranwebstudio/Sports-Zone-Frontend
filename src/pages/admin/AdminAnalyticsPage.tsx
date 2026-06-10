import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { FiEye, FiFileText, FiCalendar, FiTrendingUp } from 'react-icons/fi';
import { analyticsApi } from '../../services/api';

export default function AdminAnalyticsPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['analytics-dashboard'],
    queryFn: () => analyticsApi.getDashboard().then((r) => r.data),
  });

  if (isLoading) {
    return <div className="animate-pulse space-y-4">
      {[...Array(4)].map((_, i) => <div key={i} className="h-20 bg-dark-100 rounded-xl" />)}
    </div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-display font-bold text-dark-900">Analytics</h2>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Today's Views", value: stats?.todayViews, icon: FiEye, color: 'bg-blue-500' },
          { label: 'Total Views', value: stats?.totalViews, icon: FiTrendingUp, color: 'bg-brand-500' },
          { label: 'Article Views', value: stats?.totalArticleViews, icon: FiFileText, color: 'bg-purple-500' },
          { label: 'Match Views', value: stats?.totalMatchViews, icon: FiCalendar, color: 'bg-orange-500' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card p-5 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center shrink-0`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-display font-bold text-dark-900">{value?.toLocaleString() ?? 0}</p>
              <p className="text-sm text-dark-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Articles */}
        <div className="card p-5">
          <h3 className="font-display font-semibold text-dark-800 mb-4">Top Articles by Views</h3>
          <div className="space-y-3">
            {stats?.topArticles?.map((a: any, i: number) => (
              <div key={a.id} className="flex items-center gap-3">
                <span className="text-lg font-display font-bold text-dark-200 w-6 shrink-0">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <Link to={`/news/${a.slug}`} target="_blank" className="text-sm font-medium text-dark-800 hover:text-brand-600 line-clamp-1">
                    {a.title}
                  </Link>
                </div>
                <span className="text-sm font-semibold text-dark-600 shrink-0">{a.viewCount.toLocaleString()}</span>
              </div>
            ))}
            {(!stats?.topArticles || stats.topArticles.length === 0) && (
              <p className="text-sm text-dark-400">No data yet.</p>
            )}
          </div>
        </div>

        {/* Top Matches */}
        <div className="card p-5">
          <h3 className="font-display font-semibold text-dark-800 mb-4">Top Matches by Views</h3>
          <div className="space-y-3">
            {stats?.topMatches?.map((m: any, i: number) => (
              <div key={m.id} className="flex items-center gap-3">
                <span className="text-lg font-display font-bold text-dark-200 w-6 shrink-0">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <Link to={`/matches/${m.slug}`} target="_blank" className="text-sm font-medium text-dark-800 hover:text-brand-600 line-clamp-1">
                    {m.homeTeam.name} vs {m.awayTeam.name}
                  </Link>
                </div>
                <span className="text-sm font-semibold text-dark-600 shrink-0">{m.viewCount.toLocaleString()}</span>
              </div>
            ))}
            {(!stats?.topMatches || stats.topMatches.length === 0) && (
              <p className="text-sm text-dark-400">No data yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Top Pages */}
      {stats?.topPages?.length > 0 && (
        <div className="card p-5">
          <h3 className="font-display font-semibold text-dark-800 mb-4">Most Visited Pages</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-dark-100">
                <th className="text-left pb-2 text-dark-500 font-medium">Path</th>
                <th className="text-right pb-2 text-dark-500 font-medium">Hits</th>
              </tr></thead>
              <tbody>
                {stats.topPages.map((p: any, i: number) => (
                  <tr key={i} className="border-b border-dark-50">
                    <td className="py-2 text-dark-700 font-mono text-xs">{p.path}</td>
                    <td className="py-2 text-right font-semibold text-dark-700">{p._count.path}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
