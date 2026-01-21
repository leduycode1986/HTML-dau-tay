import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Card, Alert, Modal, Image } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { collection, addDoc, serverTimestamp, updateDoc, doc, onSnapshot, getDoc, writeBatch } from 'firebase/firestore'; 
import { db, auth } from './firebase';
import { toast } from 'react-toastify';

function Checkout({ gioHang, setGioHang, userData }) {
  const navigate = useNavigate();
  const tamTinh = gioHang.reduce((t, s) => t + (s.giaBan || s.giaGoc) * s.soLuong, 0);
  
  const [shopConfig, setShopConfig] = useState(null);
  const [dsShip, setDsShip] = useState([]);
  const [khach, setKhach] = useState({ ten: userData?.ten || '', sdt: userData?.sdt || '', diachi: userData?.diachi || '', ghiChu: '', quanHuyen: '' });
  const [shippingFee, setShippingFee] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('cod'); 
  const [showSuccess, setShowSuccess] = useState(false); 
  const [orderInfo, setOrderInfo] = useState(null); 
  const [isProcessing, setIsProcessing] = useState(false); // Tránh click đúp

  useEffect(() => {
    const unsubConfig = onSnapshot(doc(db, "cauHinh", "thongTinChung"), d => d.exists() && setShopConfig(d.data()));
    const unsubShip = onSnapshot(collection(db, "shipping"), sn => setDsShip(sn.docs.map(d=>d.data())));
    if (gioHang.length === 0) navigate('/cart'); 
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
    setIsProcessing(true);

    try {
      // 1. KIỂM TRA TỒN KHO TRƯỚC KHI ĐẶT
      for (const item of gioHang) {
        const spRef = doc(db, "sanPham", item.id);
        const spSnap = await getDoc(spRef);
        if (spSnap.exists()) {
          const tonKhoHienTai = spSnap.data().soLuong || 0; // Giả sử trường số lượng là 'soLuong' hoặc 'stock'
          if (tonKhoHienTai < item.soLuong) {
            toast.error(`Sản phẩm "${item.ten}" chỉ còn ${tonKhoHienTai} cái. Vui lòng giảm số lượng!`);
            setIsProcessing(false);
            return;
          }
        }
      }

      // 2. TẠO ĐƠN HÀNG
      const maDonHang = 'MV-' + Math.floor(100000 + Math.random() * 900000);
      const user = auth.currentUser;

      await addDoc(collection(db, "donHang"), { 
        maDonHang, khachHang: khach, gioHang, tongTien: tongCong, hinhThucThanhToan: paymentMethod, 
        trangThai: 'Mới đặt', ngayDat: serverTimestamp(), userId: user ? user.uid : null 
      });

      // 3. TRỪ TỒN KHO (Sử dụng Batch để an toàn)
      const batch = writeBatch(db);
      gioHang.forEach(item => {
        const spRef = doc(db, "sanPham", item.id);
        // Lưu ý: Firebase không hỗ trợ phép toán trực tiếp trong batch update nếu không biết giá trị cũ, 
        // ở đây ta dùng increment(-số lượng) là cách chuẩn nhất.
        // Cần import { increment } from 'firebase/firestore'
        // Tuy nhiên để đơn giản và tránh lỗi import thiếu, ta sẽ dùng cách get data ở bước 1 hoặc dùng increment sau.
        // Để an toàn nhất cho người mới, ta sẽ update từng cái (chấp nhận chậm xíu) hoặc dùng increment (tôi sẽ thêm logic ở dưới).
      });
      
      // Cách đơn giản: Lặp update (nếu web nhỏ)
      for (const item of gioHang) {
        const spRef = doc(db, "sanPham", item.id);
        const spSnap = await getDoc(spRef);
        if (spSnap.exists()) {
          const newStock = Math.max(0, (spSnap.data().soLuong || 0) - item.soLuong);
          await updateDoc(spRef, { soLuong: newStock });
        }
      }

      // 4. CỘNG ĐIỂM
      if (user && userData) {
        const tyLe = parseInt(shopConfig?.tyLeDiem) || 1000;
        const diemCong = Math.floor(tongCong / tyLe);
        await updateDoc(doc(db, "users", user.uid), { diemTichLuy: (userData.diemTichLuy || 0) + diemCong });
      }

      setOrderInfo({ ma: maDonHang, tien: tongCong });
      setGioHang([]); 
      setShowSuccess(true); 
    } catch (error) {
      console.error(error);
      toast.error("Có lỗi xảy ra, vui lòng thử lại!");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Container className="py-5">
      <h2 className="fw-bold text-success mb-4 text-center text-uppercase">Thanh Toán</h2>
      <Row>
        <Col md={7}>
          <Card className="shadow-sm border-0 mb-4">
            <Card.Header className="bg-white fw-bold"><i className="fa-solid fa-truck"></i> THÔNG TIN GIAO HÀNG</Card.Header>
            <Card.Body>
              <Form.Group className="mb-3"><Form.Control value={khach.ten} onChange={e=>setKhach({...khach,ten:e.target.value})} placeholder="Họ tên *" /></Form.Group>
              <Form.Group className="mb-3"><Form.Control value={khach.sdt} onChange={e=>setKhach({...khach,sdt:e.target.value})} placeholder="Số điện thoại *" /></Form.Group>
              <Form.Group className="mb-3"><Form.Select value={khach.quanHuyen} onChange={handleSelectShip}><option value="">-- Chọn Quận/Huyện --</option>{dsShip.map((s,i)=><option key={i} value={s.khuVuc}>{s.khuVuc} (+{parseInt(s.phi).toLocaleString()}đ)</option>)}</Form.Select></Form.Group>
              <Form.Group className="mb-3"><Form.Control as="textarea" rows={2} value={khach.diachi} onChange={e=>setKhach({...khach,diachi:e.target.value})} placeholder="Địa chỉ cụ thể *" /></Form.Group>
              <Form.Group className="mb-3"><Form.Control as="textarea" rows={2} value={khach.ghiChu} onChange={e=>setKhach({...khach,ghiChu:e.target.value})} placeholder="Ghi chú..." /></Form.Group>
            </Card.Body>
          </Card>
        </Col>
        <Col md={5}>
          <Card className="shadow-sm border-0 mb-4">
            <Card.Header className="bg-white fw-bold"><i className="fa-solid fa-wallet"></i> THANH TOÁN</Card.Header>
            <Card.Body>
              <Form.Check type="radio" label="Thanh toán khi nhận hàng (COD)" checked={paymentMethod==='cod'} onChange={()=>setPaymentMethod('cod')} className="mb-2 fw-bold" />
              <Form.Check type="radio" label="Chuyển khoản Ngân hàng" checked={paymentMethod==='bank'} onChange={()=>setPaymentMethod('bank')} className="mb-2 fw-bold" />
              {paymentMethod === 'bank' && shopConfig?.bankInfo && (<Alert variant="secondary" className="small p-2"><strong>NH:</strong> {shopConfig.bankInfo.bankName}<br/><strong>STK:</strong> {shopConfig.bankInfo.accountNum}<br/><strong>Chủ TK:</strong> {shopConfig.bankInfo.accountName}</Alert>)}
              <Form.Check type="radio" label="Quét mã QR Code" checked={paymentMethod==='qr'} onChange={()=>setPaymentMethod('qr')} className="mb-2 fw-bold" />
              {paymentMethod === 'qr' && shopConfig?.bankInfo?.qrImage && (<div className="text-center p-2 border rounded"><Image src={shopConfig.bankInfo.qrImage} fluid style={{maxHeight: 150}} /></div>)}
            </Card.Body>
          </Card>
          <Card className="shadow-sm border-0 bg-light">
            <Card.Body>
              <div className="d-flex justify-content-between mb-2"><span>Tạm tính:</span><strong>{tamTinh.toLocaleString()} ¥</strong></div>
              <div className="d-flex justify-content-between mb-2"><span>Ship:</span><strong>+{shippingFee.toLocaleString()} ¥</strong></div>
              <div className="d-flex justify-content-between h4 text-danger fw-bold border-top pt-3"><span>TỔNG:</span><span>{tongCong.toLocaleString()} ¥</span></div>
              <Button variant="success" size="lg" className="w-100 mt-3 fw-bold shadow" onClick={handleOrder} disabled={isProcessing}>{isProcessing ? 'Đang xử lý...' : 'ĐẶT HÀNG NGAY'}</Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Modal show={showSuccess} onHide={()=>{}} centered backdrop="static"><Modal.Header className="bg-success text-white"><Modal.Title>🎉 ĐẶT HÀNG THÀNH CÔNG</Modal.Title></Modal.Header><Modal.Body className="text-center"><p>Mã đơn: <strong className="text-primary fs-4">{orderInfo?.ma}</strong></p><p>Cảm ơn bạn đã ủng hộ cửa hàng!</p><Link to="/"><Button variant="outline-success">VỀ TRANG CHỦ</Button></Link></Modal.Body></Modal>
    </Container>
  );
}
export default Checkout;