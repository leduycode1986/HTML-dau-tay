import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Col, Button, Badge, Form, Card, ProgressBar } from 'react-bootstrap';
import { doc, getDoc, collection, addDoc, query, where, getDocs, serverTimestamp, orderBy } from 'firebase/firestore';
import { db, auth } from './firebase';
import { toast } from 'react-toastify';
import { toSlug } from './App';

function ProductDetail({ dsSanPham, themVaoGio }) {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  
  useEffect(() => {
    const fetch = async () => {
      const found = dsSanPham.find(p => p.id === id);
      if (found) setProduct(found);
      else {
        const d = await getDoc(doc(db, "sanPham", id));
        if (d.exists()) setProduct({ id: d.id, ...d.data() });
      }
      const q = query(collection(db, "reviews"), where("productId", "==", id), orderBy("ngay", "desc"));
      const snap = await getDocs(q);
      setReviews(snap.docs.map(d => d.data()));
    };
    fetch(); window.scrollTo(0,0);
  }, [id, dsSanPham]);

  const postReview = async (e) => {
    e.preventDefault();
    if (!auth.currentUser) return toast.warning("Đăng nhập để đánh giá!");
    await addDoc(collection(db, "reviews"), { productId: id, userId: auth.currentUser.uid, userName: auth.currentUser.displayName, rating, comment, ngay: serverTimestamp() });
    setReviews([{ userName: auth.currentUser.displayName, rating, comment, ngay: {toDate:()=>new Date()} }, ...reviews]);
    setComment(''); toast.success("Đã gửi đánh giá!");
  };

  if (!product) return <div className="text-center py-5">Đang tải...</div>;
  const related = dsSanPham.filter(p => p.phanLoai === product.phanLoai && p.id !== id).slice(0, 4);

  return (
    <Container className="py-4">
      <Row className="product-detail-box mb-4">
        <Col md={5}><img src={product.anh} className="w-100 rounded" /></Col>
        <Col md={7}>
          <h2 className="fw-bold text-success">{product.ten}</h2>
          <div className="mb-3">
            <span className="h3 text-danger fw-bold me-2">{product.giaBan?.toLocaleString()} ¥</span>
            <span className="text-muted small">/ {product.donVi || 'Cái'}</span>
            {product.isFlashSale && <Badge bg="warning" className="ms-2">⚡ Flash Sale</Badge>}
          </div>
          <p><strong>Tình trạng:</strong> {product.soLuong > 0 ? <span className="text-success">Còn hàng ({product.soLuong})</span> : <span className="text-danger">Hết hàng</span>}</p>
          <div className="my-3 text-secondary" dangerouslySetInnerHTML={{__html: product.moTa}}></div>
          <div className="d-flex gap-2 mb-4">
            <div className="d-flex border rounded" style={{width: 120}}><Button variant="light" onClick={()=>setQuantity(q=>Math.max(1,q-1))}>-</Button><div className="flex-grow-1 text-center py-2 fw-bold">{quantity}</div><Button variant="light" onClick={()=>setQuantity(q=>Math.min(q+1,product.soLuong||99))}>+</Button></div>
            <Button variant="success" size="lg" className="px-5 rounded-pill shadow" onClick={()=>{for(let i=0;i<quantity;i++) themVaoGio(product)}}>THÊM VÀO GIỎ</Button>
          </div>
        </Col>
      </Row>

      <Row>
        <Col md={8}>
          <div className="product-detail-box mb-4">
            <h5 className="fw-bold border-bottom pb-2 mb-3">ĐÁNH GIÁ SẢN PHẨM ({reviews.length})</h5>
            <div className="review-list">
              {reviews.map((r, i) => (
                <div key={i} className="review-item">
                  <div className="d-flex">
                    <div className="review-avatar">{r.userName?.charAt(0)}</div>
                    <div>
                      <div className="review-name">{r.userName}</div>
                      <div className="text-warning small">{'⭐'.repeat(r.rating)}</div>
                      <div className="review-date">{r.ngay?.toDate ? r.ngay.toDate().toLocaleString() : 'Vừa xong'}</div>
                      <div className="review-content">{r.comment}</div>
                    </div>
                  </div>
                </div>
              ))}
              {reviews.length===0 && <p className="text-center text-muted">Chưa có đánh giá nào.</p>}
            </div>
            <Form onSubmit={postReview} className="mt-4 bg-light p-3 rounded">
              <h6>Viết đánh giá của bạn</h6>
              <div className="mb-2">{[1,2,3,4,5].map(s=><i key={s} onClick={()=>setRating(s)} className={`fa-star fs-4 me-1 cursor-pointer ${s<=rating?'fa-solid text-warning':'fa-regular text-secondary'}`}></i>)}</div>
              <Form.Control as="textarea" value={comment} onChange={e=>setComment(e.target.value)} placeholder="Nhập nội dung..." required className="mb-2"/>
              <Button type="submit" variant="success">Gửi đánh giá</Button>
            </Form>
          </div>
        </Col>
        <Col md={4}>
          <div className="product-detail-box">
            <h5 className="fw-bold mb-3">SẢN PHẨM CÙNG LOẠI</h5>
            {related.map(p => (
              <div key={p.id} className="d-flex align-items-center mb-3 pb-3 border-bottom">
                <Link to={`/san-pham/${toSlug(p.ten)}/${p.id}`}><img src={p.anh} width="60" className="rounded border me-2"/></Link>
                <div>
                  <Link to={`/san-pham/${toSlug(p.ten)}/${p.id}`} className="fw-bold text-dark d-block text-truncate" style={{maxWidth:180}}>{p.ten}</Link>
                  <span className="text-danger fw-bold small">{p.giaBan?.toLocaleString()} ¥</span>
                </div>
              </div>
            ))}
          </div>
        </Col>
      </Row>
    </Container>
  );
}
export default ProductDetail;