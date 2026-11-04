import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { TopNavBar } from '@/components/shell/TopNavBar';
import { usePortfolioStore } from '@/stores/usePortfolioStore';

describe('TopNavBar Component', () => {
  beforeEach(() => {
    usePortfolioStore.setState({
      activeView: 'home',
      history: [{ view: 'home' }],
      historyIndex: 0,
      isSearchOpen: false,
      rightSidebarMode: 'inspector',
    });
  });

  it('renders top navigation bar with search input and controls', () => {
    render(<TopNavBar />);
    expect(screen.getByTestId('top-nav-bar')).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/What do you want to play\? — Ask Ibrahim's AI anything/i)
    ).toBeInTheDocument();
  });

  it('navigates home when clicking home button', () => {
    usePortfolioStore.setState({ activeView: 'playlist' });
    render(<TopNavBar />);
    const homeBtn = screen.getByRole('button', { name: /Return to candidate home/i });
    fireEvent.click(homeBtn);
    expect(usePortfolioStore.getState().activeView).toBe('home');
  });

  it('toggles friends listening activity feed when clicking friends icon', () => {
    render(<TopNavBar />);
    const friendsBtn = screen.getByRole('button', {
      name: /Toggle Faculty Endorsements Feed/i,
    });
    fireEvent.click(friendsBtn);
    expect(usePortfolioStore.getState().rightSidebarMode).toBe('activity');

    fireEvent.click(friendsBtn);
    expect(usePortfolioStore.getState().rightSidebarMode).toBe('inspector');
  });

  it('renders minimize escape hatch button with tooltip', () => {
    render(<TopNavBar />);
    const minimizeLink = screen.getByTestId('minimize-escape-hatch');
    expect(minimizeLink).toBeInTheDocument();
    expect(minimizeLink).toHaveAttribute('href', '/resume');
    expect(screen.getByTestId('escape-hatch-tooltip')).toHaveTextContent(
      'Switch to Standard Resume View'
    );
  });
});
