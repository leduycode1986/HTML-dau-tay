import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button, Badge, Form } from 'react-bootstrap';
import { toSlug } from './utils';
import { collection, addDoc, onSnapshot, query, where, serverTimestamp } from 'firebase/firestore'; 
import { db } from './firebase';

function ProductDetail({ dsSanPham, themVaoGio }) {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [sanPham, setSanPham] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ name: '', rating: 5, comment: '' });

  useEffect(() => {
    if (dsSanPham.length > 0) {
      const found = dsSanPham.find(sp => (sp.slug === slug) || (toSlug(sp.ten) === slug) || (sp.id === slug));
      setSanPham(found);
      if (found) {
        // Load Reviews
        const q = query(collection(db, "reviews"), where("productId", "==", found.id));
        const unsub = onSnapshot(q, sn => setReviews(sn.docs.map(d=>d.data())));
        return () => unsub();
      }
    }
  }, [slug, dsSanPham]);

  const submitReview = async () => {
    if(!newReview.name || !newReview.comment) return alert("Vui lòng nhập tên và nội dung!");
    await addDoc(collection(db, "reviews"), { ...newReview, productId: sanPham.id, ngay: serverTimestamp() });
    setNewReview({ name: '', rating: 5, comment: '' });
    alert("Cảm ơn đánh giá của bạn!");
  };

  const handleBuyNow = () => {
    themVaoGio(sanPham);
    navigate('/checkout');
  };

  if (!sanPham) return <Container className="py-5 text-center">Đang tải...</Container>;

  // Sản phẩm liên quan (Cùng danh mục)
  const relatedProducts = dsSanPham.filter(sp => sp.phanLoai === sanPham.phanLoai && sp.id !== sanPham.id).slice(0, 4);

  return (
    <Container className="py-5">
      <Link to="/" className="btn-back-home mb-4"><i className="fa-solid fa-chevron-left"></i> Quay lại</Link>
      <Row className="g-5">
        <Col lg={5}><div className="detail-img-box"><img src={sanPham.anh} alt={sanPham.ten} /></div></Col>
        <Col lg={7}>
          <h1 className="detail-title">{sanPham.ten}</h1>
          <div className="detail-price mb-3 text-danger fw-bold fs-2">{sanPham.giaBan?.toLocaleString()} ¥</div>
          
          <div className="d-flex gap-2 mb-4">
            <Button className="btn-add-cart-lg" onClick={() => themVaoGio(sanPham)}>THÊM VÀO GIỎ</Button>
            <Button variant="danger" className="rounded-pill px-4 fw-bold" onClick={handleBuyNow}>MUA NGAY</Button>
          </div>

          <div className="detail-desc-box"><div dangerouslySetInnerHTML={{__html: sanPham.moTa}}></div></div>
        </Col>
      </Row>

      {/* PHẦN ĐÁNH GIÁ */}
      <div className="mt-5 bg-white p-4 rounded shadow-sm">
        <h4 className="border-bottom pb-2 mb-4">Đánh giá sản phẩm ({reviews.length})</h4>
        <Row>
          <Col md={6}>
            {reviews.map((r, i) => (
              <div key={i} className="mb-3 border-bottom pb-2">
                <div className="fw-bold">{r.name} <span className="text-warning">{'⭐'.repeat(r.rating)}</span></div>
                <div className="text-muted small">{r.comment}</div>
              </div>
            ))}
          </Col>
          <Col md={6} className="bg-light p-3 rounded">
            <h6>Viết đánh giá của bạn</h6>
            <Form.Control className="mb-2" placeholder="Tên của bạn" value={newReview.name} onChange={e=>setNewReview({...newReview, name:e.target.value})}/>
            <Form.Select className="mb-2" value={newReview.rating} onChange={e=>setNewReview({...newReview, rating:parseInt(e.target.value)})}>
              <option value="5">⭐⭐⭐⭐⭐ (Tuyệt vời)</option>
              <option value="4">⭐⭐⭐⭐ (Tốt)</option>
              <option value="3">⭐⭐⭐ (Bình thường)</option>
            </Form.Select>
            <Form.Control as="textarea" rows={3} className="mb-2" placeholder="Nội dung..." value={newReview.comment} onChange={e=>setNewReview({...newReview, comment:e.target.value})}/>
            <Button variant="success" onClick={submitReview}>Gửi đánh giá</Button>
          </Col>
        </Row>
      </div>

      {/* SẢN PHẨM LIÊN QUAN */}
      {relatedProducts.length > 0 && (
        <div className="mt-5">
          <h4 className="fw-bold text-success mb-3">Sản phẩm liên quan</h4>
          <Row className="g-3">
            {relatedProducts.map(sp => (
              <Col xs={6} md={3} key={sp.id}>
                <div className="border p-2 rounded text-center">
                  <Link to={`/san-pham/${toSlug(sp.ten)}`}><img src={sp.anh} style={{width:'100%', height:'150px', objectFit:'cover'}} /></Link>
                  <div className="fw-bold mt-2">{sp.ten}</div>
                  <div className="text-danger">{sp.giaBan.toLocaleString()} ¥</div>
                </div>
              </Col>
            ))}
          </Row>
        </div>
      )}
    </Container>
  );
}
export default ProductDetail;