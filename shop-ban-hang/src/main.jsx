import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import Store from './Store'; 
import { BrowserRouter } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './style.css'; 

// --- COMPONENT CỨU HỘ: DIỆT MỌI LOẠI BACKDROP ---
const FixBlackScreen = () => {
  useEffect(() => {
    // 1. Tiêm CSS Cưỡng chế trực tiếp vào đầu não (Head)
    const style = document.createElement('style');
    style.innerHTML = `
      div[class*="backdrop"] { display: none !important; opacity: 0 !important; pointer-events: none !important; }
      body { overflow: auto !important; padding-right: 0 !important; }
    `;
    document.head.appendChild(style);

    // 2. Hàm dọn dẹp mạnh tay
    const killBackdrop = () => {
      // Tìm tất cả phần tử có class chứa chữ 'backdrop'
      const ghosts = document.querySelectorAll('div[class*="backdrop"]');
      ghosts.forEach(g => g.remove());
      
      // Xóa các class gây kẹt cuộn trang trên body
      document.body.classList.remove('modal-open', 'offcanvas-open');
      document.body.style = ''; // Reset sạch style inline
    };

    // 3. Chạy ngay lập tức
    killBackdrop();

    // 4. Cài đặt "Camera an ninh" (Observer) để canh chừng DOM thay đổi
    const observer = new MutationObserver(() => {
      killBackdrop();
    });

    // Theo dõi toàn bộ body
    observer.observe(document.body, { childList: true, subtree: true });

    // 5. Vẫn dọn dẹp định kỳ mỗi 0.5s để chắc chắn 100%
    const interval = setInterval(killBackdrop, 500);

    return () => {
      observer.disconnect();
      clearInterval(interval);
    };
  }, []);

  return null;
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      {/* Đặt FixBlackScreen ở vị trí cao nhất */}
      <FixBlackScreen />
      <Store />
    </BrowserRouter>
  </React.StrictMode>
);