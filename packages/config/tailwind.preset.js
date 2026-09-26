/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: {
        lotus: {
          ivory: '#F7F4EE',
          forest: '#26382E',
          'forest-dark': '#1c2b23',
          'forest-light': '#384f42',
          sand: '#D8C6A8',
          'sand-light': '#ece4d7',
          'sand-dark': '#c2ad8c',
          clay: '#A76D52',
          'clay-light': '#c08569',
          'clay-dark': '#8c5840',
          charcoal: '#252525',
          'charcoal-light': '#3a3a3a',
          white: '#FFFFFF'
        }
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', '"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Inter"', '"DM Sans"', 'system-ui', '-apple-system', 'sans-serif']
      }
    }
  }
};
