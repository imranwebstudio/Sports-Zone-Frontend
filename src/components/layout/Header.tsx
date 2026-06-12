import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FiSearch, FiMenu, FiX, FiZap } from 'react-icons/fi';
import { articlesApi } from '../../services/api';
import { Article } from '../../types';

const NAV_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Football', to: '/category/football' },
  { label: 'World Cup', to: '/category/world-cup' },
  { label: 'Live Matches', to: '/matches' },
  { label: 'Transfers', to: '/category/transfers' },
  { label: 'Cricket', to: '/category/cricket' },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQ, setSearchQ] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  const { data: breaking } = useQuery<Article[]>({
    queryKey: ['breaking'],
    queryFn: () => articlesApi.getBreaking(10).then((r) => r.data),
    staleTime: 60_000,
  });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQ.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQ.trim())}`);
      setSearchOpen(false);
      setSearchQ('');
    }
  };

  return (
    <header className={`sticky top-0 z-50 transition-shadow duration-300 ${scrolled ? 'shadow-lg' : ''}`}>
      {/* Top bar */}
      {/* <div className="bg-dark-900 text-white">
        <div className="max-w-7xl mx-auto px-4 h-9 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-dark-300">
            <span>📍 Live Football Arena — Your #1 Sports Hub</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/admin" className="hover:text-brand-400 transition-colors">Admin</Link>
          </div>
        </div>
      </div> */}

      {/* Breaking ticker */}
      {breaking && breaking.length > 0 && (
        <div className="bg-red-600 text-white">
          <div className="max-w-7xl mx-auto px-4 h-8 flex items-center gap-3 overflow-hidden">
            <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest shrink-0">
              <FiZap className="w-3 h-3" /> Breaking
            </span>
            <div className="ticker-wrap flex-1">
              <div className="ticker-content text-xs font-medium">
                {breaking.map((a, i) => (
                  <span key={a.id}>
                    <Link to={`/news/${a.slug}`} className="hover:underline">{a.title}</Link>
                    {i < breaking.length - 1 && <span className="mx-4 opacity-60">•</span>}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main header */}
      <div className="bg-dark-900">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-9 h-9 bg-brand-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-display font-bold text-lg">LFA</span>
            </div>
            <span className="font-display font-bold text-xl text-white hidden sm:block">
              Live Football Arena
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="px-3 py-2 text-dark-300 hover:text-white hover:bg-dark-700 rounded-lg text-sm font-medium transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 text-dark-300 hover:text-white hover:bg-dark-700 rounded-lg transition-colors"
            >
              <FiSearch className="w-5 h-5" />
            </button>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden p-2 text-dark-300 hover:text-white hover:bg-dark-700 rounded-lg transition-colors"
            >
              {menuOpen ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Search bar */}
        {searchOpen && (
          <div className="border-t border-dark-700 px-4 py-3">
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto flex gap-2">
              <input
                autoFocus
                type="text"
                value={searchQ}
                onChange={(e) => setSearchQ(e.target.value)}
                placeholder="Search news, matches, players..."
                className="flex-1 px-4 py-2 bg-dark-800 border border-dark-600 rounded-lg text-white placeholder-dark-400 text-sm focus:outline-none focus:border-brand-500"
              />
              <button type="submit" className="btn-primary text-sm">Search</button>
            </form>
          </div>
        )}

        {/* Mobile nav */}
        {menuOpen && (
          <nav className="lg:hidden border-t border-dark-700 px-4 py-3 flex flex-col gap-1">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setMenuOpen(false)}
                className="px-3 py-2.5 text-dark-300 hover:text-white hover:bg-dark-700 rounded-lg text-sm font-medium transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
