import React from 'react';
import { Card, Button, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { toSlug } from './App';

function Product({ sp, themVaoGio, openQuickView }) {
  return (
    <Card className="h-100 border-0 shadow-sm product-card">
      <div className="product-image-wrapper">
        <Link to={`/san-pham/${toSlug(sp.ten)}/${sp.id}`} onClick={()=>window.scrollTo(0,0)}>
          <Card.Img variant="top" src={sp.anh} alt={sp.ten} />
        </Link>
        <div className="badge-overlay">
          {sp.isFlashSale && <span className="badge-item badge-promo-tag">⚡ FLASH SALE</span>}
          {sp.isMoi && <span className="badge-item badge-new">NEW</span>}
          {sp.phanTramGiam > 0 && <span className="badge-item badge-hot">-{sp.phanTramGiam}%</span>}
        </div>
        <div className="quick-view-btn" onClick={openQuickView} title="Xem nhanh">
          <i className="fa-solid fa-eye"></i>
        </div>
      </div>
      <Card.Body className="p-3 d-flex flex-column">
        <Link to={`/san-pham/${toSlug(sp.ten)}/${sp.id}`} className="text-decoration-none text-dark" onClick={()=>window.scrollTo(0,0)}>
          <Card.Title className="fs-6 fw-bold mb-1 text-truncate" title={sp.ten}>{sp.ten}</Card.Title>
        </Link>
        
        {/* HIỂN THỊ GIÁ KÈM ĐƠN VỊ TÍNH */}
        <div className="mt-auto">
          <div className="d-flex align-items-baseline flex-wrap">
            <span className="text-danger fw-bold me-2" style={{fontSize: '1.1rem'}}>
              {sp.giaBan?.toLocaleString()}¥ <span className="small text-muted fw-normal">/ {sp.donVi || 'cái'}</span>
            </span>
            {sp.phanTramGiam > 0 && <span className="text-muted text-decoration-line-through small">{sp.giaGoc?.toLocaleString()}¥</span>}
          </div>
          
          <Button variant="outline-success" size="sm" className="w-100 mt-2 rounded-pill fw-bold" onClick={() => themVaoGio(sp)}>
            <i className="fa-solid fa-cart-plus me-1"></i> Thêm
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
}
export default Product;