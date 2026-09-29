/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: '#1F5133',
        brandTint: '#E8F2EC',
        ink: '#1A1816',
      },
      fontFamily: {
        // Brand fonts not chosen yet — swap these two stacks in one place.
        display: [
          'Outfit',
          'Outfit Fallback',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'sans-serif',
        ],
        sans: [
          '"Source Sans 3"',
          '"Source Sans 3 Fallback"',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
}

