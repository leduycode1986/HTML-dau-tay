import React from 'react';
import { Card, Button, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { toSlug } from './utils'; 

function Product({ sp, themVaoGio, openQuickView }) {
  return (
    <Card className="product-card h-100 border-0 shadow-sm">
      <div className="position-relative overflow-hidden">
        
        {/* Badge Giảm giá / Mới (Giữ nguyên) */}
        <div className="position-absolute top-0 start-0 p-2" style={{zIndex: 5}}>
          {sp.isFlashSale && <Badge bg="warning" text="dark" className="me-1 shadow-sm">⚡ Sale</Badge>}
          {sp.phanTramGiam > 0 && <Badge bg="danger" className="shadow-sm me-1">-{sp.phanTramGiam}%</Badge>}
          {sp.isMoi && <Badge bg="success" className="shadow-sm">New</Badge>}
        </div>
        
        <Link to={`/san-pham/${sp.slug || toSlug(sp.ten)}`}>
          <Card.Img variant="top" src={sp.anh} className="product-img-fixed" alt={sp.ten} />
        </Link>
        
        {/* --- NÚT XEM NHANH (SỬA LẠI VỊ TRÍ) --- */}
        {/* Nút này sẽ tự động căn giữa nhờ CSS .quick-view-btn trong style.css */}
        <div className="quick-view-btn" onClick={(e) => { e.preventDefault(); openQuickView(); }} title="Xem nhanh">
          <i className="fa-regular fa-eye fs-5"></i>
        </div>
        {/* -------------------------------------- */}
      </div>

      <Card.Body className="d-flex flex-column p-3">
        <Link to={`/san-pham/${sp.slug || toSlug(sp.ten)}`} className="text-decoration-none text-dark">
          <Card.Title className="fs-6 fw-bold text-truncate mb-1">{sp.ten}</Card.Title>
        </Link>
        
        <div className="mb-2 d-flex align-items-center">
          <span className={`small fw-bold ${sp.soLuong > 0 ? "text-success" : "text-danger"}`}>
            Số lượng: {sp.soLuong}
          </span>
          <span className="tag-donvi">{sp.donVi}</span>
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