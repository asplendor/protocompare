/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        jade: '#14b8a6',
        aqua: '#06b6d4',
        surface: '#1e293b',
        bg: '#0f172a',
      },
    },
  },
  plugins: [],
};
