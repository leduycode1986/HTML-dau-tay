import React from 'react';
import { Container, Row, Col, Button, Alert } from 'react-bootstrap';
import Product from './Product';
import { Link } from 'react-router-dom';

function Wishlist({ wishlist, toggleWishlist, themVaoGio }) {
  if (wishlist.length === 0) return (
    <Container className="py-5 text-center">
      <div className="fs-1 text-muted mb-3"><i className="fa-regular fa-heart"></i></div>
      <h3>Danh sách yêu thích trống</h3>
      <p>Hãy thả tim các món ngon bạn muốn để dành mua sau nhé!</p>
      <Link to="/" className="btn btn-success rounded-pill px-4">Dạo một vòng shop</Link>
    </Container>
  );

  return (
    <Container className="py-4">
      <h3 className="fw-bold text-danger mb-4"><i className="fa-solid fa-heart me-2"></i> SẢN PHẨM YÊU THÍCH ({wishlist.length})</h3>
      <Row className="g-3 row-cols-2 row-cols-md-4 row-cols-lg-5">
        {wishlist.map(sp => (
          <Col key={sp.id}>
            <Product sp={sp} themVaoGio={themVaoGio} openQuickView={()=>{}} isWishlistPage={true} toggleWishlist={toggleWishlist} />
          </Col>
        ))}
      </Row>
    </Container>
  );
}
export default Wishlist;