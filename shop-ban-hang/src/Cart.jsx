import React, { useState } from 'react';
import { Table, Button, Form, Row, Col, Container, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';

function Cart({ gioHang, dsDanhMuc, handleDatHang, chinhSuaSoLuong, xoaSanPham, currentUser, userData }) {
  // Tự động điền thông tin nếu khách đã đăng nhập
  const [khach, setKhach] = useState({ 
    ten: userData?.ten || '', 
    sdt: userData?.sdt || '', 
    diachi: userData?.diachi || '', 
    ghiChu: '' 
  });
  
  const [openMenuId, setOpenMenuId] = useState(null); // Cho menu dọc
  const tongTien = gioHang.reduce((t, s) => t + (s.giaBan || s.giaGoc) * s.soLuong, 0);

  if (gioHang.length === 0) {
    return (
      <Container className="py-5 text-center">
        <div className="p-5 bg-white rounded-4 shadow-sm">
          <h1 className="display-1 text-muted mb-4">🛒</h1>
          <h3 className="fw-bold text-dark mb-3">Giỏ hàng của bạn đang trống!</h3>
          <p className="text-secondary mb-4">Hãy dạo một vòng và chọn những món ngon cho mình nhé.</p>
          <Link to="/"><Button variant="success" size="lg" className="rounded-pill fw-bold px-5 shadow">TIẾP TỤC MUA SẮM</Button></Link>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      <Row>
        {/* --- MENU TRÁI (ĐÃ LÀM ĐẸP & STICKY) --- */}
        <Col lg={2} className="d-none d-lg-block">
          <div className="sidebar-main shadow-sm bg-white rounded overflow-hidden">
            <div className="bg-success text-white p-3 fw-bold text-center text-uppercase"><i className="fa-solid fa-bars me-2"></i> DANH MỤC</div>
            <div className="category-list p-2">
              {dsDanhMuc.filter(d => !d.parent).map(parent => {
                const hasChild = dsDanhMuc.some(c => c.parent === parent.id);
                const isOpen = openMenuId === parent.id;
                return (
                  <div key={parent.id} className="mb-1 border-bottom">
                    <div className="d-flex align-items-center justify-content-between p-2 text-dark">
                      <Link to={`/category/${parent.id}`} className="text-decoration-none text-dark flex-grow-1 d-flex align-items-center" style={{fontSize:'0.95rem', fontWeight:'500'}}><span className="me-2">{parent.icon || '📦'}</span> {parent.ten}</Link>
                      {hasChild && <span onClick={(e) => { e.preventDefault(); setOpenMenuId(isOpen ? null : parent.id); }} style={{cursor: 'pointer', padding: '0 10px', color: '#888', fontSize:'0.8rem'}}>{isOpen ? '▲' : '▼'}</span>}
                    </div>
                    {hasChild && isOpen && <div className="ms-3 ps-2 border-start bg-light rounded">{dsDanhMuc.filter(c => c.parent === parent.id).map(child => (<Link key={child.id} to={`/category/${child.id}`} className="d-block py-1 px-2 text-decoration-none text-secondary small hover-green">↳ {child.ten}</Link>))}</div>}
                  </div>
                );
              })}
            </div>
          </div>
        </Col>

        {/* CỘT GIỮA: GIỎ HÀNG */}
        <Col lg={6}>
          <div className="bg-white shadow-sm p-4 rounded-4 mb-3">
            <h5 className="fw-bold text-success mb-4 text-uppercase border-bottom pb-2">1. Danh sách sản phẩm</h5>
            <Table hover responsive className="align-middle">
              <tbody>
                {gioHang.map(i => (
                  <tr key={i.id}>
                    <td><img src={i.anh} width="60" height="60" style={{objectFit:'cover', borderRadius:'8px'}} alt=""/></td>
                    <td><div className="fw-bold">{i.ten}</div><small className="text-muted">{i.giaBan?.toLocaleString()} ¥</small></td>
                    <td><div className="d-flex align-items-center gap-2 border rounded-pill px-2" style={{width:'fit-content'}}><Button variant="link" size="sm" className="text-dark fw-bold text-decoration-none p-0" onClick={()=>chinhSuaSoLuong(i.id, 'giam')}>-</Button><span className="mx-1">{i.soLuong}</span><Button variant="link" size="sm" className="text-dark fw-bold text-decoration-none p-0" onClick={()=>chinhSuaSoLuong(i.id, 'tang')}>+</Button></div></td>
                    <td className="text-end fw-bold text-danger">{(i.giaBan * i.soLuong).toLocaleString()} ¥</td>
                    <td><Button variant="link" className="text-danger p-0" onClick={()=>xoaSanPham(i.id)}>🗑️</Button></td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>

          <div className="bg-white shadow-sm p-4 rounded-4">
            <h5 className="fw-bold text-success mb-4 text-uppercase border-bottom pb-2">2. Thông tin giao hàng</h5>
            {!currentUser && <Alert variant="warning" className="small"><i className="fa-solid fa-triangle-exclamation"></i> Bạn chưa đăng nhập. Hãy <Link to="/auth" className="fw-bold">đăng nhập</Link> để tích điểm nhé!</Alert>}
            
            <Form.Control className="mb-3 p-3 bg-light border-0" placeholder="Họ tên người nhận *" value={khach.ten} onChange={e => setKhach({...khach, ten: e.target.value})} />
            <Form.Control className="mb-3 p-3 bg-light border-0" placeholder="SĐT liên hệ *" value={khach.sdt} onChange={e => setKhach({...khach, sdt: e.target.value})} />
            <Form.Control as="textarea" rows={2} className="mb-3 p-3 bg-light border-0" placeholder="Địa chỉ giao hàng chi tiết *" value={khach.diachi} onChange={e => setKhach({...khach, diachi: e.target.value})} />
            <Form.Control as="textarea" rows={2} className="mb-3 p-3 bg-light border-0" placeholder="Ghi chú thêm..." value={khach.ghiChu} onChange={e => setKhach({...khach, ghiChu: e.target.value})} />
          </div>
        </Col>

        {/* CỘT PHẢI: TỔNG TIỀN (STICKY) */}
        <Col lg={4}>
          <div className="bg-white p-4 rounded-4 border shadow sticky-top" style={{top: '100px', zIndex: 10}}>
            <h5 className="fw-bold mb-4 border-bottom pb-3">TỔNG KẾT</h5>
            <div className="d-flex justify-content-between h3 fw-bold text-danger pt-3 border-top mb-4"><span>TỔNG CỘNG:</span><span>{tongTien.toLocaleString()} ¥</span></div>
            <Button variant="success" size="lg" className="w-100 py-3 fw-bold rounded-pill shadow mb-3" onClick={() => handleDatHang(khach)}>XÁC NHẬN ĐẶT HÀNG</Button>
            <Link to="/"><Button variant="outline-secondary" className="w-100 py-2 fw-bold rounded-pill">← MUA THÊM SẢN PHẨM KHÁC</Button></Link>
          </div>
        </Col>
      </Row>
    </Container>
  );
}
export default Cart;