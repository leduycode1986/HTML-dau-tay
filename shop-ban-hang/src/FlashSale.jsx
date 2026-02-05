import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import Product from './Product';
import { collection, query, where, getDocs } from 'firebase/firestore'; 
import { db } from './firebase';

function FlashSale({themVaoGio, shopConfig }) {
  const [timeLeft, setTimeLeft] = useState({ d: 0, h: 0, m: 0, s: 0 });
  const [isExpired, setIsExpired] = useState(false); // Trạng thái hết giờ
  const [flashProducts, setFlashProducts] = useState([]); // State chứa sản phẩm
  const [loading, setLoading] = useState(true); // State loading
  // 1. Tải sản phẩm Flash Sale từ Firebase
  useEffect(() => {
    const fetchFlashSale = async () => {
      try {
        const q = query(collection(db, "sanPham"), where("isFlashSale", "==", true));
        const snapshot = await getDocs(q);
        const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setFlashProducts(products);
      } catch (error) {
        console.error("Lỗi tải Flash Sale:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFlashSale();
  }, []);
// 2. Logic đồng hồ
  useEffect(() => {
    if (!shopConfig?.flashSaleEnd) return;

    const checkTime = () => {
      const end = new Date(shopConfig.flashSaleEnd).getTime();
      const now = new Date().getTime();
      const dist = end - now;

      if (dist < 0) {
        setIsExpired(true); // Đánh dấu đã hết giờ
        setTimeLeft({ d: 0, h: 0, m: 0, s: 0 });
      } else {
        setIsExpired(false);
        setTimeLeft({
          d: Math.floor(dist / (1000 * 60 * 60 * 24)),
          h: Math.floor((dist % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          m: Math.floor((dist % (1000 * 60 * 60)) / (1000 * 60)),
          s: Math.floor((dist % (1000 * 60)) / 1000)
        });
      }
    };

    checkTime(); // Chạy ngay lần đầu
    const timer = setInterval(checkTime, 1000);
    return () => clearInterval(timer);
  }, [shopConfig]);

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa' }}>
      {/* --- BANNER HEADER VỚI ĐỒNG HỒ --- */}
      <div className="flash-sale-banner">  
        {/* Họa tiết trang trí (Dùng class từ style.css) */}
        <div className="fs-bg-icon fs-icon-bolt">
          <i className="fa-solid fa-bolt"></i>
        </div>
        <div className="fs-bg-icon fs-icon-clock">
          <i className="fa-solid fa-clock"></i>      
      </div>

        <Container className="position-relative" style={{zIndex: 2}}>
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-4">
            
            {/* Cột trái: Tiêu đề */}
            <div className="text-white text-center text-md-start">
              <h1 className="fw-black text-uppercase m-0 display-4" style={{textShadow: '3px 3px 0 rgba(0,0,0,0.2)', fontWeight:'900'}}>
                <i className="fa-solid fa-bolt fa-shake me-3 text-warning"></i>FLASH SALE
              </h1>
              <p className="m-0 fs-5 opacity-90 mt-2">
                <i className="fa-solid fa-fire text-warning me-2"></i>Săn deal giá sốc - Số lượng có hạn!
              </p>
            </div>
            
            {/* Cột phải: Đồng hồ đếm ngược (Style mới) */}
            {!isExpired ? (
              <div className="d-flex align-items-center gap-3 bg-white bg-opacity-25 p-3 rounded-pill border border-white border-opacity-50 shadow">
                <span className="fw-bold text-white text-uppercase small letter-spacing-1 d-none d-lg-block">Kết thúc sau:</span>
                <div className="d-flex gap-2">
                    {[
                      { val: timeLeft.d, label: 'D' }, 
                      { val: timeLeft.h, label: 'H' }, 
                      { val: timeLeft.m, label: 'M' }, 
                      { val: timeLeft.s, label: 'S' }
                    ].map((item, idx) => (
                      <div key={idx} className="text-center">
                        <div className="bg-white text-danger fw-bold rounded-3 d-flex align-items-center justify-content-center shadow-sm" 
                            style={{width:'50px', height:'50px', fontSize:'1.4rem'}}>
                          {String(item.val).padStart(2, '0')}
                        </div>
                        <div className="text-white small mt-1 fw-bold" style={{fontSize:'10px'}}>{item.label}</div>
                      </div>
                    ))}
                </div>
              </div>
            ) : (
              <Badge bg="dark" className="fs-5 px-4 py-3 rounded-pill border border-warning text-warning shadow">
                  <i className="fa-solid fa-hourglass-end me-2"></i> CHƯƠNG TRÌNH ĐÃ KẾT THÚC
              </Badge>
            )}
          </div>
        </Container>
      </div>

      <Container className="pb-5">
        <div className="mb-4">
           <Link to="/"><Button variant="outline-secondary" size="sm"><i className="fa-solid fa-arrow-left me-2"></i> Quay lại trang chủ</Button></Link>
        </div>

        {/* LOGIC HIỂN THỊ: Nếu hết giờ hoặc không có sản phẩm thì báo lỗi */}
        {isExpired ? (
           <div className="text-center py-5">
              <div className="fs-1 text-muted mb-3"><i className="fa-regular fa-face-sad-tear"></i></div>
              <h3>Tiếc quá! Chương trình Flash Sale đã kết thúc.</h3>
              <p className="text-muted">Hẹn gặp lại bạn trong đợt giảm giá tiếp theo nhé.</p>
              <Link to="/"><Button variant="success" className="fw-bold mt-2">XEM SẢN PHẨM KHÁC</Button></Link>
           </div>
        ) : flashProducts.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <div className="fs-1 mb-3"><i className="fa-solid fa-box-open"></i></div>
            <h3>Hiện chưa có sản phẩm Flash Sale nào.</h3>
            <p>Admin đang cập nhật, vui lòng quay lại sau!</p>
          </div>
        ) : (
          <Row className="g-3 row-cols-2 row-cols-md-4 row-cols-lg-5">
            {flashProducts.map(sp => (
              <Col key={sp.id} className="d-flex">
                {/* Truyền hàm rỗng cho openQuickView để tránh lỗi */}
                <Product sp={sp} themVaoGio={themVaoGio} openQuickView={()=>{}} />
              </Col>
            ))}
          </Row>
        )}
      </Container>
    </div>
  );
}

export default FlashSale;