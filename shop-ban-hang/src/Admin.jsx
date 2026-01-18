import React, { useState } from 'react';
import { Table, Button, Form, Modal, Badge, Tab, Tabs, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const NO_IMAGE = "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg";
const ICON_LIST = ['🏠', '🥩', '🥦', '🍎', '🥛', '🥤', '🍞', '🥫', '🧼', '🧸', '📦'];

function Admin({ dsSanPham, handleUpdateDS_SP, dsDanhMuc, handleUpdateDS_DM, dsDonHang, handleUpdateStatusOrder, handleDeleteOrder }) {
  const [adminConfig, setAdminConfig] = useState(() => JSON.parse(localStorage.getItem('adminConfig') || '{"username":"admin","password":"123"}'));
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginInput, setLoginInput] = useState({ username: '', password: '' });
  
  // States quản lý
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showModalSP, setShowModalSP] = useState(false);
  const [editingSP, setEditingSP] = useState(null);
  const [formDataSP, setFormDataSP] = useState({ ten: '', giaBan: '', soLuong: 10, moTa: '', anh: '', phanLoai: '', isKhuyenMai: false, isMoi: false });
  const [showModalDM, setShowModalDM] = useState(false);
  const [editingDM, setEditingDM] = useState(null);
  const [formDataDM, setFormDataDM] = useState({ ten: '', icon: '', parent: '', order: '' });
  const [showModalPass, setShowModalPass] = useState(false);
  const [passForm, setPassForm] = useState({ oldPass: '', newPass: '' });

  // Logic Sắp xếp Phân cấp (VD: 18 -> 18.1 -> 18.2)
  const sortedDanhMuc = (() => {
    const s = (a, b) => parseFloat(a.order || 0) - parseFloat(b.order || 0);
    const roots = dsDanhMuc.filter(d => !d.parent).sort(s);
    const children = dsDanhMuc.filter(d => d.parent).sort(s);
    let res = [];
    roots.forEach(root => {
      res.push(root);
      res.push(...children.filter(c => c.parent === (root.customId || root.id)));
    });
    return res;
  })();

  const handleLogin = (e) => {
    e.preventDefault();
    if (loginInput.username === adminConfig.username && loginInput.password === adminConfig.password) setIsLoggedIn(true);
    else alert("Sai tài khoản hoặc mật khẩu!");
  };

  const handleSaveDM = () => {
    if (!formDataDM.ten || formDataDM.order === '') return alert("Thiếu tên hoặc thứ tự!");
    handleUpdateDS_DM(editingDM ? 'UPDATE' : 'ADD', editingDM ? { ...formDataDM, id: editingDM.id } : formDataDM);
    setShowModalDM(false);
  };

  if (!isLoggedIn) return (
    <div className="admin-login-wrapper">
      <div className="admin-login-card">
        <h3>MAIVANG ADMIN</h3>
        <Form onSubmit={handleLogin}>
          <Form.Control className="mb-3 p-3" placeholder="Tên đăng nhập" onChange={e => setLoginInput({...loginInput, username: e.target.value})} />
          <Form.Control type="password" className="mb-4 p-3" placeholder="Mật khẩu" onChange={e => setLoginInput({...loginInput, password: e.target.value})} />
          <Button variant="success" type="submit" className="w-100 py-3 fw-bold rounded-pill">ĐĂNG NHẬP HỆ THỐNG</Button>
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
        <Tabs defaultActiveKey="products" className="mb-4 bg-white p-2 rounded shadow-sm">
          {/* TAB 1: SẢN PHẨM */}
          <Tab eventKey="products" title="📦 SẢN PHẨM">
            <Button variant="primary" className="my-3 fw-bold" onClick={() => { setEditingSP(null); setShowModalSP(true); }}>+ THÊM SẢN PHẨM</Button>
            <Table hover responsive className="bg-white border rounded align-middle text-center">
              <thead className="table-light"><tr><th>Ảnh</th><th className="text-start">Tên sản phẩm</th><th>Giá</th><th>Thao tác</th></tr></thead>
              <tbody>{dsSanPham.map(sp => (
                <tr key={sp.id}>
                  <td><img src={sp.anh || NO_IMAGE} className="admin-thumb" /></td>
                  <td className="text-start"><div className="fw-bold text-success">{sp.ten}</div><small className="text-muted">{sp.moTa?.replace(/<[^>]*>?/gm, '').substring(0, 50)}...</small></td>
                  <td className="text-danger fw-bold">{Number(sp.giaBan).toLocaleString()} ¥</td>
                  <td>
                    <Button size="sm" variant="warning" className="me-2 shadow-sm" onClick={() => { setEditingSP(sp); setFormDataSP(sp); setShowModalSP(true); }}>Sửa</Button>
                    <Button size="sm" variant="danger" className="shadow-sm" onClick={() => { if(window.confirm('Xóa?')) handleUpdateDS_SP('DELETE', sp.id) }}>Xóa</Button>
                  </td>
                </tr>
              ))}</tbody>
            </Table>
          </Tab>

          {/* TAB 2: ĐƠN HÀNG */}
          <Tab eventKey="orders" title={`📋 ĐƠN HÀNG (${dsDonHang.length})`}>
            <Table responsive className="bg-white border rounded align-middle mt-3">
              <thead className="table-primary text-white"><tr><th>Ngày</th><th>Khách hàng</th><th>Tổng tiền</th><th>Thao tác</th></tr></thead>
              <tbody>{dsDonHang.map(dh => (
                <tr key={dh.id}>
                  <td>{dh.ngayDat?.toDate ? dh.ngayDat.toDate().toLocaleString('vi-VN') : 'Mới'}</td>
                  <td><b>{dh.khachHang?.ten}</b><br/><small>{dh.khachHang?.sdt}</small></td>
                  <td className="text-danger fw-bold">{dh.tongTien?.toLocaleString()} ¥</td>
                  <td>
                    <Button size="sm" variant="success" className="me-2" onClick={() => handleUpdateStatusOrder(dh.id, 'Hoàn thành')}>Xong</Button>
                    <Button size="sm" variant="danger" onClick={() => handleDeleteOrder(dh.id)}>Xóa</Button>
                  </td>
                </tr>
              ))}</tbody>
            </Table>
          </Tab>

          {/* TAB 3: DANH MỤC (MENU) */}
          <Tab eventKey="menu" title="📂 DANH MỤC & THỨ TỰ">
            <div className="bg-white p-3 rounded border mt-3 shadow-sm">
              <Button variant="success" className="mb-4 fw-bold" onClick={() => { setEditingDM(null); setFormDataDM({ten:'', icon:'', parent:'', order:''}); setShowModalDM(true); }}>+ THÊM MENU MỚI</Button>
              <Table bordered hover className="align-middle">
                <thead className="table-light"><tr><th width="120" className="text-center">Thứ tự</th><th>Tên danh mục</th><th className="text-center">Icon</th><th className="text-end">Thao tác</th></tr></thead>
                <tbody>{sortedDanhMuc.map(dm => (
                  <tr key={dm.id} className={dm.parent ? "category-row-child" : "category-row-parent"}>
                    <td className="text-center">
                      <Form.Control size="sm" type="text" className="menu-order-input mx-auto" defaultValue={dm.order} onBlur={(e) => handleUpdateDS_DM('UPDATE', { ...dm, order: e.target.value })} />
                    </td>
                    <td>{dm.parent ? <span className="ms-4 text-muted">↳</span> : <Badge bg="success">Gốc</Badge>} <span className="ms-2">{dm.ten}</span></td>
                    <td className="text-center fs-5">{dm.icon}</td>
                    <td className="text-end">
                      <Button size="sm" variant="outline-warning" className="me-2" onClick={() => { setEditingDM(dm); setFormDataDM(dm); setShowModalDM(true); }}>Sửa</Button>
                      <Button size="sm" variant="outline-danger" onClick={() => handleUpdateDS_DM('DELETE', dm.id)}>Xóa</Button>
                    </td>
                  </tr>
                ))}</tbody>
              </Table>
            </div>
          </Tab>
        </Tabs>
      </div>

      {/* MODAL SỬA MENU */}
      <Modal show={showModalDM} onHide={() => setShowModalDM(false)} centered>
        <Modal.Header closeButton><Modal.Title className="fw-bold text-success">{editingDM ? 'SỬA DANH MỤC' : 'THÊM MỚI'}</Modal.Title></Modal.Header>
        <Modal.Body className="p-4">
          <Form.Group className="mb-3"><Form.Label className="fw-bold small">TÊN MENU</Form.Label><Form.Control value={formDataDM.ten} onChange={e => setFormDataDM({...formDataDM, ten: e.target.value})} /></Form.Group>
          <Row className="mb-3"><Col md={6}><Form.Label className="fw-bold small">THỨ TỰ (VD: 18.1)</Form.Label><Form.Control value={formDataDM.order} onChange={e => setFormDataDM({...formDataDM, order: e.target.value})} /></Col>
          <Col md={6}><Form.Label className="fw-bold small">ICON</Form.Label><Form.Select value={formDataDM.icon} onChange={e => setFormDataDM({...formDataDM, icon: e.target.value})}><option value="">Icon</option>{ICON_LIST.map(i => <option key={i} value={i}>{i}</option>)}</Form.Select></Col></Row>
          {!editingDM && <Form.Group className="mb-4"><Form.Label className="fw-bold small">DANH MỤC CHA</Form.Label><Form.Select value={formDataDM.parent} onChange={e => setFormDataDM({...formDataDM, parent: e.target.value})}><option value="">Gốc</option>{dsDanhMuc.filter(d => !d.parent).map(d => <option key={d.id} value={d.customId || d.id}>{d.ten}</option>)}</Form.Select></Form.Group>}
          <Button variant="success" className="w-100 py-3 fw-bold rounded-pill shadow" onClick={handleSaveDM}>LƯU THÔNG TIN</Button>
        </Modal.Body>
      </Modal>

      {/* MODAL ĐỔI PASS */}
      <Modal show={showModalPass} onHide={() => setShowModalPass(false)} centered>
        <Modal.Header closeButton><Modal.Title className="fw-bold">BẢO MẬT ADMIN</Modal.Title></Modal.Header>
        <Modal.Body className="p-4">
          <Form.Group className="mb-3"><Form.Label className="small fw-bold">PASS CŨ</Form.Label><div className="password-input-wrapper"><Form.Control type={showOldPass ? "text" : "password"} onChange={e => setPassForm({...passForm, oldPass: e.target.value})} /><i className={`fa-solid fa-eye${showOldPass ? '-slash' : ''} password-eye-icon`} onClick={() => setShowOldPass(!showOldPass)}></i></div></Form.Group>
          <Form.Group className="mb-4"><Form.Label className="small fw-bold">PASS MỚI</Form.Label><div className="password-input-wrapper"><Form.Control type={showNewPass ? "text" : "password"} onChange={e => setPassForm({...passForm, newPass: e.target.value})} /><i className={`fa-solid fa-eye${showNewPass ? '-slash' : ''} password-eye-icon`} onClick={() => setShowNewPass(!showNewPass)}></i></div></Form.Group>
          <Button variant="success" className="w-100 py-3 fw-bold rounded-pill shadow" onClick={() => { if(passForm.oldPass === adminConfig.password) { setAdminConfig({...adminConfig, password: passForm.newPass}); alert('Thành công!'); setShowModalPass(false); } else alert('Sai pass!'); }}>CẬP NHẬT</Button>
        </Modal.Body>
      </Modal>

      {/* MODAL SẢN PHẨM */}
      <Modal show={showModalSP} onHide={() => setShowModalSP(false)} size="lg" centered>
        <Modal.Header closeButton><Modal.Title className="fw-bold">THÔNG TIN SẢN PHẨM</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form>
            <Row><Col md={8}><Form.Group className="mb-3"><Form.Label>Tên</Form.Label><Form.Control value={formDataSP.ten} onChange={e=>setFormDataSP({...formDataSP, ten: e.target.value})} /></Form.Group></Col><Col md={4}><Form.Group className="mb-3"><Form.Label>Giá bán (¥)</Form.Label><Form.Control type="number" value={formDataSP.giaBan} onChange={e=>setFormDataSP({...formDataSP, giaBan: e.target.value})} /></Form.Group></Col></Row>
            <Form.Group className="mb-3"><Form.Label>Link ảnh</Form.Label><Form.Control value={formDataSP.anh} onChange={e=>setFormDataSP({...formDataSP, anh: e.target.value})} /></Form.Group>
            <Form.Group className="mb-3"><Form.Label>Mô tả chi tiết</Form.Label><ReactQuill theme="snow" value={formDataSP.moTa} onChange={v=>setFormDataSP({...formDataSP, moTa: v})} /></Form.Group>
            <Button variant="success" className="w-100 py-3 fw-bold shadow" onClick={() => { handleUpdateDS_SP(editingSP ? 'UPDATE' : 'ADD', formDataSP); setShowModalSP(false); }}>LƯU DỮ LIỆU</Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
}
export default Admin;