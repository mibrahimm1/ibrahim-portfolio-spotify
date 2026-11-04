import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { AISearchDropdown } from '@/components/modals/AISearchDropdown';
import { usePortfolioStore } from '@/stores/usePortfolioStore';

describe('AISearchDropdown Component', () => {
  beforeEach(() => {
    usePortfolioStore.setState({
      isSearchOpen: true,
    });
  });

  it('renders starter prompt questions when conversation thread is empty', () => {
    render(<AISearchDropdown />);
    expect(screen.getByTestId('ai-search-popover')).toBeInTheDocument();
    expect(
      screen.getByText(/What production agentic systems have you built\?/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/How did you cut LLM costs by 89% at BizBuddy\?/i)
    ).toBeInTheDocument();
  });

  it('responds with first-person answer and project chip when starter question is clicked', () => {
    render(<AISearchDropdown />);
    const promptBtn = screen.getByTestId('starter-prompt-bizbuddy');
    fireEvent.click(promptBtn);

    expect(screen.getByTestId('chat-message-ai')).toBeInTheDocument();
    expect(screen.getByTestId('chat-message-ai')).toHaveTextContent(/89%/i);
    expect(screen.getByTestId('chat-message-ai')).toHaveTextContent(/BizBuddy/i);
    expect(screen.getByText(/Inspect Project:/i)).toBeInTheDocument();
  });
});
