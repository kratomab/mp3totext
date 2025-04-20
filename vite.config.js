import { defineConfig } from 'vite'
    import react from '@vitejs/plugin-react'

    // https://vitejs.dev/config/
    export default defineConfig({
      plugins: [react()],
      server: {
        port: 3000, // Anda bisa mengganti port jika diperlukan
        open: true // Otomatis membuka browser saat server dimulai
      }
    })