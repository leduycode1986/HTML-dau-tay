import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './style.css' // 👈 THÊM DÒNG NÀY (Để nạp file CSS vừa tạo)
import 'bootstrap/dist/css/bootstrap.min.css' // Import Bootstrap
import { BrowserRouter } from 'react-router-dom'

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
)