import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { RecommenderProfileView } from '@/components/stage/RecommenderProfileView';
import { usePortfolioStore } from '@/stores/usePortfolioStore';
import { recommenders, featuredProjectsTracks } from '@/data/portfolioData';

describe('RecommenderProfileView', () => {
  beforeEach(() => {
    usePortfolioStore.setState({
      activeRecommenderId: recommenders[0].id,
      currentTrack: featuredProjectsTracks[0],
      isPlaying: false,
      contextMenu: null,
    });
  });

  it('handles recommenders with email correctly', () => {
    const originalEmail = recommenders[0].email;
    recommenders[0].email = 'recommender@example.com';
    try {
      render(<RecommenderProfileView />);
      expect(screen.getByRole('heading', { level: 1, name: recommenders[0].name })).toBeInTheDocument();
      const emailLink = screen.getByRole('link', { name: 'recommender@example.com' });
      expect(emailLink).toHaveAttribute('href', 'mailto:recommender@example.com');

      const moreBtn = screen.getByRole('button', { name: `More options for ${recommenders[0].name}` });
      fireEvent.click(moreBtn);

      const contextMenu = usePortfolioStore.getState().contextMenu;
      expect(contextMenu).not.toBeNull();
      const emailItem = contextMenu?.items.find((item) => item.id === 'email');
      expect(emailItem).toBeDefined();
    } finally {
      recommenders[0].email = originalEmail;
    }
  });

  it('handles recommenders without email safely without broken links or menu items', () => {
    const originalEmail = recommenders[0].email;
    delete (recommenders[0] as { email?: string }).email;

    try {
      render(<RecommenderProfileView />);
      expect(screen.getByRole('heading', { level: 1, name: recommenders[0].name })).toBeInTheDocument();

      // Should not render any mailto link
      const mailtoLinks = screen.queryAllByRole('link').filter((link) =>
        link.getAttribute('href')?.startsWith('mailto:')
      );
      expect(mailtoLinks).toHaveLength(0);

      // More options menu should not have "Copy email address"
      const moreBtn = screen.getByRole('button', { name: `More options for ${recommenders[0].name}` });
      fireEvent.click(moreBtn);

      const contextMenu = usePortfolioStore.getState().contextMenu;
      expect(contextMenu).not.toBeNull();
      const emailItem = contextMenu?.items.find((item) => item.id === 'email');
      expect(emailItem).toBeUndefined();
    } finally {
      if (originalEmail) {
        recommenders[0].email = originalEmail;
      }
    }
  });
});
