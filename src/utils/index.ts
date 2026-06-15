import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

export const timeAgo = (date: string) => dayjs(date).fromNow();

export const formatDate = (date: string) => dayjs(date).format('MMM D, YYYY');

export const formatMatchTime = (date: string) =>
  dayjs(date).format('ddd, MMM D · hh:mm A');

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

export interface Countdown {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number; // total ms remaining
}

export const getCountdown = (date: string): Countdown | null => {
  const total = dayjs(date).diff(dayjs());
  if (total <= 0) return null;
  const days    = Math.floor(total / (1000 * 60 * 60 * 24));
  const hours   = Math.floor((total / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((total / (1000 * 60)) % 60);
  const seconds = Math.floor((total / 1000) % 60);
  return { days, hours, minutes, seconds, total };
};

export const formatCountdown = (date: string): string => {
  const cd = getCountdown(date);
  if (!cd) return timeAgo(date);
  if (cd.days > 0) return `${cd.days}d ${cd.hours}h ${cd.minutes}m`;
  if (cd.hours > 0) return `${cd.hours}h ${cd.minutes}m ${cd.seconds}s`;
  return `${cd.minutes}m ${cd.seconds}s`;
};
