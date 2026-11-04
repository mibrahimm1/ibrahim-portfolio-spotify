import { formatContentErrors, PortfolioContent, PortfolioSchema } from '@/content/schema';

/** Validates raw JSON against the content schema, throwing a readable list of problems. */
export function parseContent(raw: unknown): PortfolioContent {
  const result = PortfolioSchema.safeParse(raw);
  if (!result.success) {
    throw new Error(`content/portfolio.json is invalid:\n${formatContentErrors(result.error)}`);
  }
  return result.data;
}
