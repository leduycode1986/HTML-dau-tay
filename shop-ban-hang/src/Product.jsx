import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from 'react-bootstrap';

function Product({ sp, themVaoGio }) {
  return (
    <div className="product-card shadow-sm">
      <div className="product-image-wrapper">
        <div className="badge-overlay">
          {sp.isMoi && <span className="badge-item badge-new">MỚI</span>}
          {sp.isBanChay && <span className="badge-item badge-hot">HOT</span>}
          {sp.phanTramGiam > 0 && <span className="badge-item badge-promo-tag">-{sp.phanTramGiam}%</span>}
        </div>
        <Link to={`/product/${sp.id}`}><img src={sp.anh || NO_IMAGE} alt={sp.ten} /></Link>
      </div>
      <div className="p-3 text-center">
        <Link to={`/product/${sp.id}`} className="text-decoration-none text-dark"><h6 className="fw-bold text-truncate">{sp.ten}</h6></Link>
        <div className="mb-2">
          {sp.phanTramGiam > 0 ? (
            <><span className="price-original">{sp.giaGoc?.toLocaleString()} ¥</span> <span className="price-sale">{sp.giaBan?.toLocaleString()} ¥</span></>
          ) : <span className="price-sale">{sp.giaGoc?.toLocaleString()} ¥</span>}
        </div>
        <Button variant="success" size="sm" className="w-100 rounded-pill fw-bold" onClick={() => themVaoGio(sp)}>MUA HÀNG</Button>
      </div>
    </div>
  );
}
export default Product;