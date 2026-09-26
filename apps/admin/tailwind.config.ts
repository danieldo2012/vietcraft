import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    '../../packages/shared/src/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        lotus: {
          ivory: '#F7F4EE',
          forest: '#26382E',
          'forest-dark': '#1A271F',
          'forest-light': '#364B3E',
          sand: '#D8C6A8',
          'sand-light': '#EFE7DA',
          'sand-dark': '#B8A484',
          clay: '#A76D52',
          'clay-light': '#C28468',
          'clay-dark': '#8A533B',
          charcoal: '#252525',
          'charcoal-light': '#3F3F3F',
          white: '#FFFFFF'
        }
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', '"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Inter"', '"DM Sans"', 'system-ui', '-apple-system', 'sans-serif']
      }
    }
  },
  plugins: []
};

export default config;
