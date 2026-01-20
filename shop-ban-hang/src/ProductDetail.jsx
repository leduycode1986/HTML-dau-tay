import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button, Badge, Container, Row, Col, Form } from 'react-bootstrap';
import Product from './Product';
import { db, auth } from './firebase';
import { addDoc, collection, query, where, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { toast } from 'react-toastify';
import { toSlug } from './App';

function ProductDetail({ dsSanPham, dsDanhMuc, themVaoGio }) {
  const { id } = useParams();
  const [openMenuId, setOpenMenuId] = useState(null);
  const sp = dsSanPham.find(p => p.id === id);
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const user = auth.currentUser;

  // --- LƯU LỊCH SỬ XEM (MỚI) ---
  useEffect(() => {
    if(id) {
      let recent = JSON.parse(localStorage.getItem('recent') || '[]');
      // Xóa ID cũ nếu trùng để đưa lên đầu
      recent = recent.filter(item => item !== id);
      recent.unshift(id);
      // Chỉ giữ lại 10 sản phẩm gần nhất
      if(recent.length > 10) recent.pop();
      localStorage.setItem('recent', JSON.stringify(recent));
    }
  }, [id]);
  // -----------------------------

  useEffect(() => {
    if(id) {
      const q = query(collection(db, "reviews"), where("productId", "==", id));
      const unsub = onSnapshot(q, (sn) => { const data = sn.docs.map(d => ({id: d.id, ...d.data()})); data.sort((a,b) => b.ngay - a.ngay); setReviews(data); });
      return () => unsub();
    }
  }, [id]);

  const submitReview = async () => {
    if(!user) return toast.error("Vui lòng đăng nhập!"); if(!comment.trim()) return toast.warning("Vui lòng nhập nội dung!");
    await addDoc(collection(db, "reviews"), { productId: id, userId: user.uid, userName: user.displayName || user.email, rating: rating, comment: comment, ngay: serverTimestamp() });
    setComment(''); toast.success("Cảm ơn bạn đã đánh giá!");
  };

  if (!sp) return <div className="p-5 text-center"><h5>Không tìm thấy sản phẩm</h5></div>;
  const relatedProducts = dsSanPham.filter(p => p.phanLoai === sp.phanLoai && p.id !== sp.id).slice(0, 4);
  const promoProducts = dsSanPham.filter(p => p.isKhuyenMai && p.id !== sp.id).slice(0, 5);

  return (
    <Container fluid className="py-3 py-md-4">
      <Row>
        <Col lg={2} className="d-none d-lg-block"><div className="sidebar-main shadow-sm bg-white rounded overflow-hidden"><div className="bg-success text-white p-3 fw-bold text-center text-uppercase"><i className="fa-solid fa-bars me-2"></i> DANH MỤC</div><div className="category-list p-2">{dsDanhMuc.filter(d => !d.parent).map(parent => {const hasChild = dsDanhMuc.some(c => c.parent === parent.id);const isOpen = openMenuId === parent.id;return (<div key={parent.id} className="mb-1 border-bottom"><div className="d-flex align-items-center justify-content-between p-2 text-dark"><Link to={`/danh-muc/${toSlug(parent.ten)}/${parent.id}`} className="text-decoration-none text-dark flex-grow-1 d-flex align-items-center"><span className="me-2">{parent.icon || '📦'}</span> {parent.ten}</Link>{hasChild && <span onClick={(e) => { e.preventDefault(); setOpenMenuId(isOpen ? null : parent.id); }} style={{cursor: 'pointer', padding: '0 10px'}}>{isOpen ? '▲' : '▼'}</span>}</div>{hasChild && isOpen && <div className="ms-3 ps-2 border-start bg-light rounded">{dsDanhMuc.filter(c => c.parent === parent.id).map(child => (<Link key={child.id} to={`/danh-muc/${toSlug(child.ten)}/${child.id}`} className="d-block py-1 px-2 text-decoration-none text-secondary small hover-green">↳ {child.ten}</Link>))}</div>}</div>);})}</div></div></Col>
        <Col xs={12} lg={7}><div className="bg-white rounded p-4 shadow-sm mb-4"><Row><Col md={5} className="mb-4 mb-md-0"><img src={sp.anh} alt={sp.ten} className="img-fluid rounded border w-100 shadow-sm" style={{objectFit: 'cover'}} /></Col><Col md={7}><h2 className="fw-bold text-success">{sp.ten}</h2><div className="mb-3">{sp.isMoi && <Badge bg="success" className="me-2">NEW</Badge>}{sp.isBanChay && <Badge bg="danger">HOT</Badge>}</div><div className="p-3 bg-light rounded border mb-3">{sp.phanTramGiam > 0 && <div className="price-original">Giá gốc: {sp.giaGoc?.toLocaleString()} ¥</div>}<div className="price-sale">{sp.giaBan?.toLocaleString()} ¥</div></div><Button variant="success" size="lg" className="w-100 fw-bold rounded-pill mb-4 shadow" onClick={() => themVaoGio(sp)}><i className="fa-solid fa-cart-plus me-2"></i> THÊM VÀO GIỎ NGAY</Button><div><h6 className="fw-bold text-dark border-bottom pb-2 mb-2">Thông tin chi tiết</h6><div className="border rounded p-3 bg-light" style={{ maxHeight: '300px', overflowY: 'auto', fontSize: '0.95rem' }} dangerouslySetInnerHTML={{ __html: sp.moTa || 'Đang cập nhật mô tả...' }}></div></div></Col></Row></div><div className="bg-white rounded p-4 shadow-sm mb-4"><h5 className="fw-bold text-uppercase border-bottom pb-2 mb-3">ĐÁNH GIÁ SẢN PHẨM ({reviews.length})</h5><div className="mb-4 p-3 bg-light rounded border"><h6>Viết đánh giá:</h6><div className="mb-2">{[1,2,3,4,5].map(s => (<span key={s} onClick={()=>setRating(s)} style={{cursor:'pointer', fontSize:'24px', color: s<=rating ? '#ffc107' : '#ccc'}}>★</span>))}</div><Form.Control as="textarea" rows={2} value={comment} onChange={e=>setComment(e.target.value)} className="mb-2"/><Button variant="primary" size="sm" onClick={submitReview}>Gửi đánh giá</Button></div>{reviews.map(r => (<div key={r.id} className="review-box"><div className="d-flex align-items-center mb-2"><div className="review-avatar me-2">{r.userName.charAt(0).toUpperCase()}</div><div><div className="fw-bold">{r.userName}</div><div className="star-rating" style={{fontSize:'14px'}}>{'★'.repeat(r.rating)}</div></div><div className="ms-auto small text-muted">{r.ngay ? r.ngay.toDate().toLocaleDateString() : ''}</div></div><p className="mb-0 text-secondary">{r.comment}</p></div>))}</div><div className="related-product-wrapper shadow-sm"><h5 className="fw-bold text-uppercase border-bottom pb-3 mb-3 text-primary"><i className="fa-solid fa-layer-group me-2"></i> Sản phẩm cùng loại</h5>{relatedProducts.length > 0 ? (<Row className="g-2 g-md-3">{relatedProducts.map(p => (<Col key={p.id} xs={6} md={3}><Product sp={p} themVaoGio={themVaoGio} /></Col>))}</Row>) : (<div className="text-center py-4 text-muted bg-light rounded">Hiện chưa có sản phẩm cùng loại nào khác.</div>)}</div></Col>
        <Col xs={12} lg={3} className="mt-4 mt-lg-0"><div className="bg-white rounded shadow-sm overflow-hidden"><div className="bg-warning p-3 fw-bold text-dark text-center border-bottom"><i className="fa-solid fa-bolt me-2"></i> SIÊU KHUYẾN MÃI</div><div className="p-3">{promoProducts.map(p => (<Link to={`/san-pham/${toSlug(p.ten)}/${p.id}`} key={p.id} className="d-flex align-items-center gap-3 mb-3 text-decoration-none border-bottom pb-2"><div style={{position: 'relative', width: '60px', height: '60px', flexShrink: 0}}><img src={p.anh} alt={p.ten} className="rounded border w-100 h-100" style={{objectFit:'cover'}} /><span className="position-absolute top-0 start-0 badge bg-danger" style={{fontSize:'0.6rem'}}>-{p.phanTramGiam}%</span></div><div style={{overflow: 'hidden'}}><div className="text-dark fw-bold text-truncate" style={{fontSize: '0.9rem'}}>{p.ten}</div><div className="price-sale small">{p.giaBan?.toLocaleString()} ¥</div></div></Link>))}<div className="text-center mt-2"><Link to="/" className="btn btn-outline-warning btn-sm w-100 fw-bold text-dark">Xem tất cả</Link></div></div></div></Col>
      </Row>
    </Container>
  );
}
export default ProductDetail;