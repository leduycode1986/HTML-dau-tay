import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Modal, InputGroup } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { collection, addDoc, serverTimestamp, updateDoc, doc, onSnapshot, getDocs, getDoc, query, where, increment } from 'firebase/firestore'; 
import { db, auth } from './firebase';
import { toast } from 'react-toastify';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js"; // [MỚI] Import PayPal

function Checkout({ gioHang, setGioHang, userData }) {
  const navigate = useNavigate();
  
  // State thông tin khách hàng
  const [khach, setKhach] = useState({ ten: '', sdt: '', diachi: '', ghiChu: '', quanHuyen: '' });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (userData) {
      setKhach(prev => ({ ...prev, ten: userData.ten || '', sdt: userData.sdt || '', diachi: userData.diachi || '' }));
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

  // --- HÀM XỬ LÝ ĐẶT HÀNG (Dùng chung cho cả COD, QR và PayPal) ---
  const processOrder = async (isPaid = false) => {
    // 1. Validate Form
    if (!validateForm()) {
        toast.warning("Vui lòng kiểm tra lại thông tin giao hàng!");
        return false; // Trả về false để PayPal biết mà dừng lại
    }
    
    const maDonHang = 'MV-' + Math.floor(100000 + Math.random() * 900000);
    
    try {
      // 2. Kiểm tra kho lần cuối
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

      // 3. TẠO ĐƠN HÀNG
      await addDoc(collection(db, "donHang"), { 
        maDonHang, 
        khachHang: khach, 
        gioHang, 
        tongTien: tongCong, 
        hinhThucThanhToan: isPaid ? 'PayPal' : paymentMethod, // Nếu đã thanh toán thì ghi đè là PayPal
        trangThai: isPaid ? 'Đã thanh toán' : 'Mới đặt',      // Nếu PayPal thì trạng thái là Đã thanh toán
        ngayDat: serverTimestamp(), 
        userId: auth.currentUser?.uid || null, 
        coupon: couponCode, 
        giamGia: discount, 
        ship: shippingFee 
      });

      // 4. TRỪ TỒN KHO
      const updatePromises = gioHang.map(item => {
        const productRef = doc(db, "sanPham", item.id);
        return updateDoc(productRef, { soLuong: increment(-parseInt(item.soLuong)) });
      });
      await Promise.all(updatePromises);

      // 5. CỘNG ĐIỂM
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

        <Row className="g-4">
          <Col lg={7}>
            <div className="checkout-card">
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

          <Col lg={5}>
            <div className="checkout-card mb-3">
              <div className="checkout-card-header"><h5 className="checkout-title"><i className="fa-solid fa-bag-shopping"></i> Đơn hàng ({gioHang.length} món)</h5></div>
              <div className="checkout-body" style={{maxHeight:'300px', overflowY:'auto'}}>
                {gioHang.map((sp, idx) => (
                  <div key={idx} className="mini-product-item">
                    <img src={sp.anh} alt={sp.ten} className="mini-product-img" />
                    <div className="flex-grow-1"><div className="fw-bold text-dark" style={{fontSize:'14px'}}>{sp.ten}</div><div className="small text-muted">x{sp.soLuong}</div></div>
                    <div className="fw-bold text-danger">{((sp.giaBan || sp.giaGoc) * sp.soLuong).toLocaleString()}¥</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="checkout-card">
              <div className="checkout-card-header"><h5 className="checkout-title"><i className="fa-solid fa-wallet"></i> Thanh toán</h5></div>
              <div className="checkout-body">
                <div className={`payment-method-item ${paymentMethod==='cod' ? 'active' : ''}`} onClick={()=>setPaymentMethod('cod')}>
                  <img src="https://cdn-icons-png.flaticon.com/512/2331/2331941.png" className="payment-icon" alt="COD"/>
                  <div><div className="fw-bold">Thanh toán khi nhận hàng (COD)</div><div className="small text-muted">Tiền mặt</div></div>
                  {paymentMethod==='cod' && <i className="fa-solid fa-check-circle text-success ms-auto fs-4"></i>}
                </div>
                <div className={`payment-method-item ${paymentMethod==='qr' ? 'active' : ''}`} onClick={()=>setPaymentMethod('qr')}>
                  <img src="https://cdn-icons-png.flaticon.com/512/161/161110.png" className="payment-icon" alt="QR"/>
                  <div><div className="fw-bold">Chuyển khoản / Quét QR</div><div className="small text-muted">Ngân hàng</div></div>
                  {paymentMethod==='qr' && <i className="fa-solid fa-check-circle text-success ms-auto fs-4"></i>}
                </div>
                
                {/* [MỚI] Tùy chọn PayPal */}
                <div className={`payment-method-item ${paymentMethod==='paypal' ? 'active' : ''}`} onClick={()=>setPaymentMethod('paypal')}>
                  <img src="https://cdn-icons-png.flaticon.com/512/174/174861.png" className="payment-icon" alt="PayPal"/>
                  <div><div className="fw-bold">Thanh toán qua PayPal</div><div className="small text-muted">Thẻ quốc tế</div></div>
                  {paymentMethod==='paypal' && <i className="fa-solid fa-check-circle text-success ms-auto fs-4"></i>}
                </div>

                {paymentMethod==='qr' && shopConfig?.bankInfo?.qrImage && (
                  <div className="text-center p-3 mb-3 bg-light rounded border">
                    <img src={shopConfig.bankInfo.qrImage} style={{maxWidth:'180px'}} className="rounded shadow-sm mb-2"/>
                    <div className="small text-success fw-bold"><i className="fa-solid fa-qrcode me-1"></i> Quét mã để thanh toán</div>
                  </div>
                )}

                <div className="mt-4 mb-3">
                  <Form.Label className="form-label-custom">Mã giảm giá</Form.Label>
                  <InputGroup><Form.Control placeholder="Nhập mã coupon..." value={couponCode} onChange={e=>setCouponCode(e.target.value)} className="form-control-lg-custom"/><Button variant="outline-success" onClick={handleApplyCoupon}>Áp dụng</Button></InputGroup>
                  {couponMsg && <div className={`small mt-2 ${discount>0?'text-success fw-bold':'text-danger'}`}>{couponMsg}</div>}
                </div>

                <div className="summary-section">
                  <div className="summary-row"><span className="summary-label">Tạm tính:</span><span className="summary-value">{tamTinh.toLocaleString()} ¥</span></div>
                  <div className="summary-row"><span className="summary-label">Phí vận chuyển:</span><span className="summary-value">{shippingFee > 0 ? `+${shippingFee.toLocaleString()} ¥` : '---'}</span></div>
                  {discount > 0 && <div className="summary-row text-success"><span className="summary-label">Giảm giá:</span><span className="summary-value">-{discount.toLocaleString()} ¥</span></div>}
                  <div className="summary-row total"><span className="summary-label fs-5 text-dark">TỔNG THANH TOÁN</span><span className="total-price">{tongCong.toLocaleString()} <small style={{fontSize:'1rem'}}>¥</small></span></div>
                </div>

                {/* LOGIC HIỂN THỊ NÚT THANH TOÁN */}
                {paymentMethod === 'paypal' ? (
                  <div className="mt-3">
                    {shopConfig?.paypalClientId ? (
                       <PayPalScriptProvider options={{ "client-id": shopConfig.paypalClientId, currency: "JPY" }}>
                          <PayPalButtons 
                             style={{ layout: "vertical", shape: "rect", label: "pay" }} 
                             createOrder={(data, actions) => {
                                // Validate lại trước khi mở popup PayPal
                                if (!validateForm()) {
                                    toast.warning("Vui lòng điền đủ thông tin giao hàng trước!");
                                    return Promise.reject("Form invalid");
                                }
                                return actions.order.create({
                                   purchase_units: [{ amount: { value: tongCong } }]
                                });
                             }}
                             onApprove={async (data, actions) => {
                                const details = await actions.order.capture();
                                // Thanh toán thành công -> Gọi hàm tạo đơn với trạng thái "Đã thanh toán"
                                processOrder(true);
                             }}
                             onError={(err) => {
                                console.error(err);
                                toast.error("Thanh toán PayPal thất bại!");
                             }}
                          />
                       </PayPalScriptProvider>
                    ) : (
                      <Alert variant="danger">Admin chưa cấu hình PayPal Client ID!</Alert>
                    )}
                  </div>
                ) : (
                  <Button variant="success" size="lg" className="w-100 mt-3 py-3 fw-bold shadow text-uppercase" onClick={() => processOrder(false)}>
                    <i className="fa-solid fa-paper-plane me-2"></i> ĐẶT HÀNG NGAY
                  </Button>
                )}

              </div>
            </div>
          </Col>
        </Row>
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