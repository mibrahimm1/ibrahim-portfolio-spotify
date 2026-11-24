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

  it('renders "Switch to Standard Portfolio" button beside "Book a call"', () => {
    render(<TopNavBar />);
    const bookCallBtn = screen.getByRole('button', { name: /Book a call/i });
    const switchLink = screen.getByRole('link', { name: /Switch to Standard Portfolio/i });

    expect(bookCallBtn).toBeInTheDocument();
    expect(switchLink).toBeInTheDocument();
    expect(switchLink).toHaveAttribute('href', '/resume');
    expect(switchLink).toHaveAttribute('aria-label', 'Switch to Standard Portfolio');
    expect(switchLink).toHaveAttribute('title', 'Switch to Standard Portfolio');
    expect(switchLink).toHaveTextContent('Switch to Standard Portfolio');

    // Verify it is positioned right beside "Book a call"
    expect(bookCallBtn.nextElementSibling).toBe(switchLink);

    // Verify Encore secondary button pill styling and responsive classes
    expect(switchLink).toHaveClass('hidden', 'lg:inline-flex', 'rounded-full', 'font-bold');
    expect(bookCallBtn).toHaveClass('hidden', 'lg:inline-flex');
  });

  it('maintains "Switch to Standard Portfolio" button across different active views', () => {
    usePortfolioStore.setState({ activeView: 'browse' });
    render(<TopNavBar />);
    const switchLink = screen.getByTestId('switch-to-standard-portfolio-button');
    expect(switchLink).toBeInTheDocument();
    expect(switchLink).toHaveAttribute('href', '/resume');
  });
});
