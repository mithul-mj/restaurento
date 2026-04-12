import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['log.png', 'LogoWithText.png'],
      manifest: {
        name: 'Restaurento',
        short_name: 'Restaurento',
        description: 'Premium Restaurant Experience & Booking Platform',
        theme_color: '#ff5e00',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
  server: {
    host: true, // Allow connections from the network/tunnels
  },
  resolve: {
    alias: {
      react: "react",
      "react-dom": "react-dom",
    },
  },
})
