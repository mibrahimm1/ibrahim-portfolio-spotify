import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { LeftSidebar } from '@/components/shell/LeftSidebar';
import { usePortfolioStore } from '@/stores/usePortfolioStore';

describe('LeftSidebar Component', () => {
  beforeEach(() => {
    usePortfolioStore.setState({
      activeView: 'home',
      activePlaylistId: 'featured-projects',
      recruiterMix: ['project-konvex', 'project-medical-report'],
      isLibraryCollapsed: false,
    });
  });

  it('renders Your Library and direct contact pills', () => {
    render(<LeftSidebar />);
    expect(screen.getByTestId('left-sidebar')).toBeInTheDocument();
    expect(screen.getByText('Your Library')).toBeInTheDocument();
    expect(screen.getByText(/GitHub/i)).toBeInTheDocument();
    expect(screen.getByText(/LinkedIn/i)).toBeInTheDocument();
    expect(screen.getByText(/^Email$/)).toBeInTheDocument();
    expect(screen.getByText('555-010-0100')).toBeInTheDocument();
  });

  it('renders live recruiter mix badge with 2 bookmarked items', () => {
    render(<LeftSidebar />);
    const badge = screen.getByTestId('recruiter-mix-badge');
    expect(badge).toHaveTextContent('2');
  });

  it('navigates to playlist when clicked', () => {
    render(<LeftSidebar />);
    const playlistBtn = screen.getByTestId('sidebar-playlist-work-experience');
    fireEvent.click(playlistBtn);
    expect(usePortfolioStore.getState().activeView).toBe('playlist');
    expect(usePortfolioStore.getState().activePlaylistId).toBe('work-experience');
  });
});
