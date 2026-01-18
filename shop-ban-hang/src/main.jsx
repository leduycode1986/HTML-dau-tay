import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// 👇 1. BỔ SUNG DÒNG NÀY (Để nhập công cụ điều hướng)
import { BrowserRouter } from 'react-router-dom' 

createRoot(document.getElementById('root')).render(
  // 👇 2. BỔ SUNG CẶP THẺ NÀY BAO QUANH <App />
  <BrowserRouter>
      <App />
  </BrowserRouter>
)