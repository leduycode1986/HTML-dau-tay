import React, { useState, useEffect } from 'react';
import { Table, Button, Form, Row, Col, Container, Alert, Modal } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { collection, onSnapshot, addDoc, serverTimestamp, updateDoc, doc, getDoc } from 'firebase/firestore'; 
import { db } from './firebase';
import { toast } from 'react-toastify';
import { toSlug } from './App';

function Cart({ gioHang, dsDanhMuc, handleDatHang: propsHandleDatHang, chinhSuaSoLuong, xoaSanPham, currentUser, userData }) {
  const [khach, setKhach] = useState({ ten: userData?.ten||'', sdt: userData?.sdt||'', diachi: userData?.diachi||'', ghiChu: '', quanHuyen: '' });
  const [dsShip, setDsShip] = useState([]);
  const [dsCoupon, setDsCoupon] = useState([]);
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [shippingFee, setShippingFee] = useState(0);
  const [openMenuId, setOpenMenuId] = useState(null);
  
  // States cho QR Code
  const [showQR, setShowQR] = useState(false);
  const [orderInfo, setOrderInfo] = useState(null);
  const [shopConfig, setShopConfig] = useState(null);

  useEffect(() => {
    const unsubShip = onSnapshot(collection(db, "shipping"), (sn) => setDsShip(sn.docs.map(d=>d.data())));
    const unsubCoupon = onSnapshot(collection(db, "coupons"), (sn) => setDsCoupon(sn.docs.map(d=>d.data())));
    const unsubConfig = onSnapshot(doc(db, "cauHinh", "thongTinChung"), (d) => { if(d.exists()) setShopConfig(d.data()); });
    return () => { unsubShip(); unsubCoupon(); unsubConfig(); }
  }, []);

  const tamTinh = gioHang.reduce((t, s) => t + (s.giaBan || s.giaGoc) * s.soLuong, 0);
  const handleSelectShip = (e) => { const kv = e.target.value; setKhach({...khach, quanHuyen: kv}); const found = dsShip.find(s => s.khuVuc === kv); setShippingFee(found ? parseInt(found.phi) : 0); };
  const applyCoupon = () => { const found = dsCoupon.find(c => c.code === couponInput.toUpperCase()); if(found) { setAppliedCoupon(found); toast.success("Đã áp dụng mã!"); } else toast.error("Mã sai!"); };
  const tongCong = tamTinh + shippingFee - (appliedCoupon ? parseInt(appliedCoupon.giamGia) : 0);

  const onDatHang = async () => {
    if (!khach.ten || !khach.sdt || !khach.diachi || !khach.quanHuyen) return toast.warning("Vui lòng điền đủ thông tin & chọn khu vực ship!");
    const maDonHang = 'MV-' + Math.floor(100000 + Math.random() * 900000);
    
    if (currentUser) {
      const diemCong = Math.floor(tongCong / (shopConfig?.tyLeDiem || 1000));
      await updateDoc(doc(db, "users", currentUser.uid), { diemTichLuy: (userData?.diemTichLuy||0) + diemCong });
    }

    await addDoc(collection(db, "donHang"), { maDonHang, khachHang: khach, gioHang, tongTien: tongCong, trangThai: 'Mới đặt', ngayDat: serverTimestamp(), userId: currentUser?.uid });
    
    // HIỆN POPUP QR CODE
    setOrderInfo({ ma: maDonHang, tien: tongCong });
    setShowQR(true);
    toast.success("Đặt hàng thành công!");
    
    // Clear giỏ hàng sau khi tắt modal hoặc xử lý xong (ở đây tạm gọi props clear luôn nhưng modal vẫn hiện)
    propsHandleDatHang(khach); 
  };

  const QR_LINK = shopConfig?.bankInfo ? `https://img.vietqr.io/image/${shopConfig.bankInfo.bankId}-${shopConfig.bankInfo.accountNum}-compact2.jpg?amount=${orderInfo?.tien}&addInfo=${orderInfo?.ma}&accountName=${shopConfig.bankInfo.accountName}` : '';

  if (gioHang.length === 0 && !showQR) return (<Container className="py-5 text-center"><div className="p-5 bg-white rounded-4 shadow-sm"><h3>Giỏ hàng trống!</h3><Link to="/"><Button variant="success">MUA NGAY</Button></Link></div></Container>);

  return (
    <Container fluid className="py-4">
      <Row>
        <Col lg={2} className="d-none d-lg-block"><div className="sidebar-main shadow-sm bg-white rounded overflow-hidden"><div className="bg-success text-white p-3 fw-bold text-center text-uppercase"><i className="fa-solid fa-bars me-2"></i> DANH MỤC</div><div className="category-list p-2">{dsDanhMuc.filter(d => !d.parent).map(parent => {const hasChild = dsDanhMuc.some(c => c.parent === parent.id);const isOpen = openMenuId === parent.id;return (<div key={parent.id} className="mb-1 border-bottom"><div className="d-flex align-items-center justify-content-between p-2 text-dark"><Link to={`/danh-muc/${toSlug(parent.ten)}/${parent.id}`} className="text-decoration-none text-dark flex-grow-1 d-flex align-items-center"><span className="me-2">{parent.icon || '📦'}</span> {parent.ten}</Link>{hasChild && <span onClick={(e) => { e.preventDefault(); setOpenMenuId(isOpen ? null : parent.id); }} style={{cursor: 'pointer', padding: '0 10px'}}>{isOpen ? '▲' : '▼'}</span>}</div>{hasChild && isOpen && <div className="ms-3 ps-2 border-start bg-light rounded">{dsDanhMuc.filter(c => c.parent === parent.id).map(child => (<Link key={child.id} to={`/danh-muc/${toSlug(child.ten)}/${child.id}`} className="d-block py-1 px-2 text-decoration-none text-secondary small hover-green">↳ {child.ten}</Link>))}</div>}</div>);})}</div></div></Col>
        
        <Col lg={6}>
          <div className="bg-white shadow-sm p-4 rounded-4 mb-3"><h5 className="fw-bold text-success mb-4 text-uppercase border-bottom pb-2">1. Sản phẩm</h5><Table hover responsive className="align-middle"><tbody>{gioHang.map(i => (<tr key={i.id}><td><img src={i.anh} width="60" style={{borderRadius:8}}/></td><td><div>{i.ten}</div><small>{i.giaBan?.toLocaleString()} ¥</small></td><td><div className="d-flex border rounded px-2"><Button variant="link" size="sm" onClick={()=>chinhSuaSoLuong(i.id,'giam')}>-</Button><span className="mx-2">{i.soLuong}</span><Button variant="link" size="sm" onClick={()=>chinhSuaSoLuong(i.id,'tang')}>+</Button></div></td><td className="text-danger fw-bold">{(i.giaBan*i.soLuong).toLocaleString()} ¥</td><td><Button variant="link" className="text-danger" onClick={()=>xoaSanPham(i.id)}>x</Button></td></tr>))}</tbody></Table></div>
          <div className="bg-white shadow-sm p-4 rounded-4"><h5 className="fw-bold text-success mb-4 text-uppercase border-bottom pb-2">2. Giao hàng</h5><Form.Control className="mb-3" placeholder="Họ tên *" value={khach.ten} onChange={e=>setKhach({...khach,ten:e.target.value})}/><Form.Control className="mb-3" placeholder="SĐT *" value={khach.sdt} onChange={e=>setKhach({...khach,sdt:e.target.value})}/><Form.Select className="mb-3" value={khach.quanHuyen} onChange={handleSelectShip}><option value="">-- Chọn Khu Vực --</option>{dsShip.map((s,i)=><option key={i} value={s.khuVuc}>{s.khuVuc} (+{parseInt(s.phi).toLocaleString()} ¥)</option>)}</Form.Select><Form.Control as="textarea" rows={2} placeholder="Địa chỉ..." value={khach.diachi} onChange={e=>setKhach({...khach,diachi:e.target.value})}/><Form.Control as="textarea" rows={2} placeholder="Ghi chú..." value={khach.ghiChu} onChange={e=>setKhach({...khach,ghiChu:e.target.value})}/></div>
        </Col>
        
        <Col lg={4}>
          <div className="cart-summary-box"><h5 className="fw-bold mb-4 border-bottom pb-3">THANH TOÁN</h5><div className="input-group mb-3"><Form.Control placeholder="Mã giảm giá" value={couponInput} onChange={e=>setCouponInput(e.target.value)}/><Button variant="outline-primary" onClick={applyCoupon}>Áp dụng</Button></div>{appliedCoupon && <div className="alert alert-success p-2 small">Đã dùng: {appliedCoupon.code}</div>}<div className="d-flex justify-content-between mb-2"><span>Tạm tính:</span><b>{tamTinh.toLocaleString()} ¥</b></div><div className="d-flex justify-content-between mb-2"><span>Ship:</span><b>+{shippingFee.toLocaleString()} ¥</b></div>{appliedCoupon && <div className="d-flex justify-content-between mb-2 text-success"><span>Giảm:</span><b>-{parseInt(appliedCoupon.giamGia).toLocaleString()} ¥</b></div>}<div className="d-flex justify-content-between h4 fw-bold text-danger pt-3 border-top"><span>TỔNG:</span><span>{tongCong.toLocaleString()} ¥</span></div><Button variant="success" size="lg" className="w-100 mt-3 fw-bold shadow" onClick={onDatHang}>ĐẶT HÀNG NGAY</Button></div>
        </Col>
      </Row>

      {/* MODAL VIETQR - HIỆN SAU KHI ĐẶT HÀNG */}
      <Modal show={showQR} onHide={()=>{setShowQR(false); window.location.href='/'}} centered backdrop="static">
        <Modal.Header closeButton><Modal.Title className="fw-bold text-success">🎉 ĐẶT HÀNG THÀNH CÔNG!</Modal.Title></Modal.Header>
        <Modal.Body className="text-center">
          <p>Mã đơn hàng: <strong className="text-primary fs-5">{orderInfo?.ma}</strong></p>
          <p>Vui lòng quét mã bên dưới để thanh toán:</p>
          {shopConfig?.bankInfo?.accountNum ? (
            <div className="border p-2 d-inline-block rounded shadow-sm bg-white">
              <img src={QR_LINK} alt="VietQR" style={{maxWidth: '100%', height: 'auto'}} />
            </div>
          ) : <Alert variant="warning">Chủ shop chưa cấu hình tài khoản ngân hàng.</Alert>}
          <p className="mt-3 small text-muted">Hệ thống sẽ tự động xác nhận khi nhận được tiền.</p>
        </Modal.Body>
        <Modal.Footer><Button variant="secondary" onClick={()=>{setShowQR(false); window.location.href='/'}}>Đóng & Về trang chủ</Button></Modal.Footer>
      </Modal>
    </Container>
  );
}
export default Cart;