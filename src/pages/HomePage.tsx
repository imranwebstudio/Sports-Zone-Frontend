import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FiChevronRight, FiWifi } from 'react-icons/fi';
import { matchesApi, articlesApi } from '../services/api';
import { Match, Article, PaginatedResponse } from '../types';
import MatchCard from '../components/matches/MatchCard';
import NewsCard from '../components/news/NewsCard';
import Sidebar from '../components/layout/Sidebar';
import AdBlock from '../components/ads/AdBlock';

export default function HomePage() {
  const { data: liveMatches } = useQuery<Match[]>({
    queryKey: ['matches', 'live'],
    queryFn: () => matchesApi.getLive().then((r) => r.data),
    refetchInterval: 30_000,
    staleTime: 20_000,
  });

  const { data: featuredMatches } = useQuery<Match[]>({
    queryKey: ['matches', 'featured'],
    queryFn: () => matchesApi.getFeatured().then((r) => r.data),
    staleTime: 60_000,
  });

  const { data: featuredNews } = useQuery<Article[]>({
    queryKey: ['articles', 'featured'],
    queryFn: () => articlesApi.getFeatured(4).then((r) => r.data),
    staleTime: 120_000,
  });

  const { data: latestNews } = useQuery<PaginatedResponse<Article>>({
    queryKey: ['articles', 'latest'],
    queryFn: () => articlesApi.getAll({ page: 1, limit: 12 }).then((r) => r.data),
    staleTime: 60_000,
  });

  const { data: trending } = useQuery<Article[]>({
    queryKey: ['trending'],
    queryFn: () => articlesApi.getTrending(6).then((r) => r.data),
    staleTime: 120_000,
  });

  const allMatches = [
    ...(liveMatches || []),
    ...(featuredMatches || []).filter(
      (fm) => !liveMatches?.find((lm) => lm.id === fm.id),
    ),
  ];

  return (
    <>
      <Helmet>
        <title>Live Football Arena — Live Scores, Sports News & Match Coverage</title>
        <meta name="description" content="Get live football scores, breaking sports news, match coverage, and live stream channels. Your #1 sports hub for FIFA World Cup, Premier League, and more." />
        <meta property="og:title" content="Live Football Arena — Live Scores & Sports News" />
        <meta property="og:description" content="Live football scores, sports news and match coverage." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://Live Football Arena.com/" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "Live Football Arena",
          "url": "https://Live Football Arena.com",
          "potentialAction": {
            "@type": "SearchAction",
            "target": "https://Live Football Arena.com/search?q={search_term_string}",
            "query-input": "required name=search_term_string"
          }
        })}</script>
      </Helmet>

      <AdBlock slot="HEADER_BANNER" style={{ minHeight: 90 }} className="max-w-7xl mx-auto px-4 my-3" />

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_280px] gap-6">
          {/* Left Sidebar */}
          <div className="hidden lg:block">
            <Sidebar side="left" />
          </div>

          {/* Main Content */}
          <main className="min-w-0 space-y-8">

            {/* Live Matches Section */}
            {allMatches.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h1 className="section-title flex items-center gap-2">
                    {liveMatches && liveMatches.length > 0 && (
                      <span className="flex items-center gap-1.5">
                        <FiWifi className="w-4 h-4 text-red-500 animate-pulse" />
                        <span className="text-red-600">Live</span> &amp;
                      </span>
                    )}
                    Upcoming Matches
                  </h1>
                  <Link
                    to="/matches"
                    className="text-sm text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1"
                  >
                    View All <FiChevronRight className="w-4 h-4" />
                  </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {allMatches.slice(0, 6).map((match) => (
                    <MatchCard key={match.id} match={match} />
                  ))}
                </div>
              </section>
            )}

            <AdBlock slot="BETWEEN_CONTENT" style={{ minHeight: 90 }} />

            {/* Featured Articles */}
            {featuredNews && featuredNews.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="section-title">Top Stories</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {featuredNews.map((a, i) => (
                    <NewsCard
                      key={a.id}
                      article={a}
                      variant={i === 0 ? 'featured' : 'default'}
                    />
                  ))}
                </div>
              </section>
            )}

            <AdBlock slot="IN_ARTICLE_1" style={{ minHeight: 90 }} />

            {/* Latest News */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="section-title">Latest News</h2>
                <Link
                  to="/news"
                  className="text-sm text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1"
                >
                  All News <FiChevronRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {latestNews?.items.map((a) => (
                  <NewsCard key={a.id} article={a} />
                ))}
              </div>
              {latestNews && latestNews.items.length === 0 && (
                <div className="card p-12 text-center text-dark-400">
                  <p className="text-lg font-medium">No articles published yet.</p>
                  <p className="text-sm mt-1">Check back soon for the latest sports news.</p>
                </div>
              )}
            </section>

            <AdBlock slot="IN_ARTICLE_2" style={{ minHeight: 90 }} />

            {/* Trending */}
            {trending && trending.length > 0 && (
              <section>
                <h2 className="section-title mb-4">Trending Now</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {trending.map((a) => <NewsCard key={a.id} article={a} />)}
                </div>
              </section>
            )}
          </main>

          {/* Right Sidebar */}
          <div className="hidden lg:block">
            <Sidebar side="right" />
          </div>
        </div>
      </div>

      <AdBlock slot="FOOTER_BANNER" style={{ minHeight: 90 }} className="max-w-7xl mx-auto px-4 mb-6" />

      {/* Sticky Mobile Ad */}
      <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden">
        <AdBlock slot="STICKY_MOBILE" style={{ height: 60 }} label={false} />
      </div>
    </>
  );
}
