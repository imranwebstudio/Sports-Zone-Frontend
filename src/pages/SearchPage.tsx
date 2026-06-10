import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { FiSearch } from 'react-icons/fi';
import { articlesApi } from '../services/api';
import NewsCard from '../components/news/NewsCard';

export default function SearchPage() {
  const [params] = useSearchParams();
  const q = params.get('q') || '';

  const { data, isLoading } = useQuery({
    queryKey: ['search', q],
    queryFn: () => articlesApi.getAll({ search: q, limit: 24 }).then((r) => r.data),
    enabled: !!q,
  });

  return (
    <>
      <Helmet>
        <title>Search: {q} | SportsZone</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <FiSearch className="w-5 h-5 text-dark-400" />
          <h1 className="text-xl font-display font-semibold text-dark-800">
            Search results for: <span className="text-brand-600">"{q}"</span>
          </h1>
          {data && <span className="text-sm text-dark-400">({data.total} results)</span>}
        </div>
        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => <div key={i} className="h-48 bg-dark-100 rounded-xl animate-pulse" />)}
          </div>
        ) : data?.items?.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {data.items.map((a: any) => <NewsCard key={a.id} article={a} />)}
          </div>
        ) : q ? (
          <div className="card p-16 text-center text-dark-400">
            <p className="text-lg font-medium">No results for "{q}"</p>
            <p className="text-sm mt-1">Try a different search term.</p>
          </div>
        ) : null}
      </div>
    </>
  );
}
