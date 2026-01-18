import React from 'react';
import { Row, Col, Container } from 'react-bootstrap';
import Product from './Product';

function Home({ dsSanPham, dsDanhMuc, themVaoGio }) {
  return (
    <Container fluid>
      <Row>
        <Col md={3} className="sidebar-main p-0 d-none d-md-block">
          <div className="p-3 bg-success text-white fw-bold">DANH MỤC</div>
          {dsDanhMuc.map(dm => (
            <a key={dm.id} href="#" className="category-link">{dm.icon} {dm.ten}</a>
          ))}
        </Col>
        <Col md={9} className="p-4">
          <Row className="g-4">
            {dsSanPham.map(sp => (
              <Col key={sp.id} xs={6} lg={4} xl={3}>
                <Product sp={sp} themVaoGio={themVaoGio} />
              </Col>
            ))}
          </Row>
        </Col>
      </Row>
    </Container>
  );
}

export default Home;