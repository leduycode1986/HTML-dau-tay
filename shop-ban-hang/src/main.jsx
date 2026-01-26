import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; // Quay lại gọi file App
import { BrowserRouter } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './style.css'; // Vẫn giữ file css nếu có

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);