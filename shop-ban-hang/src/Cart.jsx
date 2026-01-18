import React, { useState } from 'react';
import { Table, Button, Form, Row, Col, Card } from 'react-bootstrap';
import SEO from './SEO'; // 👇 Import SEO

function Cart({ gioHang, chinhSuaSoLuong, xoaSanPham, handleDatHang }) {
  const tong = gioHang.reduce((t, s) => t + (s.giaBan||0)*s.soLuong, 0);
  const [khach, setKhach] = useState({ ten: '', sdt: '', diachi: '' });

  if (!gioHang.length) return (
      <div className="text-center mt-5 p-5 bg-white rounded shadow-sm">
          <i className="fa-solid fa-cart-arrow-down fs-1 text-muted mb-3"></i>
          <h4>Giỏ hàng của bạn đang trống!</h4>
          <p className="text-muted">Hãy quay lại trang chủ để mua sắm nhé.</p>
      </div>
  );

  return (
    <div className="p-3">
       <SEO title="Giỏ Hàng" />
       <h3 className="text-uppercase fw-bold text-success mb-4"><i className="fa-solid fa-bag-shopping me-2"></i> Giỏ hàng của bạn</h3>
       
       <Row>
         {/* Bảng sản phẩm */}
         <Col lg={8} className="mb-4">
            <div className="bg-white rounded shadow-sm overflow-hidden">
                <Table responsive className="m-0 align-middle">
                    <thead className="table-light text-secondary text-uppercase small fw-bold">
                        <tr><th>Sản phẩm</th><th>Đơn giá</th><th>Số lượng</th><th>Thành tiền</th><th></th></tr>
                    </thead>
                    <tbody>{gioHang.map(sp => (
                        <tr key={sp.id}>
                            <td style={{minWidth:'200px'}}>
                                <div className="d-flex align-items-center gap-3">
                                    <img src={sp.anh || "https://via.placeholder.com/150"} width="60" height="60" className="rounded border" style={{objectFit:'cover'}} onError={e=>e.target.src="https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg"} />
                                    <div className="fw-bold">{sp.ten}</div>
                                </div>
                            </td>
                            <td>{sp.giaBan?.toLocaleString()} ¥</td>
                            <td>
                                <div className="input-group input-group-sm" style={{width:'100px'}}>
                                    <Button variant="outline-secondary" onClick={()=>chinhSuaSoLuong(sp.id,'giam')}>-</Button>
                                    <span className="form-control text-center bg-white">{sp.soLuong}</span>
                                    <Button variant="outline-secondary" onClick={()=>chinhSuaSoLuong(sp.id,'tang')}>+</Button>
                                </div>
                            </td>
                            <td className="fw-bold text-danger">{(sp.giaBan*sp.soLuong).toLocaleString()} ¥</td>
                            <td className="text-end"><Button size="sm" variant="outline-danger" className="border-0" onClick={()=>xoaSanPham(sp.id)}><i className="fa-solid fa-trash"></i></Button></td>
                        </tr>
                    ))}</tbody>
                </Table>
            </div>
         </Col>

         {/* Form thanh toán */}
         <Col lg={4}>
            <Card className="border-0 shadow-sm">
                <Card.Header className="bg-success text-white fw-bold text-uppercase py-3">Thông tin đặt hàng</Card.Header>
                <Card.Body className="p-4">
                    <Form.Group className="mb-3">
                        <Form.Label className="fw-bold">Họ và Tên</Form.Label>
                        <Form.Control placeholder="Nhập tên của bạn" className="py-2" onChange={e=>setKhach({...khach, ten:e.target.value})}/>
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label className="fw-bold">Số điện thoại</Form.Label>
                        <Form.Control placeholder="VD: 090..." className="py-2" onChange={e=>setKhach({...khach, sdt:e.target.value})}/>
                    </Form.Group>
                    <Form.Group className="mb-4">
                        <Form.Label className="fw-bold">Địa chỉ giao hàng</Form.Label>
                        <Form.Control as="textarea" rows={3} placeholder="Số nhà, đường, phường..." onChange={e=>setKhach({...khach, diachi:e.target.value})}/>
                    </Form.Group>
                    
                    <div className="d-flex justify-content-between mb-4 pt-3 border-top">
                        <span className="h5 mb-0">Tổng cộng:</span>
                        <span className="h4 text-danger fw-bold mb-0">{tong.toLocaleString()} ¥</span>
                    </div>

                    <Button variant="warning" size="lg" className="w-100 fw-bold text-uppercase py-3 shadow-sm" onClick={()=>handleDatHang(khach, gioHang, tong)}>
                        Xác nhận đặt hàng
                    </Button>
                </Card.Body>
            </Card>
         </Col>
       </Row>
    </div>
  )
}
export default Cart