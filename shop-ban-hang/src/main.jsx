import React from 'react';
import ReactDOM from 'react-dom/client';
import Store from './Store'; // <--- Gọi file Store mới
import { BrowserRouter } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './style.css'; 

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Store />
    </BrowserRouter>
  </React.StrictMode>
);