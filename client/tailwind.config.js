/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        usindo: {
          50: '#f0f5fa',
          100: '#e1ebf5',
          200: '#c3d7eb',
          300: '#95bbdc',
          400: '#619bc9',
          500: '#3c7fb4',
          600: '#2d6597',
          700: '#25527c',
          800: '#214668',
          900: '#0f2b5c', // Navy primary
          950: '#0a1d40',
        }
      }
    },
  },
  plugins: [],
}
