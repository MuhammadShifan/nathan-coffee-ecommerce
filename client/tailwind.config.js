/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          pink: {
            50: '#fdf2f8',
            100: '#fce7f3',
            200: '#fbcfe8',
            300: '#f9a8d4',
            400: '#f472b6',
            500: '#ec4899',
            600: '#e60067', // Main Brand Magenta Pink
            700: '#be0055',
            800: '#980044',
            900: '#6f0032',
            DEFAULT: '#e60067',
          },
          yellow: {
            50: '#fefce8',
            100: '#fef9c3',
            200: '#fef08a',
            300: '#ffea00',
            400: '#facc15',
            500: '#ffd700', // Main Brand Bright Yellow
            600: '#ca8a04',
            700: '#a16207',
            DEFAULT: '#ffd700',
          },
          coffee: {
            50: '#fdfbf7',
            100: '#f7f0e6',
            200: '#eddcc8',
            300: '#dfc2a2',
            400: '#cba076',
            500: '#b88151',
            600: '#99633c',
            700: '#7a4b2f',
            800: '#4a2c1b',
            900: '#2c1810',
            950: '#150a06',
          }
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Playfair Display', 'serif'],
        tamil: ['Noto Sans Tamil', 'sans-serif'],
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        }
      }
    },
  },
  plugins: [],
}
