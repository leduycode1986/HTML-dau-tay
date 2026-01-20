import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Card, Badge, Alert, Row, Col } from 'react-bootstrap';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db, auth } from './firebase'; // Import thêm auth

function OrderLookup() {
  const [keyword, setKeyword] = useState('');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const user = auth.currentUser;

  // --- TỰ ĐỘNG TRA CỨU NẾU LÀ THÀNH VIÊN ---
  useEffect(() => {
    if (user) {
      setLoading(true);
      const fetchUserOrders = async () => {
        try {
          // Tìm theo UserId
          const q = query(collection(db, "donHang"), where("userId", "==", user.uid));
          const querySnapshot = await getDocs(q);
          const result = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          result.sort((a, b) => b.ngayDat - a.ngayDat);
          setOrders(result);
        } catch (err) { console.error(err); }
        setLoading(false);
        setSearched(true); // Đánh dấu đã tìm để hiện kết quả
      };
      fetchUserOrders();
    }
  }, [user]);
  // ------------------------------------------

  const handleLookup = async (e) => {
    e.preventDefault(); if (!keyword.trim()) return;
    setLoading(true); setOrders([]); setSearched(false);
    try {
      const val = keyword.trim();
      let q;
      // Nếu là số > 8 ký tự -> Tìm theo SĐT, ngược lại tìm theo Mã đơn
      if (/^\d+$/.test(val) && val.length >= 8) q = query(collection(db, "donHang"), where("khachHang.sdt", "==", val));
      else q = query(collection(db, "donHang"), where("maDonHang", "==", val));

      const querySnapshot = await getDocs(q);
      const result = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      result.sort((a, b) => b.ngayDat - a.ngayDat);
      setOrders(result);
    } catch (err) { console.error(err); }
    setLoading(false); setSearched(true);
  };

  const getStepStatus = (status) => {
    const steps = ['Mới đặt', 'Đang xử lý', 'Đang giao', 'Hoàn thành'];
    const currentIdx = steps.indexOf(status);
    return steps.map((step, idx) => ({ name: step, active: idx <= currentIdx || status === 'Hoàn thành' }));
  };

  return (
    <Container className="py-5" data-aos="fade-up" style={{maxWidth: '800px'}}>
      
      {/* CHỈ HIỆN Ô TÌM KIẾM NẾU CHƯA ĐĂNG NHẬP */}
      {!user && (
        <Card className="border-0 shadow-sm p-4 text-center mb-4">
          <h2 className="fw-bold text-success mb-3"><i className="fa-solid fa-magnifying-glass-location me-2"></i>TRA CỨU ĐƠN HÀNG</h2>
          <p className="text-muted">Nhập <strong>Số điện thoại</strong> hoặc <strong>Mã đơn hàng</strong>.</p>
          <Form onSubmit={handleLookup}>
            <div className="input-group mb-3">
              <Form.Control size="lg" placeholder="VD: 0901234567 hoặc MV-123456" value={keyword} onChange={e=>setKeyword(e.target.value)} required />
              <Button variant="success" type="submit" size="lg" disabled={loading} className="fw-bold px-4">{loading ? 'Đang tìm...' : 'TRA CỨU'}</Button>
            </div>
          </Form>
        </Card>
      )}

      {user && orders.length > 0 && <h4 className="mb-4 text-center text-primary">📦 Đơn hàng của bạn ({orders.length})</h4>}

      {searched && orders.length === 0 && (<Alert variant="warning" className="text-center">❌ Không tìm thấy đơn hàng nào.</Alert>)}

      {orders.length > 0 && (<div data-aos="fade-in">
        {orders.map((order, index) => (
          <Card key={index} className="mb-4 border-0 shadow-sm overflow-hidden">
            <Card.Header className="bg-white border-bottom p-3 d-flex justify-content-between align-items-center flex-wrap gap-2"><div><span className="text-muted small me-2">Mã đơn:</span><span className="fw-bold text-primary fs-5 me-3">{order.maDonHang || `#${order.id.slice(0,6)}`}</span><span className="text-muted small"><i className="fa-regular fa-clock me-1"></i>{order.ngayDat?.toDate ? order.ngayDat.toDate().toLocaleString('vi-VN') : ''}</span></div><Badge bg={order.trangThai === 'Hoàn thành' ? 'success' : order.trangThai === 'Đang giao' ? 'info' : 'warning'} className="px-3 py-2">{order.trangThai}</Badge></Card.Header>
            <Card.Body className="p-0">
              <div className="tracking-step p-4 bg-light">{getStepStatus(order.trangThai).map((step, idx) => (<div key={idx} className={`step-item ${step.active ? 'active' : ''}`}><div className="step-icon"><i className="fa-solid fa-check"></i></div><small className="fw-bold d-block mt-1" style={{fontSize:'11px'}}>{step.name}</small></div>))}</div>
              <div className="p-4"><Row><Col md={6}><h6 className="fw-bold text-success"><i className="fa-solid fa-user me-2"></i>Thông tin nhận hàng</h6><p className="mb-1 small"><strong>Người nhận:</strong> {order.khachHang?.ten}</p><p className="mb-1 small"><strong>SĐT:</strong> {order.khachHang?.sdt}</p><p className="mb-1 small"><strong>Địa chỉ:</strong> {order.khachHang?.diachi}</p></Col><Col md={6} className="mt-3 mt-md-0 border-start ps-md-4"><h6 className="fw-bold text-success"><i className="fa-solid fa-basket-shopping me-2"></i>Sản phẩm ({order.gioHang?.length})</h6><ul className="list-unstyled mb-2 small" style={{maxHeight:'100px', overflowY:'auto'}}>{order.gioHang?.map((item, i) => (<li key={i} className="d-flex justify-content-between mb-1 border-bottom pb-1"><span>{item.soLuong}x {item.ten}</span><span className="fw-bold">{item.giaBan?.toLocaleString()} ¥</span></li>))}</ul><div className="d-flex justify-content-between align-items-center pt-2 border-top"><span className="fw-bold text-uppercase">Tổng tiền:</span><span className="text-danger fw-bold fs-5">{order.tongTien?.toLocaleString()} ¥</span></div></Col></Row></div>
            </Card.Body>
          </Card>
        ))}
      </div>)}
    </Container>
  );
}
export default OrderLookup;