// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite' // Import the Tailwind CSS Vite plugin

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // Add the Tailwind CSS Vite plugin here
  ],
  define: {
        // This defines 'global' as 'window' for browser compatibility.
        // It's a common workaround for libraries that expect 'global' to be defined.
        'global': 'window',
      },
});