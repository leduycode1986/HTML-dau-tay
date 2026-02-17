import React from 'react';
import { Card, Button, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { toSlug } from './utils'; 

function Product({ sp, themVaoGio, openQuickView, toggleWishlist, toggleCompare, isWishlistPage, wishlist }) {
  // Kiểm tra xem sản phẩm đã có trong wishlist chưa (để tô đỏ trái tim)
  const isLiked = isWishlistPage || (wishlist && wishlist.some(i => i.id === sp.id));

  return (
    <Card className="product-card h-100 border-0 shadow-sm group-hover-effect">
      <div className="position-relative overflow-hidden product-img-wrapper">
        
        {/* Badge */}
        <div className="position-absolute top-0 start-0 p-2" style={{zIndex: 5}}>
          {sp.isFlashSale && <Badge bg="warning" text="dark" className="me-1 shadow-sm">⚡ Sale</Badge>}
          {sp.phanTramGiam > 0 && <Badge bg="danger" className="shadow-sm me-1">-{sp.phanTramGiam}%</Badge>}
          {sp.isMoi && <Badge bg="success" className="shadow-sm">New</Badge>}
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

      <Card.Body className="d-flex flex-column p-3">
        <Link to={`/san-pham/${sp.slug || toSlug(sp.ten)}`} className="text-decoration-none text-dark">
          <Card.Title className="fs-6 fw-bold text-truncate mb-1 product-title-hover">{sp.ten}</Card.Title>
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
          
          {/* --- [SỬA LỖI] NÚT THÊM GIỎ HÀNG NHỎ GỌN HƠN --- */}
          <Button 
            variant="outline-success" 
            // Bỏ fw-bold, thêm style chỉnh cỡ chữ nhỏ lại
            className="w-100 rounded-pill py-1 btn-add-cart-hover d-flex align-items-center justify-content-center" 
            style={{fontSize: '0.85rem', fontWeight: '600'}}
            onClick={() => themVaoGio(sp)} 
            disabled={sp.soLuong <= 0}
          >
            {sp.soLuong > 0 ? (
                // Thêm icon xe đẩy cho đẹp và gọn
                <><i className="fa-solid fa-cart-plus me-2"></i>THÊM VÀO GIỎ</>
            ) : "HẾT HÀNG"}
          </Button>
          {/* ----------------------------------------------- */}

        </div>
      </Card.Body>
    </Card>
  );
}
export default Product;