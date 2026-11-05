import type { Metadata, Viewport } from 'next';
import './globals.css';
import { accentThemeList, defaultAccentThemeId, site } from '@/data/portfolioData';

export const metadata: Metadata = {
  title: site.title,
  description: site.description,
  keywords: site.keywords,
  authors: [{ name: site.author }],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
  viewportFit: 'cover', // lets the tab bar sit under the iPhone home indicator with safe-area padding
  themeColor: site.themeColor,
};

// Applies the saved (or default) accent before first paint, so there's no colour flash.
// Theme values come from content, so `<` is escaped to keep any "</script>" in the data inert.
const bootThemes = Object.fromEntries(
  accentThemeList.map((t) => [t.id, [t.primary, t.hover, t.pressed, t.banner, t.gradient]])
);
const bootJson = JSON.stringify({ themes: bootThemes, fallback: defaultAccentThemeId }).replace(/</g, '\\u003c');
const themeBootScript = `try{var c=${bootJson},s=null;try{s=localStorage.getItem('ibrahim_accent_theme')}catch(e){}var m=c.themes[s]||c.themes[c.fallback];if(m){var r=document.documentElement.style;r.setProperty('--accent-primary',m[0]);r.setProperty('--accent-hover',m[1]);r.setProperty('--accent-pressed',m[2]);r.setProperty('--banner-color',m[3]);r.setProperty('--banner-gradient',m[4]);}}catch(e){}`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
        <link
          rel="preload"
          href="/fonts/figtree-latin-wght-normal.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body className="bg-black text-white antialiased font-spotify">
        {children}
      </body>
    </html>
  );
}
