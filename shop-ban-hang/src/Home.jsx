import React from 'react';
import { Row, Col, Container, Alert } from 'react-bootstrap'; // Thêm Alert
import Product from './Product';

function Home({ dsSanPham, dsDanhMuc, themVaoGio }) {
  const sortedMenu = [...dsDanhMuc].sort((a, b) => parseFloat(a.order || 0) - parseFloat(b.order || 0));

  return (
    <Container fluid className="p-0">
      <Row className="g-0">
        {/* SIDEBAR DANH MỤC */}
        <Col md={3} lg={2} className="sidebar-main d-none d-md-block shadow-sm" style={{minHeight: '100vh', background: '#fff'}}>
          <div className="bg-success text-white p-3 fw-bold text-center text-uppercase">Danh Mục</div>
          {dsDanhMuc.length === 0 && <div className="p-3 text-muted small text-center">Chưa có danh mục</div>}
          
          {sortedMenu.map(dm => (
            <a key={dm.id} href="#" className={`category-link ${dm.parent ? 'ps-4 small text-muted' : 'fw-bold border-bottom'}`} style={{display:'block', padding:'12px', textDecoration:'none', color:'#333'}}>
              {dm.parent ? '↳ ' : <span className="me-2">{dm.icon}</span>} {dm.ten}
            </a>
          ))}
        </Col>

        {/* LƯỚI SẢN PHẨM */}
        <Col md={9} lg={10} className="p-4" style={{background: '#f4f6f9'}}>
          {dsSanPham.length === 0 ? (
            <Alert variant="warning" className="text-center mt-5">
              <h4>Chưa có sản phẩm nào!</h4>
              <p>Vui lòng vào trang <b>/admin</b> để thêm sản phẩm và danh mục mới.</p>
            </Alert>
          ) : (
            <Row className="g-4">
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