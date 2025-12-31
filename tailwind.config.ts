import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'hero-heading': ['3.75rem', { lineHeight: '1.2', fontWeight: '700' }], // 60px
        'section-heading': ['2.25rem', { lineHeight: '1.3', fontWeight: '600' }], // 36px
        'card-heading': ['1.25rem', { lineHeight: '1.4', fontWeight: '600' }], // 20px
        'small-heading': ['1rem', { lineHeight: '1.5', fontWeight: '600' }], // 16px
        'body-xl': ['1.25rem', { lineHeight: '1.6', fontWeight: '400' }], // 20px
        'body-base': ['1rem', { lineHeight: '1.6', fontWeight: '400' }], // 16px
        'body-sm': ['0.875rem', { lineHeight: '1.5', fontWeight: '400' }], // 14px
      },
      colors: {
        teal: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488', // Primary
          700: '#0f766e', // Hover
          800: '#115e59',
          900: '#134e4a',
        },
        blue: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb', // Gradients, accents
          700: '#1d4ed8', // Deep accents
          800: '#1e40af',
          900: '#1e3a8a',
        },
        gray: {
          50: '#f9fafb', // Light Mode Surface
          100: '#f3f4f6', // Light Mode Borders
          200: '#e5e7eb',
          300: '#d1d5db', // Dark Mode Secondary text
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563', // Light Mode Secondary text
          700: '#374151', // Dark Mode Borders
          800: '#1f2937', // Dark Mode Surface
          900: '#111827', // Light Mode Primary text, Dark Mode Background
        },
        white: '#ffffff', // Light Mode Background, Dark Mode Primary text
      },
      spacing: {
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '6': '24px',
        '8': '32px',
        '10': '40px',
        '12': '48px',
        '16': '64px',
        '20': '80px',
        '24': '96px',
        '32': '128px',
        '40': '160px',
      },
    },
  },
  plugins: [],
}
export default config

