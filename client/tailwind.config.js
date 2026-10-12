/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        obsidian: {
          950: '#07080A',
          900: '#0B0C0E',
          800: '#121418',
          700: '#1A1D24',
          600: '#252932',
        },
        amberGold: {
          300: '#F3E5AB',
          400: '#D4AF37',
          500: '#AA7C11',
          600: '#8B6508',
        },
        silk: '#F9F8F6'
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'luxury': '0 20px 50px rgba(0, 0, 0, 0.6), 0 0 20px rgba(212, 175, 55, 0.08)',
        'gold-glow': '0 0 25px rgba(212, 175, 55, 0.25)',
      }
    },
  },
  plugins: [],
};
