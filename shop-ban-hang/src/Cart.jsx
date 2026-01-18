import React, { useState } from 'react';
import { Table, Button, Form, Row, Col, Container } from 'react-bootstrap';

function Cart({ gioHang, handleDatHang, chinhSuaSoLuong, xoaSanPham }) {
  const [khach, setKhach] = useState({ ten: '', sdt: '', diachi: '' });
  const tongTien = gioHang.reduce((t, s) => t + (s.giaBan || s.giaGoc) * s.soLuong, 0);
  return (
    <Container className="py-5 bg-white shadow-lg mt-3 rounded-4">
      <h3 className="fw-bold text-success mb-5 text-center text-uppercase border-bottom pb-3">Giỏ hàng của bạn</h3>
      <Row className="g-5">
        <Col lg={7}>
          <Table hover responsive className="align-middle border-bottom">
            <tbody>{gioHang.map(i => (
              <tr key={i.id}>
                <td><img src={i.anh} width="60" height="60" style={{objectFit:'cover', borderRadius:'8px'}} alt=""/></td>
                <td><div className="fw-bold">{i.ten}</div><small className="text-muted">{i.giaBan?.toLocaleString()} ¥</small></td>
                <td><div className="d-flex align-items-center gap-2 border rounded-pill px-2" style={{width:'fit-content'}}><Button variant="link" size="sm" className="text-dark fw-bold text-decoration-none" onClick={()=>chinhSuaSoLuong(i.id, 'giam')}>-</Button><span>{i.soLuong}</span><Button variant="link" size="sm" className="text-dark fw-bold text-decoration-none" onClick={()=>chinhSuaSoLuong(i.id, 'tang')}>+</Button></div></td>
                <td className="text-end fw-bold text-danger">{(i.giaBan * i.soLuong).toLocaleString()} ¥</td>
                <td><Button variant="link" className="text-danger" onClick={()=>xoaSanPham(i.id)}>🗑️</Button></td>
              </tr>
            ))}</tbody>
          </Table>
          <div className="mt-5 p-4 border rounded-4 bg-light shadow-sm">
            <h5 className="fw-bold mb-4 text-dark border-bottom pb-2">THÔNG TIN GIAO HÀNG</h5>
            <Form.Control className="mb-3 p-3 border-0 shadow-sm" placeholder="Họ tên người nhận *" value={khach.ten} onChange={e => setKhach({...khach, ten: e.target.value})} />
            <Form.Control className="mb-3 p-3 border-0 shadow-sm" placeholder="SĐT liên hệ *" value={khach.sdt} onChange={e => setKhach({...khach, sdt: e.target.value})} />
            <Form.Control as="textarea" rows={3} className="mb-3 p-3 border-0 shadow-sm" placeholder="Địa chỉ giao hàng chi tiết *" value={khach.diachi} onChange={e => setKhach({...khach, diachi: e.target.value})} />
            <div className="map-container shadow-sm border rounded-3"><iframe title="map" src={`https://maps.google.com/maps?q=${encodeURIComponent(khach.diachi || 'Vietnam')}&output=embed`}></iframe></div>
          </div>
        </Col>
        <Col lg={5}><div className="p-4 bg-light rounded-4 border shadow sticky-top" style={{top: '20px'}}><h4 className="fw-bold mb-4 border-bottom pb-3">HÓA ĐƠN TỔNG</h4><div className="d-flex justify-content-between h3 fw-bold text-danger pt-2 mb-4"><span>TỔNG CỘNG:</span><span>{tongTien.toLocaleString()} ¥</span></div><Button variant="success" className="w-100 py-3 mt-4 fw-bold rounded-pill shadow" onClick={() => handleDatHang(khach)}>XÁC NHẬN ĐẶT HÀNG</Button></div></Col>
      </Row>
    </Container>
  );
}
export default Cart;