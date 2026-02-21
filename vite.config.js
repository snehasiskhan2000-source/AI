import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  preview: {
    // Add your new subdomain here so Vite allows the connection
    allowedHosts: [
      'ai.techbittu.in', 
      'techbittu.in', 
      'ai-vhsk.onrender.com'
    ],
    host: '0.0.0.0',
    port: 10000
  }
})
