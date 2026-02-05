import React from 'react';
import ReactDOM from 'react-dom/client';
import Store from './Store'; 
import { BrowserRouter } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './style.css'; 

// --- [QUAN TRỌNG] THÊM COMPONENT NÀY ĐỂ CƯỠNG CHẾ XÓA MÀN HÌNH ĐEN ---
const FixBlackScreen = () => (
  <style>
    {`
      /* Ép ẩn backdrop với độ ưu tiên cao nhất */
      .modal-backdrop, .modal-backdrop.show, .modal-backdrop.fade {
          display: none !important; 
          opacity: 0 !important;
          z-index: -9999 !important;
          pointer-events: none !important;
          width: 0 !important;
          height: 0 !important;
      }

      /* Ép body cho phép cuộn trang lại */
      .modal-open {
          overflow: auto !important;
          padding-right: 0 !important;
      }

      body {
          overflow: visible !important; 
          padding-right: 0 !important;
      }
    `}
  </style>
);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      {/* CHÈN CÁI FIX NÀY VÀO ĐẦU TIÊN */}
      <FixBlackScreen /> 
      
      <Store />
    </BrowserRouter>
  </React.StrictMode>
);