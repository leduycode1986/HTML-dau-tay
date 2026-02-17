// ... Import cũ giữ nguyên
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button, Badge, Form } from 'react-bootstrap';
import { toSlug } from './utils';
import { collection, addDoc, onSnapshot, query, where, serverTimestamp, getDocs, limit } from 'firebase/firestore'; 
import { db, auth } from './firebase'; 
import SEO from './SEO'; // [MỚI] Import SEO

function ProductDetail({ themVaoGio, toggleWishlist, toggleCompare, wishlist }) {
  // ... (Phần logic state, useEffect fetch data giữ nguyên như cũ) ...
  const { slug } = useParams();
  const navigate = useNavigate();
  const [sanPham, setSanPham] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ name: '', rating: 5, comment: '' });
  const [relatedProducts, setRelatedProducts] = useState([]); 

  useEffect(() => {
    const user = auth.currentUser;
    if (user) { const autoName = user.displayName || user.email?.split('@')[0] || ''; if (autoName) { setNewReview(prev => ({ ...prev, name: autoName })); } }
  }, []);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const productRef = collection(db, "sanPham");
        let q = query(productRef, where("slug", "==", slug));
        let snapshot = await getDocs(q);
        if (snapshot.empty) {
           const allDocs = await getDocs(productRef); 
           const found = allDocs.docs.find(d => d.id === slug || toSlug(d.data().ten) === slug);
           if (found) { setSanPham({ id: found.id, ...found.data() }); } else { setSanPham(null); }
        } else { const d = snapshot.docs[0]; setSanPham({ id: d.id, ...d.data() }); }
      } catch (err) { console.error(err); }
      setLoading(false);
    };
    fetchProduct();
  }, [slug]);

  useEffect(() => {
    if (sanPham) {
      const recent = JSON.parse(localStorage.getItem('recent') || '[]');
      const newRecent = [sanPham.id, ...recent.filter(id => id !== sanPham.id)].slice(0, 10);
      localStorage.setItem('recent', JSON.stringify(newRecent));
      const qReview = query(collection(db, "reviews"), where("productId", "==", sanPham.id));
      const unsubReview = onSnapshot(qReview, sn => setReviews(sn.docs.map(d=>d.data())));
      const fetchRelated = async () => { try { const qRelated = query(collection(db, "sanPham"), where("phanLoai", "==", sanPham.phanLoai), limit(5)); const sn = await getDocs(qRelated); setRelatedProducts(sn.docs.map(d=>({id:d.id, ...d.data()})).filter(p => p.id !== sanPham.id)); } catch (e) { console.log(e) } }
      fetchRelated();
      return () => unsubReview();
    }
  }, [sanPham]);

  const submitReview = async () => { if(!newReview.name || !newReview.comment) return alert("Vui lòng nhập tên và nội dung!"); await addDoc(collection(db, "reviews"), { ...newReview, productId: sanPham.id, ngay: serverTimestamp() }); setNewReview(prev => ({ ...prev, rating: 5, comment: '' })); alert("Cảm ơn đánh giá của bạn!"); };
  const handleBuyNow = () => { themVaoGio(sanPham); navigate('/checkout'); };

  if (loading) return <Container className="py-5 text-center"><div className="spinner-border text-success"></div></Container>;
  if (!sanPham) return <Container className="py-5 text-center"><h3>🚫 Không tìm thấy sản phẩm</h3><Link to="/" className="btn btn-success mt-3">Về trang chủ</Link></Container>;

  const isLiked = wishlist && wishlist.some(i => i.id === sanPham.id);

  return (
    <Container className="py-5">
      {/* [MỚI] THÊM SEO */}
      <SEO title={sanPham.ten} description={sanPham.moTa?.substring(0, 150)} image={sanPham.anh} />

      <Link to="/" className="btn-back-home mb-4"><i className="fa-solid fa-chevron-left"></i> Quay lại</Link>
      <Row className="g-5">
        <Col lg={5}><div className="detail-img-box"><img src={sanPham.anh} alt={sanPham.ten} /></div></Col>
        <Col lg={7}>
          <h1 className="detail-title">{sanPham.ten}</h1>
          <div className="mb-3 pb-2 border-bottom">
             <div className="detail-price">{parseInt(sanPham.giaBan).toLocaleString()} ¥ {sanPham.phanTramGiam > 0 && <span className="text-muted fs-5 text-decoration-line-through fw-normal ms-2">{parseInt(sanPham.giaGoc).toLocaleString()} ¥</span>}</div>
          </div>

          <div className="d-flex gap-3 mb-4">
             {/* [MỚI] CÁC NÚT CHỨC NĂNG PHỤ */}
             <Button variant="outline-danger" onClick={()=>toggleWishlist && toggleWishlist(sanPham)}>
                <i className={`fa-${isLiked ? 'solid' : 'regular'} fa-heart me-2`}></i> {isLiked ? 'Đã thích' : 'Yêu thích'}
             </Button>
             <Button variant="outline-primary" onClick={()=>toggleCompare && toggleCompare(sanPham)}>
                <i className="fa-solid fa-scale-balanced me-2"></i> So sánh
             </Button>
          </div>

          {/* ... (Các phần Tình trạng, Số lượng, Nút Mua giữ nguyên) ... */}
          <div className="d-flex flex-column gap-2 mb-4">
             <div className="d-flex align-items-center gap-2"><span className="fw-bold text-dark" style={{minWidth:'80px'}}>Tình trạng:</span><Badge bg={sanPham.soLuong > 0 ? "success" : "secondary"} className="px-3 py-1">{sanPham.soLuong > 0 ? "Còn hàng" : "Tạm hết hàng"}</Badge></div>
             <div className="d-flex align-items-center gap-2"><span className="fw-bold text-dark" style={{minWidth:'80px'}}>Số lượng:</span><span className="text-danger fw-bold fs-5">{sanPham.soLuong}</span><span className="tag-donvi" style={{margin:0}}>{sanPham.donVi}</span></div>
          </div>
          <div className="d-flex gap-2 mb-4">
            <Button className="btn-add-cart-lg" onClick={() => sanPham.soLuong > 0 && themVaoGio(sanPham)} disabled={sanPham.soLuong <= 0}><i className="fa-solid fa-cart-plus me-2"></i> THÊM VÀO GIỎ</Button>
            <Button variant="danger" className="rounded-pill px-4 fw-bold" onClick={handleBuyNow} disabled={sanPham.soLuong <= 0}>MUA NGAY</Button>
          </div>
          <div className="detail-desc-box"><div dangerouslySetInnerHTML={{__html: sanPham.moTa}}></div></div>
        </Col>
      </Row>

      {/* ... (Phần Đánh giá & Sản phẩm liên quan giữ nguyên) ... */}
      <div className="mt-5 bg-white p-4 rounded shadow-sm">
        <h4 className="border-bottom pb-2 mb-4">Đánh giá sản phẩm ({reviews.length})</h4>
        <Row>
          <Col md={6} className="mb-3">
            {reviews.length === 0 && <p className="text-muted fst-italic">Chưa có đánh giá nào.</p>}
            <div style={{maxHeight:'300px', overflowY:'auto'}}>
                {reviews.map((r, i) => (<div key={i} className="mb-3 border-bottom pb-2"><div className="fw-bold">{r.name} <span className="text-warning">{'⭐'.repeat(r.rating)}</span></div><div className="text-muted small">{r.comment}</div></div>))}
            </div>
          </Col>
          <Col md={6} className="bg-light p-3 rounded">
            <h6>Viết đánh giá của bạn</h6>
            <Form.Control className={`mb-2 ${newReview.name && auth.currentUser ? 'bg-white fw-bold text-success' : ''}`} placeholder="Tên của bạn" value={newReview.name} onChange={e=>setNewReview({...newReview, name:e.target.value})} />
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
      {relatedProducts.length > 0 && (<div className="mt-5"><h4 className="fw-bold text-success mb-3">Sản phẩm liên quan</h4><Row className="g-3">{relatedProducts.map(sp => (<Col xs={6} md={3} key={sp.id}><div className="border p-2 rounded text-center h-100 bg-white shadow-sm"><Link to={`/san-pham/${sp.slug || toSlug(sp.ten)}`}><img src={sp.anh} style={{width:'100%', height:'150px', objectFit:'cover', borderRadius:'8px'}} /></Link><div className="fw-bold mt-2 text-truncate">{sp.ten}</div><div className="text-danger fw-bold">{parseInt(sp.giaBan).toLocaleString()} ¥</div></div></Col>))}</Row></div>)}
    </Container>
  );
}
export default ProductDetail;