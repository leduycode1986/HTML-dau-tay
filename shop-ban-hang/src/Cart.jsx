import React from 'react';
import { Table, Button, Container, Row, Col, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { toSlug } from './App';

function Cart({ gioHang, dsDanhMuc, chinhSuaSoLuong, xoaSanPham, currentUser }) {
  const tamTinh = gioHang.reduce((t, s) => t + (s.giaBan || s.giaGoc) * s.soLuong, 0);

  if (gioHang.length === 0) return (
    <Container className="py-5 text-center">
      <div className="p-5 bg-white rounded-4 shadow-sm">
        <h1 className="display-1 text-muted mb-4">🛒</h1>
        <h3 className="fw-bold text-dark mb-3">Giỏ hàng trống!</h3>
        <Link to="/"><Button variant="success" size="lg" className="rounded-pill px-5">TIẾP TỤC MUA SẮM</Button></Link>
      </div>
    </Container>
  );

  return (
    <Container className="py-4">
      <h2 className="fw-bold text-uppercase text-success mb-4"><i className="fa-solid fa-cart-shopping me-2"></i> Giỏ hàng của bạn</h2>
      <Row>
        <Col lg={8}>
          <div className="bg-white shadow-sm p-4 rounded-4 mb-3 table-responsive">
            <Table hover className="align-middle">
              <thead><tr><th>Sản phẩm</th><th>Đơn giá</th><th>Số lượng</th><th>Thành tiền</th><th>Xóa</th></tr></thead>
              <tbody>
                {gioHang.map(i => (
                  <tr key={i.id}>
                    <td>
                      <div className="d-flex align-items-center">
                        <img src={i.anh} width="60" height="60" style={{objectFit:'cover', borderRadius:'8px', marginRight:'10px'}} alt=""/>
                        <div>
                          <Link to={`/san-pham/${toSlug(i.ten)}/${i.id}`} className="fw-bold text-decoration-none text-dark">{i.ten}</Link>
                          <div className="small text-muted">Đơn vị: {i.donVi || 'Cái'}</div>
                        </div>
                      </div>
                    </td>
                    <td>{i.giaBan?.toLocaleString()} ¥</td>
                    <td>
                      <div className="d-flex align-items-center border rounded px-2" style={{width:'fit-content'}}>
                        <Button variant="link" size="sm" className="text-dark p-0" onClick={()=>chinhSuaSoLuong(i.id, 'giam')}>-</Button>
                        <span className="mx-2 fw-bold">{i.soLuong}</span>
                        <Button variant="link" size="sm" className="text-dark p-0" onClick={()=>chinhSuaSoLuong(i.id, 'tang')}>+</Button>
                      </div>
                    </td>
                    <td className="fw-bold text-danger">{(i.giaBan * i.soLuong).toLocaleString()} ¥</td>
                    <td><Button variant="link" className="text-danger p-0" onClick={()=>xoaSanPham(i.id)}><i className="fa-solid fa-trash"></i></Button></td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Col>
        <Col lg={4}>
          <div className="cart-summary-box bg-white p-4 rounded-4 shadow-sm border">
            <h5 className="fw-bold mb-3 border-bottom pb-2">CỘNG GIỎ HÀNG</h5>
            <div className="d-flex justify-content-between mb-3">
              <span className="text-muted">Tạm tính:</span>
              <span className="fw-bold fs-5">{tamTinh.toLocaleString()} ¥</span>
            </div>
            {!currentUser && <Alert variant="warning" className="small mb-3">Đăng nhập để tích điểm!</Alert>}
            <Link to="/checkout">
              <Button variant="success" size="lg" className="w-100 fw-bold rounded-pill shadow-sm">TIẾN HÀNH THANH TOÁN <i className="fa-solid fa-arrow-right ms-2"></i></Button>
            </Link>
            <Link to="/"><Button variant="outline-secondary" className="w-100 mt-2 rounded-pill fw-bold">MUA THÊM</Button></Link>
          </div>
        </Col>
      </Row>
    </Container>
  );
}
export default Cart;