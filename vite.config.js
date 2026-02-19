import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  preview: {
    // This fixes the 'Blocked request' error
    allowedHosts: ['ai-vhsk.onrender.com'],
    host: '0.0.0.0',
    port: 10000
  }
})
