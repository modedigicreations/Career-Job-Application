/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef1ff',
          100: '#e0e4ff',
          200: '#c7ceff',
          300: '#a3afff',
          400: '#7686ff',
          500: '#3d5cff',
          600: '#2a43e6',
          700: '#2032b8',
          800: '#1a2890',
          900: '#16215e',
        },
      },
    },
  },
  plugins: [],
};
