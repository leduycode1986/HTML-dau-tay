import React from 'react';
import { useParams } from 'react-router-dom';
import { Row, Col, Button, Badge, Card } from 'react-bootstrap';
import SEO from './SEO';

function ProductDetail({ dsSanPham, themVaoGio }) {
  const { id } = useParams();
  const sp = dsSanPham.find(p => p.id === id);

  if (!sp) return <div className="p-5 text-center">Sản phẩm không tồn tại</div>;

  return (
    <div className="p-2">
      <SEO title={sp.ten} />
      <Card className="detail-card shadow-sm">
        <Row className="g-0 detail-row">
          {/* CỘT TRÁI: ẢNH SẢN PHẨM */}
          <Col className="detail-img-col">
            <img src={sp.anh} className="detail-main-img" alt={sp.ten} />
          </Col>
          
          {/* CỘT PHẢI: THÔNG TIN */}
          <Col className="detail-info-col">
            <h2 className="fw-bold text-success mb-3">{sp.ten}</h2>
            <div className="bg-light p-3 rounded mb-4">
              <span className="display-6 text-danger fw-bold">{sp.giaBan?.toLocaleString()} ¥</span>
              <span className="ms-2 text-muted">/ {sp.donVi}</span>
            </div>
            <div className="mb-4">
              <h5 className="fw-bold border-bottom pb-2">Mô tả</h5>
              <div dangerouslySetInnerHTML={{ __html: sp.moTa }} className="lh-lg" />
            </div>
            <Button variant="success" size="lg" className="w-100 fw-bold py-3" onClick={()=>themVaoGio(sp)}>THÊM VÀO GIỎ HÀNG</Button>
          </Col>
        </Row>
      </Card>
    </div>
  );
}
export default ProductDetail;