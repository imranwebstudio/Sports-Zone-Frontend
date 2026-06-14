import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import {
  FiClock, FiEye, FiBookOpen, FiShare2,
  FiTwitter, FiFacebook, FiLink,
} from 'react-icons/fi';
import { articlesApi, analyticsApi } from '../services/api';
import { Article } from '../types';
import { formatDate, getImageUrl } from '../utils';
import { Loader } from '../components/ui/Loader';
import NewsCard from '../components/news/NewsCard';
import AdBlock from '../components/ads/AdBlock';
import Sidebar from '../components/layout/Sidebar';

export default function NewsDetailPage() {
  const { slug } = useParams<{ slug: string }>();

  const { data: article, isLoading, error } = useQuery<Article>({
    queryKey: ['article', slug],
    queryFn: () => articlesApi.getOne(slug!).then((r) => r.data),
    enabled: !!slug,
  });

  const { data: related } = useQuery<Article[]>({
    queryKey: ['related', article?.category.id],
    queryFn: () =>
      articlesApi
        .getAll({ category: article?.category.slug, limit: 4 })
        .then((r) => r.data.items.filter((a: Article) => a.id !== article?.id).slice(0, 4)),
    enabled: !!article,
    staleTime: 120_000,
  });

  useEffect(() => {
    if (slug) analyticsApi.track(`/news/${slug}`, document.referrer);
  }, [slug]);

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4">
        <Loader text="Loading article..." />
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-display font-bold text-dark-800">Article Not Found</h1>
        <p className="text-dark-500 mt-2">This article may have been removed or doesn't exist.</p>
        <Link to="/" className="btn-primary mt-6 inline-flex">Back to Home</Link>
      </div>
    );
  }

  const schemaMarkup = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": article.title,
    "description": article.excerpt || article.title,
    "image": article.featuredImage ? getImageUrl(article.featuredImage) : '',
    "datePublished": article.publishedAt,
    "dateModified": article.createdAt,
    "author": { "@type": "Person", "name": article.author.name },
    "publisher": {
      "@type": "Organization",
      "name": "SportsZone",
      "logo": { "@type": "ImageObject", "url": "https://www.livefootballarena.online/logo.png" }
    },
  };

  return (
    <>
      <Helmet>
        <title>{article.metaTitle || article.title} | SportsZone</title>
        <meta name="description" content={article.metaDescription || article.excerpt || article.title} />
        <meta property="og:title" content={article.title} />
        <meta property="og:description" content={article.excerpt || article.title} />
        {article.featuredImage && (
          <meta property="og:image" content={getImageUrl(article.featuredImage)} />
        )}
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={article.title} />
        <meta name="twitter:description" content={article.excerpt || ''} />
        <link rel="canonical" href={`https://www.livefootballarena.online/news/${article.slug}`} />
        <script type="application/ld+json">{JSON.stringify(schemaMarkup)}</script>
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <nav className="text-sm text-dark-500 mb-4 flex items-center gap-2 flex-wrap">
          <Link to="/" className="hover:text-brand-600">Home</Link>
          <span>/</span>
          <Link to={`/category/${article.category.slug}`} className="hover:text-brand-600">
            {article.category.name}
          </Link>
          <span>/</span>
          <span className="text-dark-800 font-medium line-clamp-1">{article.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
          {/* Article */}
          <article className="min-w-0">
            {/* Category + Breaking badge */}
            <div className="flex items-center gap-3 mb-3">
              {article.isBreaking && <span className="badge-live">Breaking</span>}
              <Link
                to={`/category/${article.category.slug}`}
                className="badge-category"
                style={{ background: (article.category.color || '#16a34a') + '22', color: article.category.color || '#16a34a' }}
              >
                {article.category.name}
              </Link>
            </div>

            <h1 className="text-3xl font-display font-bold text-dark-900 leading-tight mb-4">
              {article.title}
            </h1>

            {article.excerpt && (
              <p className="text-lg text-dark-600 leading-relaxed mb-6 border-l-4 border-brand-400 pl-4 italic">
                {article.excerpt}
              </p>
            )}

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-dark-500 mb-6 pb-6 border-b border-dark-200">
              <span className="font-medium text-dark-700">By {article.author.name}</span>
              <span className="flex items-center gap-1">
                <FiClock className="w-4 h-4" />
                {formatDate(article.publishedAt || article.createdAt)}
              </span>
              <span className="flex items-center gap-1">
                <FiBookOpen className="w-4 h-4" />
                {article.readTime} min read
              </span>
              <span className="flex items-center gap-1">
                <FiEye className="w-4 h-4" />
                {article.viewCount.toLocaleString()} views
              </span>
            </div>

            {/* Featured Image */}
            {article.featuredImage && (
              <div className="mb-6 rounded-xl overflow-hidden">
                <img
                  src={getImageUrl(article.featuredImage)}
                  alt={article.title}
                  className="w-full max-h-[500px] object-cover"
                />
              </div>
            )}

            <AdBlock slot="IN_ARTICLE_1" style={{ minHeight: 90 }} className="mb-6" />

            {/* Content */}
            <div
              className="prose prose-lg max-w-none
                prose-headings:font-display prose-headings:text-dark-900
                prose-p:text-dark-700 prose-p:leading-relaxed
                prose-a:text-brand-600 prose-a:no-underline hover:prose-a:underline
                prose-img:rounded-xl prose-strong:text-dark-800
                prose-blockquote:border-brand-500 prose-blockquote:text-dark-600"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />

            <AdBlock slot="IN_ARTICLE_2" style={{ minHeight: 90 }} className="my-6" />

            {/* Tags */}
            {article.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2 my-6">
                {article.tags.map((tag) => (
                  <Link
                    key={tag}
                    to={`/search?q=${encodeURIComponent(tag)}`}
                    className="px-3 py-1 bg-dark-100 hover:bg-brand-100 text-dark-600 hover:text-brand-700 text-sm rounded-full transition-colors"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            )}

            {/* Social Share */}
            <div className="flex items-center gap-3 py-6 border-t border-b border-dark-200">
              <span className="text-sm font-medium text-dark-600 flex items-center gap-2">
                <FiShare2 className="w-4 h-4" /> Share:
              </span>
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(shareUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-[#1DA1F2] text-white rounded-lg hover:opacity-90 transition-opacity"
              >
                <FiTwitter className="w-4 h-4" />
              </a>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-[#1877F2] text-white rounded-lg hover:opacity-90 transition-opacity"
              >
                <FiFacebook className="w-4 h-4" />
              </a>
              <button
                onClick={copyLink}
                className="p-2 bg-dark-700 text-white rounded-lg hover:bg-dark-600 transition-colors"
              >
                <FiLink className="w-4 h-4" />
              </button>
            </div>

            {/* Related Articles */}
            {related && related.length > 0 && (
              <section className="mt-8">
                <h2 className="section-title mb-4">Related Articles</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {related.map((a) => <NewsCard key={a.id} article={a} />)}
                </div>
              </section>
            )}
          </article>

          {/* Article Sidebar */}
          <aside className="hidden lg:block space-y-6">
            <Sidebar side="right" />
          </aside>
        </div>
      </div>
    </>
  );
}
