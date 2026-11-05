import type { Config } from "tailwindcss";

const config: Config = {
  // `hover:` only applies on devices that can hover, so taps never leave sticky hover states.
  future: { hoverOnlyWhenSupported: true },
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Standard portfolio page palette; values live in src/app/resume/landing.css (light + dark).
        landing: {
          bg: "var(--l-bg)",
          ink: "var(--l-ink)",
          muted: "var(--l-muted)",
          line: "var(--l-line)",
          card: "var(--l-card)",
          surface: "var(--l-surface)",
          "on-surface": "var(--l-on-surface)",
          accent: "var(--l-accent)",
          "accent-soft": "var(--l-accent-soft)",
        },
        spotify: {
          green: {
            100: "#d8fae4",
            200: "#b1f4c9",
            300: "#8befae",
            400: "#64e994",
            500: "#3de479",
            600: "#1ed760", // Brand canonical
            700: "#1ab752",
            800: "#159743",
            900: "#117735",
            1000: "#0c5727",
          },
          dark: {
            100: "#d4d4d4",
            200: "#bebebe",
            300: "#a9a9a9",
            400: "#939393",
            500: "#7e7e7e",
            600: "#686868",
            700: "#535353", // Placeholder avatar / cover fill
            800: "#3d3d3d",
            900: "#282828", // Elevated surface (menus, dialogs, tooltips)
            1000: "#121212", // Base canvas
          },
          neutral: {
            100: "#ffffff",
            200: "#e8e8e8",
            300: "#d2d2d2",
            400: "#bbbbbb",
            500: "#a4a4a4",
            600: "#8e8e8e",
            700: "#777777",
            800: "#606060",
            900: "#4a4a4a",
            1000: "#333333",
          },
          overlay: {
            0: "rgba(255, 255, 255, 0.04)",
            1: "rgba(255, 255, 255, 0.08)",
            2: "rgba(255, 255, 255, 0.12)",
            3: "rgba(255, 255, 255, 0.20)",
            4: "rgba(255, 255, 255, 0.30)",
            5: "rgba(255, 255, 255, 0.40)",
            6: "rgba(255, 255, 255, 0.50)",
          },
          decorative: {
            blue: "#649AED",
            red: "#EB5640",
            yellow: "#F6C874",
            pink: "#E57BA1",
            pale: "#A7C2D1",
            evergreen: "#D5F479",
            rose: "#F7CFD4",
            lemon: "#F4E357",
            greenAlt: "#57B660",
          },
        },
        // Surfaces measured from the live Spotify desktop client (2024+ "Encore" UI)
        shell: "#000000",
        surface: "#121212", // (not "base": that would collide with the text-base font size)
        elevated: "#1f1f1f",
        highlight: "#2a2a2a",
        press: "#000000",
        menu: "#282828",
        subdued: "#b3b3b3", // Spotify secondary text
        essential: "#727272", // Disabled / tertiary
        toast: "#2e77d0", // Spotify notification blue
        verified: "#4cb3ff", // Verified-artist rosette
        accent: {
          DEFAULT: "var(--accent-primary)",
          hover: "var(--accent-hover)",
          pressed: "var(--accent-pressed)",
        },
      },
      fontFamily: {
        spotify: ["Figtree", "-apple-system", "BlinkMacSystemFont", "'Segoe UI'", "sans-serif"],
      },
      borderRadius: {
        "spot-1": "4px",
        "spot-2": "8px",
        "spot-3": "12px",
        "spot-4": "16px",
      },
      boxShadow: {
        "spotify-elevated": "0 16px 24px rgba(0,0,0,0.3), 0 6px 8px rgba(0,0,0,0.2)",
        "spotify-art": "0 4px 60px rgba(0,0,0,0.5)",
        "spotify-card": "0 8px 24px rgba(0,0,0,0.5)",
        "spotify-play": "0 8px 8px rgba(0,0,0,0.3)",
      },
      transitionTimingFunction: {
        spotify: "cubic-bezier(0.3, 0, 0, 1)",
        // Standard portfolio page (/resume): one calm ease-out for every movement.
        "out-soft": "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "scale-up": {
          from: { opacity: "0", transform: "scale(0.96)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "toast-in": {
          from: { opacity: "0", transform: "translate(-50%, 8px)" },
          to: { opacity: "1", transform: "translate(-50%, 0)" },
        },
        equalizer: {
          "0%, 100%": { transform: "scaleY(0.3)" },
          "50%": { transform: "scaleY(1)" },
        },
        "sheet-in": {
          from: { transform: "translateY(100%)" },
          to: { transform: "translateY(0)" },
        },
        "drawer-in": {
          from: { transform: "translateX(-100%)" },
          to: { transform: "translateX(0)" },
        },
        "typing-dot": {
          "0%, 80%, 100%": { opacity: "0.3" },
          "40%": { opacity: "1" },
        },
      },
      animation: {
        "fade-in": "fade-in 150ms cubic-bezier(0.3, 0, 0, 1)",
        "scale-up": "scale-up 150ms cubic-bezier(0.3, 0, 0, 1)",
        "toast-in": "toast-in 200ms cubic-bezier(0.3, 0, 0, 1)",
        equalizer: "equalizer 0.9s ease-in-out infinite",
        "sheet-in": "sheet-in 280ms cubic-bezier(0.3, 0, 0, 1)",
        "drawer-in": "drawer-in 260ms cubic-bezier(0.3, 0, 0, 1)",
      },
      scale: {
        "104": "1.04",
      },
    },
  },
  plugins: [],
};

export default config;
