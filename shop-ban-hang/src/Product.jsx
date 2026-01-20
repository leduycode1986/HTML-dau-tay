import React from 'react';
import { Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { toSlug } from './App';

function Product({ sp, themVaoGio }) {
  const linkSP = `/san-pham/${toSlug(sp.ten)}/${sp.id}`;
  return (
    <Card className="product-card h-100 shadow-sm border-0">
      <div className="product-image-wrapper">
        <Link to={linkSP}><img src={sp.anh} alt={sp.ten} /></Link>
        <div className="badge-overlay">{sp.isMoi && <span className="badge-item badge-new">NEW</span>}{sp.isBanChay && <span className="badge-item badge-hot">HOT</span>}{sp.isKhuyenMai && <span className="badge-item badge-promo-tag">SALE</span>}</div>
      </div>
      <Card.Body className="d-flex flex-column p-2">
        <Link to={linkSP} className="text-decoration-none text-dark flex-grow-1"><div className="fw-bold text-truncate mb-1" title={sp.ten}>{sp.ten}</div><div className="d-flex align-items-center"><span className="price-sale me-2">{sp.giaBan?.toLocaleString()} ¥</span>{sp.phanTramGiam > 0 && <span className="price-original small">{sp.giaGoc?.toLocaleString()} ¥</span>}</div></Link>
        <Button variant="outline-success" size="sm" className="w-100 rounded-pill fw-bold mt-2" onClick={() => themVaoGio(sp)}><i className="fa-solid fa-cart-plus"></i> Thêm</Button>
      </Card.Body>
    </Card>
  );
}
export default Product;