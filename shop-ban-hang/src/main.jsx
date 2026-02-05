import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import Store from './Store'; 
import { BrowserRouter } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './style.css'; 

// --- COMPONENT CỨU HỘ: XÓA LỚP MỜ & MỞ KHÓA CUỘN (PHIÊN BẢN TIÊM TRỰC TIẾP) ---
const EmergencyFix = () => {
  useEffect(() => {
    // 1. Tiêm CSS cưỡng chế (Bỏ qua mọi file .css khác)
    const style = document.createElement('style');
    style.innerHTML = `
      /* Ẩn vĩnh viễn lớp mờ */
      .modal-backdrop, .modal-backdrop.show, .modal-backdrop.fade {
        display: none !important;
        opacity: 0 !important;
        z-index: -9999 !important;
        width: 0 !important; height: 0 !important;
      }
      /* Mở khóa cuộn trang */
      body.modal-open {
        overflow: auto !important;
        padding-right: 0 !important;
      }
      body {
        overflow-y: auto !important;
      }
    `;
    document.head.appendChild(style);

    // 2. Script dọn dẹp chạy liên tục (Dọn rác DOM nếu Bootstrap lỡ tạo ra)
    const cleaner = setInterval(() => {
      // Xóa phần tử backdrop trong HTML
      document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
      
      // Xóa class khóa cuộn trên body
      if (document.body.classList.contains('modal-open')) {
        document.body.classList.remove('modal-open');
        document.body.style.overflow = 'auto';
        document.body.style.paddingRight = '0px';
      }
    }, 200); // Chạy rất nhanh: 0.2 giây/lần

    return () => clearInterval(cleaner);
  }, []);

  return null;
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      {/* Đặt Component cứu hộ lên đầu tiên */}
      <EmergencyFix />
      <Store />
    </BrowserRouter>
  </React.StrictMode>
);