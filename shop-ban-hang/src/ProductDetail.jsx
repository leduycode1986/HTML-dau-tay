import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Col, Button, Badge, Form, Card } from 'react-bootstrap';
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
    const fetchProductAndReviews = async () => {
      const found = dsSanPham.find(p => p.id === id);
      if (found) setProduct(found);
      else {
        const docRef = doc(db, "sanPham", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) setProduct({ id: docSnap.id, ...docSnap.data() });
      }
      const q = query(collection(db, "reviews"), where("productId", "==", id), orderBy("ngay", "desc"));
      const querySnapshot = await getDocs(q);
      setReviews(querySnapshot.docs.map(d => d.data()));
    };
    fetchProductAndReviews();
    window.scrollTo(0,0);
  }, [id, dsSanPham]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return toast.warning("Vui lòng đăng nhập để đánh giá!");
    await addDoc(collection(db, "reviews"), { productId: id, userId: user.uid, userName: user.displayName || user.email, rating: parseInt(rating), comment: comment, ngay: serverTimestamp() });
    setReviews([{ userName: user.displayName||user.email, rating: parseInt(rating), comment, ngay: {toDate:()=>new Date()} }, ...reviews]);
    setComment(''); toast.success("Cảm ơn đánh giá của bạn!");
  };

  if (!product) return <div className="text-center py-5">Đang tải...</div>;
  const relatedProducts = dsSanPham.filter(p => p.phanLoai === product.phanLoai && p.id !== product.id).slice(0, 4);

  return (
    <Container className="py-5">
      <Row className="mb-5">
        <Col md={6} className="mb-4"><div className="border rounded p-3 bg-white shadow-sm"><img src={product.anh} className="w-100 object-fit-cover rounded" style={{maxHeight: 500}} alt={product.ten} /></div></Col>
        <Col md={6}>
          <h2 className="fw-bold text-success mb-2">{product.ten}</h2>
          
          {/* HIỂN THỊ ĐƠN VỊ VÀ TỒN KHO */}
          <div className="mb-3 text-muted small">
            <span className="me-3"><i className="fa-solid fa-scale-balanced"></i> Đơn vị: <strong>{product.donVi || 'Cái'}</strong></span>
            <span><i className="fa-solid fa-cubes"></i> Tồn kho: <strong>{product.soLuong || 0}</strong></span>
          </div>

          <div className="mb-3">
            <span className="h3 text-danger fw-bold me-3">{product.giaBan?.toLocaleString()} ¥</span>
            {product.phanTramGiam > 0 && <span className="text-muted text-decoration-line-through fs-5">{product.giaGoc?.toLocaleString()} ¥</span>}
            {product.isFlashSale && <Badge bg="warning" text="dark" className="ms-3">⚡ FLASH SALE</Badge>}
          </div>
          <div className="mb-4 text-muted" dangerouslySetInnerHTML={{__html: product.moTa}}></div>
          
          <div className="d-flex align-items-center gap-3 mb-4">
            <div className="d-flex border rounded" style={{width: 120}}>
              <Button variant="light" onClick={()=>setQuantity(q=>Math.max(1, q-1))}>-</Button>
              <div className="flex-grow-1 text-center py-2 fw-bold bg-white">{quantity}</div>
              <Button variant="light" onClick={()=>setQuantity(q=>Math.min(q+1, product.soLuong || 999))}>+</Button>
            </div>
            <Button variant="success" size="lg" className="flex-grow-1 fw-bold rounded-pill shadow" onClick={()=>{ for(let i=0;i<quantity;i++) themVaoGio(product); }}>THÊM VÀO GIỎ HÀNG</Button>
          </div>
        </Col>
      </Row>
      <Row className="mb-5"><Col md={8}><div className="bg-white p-4 rounded shadow-sm"><h4 className="fw-bold border-bottom pb-2 mb-4">Đánh giá sản phẩm ({reviews.length})</h4><Form onSubmit={handleSubmitReview} className="mb-4 p-3 bg-light rounded border"><h6 className="fw-bold mb-2">Viết đánh giá của bạn</h6><div className="mb-2">{[1,2,3,4,5].map(s => (<i key={s} className={`fa-solid fa-star fs-4 me-1 cursor-pointer ${s <= rating ? 'text-warning' : 'text-secondary'}`} onClick={()=>setRating(s)}></i>))}</div><Form.Control as="textarea" rows={2} placeholder="Nội dung đánh giá..." value={comment} onChange={e=>setComment(e.target.value)} required className="mb-2" /><Button type="submit" variant="primary" size="sm">Gửi đánh giá</Button></Form><div className="review-list">{reviews.length === 0 && <p className="text-muted text-center">Chưa có đánh giá nào.</p>}{reviews.map((r, idx) => (<div key={idx} className="border-bottom pb-3 mb-3"><div className="d-flex justify-content-between"><strong>{r.userName}</strong><span className="text-muted small">{r.ngay?.toDate ? r.ngay.toDate().toLocaleDateString() : 'Vừa xong'}</span></div><div className="text-warning small mb-1">{'⭐'.repeat(r.rating)}</div><p className="mb-0 text-secondary">{r.comment}</p></div>))}</div></div></Col></Row>
    </Container>
  );
}
export default ProductDetail;