/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          900: '#FFFFFF', // Global background
          800: '#F8FAFC', // Panel background
          700: '#F1F5F9', // Cards background
        },
        emergency: '#E53935',
        moderate: '#FFB300',
        normal: '#00C853',
      },
      fontFamily: {
        sans: ['Manrope', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace'],
      }
    },
  },
  plugins: [],
}
