import React from 'react';
import { Card, Button, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { toSlug } from './utils'; 

function Product({ sp, themVaoGio, openQuickView, toggleWishlist, toggleCompare, isWishlistPage, wishlist }) {
  // Kiểm tra đã thích chưa
  const isLiked = isWishlistPage || (wishlist && wishlist.some(i => i.id === sp.id));

  return (
    <Card className="product-card h-100 border-0 shadow-sm group-hover-effect">
      <div className="position-relative overflow-hidden product-img-wrapper">
        
        {/* Badge: Sale / New */}
        <div className="position-absolute top-0 start-0 p-2" style={{zIndex: 5}}>
          {sp.isFlashSale && <Badge bg="warning" text="dark" className="me-1 shadow-sm small">⚡ Sale</Badge>}
          {sp.phanTramGiam > 0 && <Badge bg="danger" className="shadow-sm me-1 small">-{sp.phanTramGiam}%</Badge>}
          {sp.isMoi && <Badge bg="success" className="shadow-sm small">New</Badge>}
        </div>
        
        {/* Nút Yêu thích & So sánh (Hiện khi hover) */}
        <div className="product-action-vertical">
           <button className={`btn-action ${isLiked ? 'active' : ''}`} onClick={(e)=>{e.preventDefault(); toggleWishlist && toggleWishlist(sp)}} title="Yêu thích">
              <i className={`fa-${isLiked ? 'solid' : 'regular'} fa-heart`}></i>
           </button>
           <button className="btn-action" onClick={(e)=>{e.preventDefault(); toggleCompare && toggleCompare(sp)}} title="So sánh">
              <i className="fa-solid fa-scale-balanced"></i>
           </button>
           <button className="btn-action" onClick={(e)=>{e.preventDefault(); openQuickView && openQuickView()}} title="Xem nhanh">
              <i className="fa-regular fa-eye"></i>
           </button>
        </div>

        <Link to={`/san-pham/${sp.slug || toSlug(sp.ten)}`}>
          <Card.Img variant="top" src={sp.anh} className="product-img-fixed" alt={sp.ten} loading="lazy" />
        </Link>
      </div>

      <Card.Body className="d-flex flex-column p-2"> {/* Giảm padding body cho gọn */}
        <Link to={`/san-pham/${sp.slug || toSlug(sp.ten)}`} className="text-decoration-none text-dark">
          <Card.Title className="fw-bold text-truncate mb-1 product-title-hover" style={{fontSize:'14px'}}>{sp.ten}</Card.Title>
        </Link>
        
        <div className="mb-1 d-flex align-items-center">
          <span className="text-muted small" style={{fontSize:'12px'}}>
             Kho: <span className={sp.soLuong > 0 ? "text-success fw-bold" : "text-danger"}>{sp.soLuong}</span> {sp.donVi}
          </span>
        </div>

        <div className="mt-auto">
          <div className="d-flex align-items-center gap-2 mb-2">
            <span className="text-danger fw-bold" style={{fontSize:'16px'}}>{parseInt(sp.giaBan).toLocaleString()}¥</span>
            {sp.giaGoc > sp.giaBan && <span className="text-muted text-decoration-line-through" style={{fontSize:'12px'}}>{parseInt(sp.giaGoc).toLocaleString()}</span>}
          </div>
          
          {/* --- [SỬA] NÚT THÊM GỌN GÀNG --- */}
          <Button 
            variant="danger" 
            className="w-100 rounded-pill shadow-sm border-0" 
            style={{fontSize: '13px', padding: '6px 0', fontWeight: '600'}}
            onClick={() => themVaoGio(sp)}
            disabled={sp.soLuong <= 0}
          >
            {sp.soLuong > 0 ? (
                // Dùng chữ "THÊM" ngắn gọn + Icon xe đẩy
                <span><i className="fa-solid fa-cart-plus me-1"></i> THÊM</span>
            ) : "HẾT HÀNG"}
          </Button>
          {/* ------------------------------- */}

        </div>
      </Card.Body>
    </Card>
  );
}
export default Product;