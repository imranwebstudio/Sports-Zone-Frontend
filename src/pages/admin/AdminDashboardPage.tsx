import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { FiEye, FiFileText, FiCalendar, FiTrendingUp } from 'react-icons/fi';
import { analyticsApi, articlesApi, matchesApi } from '../../services/api';

const StatCard = ({ label, value, icon: Icon, color }: {
  label: string; value: any; icon: any; color: string;
}) => (
  <div className="card p-5 flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center shrink-0`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
    <div>
      <p className="text-2xl font-display font-bold text-dark-900">{value?.toLocaleString() ?? '—'}</p>
      <p className="text-sm text-dark-500">{label}</p>
    </div>
  </div>
);

export default function AdminDashboardPage() {
  const { data: stats } = useQuery({
    queryKey: ['analytics-dashboard'],
    queryFn: () => analyticsApi.getDashboard().then((r) => r.data),
  });

  const { data: articleStats } = useQuery({
    queryKey: ['article-stats'],
    queryFn: () => articlesApi.getStats().then((r) => r.data),
  });

  const { data: matchStats } = useQuery({
    queryKey: ['match-stats'],
    queryFn: () => matchesApi.getStats().then((r) => r.data),
  });

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Today's Views" value={stats?.todayViews} icon={FiEye} color="bg-blue-500" />
        <StatCard label="Total Views" value={stats?.totalViews} icon={FiTrendingUp} color="bg-brand-500" />
        <StatCard label="Total Articles" value={articleStats?.total} icon={FiFileText} color="bg-purple-500" />
        <StatCard label="Total Matches" value={matchStats?.total} icon={FiCalendar} color="bg-orange-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Article Stats */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-dark-800">Article Status</h2>
            <Link to="/admin/articles" className="text-sm text-brand-600 hover:text-brand-700">Manage →</Link>
          </div>
          <div className="space-y-3">
            {[
              { label: 'Published', value: articleStats?.published, color: 'bg-brand-500' },
              { label: 'Draft', value: articleStats?.draft, color: 'bg-yellow-500' },
              { label: 'Trending', value: articleStats?.trending, color: 'bg-red-500' },
              { label: 'Breaking', value: articleStats?.breaking, color: 'bg-orange-500' },
            ].map((s) => (
              <div key={s.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${s.color}`} />
                  <span className="text-sm text-dark-600">{s.label}</span>
                </div>
                <span className="text-sm font-semibold text-dark-800">{s.value ?? 0}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Match Stats */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-dark-800">Match Status</h2>
            <Link to="/admin/matches" className="text-sm text-brand-600 hover:text-brand-700">Manage →</Link>
          </div>
          <div className="space-y-3">
            {[
              { label: 'Live Now', value: matchStats?.live, color: 'bg-red-500' },
              { label: 'Upcoming', value: matchStats?.upcoming, color: 'bg-blue-500' },
              { label: 'Finished', value: matchStats?.finished, color: 'bg-dark-400' },
              { label: 'Total', value: matchStats?.total, color: 'bg-brand-500' },
            ].map((s) => (
              <div key={s.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${s.color}`} />
                  <span className="text-sm text-dark-600">{s.label}</span>
                </div>
                <span className="text-sm font-semibold text-dark-800">{s.value ?? 0}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Articles */}
      {stats?.topArticles?.length > 0 && (
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-dark-800">Most Viewed Articles</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-dark-500 border-b border-dark-100">
                  <th className="text-left pb-3 font-medium">#</th>
                  <th className="text-left pb-3 font-medium">Title</th>
                  <th className="text-right pb-3 font-medium">Views</th>
                </tr>
              </thead>
              <tbody>
                {stats.topArticles.map((a: any, i: number) => (
                  <tr key={a.id} className="border-b border-dark-50 hover:bg-dark-50">
                    <td className="py-2.5 text-dark-400 w-8">{i + 1}</td>
                    <td className="py-2.5">
                      <Link
                        to={`/news/${a.slug}`}
                        target="_blank"
                        className="text-dark-800 hover:text-brand-600 line-clamp-1"
                      >
                        {a.title}
                      </Link>
                    </td>
                    <td className="py-2.5 text-right font-medium text-dark-700">
                      {a.viewCount.toLocaleString()}
                    </td>
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
