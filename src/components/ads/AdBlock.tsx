import React, { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adsApi } from '../../services/api';
import { Advertisement } from '../../types';

interface AdBlockProps {
  slot: string;
  className?: string;
  style?: React.CSSProperties;
  label?: boolean;
}

export default function AdBlock({ slot, className = '', style, label = true }: AdBlockProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const { data: ads } = useQuery<Advertisement[]>({
    queryKey: ['ads', slot],
    queryFn: () => adsApi.getBySlot(slot).then((r) => r.data),
    staleTime: 5 * 60_000,
  });

  useEffect(() => {
    if (!ads?.length || !containerRef.current) return;
    const ad = ads[0];
    if (ad.code) {
      containerRef.current.innerHTML = ad.code;
      // Execute any scripts
      containerRef.current.querySelectorAll('script').forEach((old) => {
        const fresh = document.createElement('script');
        Array.from(old.attributes).forEach((a) => fresh.setAttribute(a.name, a.value));
        fresh.textContent = old.textContent;
        old.parentNode?.replaceChild(fresh, old);
      });
    }
  }, [ads]);

  if (!ads || ads.length === 0) {
    return (
      <div className={`ad-placeholder ${className}`} style={{ minHeight: 90, ...style }}>
        {label && <span className="text-xs uppercase tracking-wider">Advertisement</span>}
        <span className="text-xs text-dark-300 mt-1">Ad space — {slot.replace(/_/g, ' ')}</span>
      </div>
    );
  }

  return (
    <div className={className} style={style}>
      {label && (
        <p className="text-center text-xs text-dark-400 uppercase tracking-wider mb-1">
          Advertisement
        </p>
      )}
      <div ref={containerRef} />
    </div>
  );
}
