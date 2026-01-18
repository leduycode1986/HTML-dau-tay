import React, { useState } from 'react';
import { Table, Button, Form, Row, Col, Card } from 'react-bootstrap';
import SEO from './SEO';

function Cart({ gioHang, chinhSuaSoLuong, xoaSanPham, handleDatHang }) {
  const tong = gioHang.reduce((t, s) => t + (s.giaBan || 0) * s.soLuong, 0);
  const [khach, setKhach] = useState({ ten: '', sdt: '', diachi: '' });

  // Hàm tạo link bản đồ nhanh dựa trên địa chỉ nhập vào
  const getMapUrl = (address) => {
    return `https://www.google.com/maps/embed/v1/place?key=YOUR_GOOGLE_MAPS_API_KEY&q=${encodeURIComponent(address || 'Ho Chi Minh City')}`;
    // Lưu ý: Để hiện bản đồ thật, bạn cần thay YOUR_GOOGLE_MAPS_API_KEY bằng mã của bạn. 
    // Nếu không có mã, ta sẽ dùng link xem trực tiếp phía dưới.
  };

  if (!gioHang.length) return (
    <div className="text-center p-5 bg-white rounded shadow-sm border mt-4">
      <i className="fa-solid fa-cart-shopping fs-1 text-muted mb-3"></i>
      <h4>Giỏ hàng của bạn đang trống!</h4>
      <Button variant="success" href="/" className="mt-3">Tiếp tục mua sắm</Button>
    </div>
  );

  return (
    <div className="p-0">
      <SEO title="Giỏ Hàng" />
      
      <div className="cart-page-wrapper border">
        {/* PHẦN 1: BẢNG SẢN PHẨM (NẰM TRÊN) */}
        <div className="p-4">
          <h4 className="fw-bold text-success mb-4 text-uppercase">
            <i className="fa-solid fa-basket-shopping me-2"></i> Danh sách sản phẩm
          </h4>
          <Table responsive className="align-middle cart-table">
            <thead>
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
                      <img src={sp.anh} width="60" height="60" className="rounded border" style={{objectFit:'cover'}} />
                      <span className="fw-bold">{sp.ten}</span>
                    </div>
                  </td>
                  <td className="text-center">{sp.giaBan?.toLocaleString()} ¥</td>
                  <td className="text-center">
                    <div className="d-inline-flex align-items-center border rounded">
                      <Button variant="link" className="text-dark py-0" onClick={()=>chinhSuaSoLuong(sp.id,'giam')}>-</Button>
                      <span className="fw-bold px-2">{sp.soLuong}</span>
                      <Button variant="link" className="text-dark py-0" onClick={()=>chinhSuaSoLuong(sp.id,'tang')}>+</Button>
                    </div>
                  </td>
                  <td className="text-end fw-bold text-danger">{(sp.giaBan*sp.soLuong).toLocaleString()} ¥</td>
                  <td className="text-end">
                    <Button variant="link" className="text-danger" onClick={()=>xoaSanPham(sp.id)}>
                      <i className="fa-solid fa-trash"></i>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>

        {/* PHẦN 2: THÔNG TIN KHÁCH HÀNG (NẰM DƯỚI) */}
        <div className="checkout-section">
          <Row className="g-5">
            <Col lg={7}>
              <h5 className="fw-bold text-dark mb-4 text-uppercase">Thông tin giao hàng</h5>
              <Row>
                <Col md={6} className="mb-3">
                  <Form.Label className="small fw-bold text-muted">HỌ VÀ TÊN</Form.Label>
                  <Form.Control 
                    placeholder="Nhập tên người nhận" 
                    onChange={e => setKhach({...khach, ten: e.target.value})}
                  />
                </Col>
                <Col md={6} className="mb-3">
                  <Form.Label className="small fw-bold text-muted">SỐ ĐIỆN THOẠI</Form.Label>
                  <Form.Control 
                    placeholder="VD: 0901234567" 
                    onChange={e => setKhach({...khach, sdt: e.target.value})}
                  />
                </Col>
                <Col md={12} className="mb-3">
                  <Form.Label className="small fw-bold text-muted">ĐỊA CHỈ GIAO HÀNG (GOOGLE MAPS)</Form.Label>
                  <Form.Control 
                    as="textarea" 
                    rows={2} 
                    placeholder="Số nhà, tên đường, phường/xã..." 
                    onChange={e => setKhach({...khach, diachi: e.target.value})}
                  />
                  
                  {/* TÍCH HỢP XEM TRƯỚC VỊ TRÍ TRÊN BẢN ĐỒ */}
                  <div className="map-container shadow-sm">
                    <iframe
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      style={{ border: 0 }}
                      src={`https://maps.google.com/maps?q=${encodeURIComponent(khach.diachi || 'Viet Nam')}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                      allowFullScreen
                    ></iframe>
                  </div>
                </Col>
              </Row>
            </Col>

            <Col lg={5}>
              <div className="cart-summary-box shadow-sm h-100 d-flex flex-column justify-content-between">
                <div>
                  <h5 className="fw-bold text-success border-bottom border-success pb-2 mb-4">TỔNG KẾT ĐƠN HÀNG</h5>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Số lượng sản phẩm:</span>
                    <span className="fw-bold">{gioHang.reduce((t,s)=>t+s.soLuong, 0)}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-4">
                    <span>Phí vận chuyển:</span>
                    <span className="text-success fw-bold">Miễn phí</span>
                  </div>
                </div>
                
                <div>
                  <div className="d-flex justify-content-between h3 fw-bold text-danger border-top border-success pt-3 mb-4">
                    <span>THÀNH TIỀN:</span>
                    <span>{tong.toLocaleString()} ¥</span>
                  </div>
                  <Button 
                    variant="success" 
                    className="w-100 py-3 fw-bold rounded-pill shadow" 
                    onClick={()=>handleDatHang(khach, gioHang, tong)}
                  >
                    XÁC NHẬN ĐẶT HÀNG NGAY
                  </Button>
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