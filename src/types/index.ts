export interface Category {
  id: string;
  name: string;
  slug: string;
  color?: string;
  icon?: string;
  _count?: { articles: number };
}

export interface Author {
  id: string;
  name: string;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  featuredImage?: string;
  author: Author;
  category: Category;
  status: 'DRAFT' | 'PUBLISHED' | 'SCHEDULED' | 'ARCHIVED';
  isBreaking: boolean;
  isTrending: boolean;
  isFeatured: boolean;
  viewCount: number;
  readTime: number;
  tags: string[];
  metaTitle?: string;
  metaDescription?: string;
  publishedAt?: string;
  createdAt: string;
}

export interface Team {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  country?: string;
}

export interface Tournament {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  country?: string;
}

export interface Channel {
  id: string;
  matchId: string;
  name: string;
  language: string;
  logo?: string;
  thumbnail?: string;
  destinationUrl: string;
  isActive: boolean;
  sortOrder: number;
}

export type MatchStatus = 'UPCOMING' | 'LIVE' | 'HT' | 'FINISHED' | 'POSTPONED' | 'CANCELLED';

export interface Match {
  id: string;
  title: string;
  slug: string;
  homeTeam: Team;
  awayTeam: Team;
  tournament: Tournament;
  matchTime: string;
  status: MatchStatus;
  homeScore?: number;
  awayScore?: number;
  minute?: number;
  banner?: string;
  isFeatured: boolean;
  destinationType: 'INTERNAL' | 'EXTERNAL';
  externalUrl?: string;
  channels: Channel[];
  viewCount: number;
}

export interface Advertisement {
  id: string;
  name: string;
  slot: string;
  network: string;
  code: string;
  isActive: boolean;
  position: number;
  page?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface DashboardStats {
  todayViews: number;
  totalViews: number;
  totalArticleViews: number;
  totalMatchViews: number;
  totalArticles: number;
  totalMatches: number;
  topArticles: Article[];
  topMatches: Match[];
}
