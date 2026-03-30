import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
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
