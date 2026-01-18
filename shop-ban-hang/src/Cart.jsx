import React, { useState } from 'react';
import { Table, Button, Form, Row, Col, Container, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';

function Cart({ gioHang, dsDanhMuc, handleDatHang, chinhSuaSoLuong, xoaSanPham }) {
  // Thêm trường ghiChu vào state khách hàng
  const [khach, setKhach] = useState({ ten: '', sdt: '', diachi: '', ghiChu: '' });
  const tongTien = gioHang.reduce((t, s) => t + (s.giaBan || s.giaGoc) * s.soLuong, 0);

  // 1. XỬ LÝ KHI GIỎ HÀNG TRỐNG
  if (gioHang.length === 0) {
    return (
      <Container className="py-5 text-center">
        <div className="p-5 bg-white rounded-4 shadow-sm">
          <h1 className="display-1 text-muted mb-4">🛒</h1>
          <h3 className="fw-bold text-dark mb-3">Giỏ hàng của bạn đang trống!</h3>
          <p className="text-secondary mb-4">Hãy dạo một vòng và chọn những món ngon cho mình nhé.</p>
          <Link to="/">
            <Button variant="success" size="lg" className="rounded-pill fw-bold px-5 shadow">
              TIẾP TỤC MUA SẮM
            </Button>
          </Link>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      <Row>
        {/* 2. MENU BÊN TRÁI (Tương tự Home & Detail) */}
        <Col lg={2} className="d-none d-lg-block">
          <div className="bg-white rounded shadow-sm p-3 sticky-top" style={{top: '90px', zIndex: 1}}>
            <h6 className="fw-bold text-success border-bottom pb-2">DANH MỤC</h6>
            <div className="d-flex flex-column gap-2">
              {dsDanhMuc && dsDanhMuc.filter(d => !d.parent).map(d => (
                <Link key={d.id} to={`/category/${d.id}`} className="text-dark small hover-green text-decoration-none">
                  {d.icon} {d.ten}
                </Link>
              ))}
            </div>
          </div>
        </Col>

        {/* 3. NỘI DUNG GIỎ HÀNG (Ở GIỮA) */}
        <Col lg={6}>
          <div className="bg-white shadow-sm p-4 rounded-4 mb-3">
            <h5 className="fw-bold text-success mb-4 text-uppercase border-bottom pb-2">1. Danh sách sản phẩm</h5>
            <Table hover responsive className="align-middle">
              <tbody>
                {gioHang.map(i => (
                  <tr key={i.id}>
                    <td><img src={i.anh} width="60" height="60" style={{objectFit:'cover', borderRadius:'8px'}} alt=""/></td>
                    <td>
                      <div className="fw-bold">{i.ten}</div>
                      <small className="text-muted">{i.giaBan?.toLocaleString()} ¥</small>
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-2 border rounded-pill px-2" style={{width:'fit-content'}}>
                        <Button variant="link" size="sm" className="text-dark fw-bold text-decoration-none p-0" onClick={()=>chinhSuaSoLuong(i.id, 'giam')}>-</Button>
                        <span className="mx-1">{i.soLuong}</span>
                        <Button variant="link" size="sm" className="text-dark fw-bold text-decoration-none p-0" onClick={()=>chinhSuaSoLuong(i.id, 'tang')}>+</Button>
                      </div>
                    </td>
                    <td className="text-end fw-bold text-danger">{(i.giaBan * i.soLuong).toLocaleString()} ¥</td>
                    <td><Button variant="link" className="text-danger p-0" onClick={()=>xoaSanPham(i.id)}>🗑️</Button></td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>

          <div className="bg-white shadow-sm p-4 rounded-4">
            <h5 className="fw-bold text-success mb-4 text-uppercase border-bottom pb-2">2. Thông tin giao hàng</h5>
            <Form.Control className="mb-3 p-3 bg-light border-0" placeholder="Họ tên người nhận *" value={khach.ten} onChange={e => setKhach({...khach, ten: e.target.value})} />
            <Form.Control className="mb-3 p-3 bg-light border-0" placeholder="SĐT liên hệ *" value={khach.sdt} onChange={e => setKhach({...khach, sdt: e.target.value})} />
            <Form.Control as="textarea" rows={2} className="mb-3 p-3 bg-light border-0" placeholder="Địa chỉ giao hàng chi tiết *" value={khach.diachi} onChange={e => setKhach({...khach, diachi: e.target.value})} />
            
            {/* 4. THÊM Ô GHI CHÚ */}
            <Form.Control as="textarea" rows={2} className="mb-3 p-3 bg-light border-0" placeholder="Ghi chú thêm (Ví dụ: Giao giờ hành chính, gọi trước khi giao...)" value={khach.ghiChu} onChange={e => setKhach({...khach, ghiChu: e.target.value})} />

            {/* MAP */}
            <div className="map-container shadow-sm border rounded-3 overflow-hidden" style={{height:'200px'}}>
              <iframe 
                title="map" 
                src={`https://maps.google.com/maps?q=${encodeURIComponent(khach.diachi || 'Vietnam')}&output=embed`}
                width="100%" height="100%" style={{border:0}} loading="lazy"
              ></iframe>
            </div>
          </div>
        </Col>

        {/* 5. CỘT TỔNG TIỀN (BÊN PHẢI) - FIXED STICKY */}
        <Col lg={4}>
          <div className="bg-white p-4 rounded-4 border shadow sticky-top" style={{top: '100px', zIndex: 10}}>
            <h5 className="fw-bold mb-4 border-bottom pb-3">TỔNG KẾT ĐƠN HÀNG</h5>
            <div className="d-flex justify-content-between mb-2">
              <span className="text-muted">Tạm tính:</span>
              <span className="fw-bold">{tongTien.toLocaleString()} ¥</span>
            </div>
            <div className="d-flex justify-content-between mb-4">
              <span className="text-muted">Phí vận chuyển:</span>
              <span className="text-success">Miễn phí</span>
            </div>
            <div className="d-flex justify-content-between h3 fw-bold text-danger pt-3 border-top mb-4">
              <span>TỔNG CỘNG:</span>
              <span>{tongTien.toLocaleString()} ¥</span>
            </div>
            
            <Button variant="success" size="lg" className="w-100 py-3 fw-bold rounded-pill shadow mb-3" onClick={() => handleDatHang(khach)}>
              XÁC NHẬN ĐẶT HÀNG
            </Button>
            
            {/* 6. NÚT MUA THÊM SẢN PHẨM KHÁC */}
            <Link to="/" className="text-decoration-none">
              <Button variant="outline-secondary" className="w-100 py-2 fw-bold rounded-pill">
                ← MUA THÊM SẢN PHẨM KHÁC
              </Button>
            </Link>
          </div>
        </Col>
      </Row>
    </Container>
  );
}
export default Cart;