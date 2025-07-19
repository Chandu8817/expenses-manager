/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#22c55e', // emerald-500
          light: '#bbf7d0',   // emerald-100
          dark: '#15803d',    // emerald-700
        },
      },
    },
  },
  plugins: [],
};
