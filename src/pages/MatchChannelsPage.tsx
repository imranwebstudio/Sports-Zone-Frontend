import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import {
  FiPlayCircle, FiCalendar, FiTv, FiGlobe, FiExternalLink,
  FiRefreshCw, FiActivity,
} from 'react-icons/fi';
import { matchesApi, articlesApi, analyticsApi } from '../services/api';
import { Match, Article, PaginatedResponse } from '../types';
import { formatMatchTime, getImageUrl, matchStatusLabel, matchStatusColor } from '../utils';
import { Loader } from '../components/ui/Loader';
import NewsCard from '../components/news/NewsCard';
import AdBlock from '../components/ads/AdBlock';

// ─── Live event helpers ───────────────────────────────────────────────────────

function eventIcon(type: string, detail: string) {
  if (type === 'Goal') return '⚽';
  if (type === 'Card' && detail === 'Yellow Card') return '🟨';
  if (type === 'Card' && detail === 'Red Card') return '🟥';
  if (type === 'subst') return '🔄';
  if (type === 'Var') return '📺';
  return '•';
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const TeamDisplay = ({ team }: { team: Match['homeTeam'] }) => (
  <div className="flex flex-col items-center gap-3">
    <div className="w-20 h-20 rounded-full bg-dark-100 border-4 border-dark-200 overflow-hidden flex items-center justify-center">
      {team.logo ? (
        <img src={getImageUrl(team.logo)} alt={team.name} className="w-16 h-16 object-contain" />
      ) : (
        <span className="text-3xl font-display font-bold text-dark-300">
          {team.name.slice(0, 2).toUpperCase()}
        </span>
      )}
    </div>
    <div className="text-center">
      <p className="font-display font-bold text-xl text-dark-900">{team.name}</p>
      {team.country && <p className="text-sm text-dark-400">{team.country}</p>}
    </div>
  </div>
);

// ─── Main page ────────────────────────────────────────────────────────────────

export default function MatchChannelsPage() {
  const { slug } = useParams<{ slug: string }>();

  const { data: match, isLoading, error } = useQuery<Match>({
    queryKey: ['match', slug],
    queryFn: () => matchesApi.getOne(slug!).then((r) => r.data),
    enabled: !!slug,
  });

  const isActiveMatch = match?.status === 'LIVE' || match?.status === 'HT' || match?.status === 'UPCOMING';

  const { data: liveMatch, dataUpdatedAt } = useQuery<any>({
    queryKey: ['match-live', slug],
    queryFn: () => matchesApi.getLiveData(slug!).then((r) => r.data),
    enabled: !!slug && !!match,
    refetchInterval: isActiveMatch ? 30_000 : false,
    staleTime: 25_000,
  });

  const { data: sideNews } = useQuery<PaginatedResponse<Article>>({
    queryKey: ['articles', 'sidebar'],
    queryFn: () => articlesApi.getAll({ limit: 8 }).then((r) => r.data),
    staleTime: 120_000,
  });

  const { data: trending } = useQuery<Article[]>({
    queryKey: ['trending'],
    queryFn: () => articlesApi.getTrending(5).then((r) => r.data),
    staleTime: 120_000,
  });

  useEffect(() => {
    if (slug) analyticsApi.track(`/matches/${slug}`, document.referrer);
  }, [slug]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4">
        <Loader text="Loading match..." />
      </div>
    );
  }

  if (error || !match) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-display font-bold">Match Not Found</h1>
        <Link to="/" className="btn-primary mt-6 inline-flex">Back to Home</Link>
      </div>
    );
  }

  // Prefer live API data for scores/minute when available
  const liveData = liveMatch?.liveData;
  const displayScore = liveData
    ? { home: liveData.score.home, away: liveData.score.away }
    : { home: match.homeScore, away: match.awayScore };
  const displayMinute = liveData?.elapsed ?? match.minute;
  const hasScore = displayScore.home != null && displayScore.away != null;

  const statusCls = matchStatusColor[match.status];
  const isLive = match.status === 'LIVE' || match.status === 'HT';

  const goals = (liveData?.events || []).filter(
    (e: any) => e.type === 'Goal',
  );
  const cards = (liveData?.events || []).filter(
    (e: any) => e.type === 'Card' && (e.detail === 'Red Card' || e.detail === 'Yellow Card'),
  );
  const hasEvents = goals.length > 0 || cards.length > 0;

  const lastUpdated = dataUpdatedAt
    ? new Date(dataUpdatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : null;

  const schemaMarkup = {
    '@context': 'https://schema.org',
    '@type': 'SportsEvent',
    name: match.title,
    startDate: match.matchTime,
    sport: 'Football',
    homeTeam: { '@type': 'SportsTeam', name: match.homeTeam.name },
    awayTeam: { '@type': 'SportsTeam', name: match.awayTeam.name },
    location: { '@type': 'Place', name: match.tournament.name },
  };

  return (
    <>
      <Helmet>
        <title>{match.title} — Live Stream & Channels | SportsZone</title>
        <meta name="description" content={`Watch ${match.title} live. Find all available channels and streams for this match. ${match.tournament.name}.`} />
        <meta property="og:title" content={match.title} />
        <meta property="og:type" content="website" />
        <link rel="canonical" href={`https://sportszone.com/matches/${match.slug}`} />
        <script type="application/ld+json">{JSON.stringify(schemaMarkup)}</script>
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <nav className="text-sm text-dark-500 mb-4 flex items-center gap-2">
          <Link to="/" className="hover:text-brand-600">Home</Link>
          <span>/</span>
          <Link to="/matches" className="hover:text-brand-600">Matches</Link>
          <span>/</span>
          <span className="text-dark-800 font-medium">{match.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
          <main className="min-w-0 space-y-6">
            {/* Match Header Card */}
            <div className="card overflow-hidden">
              {match.banner && (
                <div className="h-36 overflow-hidden">
                  <img src={getImageUrl(match.banner)} alt={match.title} className="w-full h-full object-cover" />
                </div>
              )}

              {/* Tournament bar */}
              <div className="bg-dark-800 px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {match.tournament.logo && (
                    <img src={getImageUrl(match.tournament.logo)} alt={match.tournament.name} className="w-5 h-5 object-contain" />
                  )}
                  <span className="text-dark-200 text-sm font-medium">{match.tournament.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-bold px-3 py-1 rounded-full flex items-center gap-1.5 ${statusCls}`}>
                    {isLive && <span className="live-dot" />}
                    {liveData ? liveData.statusLong : matchStatusLabel[match.status]}
                  </span>
                  {isActiveMatch && liveData && (
                    <span className="text-dark-400 text-xs flex items-center gap-1">
                      <FiRefreshCw className="w-3 h-3" />
                      {lastUpdated}
                    </span>
                  )}
                </div>
              </div>

              {/* Score section */}
              <div className="p-8">
                <div className="flex items-center justify-between gap-4">
                  <TeamDisplay team={match.homeTeam} />

                  <div className="text-center flex-shrink-0">
                    {(isLive || match.status === 'FINISHED') && hasScore ? (
                      <>
                        <div className="font-display font-bold text-5xl text-dark-900 mb-1 tabular-nums">
                          {displayScore.home} <span className="text-dark-300">—</span> {displayScore.away}
                        </div>
                        {displayMinute != null && isLive && (
                          <div className="text-red-600 font-bold text-sm">{displayMinute}'</div>
                        )}
                        {match.status === 'FINISHED' && (
                          <div className="text-sm text-dark-500 font-normal mt-1">Full Time</div>
                        )}
                      </>
                    ) : (
                      <div>
                        <div className="text-2xl font-display font-bold text-dark-300 mb-2">VS</div>
                        <div className="flex items-center gap-1.5 text-sm text-dark-500">
                          <FiCalendar className="w-4 h-4" />
                          {formatMatchTime(match.matchTime)}
                        </div>
                      </div>
                    )}
                  </div>

                  <TeamDisplay team={match.awayTeam} />
                </div>
              </div>

              {/* Stats bar from API */}
              {liveData?.stats && (
                <div className="border-t border-dark-100 px-6 py-4 bg-dark-50">
                  <div className="grid grid-cols-3 gap-4 text-center text-sm">
                    {[
                      { label: 'Possession', home: liveData.stats.home.possession, away: liveData.stats.away.possession },
                      { label: 'Shots on Goal', home: liveData.stats.home.shotsOnGoal, away: liveData.stats.away.shotsOnGoal },
                      { label: 'Corners', home: liveData.stats.home.corners, away: liveData.stats.away.corners },
                    ].map(({ label, home, away }) =>
                      home != null || away != null ? (
                        <div key={label}>
                          <div className="flex justify-between font-semibold text-dark-800 text-base mb-0.5">
                            <span>{home ?? '—'}</span>
                            <span>{away ?? '—'}</span>
                          </div>
                          <div className="text-xs text-dark-400">{label}</div>
                        </div>
                      ) : null,
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Goal / Card events */}
            {hasEvents && (
              <section>
                <h2 className="section-title mb-3 flex items-center gap-2">
                  <FiActivity className="w-5 h-5 text-brand-500" />
                  Match Events
                </h2>
                <div className="card divide-y divide-dark-100">
                  {[...goals, ...cards]
                    .sort((a: any, b: any) => a.elapsed - b.elapsed)
                    .map((e: any, i: number) => (
                      <div key={i} className="px-4 py-3 flex items-center gap-3 text-sm">
                        <span className="w-9 text-right font-mono text-dark-400 shrink-0">
                          {e.elapsed}{e.extraTime ? `+${e.extraTime}` : ''}'
                        </span>
                        <span className="text-lg shrink-0">{eventIcon(e.type, e.detail)}</span>
                        <div className="flex-1 min-w-0">
                          <span className="font-medium text-dark-800">{e.playerName}</span>
                          {e.detail && e.detail !== 'Normal Goal' && (
                            <span className="text-dark-400 ml-1 text-xs">({e.detail})</span>
                          )}
                        </div>
                        <span className="text-xs text-dark-400 shrink-0">{e.teamName}</span>
                      </div>
                    ))}
                </div>
              </section>
            )}

            <AdBlock slot="MATCH_PAGE_TOP" style={{ minHeight: 90 }} />

            {/* Channel list */}
            {match.channels && match.channels.length > 0 ? (
              <section>
                <h2 className="section-title mb-4 flex items-center gap-2">
                  <FiTv className="w-5 h-5 text-brand-500" />
                  Available Channels
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {match.channels.map((ch) => (
                    <a
                      key={ch.id}
                      href={ch.destinationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group card p-4 flex items-center gap-4 hover:border-brand-400 hover:shadow-md transition-all"
                    >
                      <div className="w-14 h-14 rounded-xl bg-dark-100 overflow-hidden shrink-0 flex items-center justify-center">
                        {ch.logo ? (
                          <img src={getImageUrl(ch.logo)} alt={ch.name} className="w-12 h-12 object-contain" />
                        ) : (
                          <FiTv className="w-6 h-6 text-dark-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-display font-semibold text-dark-900 group-hover:text-brand-600 transition-colors">
                          {ch.name}
                        </p>
                        <p className="text-sm text-dark-500 flex items-center gap-1">
                          <FiGlobe className="w-3.5 h-3.5" /> {ch.language}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="btn-primary text-xs py-1.5 gap-1">
                          <FiPlayCircle className="w-3.5 h-3.5" />
                          Watch
                          <FiExternalLink className="w-3 h-3 opacity-70" />
                        </span>
                      </div>
                    </a>
                  ))}
                </div>
              </section>
            ) : (
              <div className="card p-10 text-center text-dark-400">
                <FiTv className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="font-medium">No channels available yet</p>
                <p className="text-sm mt-1">Check back closer to match time for stream links.</p>
              </div>
            )}

            <AdBlock slot="MATCH_PAGE_BOTTOM" style={{ minHeight: 90 }} />
          </main>

          {/* Sidebar */}
          <aside className="hidden lg:block space-y-6">
            <AdBlock slot="RIGHT_SIDEBAR_TOP" style={{ minHeight: 250 }} />

            <div className="card p-4">
              <h3 className="section-title mb-4">Latest News</h3>
              <div className="space-y-1">
                {sideNews?.items.slice(0, 6).map((a) => (
                  <NewsCard key={a.id} article={a} variant="horizontal" />
                ))}
              </div>
            </div>

            <div className="card p-4">
              <h3 className="section-title mb-4">Trending</h3>
              <div className="space-y-1">
                {trending?.map((a) => (
                  <NewsCard key={a.id} article={a} variant="mini" />
                ))}
              </div>
            </div>

            <AdBlock slot="RIGHT_SIDEBAR_BOTTOM" style={{ minHeight: 250 }} />
          </aside>
        </div>
      </div>
    </>
  );
}
