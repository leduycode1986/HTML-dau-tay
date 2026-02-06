import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import Store from './Store'; 
import { BrowserRouter } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './style.css'; 

// --- COMPONENT CỨU HỘ: XÓA LỚP MỜ (PHIÊN BẢN MUTATION OBSERVER) ---
const EmergencyFix = () => {
  useEffect(() => {
    // 1. Tiêm CSS cưỡng chế
    const style = document.createElement('style');
    style.innerHTML = `
      .modal-backdrop { display: none !important; opacity: 0 !important; pointer-events: none !important; }
      body.modal-open { overflow: auto !important; padding-right: 0 !important; }
      body { overflow-y: auto !important; }
    `;
    document.head.appendChild(style);

    // 2. Sử dụng MutationObserver để canh chừng DOM thay đổi
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.addedNodes.length) {
          // Nếu thấy có backdrop được thêm vào -> Xóa class khóa cuộn của body ngay
          if (document.body.classList.contains('modal-open')) {
             document.body.classList.remove('modal-open');
             document.body.style.overflow = 'auto';
             document.body.style.paddingRight = '0px';
          }
          // Tìm và xóa element backdrop (nếu CSS trên chưa đủ đô)
          document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
        }
      });
    });

    // Bắt đầu theo dõi thẻ body
    observer.observe(document.body, { childList: true, subtree: true });

    // Dọn dẹp lần đầu tiên
    document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
    document.body.classList.remove('modal-open');
    document.body.style.overflow = 'auto';

    return () => observer.disconnect();
  }, []);

  return null;
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      {/* Đặt Fix lên đầu */}
      <EmergencyFix />
      <Store />
    </BrowserRouter>
  </React.StrictMode>
);