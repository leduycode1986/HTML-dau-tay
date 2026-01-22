import React from 'react';
import { Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { toSlug } from './App';

function Product({ sp, themVaoGio, openQuickView }) {
  const tonKho = sp.soLuong !== undefined ? parseInt(sp.soLuong) : 0;
  const isHetHang = tonKho <= 0;

  return (
    <Card className={`product-card ${isHetHang ? 'opacity-75' : ''}`}>
      <div className="position-relative">
        <Link to={`/san-pham/${toSlug(sp.ten)}/${sp.id}`} onClick={()=>window.scrollTo(0,0)}>
          {/* CLASS product-img-fixed GIÚP ẢNH KHÔNG BỊ TO ĐÙNG */}
          <img src={sp.anh} alt={sp.ten} className="product-img-fixed" style={{filter: isHetHang ? 'grayscale(100%)' : 'none'}} />
        </Link>
        <div className="badge-overlay">
          {isHetHang && <span className="badge-item bg-secondary">HẾT HÀNG</span>}
          {!isHetHang && sp.isFlashSale && <span className="badge-item badge-flash">⚡</span>}
          {!isHetHang && sp.isMoi && <span className="badge-item badge-new">NEW</span>}
        </div>
        <div className="quick-view-btn" onClick={openQuickView}><i className="fa-solid fa-eye"></i></div>
      </div>

      <Card.Body className="p-2 d-flex flex-column">
        <Link to={`/san-pham/${toSlug(sp.ten)}/${sp.id}`} className="text-decoration-none text-dark" onClick={()=>window.scrollTo(0,0)}>
          <Card.Title className="fs-6 fw-bold mb-1 text-truncate" title={sp.ten}>{sp.ten}</Card.Title>
        </Link>
        
        {/* HIỂN THỊ KHO & ĐƠN VỊ */}
        <div className="d-flex justify-content-between small text-muted mb-2">
          <span>Đơn vị: {sp.donVi || 'Cái'}</span>
          <span className={isHetHang ? 'text-danger fw-bold' : 'text-success fw-bold'}>Kho: {tonKho}</span>
        </div>

        <div className="mt-auto">
          <div className="d-flex align-items-center gap-2 mb-2">
            <span className="text-danger fw-bold">{sp.giaBan?.toLocaleString()} ¥</span>
            {sp.phanTramGiam > 0 && <span className="text-decoration-line-through text-muted small">{sp.giaGoc?.toLocaleString()} ¥</span>}
          </div>
          
          <Button 
            variant={isHetHang ? "secondary" : "outline-success"} 
            size="sm" 
            className="w-100 rounded-pill fw-bold" 
            onClick={() => !isHetHang && themVaoGio(sp)}
            disabled={isHetHang}
          >
            {isHetHang ? 'HẾT HÀNG' : 'THÊM'}
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
}
export default Product;