import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,      // Force Port 5173
    strictPort: true // Crash if 5173 is busy (instead of switching to 5174)
  }
})