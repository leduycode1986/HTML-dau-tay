import React from 'react';
import ReactDOM from 'react-dom/client';
import Store from './Store'; 
import { BrowserRouter } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './style.css'; 

// --- ĐÃ XÓA COMPONENT FixBlackScreen ĐỂ TRÁNH XUNG ĐỘT DOM ---

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      {/* Đã bỏ <FixBlackScreen /> */}
      <Store />
    </BrowserRouter>
  </React.StrictMode>
);