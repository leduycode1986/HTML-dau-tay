import React, { useState } from 'react';
import { Container, Form, Button, Card, Alert, Row, Col, Badge, Spinner } from 'react-bootstrap';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore'; // Import thêm doc, getDoc
import { db } from './firebase';
import { Link } from 'react-router-dom';

function OrderLookup() {
  const [searchParams, setSearchParams] = useState({ id: '', phone: '' });
  const [orderResult, setOrderResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    
    // 1. Kiểm tra đầu vào: Phải nhập ít nhất 1 trong 2
    if (!searchParams.id && !searchParams.phone) { 
        setError("Vui lòng nhập Mã đơn hàng hoặc Số điện thoại để tra cứu!"); 
        return; 
    }
    
    setLoading(true); 
    setError(''); 
    setOrderResult(null);

    try {
      let orders = [];

      // TRƯỜNG HỢP 1: CÓ MÃ ĐƠN HÀNG -> Ưu tiên tìm chính xác theo mã
      if (searchParams.id) {
          const maDon = searchParams.id.trim();
          
          // Cách 1: Tìm theo field 'maDonHang' (Mã code ngắn bạn tự tạo)
          const q = query(collection(db, "donHang"), where("maDonHang", "==", maDon));
          const querySnapshot = await getDocs(q);
          
          if (!querySnapshot.empty) {
              orders = querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
          } else {
              // Cách 2: Nếu không thấy, thử tìm theo ID gốc của Firebase (chuỗi dài)
              try {
                  const docRef = doc(db, "donHang", maDon);
                  const docSnap = await getDoc(docRef);
                  if (docSnap.exists()) {
                      orders = [{ id: docSnap.id, ...docSnap.data() }];
                  }
              } catch (err) {
                  // Không phải ID hợp lệ thì bỏ qua
              }
          }
      } 
      // TRƯỜNG HỢP 2: CHỈ CÓ SỐ ĐIỆN THOẠI -> Tìm danh sách đơn theo SĐT
      else if (searchParams.phone) {
          const sdt = searchParams.phone.trim();
          const q = query(collection(db, "donHang"), where("khachHang.sdt", "==", sdt));
          const querySnapshot = await getDocs(q);
          orders = querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      }

      // XỬ LÝ KẾT QUẢ
      if (orders.length === 0) {
        setError("Không tìm thấy đơn hàng nào phù hợp với thông tin bạn cung cấp.");
      } else {
        // Sắp xếp đơn mới nhất lên đầu
        orders.sort((a,b) => (b.ngayDat?.seconds || 0) - (a.ngayDat?.seconds || 0));
        setOrderResult(orders);
      }

    } catch (err) { 
        console.error(err);
        setError("Đã xảy ra lỗi khi tra cứu. Vui lòng thử lại."); 
    } finally {
        setLoading(false);
    }
  };

  // Helper chọn màu trạng thái
  const getStatusColor = (status) => {
    switch (status) {
      case 'Mới đặt': return 'primary';
      case 'Đang giao': return 'info';
      case 'Hoàn thành': return 'success';
      case 'Đã hủy': return 'danger';
      default: return 'secondary';
    }
  };

  return (
    <Container className="py-5" style={{maxWidth: 800}}>
      <Card className="shadow-sm border-0 mb-4">
        <Card.Header className="bg-success text-white fw-bold text-center py-3 text-uppercase">
            <i className="fa-solid fa-truck-fast me-2"></i> Tra cứu đơn hàng
        </Card.Header>
        <Card.Body className="p-4">
          <Form onSubmit={handleSearch}>
            <Row className="g-3">
              <Col md={6}>
                <Form.Label className="fw-bold">Số điện thoại</Form.Label>
                <Form.Control 
                    type="tel" 
                    placeholder="Nhập SĐT..." 
                    value={searchParams.phone} 
                    onChange={e => setSearchParams({...searchParams, phone: e.target.value})} 
                />
              </Col>
              <Col md={6}>
                <Form.Label className="fw-bold">Mã đơn hàng</Form.Label>
                <Form.Control 
                    type="text" 
                    placeholder="VD: MV-123456" 
                    value={searchParams.id} 
                    onChange={e => setSearchParams({...searchParams, id: e.target.value})} 
                />
              </Col>
              <Col md={12} className="text-center mt-2">
                 <Form.Text className="text-muted fst-italic d-block mb-3">
                    * Bạn có thể nhập một trong hai thông tin trên để tìm kiếm.
                 </Form.Text>
                <Button type="submit" variant="success" className="px-5 rounded-pill fw-bold shadow-sm" disabled={loading}>
                    {loading ? <Spinner animation="border" size="sm" /> : <span><i className="fa-solid fa-search me-2"></i> TRA CỨU NGAY</span>}
                </Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      {error && (
        <Alert variant="danger" className="text-center shadow-sm border-0 animate__animated animate__fadeIn">
             <i className="fa-solid fa-circle-exclamation me-2"></i> {error}
        </Alert>
      )}

      {orderResult && (
        <div className="animate__animated animate__fadeInUp">
          <h5 className="fw-bold text-success mb-3 border-bottom pb-2">
             <i className="fa-solid fa-list-check me-2"></i> KẾT QUẢ TÌM KIẾM ({orderResult.length} đơn)
          </h5>
          {orderResult.map(order => (
            <Card key={order.id} className="mb-4 border-0 shadow-sm overflow-hidden">
              <Card.Header className="d-flex justify-content-between align-items-center bg-light py-3">
                <div>
                    <span className="fw-bold text-primary fs-5 me-2">#{order.maDonHang || order.id.slice(0,8).toUpperCase()}</span>
                    <small className="text-muted">({order.ngayDat?.toDate ? new Date(order.ngayDat.toDate()).toLocaleString('vi-VN') : ''})</small>
                </div>
                <Badge bg={getStatusColor(order.trangThai)} className="fs-6 rounded-pill px-3">{order.trangThai}</Badge>
              </Card.Header>
              <Card.Body>
                {/* Thông tin khách hàng */}
                <div className="mb-3 p-3 bg-light rounded bg-opacity-50">
                     <div className="d-flex justify-content-between mb-1">
                        <span><i className="fa-solid fa-user me-2 text-secondary"></i>Người nhận:</span>
                        <span className="fw-bold">{order.khachHang?.ten}</span>
                     </div>
                     <div className="d-flex justify-content-between">
                        <span><i className="fa-solid fa-location-dot me-2 text-secondary"></i>Địa chỉ:</span>
                        <span className="text-end">{order.khachHang?.diachi}, {order.khachHang?.quanHuyen}</span>
                     </div>
                </div>

                {/* Danh sách sản phẩm */}
                <div className="border-top pt-2">
                  {order.gioHang?.map((sp, idx) => (
                    <div key={idx} className="d-flex justify-content-between align-items-center mb-2 py-2 border-bottom border-light">
                      <div className="d-flex align-items-center gap-3">
                          <img src={sp.anh} width="50" height="50" className="rounded border" style={{objectFit:'cover'}} alt=""/>
                          <div>
                              <div className="fw-bold text-dark">{sp.ten}</div>
                              <small className="text-muted">{sp.donVi} x {sp.soLuong}</small>
                          </div>
                      </div>
                      <span className="fw-bold text-dark">{(sp.giaBan * sp.soLuong).toLocaleString()}¥</span>
                    </div>
                  ))}
                </div>
                <div className="text-end mt-3">
                    <span className="text-muted me-2">Tổng thanh toán:</span>
                    <span className="h4 text-danger fw-bold">{order.tongTien?.toLocaleString()}¥</span>
                </div>
              </Card.Body>
            </Card>
          ))}
          <div className="text-center mt-4">
               <Link to="/" className="btn btn-outline-secondary rounded-pill px-4"><i className="fa-solid fa-arrow-left me-2"></i> Quay lại mua sắm</Link>
          </div>
        </div>
      )}
    </Container>
  );
}

export default OrderLookup;