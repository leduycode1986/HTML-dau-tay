import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // QUAN TRỌNG: Dòng này giúp sửa lỗi đường dẫn khi vào trang con
  base: '/', 
})