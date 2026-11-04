// DEV ONLY: `.dev.tsx` files are routes only under `next dev` (see next.config.mjs).
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Content dashboard (dev only)',
  robots: { index: false, follow: false },
};

export default function DashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
