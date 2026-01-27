import React from 'react';
import { Card, Button, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { toSlug } from './utils'; // <--- QUAN TRỌNG: Import từ utils, KHÔNG import từ App

function Product({ sp, themVaoGio, openQuickView }) {
  return (
    <Card className="product-card h-100 border-0 shadow-sm">
      <div className="position-relative overflow-hidden group-hover-zoom">
        <div className="badge-overlay">
          {sp.isFlashSale && <span className="badge-item badge-flash">⚡ SALE SỐC</span>}
          {sp.isMoi && <span className="badge-item badge-new">✨ MỚI</span>}
          {sp.phanTramGiam > 0 && <span className="badge-item badge-hot">-{sp.phanTramGiam}%</span>}
        </div>
        
        <Link to={`/san-pham/${sp.slug || toSlug(sp.ten)}`}>
          <Card.Img variant="top" src={sp.anh} className="product-img-fixed" alt={sp.ten} />
        </Link>
        
        {/* Nút xem nhanh */}
        <div className="quick-view-btn" onClick={(e) => { e.preventDefault(); openQuickView(); }}>
          <i className="fa-solid fa-eye text-dark"></i>
        </div>
      </div>

      <Card.Body className="d-flex flex-column p-3">
        <Link to={`/san-pham/${sp.slug || toSlug(sp.ten)}`} className="text-decoration-none text-dark">
          <Card.Title className="fs-6 fw-bold text-truncate mb-1">{sp.ten}</Card.Title>
        </Link>
        
        <div className="d-flex justify-content-between align-items-center mb-2 small text-muted">
          <span>Đơn vị: {sp.donVi}</span>
          <span className={sp.soLuong > 0 ? "text-success fw-bold" : "text-danger fw-bold"}>
            Kho: {sp.soLuong}
          </span>
        </div>

        <div className="mt-auto">
          <div className="d-flex align-items-center gap-2 mb-3">
            <span className="text-danger fw-bold fs-5">{parseInt(sp.giaBan).toLocaleString()}¥</span>
            {sp.giaGoc > sp.giaBan && <span className="text-muted text-decoration-line-through small">{parseInt(sp.giaGoc).toLocaleString()}¥</span>}
          </div>
          <Button 
            variant="outline-success" 
            className="w-100 rounded-pill fw-bold" 
            onClick={() => themVaoGio(sp)}
            disabled={sp.soLuong <= 0}
          >
            {sp.soLuong > 0 ? "THÊM" : "HẾT HÀNG"}
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
}
export default Product;