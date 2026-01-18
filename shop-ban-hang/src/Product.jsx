import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from 'react-bootstrap';

function Product({ sp, themVaoGio }) {
  const [daThich, setDaThich] = useState(false);

  return (
    <div className="product-card shadow-sm">
      <div className="product-image-wrapper">
        <div className="badge-overlay">
          {sp.isMoi && <span className="badge-item badge-new">MỚI</span>}
          {sp.isBanChay && <span className="badge-item badge-hot">HOT</span>}
          {sp.phanTramGiam > 0 && <span className="badge-item badge-promo">-{sp.phanTramGiam}%</span>}
        </div>
        <Link to={`/product/${sp.id}`}>
          <img src={sp.anh || "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg"} alt={sp.ten} />
        </Link>
      </div>

      <div className="product-info p-3 text-center">
        <Link to={`/product/${sp.id}`} className="text-decoration-none text-dark">
          <h6 className="fw-bold text-truncate">{sp.ten}</h6>
        </Link>

        <div className="price-block mb-3">
          {sp.phanTramGiam > 0 ? (
            <>
              <span className="price-original">{sp.giaGoc?.toLocaleString()} ¥</span>
              <span className="price-sale">{sp.giaBan?.toLocaleString()} ¥</span>
            </>
          ) : (
            <span className="price-sale">{sp.giaGoc?.toLocaleString()} ¥</span>
          )}
        </div>

        <div className="d-flex gap-2 justify-content-center">
          <Button variant="success" size="sm" className="rounded-pill px-3 fw-bold" onClick={() => themVaoGio(sp)}>MUA HÀNG</Button>
          <Button variant="outline-danger" size="sm" className="rounded-circle" onClick={() => setDaThich(!daThich)} style={{backgroundColor: daThich ? '#ffebee' : 'white'}}>
            {daThich ? '❤️' : '🤍'}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default Product;