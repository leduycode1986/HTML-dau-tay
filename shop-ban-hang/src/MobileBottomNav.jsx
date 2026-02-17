import React from 'react';
import { Nav } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';

function MobileBottomNav({ cartCount, wishlistCount }) {
  const location = useLocation();
  const active = (path) => location.pathname === path ? 'text-success' : 'text-secondary';

  return (
    <div className="mobile-bottom-nav d-lg-none">
      <Nav className="justify-content-around w-100 py-2 bg-white border-top shadow-lg">
        <Link to="/" className={`nav-link text-center ${active('/')}`}>
          <div className="fs-5"><i className="fa-solid fa-house"></i></div>
          <div style={{fontSize:'10px'}}>Trang chủ</div>
        </Link>
        
        <Link to="/danh-muc/san-pham-moi" className={`nav-link text-center ${active('/danh-muc/san-pham-moi')}`}>
          <div className="fs-5"><i className="fa-solid fa-layer-group"></i></div>
          <div style={{fontSize:'10px'}}>Sản phẩm</div>
        </Link>

        <Link to="/wishlist" className={`nav-link text-center position-relative ${active('/wishlist')}`}>
          <div className="fs-5"><i className="fa-solid fa-heart"></i></div>
          <div style={{fontSize:'10px'}}>Yêu thích</div>
          {wishlistCount > 0 && <span className="position-absolute top-0 start-50 translate-middle badge rounded-pill bg-danger" style={{fontSize:'8px'}}>{wishlistCount}</span>}
        </Link>

        <Link to="/cart" className={`nav-link text-center position-relative ${active('/cart')}`}>
          <div className="fs-5"><i className="fa-solid fa-cart-shopping"></i></div>
          <div style={{fontSize:'10px'}}>Giỏ hàng</div>
          {cartCount > 0 && <span className="position-absolute top-0 start-50 translate-middle badge rounded-pill bg-success" style={{fontSize:'8px'}}>{cartCount}</span>}
        </Link>

        <Link to="/member" className={`nav-link text-center ${active('/member')}`}>
          <div className="fs-5"><i className="fa-regular fa-user"></i></div>
          <div style={{fontSize:'10px'}}>Tài khoản</div>
        </Link>
      </Nav>
    </div>
  );
}
export default MobileBottomNav;