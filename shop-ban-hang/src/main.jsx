import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// 1. GIAO DIỆN BOOTSTRAP (Quan trọng nhất để web đẹp)
import 'bootstrap/dist/css/bootstrap.min.css'

// 2. BỘ ĐIỀU HƯỚNG
import { BrowserRouter } from 'react-router-dom'

// LƯU Ý: Không dùng <StrictMode> để tránh lỗi bộ soạn thảo văn bản
ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
)