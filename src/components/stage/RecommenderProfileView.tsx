import React from 'react';
import { useShallow } from 'zustand/react/shallow';
import { usePortfolioStore } from '@/stores/usePortfolioStore';
import { recommenders } from '@/data/portfolioData';
import { spotifyButtonClasses } from '@/components/common/SpotifyButton';
import { PlayButton } from '@/components/common/PlayButton';
import { IconButton } from '@/components/common/IconButton';
import { CoverArt, artKindFor } from '@/components/common/CoverArt';
import { FitTitle } from '@/components/common/FitTitle';
import { ArtGlyph, ExternalLinkIcon, MoreHorizontalIcon, VerifiedIcon } from '@/components/common/Icons';
import { findParentPlaylistId, findTrack } from '@/lib/catalog';
import { deepTone } from '@/lib/color';
import { copyToClipboard, openMenuAt } from '@/lib/menus';
import { StickyTopBar } from './StickyTopBar';
import { Shelf } from './Shelf';
import { MediaCard } from './MediaCard';
import { useHeaderArtSize } from './StageContext';

const HEADER_COLOR = deepTone('#649AED', 0.36);

export const RecommenderProfileView: React.FC = () => {
  const { activeRecommenderId, currentTrackId, isPlaying } = usePortfolioStore(
    useShallow((s) => ({
      activeRecommenderId: s.activeRecommenderId,
      currentTrackId: s.currentTrack.id,
      isPlaying: s.isPlaying,
    }))
  );
  const setCurrentTrack = usePortfolioStore((s) => s.setCurrentTrack);
  const togglePlay = usePortfolioStore((s) => s.togglePlay);
  const openTrackDetails = usePortfolioStore((s) => s.openTrackDetails);
  const artSize = useHeaderArtSize();

  const recommender = recommenders.find((r) => r.id === activeRecommenderId) || recommenders[0];
  const linkedTrack = findTrack(recommender.linkedTrackId);
  const linkedPlaying = !!linkedTrack && isPlaying && currentTrackId === linkedTrack.id;

  const playLinked = () => {
    if (!linkedTrack) return;
    if (currentTrackId === linkedTrack.id) togglePlay();
    else setCurrentTrack(linkedTrack, true, findParentPlaylistId(linkedTrack.id));
  };

  return (
    <div className="relative w-full select-none text-white">
      <StickyTopBar color={HEADER_COLOR} title={recommender.name} isPlaying={linkedPlaying} onPlay={linkedTrack ? playLinked : undefined} />

      <header
        className="relative flex min-h-[340px] items-end gap-6 px-6 pb-6 pt-20"
        style={{ backgroundColor: HEADER_COLOR, backgroundImage: 'linear-gradient(transparent 0, rgba(0,0,0,0.5) 100%)' }}
      >
        <div
          className="flex flex-shrink-0 items-center justify-center rounded-full bg-[#282828] font-black tracking-tighter text-white shadow-spotify-art"
          style={{ width: artSize, height: artSize, fontSize: artSize * 0.31 }}
        >
          {recommender.avatarInitials}
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <span className="flex items-center gap-2 text-sm text-white">
            <VerifiedIcon size={24} />
            Verified {recommender.type === 'academic' ? 'Academic' : 'Industry'} Endorsement
          </span>
          <FitTitle className="pb-2" maxSize={72}>
            {recommender.name}
          </FitTitle>
          <p className="text-sm text-white">{recommender.title}</p>
          <p className="text-sm text-[rgba(255,255,255,0.7)]">
            {recommender.affiliation} • <span className="font-bold text-white">{recommender.ranking}</span>
          </p>
        </div>
      </header>

      <div
        className="relative"
        style={{ backgroundColor: HEADER_COLOR, backgroundImage: 'linear-gradient(rgba(0,0,0,0.6) 0, #121212 232px)' }}
      >
        <div className="flex items-center gap-6 px-6 py-6">
          {linkedTrack && (
            <PlayButton
              isPlaying={linkedPlaying}
              label={linkedPlaying ? 'Pause' : `Play ${linkedTrack.title}`}
              onClick={playLinked}
            />
          )}
          <a href={recommender.externalUrl} target="_blank" rel="noopener noreferrer" className={spotifyButtonClasses('secondary')}>
            Google Scholar
            <ExternalLinkIcon size={14} />
          </a>
          {recommender.facultyProfileUrl && (
            <a
              href={recommender.facultyProfileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={spotifyButtonClasses('secondary')}
            >
              NUST faculty directory
              <ExternalLinkIcon size={14} />
            </a>
          )}
          <IconButton
            label={`More options for ${recommender.name}`}
            onClick={(e) =>
              openMenuAt(e, [
                {
                  id: 'email',
                  label: 'Copy email address',
                  onSelect: () => copyToClipboard(recommender.email, 'Email address copied'),
                },
                {
                  id: 'scholar',
                  label: 'Open Google Scholar',
                  external: true,
                  onSelect: () => window.open(recommender.externalUrl, '_blank', 'noopener,noreferrer'),
                },
              ])
            }
          >
            <MoreHorizontalIcon size={24} />
          </IconButton>
        </div>

        <Shelf
          title="Endorsed competencies"
          subtitle={`Disciplines verified by ${recommender.name}`}
          itemCount={recommender.competencies.length}
          className="pt-2"
        >
          {recommender.competencies.map((comp) => (
            <MediaCard
              key={comp.name}
              circular
              title={comp.name}
              subtitle="Endorsed"
              art={
                <div
                  className="flex h-full w-full items-center justify-center rounded-full"
                  style={{ backgroundColor: comp.color, color: 'rgba(0,0,0,0.7)' }}
                >
                  <ArtGlyph kind="star" className="h-[38%] w-[38%]" />
                </div>
              }
            />
          ))}
        </Shelf>

        <section className="grid grid-cols-1 gap-6 px-6 pb-10 pt-8 2xl:grid-cols-3">
          <div className="2xl:col-span-2">
            <h2 className="mb-4 text-2xl font-bold tracking-tight">About</h2>
            <article className="select-text rounded-lg bg-[rgba(255,255,255,0.07)] p-6">
              <p className="mb-4 text-sm font-bold text-subdued">Recommendation letter</p>
              <div className="space-y-4 text-base leading-relaxed text-white">
                {recommender.fullLetter.map((paragraph, idx) => (
                  <p key={idx}>{paragraph}</p>
                ))}
              </div>
              <footer className="mt-6 border-t border-[rgba(255,255,255,0.1)] pt-4 text-sm text-subdued">
                <p className="font-bold text-white">{recommender.name}</p>
                <p>{recommender.title}</p>
                <p>{recommender.affiliation}</p>
                <a href={`mailto:${recommender.email}`} className="mt-1 inline-block text-white hover:underline">
                  {recommender.email}
                </a>
              </footer>
            </article>
          </div>

          {linkedTrack && (
            <div>
              <h2 className="mb-4 text-2xl font-bold tracking-tight">Featuring</h2>
              <div className="max-w-[260px]">
                <MediaCard
                  title={linkedTrack.title}
                  subtitle={linkedTrack.subtitle}
                  isPlaying={linkedPlaying}
                  onOpen={() => openTrackDetails(linkedTrack)}
                  onPlay={playLinked}
                  art={
                    <CoverArt
                      color={linkedTrack.coverColor} image={linkedTrack.coverImage}
                      kind={artKindFor(linkedTrack.playlistId)}
                      title={linkedTrack.title}
                      rounded="md"
                      className="h-full w-full"
                    />
                  }
                />
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
