import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// 👇 1. NHẬP FILE GIAO DIỆN (Quan trọng để web đẹp)
import 'bootstrap/dist/css/bootstrap.min.css'

// 👇 2. NHẬP BỘ DẪN ĐƯỜNG (Quan trọng để không lỗi Router)
import { BrowserRouter } from 'react-router-dom'

ReactDOM.createRoot(document.getElementById('root')).render(
  // Bọc App trong BrowserRouter thì mới chuyển trang được
  <BrowserRouter>
    <App />
  </BrowserRouter>,
)