import React from 'react';
import { cn } from '@/lib/utils';
import { deepTone, isLight } from '@/lib/color';
import { ArtGlyph, ArtKind } from './Icons';
import { RECRUITER_MIX_GRADIENT, TECH_PLAYLIST_PREFIX } from '@/lib/catalog';
import { allPlaylists } from '@/data/portfolioData';

/** Glyph for a playlist's generated cover, as chosen in content (`artKind`). */
export function artKindFor(playlistId: string | undefined): ArtKind {
  if (!playlistId || playlistId.startsWith(TECH_PLAYLIST_PREFIX)) return 'note';
  return allPlaylists.find((p) => p.id === playlistId)?.artKind ?? 'note';
}

interface CoverArtProps {
  color: string;
  kind: ArtKind;
  /** Uploaded artwork (/uploads/...). When set it replaces the generated cover. */
  image?: string;
  /** Rendered bottom-left like Spotify's editorial playlist tiles (only on large covers). */
  title?: string;
  size?: number | string;
  rounded?: 'sm' | 'md' | 'full';
  shadow?: boolean;
  isRecruiterMix?: boolean;
  className?: string;
  children?: React.ReactNode;
}

/**
 * Generated artwork. Spotify playlists always have an image; this stands in for
 * one with the decorative palette, a category glyph and optional title lettering.
 */
export const CoverArt: React.FC<CoverArtProps> = ({
  color,
  kind,
  image,
  title,
  size,
  rounded = 'sm',
  shadow = false,
  isRecruiterMix = false,
  className,
  children,
}) => {
  const numericSize = typeof size === 'number' ? size : undefined;
  const showTitle = !!title && (numericSize === undefined || numericSize >= 140);
  const glyphColor = isRecruiterMix ? '#ffffff' : isLight(color) ? 'rgba(0,0,0,0.72)' : 'rgba(255,255,255,0.92)';
  const background = isRecruiterMix
    ? RECRUITER_MIX_GRADIENT
    : `linear-gradient(135deg, ${color} 0%, ${color} 45%, ${deepTone(color, 0.32)} 140%)`;
  const glyphSize = numericSize ? Math.max(14, Math.round(numericSize * (showTitle ? 0.34 : 0.42))) : undefined;

  return (
    <div
      className={cn(
        'relative flex-shrink-0 overflow-hidden select-none',
        rounded === 'full' ? 'rounded-full' : rounded === 'md' ? 'rounded-md' : 'rounded',
        shadow && 'shadow-spotify-art',
        className
      )}
      style={{ background, width: size, height: size }}
      aria-hidden="true"
    >
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element -- static export: no image optimiser
        <img src={image} alt="" loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover" />
      ) : (
      <>
      <div
        className={cn('absolute inset-0 flex', showTitle ? 'items-start justify-end p-[9%]' : 'items-center justify-center')}
        style={{ color: glyphColor }}
      >
        <ArtGlyph kind={kind} size={glyphSize} className={!glyphSize ? 'h-[42%] w-[42%]' : undefined} />
      </div>
      {showTitle && (
        <p
          className="absolute bottom-0 left-0 right-0 p-[8%] font-black leading-[1.05] tracking-tight line-clamp-3"
          style={{
            color: glyphColor,
            fontSize: numericSize ? Math.round(numericSize * 0.11) : '1.1rem',
          }}
        >
          {title}
        </p>
      )}
      </>
      )}
      {children}
    </div>
  );
};
