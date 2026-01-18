import React from 'react';
import { Row, Col, Container, Alert } from 'react-bootstrap';
import Product from './Product';

function Home({ dsSanPham, dsDanhMuc, themVaoGio }) {
  return (
    <Container fluid className="p-0">
      <Row className="g-0">
        
        {/* CỘT DANH MỤC (BÊN TRÁI) - Luôn hiển thị */}
        <Col md={3} lg={2} className="sidebar-main shadow-sm bg-white" style={{minHeight: '100vh'}}>
          <div className="bg-success text-white p-3 fw-bold text-center text-uppercase">
            <i className="fa-solid fa-bars me-2"></i> DANH MỤC
          </div>
          
          {/* Kiểm tra nếu chưa có danh mục */}
          {dsDanhMuc.length === 0 && (
            <div className="p-4 text-center text-muted small">
              Đang tải danh mục...<br/>hoặc chưa có dữ liệu.
            </div>
          )}

          {/* Render Danh Mục */}
          {dsDanhMuc.map(dm => (
            <a key={dm.id} href="#" className={`category-link ${dm.parent ? 'ps-4 small text-secondary' : 'fw-bold text-dark border-bottom'}`} style={{display:'block', padding:'12px 15px', textDecoration:'none', borderBottom:'1px solid #f0f0f0'}}>
              {dm.parent ? '↳ ' : <span className="me-2 fs-5">{dm.icon || '📦'}</span>} 
              {dm.ten}
            </a>
          ))}
        </Col>

        {/* CỘT SẢN PHẨM (BÊN PHẢI) */}
        <Col md={9} lg={10} className="p-4" style={{background: '#f4f6f9'}}>
          {dsSanPham.length === 0 ? (
            <Alert variant="info" className="text-center mt-5 shadow-sm border-0">
              <h5>Đang tải sản phẩm từ Firebase...</h5>
              <p>Nếu đợi lâu không thấy, hãy kiểm tra lại trang Admin xem đã thêm sản phẩm chưa nhé.</p>
            </Alert>
          ) : (
            <Row className="g-3">
              {dsSanPham.map(sp => (
                <Col key={sp.id} xs={6} sm={4} lg={3} xl={3}>
                  <Product sp={sp} themVaoGio={themVaoGio} />
                </Col>
              ))}
            </Row>
          )}
        </Col>
      </Row>
    </Container>
  );
}

export default Home;