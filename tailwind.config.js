/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#023341', // PRIMARY COLOR (dark teal)
        secondary: '#4cbd99', // SECONDARY COLOR (teal green)
        accent: '#149fc9', // TERTIARY COLOR (blue)
        white: '#FFFFFF',
        'text-dark': '#333333',
        'text-light': '#666666',
        'border-color': '#E0E0E0',
      },
      fontFamily: {
        heading: ['Montserrat', 'sans-serif'],
        body: ['Open Sans', 'sans-serif'],
      },
      boxShadow: {
        custom: '0 2px 10px rgba(0, 0, 0, 0.1)',
        'custom-hover': '0 4px 20px rgba(0, 0, 0, 0.15)',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-in-out',
        'slide-up': 'slideUp 0.6s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
