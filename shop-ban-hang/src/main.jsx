import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// 1. Giao diện (Fix lỗi vỡ layout)
import 'bootstrap/dist/css/bootstrap.min.css' 
// 2. Điều hướng (Fix lỗi Router crash)
import { BrowserRouter } from 'react-router-dom'

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
)