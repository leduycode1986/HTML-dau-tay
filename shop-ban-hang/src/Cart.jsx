import React, { useState } from 'react';
import { Table, Button, Form, Row, Col, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import SEO from './SEO';

function Cart({ gioHang, chinhSuaSoLuong, xoaSanPham, handleDatHang }) {
  const tongTien = gioHang.reduce((t, s) => t + (s.giaBan || 0) * s.soLuong, 0);
  
  // Thông tin khách hàng đầy đủ hơn
  const [khach, setKhach] = useState({
    ten: '',
    sdt: '',
    email: '',
    diachi: '',
    ghiChu: ''
  });

  if (!gioHang.length) return (
    <div className="text-center p-5 bg-white rounded shadow-sm border mt-4">
      <i className="fa-solid fa-cart-shopping fs-1 text-muted mb-3"></i>
      <h4>Giỏ hàng đang trống!</h4>
      <Link to="/" className="btn btn-success mt-3 px-4">Quay lại mua sắm</Link>
    </div>
  );

  return (
    <div className="p-0">
      <SEO title="Thanh Toán Giỏ Hàng" />
      
      <div className="cart-wrapper border">
        {/* PHẦN 1: DANH SÁCH SẢN PHẨM */}
        <div className="p-4">
          <h4 className="fw-bold text-success mb-4 text-uppercase">
            <i className="fa-solid fa-list-check me-2"></i> Đơn hàng của bạn
          </h4>
          <Table responsive className="align-middle">
            <thead className="table-light">
              <tr>
                <th>Sản phẩm</th>
                <th className="text-center">Đơn giá</th>
                <th className="text-center">Số lượng</th>
                <th className="text-end">Thành tiền</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {gioHang.map(sp => (
                <tr key={sp.id}>
                  <td>
                    <div className="d-flex align-items-center gap-3">
                      <img src={sp.anh} width="60" height="60" className="rounded border object-fit-cover" alt="" />
                      <span className="fw-bold">{sp.ten}</span>
                    </div>
                  </td>
                  <td className="text-center">{sp.giaBan?.toLocaleString()} ¥</td>
                  <td className="text-center">
                    <div className="d-inline-flex align-items-center border rounded-pill px-2">
                      <Button variant="link" className="text-dark p-1" onClick={() => chinhSuaSoLuong(sp.id, 'giam')}>-</Button>
                      <span className="fw-bold px-2">{sp.soLuong}</span>
                      <Button variant="link" className="text-dark p-1" onClick={() => chinhSuaSoLuong(sp.id, 'tang')}>+</Button>
                    </div>
                  </td>
                  <td className="text-end fw-bold text-danger">{(sp.giaBan * sp.soLuong).toLocaleString()} ¥</td>
                  <td className="text-end">
                    <Button variant="link" className="text-danger" onClick={() => xoaSanPham(sp.id)}>
                      <i className="fa-solid fa-trash-can"></i>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>

        {/* PHẦN 2: THÔNG TIN KHÁCH HÀNG & BẢN ĐỒ */}
        <div className="checkout-form-container">
          <Row className="g-5">
            <Col lg={7}>
              <h5 className="fw-bold text-dark mb-4 text-uppercase">Thông tin giao hàng</h5>
              <Row>
                <Col md={6} className="mb-3">
                  <label className="form-label-bold">Họ và Tên *</label>
                  <Form.Control 
                    placeholder="Nhập họ tên người nhận" 
                    value={khach.ten}
                    onChange={e => setKhach({...khach, ten: e.target.value})}
                  />
                </Col>
                <Col md={6} className="mb-3">
                  <label className="form-label-bold">Số điện thoại *</label>
                  <Form.Control 
                    placeholder="VD: 090xxxxxxx" 
                    value={khach.sdt}
                    onChange={e => setKhach({...khach, sdt: e.target.value})}
                  />
                </Col>
                <Col md={12} className="mb-3">
                  <label className="form-label-bold">Email (Để nhận hóa đơn)</label>
                  <Form.Control 
                    type="email"
                    placeholder="example@gmail.com" 
                    value={khach.email}
                    onChange={e => setKhach({...khach, email: e.target.value})}
                  />
                </Col>
                <Col md={12} className="mb-3">
                  <label className="form-label-bold">Địa chỉ giao hàng (Tích hợp Google Maps) *</label>
                  <Form.Control 
                    as="textarea" 
                    rows={2} 
                    placeholder="Số nhà, tên đường, Phường/Xã, Quận/Huyện..." 
                    value={khach.diachi}
                    onChange={e => setKhach({...khach, diachi: e.target.value})}
                  />
                  
                  {/* TÍCH HỢP GOOGLE MAPS DỰA TRÊN ĐỊA CHỈ NHẬP LIỆU */}
                  <div className="map-container shadow-sm mt-3">
                    <iframe
                      title="Google Maps"
                      src={`https://maps.google.com/maps?q=${encodeURIComponent(khach.diachi || 'Việt Nam')}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                    ></iframe>
                  </div>
                </Col>
                <Col md={12}>
                  <label className="form-label-bold">Ghi chú đơn hàng</label>
                  <Form.Control 
                    as="textarea" 
                    rows={2} 
                    placeholder="Ví dụ: Giao giờ hành chính, gọi trước khi đến..." 
                    value={khach.ghiChu}
                    onChange={e => setKhach({...khach, ghiChu: e.target.value})}
                  />
                </Col>
              </Row>
            </Col>

            <Col lg={5}>
              <div className="summary-card h-100 d-flex flex-column justify-content-between shadow-sm">
                <div>
                  <h5 className="fw-bold text-success border-bottom border-success pb-2 mb-4">TÓM TẮT ĐƠN HÀNG</h5>
                  <div className="d-flex justify-content-between mb-3">
                    <span>Số lượng mặt hàng:</span>
                    <span className="fw-bold">{gioHang.reduce((t,s) => t + s.soLuong, 0)}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-3">
                    <span>Tạm tính:</span>
                    <span className="fw-bold">{tongTien.toLocaleString()} ¥</span>
                  </div>
                  <div className="d-flex justify-content-between mb-3">
                    <span>Phí vận chuyển:</span>
                    <span className="text-success fw-bold">Miễn phí</span>
                  </div>
                </div>
                
                <div className="mt-4">
                  <div className="d-flex justify-content-between h3 fw-bold text-danger border-top border-success pt-3 mb-4">
                    <span>TỔNG CỘNG:</span>
                    <span>{tongTien.toLocaleString()} ¥</span>
                  </div>
                  <Button 
                    variant="success" 
                    className="w-100 py-3 fw-bold rounded-pill shadow"
                    onClick={() => {
                      if(!khach.ten || !khach.sdt || !khach.diachi) return alert("Vui lòng nhập đầy đủ thông tin bắt buộc (*)");
                      handleDatHang(khach, gioHang, tongTien);
                    }}
                  >
                    XÁC NHẬN ĐẶT HÀNG NGAY
                  </Button>
                  <p className="text-center text-muted small mt-3 italic">
                    * Vui lòng kiểm tra kỹ địa chỉ trên bản đồ trước khi đặt.
                  </p>
                </div>
              </div>
            </Col>
          </Row>
        </div>
      </div>
    </div>
  );
}

export default Cart;