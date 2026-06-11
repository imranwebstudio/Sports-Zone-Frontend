import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { authApi } from '../../services/api';
import { useAuthStore } from '../../store/authStore';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await authApi.login(email, password);
      setAuth(res.data.token, res.data.user);
      navigate('/admin');
    } catch {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet><title>Admin Login | Live Football Arena</title></Helmet>
      <div className="min-h-screen bg-dark-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-brand-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-display font-bold text-2xl">SZ</span>
            </div>
            <h1 className="text-2xl font-display font-bold text-white">Admin Login</h1>
            <p className="text-dark-400 mt-1">Live Football Arena Management Portal</p>
          </div>

          <div className="card p-8 bg-dark-800 border-dark-700">
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-1.5">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="admin@Live Football Arena.com"
                  className="w-full px-4 py-2.5 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:border-brand-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-1.5">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-dark-400 focus:outline-none focus:border-brand-500"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary justify-center py-3"
              >
                {loading ? 'Signing in…' : 'Sign In'}
              </button>
            </form>
          </div>

          <p className="text-center text-dark-500 text-xs mt-4">
            Default: admin@Live Football Arena.com / Admin@1234
          </p>
        </div>
      </div>
    </>
  );
}
