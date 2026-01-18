import React, { useState } from 'react';
import { Table, Button, Form, Row, Col, Container } from 'react-bootstrap';

function Cart({ gioHang, handleDatHang, chinhSuaSoLuong, xoaSanPham }) {
  const [khach, setKhach] = useState({ ten: '', sdt: '', diachi: '' });
  const tongTien = gioHang.reduce((t, s) => t + s.giaBan * s.soLuong, 0);
  return (
    <Container className="py-5 bg-white shadow-sm mt-3 rounded">
      <h4 className="fw-bold text-success mb-4 text-uppercase">Giỏ hàng của bạn</h4>
      <Row className="g-5">
        <Col lg={7}>
          <Table responsive className="align-middle">
            <tbody>{gioHang.map(i => (
              <tr key={i.id}>
                <td><img src={i.anh} width="50" height="50" style={{objectFit:'cover'}} alt=""/></td>
                <td><b>{i.ten}</b></td>
                <td>{i.giaBan?.toLocaleString()} ¥</td>
                <td><div className="d-flex align-items-center gap-2"><Button variant="link" size="sm" onClick={()=>chinhSuaSoLuong(i.id, 'giam')}>-</Button><span>{i.soLuong}</span><Button variant="link" size="sm" onClick={()=>chinhSuaSoLuong(i.id, 'tang')}>+</Button></div></td>
                <td><Button variant="link" className="text-danger" onClick={()=>xoaSanPham(i.id)}>Xóa</Button></td>
              </tr>
            ))}</tbody>
          </Table>
          <Form.Control className="mb-3 p-3 shadow-sm" placeholder="Họ tên *" value={khach.ten} onChange={e => setKhach({...khach, ten: e.target.value})} />
          <Form.Control className="mb-3 p-3 shadow-sm" placeholder="SĐT *" value={khach.sdt} onChange={e => setKhach({...khach, sdt: e.target.value})} />
          <Form.Control as="textarea" rows={3} className="mb-3 shadow-sm" placeholder="Địa chỉ đầy đủ *" value={khach.diachi} onChange={e => setKhach({...khach, diachi: e.target.value})} />
          <div className="map-container shadow-sm"><iframe title="m" src={`https://maps.google.com/maps?q=${encodeURIComponent(khach.diachi || 'Ho Chi Minh')}&output=embed`}></iframe></div>
        </Col>
        <Col lg={5}><div className="p-4 bg-light rounded border sticky-top" style={{top: '20px'}}><h5 className="fw-bold mb-4">THANH TOÁN</h5><div className="d-flex justify-content-between h4 fw-bold text-danger pt-3 border-top"><span>TỔNG CỘNG:</span><span>{tongTien.toLocaleString()} ¥</span></div><Button variant="success" className="w-100 py-3 mt-4 fw-bold rounded-pill shadow" onClick={() => handleDatHang(khach)}>ĐẶT HÀNG</Button></div></Col>
      </Row>
    </Container>
  );
}
export default Cart;