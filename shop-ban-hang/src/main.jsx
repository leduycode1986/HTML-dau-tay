import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import 'bootstrap/dist/css/bootstrap.min.css'; 
import './index.css'

// 1. NHẬP KHẨU THẰNG NÀY VÀO
import { BrowserRouter } from 'react-router-dom' 

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* 2. BỌC NÓ LẠI NHƯ THẾ NÀY */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)