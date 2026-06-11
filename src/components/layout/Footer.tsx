import React from 'react';
import { Link } from 'react-router-dom';
import { FiTwitter, FiYoutube, FiFacebook, FiInstagram } from 'react-icons/fi';

const CATEGORIES = [
  'Football', 'Cricket', 'Basketball', 'Tennis',
  'Formula 1', 'World Cup', 'Transfers',
];

const PAGES = [
  { label: 'About Us', to: '/about' },
  { label: 'Privacy Policy', to: '/privacy' },
  { label: 'Terms of Service', to: '/terms' },
  { label: 'Contact', to: '/contact' },
  { label: 'Advertise', to: '/advertise' },
  { label: 'Sitemap', to: '/sitemap.xml' },
];

export default function Footer() {
  return (
    <footer className="bg-dark-900 text-dark-300 mt-12">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-brand-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-display font-bold text-lg">SZ</span>
              </div>
              <span className="font-display font-bold text-xl text-white">
                Sports<span className="text-brand-400">Zone</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed mb-4">
              Your ultimate destination for live sports scores, news, and match coverage.
              Stay ahead of the game with SportsZone.
            </p>
            <div className="flex items-center gap-3">
              {[
                { Icon: FiTwitter, href: 'https://twitter.com' },
                { Icon: FiFacebook, href: 'https://facebook.com' },
                { Icon: FiYoutube, href: 'https://youtube.com' },
                { Icon: FiInstagram, href: 'https://instagram.com' },
              ].map(({ Icon, href }) => (
                <a
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 bg-dark-700 hover:bg-brand-600 rounded-lg flex items-center justify-center transition-colors"
                >
                  <Icon className="w-4 h-4 text-white" />
                </a>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-white font-semibold mb-4 font-display">Sports</h3>
            <ul className="space-y-2">
              {CATEGORIES.map((c) => (
                <li key={c}>
                  <Link
                    to={`/category/${c.toLowerCase().replace(/\s+/g, '-')}`}
                    className="text-sm hover:text-brand-400 transition-colors"
                  >
                    {c}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Pages */}
          <div>
            <h3 className="text-white font-semibold mb-4 font-display">Company</h3>
            <ul className="space-y-2">
              {PAGES.map((p) => (
                <li key={p.to}>
                  <Link to={p.to} className="text-sm hover:text-brand-400 transition-colors">
                    {p.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-white font-semibold mb-4 font-display">Newsletter</h3>
            <p className="text-sm mb-4">
              Get the latest sports news delivered straight to your inbox.
            </p>
            <form className="flex flex-col gap-2" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="your@email.com"
                className="px-3 py-2 bg-dark-800 border border-dark-600 rounded-lg text-white placeholder-dark-400 text-sm focus:outline-none focus:border-brand-500"
              />
              <button type="submit" className="btn-primary text-sm justify-center">
                Subscribe
              </button>
            </form>
          </div>
        </div>

        <div className="border-t border-dark-700 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
          <p>© {new Date().getFullYear()} SportsZone. All rights reserved.</p>
          <p>
            Powered by{' '}
            <span className="text-brand-400 font-medium">SportsZone Platform</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
