/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        carbon: {
          950: '#0a0a0b',
          900: '#111113',
          850: '#16161a',
          800: '#1c1c21',
          700: '#26262d',
          600: '#34343d',
          500: '#4a4a55',
          400: '#71717c',
          300: '#a1a1aa',
          200: '#d4d4d8',
        },
        gold: {
          300: '#fcd581',
          400: '#f5b942',
          500: '#e09b1a',
          600: '#b87a0f',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      keyframes: {
        'pulse-ring': {
          '0%': { transform: 'scale(0.8)', opacity: '0.8' },
          '100%': { transform: 'scale(2.2)', opacity: '0' },
        },
      },
      animation: {
        'pulse-ring': 'pulse-ring 1.6s cubic-bezier(0.2, 0.6, 0.4, 1) infinite',
      },
    },
  },
  plugins: [],
};
