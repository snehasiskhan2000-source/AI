import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  preview: {
    // This allows both your custom domain and the render URL to work
    allowedHosts: ['techbittu.in', 'www.techbittu.in', 'ai-vhsk.onrender.com'],
    host: '0.0.0.0',
    port: 10000
  }
})
