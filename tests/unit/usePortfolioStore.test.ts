import { describe, it, expect, beforeEach } from 'vitest';
import { usePortfolioStore } from '@/stores/usePortfolioStore';
import { featuredProjectsTracks, workExperienceTracks } from '@/data/portfolioData';

describe('Zustand Global Portfolio Store', () => {
  beforeEach(() => {
    // Reset store state
    usePortfolioStore.setState({
      currentTrack: featuredProjectsTracks[0],
      isPlaying: false,
      progress: 0,
      currentTimeSeconds: 0,
      recruiterMix: [],
      activeAccentTheme: 'green',
      activeView: 'home',
      activePlaylistId: 'featured-projects',
      activeRecommenderId: null,
      history: [{ view: 'home' }],
      historyIndex: 0,
      rightSidebarMode: 'inspector',
    });
  });

  it('should toggle bookmark and manage recruiter mix', () => {
    const { toggleBookmark, isBookmarked } = usePortfolioStore.getState();
    const trackId = featuredProjectsTracks[0].id;

    expect(isBookmarked(trackId)).toBe(false);

    toggleBookmark(trackId);
    expect(usePortfolioStore.getState().recruiterMix).toContain(trackId);
    expect(usePortfolioStore.getState().isBookmarked(trackId)).toBe(true);

    toggleBookmark(trackId);
    expect(usePortfolioStore.getState().recruiterMix).not.toContain(trackId);
    expect(usePortfolioStore.getState().isBookmarked(trackId)).toBe(false);
  });

  it('should toggle playback state and update progress', () => {
    const { togglePlay, setProgress, tickProgress } = usePortfolioStore.getState();

    expect(usePortfolioStore.getState().isPlaying).toBe(false);

    togglePlay();
    expect(usePortfolioStore.getState().isPlaying).toBe(true);

    tickProgress(5);
    expect(usePortfolioStore.getState().currentTimeSeconds).toBe(5);

    setProgress(50);
    expect(usePortfolioStore.getState().progress).toBe(50);
    expect(usePortfolioStore.getState().currentTimeSeconds).toBe(15);
  });

  it('should handle navigation stack and back/forward routing', () => {
    const {
      navigateToPlaylist,
      navigateToRecommender,
      navigateHome,
      navigateBack,
      navigateForward,
    } = usePortfolioStore.getState();

    expect(usePortfolioStore.getState().activeView).toBe('home');

    navigateToPlaylist('work-experience');
    expect(usePortfolioStore.getState().activeView).toBe('playlist');
    expect(usePortfolioStore.getState().activePlaylistId).toBe('work-experience');

    navigateToRecommender('saeed-murtaza');
    expect(usePortfolioStore.getState().activeView).toBe('recommender');
    expect(usePortfolioStore.getState().activeRecommenderId).toBe('saeed-murtaza');

    navigateBack();
    expect(usePortfolioStore.getState().activeView).toBe('playlist');

    navigateBack();
    expect(usePortfolioStore.getState().activeView).toBe('home');

    navigateForward();
    expect(usePortfolioStore.getState().activeView).toBe('playlist');
  });

  it('should update accent color themes', () => {
    const { setAccentTheme } = usePortfolioStore.getState();

    setAccentTheme('purple');
    expect(usePortfolioStore.getState().activeAccentTheme).toBe('purple');

    setAccentTheme('orange');
    expect(usePortfolioStore.getState().activeAccentTheme).toBe('orange');
  });

  it('should cycle nextTrack and prevTrack seamlessly', () => {
    const { setCurrentTrack, nextTrack, prevTrack } = usePortfolioStore.getState();

    setCurrentTrack(featuredProjectsTracks[0], false);
    expect(usePortfolioStore.getState().currentTrack.id).toBe(featuredProjectsTracks[0].id);

    nextTrack();
    expect(usePortfolioStore.getState().currentTrack.id).toBe(featuredProjectsTracks[1].id);

    prevTrack();
    expect(usePortfolioStore.getState().currentTrack.id).toBe(featuredProjectsTracks[0].id);
  });
});
