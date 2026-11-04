#!/usr/bin/env node
// Replaces content/portfolio.json with the neutral example template, for people who fork
// this project and want to start from a clean slate. Keeps a timestamped copy of the old file.
//
//   npm run content:reset            # asks for confirmation
//   npm run content:reset -- --yes   # no prompt (CI / scripts)

import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createInterface } from 'node:readline/promises';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const target = join(root, 'content', 'portfolio.json');
const example = join(root, 'content', 'portfolio.example.json');
const backups = join(root, 'content', '.backups');

if (!process.argv.includes('--yes')) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const answer = await rl.question('Replace content/portfolio.json with the example template? (y/N) ');
  rl.close();
  if (answer.trim().toLowerCase() !== 'y') {
    console.log('Cancelled.');
    process.exit(0);
  }
}

if (existsSync(target)) {
  mkdirSync(backups, { recursive: true });
  const backup = join(backups, `portfolio-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
  copyFileSync(target, backup);
  console.log(`Backed up the current content to ${backup}`);
}

copyFileSync(example, target);
console.log('content/portfolio.json now holds the example template. Run `npm run dev` and open /dashboard to make it yours.');
