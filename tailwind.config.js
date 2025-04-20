/** @type {import('tailwindcss').Config} */
    export default {
      content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
      ],
      theme: {
        extend: {
          colors: {
            primary: '#FF6B6B', // Contoh warna primer cerah
            secondary: '#4ECDC4', // Contoh warna sekunder
            accent: '#FFE66D', // Contoh warna aksen
          },
          animation: {
            'fade-in': 'fadeIn 0.5s ease-out',
            'bounce-slow': 'bounce 2s infinite',
          },
          keyframes: {
            fadeIn: {
              '0%': { opacity: 0, transform: 'translateY(-10px)' },
              '100%': { opacity: 1, transform: 'translateY(0)' },
            }
          }
        },
      },
      plugins: [],
    }