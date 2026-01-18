import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
// QUAN TRỌNG: Dòng này giúp web hiểu giao diện cột, hàng, nút bấm...
import 'bootstrap/dist/css/bootstrap.min.css'; 
import { BrowserRouter } from 'react-router-dom'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)