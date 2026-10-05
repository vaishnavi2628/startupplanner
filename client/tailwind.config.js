/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#14211F',
        muted: '#5B6B67',
        paper: '#F4F7F6',
        line: '#DCE5E2',
        pine: { DEFAULT: '#0F766E', dark: '#0B5A54', soft: '#E3F1EE' },
        saffron: { DEFAULT: '#D97706', soft: '#FEF3C7' },
        rose: { DEFAULT: '#BE123C', soft: '#FFE4E9' },
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['"Hanken Grotesk"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
