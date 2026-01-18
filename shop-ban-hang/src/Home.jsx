import React from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { Badge, Row, Col, Card, Button } from 'react-bootstrap';
import SEO from './SEO';

function Home({ dsSanPham, dsDanhMuc, themVaoGio }) {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const tuKhoa = searchParams.get('search') || '';

  let list = dsSanPham.filter(sp => {
      const matchKey = sp.ten.toLowerCase().includes(tuKhoa.toLowerCase());
      if (!id || id === 'all') return matchKey;
      const currentDM = dsDanhMuc.find(d => d.id === id || d.customId === id);
      const childIDs = dsDanhMuc.filter(d => d.parent === (currentDM?.customId || currentDM?.id)).map(d => d.customId || d.id);
      return matchKey && (sp.phanLoai === (currentDM?.customId || currentDM?.id) || childIDs.includes(sp.phanLoai));
  });

  return (
    <div>
      <SEO title={id || 'Trang Chủ'} />
      <h4 className="text-success fw-bold border-bottom pb-2 mb-3">SẢN PHẨM</h4>
      <Row className="g-3">
        {list.map(sp => (
          <Col xs={6} md={4} lg={3} xl={2} key={sp.id}>
            <Card className="product-card shadow-sm">
              <Link to={`/product/${sp.id}`} className="text-decoration-none text-dark">
                <div className="product-img-container">
                  <Card.Img src={sp.anh} className="product-img" />
                </div>
                <Card.Body className="p-2 text-center">
                  <Card.Title className="fs-6 fw-bold text-truncate">{sp.ten}</Card.Title>
                  <div className="text-danger fw-bold">{sp.giaBan?.toLocaleString()} ¥</div>
                </Card.Body>
              </Link>
              <Card.Footer className="bg-white border-0 p-2">
                <Button variant="outline-success" size="sm" className="w-100 fw-bold" onClick={()=>themVaoGio(sp)}>+ Giỏ hàng</Button>
              </Card.Footer>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}
export default Home;