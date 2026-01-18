import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    hmr: {
        overlay: false // Tắt báo lỗi che màn hình nếu có
    }
  },
  build: {
    chunkSizeWarningLimit: 1600, // Tăng giới hạn file build để không báo vàng
  }
})