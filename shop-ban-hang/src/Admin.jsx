import React, { useState, useEffect } from 'react';
import { Table, Button, Form, Modal, Badge, Tab, Tabs, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
// Import setDoc để tự lưu
import { doc, getDoc, setDoc } from 'firebase/firestore'; 
import { db } from './firebase'; 

const NO_IMAGE = "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg";
const ICON_LIST = ['🏠', '🥩', '🥦', '🍎', '🥛', '🥤', '🍞', '🥫', '🧼', '🧸', '📦'];

function Admin({ dsSanPham, handleUpdateDS_SP, dsDanhMuc, handleUpdateDS_DM, dsDonHang, handleUpdateStatusOrder, handleDeleteOrder }) {
  const [adminConfig, setAdminConfig] = useState(() => JSON.parse(localStorage.getItem('adminConfig') || '{"username":"admin","password":"123"}'));
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginInput, setLoginInput] = useState({ username: '', password: '' });
  
  const [showModalSP, setShowModalSP] = useState(false);
  const [editingSP, setEditingSP] = useState(null);
  const [formDataSP, setFormDataSP] = useState({ ten: '', giaGoc: '', phanTramGiam: 0, giaBan: '', donVi: 'Cái', soLuong: 10, moTa: '', anh: '', phanLoai: '', isMoi: false, isKhuyenMai: false, isBanChay: false });
  const [showModalDM, setShowModalDM] = useState(false);
  const [editingDM, setEditingDM] = useState(null);
  const [formDataDM, setFormDataDM] = useState({ ten: '', icon: '', parent: '', order: '' });
  const [showModalPass, setShowModalPass] = useState(false);
  const [passForm, setPassForm] = useState({ oldPass: '', newPass: '' });
  
  // State Cấu hình
  const [shopConfig, setShopConfig] = useState({ tenShop: '', slogan: '', logo: '' });

  // HÀM LƯU TRỰC TIẾP
  const luuCauHinhTrucTiep = async () => {
    try {
      await setDoc(doc(db, "cauHinh", "thongTinChung"), shopConfig);
      alert("✅ Đã cập nhật Logo thành công!");
    } catch (error) {
      alert("❌ Lỗi: " + error.message);
    }
  };

  const handleFastImageUpload = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2000000) { alert("Ảnh quá lớn! < 2MB thôi"); return; }
    const reader = new FileReader();
    reader.onloadend = () => {
      if (type === 'LOGO') setShopConfig({ ...shopConfig, logo: reader.result });
      else if (type === 'PRODUCT') setFormDataSP({ ...formDataSP, anh: reader.result });
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (isLoggedIn) {
      const fetchConfig = async () => {
        const d = await getDoc(doc(db, "cauHinh", "thongTinChung"));
        if (d.exists()) setShopConfig(d.data());
      };
      fetchConfig();
    }
  }, [isLoggedIn]);

  const sortedDanhMuc = (() => {
    const s = (a, b) => parseFloat(a.order || 0) - parseFloat(b.order || 0);
    const list = dsDanhMuc || [];
    const roots = list.filter(d => !d.parent).sort(s);
    const children = list.filter(d => d.parent).sort(s);
    let res = [];
    roots.forEach(root => { res.push(root); res.push(...children.filter(c => c.parent === (root.customId || root.id))); });
    return res;
  })();

  useEffect(() => {
    const goc = parseInt(formDataSP.giaGoc) || 0;
    const giam = parseInt(formDataSP.phanTramGiam) || 0;
    setFormDataSP(p => ({ ...p, giaBan: goc > 0 ? Math.floor(goc * (1 - giam / 100)) : '' }));
  }, [formDataSP.giaGoc, formDataSP.phanTramGiam]);

  if (!isLoggedIn) return (
    <div className="admin-login-wrapper">
      <div className="admin-login-card shadow">
        <h3 className="fw-bold text-success mb-4">ADMIN LOGIN</h3>
        <Form onSubmit={(e) => { e.preventDefault(); if (loginInput.username === adminConfig.username && loginInput.password === adminConfig.password) setIsLoggedIn(true); else alert("Sai!"); }}>
          <Form.Control className="mb-3 p-3" placeholder="User" onChange={e => setLoginInput({...loginInput, username: e.target.value})} />
          <Form.Control type="password" className="mb-4 p-3" placeholder="Pass" onChange={e => setLoginInput({...loginInput, password: e.target.value})} />
          <Button variant="success" type="submit" className="w-100 py-3 fw-bold rounded-pill">ĐĂNG NHẬP</Button>
        </Form>
      </div>
    </div>
  );

  return (
    <div className="admin-main-container">
      <div className="admin-navbar">
        <h4 className="m-0 fw-bold">QUẢN TRỊ MAIVANG SHOP</h4>
        <div className="d-flex gap-2">
          <Button variant="outline-light" size="sm" onClick={() => setShowModalPass(true)}>ĐỔI PASS</Button>
          <Link to="/"><Button variant="danger" size="sm">THOÁT</Button></Link>
        </div>
      </div>
      <div className="p-4">
        <Tabs defaultActiveKey="config" className="mb-4 bg-white p-2 rounded shadow-sm border">
          <Tab eventKey="config" title="⚙️ CẤU HÌNH LOGO">
            <div className="bg-white p-4 rounded text-center">
              <Row>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">Logo Shop</Form.Label>
                    <div className="border p-3 rounded mb-2 d-flex justify-content-center align-items-center" style={{height:'180px', background:'#f8f9fa'}}>
                      {shopConfig.logo ? <img src={shopConfig.logo} style={{maxHeight:'100%', maxWidth:'100%'}} alt="Logo" /> : <span className="text-muted">Chưa có logo</span>}
                    </div>
                    <Form.Control type="file" onChange={(e) => handleFastImageUpload(e, 'LOGO')} />
                  </Form.Group>
                </Col>
                <Col md={8} className="text-start">
                  <Form.Group className="mb-3"><Form.Label className="fw-bold">Tên Shop</Form.Label><Form.Control value={shopConfig.tenShop} onChange={e => setShopConfig({...shopConfig, tenShop: e.target.value})} /></Form.Group>
                  <Form.Group className="mb-3"><Form.Label className="fw-bold">Slogan</Form.Label><Form.Control value={shopConfig.slogan} onChange={e => setShopConfig({...shopConfig, slogan: e.target.value})} /></Form.Group>
                  <Button variant="success" className="w-100 fw-bold py-3" onClick={luuCauHinhTrucTiep}>💾 LƯU CẤU HÌNH</Button>
                </Col>
              </Row>
            </div>
          </Tab>
          {/* TAB 2, 3, 4 GIỮ NGUYÊN NHƯ CŨ, ĐÃ ĐƯỢC TÍCH HỢP TRONG CODE TRÊN */}
          <Tab eventKey="products" title="📦 SẢN PHẨM">
            <Button variant="primary" className="my-3 fw-bold" onClick={() => { setEditingSP(null); setFormDataSP({ ten: '', giaGoc: '', phanTramGiam: 0, giaBan: '', donVi: 'Cái', soLuong: 10, moTa: '', anh: '', phanLoai: '', isMoi: false, isKhuyenMai: false, isBanChay: false }); setShowModalSP(true); }}>+ THÊM SẢN PHẨM</Button>
            <Table hover responsive className="bg-white border align-middle">
              <thead><tr><th>Ảnh</th><th>Tên SP</th><th>Giá bán</th><th>Thao tác</th></tr></thead>
              <tbody>{dsSanPham.map(sp => (
                <tr key={sp.id}>
                  <td><img src={sp.anh || NO_IMAGE} width="50" height="50" style={{objectFit:'cover'}} alt=""/></td>
                  <td><b>{sp.ten}</b></td>
                  <td className="text-danger fw-bold">{sp.giaBan?.toLocaleString()} ¥</td>
                  <td>
                    <Button size="sm" variant="warning" className="me-2" onClick={() => { setEditingSP(sp); setFormDataSP(sp); setShowModalSP(true); }}>Sửa</Button>
                    <Button size="sm" variant="danger" onClick={() => { if(confirm('Xóa?')) handleUpdateDS_SP('DELETE', sp.id) }}>Xóa</Button>
                  </td>
                </tr>
              ))}</tbody>
            </Table>
          </Tab>
          <Tab eventKey="menu" title="📂 DANH MỤC">
            <Button variant="success" className="my-3 fw-bold" onClick={() => { setEditingDM(null); setFormDataDM({ten:'', icon:'', parent:'', order:''}); setShowModalDM(true); }}>+ THÊM MENU</Button>
            <Table bordered hover className="align-middle bg-white">
              <thead><tr><th>Thứ tự</th><th>Tên</th><th>Icon</th><th>Thao tác</th></tr></thead>
              <tbody>{sortedDanhMuc.map(dm => (
                <tr key={dm.id}>
                  <td className="text-center">{dm.order}</td>
                  <td>{dm.parent ? '↳ ' : ''}{dm.ten}</td>
                  <td className="text-center">{dm.icon}</td>
                  <td>
                    <Button size="sm" variant="outline-warning" className="me-2" onClick={() => { setEditingDM(dm); setFormDataDM(dm); setShowModalDM(true); }}>Sửa</Button>
                    <Button size="sm" variant="outline-danger" onClick={() => handleUpdateDS_DM('DELETE', dm.id)}>Xóa</Button>
                  </td>
                </tr>
              ))}</tbody>
            </Table>
          </Tab>
          <Tab eventKey="orders" title={`📋 ĐƠN HÀNG (${dsDonHang.length})`}>
            <Table hover responsive className="bg-white border mt-3">
              <thead><tr><th>Ngày</th><th>Khách</th><th>Tổng</th><th>Thao tác</th></tr></thead>
              <tbody>{dsDonHang.map(dh => (
                <tr key={dh.id}>
                  <td>{dh.ngayDat?.toDate ? dh.ngayDat.toDate().toLocaleString('vi-VN') : 'Mới'}</td>
                  <td><b>{dh.khachHang?.ten}</b></td>
                  <td className="text-danger fw-bold">{dh.tongTien?.toLocaleString()} ¥</td>
                  <td>
                    <Button size="sm" variant="success" className="me-2" onClick={() => handleUpdateStatusOrder(dh.id, 'Hoàn thành')}>Xong</Button>
                    <Button size="sm" variant="danger" onClick={() => handleDeleteOrder(dh.id)}>Xóa</Button>
                  </td>
                </tr>
              ))}</tbody>
            </Table>
          </Tab>
        </Tabs>
      </div>
      {/* CÁC MODAL GIỮ NGUYÊN - BẠN ĐÃ CÓ RỒI HOẶC COPY TỪ CODE TRƯỚC */}
      <Modal show={showModalSP} onHide={() => setShowModalSP(false)} size="lg" centered>
        <Modal.Header closeButton><Modal.Title className="fw-bold text-success">CHI TIẾT SẢN PHẨM</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={8}>
                <Form.Group className="mb-3"><Form.Label>Tên SP</Form.Label><Form.Control value={formDataSP.ten} onChange={e=>setFormDataSP({...formDataSP, ten: e.target.value})} /></Form.Group>
                <Row>
                  <Col md={4}><Form.Group className="mb-3"><Form.Label>Giá Gốc</Form.Label><Form.Control type="number" value={formDataSP.giaGoc} onChange={e=>setFormDataSP({...formDataSP, giaGoc: e.target.value})} /></Form.Group></Col>
                  <Col md={4}><Form.Group className="mb-3"><Form.Label>% Giảm</Form.Label><Form.Control type="number" value={formDataSP.phanTramGiam} onChange={e=>setFormDataSP({...formDataSP, phanTramGiam: e.target.value})} /></Form.Group></Col>
                  <Col md={4}><Form.Group className="mb-3"><Form.Label className="text-danger">Giá Bán</Form.Label><Form.Control value={formDataSP.giaBan} readOnly className="bg-light fw-bold text-danger" /></Form.Group></Col>
                </Row>
                <div className="bg-light p-3 rounded mb-3 d-flex gap-3 border">
                  <Form.Check type="switch" label="MỚI" checked={formDataSP.isMoi} onChange={e=>setFormDataSP({...formDataSP, isMoi: e.target.checked})} />
                  <Form.Check type="switch" label="HOT" checked={formDataSP.isBanChay} onChange={e=>setFormDataSP({...formDataSP, isBanChay: e.target.checked})} />
                  <Form.Check type="switch" label="SALE" checked={formDataSP.isKhuyenMai} onChange={e=>setFormDataSP({...formDataSP, isKhuyenMai: e.target.checked})} />
                </div>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Ảnh Sản Phẩm</Form.Label>
                  <Form.Control type="file" onChange={(e) => handleFastImageUpload(e, 'PRODUCT')} />
                  <div className="mt-2 border p-2 text-center bg-white rounded">
                    <img src={formDataSP.anh || NO_IMAGE} style={{maxHeight:'160px', maxWidth:'100%'}} alt=""/>
                  </div>
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3"><Form.Label>Mô tả</Form.Label><ReactQuill theme="snow" value={formDataSP.moTa} onChange={v=>setFormDataSP({...formDataSP, moTa: v})}/></Form.Group>
            <Button variant="success" className="w-100 py-3 fw-bold" onClick={() => { handleUpdateDS_SP(editingSP ? 'UPDATE' : 'ADD', formDataSP); setShowModalSP(false); }}>LƯU DỮ LIỆU</Button>
          </Form>
        </Modal.Body>
      </Modal>

      <Modal show={showModalDM} onHide={() => setShowModalDM(false)} centered>
        <Modal.Header closeButton><Modal.Title className="fw-bold text-success">MENU</Modal.Title></Modal.Header>
        <Modal.Body className="p-4">
          <Form.Group className="mb-3"><Form.Label className="fw-bold small">TÊN MENU</Form.Label><Form.Control value={formDataDM.ten} onChange={e => setFormDataDM({...formDataDM, ten: e.target.value})} /></Form.Group>
          <Row className="mb-3"><Col><Form.Label className="fw-bold small">THỨ TỰ</Form.Label><Form.Control value={formDataDM.order} onChange={e => setFormDataDM({...formDataDM, order: e.target.value})} /></Col><Col><Form.Label className="fw-bold small">ICON</Form.Label><Form.Select value={formDataDM.icon} onChange={e => setFormDataDM({...formDataDM, icon: e.target.value})}><option value="">None</option>{ICON_LIST.map(i => <option key={i} value={i}>{i}</option>)}</Form.Select></Col></Row>
          {!editingDM && <Form.Group className="mb-4"><Form.Label className="fw-bold small">DANH MỤC CHA</Form.Label><Form.Select value={formDataDM.parent} onChange={e => setFormDataDM({...formDataDM, parent: e.target.value})}><option value="">Gốc</option>{dsDanhMuc.filter(d => !d.parent).map(d => <option key={d.id} value={d.customId || d.id}>{d.ten}</option>)}</Form.Select></Form.Group>}
          <Button variant="success" className="w-100 py-3 fw-bold" onClick={() => { handleUpdateDS_DM(editingDM ? 'UPDATE' : 'ADD', formDataDM); setShowModalDM(false); }}>LƯU MENU</Button>
        </Modal.Body>
      </Modal>

      <Modal show={showModalPass} onHide={() => setShowModalPass(false)} centered>
        <Modal.Header closeButton><Modal.Title>ĐỔI MẬT KHẨU</Modal.Title></Modal.Header>
        <Modal.Body className="p-4">
          <Form.Group className="mb-3"><Form.Label>Pass cũ</Form.Label><Form.Control type="password" onChange={e=>setPassForm({...passForm,oldPass:e.target.value})}/></Form.Group>
          <Form.Group className="mb-3"><Form.Label>Pass mới</Form.Label><Form.Control type="password" onChange={e=>setPassForm({...passForm,newPass:e.target.value})}/></Form.Group>
          <Button onClick={()=>{if(passForm.oldPass===adminConfig.password){localStorage.setItem('adminConfig',JSON.stringify({...adminConfig,password:passForm.newPass}));alert('OK');setShowModalPass(false);}else alert('Sai!');}}>LƯU</Button>
        </Modal.Body>
      </Modal>
    </div>
  );
}
export default Admin;