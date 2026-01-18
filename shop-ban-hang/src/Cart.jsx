import React, { useState } from 'react';
import { Table, Button, Form, Row, Col } from 'react-bootstrap';

function Cart({ gioHang, setGioHang }) {
  const [khach, setKhach] = useState({ ten: '', sdt: '', diachi: '' });
  const tongTien = gioHang.reduce((t, s) => t + s.giaBan * s.soLuong, 0);

  return (
    <Container className="py-5">
      <Row className="g-5">
        <Col lg={7}>
          <h4 className="fw-bold text-success mb-4 text-uppercase">Thông tin đặt hàng</h4>
          <Form.Control className="mb-3 p-3" placeholder="Họ và tên *" value={khach.ten} onChange={e => setKhach({...khach, ten: e.target.value})} />
          <Form.Control className="mb-3 p-3" placeholder="Số điện thoại *" value={khach.sdt} onChange={e => setKhach({...khach, sdt: e.target.value})} />
          <Form.Control as="textarea" rows={3} placeholder="Địa chỉ giao hàng đầy đủ *" value={khach.diachi} onChange={e => setKhach({...khach, diachi: e.target.value})} />
          <div className="map-container shadow-sm mt-3">
            <iframe title="map" src={`https://maps.google.com/maps?q=${encodeURIComponent(khach.diachi || 'Vietnam')}&output=embed`}></iframe>
          </div>
        </Col>
        <Col lg={5}>
          <div className="p-4 bg-light rounded border sticky-top" style={{top: '20px'}}>
            <h5 className="fw-bold mb-4">ĐƠN HÀNG</h5>
            {gioHang.map(i => (
              <div key={i.id} className="d-flex justify-content-between mb-2 small border-bottom pb-2">
                <span>{i.ten} x {i.soLuong}</span>
                <span className="fw-bold">{(i.giaBan * i.soLuong).toLocaleString()} ¥</span>
              </div>
            ))}
            <div className="d-flex justify-content-between h4 fw-bold text-danger mt-4 pt-3 border-top">
              <span>TỔNG CỘNG:</span>
              <span>{tongTien.toLocaleString()} ¥</span>
            </div>
            <Button variant="success" className="w-100 py-3 mt-4 fw-bold rounded-pill">XÁC NHẬN ĐẶT HÀNG</Button>
          </div>
        </Col>
      </Row>
    </Container>
  );
}

export default Cart;