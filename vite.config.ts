import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    postcss: './postcss.config.js', // Garante o uso do Tailwind no pipeline
  },
  server: {
    host: true, // Expor na rede local
    port: 5173, // Porta personalizada, se necessário
  },
})
