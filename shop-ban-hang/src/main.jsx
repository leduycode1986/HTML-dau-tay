import React, { useEffect } from 'react'; // Nhớ thêm { useEffect }
import ReactDOM from 'react-dom/client';
import Store from './Store'; 
import { BrowserRouter } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './style.css'; 

// --- COMPONENT XÓA LỚP MỜ (PHIÊN BẢN NÂNG CẤP) ---
const FixBlackScreen = () => {
  useEffect(() => {
    // Hàm xóa backdrop
    const removeBackdrop = () => {
      const backdrops = document.querySelectorAll('.modal-backdrop');
      if (backdrops.length > 0) {
        backdrops.forEach(backdrop => backdrop.remove());
        document.body.classList.remove('modal-open');
        document.body.style.overflow = 'auto';
        document.body.style.paddingRight = '0px';
      }
    };

    // 1. Xóa ngay lập tức khi load
    removeBackdrop();

    // 2. Chạy định kỳ mỗi 500ms để canh chừng
    const intervalId = setInterval(removeBackdrop, 500);

    return () => clearInterval(intervalId);
  }, []);

  return null; // Không cần render gì cả
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      {/* Đặt FixBlackScreen ở đây để nó luôn chạy */}
      <FixBlackScreen />
      <Store />
    </BrowserRouter>
  </React.StrictMode>
);