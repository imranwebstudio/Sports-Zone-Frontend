import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

export const timeAgo = (date: string) => dayjs(date).fromNow();

export const formatDate = (date: string) => dayjs(date).format('MMM D, YYYY');

export const formatMatchTime = (date: string) =>
  dayjs(date).format('ddd, MMM D · HH:mm');

export const getImageUrl = (path?: string) => {
  if (!path) return '/placeholder-image.jpg';
  if (path.startsWith('http')) return path;
  return `${(import.meta.env.VITE_API_URL || 'http://localhost:3001/api').replace('/api', '')}${path}`;
};

export const getCategoryColor = (color?: string) => color || '#16a34a';

export const truncate = (str: string, len: number) =>
  str.length > len ? str.slice(0, len) + '…' : str;

export const slugify = (str: string) =>
  str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

export const matchStatusLabel: Record<string, string> = {
  UPCOMING: 'Upcoming',
  LIVE:     'LIVE',
  HT:       'Half Time',
  FINISHED: 'FT',
  POSTPONED:'Postponed',
  CANCELLED:'Cancelled',
};

export const matchStatusColor: Record<string, string> = {
  UPCOMING:  'text-dark-500 bg-dark-100',
  LIVE:      'text-white bg-red-600',
  HT:        'text-white bg-orange-500',
  FINISHED:  'text-dark-700 bg-dark-200',
  POSTPONED: 'text-yellow-700 bg-yellow-100',
  CANCELLED: 'text-red-700 bg-red-100',
};
