/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        'spotify-green': '#1ed760',
        'spotify-black': '#121212',
        'spotify-dark': '#181818',
        'spotify-mid': '#1f1f1f',
        'spotify-card': '#252525',
        'spotify-border': '#4d4d4d',
        'spotify-light-border': '#7c7c7c',
        'spotify-white': '#ffffff',
        'spotify-silver': '#b3b3b3',
        'spotify-negative': '#f3727f',
        'spotify-warning': '#ffa42b',
        'spotify-announcement': '#539df5'
      },
      fontFamily: {
        'spotify': ['SpotifyMixUI', 'CircularSp-Arab', 'CircularSp-Hebr', 'CircularSp-Cyrl', 'CircularSp-Grek', 'CircularSp-Deva', 'Helvetica Neue', 'helvetica', 'arial', 'sans-serif'],
        'spotify-title': ['SpotifyMixUITitle', 'CircularSp-Arab', 'CircularSp-Hebr', 'CircularSp-Cyrl', 'CircularSp-Grek', 'CircularSp-Deva', 'Helvetica Neue', 'helvetica', 'arial', 'sans-serif']
      },
      boxShadow: {
        'heavy': '0px 8px 24px rgba(0, 0, 0, 0.5)',
        'medium': '0px 8px 8px rgba(0, 0, 0, 0.3)',
        'inset-input': '0px 1px 0px rgb(18,18,18), 0px 0px 0px 1px rgb(124,124,124) inset'
      },
      borderRadius: {
        'pill': '500px',
        'full-pill': '9999px',
        'circle': '50%'
      },
      letterSpacing: {
        'button': '1.4px'
      }
    },
  },
  plugins: [],
};