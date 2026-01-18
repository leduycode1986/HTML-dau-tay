import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button, Badge, Container, Row, Col } from 'react-bootstrap';
import Product from './Product';

function ProductDetail({ dsSanPham, dsDanhMuc, themVaoGio }) {
  const { id } = useParams();
  const sp = dsSanPham.find(p => p.id === id);

  if (!sp) return <div className="p-5 text-center"><h5>Không tìm thấy sản phẩm này</h5></div>;

  // Lấy sản phẩm liên quan & khuyến mãi
  const relatedProducts = dsSanPham.filter(p => p.phanLoai === sp.phanLoai && p.id !== sp.id).slice(0, 4);
  const promoProducts = dsSanPham.filter(p => p.isKhuyenMai && p.id !== sp.id).slice(0, 5);

  return (
    <Container fluid className="py-3 py-md-4">
      <Row>
        {/* CỘT TRÁI: MENU (Ẩn trên mobile và tablet nhỏ, chỉ hiện trên PC lớn) */}
        <Col lg={2} className="d-none d-lg-block">
          <div className="bg-white rounded shadow-sm p-3">
            <h6 className="fw-bold text-success border-bottom pb-2">DANH MỤC</h6>
            <div className="d-flex flex-column gap-2">
              {dsDanhMuc.filter(d => !d.parent).map(d => (
                <Link key={d.id} to={`/category/${d.id}`} className="text-dark small hover-green">{d.ten}</Link>
              ))}
            </div>
          </div>
        </Col>

        {/* CỘT GIỮA: CHI TIẾT SẢN PHẨM */}
        <Col xs={12} lg={7}>
          <div className="bg-white rounded p-3 p-md-4 shadow-sm mb-4">
            <Row>
              <Col xs={12} md={5} className="mb-3 mb-md-0"><img src={sp.anh} alt={sp.ten} className="img-fluid rounded border w-100" /></Col>
              <Col xs={12} md={7}>
                <h2 className="fw-bold text-success fs-3">{sp.ten}</h2>
                <div className="mb-2">
                  {sp.isMoi && <Badge bg="success" className="me-1">NEW</Badge>}
                  {sp.isBanChay && <Badge bg="danger" className="me-1">HOT</Badge>}
                </div>
                <h3 className="text-danger fw-bold my-2">{sp.giaBan?.toLocaleString()} ¥</h3>
                <div className="text-muted mb-4 small" dangerouslySetInnerHTML={{ __html: sp.moTa || 'Đang cập nhật mô tả...' }}></div>
                <Button variant="success" size="lg" className="w-100 fw-bold rounded-pill" onClick={() => themVaoGio(sp)}>THÊM VÀO GIỎ</Button>
              </Col>
            </Row>
          </div>

          {/* SẢN PHẨM CÙNG LOẠI (Mobile hiện 2 cột) */}
          <h5 className="fw-bold text-uppercase border-bottom pb-2 mb-3">Sản phẩm cùng loại</h5>
          <Row className="g-2 g-md-3">
            {relatedProducts.length > 0 ? relatedProducts.map(p => (
              <Col key={p.id} xs={6} md={3}><Product sp={p} themVaoGio={themVaoGio} /></Col>
            )) : <p className="text-muted">Chưa có sản phẩm liên quan.</p>}
          </Row>
        </Col>

        {/* CỘT PHẢI: KHUYẾN MÃI (Trên mobile đẩy xuống dưới cùng) */}
        <Col xs={12} lg={3} className="mt-4 mt-lg-0">
          <div className="bg-white rounded shadow-sm p-3">
            <h6 className="fw-bold text-danger border-bottom pb-2">⚡ ĐANG GIẢM GIÁ</h6>
            {promoProducts.map(p => (
              <div key={p.id} className="promo-sidebar-item">
                <Link to={`/product/${p.id}`}><img src={p.anh} alt={p.ten} /></Link>
                <div className="promo-info">
                  <Link to={`/product/${p.id}`} className="fw-bold text-dark d-block text-truncate" style={{maxWidth:'120px'}}>{p.ten}</Link>
                  <span className="text-danger fw-bold">{p.giaBan?.toLocaleString()} ¥</span>
                </div>
              </div>
            ))}
          </div>
        </Col>
      </Row>
    </Container>
  );
}
export default ProductDetail;