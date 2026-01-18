import React, { useState } from 'react';
import { Table, Button, Form, Row, Col } from 'react-bootstrap';

function Cart({ gioHang, chinhSuaSoLuong, xoaSanPham, xoaHet, handleDatHang }) {
  const tong = gioHang.reduce((t, s) => t + (s.giaBan||0)*s.soLuong, 0);
  const [khach, setKhach] = useState({ ten: '', sdt: '', diachi: '' });

  if (!gioHang.length) return <div className="text-center mt-5">Giỏ hàng trống</div>;

  return (
    <div className="bg-white p-3 rounded mt-3">
       <h3 className="text-success border-bottom pb-2">Giỏ hàng</h3>
       <Row>
         <Col md={8}>
            <Table responsive>
                <thead><tr><th>SP</th><th>Giá</th><th>SL</th><th>Tổng</th><th>Xóa</th></tr></thead>
                <tbody>{gioHang.map(sp => (
                    <tr key={sp.id}>
                        <td>{sp.ten}</td>
                        <td>{sp.giaBan?.toLocaleString()} ¥</td>
                        <td><Button size="sm" variant="light" onClick={()=>chinhSuaSoLuong(sp.id,'giam')}>-</Button> <span className="mx-2">{sp.soLuong}</span> <Button size="sm" variant="light" onClick={()=>chinhSuaSoLuong(sp.id,'tang')}>+</Button></td>
                        <td className="fw-bold">{(sp.giaBan*sp.soLuong).toLocaleString()} ¥</td>
                        <td><Button size="sm" variant="danger" onClick={()=>xoaSanPham(sp.id)}>X</Button></td>
                    </tr>
                ))}</tbody>
            </Table>
         </Col>
         <Col md={4} className="bg-light p-3 rounded">
            <h5>Thông tin đặt hàng</h5>
            <Form.Control placeholder="Tên" className="mb-2" onChange={e=>setKhach({...khach, ten:e.target.value})}/>
            <Form.Control placeholder="SĐT" className="mb-2" onChange={e=>setKhach({...khach, sdt:e.target.value})}/>
            <Form.Control placeholder="Địa chỉ" className="mb-3" onChange={e=>setKhach({...khach, diachi:e.target.value})}/>
            <h4 className="text-danger fw-bold text-end">Tổng: {tong.toLocaleString()} ¥</h4>
            <Button variant="warning" className="w-100 fw-bold mt-2" onClick={()=>handleDatHang(khach, gioHang, tong)}>ĐẶT HÀNG NGAY</Button>
         </Col>
       </Row>
    </div>
  )
}
export default Cart