import React from 'react';
import { useParams } from 'react-router-dom';
import { Button, Badge, Container } from 'react-bootstrap';

function ProductDetail({ dsSanPham, themVaoGio }) {
  const { id } = useParams();
  const sp = dsSanPham.find(p => p.id === id);

  if (!sp) return <div className="p-5 text-center">Sản phẩm không tồn tại</div>;

  return (
    <Container className="py-5">
      <div className="detail-container shadow-sm border">
        <div className="detail-image-box">
          <img src={sp.anh} alt={sp.ten} />
        </div>
        <div className="detail-info-box">
          <div className="mb-3">
            {sp.isMoi && <Badge bg="success" className="me-2">NEW</Badge>}
            {sp.isBanChay && <Badge bg="danger">HOT</Badge>}
          </div>
          <h1 className="fw-bold text-success mb-3">{sp.ten}</h1>
          <div className="bg-light p-4 rounded-3 mb-4 text-center">
            {sp.phanTramGiam > 0 && <div className="price-original mb-1">Giá cũ: {sp.giaGoc?.toLocaleString()} ¥</div>}
            <div className="price-sale h2 mb-0">{sp.giaBan?.toLocaleString()} ¥</div>
          </div>
          <div className="mb-4" dangerouslySetInnerHTML={{ __html: sp.moTa }}></div>
          <Button variant="success" size="lg" className="w-100 py-3 fw-bold" onClick={() => themVaoGio(sp)}>MUA HÀNG NGAY</Button>
        </div>
      </div>
    </Container>
  );
}

export default ProductDetail;