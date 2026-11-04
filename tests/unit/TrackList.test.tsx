import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { TrackList } from '@/components/stage/TrackList';
import { usePortfolioStore } from '@/stores/usePortfolioStore';
import { featuredProjectsTracks, workExperienceTracks } from '@/data/portfolioData';

describe('TrackList', () => {
  beforeEach(() => {
    usePortfolioStore.setState({
      currentTrack: featuredProjectsTracks[0],
      playContextId: 'featured-projects',
      isPlaying: false,
      selectedTrackId: null,
      recruiterMix: [],
      contextMenu: null,
    });
  });

  it('selects on click and plays in context on double-click, like Spotify', () => {
    render(<TrackList tracks={workExperienceTracks} contextId="work-experience" />);
    const row = screen.getByTestId('track-row-work-bizbuddy');

    fireEvent.click(row);
    expect(usePortfolioStore.getState().selectedTrackId).toBe('work-bizbuddy');
    expect(usePortfolioStore.getState().isPlaying).toBe(false);

    fireEvent.doubleClick(row);
    const s = usePortfolioStore.getState();
    expect(s.currentTrack.id).toBe('work-bizbuddy');
    expect(s.playContextId).toBe('work-experience');
    expect(s.isPlaying).toBe(true);
  });

  it('saves to the Recruiter Mix without selecting or playing the row', () => {
    render(<TrackList tracks={workExperienceTracks} contextId="work-experience" />);
    fireEvent.click(screen.getByTestId('track-bookmark-btn-horquva'));
    const s = usePortfolioStore.getState();
    expect(s.recruiterMix).toEqual(['work-horquva']);
    expect(s.selectedTrackId).toBeNull();
  });

  it('opens a context menu on right-click', () => {
    render(<TrackList tracks={workExperienceTracks} contextId="work-experience" />);
    fireEvent.contextMenu(screen.getByTestId('track-row-work-horquva'));
    const labels = usePortfolioStore.getState().contextMenu?.items.map((i) => i.label);
    expect(labels).toContain('Save to Your Recruiter Mix');
    expect(labels).toContain('View details');
  });
});
