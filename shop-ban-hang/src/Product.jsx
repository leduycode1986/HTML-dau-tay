import React from 'react';
import { Card, Button, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { toSlug } from './App';

function Product({ sp, themVaoGio, openQuickView }) {
  // Kiểm tra tình trạng kho
  const isOutOfStock = !sp.soLuong || sp.soLuong <= 0;

  return (
    <Card className={`h-100 border-0 shadow-sm product-card ${isOutOfStock ? 'opacity-75' : ''}`}>
      <div className="product-image-wrapper position-relative">
        <Link to={`/san-pham/${toSlug(sp.ten)}/${sp.id}`} onClick={()=>window.scrollTo(0,0)}>
          {/* Nếu hết hàng thì ảnh mờ đi chút */}
          <Card.Img variant="top" src={sp.anh} alt={sp.ten} style={{filter: isOutOfStock ? 'grayscale(80%)' : 'none'}} />
        </Link>
        
        {/* Nhãn trạng thái */}
        <div className="badge-overlay">
          {isOutOfStock && <span className="badge-item bg-secondary">HẾT HÀNG</span>}
          {!isOutOfStock && sp.isFlashSale && <span className="badge-item badge-promo-tag">⚡ FLASH SALE</span>}
          {!isOutOfStock && sp.isMoi && <span className="badge-item badge-new">NEW</span>}
          {sp.phanTramGiam > 0 && <span className="badge-item badge-hot">-{sp.phanTramGiam}%</span>}
        </div>

        {/* Nút xem nhanh chỉ hiện khi hover */}
        <div className="quick-view-btn" onClick={openQuickView} title="Xem nhanh">
          <i className="fa-solid fa-eye"></i>
        </div>
      </div>

      <Card.Body className="p-3 d-flex flex-column">
        <Link to={`/san-pham/${toSlug(sp.ten)}/${sp.id}`} className="text-decoration-none text-dark" onClick={()=>window.scrollTo(0,0)}>
          <Card.Title className="fs-6 fw-bold mb-1 text-truncate" title={sp.ten}>{sp.ten}</Card.Title>
        </Link>
        
        {/* HIỂN THỊ KHO & ĐƠN VỊ - QUAN TRỌNG */}
        <div className="d-flex justify-content-between align-items-center mb-2" style={{fontSize: '0.8rem'}}>
          <span className="text-muted">Đơn vị: <strong>{sp.donVi || 'Cái'}</strong></span>
          <span className={isOutOfStock ? 'text-danger fw-bold' : 'text-success fw-bold'}>
            Kho: {sp.soLuong || 0}
          </span>
        </div>

        <div className="mt-auto">
          <div className="d-flex align-items-baseline gap-2 mb-2">
            <span className="text-danger fw-bold fs-5">{sp.giaBan?.toLocaleString()} ¥</span>
            {sp.phanTramGiam > 0 && <span className="text-decoration-line-through text-muted small">{sp.giaGoc?.toLocaleString()} ¥</span>}
          </div>
          
          {/* NÚT MUA HÀNG - Disable nếu hết kho */}
          <Button 
            variant={isOutOfStock ? "secondary" : "outline-success"} 
            size="sm" 
            className="w-100 rounded-pill fw-bold" 
            onClick={() => !isOutOfStock && themVaoGio(sp)}
            disabled={isOutOfStock}
          >
            {isOutOfStock ? 'HẾT HÀNG' : <><i className="fa-solid fa-cart-plus me-1"></i> Thêm</>}
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
}
export default Product;