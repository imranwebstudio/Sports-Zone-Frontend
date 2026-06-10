import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { articlesApi } from '../../services/api';
import { Article } from '../../types';
import NewsCard from '../news/NewsCard';
import AdBlock from '../ads/AdBlock';

interface SidebarProps {
  side: 'left' | 'right';
}

export default function Sidebar({ side }: SidebarProps) {
  const { data: trending } = useQuery<Article[]>({
    queryKey: ['trending'],
    queryFn: () => articlesApi.getTrending(8).then((r) => r.data),
    staleTime: 120_000,
  });

  const { data: breaking } = useQuery<Article[]>({
    queryKey: ['breaking'],
    queryFn: () => articlesApi.getBreaking(5).then((r) => r.data),
    staleTime: 60_000,
  });

  if (side === 'left') {
    return (
      <aside className="space-y-6 animate-fade-in">
        <AdBlock slot="LEFT_SIDEBAR_TOP" style={{ minHeight: 90 }} />

        <div className="card p-4">
          <h2 className="section-title mb-4">Latest News</h2>
          <div className="space-y-1">
            {trending?.slice(0, 6).map((a) => (
              <NewsCard key={a.id} article={a} variant="horizontal" />
            ))}
          </div>
        </div>

        <AdBlock slot="LEFT_SIDEBAR_BOTTOM" style={{ minHeight: 250 }} />

        <div className="card p-4">
          <h2 className="section-title mb-4">Popular Articles</h2>
          <div className="space-y-1">
            {trending?.slice(0, 5).map((a, i) => (
              <div key={a.id} className="flex gap-2 py-2 border-b border-dark-100 last:border-0">
                <span className="text-2xl font-display font-bold text-dark-200 leading-none w-6 shrink-0">
                  {i + 1}
                </span>
                <NewsCard article={a} variant="mini" />
              </div>
            ))}
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="space-y-6 animate-fade-in">
      <AdBlock slot="RIGHT_SIDEBAR_TOP" style={{ minHeight: 250 }} />

      <div className="card p-4">
        <h2 className="section-title mb-4">Breaking News</h2>
        <div className="space-y-1">
          {breaking?.map((a) => <NewsCard key={a.id} article={a} variant="mini" />)}
        </div>
      </div>

      <AdBlock slot="RIGHT_SIDEBAR_BOTTOM" style={{ minHeight: 250 }} />

      <div className="card p-4">
        <h2 className="section-title mb-4">Trending Now</h2>
        <div className="space-y-1">
          {trending?.slice(0, 5).map((a) => (
            <NewsCard key={a.id} article={a} variant="horizontal" />
          ))}
        </div>
      </div>

      {/* Native recommendation block */}
      <AdBlock slot="NATIVE_RECOMMENDATION" style={{ minHeight: 120 }} />
    </aside>
  );
}
