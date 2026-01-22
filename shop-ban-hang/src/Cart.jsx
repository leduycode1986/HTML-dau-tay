import React from 'react';
import { Table, Button, Container, Row, Col, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { toSlug } from './App';

function Cart({ gioHang, chinhSuaSoLuong, xoaSanPham, currentUser }) {
  const tamTinh = gioHang.reduce((t, s) => t + (s.giaBan || s.giaGoc) * s.soLuong, 0);

  if (gioHang.length === 0) return (
    <Container className="py-5 text-center">
      <div className="p-5 bg-white rounded shadow-sm">
        <h2 className="text-muted display-4 mb-3"><i className="fa-solid fa-cart-arrow-down"></i></h2>
        <h3>Giỏ hàng của bạn đang trống</h3>
        <p className="text-secondary">Hãy dạo một vòng và chọn những món ngon nhé!</p>
        <Link to="/"><Button variant="success" size="lg" className="rounded-pill px-5 fw-bold mt-3">TIẾP TỤC MUA SẮM</Button></Link>
      </div>
    </Container>
  );

  return (
    <Container className="py-4">
      <h3 className="fw-bold text-success text-uppercase mb-4"><i className="fa-solid fa-cart-shopping me-2"></i> Giỏ hàng của bạn</h3>
      <Row>
        <Col lg={8}>
          <div className="bg-white rounded shadow-sm border overflow-hidden mb-4">
            <Table responsive className="mb-0 align-middle">
              <thead className="cart-header bg-light"><tr><th className="ps-4">Sản phẩm</th><th>Đơn giá</th><th>Số lượng</th><th>Thành tiền</th><th>Xóa</th></tr></thead>
              <tbody>
                {gioHang.map(i => (
                  <tr key={i.id}>
                    <td className="ps-4">
                      <div className="d-flex align-items-center">
                        <img src={i.anh} width="70" height="70" className="rounded border me-3" style={{objectFit:'cover'}} />
                        <div>
                          <Link to={`/san-pham/${toSlug(i.ten)}`} className="fw-bold text-dark text-decoration-none d-block mb-1">{i.ten}</Link>
                          <span className="badge bg-light text-secondary border">Đơn vị: {i.donVi || 'Cái'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="fw-bold text-secondary">{i.giaBan?.toLocaleString()} ¥</td>
                    <td>
                      <div className="d-flex border rounded" style={{width: 100}}>
                        <Button variant="light" size="sm" onClick={()=>chinhSuaSoLuong(i.id,'giam')}>-</Button>
                        <div className="flex-grow-1 text-center py-1 fw-bold bg-white">{i.soLuong}</div>
                        <Button variant="light" size="sm" onClick={()=>chinhSuaSoLuong(i.id,'tang')}>+</Button>
                      </div>
                    </td>
                    <td className="fw-bold text-danger">{(i.giaBan * i.soLuong).toLocaleString()} ¥</td>
                    <td><Button variant="link" className="text-danger" onClick={()=>xoaSanPham(i.id)}><i className="fa-solid fa-trash-can"></i></Button></td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
          <Link to="/"><Button variant="outline-secondary" className="fw-bold"><i className="fa-solid fa-arrow-left me-2"></i> Tiếp tục xem sản phẩm</Button></Link>
        </Col>
        <Col lg={4}>
          <div className="bg-white p-4 rounded shadow-sm border">
            <h5 className="fw-bold text-uppercase border-bottom pb-3 mb-3">Cộng giỏ hàng</h5>
            <div className="d-flex justify-content-between mb-3"><span className="text-secondary">Tạm tính:</span><span className="fw-bold">{tamTinh.toLocaleString()} ¥</span></div>
            <div className="d-flex justify-content-between mb-4"><span className="text-secondary">Phí ship:</span><span className="text-muted small">(Tính ở bước sau)</span></div>
            <div className="d-flex justify-content-between border-top pt-3 mb-4"><span className="h5 fw-bold">TỔNG CỘNG:</span><span className="h4 text-danger fw-bold">{tamTinh.toLocaleString()} ¥</span></div>
            <Link to="/checkout"><Button variant="success" size="lg" className="w-100 fw-bold rounded shadow-sm">TIẾN HÀNH THANH TOÁN <i className="fa-solid fa-arrow-right ms-2"></i></Button></Link>
            {!currentUser && <Alert variant="warning" className="mt-3 small mb-0"><i className="fa-solid fa-triangle-exclamation me-1"></i> Bạn chưa đăng nhập. Hãy <Link to="/auth" className="fw-bold text-dark">đăng nhập</Link> để tích điểm nhé!</Alert>}
          </div>
        </Col>
      </Row>
    </Container>
  );
}
export default Cart;