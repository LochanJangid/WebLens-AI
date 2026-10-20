import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // WebLens AI Cinematic Obsidian & Crimson Design System
        canvas: '#050505',
        surface: {
          DEFAULT: '#0B0B0D',
          elevated: '#0B0B0D',
          secondary: '#111114',
          raised: '#17171B',
          card: '#111114',
        },
        ink: {
          DEFAULT: '#F7F7F8',
          primary: '#F7F7F8',
          secondary: '#B4B4BD',
          muted: '#777781',
        },
        accent: {
          DEFAULT: '#F20D4F',
          hover: '#FF245F',
          light: 'rgba(242, 13, 79, 0.12)',
          soft: 'rgba(242, 13, 79, 0.12)',
          border: 'rgba(242, 13, 79, 0.35)',
        },
        stroke: {
          DEFAULT: 'rgba(255, 255, 255, 0.09)',
          subtle: 'rgba(255, 255, 255, 0.06)',
          strong: 'rgba(255, 255, 255, 0.16)',
          accent: 'rgba(242, 13, 79, 0.35)',
        },
        // Crimson-Pink Brand Scale
        brand: {
          50: '#fff1f4',
          100: '#ffe4e9',
          200: '#fecdd7',
          300: '#fda4b7',
          400: '#fb718f',
          500: '#f43f68',
          600: '#F20D4F',
          700: '#e1003d',
          800: '#b80436',
          900: '#8e0830',
          950: '#4e0016',
        },
      },
      borderRadius: {
        section: '24px',
        card: '16px',
        control: '12px',
      },
      boxShadow: {
        card: '0 4px 20px -2px rgba(0, 0, 0, 0.5)',
        hover: '0 8px 30px -4px rgba(0, 0, 0, 0.7)',
        dropdown: '0 12px 32px -4px rgba(0, 0, 0, 0.8)',
        accent: '0 0 24px -2px rgba(242, 13, 79, 0.35)',
        'accent-lg': '0 0 40px -4px rgba(242, 13, 79, 0.5)',
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
        mono: [
          'JetBrains Mono',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'Consolas',
          'monospace',
        ],
      },
    },
  },
  plugins: [],
};

export default config;
