import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Alert, Button } from 'react-bootstrap';
import Product from './Product';
import { Link } from 'react-router-dom';

function FlashSale({ dsSanPham, themVaoGio, shopConfig }) {
  const [timeLeft, setTimeLeft] = useState({ h: 0, m: 0, s: 0 });

  useEffect(() => {
    if(!shopConfig?.flashSaleEnd) return;
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = new Date(shopConfig.flashSaleEnd).getTime() - now;
      if (distance < 0) { clearInterval(interval); setTimeLeft({ h:0, m:0, s:0 }); }
      else {
        const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((distance % (1000 * 60)) / 1000);
        setTimeLeft({ h, m, s });
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [shopConfig]);

  const flashProducts = dsSanPham.filter(sp => sp.isFlashSale);

  if (timeLeft.h === 0 && timeLeft.m === 0 && timeLeft.s === 0) {
    return (
      <Container className="py-5 text-center">
        <h3>Rất tiếc, chương trình Flash Sale đã kết thúc!</h3>
        <Link to="/"><Button variant="primary">Quay lại trang chủ</Button></Link>
      </Container>
    );
  }

  return (
    <div style={{minHeight: '80vh'}}>
      <div className="flash-page-header">
        <h1 className="fw-bold display-4"><i className="fa-solid fa-bolt fa-shake"></i> SĂN DEAL GIÁ SỐC</h1>
        <p className="lead">Cơ hội duy nhất trong ngày - Số lượng có hạn</p>
        <div className="flash-countdown-large">
          <div className="time-box">{String(timeLeft.h).padStart(2,'0')}</div>
          <div className="time-box">{String(timeLeft.m).padStart(2,'0')}</div>
          <div className="time-box">{String(timeLeft.s).padStart(2,'0')}</div>
        </div>
      </div>

      <Container>
        <Row className="g-3 row-cols-2 row-cols-md-3 row-cols-lg-4 row-cols-xl-5">
          {flashProducts.map(sp => (
            <Col key={sp.id}>
              <Product sp={sp} themVaoGio={themVaoGio} />
            </Col>
          ))}
        </Row>
        {flashProducts.length === 0 && <Alert variant="warning" className="text-center mt-4">Chưa có sản phẩm nào được thêm vào Flash Sale.</Alert>}
      </Container>
    </div>
  );
}
export default FlashSale;