/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#FF6B00',
          hover: '#FF8533',
          active: '#CC5500',
        },
        'bg-main': '#0D0D0D',
        'bg-sidebar': '#141414',
        'bg-panel': '#1A1A1A',
        border: '#2D2D2D',
        'text-primary': '#E8E8E8',
        'text-secondary': '#888888',
        'text-disabled': '#555555',
        success: '#00C853',
        warning: '#FFB300',
        error: '#FF1744',
        'code-bg': '#1E1E1E',
      },
    },
  },
  plugins: [],
};