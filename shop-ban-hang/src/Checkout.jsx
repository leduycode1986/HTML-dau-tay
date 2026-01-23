import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Card, Modal, Alert, InputGroup } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { collection, addDoc, serverTimestamp, updateDoc, doc, onSnapshot, getDocs, query, where } from 'firebase/firestore'; 
import { db, auth } from './firebase';
import { toast } from 'react-toastify';

function Checkout({ gioHang, setGioHang, userData }) {
  const navigate = useNavigate();
  const [khach, setKhach] = useState({ ten: userData?.ten || '', sdt: userData?.sdt || '', diachi: userData?.diachi || '', ghiChu: '', quanHuyen: '' });
  const [dsShip, setDsShip] = useState([]);
  const [shippingFee, setShippingFee] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('cod'); 
  const [showSuccess, setShowSuccess] = useState(false); 
  const [orderInfo, setOrderInfo] = useState(null); 
  const [shopConfig, setShopConfig] = useState(null);
  
  // Logic Coupon
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponMsg, setCouponMsg] = useState('');

  const tamTinh = gioHang.reduce((t, s) => t + (s.giaBan || s.giaGoc) * s.soLuong, 0);
  const tongCong = Math.max(0, tamTinh + shippingFee - discount);

  useEffect(() => {
    const unsubConfig = onSnapshot(doc(db, "cauHinh", "thongTinChung"), d => d.exists() && setShopConfig(d.data()));
    const unsubShip = onSnapshot(collection(db, "shipping"), sn => setDsShip(sn.docs.map(d=>d.data())));
    if (gioHang.length === 0) navigate('/cart');
    return () => { unsubConfig(); unsubShip(); }
  }, [gioHang, navigate]);

  const handleSelectShip = (e) => { 
    const kv = e.target.value; setKhach({...khach, quanHuyen: kv}); 
    const found = dsShip.find(s => s.khuVuc === kv); 
    setShippingFee(found ? parseInt(found.phi) : 0); 
  };

  const handleApplyCoupon = async () => {
    if(!couponCode) return;
    const q = query(collection(db, "coupons"), where("code", "==", couponCode.toUpperCase()));
    const sn = await getDocs(q);
    if(!sn.empty) {
      const data = sn.docs[0].data();
      setDiscount(parseInt(data.giamGia));
      setCouponMsg(`Đã giảm ${parseInt(data.giamGia).toLocaleString()}¥`);
      toast.success("Áp dụng mã thành công!");
    } else {
      setDiscount(0);
      setCouponMsg("Mã không hợp lệ!");
      toast.error("Mã không tồn tại!");
    }
  };

  const handleOrder = async () => {
    if (!khach.ten || !khach.sdt || !khach.diachi || !khach.quanHuyen) return toast.warning("Vui lòng nhập đủ thông tin!");
    const maDonHang = 'MV-' + Math.floor(100000 + Math.random() * 900000);
    await addDoc(collection(db, "donHang"), { maDonHang, khachHang: khach, gioHang, tongTien: tongCong, hinhThucThanhToan: paymentMethod, trangThai: 'Mới đặt', ngayDat: serverTimestamp(), userId: auth.currentUser?.uid || null, coupon: couponCode, giamGia: discount, ship: shippingFee });
    if (auth.currentUser && userData) {
      const diem = Math.floor(tongCong / (shopConfig?.tyLeDiem || 1000));
      await updateDoc(doc(db, "users", auth.currentUser.uid), { diemTichLuy: (userData.diemTichLuy||0) + diem });
    }
    setOrderInfo({ ma: maDonHang, tien: tongCong });
    setGioHang([]);
    setShowSuccess(true);
  };

  return (
    <Container className="py-5">
      <h2 className="text-center fw-bold text-success text-uppercase mb-4">Thanh Toán Đơn Hàng</h2>
      <Row>
        <Col md={7}>
          <div className="checkout-box">
            <h5 className="checkout-title"><i className="fa-solid fa-truck-fast me-2"></i> Thông tin giao hàng</h5>
            <Row className="g-3">
              <Col md={6}><Form.Control placeholder="Họ và tên" value={khach.ten} onChange={e=>setKhach({...khach,ten:e.target.value})}/></Col>
              <Col md={6}><Form.Control placeholder="Số điện thoại" value={khach.sdt} onChange={e=>setKhach({...khach,sdt:e.target.value})}/></Col>
              <Col md={12}><Form.Select value={khach.quanHuyen} onChange={handleSelectShip}><option value="">-- Chọn Quận/Huyện --</option>{dsShip.map((s,i)=><option key={i} value={s.khuVuc}>{s.khuVuc} ({parseInt(s.phi).toLocaleString()}¥)</option>)}</Form.Select></Col>
              <Col md={12}><Form.Control placeholder="Địa chỉ cụ thể (Số nhà, tên đường...)" value={khach.diachi} onChange={e=>setKhach({...khach,diachi:e.target.value})}/></Col>
              <Col md={12}><Form.Control as="textarea" rows={2} placeholder="Ghi chú cho shipper..." value={khach.ghiChu} onChange={e=>setKhach({...khach,ghiChu:e.target.value})}/></Col>
            </Row>
          </div>
        </Col>
        <Col md={5}>
          <div className="checkout-box">
            <h5 className="checkout-title"><i className="fa-solid fa-money-bill-wave me-2"></i> Phương thức thanh toán</h5>
            <div className="d-flex flex-column gap-2 mb-4">
              <div className={`payment-option ${paymentMethod==='cod' ? 'active' : ''}`} onClick={()=>setPaymentMethod('cod')}>
                <Form.Check type="radio" label="Thanh toán khi nhận hàng (COD)" checked={paymentMethod==='cod'} onChange={()=>{}} className="fw-bold pointer-events-none"/>
              </div>
              <div className={`payment-option ${paymentMethod==='qr' ? 'active' : ''}`} onClick={()=>setPaymentMethod('qr')}>
                <Form.Check type="radio" label="Chuyển khoản / Quét mã QR" checked={paymentMethod==='qr'} onChange={()=>{}} className="fw-bold pointer-events-none"/>
                {paymentMethod==='qr' && shopConfig?.bankInfo?.qrImage && (
                  <div className="mt-3 text-center border-top pt-2">
                    <img src={shopConfig.bankInfo.qrImage} style={{maxWidth:150}} className="border rounded shadow-sm"/>
                    <div className="small text-muted mt-1 fst-italic">Quét mã để thanh toán nhanh</div>
                  </div>
                )}
              </div>
            </div>

            {/* MÃ GIẢM GIÁ */}
            <InputGroup className="mb-3">
              <Form.Control placeholder="Nhập mã giảm giá (nếu có)" value={couponCode} onChange={e=>setCouponCode(e.target.value)} />
              <Button variant="outline-success" onClick={handleApplyCoupon}>Áp dụng</Button>
            </InputGroup>
            {couponMsg && <div className={`small mb-3 ${discount>0?'text-success':'text-danger'}`}>{couponMsg}</div>}

            <div className="border-top pt-3">
              <div className="d-flex justify-content-between mb-2"><span>Tạm tính:</span><b>{tamTinh.toLocaleString()} ¥</b></div>
              <div className="d-flex justify-content-between mb-2"><span>Phí ship:</span><b>{shippingFee ? `+${shippingFee.toLocaleString()} ¥` : '---'}</b></div>
              {discount > 0 && <div className="d-flex justify-content-between mb-2 text-success"><span>Giảm giá:</span><b>-{discount.toLocaleString()} ¥</b></div>}
              <div className="d-flex justify-content-between h4 text-danger fw-bold mt-3"><span>TỔNG CỘNG:</span><span>{tongCong.toLocaleString()} ¥</span></div>
              <Button variant="success" size="lg" className="w-100 mt-3 fw-bold shadow" onClick={handleOrder}>ĐẶT HÀNG NGAY</Button>
            </div>
          </div>
        </Col>
      </Row>

      <Modal show={showSuccess} onHide={()=>{}} centered backdrop="static" keyboard={false}>
        <Modal.Body className="text-center p-5">
          <div className="text-success display-1 mb-3"><i className="fa-regular fa-circle-check"></i></div>
          <h3 className="fw-bold text-success">ĐẶT HÀNG THÀNH CÔNG!</h3>
          <p>Mã đơn hàng: <strong className="text-danger fs-5">{orderInfo?.ma}</strong></p>
          <p className="text-muted">Cảm ơn bạn đã mua sắm tại cửa hàng.</p>
          <Link to="/"><Button variant="outline-success" className="rounded-pill px-4 mt-2">VỀ TRANG CHỦ</Button></Link>
        </Modal.Body>
      </Modal>
    </Container>
  );
}
export default Checkout;