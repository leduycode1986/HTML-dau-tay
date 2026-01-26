import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { toSlug } from './utils'; // <--- QUAN TRỌNG: Import từ utils (đã sửa)
import Product from './Product';

function FlashSale({ dsSanPham, themVaoGio, shopConfig }) {
  const [timeLeft, setTimeLeft] = useState({ d:0, h:0, m:0, s:0 });
  
  useEffect(() => {
    if(!shopConfig?.flashSaleEnd) return;
    const end = new Date(shopConfig.flashSaleEnd).getTime();
    const timer = setInterval(() => {
      const now = new Date().getTime(); const dist = end - now;
      if (dist < 0) { clearInterval(timer); setTimeLeft({ d:0, h:0, m:0, s:0 }); }
      else { setTimeLeft({ d:Math.floor(dist/(1000*60*60*24)), h:Math.floor((dist%(1000*60*60*24))/(1000*60*60)), m:Math.floor((dist%(1000*60*60))/(1000*60)), s:Math.floor((dist%(1000*60))/1000) }); }
    }, 1000);
    return () => clearInterval(timer);
  }, [shopConfig]);

  const flashProducts = dsSanPham.filter(sp => sp.isFlashSale);

  return (
    <div style={{minHeight:'100vh', background:'#f8f9fa'}}>
      {/* BANNER FLASH SALE */}
      <div className="flash-sale-hero text-center shadow-sm">
        <Container>
          <h2 className="flash-sale-title"><i className="fa-solid fa-bolt fa-shake"></i> FLASH SALE</h2>
          <div className="d-flex justify-content-center gap-3 align-items-center">
            <div className="time-box">{String(timeLeft.d).padStart(2,'0')}</div>:
            <div className="time-box">{String(timeLeft.h).padStart(2,'0')}</div>:
            <div className="time-box">{String(timeLeft.m).padStart(2,'0')}</div>:
            <div className="time-box bg-white text-danger border-0">{String(timeLeft.s).padStart(2,'0')}</div>
          </div>
        </Container>
      </div>

      <Container className="py-5">
        {flashProducts.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <div className="fs-1 mb-3"><i className="fa-regular fa-clock"></i></div>
            <h3>Chưa có chương trình khuyến mãi nào.</h3>
            <p>Vui lòng quay lại sau nhé!</p>
            <Link to="/"><Button variant="outline-danger" className="mt-3 rounded-pill fw-bold px-4">Quay lại trang chủ</Button></Link>
          </div>
        ) : (
          <Row className="g-4 row-cols-2 row-cols-md-4 row-cols-lg-5">
            {flashProducts.map(sp => (
              <Col key={sp.id}>
                {/* Truyền hàm openQuickView rỗng để tránh lỗi nếu không cần xem nhanh ở đây */}
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