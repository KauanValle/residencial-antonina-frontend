/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['IBM Plex Sans', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace'],
      },
      colors: {
        brand: {
          50:  '#f0f4ff',
          100: '#dce6ff',
          200: '#b9cdff',
          300: '#87a8ff',
          400: '#5478f5',
          500: '#3355e8',
          600: '#2239cc',
          700: '#1c2da6',
          800: '#1c2a85',
          900: '#1c2969',
        },
      },
    },
  },
  plugins: [],
};
