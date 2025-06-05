// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  // Configure files to scan for Tailwind classes (adjust if your project structure differs)
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'fade-in-down': 'fade-in-down 0.8s ease-out forwards',
        'fade-in-up': 'fade-in-up 0.8s ease-out forwards',
        'slide-in-left': 'slide-in-left 0.8s ease-out forwards',
        'slide-in-right': 'slide-in-right 0.8s ease-out forwards',
      },
      keyframes: {
        'fade-in-down': {
          '0%': {
            opacity: '0',
            transform: 'translateY(-20px)'
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)'
          },
        },
        'fade-in-up': {
          '0%': {
            opacity: '0',
            transform: 'translateY(20px)'
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)'
          },
        },
        'slide-in-left': {
          '0%': {
            opacity: '0',
            transform: 'translateX(-50px)'
          },
          '100%': {
            opacity: '1',
            transform: 'translateX(0)'
          },
        },
        'slide-in-right': {
          '0%': {
            opacity: '0',
            transform: 'translateX(50px)'
          },
          '100%': {
            opacity: '1',
            transform: 'translateX(0)'
          },
        },
      },
   
      fontFamily: {
        // Define 'Inter' as a custom sans-serif font
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        // Reference your CSS variables here
        primary: 'var(--color-primary)',
        'primary-dark': 'var(--color-primary-dark)',
        secondary: 'var(--color-secondary)',
        'secondary-dark': 'var(--color-secondary-dark)',
        background: {
          dark: 'var(--color-background-dark)',
          'dark_lighter': 'var(--color-background-dark_lighter)',
          light: 'var(--color-background-light)',
        },
        text: {
          dark: 'var(--color-text-dark)',
          'dark_secondary': 'var(--color-text-dark_secondary)',
        },
        border: {
          dark: 'var(--color-border-dark)',
        },
        'error-red': 'var(--color-error-red)',
        'success-green': 'var(--color-success-green)',
      },
    },
  },
  plugins: [],
}
