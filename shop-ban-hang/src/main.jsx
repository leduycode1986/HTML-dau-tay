import React from 'react';
import ReactDOM from 'react-dom/client';
import ShopAppp from './ShopApp';
import { BrowserRouter } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './style.css?v=final';
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ShopApp />
    </BrowserRouter>
  </React.StrictMode>
);