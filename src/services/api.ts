import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sz_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('sz_token');
      if (window.location.pathname.startsWith('/admin')) {
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(err);
  },
);

// ─── Articles ────────────────────────────────────────────────────────────────
export const articlesApi = {
  getAll: (params?: Record<string, any>) => api.get('/articles', { params }),
  getAllAdmin: (params?: Record<string, any>) => api.get('/articles/admin', { params }),
  getOne: (slug: string) => api.get(`/articles/${slug}`),
  getTrending: (limit = 6) => api.get('/articles/trending', { params: { limit } }),
  getBreaking: (limit = 5) => api.get('/articles/breaking', { params: { limit } }),
  getFeatured: (limit = 4) => api.get('/articles/featured', { params: { limit } }),
  getStats: () => api.get('/articles/stats'),
  create: (data: any) => api.post('/articles', data),
  update: (id: string, data: any) => api.patch(`/articles/${id}`, data),
  remove: (id: string) => api.delete(`/articles/${id}`),
};

// ─── Matches ─────────────────────────────────────────────────────────────────
export const matchesApi = {
  getAll: (params?: Record<string, any>) => api.get('/matches', { params }),
  getLive: () => api.get('/matches/live'),
  getFeatured: () => api.get('/matches/featured'),
  getOne: (slug: string) => api.get(`/matches/${slug}`),
  getLiveData: (slug: string) => api.get(`/matches/${slug}/live`),
  getStats: () => api.get('/matches/stats'),
  create: (data: any) => api.post('/matches', data),
  update: (id: string, data: any) => api.patch(`/matches/${id}`, data),
  remove: (id: string) => api.delete(`/matches/${id}`),
};

// ─── Categories ──────────────────────────────────────────────────────────────
export const categoriesApi = {
  getAll: () => api.get('/categories'),
  getOne: (slug: string) => api.get(`/categories/${slug}`),
  create: (data: any) => api.post('/categories', data),
  update: (id: string, data: any) => api.patch(`/categories/${id}`, data),
  remove: (id: string) => api.delete(`/categories/${id}`),
};

// ─── Channels ────────────────────────────────────────────────────────────────
export const channelsApi = {
  getByMatch: (matchId: string) => api.get(`/channels/match/${matchId}`),
  create: (data: any) => api.post('/channels', data),
  update: (id: string, data: any) => api.patch(`/channels/${id}`, data),
  remove: (id: string) => api.delete(`/channels/${id}`),
};

// ─── Teams ───────────────────────────────────────────────────────────────────
export const teamsApi = {
  getAll: (search?: string) => api.get('/teams', { params: { search } }),
  create: (data: any) => api.post('/teams', data),
  update: (id: string, data: any) => api.patch(`/teams/${id}`, data),
  remove: (id: string) => api.delete(`/teams/${id}`),
};

// ─── Tournaments ─────────────────────────────────────────────────────────────
export const tournamentsApi = {
  getAll: () => api.get('/tournaments'),
  create: (data: any) => api.post('/tournaments', data),
  update: (id: string, data: any) => api.patch(`/tournaments/${id}`, data),
  remove: (id: string) => api.delete(`/tournaments/${id}`),
};

// ─── Ads ─────────────────────────────────────────────────────────────────────
export const adsApi = {
  getAll: () => api.get('/advertisements'),
  getActive: (page?: string) => api.get('/advertisements/active', { params: { page } }),
  getBySlot: (slot: string) => api.get(`/advertisements/slot/${slot}`),
  create: (data: any) => api.post('/advertisements', data),
  update: (id: string, data: any) => api.patch(`/advertisements/${id}`, data),
  toggle: (id: string) => api.patch(`/advertisements/${id}/toggle`),
  remove: (id: string) => api.delete(`/advertisements/${id}`),
};

// ─── Analytics ───────────────────────────────────────────────────────────────
export const analyticsApi = {
  track: (path: string, referrer?: string) =>
    api.post('/analytics/track', { path, referrer }),
  getDashboard: () => api.get('/analytics/dashboard'),
};

// ─── Auth ────────────────────────────────────────────────────────────────────
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  getProfile: () => api.get('/auth/profile'),
  changePassword: (oldPassword: string, newPassword: string) =>
    api.patch('/auth/change-password', { oldPassword, newPassword }),
};

// ─── Upload ──────────────────────────────────────────────────────────────────
export const uploadApi = {
  image: (file: File) => {
    const form = new FormData();
    form.append('file', file);
    return api.post('/upload/image', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// ─── News Sync ────────────────────────────────────────────────────────────────
export const newsApi = {
  sync: () => api.post('/news-sync/trigger'),
};
