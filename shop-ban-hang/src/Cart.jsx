import React, { useState } from 'react';
import { Table, Button, Form, Row, Col, Card } from 'react-bootstrap';
import SEO from './SEO';

function Cart({ gioHang, chinhSuaSoLuong, xoaSanPham, handleDatHang }) {
  const tong = gioHang.reduce((t, s) => t + (s.giaBan||0)*s.soLuong, 0);
  const [khach, setKhach] = useState({ ten: '', sdt: '', diachi: '' });

  if (!gioHang.length) return (
      <div className="text-center p-5 bg-white rounded shadow-sm border mt-4 mx-2">
          <i className="fa-solid fa-cart-shopping fs-1 text-muted mb-3"></i>
          <h4>Giỏ hàng của bạn đang trống!</h4>
          <Link to="/" className="btn btn-success mt-3">Quay lại mua sắm ngay</Link>
      </div>
  );

  return (
    <div className="p-2">
       <SEO title="Giỏ Hàng" />
       <h3 className="fw-bold text-success mb-4 text-uppercase">Giỏ hàng của bạn</h3>
       <Row className="g-4">
         <Col lg={8}>
            <div className="bg-white rounded shadow-sm overflow-hidden border">
                <Table responsive className="m-0 align-middle">
                    <thead className="table-light">
                        <tr><th>Sản phẩm</th><th>Giá</th><th>Số lượng</th><th>Tổng</th><th></th></tr>
                    </thead>
                    <tbody>{gioHang.map(sp => (
                        <tr key={sp.id}>
                            <td>
                                <div className="d-flex align-items-center gap-3">
                                    <img src={sp.anh} width="60" height="60" className="rounded border" style={{objectFit:'cover'}} />
                                    <span className="fw-bold">{sp.ten}</span>
                                </div>
                            </td>
                            <td>{sp.giaBan?.toLocaleString()} ¥</td>
                            <td>
                                <div className="d-flex align-items-center gap-2">
                                    <Button variant="outline-secondary" size="sm" onClick={()=>chinhSuaSoLuong(sp.id,'giam')}>-</Button>
                                    <span className="fw-bold px-2">{sp.soLuong}</span>
                                    <Button variant="outline-secondary" size="sm" onClick={()=>chinhSuaSoLuong(sp.id,'tang')}>+</Button>
                                </div>
                            </td>
                            <td className="fw-bold text-danger">{(sp.giaBan*sp.soLuong).toLocaleString()} ¥</td>
                            <td><Button variant="link" className="text-danger p-0" onClick={()=>xoaSanPham(sp.id)}><i className="fa-solid fa-trash"></i></Button></td>
                        </tr>
                    ))}</tbody>
                </Table>
            </div>
         </Col>
         <Col lg={4}>
            <Card className="border-0 shadow-sm border">
                <Card.Header className="bg-success text-white fw-bold py-3">THÔNG TIN ĐẶT HÀNG</Card.Header>
                <Card.Body className="p-4">
                    <Form.Group className="mb-3">
                        <Form.Label className="fw-bold">Tên khách hàng</Form.Label>
                        <Form.Control onChange={e=>setKhach({...khach, ten:e.target.value})}/>
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label className="fw-bold">Số điện thoại</Form.Label>
                        <Form.Control onChange={e=>setKhach({...khach, sdt:e.target.value})}/>
                    </Form.Group>
                    <Form.Group className="mb-4">
                        <Form.Label className="fw-bold">Địa chỉ</Form.Label>
                        <Form.Control as="textarea" rows={3} onChange={e=>setKhach({...khach, diachi:e.target.value})}/>
                    </Form.Group>
                    <div className="d-flex justify-content-between h4 fw-bold border-top pt-3">
                        <span>Tổng tiền:</span>
                        <span className="text-danger">{tong.toLocaleString()} ¥</span>
                    </div>
                    <Button variant="warning" className="w-100 py-3 fw-bold mt-3 shadow-sm" onClick={()=>handleDatHang(khach, gioHang, tong)}>
                        XÁC NHẬN ĐẶT HÀNG
                    </Button>
                </Card.Body>
            </Card>
         </Col>
       </Row>
    </div>
  )
}
export default Cart