import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { Badge, Row, Col, Card, Button } from 'react-bootstrap';

function Home({ dsSanPham, dsDanhMuc, themVaoGio }) {
  const { id } = useParams();
  
  // Logic lọc giữ nguyên như ban đầu
  let list = dsSanPham.filter(sp => {
      if (!id || id === 'all') return true;
      return sp.phanLoai === id;
  });

  return (
    <Row className="g-3">
      {list.map(sp => (
        <Col xs={6} md={4} lg={3} xl={2} key={sp.id}>
          <Card className="product-card shadow-sm border-0 h-100">
            <Link to={`/product/${sp.id}`} className="text-decoration-none text-dark">
              <div className="product-img-container">
                <Card.Img src={sp.anh} className="product-img" />
              </div>
              <Card.Body className="p-2">
                <Card.Title className="fs-6 fw-bold text-truncate">{sp.ten}</Card.Title>
                <div className="text-danger fw-bold">{sp.giaBan?.toLocaleString()} ¥</div>
              </Card.Body>
            </Link>
            <Card.Footer className="bg-white border-0 p-2">
              <Button variant="outline-success" size="sm" className="w-100 fw-bold" onClick={() => themVaoGio(sp)}>+ Giỏ hàng</Button>
            </Card.Footer>
          </Card>
        </Col>
      ))}
    </Row>
  );
}
export default Home;