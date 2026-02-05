import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import Product from './Product';

function FlashSale({ dsSanPham, themVaoGio, shopConfig }) {
  const [timeLeft, setTimeLeft] = useState({ d: 0, h: 0, m: 0, s: 0 });
  const [isExpired, setIsExpired] = useState(false); // Trạng thái hết giờ

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

  // Lọc sản phẩm Flash Sale
  const flashProducts = dsSanPham.filter(sp => sp.isFlashSale);

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa' }}>
      {/* --- BANNER HEADER VỚI ĐỒNG HỒ --- */}
      <div className="bg-danger text-white py-4 shadow-sm mb-4" style={{borderBottom:'4px solid #b71c1c'}}>
        <Container>
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
            <div>
              <h1 className="fw-bold m-0 text-uppercase" style={{textShadow:'2px 2px 0 rgba(0,0,0,0.2)'}}>
                <i className="fa-solid fa-bolt fa-shake me-2 text-warning"></i> FLASH SALE
              </h1>
              <p className="m-0 opacity-75">Săn deal giá sốc - Số lượng có hạn!</p>
            </div>
            
            {/* Khu vực Đồng hồ đếm ngược */}
            {!isExpired ? (
               <div className="d-flex align-items-center gap-3 bg-white bg-opacity-10 p-2 rounded border border-white border-opacity-25">
                 <span className="fw-bold text-uppercase small letter-spacing-1">Kết thúc sau:</span>
                 <div className="d-flex gap-2">
                    {[
                      { val: timeLeft.d, label: 'Ngày' }, 
                      { val: timeLeft.h, label: 'Giờ' }, 
                      { val: timeLeft.m, label: 'Phút' }, 
                      { val: timeLeft.s, label: 'Giây' }
                    ].map((item, idx) => (
                      <div key={idx} className="text-center">
                        <div className="bg-white text-danger fw-bold rounded px-2 py-1 fs-5 shadow-sm" style={{minWidth:'45px'}}>
                          {String(item.val).padStart(2, '0')}
                        </div>
                        <div className="small mt-1" style={{fontSize:'10px'}}>{item.label}</div>
                      </div>
                    ))}
                 </div>
               </div>
            ) : (
               <Badge bg="dark" className="fs-5 px-4 py-2">CHƯƠNG TRÌNH ĐÃ KẾT THÚC</Badge>
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