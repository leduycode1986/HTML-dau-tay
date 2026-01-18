import React, { useState, useEffect } from 'react';
import { Table, Button, Form, Modal, Badge, Tab, Tabs, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const NO_IMAGE = "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg";
const ICON_LIST = ['🏠', '🥩', '🥦', '🍎', '🥛', '🥤', '🍞', '🥫', '🧼', '🧸', '📦'];

function Admin({ dsSanPham, handleUpdateDS_SP, dsDanhMuc, handleUpdateDS_DM, dsDonHang, handleUpdateStatusOrder, handleDeleteOrder }) {
  const [adminConfig] = useState(() => JSON.parse(localStorage.getItem('adminConfig') || '{"username":"admin","password":"123"}'));
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginInput, setLoginInput] = useState({ username: '', password: '' });
  
  // State quản lý Modal
  const [showModalSP, setShowModalSP] = useState(false);
  const [editingSP, setEditingSP] = useState(null);
  const [formDataSP, setFormDataSP] = useState({ ten: '', giaGoc: '', phanTramGiam: 0, giaBan: '', donVi: 'Cái', soLuong: 10, moTa: '', anh: '', phanLoai: '', isMoi: false, isKhuyenMai: false, isBanChay: false });
  
  const [showModalDM, setShowModalDM] = useState(false);
  const [editingDM, setEditingDM] = useState(null);
  const [formDataDM, setFormDataDM] = useState({ ten: '', icon: '', parent: '', order: '' });

  // Logic Phân cấp 18.1, 18.2 (Fix trắng trang bằng cách kiểm tra mảng)
  const sortedDanhMuc = (() => {
    const s = (a, b) => parseFloat(a.order || 0) - parseFloat(b.order || 0);
    const list = dsDanhMuc || [];
    const roots = list.filter(d => !d.parent).sort(s);
    const children = list.filter(d => d.parent).sort(s);
    let res = [];
    roots.forEach(root => {
      res.push(root);
      res.push(...children.filter(c => c.parent === (root.customId || root.id)));
    });
    return res;
  })();

  useEffect(() => {
    const goc = parseInt(formDataSP.giaGoc) || 0;
    const giam = parseInt(formDataSP.phanTramGiam) || 0;
    setFormDataSP(p => ({ ...p, giaBan: goc > 0 ? Math.floor(goc * (1 - giam / 100)) : '' }));
  }, [formDataSP.giaGoc, formDataSP.phanTramGiam]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const r = new FileReader();
      r.onloadend = () => setFormDataSP({ ...formDataSP, anh: r.result });
      r.readAsDataURL(file);
    }
  };

  if (!isLoggedIn) return (
    <div className="admin-login-wrapper">
      <div className="admin-login-card shadow">
        <h3>MAIVANG LOGIN</h3>
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
      <div className="admin-navbar p-3 bg-success text-white d-flex justify-content-between">
        <h4 className="m-0 fw-bold">QUẢN TRỊ MAIVANG SHOP</h4>
        <Link to="/"><Button variant="danger" size="sm">THOÁT</Button></Link>
      </div>

      <div className="p-4">
        <Tabs defaultActiveKey="products" className="mb-4 bg-white p-2 rounded shadow-sm border">
          <Tab eventKey="products" title="📦 SẢN PHẨM">
            <Button variant="primary" className="my-3" onClick={() => { setEditingSP(null); setShowModalSP(true); }}>+ THÊM MỚI</Button>
            <Table hover responsive className="bg-white border align-middle">
              <thead><tr><th>Ảnh</th><th>Tên SP</th><th>Giá</th><th>Thao tác</th></tr></thead>
              <tbody>{(dsSanPham || []).map(sp => (
                <tr key={sp.id}>
                  <td><img src={sp.anh || NO_IMAGE} width="50" height="50" style={{objectFit:'cover'}} alt=""/></td>
                  <td><b>{sp.ten}</b> {sp.isMoi && <Badge bg="success">Mới</Badge>} {sp.isBanChay && <Badge bg="danger">Hot</Badge>}</td>
                  <td className="text-danger fw-bold">{sp.giaBan?.toLocaleString()} ¥</td>
                  <td>
                    <Button size="sm" variant="warning" className="me-2" onClick={() => { setEditingSP(sp); setFormDataSP(sp); setShowModalSP(true); }}>Sửa</Button>
                    <Button size="sm" variant="danger" onClick={() => handleUpdateDS_SP('DELETE', sp.id)}>Xóa</Button>
                  </td>
                </tr>
              ))}</tbody>
            </Table>
          </Tab>

          <Tab eventKey="menu" title="📂 DANH MỤC & THỨ TỰ">
            <Button variant="success" className="my-3" onClick={() => { setEditingDM(null); setShowModalDM(true); }}>+ THÊM MENU</Button>
            <Table bordered hover className="align-middle bg-white">
              <thead><tr><th width="100">Thứ tự</th><th>Tên danh mục</th><th>Icon</th><th className="text-end">Thao tác</th></tr></thead>
              <tbody>{sortedDanhMuc.map(dm => (
                <tr key={dm.id} className={dm.parent ? "category-row-child" : "category-row-parent"}>
                  <td className="text-center"><Form.Control size="sm" type="text" className="menu-order-input mx-auto" defaultValue={dm.order} onBlur={(e) => handleUpdateDS_DM('UPDATE', { ...dm, order: e.target.value })} /></td>
                  <td>{dm.parent ? <span className="ms-4">↳</span> : <Badge bg="success">Gốc</Badge>} {dm.ten}</td>
                  <td className="text-center fs-5">{dm.icon}</td>
                  <td className="text-end">
                    <Button size="sm" variant="outline-warning" className="me-2" onClick={() => { setEditingDM(dm); setFormDataDM(dm); setShowModalDM(true); }}>Sửa</Button>
                    <Button size="sm" variant="outline-danger" onClick={() => handleUpdateDS_DM('DELETE', dm.id)}>Xóa</Button>
                  </td>
                </tr>
              ))}</tbody>
            </Table>
          </Tab>
        </Tabs>
      </div>

      {/* MODAL SẢN PHẨM */}
      <Modal show={showModalSP} onHide={() => setShowModalSP(false)} size="lg" centered>
        <Modal.Header closeButton><Modal.Title>Sản phẩm</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3"><Form.Label>Tên</Form.Label><Form.Control value={formDataSP.ten} onChange={e=>setFormDataSP({...formDataSP, ten: e.target.value})} /></Form.Group>
          <Row><Col><Form.Group className="mb-3"><Form.Label>Giá gốc</Form.Label><Form.Control type="number" value={formDataSP.giaGoc} onChange={e=>setFormDataSP({...formDataSP, giaGoc: e.target.value})} /></Form.Group></Col>
          <Col><Form.Group className="mb-3"><Form.Label>% Giảm</Form.Label><Form.Control type="number" value={formDataSP.phanTramGiam} onChange={e=>setFormDataSP({...formDataSP, phanTramGiam: e.target.value})} /></Form.Group></Col></Row>
          <Form.Group className="mb-3"><Form.Label>Ảnh (Máy tính)</Form.Label><Form.Control type="file" onChange={handleImageUpload} /></Form.Group>
          <div className="d-flex gap-3 mb-3"><Form.Check type="switch" label="Mới" checked={formDataSP.isMoi} onChange={e=>setFormDataSP({...formDataSP, isMoi: e.target.checked})}/><Form.Check type="switch" label="Hot" checked={formDataSP.isBanChay} onChange={e=>setFormDataSP({...formDataSP, isBanChay: e.target.checked})}/></div>
          <Form.Group className="mb-3"><Form.Label>Mô tả</Form.Label><ReactQuill theme="snow" value={formDataSP.moTa} onChange={v=>setFormDataSP({...formDataSP, moTa: v})}/></Form.Group>
          <Button variant="success" className="w-100" onClick={() => { handleUpdateDS_SP(editingSP ? 'UPDATE' : 'ADD', formDataSP); setShowModalSP(false); }}>LƯU</Button>
        </Modal.Body>
      </Modal>

      {/* MODAL DANH MỤC */}
      <Modal show={showModalDM} onHide={() => setShowModalDM(false)} centered>
        <Modal.Header closeButton><Modal.Title>Menu</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3"><Form.Label>Tên</Form.Label><Form.Control value={formDataDM.ten} onChange={e=>setFormDataDM({...formDataDM, ten: e.target.value})} /></Form.Group>
          <Row><Col><Form.Group className="mb-3"><Form.Label>Thứ tự</Form.Label><Form.Control value={formDataDM.order} onChange={e=>setFormDataDM({...formDataDM, order: e.target.value})} /></Form.Group></Col>
          <Col><Form.Group className="mb-3"><Form.Label>Icon</Form.Label><Form.Select value={formDataDM.icon} onChange={e=>setFormDataDM({...formDataDM, icon: e.target.value})}><option value="">None</option>{ICON_LIST.map(i=><option key={i} value={i}>{i}</option>)}</Form.Select></Col></Row>
          {!editingDM && <Form.Group className="mb-3"><Form.Label>Cha</Form.Label><Form.Select value={formDataDM.parent} onChange={e=>setFormDataDM({...formDataDM, parent: e.target.value})}><option value="">Gốc</option>{dsDanhMuc.filter(d=>!d.parent).map(d=><option key={d.id} value={d.customId||d.id}>{d.ten}</option>)}</Form.Select></Form.Group>}
          <Button variant="success" className="w-100" onClick={() => { handleUpdateDS_DM(editingDM ? 'UPDATE' : 'ADD', formDataDM); setShowModalDM(false); }}>LƯU</Button>
        </Modal.Body>
      </Modal>
    </div>
  );
}
export default Admin;