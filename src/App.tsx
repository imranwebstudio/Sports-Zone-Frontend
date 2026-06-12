import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';
import { analyticsApi } from './services/api';
import { useAuthStore } from './store/authStore';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';

// Lazy loaded pages
const HomePage         = lazy(() => import('./pages/HomePage'));
const NewsDetailPage   = lazy(() => import('./pages/NewsDetailPage'));
const MatchChannelsPage= lazy(() => import('./pages/MatchChannelsPage'));
const MatchesPage      = lazy(() => import('./pages/MatchesPage'));
const CategoryPage     = lazy(() => import('./pages/CategoryPage'));
const SearchPage       = lazy(() => import('./pages/SearchPage'));

// Admin
const AdminLoginPage      = lazy(() => import('./pages/admin/AdminLoginPage'));
const AdminLayout         = lazy(() => import('./components/admin/AdminLayout'));
const AdminDashboardPage  = lazy(() => import('./pages/admin/AdminDashboardPage'));
const AdminMatchesPage    = lazy(() => import('./pages/admin/AdminMatchesPage'));
const AdminArticlesPage   = lazy(() => import('./pages/admin/AdminArticlesPage'));
const AdminCategoriesPage = lazy(() => import('./pages/admin/AdminCategoriesPage'));
const AdminTeamsPage        = lazy(() => import('./pages/admin/AdminTeamsPage'));
const AdminTournamentsPage  = lazy(() => import('./pages/admin/AdminTournamentsPage'));
const AdminAdsPage          = lazy(() => import('./pages/admin/AdminAdsPage'));
const AdminAnalyticsPage  = lazy(() => import('./pages/admin/AdminAnalyticsPage'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 60_000,
    },
  },
});

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;
  return <>{children}</>;
}

function PageTracker() {
  const location = useLocation();
  useEffect(() => {
    if (!location.pathname.startsWith('/admin')) {
      analyticsApi.track(location.pathname + location.search, document.referrer).catch(() => {});
    }
  }, [location.pathname, location.search]);
  return null;
}

function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  );
}

const Spinner = () => (
  <div className="flex items-center justify-center min-h-[200px]">
    <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
  </div>
);

export default function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <PageTracker />
          <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
          <Suspense fallback={<Spinner />}>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<PublicLayout><HomePage /></PublicLayout>} />
              <Route path="/news/:slug" element={<PublicLayout><NewsDetailPage /></PublicLayout>} />
              <Route path="/matches" element={<PublicLayout><MatchesPage /></PublicLayout>} />
              <Route path="/matches/:slug" element={<PublicLayout><MatchChannelsPage /></PublicLayout>} />
              <Route path="/category/:slug" element={<PublicLayout><CategoryPage /></PublicLayout>} />
              <Route path="/search" element={<PublicLayout><SearchPage /></PublicLayout>} />

              {/* Admin */}
              <Route path="/admin/login" element={<AdminLoginPage />} />
              <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
                <Route index element={<AdminDashboardPage />} />
                <Route path="matches" element={<AdminMatchesPage />} />
                <Route path="articles" element={<AdminArticlesPage />} />
                <Route path="categories" element={<AdminCategoriesPage />} />
                <Route path="teams" element={<AdminTeamsPage />} />
                <Route path="tournaments" element={<AdminTournamentsPage />} />
                <Route path="ads" element={<AdminAdsPage />} />
                <Route path="analytics" element={<AdminAnalyticsPage />} />
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </QueryClientProvider>
    </HelmetProvider>
  );
}
