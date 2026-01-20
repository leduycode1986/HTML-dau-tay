import React, { useState, useEffect } from 'react';
import { Table, Button, Form, Row, Col, Container, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { collection, onSnapshot, addDoc, serverTimestamp, updateDoc, doc } from 'firebase/firestore'; 
import { db } from './firebase';
import { toast } from 'react-toastify';
import { toSlug } from './App';

function Cart({ gioHang, dsDanhMuc, handleDatHang: propsHandleDatHang, chinhSuaSoLuong, xoaSanPham, currentUser, userData }) {
  const [khach, setKhach] = useState({ ten: userData?.ten||'', sdt: userData?.sdt||'', diachi: userData?.diachi||'', ghiChu: '', quanHuyen: '' });
  const [openMenuId, setOpenMenuId] = useState(null);
  const [dsShip, setDsShip] = useState([]);
  const [dsCoupon, setDsCoupon] = useState([]);
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [shippingFee, setShippingFee] = useState(0);

  useEffect(() => {
    const unsubShip = onSnapshot(collection(db, "shipping"), (sn) => setDsShip(sn.docs.map(d=>d.data())));
    const unsubCoupon = onSnapshot(collection(db, "coupons"), (sn) => setDsCoupon(sn.docs.map(d=>d.data())));
    return () => { unsubShip(); unsubCoupon(); }
  }, []);

  const tamTinh = gioHang.reduce((t, s) => t + (s.giaBan || s.giaGoc) * s.soLuong, 0);
  
  const applyCoupon = () => {
    const found = dsCoupon.find(c => c.code === couponInput.toUpperCase());
    if(found) { setAppliedCoupon(found); toast.success(`Áp dụng mã ${found.code} giảm ${parseInt(found.giamGia).toLocaleString()}đ`); } else { toast.error("Mã không tồn tại!"); }
  };

  // --- LOGIC CHỌN KHU VỰC SHIP ---
  const handleSelectShip = (e) => { 
    const kv = e.target.value; 
    setKhach({...khach, quanHuyen: kv}); 
    
    // Tìm phí ship tương ứng với khu vực
    const foundShip = dsShip.find(s => s.khuVuc === kv); 
    setShippingFee(foundShip ? parseInt(foundShip.phi) : 0); 
  };
  // ------------------------------

  const tongCong = tamTinh + shippingFee - (appliedCoupon ? parseInt(appliedCoupon.giamGia) : 0);

  // --- ĐẶT HÀNG ---
  const onDatHang = async () => {
    if (!khach.ten || !khach.sdt || !khach.diachi || !khach.quanHuyen) return toast.warning("Vui lòng điền đầy đủ thông tin và chọn khu vực giao hàng!");
    
    // Sinh mã đơn MV-XXXXXX
    const maDonHang = 'MV-' + Math.floor(100000 + Math.random() * 900000);

    if (currentUser && userData) {
      const tyLe = 1000; // Tỷ lệ điểm mặc định
      const diemCong = Math.floor(tongTien / tyLe);
      await updateDoc(doc(db, "users", currentUser.uid), { diemTichLuy: (userData.diemTichLuy || 0) + diemCong });
      toast.info(`Bạn được cộng ${diemCong} điểm tích lũy!`);
    }

    await addDoc(collection(db, "donHang"), { 
      maDonHang: maDonHang,
      khachHang: khach, 
      gioHang, 
      tongTien: tongCong, 
      trangThai: 'Mới đặt', 
      ngayDat: serverTimestamp(), 
      userId: currentUser ? currentUser.uid : null 
    });

    toast.success(`Đặt hàng thành công! Mã đơn: ${maDonHang}`);
    propsHandleDatHang(khach); 
  };

  if (gioHang.length === 0) return (<Container className="py-5 text-center"><div className="p-5 bg-white rounded-4 shadow-sm"><h1 className="display-1 text-muted mb-4">🛒</h1><h3 className="fw-bold text-dark mb-3">Giỏ hàng trống!</h3><Link to="/"><Button variant="success" size="lg" className="rounded-pill px-5">TIẾP TỤC MUA SẮM</Button></Link></div></Container>);

  return (
    <Container fluid className="py-4">
      <Row>
        <Col lg={2} className="d-none d-lg-block"><div className="sidebar-main shadow-sm bg-white rounded overflow-hidden"><div className="bg-success text-white p-3 fw-bold text-center text-uppercase"><i className="fa-solid fa-bars me-2"></i> DANH MỤC</div><div className="category-list p-2">{dsDanhMuc.filter(d => !d.parent).map(parent => {const hasChild = dsDanhMuc.some(c => c.parent === parent.id);const isOpen = openMenuId === parent.id;return (<div key={parent.id} className="mb-1 border-bottom"><div className="d-flex align-items-center justify-content-between p-2 text-dark"><Link to={`/danh-muc/${toSlug(parent.ten)}/${parent.id}`} className="text-decoration-none text-dark flex-grow-1 d-flex align-items-center"><span className="me-2">{parent.icon || '📦'}</span> {parent.ten}</Link>{hasChild && <span onClick={(e) => { e.preventDefault(); setOpenMenuId(isOpen ? null : parent.id); }} style={{cursor: 'pointer', padding: '0 10px'}}>{isOpen ? '▲' : '▼'}</span>}</div>{hasChild && isOpen && <div className="ms-3 ps-2 border-start bg-light rounded">{dsDanhMuc.filter(c => c.parent === parent.id).map(child => (<Link key={child.id} to={`/danh-muc/${toSlug(child.ten)}/${child.id}`} className="d-block py-1 px-2 text-decoration-none text-secondary small hover-green">↳ {child.ten}</Link>))}</div>}</div>);})}</div></div></Col>
        
        <Col lg={6}>
          <div className="bg-white shadow-sm p-4 rounded-4 mb-3"><h5 className="fw-bold text-success mb-4 text-uppercase border-bottom pb-2">1. Danh sách sản phẩm</h5><Table hover responsive className="align-middle"><tbody>{gioHang.map(i => (<tr key={i.id}><td><img src={i.anh} width="60" height="60" style={{objectFit:'cover', borderRadius:'8px'}} alt=""/></td><td><Link to={`/san-pham/${toSlug(i.ten)}/${i.id}`} className="fw-bold text-decoration-none text-dark">{i.ten}</Link><div className="small text-muted">{i.giaBan?.toLocaleString()} ¥</div></td><td><div className="d-flex align-items-center gap-2 border rounded-pill px-2" style={{width:'fit-content'}}><Button variant="link" size="sm" className="text-dark fw-bold text-decoration-none p-0" onClick={()=>chinhSuaSoLuong(i.id, 'giam')}>-</Button><span className="mx-1">{i.soLuong}</span><Button variant="link" size="sm" className="text-dark fw-bold text-decoration-none p-0" onClick={()=>chinhSuaSoLuong(i.id, 'tang')}>+</Button></div></td><td className="text-end fw-bold text-danger">{(i.giaBan * i.soLuong).toLocaleString()} ¥</td><td><Button variant="link" className="text-danger p-0" onClick={()=>xoaSanPham(i.id)}>🗑️</Button></td></tr>))}</tbody></Table></div>
          
          <div className="bg-white shadow-sm p-4 rounded-4">
            <h5 className="fw-bold text-success mb-4 text-uppercase border-bottom pb-2">2. Thông tin giao hàng</h5>
            {!currentUser && <Alert variant="warning" className="small"><i className="fa-solid fa-triangle-exclamation"></i> Bạn chưa đăng nhập. Hãy <Link to="/auth" className="fw-bold">đăng nhập</Link> để tích điểm nhé!</Alert>}
            <Form.Control className="mb-3 p-3 bg-light border-0" placeholder="Họ tên *" value={khach.ten} onChange={e => setKhach({...khach, ten: e.target.value})} />
            <Form.Control className="mb-3 p-3 bg-light border-0" placeholder="SĐT *" value={khach.sdt} onChange={e => setKhach({...khach, sdt: e.target.value})} />
            
            {/* --- SELECT KHU VỰC (MỚI) --- */}
            <Form.Select className="mb-3 p-3 bg-light border-0" value={khach.quanHuyen} onChange={handleSelectShip}>
               <option value="">-- Chọn Khu Vực Giao Hàng --</option>
               {dsShip.map((s, idx) => (
                 <option key={idx} value={s.khuVuc}>
                   {s.khuVuc} (Phí ship: {parseInt(s.phi).toLocaleString()} ¥)
                 </option>
               ))}
            </Form.Select>
            {/* --------------------------- */}
            
            <Form.Control as="textarea" rows={2} className="mb-3 p-3 bg-light border-0" placeholder="Địa chỉ chi tiết..." value={khach.diachi} onChange={e => setKhach({...khach, diachi: e.target.value})} />
            <Form.Control as="textarea" rows={2} className="mb-3 p-3 bg-light border-0" placeholder="Ghi chú..." value={khach.ghiChu} onChange={e => setKhach({...khach, ghiChu: e.target.value})} />
          </div>
        </Col>
        
        <Col lg={4}>
          <div className="cart-summary-box">
            <h5 className="fw-bold mb-4 border-bottom pb-3">TỔNG KẾT</h5>
            <div className="input-group mb-3"><Form.Control placeholder="Mã giảm giá" value={couponInput} onChange={e=>setCouponInput(e.target.value)} /><Button variant="outline-primary" onClick={applyCoupon}>Áp dụng</Button></div>{appliedCoupon && <div className="alert alert-success p-2 small mb-3">Đã dùng mã: <strong>{appliedCoupon.code}</strong> (-{parseInt(appliedCoupon.giamGia).toLocaleString()})</div>}
            <div className="d-flex justify-content-between mb-2"><span className="text-muted">Tạm tính:</span><span className="fw-bold">{tamTinh.toLocaleString()} ¥</span></div>
            <div className="d-flex justify-content-between mb-2"><span className="text-muted">Phí vận chuyển:</span><span className="text-dark fw-bold">+{shippingFee.toLocaleString()} ¥</span></div>
            {appliedCoupon && <div className="d-flex justify-content-between mb-2 text-success"><span className="text-muted">Giảm giá:</span><span>-{parseInt(appliedCoupon.giamGia).toLocaleString()} ¥</span></div>}
            <div className="d-flex justify-content-between h3 fw-bold text-danger pt-3 border-top mb-4"><span>TỔNG CỘNG:</span><span>{tongCong.toLocaleString()} ¥</span></div>
            <Button variant="success" size="lg" className="w-100 py-3 fw-bold rounded-pill shadow mb-3" onClick={onDatHang}>XÁC NHẬN ĐẶT HÀNG</Button>
            <Link to="/"><Button variant="outline-secondary" className="w-100 py-2 fw-bold rounded-pill">← MUA THÊM SP KHÁC</Button></Link>
          </div>
        </Col>
      </Row>
    </Container>
  );
}
export default Cart;