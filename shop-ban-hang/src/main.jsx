import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// 👇 1. DÒNG NÀY ĐỂ WEB CÓ GIAO DIỆN ĐẸP (KHÔNG ĐƯỢC THIẾU)
import 'bootstrap/dist/css/bootstrap.min.css'

// 👇 2. DÒNG NÀY ĐỂ CHUYỂN TRANG KHÔNG BỊ LỖI
import { BrowserRouter } from 'react-router-dom'

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
)