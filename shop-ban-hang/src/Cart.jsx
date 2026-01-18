import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

function Cart({ gioHang, chinhSuaSoLuong, xoaSanPham, xoaHetGioHang, colors, handleDatHang }) {
  
  // Tính tổng (Dùng giaBan nếu có, không thì dùng gia cũ)
  const tongTien = gioHang.reduce((total, sp) => {
      const giaThucTe = sp.giaBan || parseInt(sp.gia) || 0; 
      return total + (giaThucTe * sp.soLuong);
  }, 0);

  const [khachHang, setKhachHang] = useState({ ten: '', sdt: '', diachi: '', ghiChu: '' });

  function xuLyDatHang() {
      if (gioHang.length === 0) return alert("Giỏ hàng trống!");
      if (!khachHang.ten || !khachHang.sdt || !khachHang.diachi) return alert("Vui lòng điền đủ thông tin!");
      handleDatHang(khachHang, gioHang, tongTien);
  }

  if (gioHang.length === 0) return (<Container style={{textAlign: 'center', marginTop: '50px'}}><h3>🛒 Giỏ hàng trống!</h3><Link to="/"><Button variant="success">Mua sắm ngay</Button></Link></Container>);

  return (
    <Container style={{ marginTop: '20px', background: 'white', padding: '20px', borderRadius: '10px' }}>
      <h2 style={{color: colors.primaryGreen}}>🛒 Giỏ Hàng</h2>
      <Row>
          <Col md={8}>
              <Table responsive>
                <thead><tr><th>Sản phẩm</th><th>Đơn giá (¥)</th><th>SL</th><th>Thành tiền</th><th>Xóa</th></tr></thead>
                <tbody>
                  {gioHang.map(sp => {
                        const giaThucTe = sp.giaBan || parseInt(sp.gia) || 0;
                        return (
                            <tr key={sp.id} style={{verticalAlign: 'middle'}}>
                            <td>
                                <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                                    <img src={sp.anh} width="50" style={{borderRadius: '5px'}} />
                                    <div>
                                        <div>{sp.ten}</div>
                                        <small style={{color: '#777'}}>{sp.donVi || 'Cái'}</small>
                                    </div>
                                </div>
                            </td>
                            <td>{giaThucTe.toLocaleString('ja-JP')} ¥</td>
                            <td>
                                <Button size="sm" variant="light" onClick={() => chinhSuaSoLuong(sp.id, 'giam')}>-</Button>
                                <span style={{margin: '0 10px', fontWeight: 'bold'}}>{sp.soLuong}</span>
                                <Button size="sm" variant="light" onClick={() => chinhSuaSoLuong(sp.id, 'tang')}>+</Button>
                            </td>
                            <td style={{fontWeight: 'bold'}}>{(giaThucTe * sp.soLuong).toLocaleString('ja-JP')} ¥</td>
                            <td><Button size="sm" variant="danger" onClick={() => xoaSanPham(sp.id)}>X</Button></td>
                            </tr>
                        )
                  })}
                </tbody>
              </Table>
          </Col>
          <Col md={4}>
              <div style={{backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '10px'}}>
                  <h5 style={{fontWeight: 'bold'}}>Thông tin giao hàng</h5>
                  <Form>
                      <Form.Control className="mb-2" placeholder="Họ tên" value={khachHang.ten} onChange={e => setKhachHang({...khachHang, ten: e.target.value})} />
                      <Form.Control className="mb-2" placeholder="SĐT" value={khachHang.sdt} onChange={e => setKhachHang({...khachHang, sdt: e.target.value})} />
                      <Form.Control className="mb-2" placeholder="Địa chỉ" value={khachHang.diachi} onChange={e => setKhachHang({...khachHang, diachi: e.target.value})} />
                      <Form.Control className="mb-3" as="textarea" placeholder="Ghi chú" value={khachHang.ghiChu} onChange={e => setKhachHang({...khachHang, ghiChu: e.target.value})} />
                  </Form>
                  <div style={{borderTop: '1px dashed #ccc', margin: '15px 0'}}></div>
                  <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 'bold'}}>
                      <span>Tổng tiền:</span>
                      <span style={{color: 'red'}}>{tongTien.toLocaleString('ja-JP')} ¥</span>
                  </div>
                  <Button variant="warning" onClick={xuLyDatHang} style={{width: '100%', marginTop: '20px', fontWeight: 'bold'}}>ĐẶT HÀNG</Button>
              </div>
          </Col>
      </Row>
    </Container>
  )
}
export default Cart