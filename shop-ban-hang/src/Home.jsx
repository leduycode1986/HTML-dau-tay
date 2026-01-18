import React from 'react';
import { Row, Col, Container } from 'react-bootstrap';
import Product from './Product';

function Home({ dsSanPham, dsDanhMuc, themVaoGio }) {
  const sortedMenu = [...dsDanhMuc].sort((a, b) => parseFloat(a.order || 0) - parseFloat(b.order || 0));
  return (
    <Container fluid className="p-0">
      <Row className="g-0">
        <Col md={3} lg={2} className="sidebar-main d-none d-md-block shadow-sm">
          <div className="bg-success text-white p-3 fw-bold text-center border-bottom">DANH MỤC</div>
          {sortedMenu.map(dm => (
            <a key={dm.id} href="#" className={`category-link ${dm.parent ? 'ps-4 small text-muted' : 'fw-bold border-bottom bg-white'}`}>
              {dm.parent ? '↳ ' : dm.icon + ' '} {dm.ten}
            </a>
          ))}
        </Col>
        <Col md={9} lg={10} className="p-4 bg-white"><Row className="g-4">{(dsSanPham || []).map(sp => (<Col key={sp.id} xs={6} sm={4} xl={3}><Product sp={sp} themVaoGio={themVaoGio} /></Col>))}</Row></Col>
      </Row>
    </Container>
  );
}
export default Home;