import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { toSlug } from './App';
import Product from './Product'; // Tái sử dụng thẻ sản phẩm chuẩn

function FlashSale({ dsSanPham, themVaoGio, shopConfig }) {
  const [timeLeft, setTimeLeft] = useState({ d:0, h:0, m:0, s:0 });
  
  // Logic đếm ngược
  useEffect(() => {
    if(!shopConfig?.flashSaleEnd) return;
    const end = new Date(shopConfig.flashSaleEnd).getTime();
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = end - now;
      if (distance < 0) {
        clearInterval(interval);
        setTimeLeft({ d:0, h:0, m:0, s:0 });
      } else {
        setTimeLeft({
          d: Math.floor(distance / (1000 * 60 * 60 * 24)),
          h: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          m: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          s: Math.floor((distance % (1000 * 60)) / 1000)
        });
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [shopConfig]);

  // Lọc sản phẩm Flash Sale
  const flashSaleProducts = dsSanPham.filter(sp => sp.isFlashSale);

  return (
    <div style={{minHeight: '100vh', background: '#fff0f0'}}>
      {/* HERO BANNER FLASH SALE */}
      <div className="bg-danger text-white py-5 text-center shadow-sm position-relative overflow-hidden">
        <Container style={{zIndex: 2, position: 'relative'}}>
          <h1 className="display-4 fw-bold text-uppercase mb-3"><i className="fa-solid fa-bolt fa-shake"></i> SIÊU SALE CHỚP NHOÁNG</h1>
          <p className="fs-5 mb-4">Săn ngay deal sốc - Số lượng có hạn!</p>
          
          {/* ĐỒNG HỒ ĐẾM NGƯỢC */}
          <div className="d-flex justify-content-center gap-3 align-items-center mb-3">
            <div className="text-center"><div className="bg-white text-danger fw-bold fs-2 rounded p-3 shadow" style={{minWidth:70}}>{String(timeLeft.d).padStart(2,'0')}</div><small className="fw-bold">Ngày</small></div>
            <span className="fs-1 fw-bold">:</span>
            <div className="text-center"><div className="bg-white text-danger fw-bold fs-2 rounded p-3 shadow" style={{minWidth:70}}>{String(timeLeft.h).padStart(2,'0')}</div><small className="fw-bold">Giờ</small></div>
            <span className="fs-1 fw-bold">:</span>
            <div className="text-center"><div className="bg-white text-danger fw-bold fs-2 rounded p-3 shadow" style={{minWidth:70}}>{String(timeLeft.m).padStart(2,'0')}</div><small className="fw-bold">Phút</small></div>
            <span className="fs-1 fw-bold">:</span>
            <div className="text-center"><div className="bg-white text-danger fw-bold fs-2 rounded p-3 shadow" style={{minWidth:70}}>{String(timeLeft.s).padStart(2,'0')}</div><small className="fw-bold">Giây</small></div>
          </div>
        </Container>
      </div>

      {/* DANH SÁCH SẢN PHẨM */}
      <Container className="py-5">
        {flashSaleProducts.length === 0 ? (
          <div className="text-center py-5">
            <h3 className="text-muted">Hiện chưa có chương trình Flash Sale nào.</h3>
            <Link to="/"><Button variant="outline-danger" className="mt-3 rounded-pill px-4">Quay lại trang chủ</Button></Link>
          </div>
        ) : (
          <Row className="g-4 row-cols-2 row-cols-md-3 row-cols-lg-4 row-cols-xl-5">
            {flashSaleProducts.map(sp => (
              <Col key={sp.id}>
                {/* Tái sử dụng component Product để đảm bảo đẹp và nhất quán */}
                <Product sp={sp} themVaoGio={themVaoGio} openQuickView={()=>{/* Logic xem nhanh nếu cần */}} />
              </Col>
            ))}
          </Row>
        )}
      </Container>
    </div>
  );
}
export default FlashSale;