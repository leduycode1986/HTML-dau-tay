import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

function Cart({ gioHang, chinhSuaSoLuong, xoaSanPham, xoaHetGioHang, colors, handleDatHang }) {
  const tongTien = gioHang.reduce((total, sp) => {
      const giaSo = parseInt(sp.gia.replace(/\./g, '').replace(' VNĐ', ''));
      return total + (giaSo * sp.soLuong);
  }, 0);

  // Form thông tin khách hàng
  const [khachHang, setKhachHang] = useState({ ten: '', sdt: '', diachi: '', ghiChu: '' });

  function xuLyDatHang() {
      if (gioHang.length === 0) return alert("Giỏ hàng đang trống!");
      if (!khachHang.ten || !khachHang.sdt || !khachHang.diachi) return alert("Vui lòng điền đủ Tên, SĐT và Địa chỉ!");
      
      // Gọi hàm từ App.jsx truyền xuống
      handleDatHang(khachHang, gioHang, tongTien);
  }

  if (gioHang.length === 0) {
    return (
        <Container style={{textAlign: 'center', marginTop: '50px'}}>
            <h3>🛒 Giỏ hàng trống trơn!</h3>
            <p>Hãy dạo một vòng chợ và chọn món ngon nhé.</p>
            <Link to="/"><Button variant="success">Quay lại mua sắm</Button></Link>
        </Container>
    )
  }

  return (
    <Container style={{ marginTop: '20px', background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
      <h2 style={{color: colors.primaryGreen, borderBottom: '2px solid #eee', paddingBottom: '10px'}}>🛒 Giỏ Hàng Của Bạn</h2>
      
      <Row>
          {/* CỘT TRÁI: DANH SÁCH HÀNG */}
          <Col md={8}>
              <Table responsive>
                <thead><tr><th>Sản phẩm</th><th>Giá</th><th>SL</th><th>Tổng</th><th>Xóa</th></tr></thead>
                <tbody>
                  {gioHang.map(sp => {
                      const giaSo = parseInt(sp.gia.replace(/\./g, '').replace(' VNĐ', ''));
                      return (
                        <tr key={sp.id} style={{verticalAlign: 'middle'}}>
                          <td>
                              <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                                  <img src={sp.anh} width="50" style={{borderRadius: '5px'}} />
                                  <span>{sp.ten}</span>
                              </div>
                          </td>
                          <td>{sp.gia}</td>
                          <td>
                              <Button size="sm" variant="light" onClick={() => chinhSuaSoLuong(sp.id, 'giam')}>-</Button>
                              <span style={{margin: '0 10px', fontWeight: 'bold'}}>{sp.soLuong}</span>
                              <Button size="sm" variant="light" onClick={() => chinhSuaSoLuong(sp.id, 'tang')}>+</Button>
                          </td>
                          <td style={{fontWeight: 'bold'}}>{(giaSo * sp.soLuong).toLocaleString('vi-VN')} đ</td>
                          <td><Button size="sm" variant="danger" onClick={() => xoaSanPham(sp.id)}>X</Button></td>
                        </tr>
                      )
                  })}
                </tbody>
              </Table>
              <div style={{textAlign: 'right'}}>
                  <Button variant="outline-danger" size="sm" onClick={xoaHetGioHang}>🗑️ Xóa hết</Button>
              </div>
          </Col>

          {/* CỘT PHẢI: THÔNG TIN THANH TOÁN */}
          <Col md={4}>
              <div style={{backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '10px'}}>
                  <h5 style={{fontWeight: 'bold'}}>📋 Thông tin giao hàng</h5>
                  <Form>
                      <Form.Group className="mb-2"><Form.Control placeholder="Họ và tên" value={khachHang.ten} onChange={e => setKhachHang({...khachHang, ten: e.target.value})} /></Form.Group>
                      <Form.Group className="mb-2"><Form.Control placeholder="Số điện thoại" value={khachHang.sdt} onChange={e => setKhachHang({...khachHang, sdt: e.target.value})} /></Form.Group>
                      <Form.Group className="mb-2"><Form.Control placeholder="Địa chỉ nhận hàng" value={khachHang.diachi} onChange={e => setKhachHang({...khachHang, diachi: e.target.value})} /></Form.Group>
                      <Form.Group className="mb-3"><Form.Control as="textarea" rows={2} placeholder="Ghi chú (vd: Giao giờ hành chính)" value={khachHang.ghiChu} onChange={e => setKhachHang({...khachHang, ghiChu: e.target.value})} /></Form.Group>
                  </Form>
                  
                  <div style={{borderTop: '1px dashed #ccc', margin: '15px 0'}}></div>
                  <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 'bold'}}>
                      <span>Tổng tiền:</span>
                      <span style={{color: 'red'}}>{tongTien.toLocaleString('vi-VN')} VNĐ</span>
                  </div>

                  <Button variant="warning" onClick={xuLyDatHang} style={{width: '100%', marginTop: '20px', fontWeight: 'bold', fontSize: '18px'}}>
                      🚀 ĐẶT HÀNG NGAY
                  </Button>
              </div>
          </Col>
      </Row>
    </Container>
  )
}

export default Cart