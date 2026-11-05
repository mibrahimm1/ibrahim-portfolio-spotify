#!/usr/bin/env node
// One-time setup for a fresh fork: removes the original owner's personal files so your
// site starts from the neutral example, ready to edit in the dashboard.
//
//   npm run setup -- --github your-username          # asks for confirmation
//   npm run setup -- --github your-username --yes    # no prompt
//
// It:
//  1. replaces content/portfolio.json with content/portfolio.example.json (backed up first);
//  2. replaces public/resume.pdf with a placeholder and deletes the original owner's uploads;
//  3. puts your GitHub username in .github/CODEOWNERS.
// Tests are unaffected: they use tests/fixtures/portfolio.json.

import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createInterface } from 'node:readline/promises';

const root = join(fileURLToPath(new URL('.', import.meta.url)), '..');
const args = process.argv.slice(2);
const flag = (name) => {
  const i = args.indexOf(name);
  return i === -1 ? undefined : args[i + 1];
};

const github = flag('--github');
if (!github || !/^[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?$/.test(github)) {
  console.error('Usage: npm run setup -- --github <your-github-username> [--yes]');
  process.exit(1);
}

if (!args.includes('--yes')) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const answer = await rl.question(
    `This replaces content/portfolio.json with the example, replaces public/resume.pdf, deletes public/uploads/*, and sets CODEOWNERS to @${github}. Continue? (y/N) `
  );
  rl.close();
  if (answer.trim().toLowerCase() !== 'y') {
    console.log('Cancelled.');
    process.exit(0);
  }
}

// 1. Content
const content = join(root, 'content', 'portfolio.json');
const backups = join(root, 'content', '.backups');
if (existsSync(content)) {
  mkdirSync(backups, { recursive: true });
  const backup = join(backups, `portfolio-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
  copyFileSync(content, backup);
  console.log(`✓ Backed up the previous content to ${backup}`);
}
copyFileSync(join(root, 'content', 'portfolio.example.json'), content);
console.log('✓ content/portfolio.json now holds the example template');

// 2. Files
writeFileSync(join(root, 'public', 'resume.pdf'), placeholderPdf('Your resume goes here', 'Upload your own PDF in the dashboard: Profile > Resume.'));
console.log('✓ public/resume.pdf is now a placeholder');
const uploads = join(root, 'public', 'uploads');
if (existsSync(uploads)) {
  const removed = readdirSync(uploads).filter((n) => n !== '.gitkeep');
  for (const name of removed) rmSync(join(uploads, name), { recursive: true, force: true });
  if (removed.length) console.log(`✓ Removed ${removed.length} upload(s) from public/uploads`);
}

// 3. CODEOWNERS
const owners = join(root, '.github', 'CODEOWNERS');
if (existsSync(owners)) {
  const text = readFileSync(owners, 'utf8').replace(/@[A-Za-z0-9-]+/g, `@${github}`);
  writeFileSync(owners, text);
  console.log(`✓ .github/CODEOWNERS now names @${github}`);
}

console.log(`
Next:
  1. npm run dev, then open http://localhost:3000/dashboard and make it yours
  2. Add your name to LICENSE (keep the original notice too, as MIT requires)
  3. Commit, push, and deploy (README: "Deploy")`);

/** A one-page PDF with two lines of text, with a correct cross-reference table. */
function placeholderPdf(title, line) {
  const esc = (s) => s.replace(/[\\()]/g, (c) => `\\${c}`);
  const stream = `BT /F1 22 Tf 72 700 Td (${esc(title)}) Tj /F1 12 Tf 0 -32 Td (${esc(line)}) Tj ET`;
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>',
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  ];
  let pdf = '%PDF-1.4\n';
  const offsets = objects.map((body, i) => {
    const offset = pdf.length;
    pdf += `${i + 1} 0 obj\n${body}\nendobj\n`;
    return offset;
  });
  const xref = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  pdf += offsets.map((o) => `${String(o).padStart(10, '0')} 00000 n \n`).join('');
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return pdf;
}
