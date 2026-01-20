import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Card, Alert, Modal, Image } from 'react-bootstrap';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { collection, addDoc, serverTimestamp, updateDoc, doc, onSnapshot } from 'firebase/firestore'; 
import { db, auth } from './firebase';
import { toast } from 'react-toastify';

function Checkout({ gioHang, setGioHang, userData }) {
  const navigate = useNavigate();
  // Lấy tổng tiền
  const tamTinh = gioHang.reduce((t, s) => t + (s.giaBan || s.giaGoc) * s.soLuong, 0);
  
  const [shopConfig, setShopConfig] = useState(null);
  const [dsShip, setDsShip] = useState([]);
  
  // Form thông tin
  const [khach, setKhach] = useState({ 
    ten: userData?.ten || '', 
    sdt: userData?.sdt || '', 
    diachi: userData?.diachi || '', 
    ghiChu: '', 
    quanHuyen: '' 
  });
  
  const [shippingFee, setShippingFee] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('cod'); // cod | bank | qr
  const [showSuccess, setShowSuccess] = useState(false); // Popup thành công
  const [orderInfo, setOrderInfo] = useState(null); // Lưu mã đơn vừa đặt

  useEffect(() => {
    const unsubConfig = onSnapshot(doc(db, "cauHinh", "thongTinChung"), d => d.exists() && setShopConfig(d.data()));
    const unsubShip = onSnapshot(collection(db, "shipping"), sn => setDsShip(sn.docs.map(d=>d.data())));
    if (gioHang.length === 0) navigate('/cart'); // Nếu giỏ rỗng thì đá về giỏ hàng
    return () => { unsubConfig(); unsubShip(); }
  }, [gioHang, navigate]);

  const handleSelectShip = (e) => { 
    const kv = e.target.value; 
    setKhach({...khach, quanHuyen: kv}); 
    const found = dsShip.find(s => s.khuVuc === kv); 
    setShippingFee(found ? parseInt(found.phi) : 0); 
  };

  const tongCong = tamTinh + shippingFee;

  const handleOrder = async () => {
    if (!khach.ten || !khach.sdt || !khach.diachi || !khach.quanHuyen) return toast.warning("Vui lòng điền đầy đủ thông tin giao hàng!");

    const maDonHang = 'MV-' + Math.floor(100000 + Math.random() * 900000);
    const user = auth.currentUser;

    // Lưu đơn hàng
    await addDoc(collection(db, "donHang"), { 
      maDonHang, 
      khachHang: khach, 
      gioHang, 
      tongTien: tongCong, 
      hinhThucThanhToan: paymentMethod, // Lưu phương thức
      trangThai: 'Mới đặt', 
      ngayDat: serverTimestamp(), 
      userId: user ? user.uid : null 
    });

    // Cộng điểm nếu có
    if (user && userData) {
      const tyLe = parseInt(shopConfig?.tyLeDiem) || 1000;
      const diemCong = Math.floor(tongCong / tyLe);
      await updateDoc(doc(db, "users", user.uid), { diemTichLuy: (userData.diemTichLuy || 0) + diemCong });
    }

    setOrderInfo({ ma: maDonHang, tien: tongCong });
    setGioHang([]); // Xóa giỏ hàng
    setShowSuccess(true); // HIỆN POPUP VÀ KHÔNG TỰ TẮT
  };

  return (
    <Container className="py-5">
      <h2 className="fw-bold text-success mb-4 text-center text-uppercase">Thanh Toán Đơn Hàng</h2>
      <Row>
        {/* CỘT TRÁI: THÔNG TIN GIAO HÀNG */}
        <Col md={7}>
          <Card className="shadow-sm border-0 mb-4">
            <Card.Header className="bg-white fw-bold text-primary"><i className="fa-solid fa-truck"></i> THÔNG TIN GIAO HÀNG</Card.Header>
            <Card.Body>
              <Form.Group className="mb-3"><Form.Label>Họ tên (*)</Form.Label><Form.Control value={khach.ten} onChange={e=>setKhach({...khach,ten:e.target.value})} placeholder="Nguyễn Văn A" /></Form.Group>
              <Form.Group className="mb-3"><Form.Label>Số điện thoại (*)</Form.Label><Form.Control value={khach.sdt} onChange={e=>setKhach({...khach,sdt:e.target.value})} placeholder="09xxxxxx" /></Form.Group>
              <Form.Group className="mb-3"><Form.Label>Khu vực giao hàng (*)</Form.Label><Form.Select value={khach.quanHuyen} onChange={handleSelectShip}><option value="">-- Chọn Quận/Huyện --</option>{dsShip.map((s,i)=><option key={i} value={s.khuVuc}>{s.khuVuc} (+{parseInt(s.phi).toLocaleString()}đ)</option>)}</Form.Select></Form.Group>
              <Form.Group className="mb-3"><Form.Label>Địa chỉ cụ thể (*)</Form.Label><Form.Control as="textarea" rows={2} value={khach.diachi} onChange={e=>setKhach({...khach,diachi:e.target.value})} placeholder="Số nhà, tên đường..." /></Form.Group>
              <Form.Group className="mb-3"><Form.Label>Ghi chú</Form.Label><Form.Control as="textarea" rows={2} value={khach.ghiChu} onChange={e=>setKhach({...khach,ghiChu:e.target.value})} placeholder="Lời nhắn cho shipper..." /></Form.Group>
            </Card.Body>
          </Card>
        </Col>

        {/* CỘT PHẢI: PHƯƠNG THỨC THANH TOÁN & TỔNG KẾT */}
        <Col md={5}>
          <Card className="shadow-sm border-0 mb-4">
            <Card.Header className="bg-white fw-bold text-danger"><i className="fa-solid fa-credit-card"></i> PHƯƠNG THỨC THANH TOÁN</Card.Header>
            <Card.Body>
              <Form.Check type="radio" id="cod" name="pay" label="Thanh toán khi nhận hàng (COD)" className="mb-3 fw-bold" checked={paymentMethod==='cod'} onChange={()=>setPaymentMethod('cod')} />
              <Form.Check type="radio" id="bank" name="pay" label="Chuyển khoản Ngân hàng" className="mb-3 fw-bold" checked={paymentMethod==='bank'} onChange={()=>setPaymentMethod('bank')} />
              
              {/* HIỆN THÔNG TIN NGÂN HÀNG KHI CHỌN BANK */}
              {paymentMethod === 'bank' && shopConfig?.bankInfo && (
                <Alert variant="info" className="small p-2 mb-3">
                  <strong>Ngân hàng:</strong> {shopConfig.bankInfo.bankName}<br/>
                  <strong>STK:</strong> {shopConfig.bankInfo.accountNum}<br/>
                  <strong>Chủ TK:</strong> {shopConfig.bankInfo.accountName}<br/>
                  <strong>Chi nhánh:</strong> {shopConfig.bankInfo.bankBranch}<br/>
                  <hr className="my-1"/>
                  <em>Nội dung: SDT DAT HANG</em>
                </Alert>
              )}

              <Form.Check type="radio" id="qr" name="pay" label="Quét mã QR Code" className="mb-3 fw-bold" checked={paymentMethod==='qr'} onChange={()=>setPaymentMethod('qr')} />
              
              {/* HIỆN ẢNH QR KHI CHỌN QR */}
              {paymentMethod === 'qr' && shopConfig?.bankInfo?.qrImage && (
                <div className="text-center mb-3 p-2 border rounded">
                  <Image src={shopConfig.bankInfo.qrImage} fluid style={{maxHeight: 200}} />
                  <div className="small text-muted mt-1">Quét mã để thanh toán nhanh</div>
                </div>
              )}
            </Card.Body>
          </Card>

          <Card className="shadow-sm border-0 bg-light">
            <Card.Body>
              <div className="d-flex justify-content-between mb-2"><span>Tạm tính:</span><strong>{tamTinh.toLocaleString()} ¥</strong></div>
              <div className="d-flex justify-content-between mb-2"><span>Phí ship:</span><strong>+{shippingFee.toLocaleString()} ¥</strong></div>
              <div className="d-flex justify-content-between h4 text-danger fw-bold border-top pt-3 mt-2"><span>TỔNG CỘNG:</span><span>{tongCong.toLocaleString()} ¥</span></div>
              <Button variant="success" size="lg" className="w-100 mt-3 fw-bold shadow" onClick={handleOrder}>XÁC NHẬN ĐẶT HÀNG</Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* POPUP THÀNH CÔNG (QUAN TRỌNG: KHÔNG TỰ TẮT) */}
      <Modal show={showSuccess} onHide={()=>{}} centered backdrop="static" keyboard={false}>
        <Modal.Header className="bg-success text-white justify-content-center">
          <Modal.Title className="fw-bold">🎉 ĐẶT HÀNG THÀNH CÔNG!</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center p-4">
          <div className="mb-3 text-success" style={{fontSize: 50}}><i className="fa-solid fa-circle-check"></i></div>
          <p>Cảm ơn bạn đã mua sắm tại <strong>{shopConfig?.tenShop}</strong></p>
          <p className="fs-5">Mã đơn hàng: <strong className="text-danger">{orderInfo?.ma}</strong></p>
          
          {/* NẾU CHỌN QR HOẶC BANK THÌ HIỆN LẠI THÔNG TIN ĐỂ KHÁCH THANH TOÁN */}
          {(paymentMethod === 'bank' || paymentMethod === 'qr') && (
            <div className="alert alert-warning text-start small">
              <h6 className="fw-bold text-center">THÔNG TIN THANH TOÁN</h6>
              <p className="mb-1"><strong>Ngân hàng:</strong> {shopConfig?.bankInfo?.bankName}</p>
              <p className="mb-1"><strong>STK:</strong> {shopConfig?.bankInfo?.accountNum}</p>
              <p className="mb-1"><strong>Chủ TK:</strong> {shopConfig?.bankInfo?.accountName}</p>
              <p className="mb-1"><strong>Số tiền:</strong> <span className="text-danger fw-bold">{orderInfo?.tien?.toLocaleString()} ¥</span></p>
              <p className="mb-0"><strong>Nội dung:</strong> {orderInfo?.ma}</p>
              {paymentMethod === 'qr' && shopConfig?.bankInfo?.qrImage && (
                <div className="text-center mt-2"><img src={shopConfig.bankInfo.qrImage} width="150" alt="QR" /></div>
              )}
            </div>
          )}
          
          <p className="text-muted small mt-3">Chúng tôi sẽ liên hệ sớm để xác nhận đơn hàng.</p>
          <Link to="/"><Button variant="outline-success" className="rounded-pill px-4 fw-bold">VỀ TRANG CHỦ</Button></Link>
        </Modal.Body>
      </Modal>
    </Container>
  );
}
export default Checkout;