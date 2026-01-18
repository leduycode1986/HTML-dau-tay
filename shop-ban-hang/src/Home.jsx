import React from 'react';
import { Row, Col, Container, Alert } from 'react-bootstrap';
import Product from './Product';
import { Link } from 'react-router-dom';

function Home({ dsSanPham, dsDanhMuc, themVaoGio }) {
  return (
    <Container fluid className="p-0">
      <Row className="g-0">
        
        {/* CỘT DANH MỤC: Trên PC thì là cột bên trái (col-md-3), trên Mobile thì hiện ở trên đầu (col-12) */}
        <Col xs={12} md={3} lg={2} className="sidebar-main shadow-sm bg-white">
          <div className="bg-success text-white p-3 fw-bold text-center text-uppercase">
            <i className="fa-solid fa-bars me-2"></i> DANH MỤC
          </div>
          
          {/* Container này sẽ thành lướt ngang trên mobile nhờ CSS */}
          <div className="category-container-mobile d-md-block">
            {dsDanhMuc.length === 0 && <div className="p-3 text-center text-muted small">Đang tải...</div>}
            
            {dsDanhMuc.map(dm => (
              <div key={dm.id} className="category-item">
                <Link to={`/category/${dm.id}`} className={`category-link ${dm.parent ? 'ps-4 small text-secondary' : 'fw-bold text-dark'}`} style={{display:'block', textDecoration:'none'}}>
                  {dm.parent ? '↳ ' : <span className="me-2 fs-5">{dm.icon || '📦'}</span>} 
                  {dm.ten}
                </Link>
              </div>
            ))}
          </div>
        </Col>

        {/* CỘT SẢN PHẨM */}
        <Col xs={12} md={9} lg={10} className="p-3 p-md-4" style={{background: '#f4f6f9'}}>
          {dsSanPham.length === 0 ? (
            <Alert variant="info" className="text-center mt-3 shadow-sm border-0">
              <h5>Đang tải sản phẩm...</h5>
            </Alert>
          ) : (
            <Row className="g-2 g-md-3">
              {dsSanPham.map(sp => (
                // Trên mobile (xs) hiện 2 cột (xs={6}), trên tablet/pc hiện 4 cột
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