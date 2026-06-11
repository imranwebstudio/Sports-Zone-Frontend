import React, { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import {
  FiHome, FiFileText, FiCalendar, FiTag, FiTv,
  FiDollarSign, FiBarChart2, FiSettings, FiLogOut,
  FiMenu, FiX, FiUsers,
} from 'react-icons/fi';
import { useAuthStore } from '../../store/authStore';

const NAV = [
  { label: 'Dashboard', to: '/admin', icon: FiHome, end: true },
  { label: 'Matches', to: '/admin/matches', icon: FiCalendar },
  { label: 'Articles', to: '/admin/articles', icon: FiFileText },
  { label: 'Categories', to: '/admin/categories', icon: FiTag },
  { label: 'Teams', to: '/admin/teams', icon: FiUsers },
  { label: 'Tournaments', to: '/admin/tournaments', icon: FiTv },
  { label: 'Advertisements', to: '/admin/ads', icon: FiDollarSign },
  { label: 'Analytics', to: '/admin/analytics', icon: FiBarChart2 },
  { label: 'Settings', to: '/admin/settings', icon: FiSettings },
];

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => { logout(); navigate('/admin/login'); };

  const isActive = (to: string, end?: boolean) =>
    end ? location.pathname === to : location.pathname.startsWith(to);

  return (
    <div className="flex h-screen bg-dark-50 overflow-hidden">
      {/* Sidebar */}
      <aside className={`${collapsed ? 'w-16' : 'w-64'} bg-dark-900 flex flex-col transition-all duration-200 shrink-0`}>
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-dark-700">
          {!collapsed && (
            <Link to="/" target="_blank" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-display font-bold text-sm">SZ</span>
              </div>
              <span className="font-display font-bold text-white text-sm">Live Football Arena</span>
            </Link>
          )}
          <button onClick={() => setCollapsed(!collapsed)} className="p-1.5 text-dark-400 hover:text-white rounded-lg hover:bg-dark-700">
            {collapsed ? <FiMenu className="w-5 h-5" /> : <FiX className="w-4 h-4" />}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 space-y-1 overflow-y-auto px-2">
          {NAV.map(({ label, to, icon: Icon, end }) => (
            <Link
              key={to}
              to={to}
              title={collapsed ? label : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive(to, end)
                  ? 'bg-brand-600 text-white'
                  : 'text-dark-400 hover:text-white hover:bg-dark-700'
              }`}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {!collapsed && label}
            </Link>
          ))}
        </nav>

        {/* User */}
        <div className="border-t border-dark-700 p-3">
          {!collapsed && (
            <div className="px-2 mb-2">
              <p className="text-white text-sm font-medium truncate">{user?.name}</p>
              <p className="text-dark-500 text-xs truncate">{user?.email}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2 text-dark-400 hover:text-red-400 hover:bg-dark-700 rounded-lg text-sm transition-colors"
          >
            <FiLogOut className="w-4 h-4 shrink-0" />
            {!collapsed && 'Logout'}
          </button>
        </div>
      </aside>

      {/* Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-dark-200 flex items-center justify-between px-6 shrink-0">
          <h1 className="font-display font-semibold text-dark-800">
            {NAV.find((n) => isActive(n.to, n.end))?.label || 'Admin'}
          </h1>
          <div className="flex items-center gap-3">
            <Link to="/" target="_blank" className="btn-ghost text-sm">
              View Site
            </Link>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
