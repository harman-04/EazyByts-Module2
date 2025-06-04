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
