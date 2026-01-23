import React, { useState } from 'react';
import { Container, Form, Button, Card, Alert, Row, Col, Table, Badge } from 'react-bootstrap';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from './firebase';

function OrderLookup() {
  const [searchParams, setSearchParams] = useState({ id: '', phone: '' });
  const [orderResult, setOrderResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchParams.phone) { setError("Vui lòng nhập số điện thoại đặt hàng!"); return; }
    
    setLoading(true); setError(''); setOrderResult(null);
    try {
      // Tìm theo SĐT
      const q = query(collection(db, "donHang"), where("khachHang.sdt", "==", searchParams.phone));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        setError("Không tìm thấy đơn hàng nào với số điện thoại này.");
      } else {
        const orders = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // Nếu có nhập mã đơn thì lọc thêm mã đơn
        if (searchParams.id) {
          const specificOrder = orders.find(o => o.maDonHang === searchParams.id || o.id === searchParams.id);
          if (specificOrder) setOrderResult([specificOrder]);
          else setError("Không tìm thấy mã đơn hàng này của số điện thoại trên.");
        } else {
          setOrderResult(orders); // Hiện tất cả đơn của SĐT đó
        }
      }
    } catch (err) {
      console.error(err);
      setError("Đã xảy ra lỗi khi tra cứu.");
    }
    setLoading(false);
  };

  return (
    <Container className="py-5" style={{maxWidth: 800}}>
      <Card className="shadow-sm border-0 mb-4">
        <Card.Header className="bg-success text-white fw-bold text-uppercase text-center py-3">
          <i className="fa-solid fa-magnifying-glass me-2"></i> Tra cứu đơn hàng
        </Card.Header>
        <Card.Body className="p-4">
          <Form onSubmit={handleSearch}>
            <Row className="g-3">
              <Col md={6}>
                <Form.Label className="fw-bold">Số điện thoại đặt hàng <span className="text-danger">*</span></Form.Label>
                <Form.Control 
                  type="text" 
                  placeholder="Nhập SĐT..." 
                  value={searchParams.phone} 
                  onChange={e => setSearchParams({...searchParams, phone: e.target.value})} 
                />
              </Col>
              <Col md={6}>
                <Form.Label className="fw-bold">Mã đơn hàng (Tùy chọn)</Form.Label>
                <Form.Control 
                  type="text" 
                  placeholder="VD: MV-123456" 
                  value={searchParams.id} 
                  onChange={e => setSearchParams({...searchParams, id: e.target.value})} 
                />
              </Col>
              <Col md={12} className="text-center mt-4">
                <Button type="submit" variant="success" className="px-5 rounded-pill fw-bold" disabled={loading}>
                  {loading ? 'Đang tìm...' : 'TRA CỨU NGAY'}
                </Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      {error && <Alert variant="danger" className="text-center">{error}</Alert>}

      {orderResult && (
        <div className="animate__animated animate__fadeIn">
          <h5 className="fw-bold text-success mb-3">KẾT QUẢ TRA CỨU ({orderResult.length} đơn)</h5>
          {orderResult.map(order => (
            <Card key={order.id} className="mb-3 border-success shadow-sm">
              <Card.Header className="d-flex justify-content-between align-items-center bg-light">
                <span className="fw-bold text-primary">#{order.maDonHang || order.id}</span>
                <Badge bg={order.trangThai === 'Hoàn thành' ? 'success' : (order.trangThai === 'Đã hủy' ? 'danger' : 'warning')}>
                  {order.trangThai}
                </Badge>
              </Card.Header>
              <Card.Body>
                <p className="mb-1"><strong>Ngày đặt:</strong> {order.ngayDat?.toDate ? order.ngayDat.toDate().toLocaleString('vi-VN') : ''}</p>
                <p className="mb-1"><strong>Địa chỉ:</strong> {order.khachHang?.diachi}, {order.khachHang?.quanHuyen}</p>
                <div className="border-top mt-2 pt-2">
                  {order.gioHang?.map((sp, idx) => (
                    <div key={idx} className="d-flex justify-content-between small mb-1">
                      <span>{sp.ten} x {sp.soLuong}</span>
                      <span className="fw-bold">{sp.giaBan?.toLocaleString()}₫</span>
                    </div>
                  ))}
                </div>
                <div className="text-end border-top mt-2 pt-2 h5 text-danger fw-bold">
                  Tổng: {order.tongTien?.toLocaleString()}₫
                </div>
              </Card.Body>
            </Card>
          ))}
        </div>
      )}
    </Container>
  );
}

export default OrderLookup;