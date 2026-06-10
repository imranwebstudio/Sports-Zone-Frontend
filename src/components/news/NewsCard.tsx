import React from 'react';
import { Link } from 'react-router-dom';
import { FiClock, FiEye } from 'react-icons/fi';
import { Article } from '../../types';
import { timeAgo, getImageUrl } from '../../utils';

interface NewsCardProps {
  article: Article;
  variant?: 'default' | 'horizontal' | 'mini' | 'featured';
}

export default function NewsCard({ article, variant = 'default' }: NewsCardProps) {
  if (variant === 'featured') {
    return (
      <Link
        to={`/news/${article.slug}`}
        className="group relative block overflow-hidden rounded-xl h-72 card"
      >
        <img
          src={getImageUrl(article.featuredImage)}
          alt={article.title}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4">
          {article.isBreaking && (
            <span className="badge-live mb-2 inline-block">Breaking</span>
          )}
          <div className="badge-category mb-2 inline-block"
            style={{ background: article.category.color + '22', color: article.category.color }}>
            {article.category.name}
          </div>
          <h2 className="text-white font-display font-bold text-lg line-clamp-2 group-hover:text-brand-300 transition-colors">
            {article.title}
          </h2>
          <div className="flex items-center gap-3 mt-2 text-dark-300 text-xs">
            <span className="flex items-center gap-1"><FiClock className="w-3 h-3" />{timeAgo(article.publishedAt || article.createdAt)}</span>
            <span className="flex items-center gap-1"><FiEye className="w-3 h-3" />{article.viewCount.toLocaleString()}</span>
          </div>
        </div>
      </Link>
    );
  }

  if (variant === 'horizontal') {
    return (
      <Link
        to={`/news/${article.slug}`}
        className="group flex gap-3 p-3 rounded-lg hover:bg-dark-50 transition-colors"
      >
        <div className="w-20 h-16 shrink-0 overflow-hidden rounded-lg bg-dark-100">
          <img
            src={getImageUrl(article.featuredImage)}
            alt={article.title}
            className="news-thumb"
            loading="lazy"
          />
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-xs font-semibold text-brand-600">{article.category.name}</span>
          <h3 className="text-sm font-semibold text-dark-900 line-clamp-2 group-hover:text-brand-600 transition-colors leading-snug">
            {article.title}
          </h3>
          <span className="text-xs text-dark-400 flex items-center gap-1 mt-1">
            <FiClock className="w-3 h-3" />
            {timeAgo(article.publishedAt || article.createdAt)}
          </span>
        </div>
      </Link>
    );
  }

  if (variant === 'mini') {
    return (
      <Link
        to={`/news/${article.slug}`}
        className="group flex gap-2 items-start py-2 border-b border-dark-100 last:border-0 hover:opacity-80 transition-opacity"
      >
        <span className="w-1.5 h-1.5 mt-1.5 rounded-full bg-brand-500 shrink-0" />
        <div>
          <h4 className="text-sm text-dark-800 font-medium line-clamp-2 group-hover:text-brand-600 transition-colors leading-snug">
            {article.title}
          </h4>
          <span className="text-xs text-dark-400">{timeAgo(article.publishedAt || article.createdAt)}</span>
        </div>
      </Link>
    );
  }

  return (
    <Link to={`/news/${article.slug}`} className="group card overflow-hidden flex flex-col">
      <div className="relative overflow-hidden h-44 bg-dark-100">
        {article.isBreaking && (
          <span className="badge-live absolute top-2 left-2 z-10">Breaking</span>
        )}
        <img
          src={getImageUrl(article.featuredImage)}
          alt={article.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
      </div>
      <div className="p-4 flex flex-col flex-1">
        <span
          className="text-xs font-bold uppercase tracking-wide mb-2"
          style={{ color: article.category.color || '#16a34a' }}
        >
          {article.category.name}
        </span>
        <h3 className="font-display font-semibold text-dark-900 line-clamp-2 group-hover:text-brand-600 transition-colors leading-snug mb-2">
          {article.title}
        </h3>
        {article.excerpt && (
          <p className="text-sm text-dark-500 line-clamp-2 mb-3">{article.excerpt}</p>
        )}
        <div className="flex items-center justify-between mt-auto text-xs text-dark-400">
          <span className="flex items-center gap-1">
            <FiClock className="w-3 h-3" />
            {timeAgo(article.publishedAt || article.createdAt)}
          </span>
          <span className="flex items-center gap-1">
            <FiEye className="w-3 h-3" />{article.viewCount.toLocaleString()}
          </span>
        </div>
      </div>
    </Link>
  );
}
