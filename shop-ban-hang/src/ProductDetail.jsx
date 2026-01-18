import React from 'react';
import { useParams } from 'react-router-dom';
import { Button, Badge, Container } from 'react-bootstrap';

function ProductDetail({ dsSanPham, themVaoGio }) {
  const { id } = useParams();
  const sp = dsSanPham.find(p => p.id === id);
  if (!sp) return <div className="p-5 text-center"><h5>Không tìm thấy sản phẩm này</h5></div>;
  return (
    <Container className="py-5">
      <div className="detail-container shadow-lg bg-white rounded-4 overflow-hidden border-0">
        <div className="detail-image-box p-4"><img src={sp.anh} alt={sp.ten} className="img-fluid rounded-3" /></div>
        <div className="detail-info-box p-5">
          <div className="mb-3">{sp.isMoi && <Badge bg="success" className="me-2 px-3 py-2">NEW</Badge>}{sp.isBanChay && <Badge bg="danger" className="px-3 py-2">HOT</Badge>}</div>
          <h1 className="fw-bold text-success mb-3 display-6">{sp.ten}</h1>
          <div className="bg-light p-4 rounded-4 mb-4 text-center border">
            {sp.phanTramGiam > 0 && <div className="price-original mb-1 h5 text-muted">Giá cũ: {sp.giaGoc?.toLocaleString()} ¥</div>}
            <div className="price-sale display-5 mb-0 text-danger fw-bold">{sp.giaBan?.toLocaleString()} ¥</div>
          </div>
          <div className="mb-4 lh-lg text-secondary fs-5" dangerouslySetInnerHTML={{ __html: sp.moTa || 'Đang cập nhật...' }}></div>
          <Button variant="success" size="lg" className="w-100 py-3 fw-bold shadow rounded-pill" onClick={() => themVaoGio(sp)}>THÊM VÀO GIỎ</Button>
        </div>
      </div>
    </Container>
  );
}
export default ProductDetail;