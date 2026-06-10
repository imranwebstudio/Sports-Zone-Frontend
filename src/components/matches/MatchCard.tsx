import React from 'react';
import { Link } from 'react-router-dom';
import { FiPlayCircle, FiCalendar } from 'react-icons/fi';
import { Match } from '../../types';
import { formatMatchTime, getImageUrl, matchStatusLabel, matchStatusColor } from '../../utils';

interface MatchCardProps {
  match: Match;
  variant?: 'default' | 'compact';
}

const TeamLogo = ({ logo, name }: { logo?: string; name: string }) => (
  <div className="flex flex-col items-center gap-2 flex-1">
    <div className="w-14 h-14 rounded-full bg-dark-100 border-2 border-dark-200 overflow-hidden flex items-center justify-center">
      {logo ? (
        <img src={getImageUrl(logo)} alt={name} className="w-10 h-10 object-contain" />
      ) : (
        <span className="text-xl font-display font-bold text-dark-400">
          {name.slice(0, 2).toUpperCase()}
        </span>
      )}
    </div>
    <span className="text-sm font-semibold text-dark-800 text-center leading-tight max-w-[80px] line-clamp-2">
      {name}
    </span>
  </div>
);

export default function MatchCard({ match, variant = 'default' }: MatchCardProps) {
  const href =
    match.destinationType === 'EXTERNAL' && match.externalUrl
      ? match.externalUrl
      : `/matches/${match.slug}`;
  const isExternal = match.destinationType === 'EXTERNAL' && !!match.externalUrl;
  const statusCls = matchStatusColor[match.status] || 'text-dark-700 bg-dark-200';
  const isLive = match.status === 'LIVE' || match.status === 'HT';

  if (variant === 'compact') {
    return (
      <Link
        to={!isExternal ? href : '#'}
        {...(isExternal ? { as: 'a', href, target: '_blank', rel: 'noopener noreferrer' } : {})}
        className="group card p-3 flex items-center gap-3 hover:border-brand-300 transition-colors"
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="w-7 h-7 rounded-full bg-dark-100 overflow-hidden shrink-0">
            {match.homeTeam.logo
              ? <img src={getImageUrl(match.homeTeam.logo)} alt={match.homeTeam.name} className="w-full h-full object-contain" />
              : <span className="text-xs font-bold flex items-center justify-center h-full text-dark-500">{match.homeTeam.name[0]}</span>
            }
          </div>
          <span className="text-sm font-medium text-dark-700 truncate">{match.homeTeam.name}</span>
        </div>
        <div className="shrink-0 text-center px-3">
          {isLive && match.homeScore != null ? (
            <span className="font-display font-bold text-dark-900">
              {match.homeScore} – {match.awayScore}
            </span>
          ) : (
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${statusCls}`}>
              {matchStatusLabel[match.status]}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
          <span className="text-sm font-medium text-dark-700 truncate">{match.awayTeam.name}</span>
          <div className="w-7 h-7 rounded-full bg-dark-100 overflow-hidden shrink-0">
            {match.awayTeam.logo
              ? <img src={getImageUrl(match.awayTeam.logo)} alt={match.awayTeam.name} className="w-full h-full object-contain" />
              : <span className="text-xs font-bold flex items-center justify-center h-full text-dark-500">{match.awayTeam.name[0]}</span>
            }
          </div>
        </div>
      </Link>
    );
  }

  const CardWrapper = ({ children }: { children: React.ReactNode }) =>
    isExternal ? (
      <a href={href} target="_blank" rel="noopener noreferrer" className="group card overflow-hidden hover:border-brand-400 hover:shadow-md transition-all">
        {children}
      </a>
    ) : (
      <Link to={href} className="group card overflow-hidden hover:border-brand-400 hover:shadow-md transition-all">
        {children}
      </Link>
    );

  return (
    <CardWrapper>
      {/* Tournament header */}
      <div className="bg-dark-800 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {match.tournament.logo && (
            <img src={getImageUrl(match.tournament.logo)} alt={match.tournament.name} className="w-4 h-4 object-contain" />
          )}
          <span className="text-dark-300 text-xs font-medium truncate">{match.tournament.name}</span>
        </div>
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${statusCls}`}>
          {isLive && <span className="live-dot" />}
          {match.status === 'LIVE' && match.minute ? `${match.minute}'` : matchStatusLabel[match.status]}
        </span>
      </div>

      {/* Teams */}
      <div className="p-5 flex items-center gap-4">
        <TeamLogo logo={match.homeTeam.logo} name={match.homeTeam.name} />

        <div className="flex-1 text-center">
          {(match.status === 'LIVE' || match.status === 'HT' || match.status === 'FINISHED') && match.homeScore != null ? (
            <div className="font-display font-bold text-2xl text-dark-900">
              {match.homeScore} – {match.awayScore}
            </div>
          ) : (
            <div className="text-xs text-dark-400 flex items-center justify-center gap-1">
              <FiCalendar className="w-3 h-3" />
              {formatMatchTime(match.matchTime)}
            </div>
          )}
          {match.status === 'HT' && (
            <div className="text-xs text-orange-600 font-semibold mt-1">Half Time</div>
          )}
        </div>

        <TeamLogo logo={match.awayTeam.logo} name={match.awayTeam.name} />
      </div>

      {/* Watch button */}
      <div className="px-4 pb-4">
        <button className="w-full btn-primary text-sm justify-center gap-2">
          <FiPlayCircle className="w-4 h-4" />
          {isLive ? 'Watch Live' : 'Match Details'}
        </button>
      </div>
    </CardWrapper>
  );
}
