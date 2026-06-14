import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { articlesApi } from '../services/api';
import { Loader } from '../components/ui/Loader';
import { PaginatedResponse, Article } from '../types';
import NewsCard from '../components/news/NewsCard';
import Sidebar from '../components/layout/Sidebar';
import AdBlock from '../components/ads/AdBlock';

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();

  const { data, isLoading } = useQuery<PaginatedResponse<Article>>({
    queryKey: ['articles', 'category', slug],
    queryFn: () => articlesApi.getAll({ category: slug, limit: 24 }).then((r) => r.data),
    enabled: !!slug,
    staleTime: 60_000,
  });

  const categoryName = slug ? slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : '';

  return (
    <>
      <Helmet>
        <title>{categoryName} News | SportsZone</title>
        <meta name="description" content={`Latest ${categoryName} news, match updates, and breaking stories.`} />
        <link rel="canonical" href={`https://www.livefootballarena.online/category/${slug}`} />
      </Helmet>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8">
          <main>
            <h1 className="text-2xl font-display font-bold text-dark-900 mb-6 border-l-4 border-brand-500 pl-3">
              {categoryName}
            </h1>
            <AdBlock slot="HEADER_BANNER" style={{ minHeight: 90 }} className="mb-6" />
            {isLoading ? (
              <Loader text="Loading articles..." />
            ) : data?.items && data.items.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {data.items.map((a) => <NewsCard key={a.id} article={a} />)}
              </div>
            ) : (
              <div className="card p-16 text-center text-dark-400">
                <p className="text-lg font-medium">No articles in {categoryName} yet.</p>
              </div>
            )}
          </main>
          <aside className="hidden lg:block"><Sidebar side="right" /></aside>
        </div>
      </div>
    </>
  );
}
