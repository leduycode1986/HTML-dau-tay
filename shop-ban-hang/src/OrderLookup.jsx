import React, { useState } from 'react';
import { Container, Form, Button, Card, Badge, Alert } from 'react-bootstrap';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

function OrderLookup() {
  const [searchId, setSearchId] = useState('');
  const [searchPhone, setSearchPhone] = useState('');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLookup = async (e) => {
    e.preventDefault();
    setLoading(true); setError(''); setOrder(null);
    try {
      // Tìm đơn hàng theo ID document
      const docRef = doc(db, "donHang", searchId.trim());
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        // Kiểm tra số điện thoại (để bảo mật)
        if (data.khachHang?.sdt === searchPhone.trim()) {
          setOrder({ id: docSnap.id, ...data });
        } else {
          setError("Số điện thoại không khớp với đơn hàng này!");
        }
      } else {
        setError("Không tìm thấy mã đơn hàng này!");
      }
    } catch (err) {
      setError("Có lỗi xảy ra, vui lòng thử lại.");
    }
    setLoading(false);
  };

  const getStepStatus = (status) => {
    const steps = ['Mới đặt', 'Đang xử lý', 'Đang giao', 'Hoàn thành'];
    const currentIdx = steps.indexOf(status);
    return steps.map((step, idx) => ({
      name: step,
      active: idx <= currentIdx || (status === 'Hoàn thành') 
    }));
  };

  return (
    <Container className="py-5" data-aos="fade-up">
      <div className="tracking-box">
        <h2 className="fw-bold text-success mb-4">TRA CỨU ĐƠN HÀNG 🚚</h2>
        <p className="text-muted mb-4">Nhập mã đơn hàng và số điện thoại để kiểm tra tình trạng.</p>
        <Form onSubmit={handleLookup}>
          <Form.Group className="mb-3">
            <Form.Control placeholder="Mã đơn hàng (VD: 7A2b...)" value={searchId} onChange={e=>setSearchId(e.target.value)} required />
          </Form.Group>
          <Form.Group className="mb-4">
            <Form.Control placeholder="Số điện thoại đặt hàng" value={searchPhone} onChange={e=>setSearchPhone(e.target.value)} required />
          </Form.Group>
          <Button variant="success" type="submit" className="w-100 fw-bold py-2" disabled={loading}>
            {loading ? 'Đang tìm...' : 'TRA CỨU NGAY'}
          </Button>
        </Form>

        {error && <Alert variant="danger" className="mt-3">{error}</Alert>}

        {order && (
          <div className="mt-5 text-start border-top pt-4" data-aos="fade-in">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold m-0">Kết quả tra cứu:</h5>
              <Badge bg={order.trangThai === 'Hoàn thành' ? 'success' : 'warning'}>{order.trangThai}</Badge>
            </div>
            <p><strong>Khách hàng:</strong> {order.khachHang?.ten}</p>
            <p><strong>Ngày đặt:</strong> {order.ngayDat?.toDate ? order.ngayDat.toDate().toLocaleString('vi-VN') : ''}</p>
            <p><strong>Tổng tiền:</strong> <span className="text-danger fw-bold">{order.tongTien?.toLocaleString()} ¥</span></p>
            
            {/* Thanh tiến trình */}
            <div className="tracking-step">
              {getStepStatus(order.trangThai).map((step, idx) => (
                <div key={idx} className={`step-item ${step.active ? 'active' : ''}`}>
                  <div className="step-icon"><i className="fa-solid fa-check"></i></div>
                  <small className="fw-bold" style={{fontSize: '11px'}}>{step.name}</small>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Container>
  );
}
export default OrderLookup;