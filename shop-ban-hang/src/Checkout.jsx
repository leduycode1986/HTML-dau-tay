import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Modal, InputGroup, Alert } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { collection, addDoc, serverTimestamp, updateDoc, doc, onSnapshot, getDocs, getDoc, query, where, increment } from 'firebase/firestore'; 
import { db, auth } from './firebase';
import { toast } from 'react-toastify';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js"; 

function Checkout({ gioHang, setGioHang, userData }) {
  const navigate = useNavigate();
  
  // State thông tin khách hàng
  const [khach, setKhach] = useState({ ten: '', sdt: '', diachi: '', ghiChu: '', quanHuyen: '' });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (userData) {
      setKhach(prev => ({
        ...prev,
        ten: userData.ten || '',
        sdt: userData.sdt || '',
        diachi: userData.diachi || ''
      }));
    }
  }, [userData]);

  const [dsShip, setDsShip] = useState([]);
  const [shippingFee, setShippingFee] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('cod'); 
  const [showSuccess, setShowSuccess] = useState(false); 
  const [orderInfo, setOrderInfo] = useState(null); 
  const [shopConfig, setShopConfig] = useState(null);
  
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponMsg, setCouponMsg] = useState('');

  const tamTinh = gioHang.reduce((t, s) => t + (s.giaBan || s.giaGoc) * s.soLuong, 0);
  const tongCong = Math.max(0, tamTinh + shippingFee - discount);
  const tyLeDiem = shopConfig?.tyLeDiem || 1000; 
  const potentialPoints = Math.floor(tongCong / tyLeDiem);

  useEffect(() => {
    const unsubConfig = onSnapshot(doc(db, "cauHinh", "thongTinChung"), d => d.exists() && setShopConfig(d.data()));
    const unsubShip = onSnapshot(collection(db, "shipping"), sn => setDsShip(sn.docs.map(d=>d.data())));
    
    if (gioHang.length === 0 && !showSuccess) {
        navigate('/cart');
    }
    return () => { unsubConfig(); unsubShip(); }
  }, [gioHang, navigate, showSuccess]);

  const handleSelectShip = (e) => { 
    const kv = e.target.value; 
    setKhach({...khach, quanHuyen: kv}); 
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

  const validateForm = () => {
    let newErrors = {};
    if (!khach.ten.trim()) newErrors.ten = "Vui lòng nhập họ tên";
    const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
    if (!khach.sdt) newErrors.sdt = "Vui lòng nhập số điện thoại";
    else if (!phoneRegex.test(khach.sdt)) newErrors.sdt = "Số điện thoại không hợp lệ";
    if (!khach.quanHuyen) newErrors.quanHuyen = "Vui lòng chọn khu vực";
    if (!khach.diachi.trim()) newErrors.diachi = "Vui lòng nhập địa chỉ";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const processOrder = async (isPaid = false) => {
    if (!validateForm()) {
        toast.warning("Vui lòng kiểm tra lại thông tin giao hàng!");
        return false;
    }
    
    const maDonHang = 'MV-' + Math.floor(100000 + Math.random() * 900000);
    
    try {
      for (const item of gioHang) {
        const productRef = doc(db, "sanPham", item.id);
        const productSnap = await getDoc(productRef);
        
        if (productSnap.exists()) {
          const currentStock = productSnap.data().soLuong;
          if (currentStock < item.soLuong) {
            toast.error(`Món "${item.ten}" chỉ còn ${currentStock}. Vui lòng chỉnh lại giỏ hàng.`);
            return false;
          }
        } else {
          toast.error(`Sản phẩm "${item.ten}" không còn tồn tại!`);
          return false;
        }
      }

      await addDoc(collection(db, "donHang"), { 
        maDonHang, 
        khachHang: khach, 
        gioHang, 
        tongTien: tongCong, 
        hinhThucThanhToan: isPaid ? 'PayPal' : paymentMethod,
        trangThai: isPaid ? 'Đã thanh toán' : 'Mới đặt',
        ngayDat: serverTimestamp(), 
        userId: auth.currentUser?.uid || null, 
        coupon: couponCode, 
        giamGia: discount, 
        ship: shippingFee 
      });

      const updatePromises = gioHang.map(item => {
        const productRef = doc(db, "sanPham", item.id);
        return updateDoc(productRef, { soLuong: increment(-parseInt(item.soLuong)) });
      });
      await Promise.all(updatePromises);

      if (auth.currentUser && userData) {
        await updateDoc(doc(db, "users", auth.currentUser.uid), { 
          diemTichLuy: (userData.diemTichLuy || 0) + potentialPoints 
        });
      }

      setOrderInfo({ ma: maDonHang, tien: tongCong });
      setGioHang([]); 
      setShowSuccess(true);
      toast.success("🎉 Đặt hàng thành công!");
      return true;
      
    } catch (error) {
      console.error(error);
      toast.error("Lỗi đặt hàng: " + error.message);
      return false;
    }
  };

  return (
    <div style={{background: '#f4f6f9', minHeight: '100vh', padding: '40px 0'}}>
      <Container>
        <div className="text-center mb-5">
           <h2 className="fw-bold text-uppercase" style={{color:'#198754', fontFamily:'Montserrat'}}>Thanh Toán Đơn Hàng</h2>
           <p className="text-muted">Vui lòng kiểm tra kỹ thông tin trước khi đặt hàng</p>
        </div>

        {!userData && potentialPoints > 0 && (
          <div className="register-incentive-card">
            <div className="d-flex align-items-center gap-3">
              <div style={{fontSize:'2rem'}}><i className="fa-solid fa-gift text-warning"></i></div>
              <div>
                <div className="fw-bold text-dark">Bạn ơi khoan đã!</div>
                <div className="incentive-text">Đơn hàng này tích được <span className="incentive-points">+{potentialPoints} điểm</span>. <br/>Đăng ký thành viên ngay để đổi quà nhé!</div>
              </div>
            </div>
            <Link to="/auth" state={{ from: '/checkout' }} className="btn-register-now"><i className="fa-solid fa-user-plus me-1"></i> Đăng ký / Đăng nhập</Link>
          </div>
        )}

        {/* --- HÀNG TRÊN: THÔNG TIN + DANH SÁCH MÓN --- */}
        <Row className="g-4 mb-4">
          <Col lg={7}>
            <div className="checkout-card h-100">
              <div className="checkout-card-header"><h5 className="checkout-title"><i className="fa-solid fa-address-card"></i> Thông tin giao hàng</h5></div>
              <div className="checkout-body">
                <Row className="g-3">
                  <Col md={6}>
                    <Form.Group>
                        <Form.Label className="form-label-custom">Họ và tên <span className="required">*</span></Form.Label>
                        <InputGroup className="input-custom-group"><InputGroup.Text><i className="fa-regular fa-user"></i></InputGroup.Text><Form.Control className="form-control-lg-custom" placeholder="Nhập họ tên" value={khach.ten} onChange={e=>{setKhach({...khach,ten:e.target.value});if(errors.ten) setErrors({...errors, ten: null});}} isInvalid={!!errors.ten}/><Form.Control.Feedback type="invalid">{errors.ten}</Form.Control.Feedback></InputGroup>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                        <Form.Label className="form-label-custom">Số điện thoại <span className="required">*</span></Form.Label>
                        <InputGroup className="input-custom-group"><InputGroup.Text><i className="fa-solid fa-phone"></i></InputGroup.Text><Form.Control className="form-control-lg-custom" placeholder="Nhập số điện thoại" value={khach.sdt} onChange={e=>{setKhach({...khach,sdt:e.target.value});if(errors.sdt) setErrors({...errors, sdt: null});}} isInvalid={!!errors.sdt}/><Form.Control.Feedback type="invalid">{errors.sdt}</Form.Control.Feedback></InputGroup>
                    </Form.Group>
                  </Col>
                  <Col md={12}>
                    <Form.Group>
                        <Form.Label className="form-label-custom">Khu vực giao hàng <span className="required">*</span></Form.Label>
                        <Form.Select className="form-control-lg-custom" value={khach.quanHuyen} onChange={(e) => {handleSelectShip(e);if(errors.quanHuyen) setErrors({...errors, quanHuyen: null});}} isInvalid={!!errors.quanHuyen}><option value="">-- Chọn Quận/Huyện --</option>{dsShip.map((s,i) => (<option key={i} value={s.khuVuc}>{s.khuVuc} (Phí ship: {parseInt(s.phi).toLocaleString()}¥)</option>))}</Form.Select><Form.Control.Feedback type="invalid">{errors.quanHuyen}</Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={12}>
                    <Form.Group>
                        <Form.Label className="form-label-custom">Địa chỉ nhận hàng <span className="required">*</span></Form.Label>
                        <InputGroup className="input-custom-group"><InputGroup.Text><i className="fa-solid fa-location-dot"></i></InputGroup.Text><Form.Control className="form-control-lg-custom" placeholder="Số nhà, tên đường, phường/xã..." value={khach.diachi} onChange={e=>{setKhach({...khach,diachi:e.target.value});if(errors.diachi) setErrors({...errors, diachi: null});}} isInvalid={!!errors.diachi}/><Form.Control.Feedback type="invalid">{errors.diachi}</Form.Control.Feedback></InputGroup>
                    </Form.Group>
                  </Col>
                  <Col md={12}>
                    <Form.Label className="form-label-custom">Ghi chú đơn hàng (Tùy chọn)</Form.Label>
                    <Form.Control as="textarea" rows={3} className="form-control-lg-custom" placeholder="Ví dụ: Giao giờ hành chính..." value={khach.ghiChu} onChange={e=>setKhach({...khach,ghiChu:e.target.value})}/>
                  </Col>
                </Row>
              </div>
            </div>
          </Col>

          {/* CỘT PHẢI: CHỈ ĐỂ DANH SÁCH MÓN ĂN */}
          <Col lg={5}>
            <div className="checkout-card h-100">
              <div className="checkout-card-header"><h5 className="checkout-title"><i className="fa-solid fa-bag-shopping"></i> Đơn hàng ({gioHang.length} món)</h5></div>
              <div className="checkout-body" style={{maxHeight:'400px', overflowY:'auto'}}>
                {gioHang.map((sp, idx) => (
                  <div key={idx} className="mini-product-item">
                    <img src={sp.anh} alt={sp.ten} className="mini-product-img" />
                    <div className="flex-grow-1"><div className="fw-bold text-dark" style={{fontSize:'14px'}}>{sp.ten}</div><div className="small text-muted">x{sp.soLuong}</div></div>
                    <div className="fw-bold text-danger">{((sp.giaBan || sp.giaGoc) * sp.soLuong).toLocaleString()}¥</div>
                  </div>
                ))}
              </div>
            </div>
          </Col>
        </Row>

        {/* --- HÀNG DƯỚI: THANH TOÁN (FULL WIDTH) --- */}
        <div className="checkout-card border-top-4 border-success">
          <div className="checkout-card-header bg-white">
            <h5 className="checkout-title fs-4"><i className="fa-solid fa-wallet text-success"></i> THANH TOÁN & ĐẶT HÀNG</h5>
          </div>
          
          <div className="checkout-body">
            <Row>
              {/* --- CỘT TRÁI CỦA THANH TOÁN: CHỌN PHƯƠNG THỨC --- */}
              <Col md={5} className="border-end pe-md-4">
                <h6 className="fw-bold text-muted small mb-3 text-uppercase ls-1">1. Chọn phương thức thanh toán</h6>
                <div className="d-flex flex-column gap-2">
                  <div className={`payment-method-item d-flex align-items-center p-3 border rounded ${paymentMethod==='cod' ? 'active border-success bg-light' : ''}`} style={{cursor:'pointer', transition:'0.2s'}} onClick={()=>setPaymentMethod('cod')}>
                    <img src="https://cdn-icons-png.flaticon.com/512/2331/2331941.png" width="35" className="me-3" alt="COD"/>
                    <div className="flex-grow-1"><div className="fw-bold">Tiền mặt (COD)</div><small className="text-muted">Thanh toán khi nhận hàng</small></div>
                    {paymentMethod==='cod' && <i className="fa-solid fa-circle-check text-success fs-5"></i>}
                  </div>

                  <div className={`payment-method-item d-flex align-items-center p-3 border rounded ${paymentMethod==='qr' ? 'active border-success bg-light' : ''}`} style={{cursor:'pointer', transition:'0.2s'}} onClick={()=>setPaymentMethod('qr')}>
                    <img src="https://cdn-icons-png.flaticon.com/512/161/161110.png" width="35" className="me-3" alt="QR"/>
                    <div className="flex-grow-1"><div className="fw-bold">Chuyển khoản / QR</div><small className="text-muted">Chuyển qua App ngân hàng</small></div>
                    {paymentMethod==='qr' && <i className="fa-solid fa-circle-check text-success fs-5"></i>}
                  </div>

                  <div className={`payment-method-item d-flex align-items-center p-3 border rounded ${paymentMethod==='paypal' ? 'active border-success bg-light' : ''}`} style={{cursor:'pointer', transition:'0.2s'}} onClick={()=>setPaymentMethod('paypal')}>
                    <img src="https://cdn-icons-png.flaticon.com/512/174/174861.png" width="35" className="me-3" alt="PayPal"/>
                    <div className="flex-grow-1"><div className="fw-bold">PayPal / Thẻ Quốc Tế</div><small className="text-muted">Visa, MasterCard, JCB</small></div>
                    {paymentMethod==='paypal' && <i className="fa-solid fa-circle-check text-success fs-5"></i>}
                  </div>
                </div>
              </Col>

              {/* --- CỘT PHẢI CỦA THANH TOÁN: XỬ LÝ & NÚT MUA --- */}
              <Col md={7} className="ps-md-4 pt-4 pt-md-0 d-flex flex-column justify-content-between">
                <div>
                    <h6 className="fw-bold text-muted small mb-3 text-uppercase ls-1">2. Mã ưu đãi & Chi tiết</h6>
                    {/* Hiển thị QR Code nếu chọn */}
                    {paymentMethod==='qr' && shopConfig?.bankInfo?.qrImage && (
                    <div className="d-flex align-items-center gap-3 p-3 mb-3 bg-light rounded border animate__animated animate__fadeIn">
                        <img src={shopConfig.bankInfo.qrImage} style={{maxWidth:'100px'}} className="rounded shadow-sm"/>
                        <div><div className="fw-bold text-success">Quét mã để thanh toán</div><div className="small text-muted">{shopConfig.bankInfo.bankName} - {shopConfig.bankInfo.accountNum}</div></div>
                    </div>
                    )}

                    {/* Mã giảm giá */}
                    <InputGroup className="mb-3">
                        <Form.Control placeholder="Nhập mã giảm giá (nếu có)..." value={couponCode} onChange={e=>setCouponCode(e.target.value)} className="form-control-custom"/>
                        <Button variant="outline-success" onClick={handleApplyCoupon}>Áp dụng</Button>
                    </InputGroup>
                    {couponMsg && <div className={`small mb-3 ${discount>0?'text-success fw-bold':'text-danger'}`}>{couponMsg}</div>}

                    {/* Tổng tiền */}
                    <div className="bg-light border rounded p-3 mb-4">
                        <div className="d-flex justify-content-between mb-2"><span className="text-muted">Tạm tính:</span><span className="fw-bold">{tamTinh.toLocaleString()} ¥</span></div>
                        <div className="d-flex justify-content-between mb-2"><span className="text-muted">Phí vận chuyển:</span><span>{shippingFee > 0 ? `+${shippingFee.toLocaleString()} ¥` : '---'}</span></div>
                        {discount > 0 && (<div className="d-flex justify-content-between mb-2 text-success"><span>Giảm giá:</span><span>-{discount.toLocaleString()} ¥</span></div>)}
                        <div className="d-flex justify-content-between border-top pt-2 mt-2 align-items-center"><span className="fw-bold text-dark fs-5">TỔNG CỘNG:</span><span className="text-danger fw-bold fs-3">{tongCong.toLocaleString()} <small>¥</small></span></div>
                    </div>
                </div>

                {/* Nút Hành động */}
                <div style={{zIndex:0}}>
                    {paymentMethod === 'paypal' ? (
                    shopConfig?.paypalClientId ? (
                        <PayPalScriptProvider options={{ "client-id": shopConfig.paypalClientId, currency: "JPY" }}>
                            <PayPalButtons 
                                style={{ layout: "horizontal", height: 50, tagline: false }} 
                                createOrder={(data, actions) => {
                                    if (!validateForm()) { toast.warning("Vui lòng điền đủ thông tin giao hàng trước!"); return Promise.reject("Form invalid"); }
                                    return actions.order.create({ purchase_units: [{ amount: { value: tongCong } }] });
                                }}
                                onApprove={async (data, actions) => { await actions.order.capture(); processOrder(true); }}
                                onError={(err) => { console.error(err); toast.error("Thanh toán PayPal thất bại!"); }}
                            />
                        </PayPalScriptProvider>
                    ) : (<Alert variant="danger">Admin chưa cấu hình PayPal!</Alert>)
                    ) : (
                    <Button variant="success" size="lg" className="w-100 py-3 fw-bold shadow text-uppercase" onClick={() => processOrder(false)}>
                        <i className="fa-solid fa-paper-plane me-2"></i> HOÀN TẤT ĐẶT HÀNG
                    </Button>
                    )}
                </div>
              </Col>
            </Row>
          </div>
        </div>

      </Container>

      <Modal show={showSuccess} onHide={()=>{}} centered backdrop="static" keyboard={false}>
        <Modal.Body className="text-center p-5">
          <div className="mb-3"><i className="fa-regular fa-circle-check text-success" style={{fontSize:'80px'}}></i></div>
          <h3 className="fw-bold text-success text-uppercase mb-3">Đặt hàng thành công!</h3>
          <p className="text-muted mb-4">Mã đơn hàng của bạn là: <strong className="text-danger fs-5 bg-light px-2 py-1 rounded">{orderInfo?.ma}</strong></p>
          <div className="d-grid gap-2"><Link to="/" className="btn btn-success fw-bold">TIẾP TỤC MUA SẮM</Link></div>
        </Modal.Body>
      </Modal>
    </div>
  );
}
export default Checkout;