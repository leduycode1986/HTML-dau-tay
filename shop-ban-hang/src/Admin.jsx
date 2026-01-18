import React, { useState, useEffect } from 'react';
import { Table, Button, Form, Modal, Badge, Tab, Tabs, Row, Col, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const NO_IMAGE = "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg";
const ICON_LIST = ['🔥', '⚡', '💎', '🆕', '🎁', '🏷️', '📦', '🥩', '🍗', '🍖', '🐟', '🦀', '🦐', '🐙', '🥚', '🥬', '🥦', '🥕', '🥔', '🍆', '🌽', '🍄', '🍅', '🍎', '🍇', '🍉', '🍌', '🍋', '🍊', '🍓', '🥭', '🥥', '🍚', '🌾', '🍞', '🥖', '🥪', '🥜', '🌰', '🍜', '🍝', '🍲', '🥣', '🥢', '🥡', '🥘', '🍾', '🧂', '🌶️', '🧄', '🧅', '🥫', '🍯', '🧈', '🍺', '🍷', '🥂', '🥤', '🧃', '☕', '🍵', '🍼', '🥛', '🧀', '🍦', '🍧', '🍰', '🍪', '🍫', '🍬', '🧴', '🧼', '🧽', '🧻', '🪥', '🧹', '🧺', '🏠', '👶', '🧸', '🐶', '🐱'];

function Admin({ dsSanPham, handleUpdateDS_SP, dsDanhMuc, handleUpdateDS_DM, dsDonHang, handleUpdateStatusOrder, handleDeleteOrder }) {
  const [adminConfig, setAdminConfig] = useState(() => JSON.parse(localStorage.getItem('adminConfig') || '{"username":"admin","password":"123"}'));
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginInput, setLoginInput] = useState({ username: '', password: '' });
  const [showModalSP, setShowModalSP] = useState(false);
  const [editingSP, setEditingSP] = useState(null);
  const [formDataSP, setFormDataSP] = useState({ ten: '', giaGoc: '', phanTramGiam: 0, giaBan: '', donVi: 'Cái', soLuong: 10, moTa: '', anh: '', phanLoai: 'thitca', isKhuyenMai: false, isBanChay: false, isMoi: false });
  
  // Logic tính giá
  useEffect(() => {
      if(formDataSP.giaGoc) {
          const goc = parseInt(formDataSP.giaGoc) || 0;
          const giam = parseInt(formDataSP.phanTramGiam) || 0;
          setFormDataSP(prev => ({ ...prev, giaBan: Math.floor(goc * (1 - giam/100)) }));
      }
  }, [formDataSP.giaGoc, formDataSP.phanTramGiam]);

  function handleLogin() { 
      if (loginInput.username === adminConfig.username && loginInput.password === adminConfig.password) setIsLoggedIn(true); 
      else alert("Sai thông tin!"); 
  }

  // --- HÀM UPLOAD ẢNH TỪ MÁY TÍNH ---
  const handleImageUpload = (e) => {
      const file = e.target.files[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => setFormDataSP({ ...formDataSP, anh: reader.result });
          reader.readAsDataURL(file);
      }
  };

  function handleSaveSP() {
      if (!formDataSP.ten || !formDataSP.giaBan) return alert("Thiếu tên/giá!");
      const finalAnh = formDataSP.anh ? formDataSP.anh : NO_IMAGE;
      const p = { ...formDataSP, giaGoc: parseInt(formDataSP.giaGoc)||0, giaBan: parseInt(formDataSP.giaBan)||0, phanTramGiam: parseInt(formDataSP.phanTramGiam)||0, soLuong: parseInt(formDataSP.soLuong)||0, anh: finalAnh };
      if (editingSP) handleUpdateDS_SP('UPDATE', { ...p, id: editingSP.id }); else handleUpdateDS_SP('ADD', p);
      setShowModalSP(false); setEditingSP(null); setFormDataSP({ ten: '', giaGoc: '', phanTramGiam: 0, giaBan: '', donVi: 'Cái', soLuong: 10, moTa: '', anh: '', phanLoai: 'thitca', isKhuyenMai: false, isBanChay: false, isMoi: false });
  }

  function handleDeleteSP(id) { if(window.confirm("Xóa?")) handleUpdateDS_SP('DELETE', id); }

  // --- GIAO DIỆN ĐĂNG NHẬP NỀN XANH CĂN GIỮA (CHUẨN CŨ) ---
  if (!isLoggedIn) return (
      <div style={{height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'linear-gradient(135deg, #008848, #00b359)'}}>
          <div className="bg-white p-5 rounded shadow text-center" style={{width: '400px'}}>
              <h2 className="text-success fw-bold mb-3">ADMIN LOGIN</h2>
              <p className="text-muted mb-4">Hệ thống quản lý MaiVang Shop</p>
              <Form onSubmit={e => {e.preventDefault(); handleLogin()}}>
                  <Form.Control className="mb-3 p-3 bg-light" placeholder="Username" value={loginInput.username} onChange={e => setLoginInput({...loginInput, username: e.target.value})} />
                  <Form.Control className="mb-4 p-3 bg-light" type="password" placeholder="Password" value={loginInput.password} onChange={e => setLoginInput({...loginInput, password: e.target.value})} />
                  <Button variant="success" type="submit" className="w-100 py-3 fw-bold shadow">ĐĂNG NHẬP</Button>
              </Form>
              <Link to="/" className="d-block mt-4 text-decoration-none text-success fw-bold">← Về trang chủ</Link>
          </div>
      </div>
  );

  // --- GIAO DIỆN QUẢN TRỊ ---
  return (
    <Container className="my-5 p-4 bg-white rounded shadow" style={{minHeight:'80vh'}}>
      <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
          <h2 className="text-success fw-bold m-0">QUẢN TRỊ HỆ THỐNG</h2>
          <Link to="/"><Button variant="outline-danger">Đăng xuất</Button></Link>
      </div>

      <Tabs defaultActiveKey="products" className="mb-4">
        <Tab eventKey="products" title="📦 Quản lý Sản phẩm">
            <Button className="mb-3 btn-lg shadow-sm" variant="primary" onClick={() => {setEditingSP(null); setShowModalSP(true)}}>+ Thêm Sản Phẩm Mới</Button>
            <Table hover responsive className="align-middle border">
                <thead className="table-success text-center"><tr><th>Hình ảnh</th><th>Tên sản phẩm</th><th>Giá bán</th><th>Kho</th><th>Thao tác</th></tr></thead>
                <tbody>{dsSanPham.map(sp => (
                    <tr key={sp.id}>
                        <td className="text-center"><img src={sp.anh || NO_IMAGE} width="60" height="60" className="rounded border shadow-sm" style={{objectFit:'cover'}} onError={e=>e.target.src=NO_IMAGE}/></td>
                        <td><div className="fw-bold">{sp.ten}</div><small className="text-muted">{sp.phanLoai}</small></td>
                        <td className="text-center"><span className="text-danger fw-bold">{sp.giaBan?.toLocaleString()} ¥</span></td>
                        <td className="text-center">{sp.soLuong}</td>
                        <td className="text-center"><Button size="sm" variant="warning" className="me-2" onClick={()=>{setEditingSP(sp); setFormDataSP(sp); setShowModalSP(true)}}>Sửa</Button><Button size="sm" variant="danger" onClick={() => handleDeleteSP(sp.id)}>Xóa</Button></td>
                    </tr>
                ))}</tbody>
            </Table>
        </Tab>
        <Tab eventKey="orders" title={`📋 Đơn hàng (${dsDonHang ? dsDonHang.length : 0})`}>
             <Table bordered hover responsive><thead className="table-primary"><tr><th>Ngày</th><th>Khách hàng</th><th>Tổng tiền</th><th>Trạng thái</th><th>Xử lý</th></tr></thead><tbody>{dsDonHang?.map(dh=><tr key={dh.id}><td>{dh.ngayDat?.toDate ? dh.ngayDat.toDate().toLocaleString('vi-VN') : 'Mới'}</td><td>{dh.khachHang.ten}<br/><small>{dh.khachHang.sdt}</small></td><td className="fw-bold text-danger">{parseInt(dh.tongTien).toLocaleString()} ¥</td><td><Badge bg={dh.trangThai==='Mới đặt'?'primary':'success'}>{dh.trangThai}</Badge></td><td><Button size="sm" variant="success" onClick={()=>handleUpdateStatusOrder(dh.id,'Hoàn thành')}>Xong</Button> <Button size="sm" variant="danger" onClick={()=>handleDeleteOrder(dh.id)}>Xóa</Button></td></tr>)}</tbody></Table>
        </Tab>
      </Tabs>

      {/* MODAL THÊM/SỬA SẢN PHẨM */}
      <Modal show={showModalSP} onHide={()=>setShowModalSP(false)} size="lg" centered>
         <Modal.Header closeButton className="bg-primary text-white"><Modal.Title>{editingSP?'Cập nhật sản phẩm':'Thêm sản phẩm mới'}</Modal.Title></Modal.Header>
         <Modal.Body>
             <Form>
                <Row className="mb-3"><Col md={8}><Form.Label>Tên sản phẩm</Form.Label><Form.Control value={formDataSP.ten} onChange={e=>setFormDataSP({...formDataSP, ten:e.target.value})} /></Col><Col md={4}><Form.Label>Loại</Form.Label><Form.Control value={formDataSP.phanLoai} onChange={e=>setFormDataSP({...formDataSP, phanLoai:e.target.value})} /></Col></Row>
                <Row className="mb-3 p-3 bg-light rounded mx-0 border">
                    <Col><Form.Label>Giá Gốc</Form.Label><Form.Control type="number" value={formDataSP.giaGoc} onChange={e=>setFormDataSP({...formDataSP, giaGoc:e.target.value})} /></Col>
                    <Col><Form.Label>% Giảm</Form.Label><Form.Control type="number" value={formDataSP.phanTramGiam} onChange={e=>setFormDataSP({...formDataSP, phanTramGiam:e.target.value})} /></Col>
                    <Col><Form.Label className="text-danger fw-bold">Giá Bán</Form.Label><Form.Control value={formDataSP.giaBan} readOnly className="fw-bold text-danger"/></Col>
                </Row>
                <Form.Group className="mb-3">
                    <Form.Label className="fw-bold text-primary">Hình ảnh (Upload từ máy)</Form.Label>
                    <div className="d-flex align-items-center gap-3">
                        <Form.Control type="file" onChange={handleImageUpload} />
                        {formDataSP.anh && <img src={formDataSP.anh} width="80" height="80" className="rounded border shadow-sm" />}
                    </div>
                </Form.Group>
                <Form.Group className="mb-3"><Form.Label>Mô tả (SEO)</Form.Label><ReactQuill theme="snow" value={formDataSP.moTa} onChange={v=>setFormDataSP({...formDataSP, moTa:v})} /></Form.Group>
                <div className="d-flex gap-3"><Form.Check label="Khuyến mãi" checked={formDataSP.isKhuyenMai} onChange={e=>setFormDataSP({...formDataSP, isKhuyenMai:e.target.checked})} /><Form.Check label="Sản phẩm mới" checked={formDataSP.isMoi} onChange={e=>setFormDataSP({...formDataSP, isMoi:e.target.checked})} /></div>
             </Form>
         </Modal.Body>
         <Modal.Footer><Button variant="secondary" onClick={()=>setShowModalSP(false)}>Hủy</Button><Button variant="primary" onClick={handleSaveSP}>Lưu lại</Button></Modal.Footer>
      </Modal>
    </Container>
  );
}
export default Admin;