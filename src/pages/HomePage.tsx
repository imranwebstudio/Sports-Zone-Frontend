import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FiChevronRight, FiPlayCircle, FiWifi } from 'react-icons/fi';
import dayjs from 'dayjs';
import { matchesApi } from '../services/api';
import { Match } from '../types';
import Sidebar from '../components/layout/Sidebar';
import AdBlock from '../components/ads/AdBlock';
import { getImageUrl, matchStatusColor } from '../utils';
import whatsappIcon from '../../public/apple.png';
import telegramIcon from '../../public/telegram.png';

// ─── Match card styled after live-scores sites ───────────────────────────────

function ClosestMatchCard({ match }: { match: Match }) {
  const isLive = match.status === 'LIVE';
  const isHT = match.status === 'HT';
  const isFinished = match.status === 'FINISHED';
  const showScore = isLive || isHT || isFinished;

  const href =
    match.destinationType === 'EXTERNAL' && match.externalUrl
      ? match.externalUrl
      : `/matches/${match.slug}`;
  const isExternal = match.destinationType === 'EXTERNAL' && !!match.externalUrl;

  const statusCls = matchStatusColor[match.status] || 'text-dark-500 bg-dark-100';
  const statusText = isLive
    ? match.minute ? `${match.minute}' LIVE` : 'LIVE'
    : isHT ? 'Half Time'
    : isFinished ? 'The end'
    : "Hasn't started yet.";

  const firstChannel = match.channels?.[0];

  const TeamBadge = ({ logo, name, align }: { logo?: string; name: string; align: 'left' | 'right' }) => (
    <div className={`flex items-center gap-3 flex-1 min-w-0 ${align === 'right' ? 'flex-row-reverse' : ''}`}>
      <div className="w-12 h-12 shrink-0 rounded-full bg-dark-100 border border-dark-200 overflow-hidden flex items-center justify-center">
        {logo ? (
          <img src={getImageUrl(logo)} alt={name} className="w-10 h-10 object-contain" />
        ) : (
          <span className="text-sm font-bold text-dark-400">{name.slice(0, 2).toUpperCase()}</span>
        )}
      </div>
      <span className={`font-semibold text-dark-800 leading-snug text-sm line-clamp-2 ${align === 'right' ? 'text-right' : ''}`}>
        {name}
      </span>
    </div>
  );

  const card = (
    <div className="bg-white border border-dark-200 rounded-xl overflow-hidden mb-4 hover:border-brand-300 hover:shadow-md transition-all">
      {/* Main match row */}
      <div className="flex items-center px-4 py-5 gap-3">
        <TeamBadge logo={match.homeTeam.logo} name={match.homeTeam.name} align="left" />

        {/* Center: time / score + status pill */}
        <div className="flex flex-col items-center shrink-0 min-w-[110px] text-center gap-1.5">
          {showScore ? (
            <span className="text-2xl font-bold text-dark-900 font-mono">
              {match.homeScore ?? 0} – {match.awayScore ?? 0}
            </span>
          ) : (
            <span className="text-base font-bold text-dark-700">
              {dayjs(match.matchTime).format('HH:mm')}
            </span>
          )}
          <span className={`text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap ${statusCls}`}>
            {isLive && <span className="inline-block w-1.5 h-1.5 rounded-full bg-white mr-1 animate-pulse align-middle" />}
            {statusText}
          </span>
        </div>

        <TeamBadge logo={match.awayTeam.logo} name={match.awayTeam.name} align="right" />
      </div>

      {/* Footer: tournament + channel */}
      <div className="px-4 py-2 bg-dark-50 border-t border-dark-100 flex items-center justify-between gap-2">
        <span className="text-xs text-dark-500 truncate">
          International · {match.tournament.name}
        </span>
        {firstChannel ? (
          <span className="text-xs font-semibold text-brand-600 shrink-0">{firstChannel.name}</span>
        ) : (
          <span className="text-xs text-dark-400 flex items-center gap-1 shrink-0">
            <FiPlayCircle className="w-3 h-3" /> Watch
          </span>
        )}
      </div>
    </div>
  );

  if (isExternal) {
    return <a href={href} target="_blank" rel="noopener noreferrer">{card}</a>;
  }
  return <Link to={href}>{card}</Link>;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  const { data: liveMatches } = useQuery<Match[]>({
    queryKey: ['matches', 'live'],
    queryFn: () => matchesApi.getLive().then((r) => r.data),
    refetchInterval: 30_000,
    staleTime: 20_000,
  });

  const { data: upcomingData } = useQuery({
    queryKey: ['matches', 'upcoming-home'],
    queryFn: () => matchesApi.getAll({ status: 'UPCOMING', limit: 6 }).then((r) => r.data),
    staleTime: 60_000,
  });

  // 6 closest: live first, then soonest upcoming
  const closestMatches: Match[] = [
    ...(liveMatches || []),
    ...((upcomingData?.items || []) as Match[]).filter(
      (m) => !liveMatches?.find((lm) => lm.id === m.id),
    ),
  ].slice(0, 6);

  const anyLive = (liveMatches?.length ?? 0) > 0;

  return (
    <>
      <Helmet>
        <title>SportsZone — Live Scores, Sports News & Match Coverage</title>
        <meta name="description" content="Get live football scores, breaking sports news, match coverage, and live stream channels. Your #1 sports hub for FIFA World Cup, Premier League, and more." />
        <meta property="og:title" content="SportsZone — Live Scores & Sports News" />
        <meta property="og:description" content="Live football scores, sports news and match coverage." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://www.livefootballarena.online/" />
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: 'Live Football Arena',
          url: 'https://sportszone.com',
          potentialAction: {
            '@type': 'SearchAction',
            target: 'https://www.livefootballarena.online/search?q={search_term_string}',
            'query-input': 'required name=search_term_string',
          },
        })}</script>
      </Helmet>

      <AdBlock slot="HEADER_BANNER" style={{ minHeight: 90 }} className="max-w-7xl mx-auto px-4 my-3" />

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_280px] gap-6">

          {/* Left Sidebar — news lives here */}
          <div className="hidden lg:block">
            <Sidebar side="left" />
          </div>

          {/* Main Content — closest matches only */}
          <main className="min-w-0 space-y-6">
            {/* WhatsApp Banner */}
            <div className=" border border-green-400 bg-white rounded-lg p-4">
              <a href=" https://whatsapp.com/channel/0029Vb8BqPo0gcfNLczM5P3c" className="flex items-center justify-between " target="_blank" rel="noopener noreferrer">
                <img className='size-10' src={whatsappIcon} alt="WhatsApp" />
                <p className="text-md font-bold text-dark-800">Whatsapp channel </p>
                <a
                  href=" https://whatsapp.com/channel/0029Vb8BqPo0gcfNLczM5P3c"
                  target="_blank"
                  rel="noopener noreferrer"
                  className=" text-sm text-green-600 hover:text-green-700 font-medium flex items-center"
                >
                  Join Now <FiChevronRight className="w-4 h-4" />
                </a>
              </a>
            </div>

            {/* Telegram Banner */}
            <div className=" border border-green-400 bg-white rounded-lg p-4">
              <a href="https://t.me/Livefootballarena" className="flex items-center justify-between " target="_blank" rel="noopener noreferrer">
                <img className='size-10' src={telegramIcon} alt="Telegram" />
                <p className="text-md font-bold text-dark-800">Telegram channel </p>
                <a
                  href="https://t.me/Livefootballarena"
                  target="_blank"
                  rel="noopener noreferrer"
                  className=" text-sm text-green-600 hover:text-green-700 font-medium flex items-center"
                >
                  Join Now <FiChevronRight className="w-4 h-4" />
                </a>
              </a>
            </div>


            <section>
              <div className="flex items-center justify-between mb-4">
                <h1 className="section-title flex items-center gap-2">
                  {anyLive && (
                    <span className="flex items-center gap-1.5 text-red-600">
                      <FiWifi className="w-4 h-4 animate-pulse" /> Live &amp;
                    </span>
                  )}
                  Today's Matches
                </h1>
                <Link
                  to="/matches"
                  className="text-sm text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1"
                >
                  All Matches <FiChevronRight className="w-4 h-4" />
                </Link>
              </div>

              {closestMatches.length > 0 ? (
                <div className="space-y-3 ">
                  {closestMatches.map((match) => (
                    <ClosestMatchCard key={match.id} match={match} />
                  ))}
                </div>
              ) : (
                <div className="card p-12 text-center text-dark-400">
                  <p className="text-lg font-medium">No matches scheduled right now.</p>
                  <p className="text-sm mt-1">Check back soon for upcoming fixtures.</p>
                </div>
              )}
            </section>

            <AdBlock slot="BETWEEN_CONTENT" style={{ minHeight: 90 }} />
            <AdBlock slot="IN_ARTICLE_1" style={{ minHeight: 90 }} />
            <AdBlock slot="IN_ARTICLE_2" style={{ minHeight: 90 }} />
          </main>

          {/* Right Sidebar — news lives here */}
          <div className="hidden lg:block">
            <Sidebar side="right" />
          </div>
        </div>
      </div>

      <AdBlock slot="FOOTER_BANNER" style={{ minHeight: 90 }} className="max-w-7xl mx-auto px-4 mb-6" />

      {/* Sticky Mobile Ad */}
      <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden">
        <AdBlock slot="STICKY_MOBILE" style={{ height: 60 }} label={false} />
      </div>
    </>
  );
}
