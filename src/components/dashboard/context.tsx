import { createContext, useContext } from 'react';
import type { PortfolioContent } from '@/content/schema';
import type { UploadInfo } from './api';
import type { Path } from './model';

export interface ConfirmOptions {
  title: string;
  body: React.ReactNode;
  confirmLabel?: string;
  danger?: boolean;
}

/** Which item a deep link (e.g. /dashboard#track/<id>) asked to open. */
export interface Focus {
  playlist?: string;
  track?: string;
  recommender?: string;
  technology?: string;
}

export interface DashboardContextValue {
  draft: PortfolioContent;
  update: (path: Path, value: unknown) => void;
  replace: (fn: (draft: PortfolioContent) => PortfolioContent) => void;
  /** Validation messages for exactly this path. */
  errorAt: (path: Path) => string[];
  /** Number of validation problems at or below this path. */
  countUnder: (path: Path) => number;
  uploads: UploadInfo[];
  refreshUploads: () => Promise<void>;
  notify: (message: string, tone?: 'info' | 'error') => void;
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  setPreview: (hash: string) => void;
  focus: Focus;
}

export const DashboardContext = createContext<DashboardContextValue | null>(null);

export function useDashboard(): DashboardContextValue {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error('useDashboard must be used inside <Dashboard>');
  return ctx;
}
