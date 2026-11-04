import type { Metadata, Viewport } from 'next';
import './globals.css';
import { accentThemes } from '@/data/portfolioData';

export const metadata: Metadata = {
  title: 'Muhammad Ibrahim Shaikh — AI & Product Engineer | Spotify Desktop Portfolio',
  description:
    "Interactive 1:1 Spotify Desktop portfolio showcasing Muhammad Ibrahim Shaikh's production AI architectures, 8+ systems, NUST Software Engineering, hackathon victories, and faculty endorsements.",
  keywords: [
    'Muhammad Ibrahim Shaikh',
    'AI Engineer',
    'Product Engineer',
    'NUST',
    'Spotify Portfolio',
    'LangGraph',
    'LangChain',
    'YOLOv8',
    'RAG',
  ],
  authors: [{ name: 'Muhammad Ibrahim Shaikh' }],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
  themeColor: '#000000',
};

// Applies the saved accent before first paint so returning visitors don't see a green flash.
const bootThemes = Object.fromEntries(
  Object.values(accentThemes).map((t) => [
    t.id,
    [t.primary, t.hover, t.pressed, t.gradient.match(/#[0-9a-f]{6}/i)?.[0] ?? '#117735', t.gradient],
  ])
);
const themeBootScript = `try{var m=${JSON.stringify(bootThemes)}[localStorage.getItem('ibrahim_accent_theme')];if(m){var r=document.documentElement.style;r.setProperty('--accent-primary',m[0]);r.setProperty('--accent-hover',m[1]);r.setProperty('--accent-pressed',m[2]);r.setProperty('--banner-color',m[3]);r.setProperty('--banner-gradient',m[4]);}}catch(e){}`;

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
