import type { Config } from 'tailwindcss';
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0b0e14',
        surface: '#121826',
        surface2: '#1a2236',
        line: '#2a3550',
        text: '#f5f7fa',
        muted: '#aab4c8',
        primary: '#7c3aed',
        primaryHover: '#6d28d9',
        accent: '#a78bfa',
        danger: '#f87171',
        success: '#34d399',
      },
    },
  },
  plugins: [],
} satisfies Config;
