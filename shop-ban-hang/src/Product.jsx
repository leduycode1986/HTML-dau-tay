import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from 'react-bootstrap';

function Product({ sp, themVaoGio }) {
  return (
    <div className="product-card shadow-sm border-0">
      <div className="product-image-wrapper">
        <div className="badge-overlay">
          {sp.isMoi && <span className="badge-item badge-new shadow-sm">MỚI</span>}
          {sp.isBanChay && <span className="badge-item badge-hot shadow-sm">HOT</span>}
          {sp.phanTramGiam > 0 && <span className="badge-item badge-promo-tag shadow-sm">-{sp.phanTramGiam}%</span>}
        </div>
        <Link to={`/product/${sp.id}`}><img src={sp.anh || "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg"} alt={sp.ten} className="img-fluid" /></Link>
      </div>
      <div className="p-3 text-center bg-white rounded-bottom">
        <Link to={`/product/${sp.id}`} className="text-decoration-none text-dark"><h6 className="fw-bold text-truncate mb-2">{sp.ten}</h6></Link>
        <div className="mb-3">
          {sp.phanTramGiam > 0 ? (
            <><span className="price-original small">{sp.giaGoc?.toLocaleString()} ¥</span> <span className="price-sale">{sp.giaBan?.toLocaleString()} ¥</span></>
          ) : <span className="price-sale">{sp.giaGoc?.toLocaleString()} ¥</span>}
        </div>
        <Button variant="success" size="sm" className="w-100 rounded-pill fw-bold shadow-sm" onClick={() => themVaoGio(sp)}>MUA HÀNG</Button>
      </div>
    </div>
  );
}
export default Product;