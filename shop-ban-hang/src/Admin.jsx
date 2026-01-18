import React, { useState, useEffect } from 'react';
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
  
  // Quản lý hiển thị Modal
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showModalSP, setShowModalSP] = useState(false);
  const [editingSP, setEditingSP] = useState(null);
  
  // State Sản phẩm
  const [formDataSP, setFormDataSP] = useState({ 
    ten: '', giaGoc: '', phanTramGiam: 0, giaBan: '', donVi: 'Cái', soLuong: 10, moTa: '', anh: '', phanLoai: '',
    isMoi: false, isKhuyenMai: false, isBanChay: false 
  });

  // State Danh mục & Mật khẩu
  const [showModalDM, setShowModalDM] = useState(false);
  const [editingDM, setEditingDM] = useState(null);
  const [formDataDM, setFormDataDM] = useState({ ten: '', icon: '', parent: '', order: '' });
  const [showModalPass, setShowModalPass] = useState(false);
  const [passForm, setPassForm] = useState({ oldPass: '', newPass: '' });

  // Tự động tính giá bán
  useEffect(() => {
    const goc = parseInt(formDataSP.giaGoc) || 0;
    const giam = parseInt(formDataSP.phanTramGiam) || 0;
    setFormDataSP(prev => ({ ...prev, giaBan: goc > 0 ? Math.floor(goc * (1 - giam / 100)) : '' }));
  }, [formDataSP.giaGoc, formDataSP.phanTramGiam]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFormDataSP({ ...formDataSP, anh: reader.result });
      reader.readAsDataURL(file);
    }
  };

  // Sắp xếp Menu phân cấp 18.1, 18.2
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

  if (!isLoggedIn) return (
    <div className="admin-login-wrapper">
      <div className="admin-login-card shadow">
        <h3>ADMIN LOGIN</h3>
        <Form onSubmit={(e) => { e.preventDefault(); if (loginInput.username === adminConfig.username && loginInput.password === adminConfig.password) setIsLoggedIn(true); else alert("Sai thông tin!"); }}>
          <Form.Control className="mb-3 p-3" placeholder="Username" onChange={e => setLoginInput({...loginInput, username: e.target.value})} />
          <Form.Control type="password" className="mb-4 p-3" placeholder="Password" onChange={e => setLoginInput({...loginInput, password: e.target.value})} />
          <Button variant="success" type="submit" className="w-100 py-3 fw-bold rounded-pill">ĐĂNG NHẬP</Button>
        </Form>
      </div>
    </div>
  );

  return (
    <div className="admin-main-container">
      <div className="admin-navbar">
        <h4 className="m-0 fw-bold">MAIVANG SHOP - QUẢN TRỊ</h4>
        <div className="d-flex gap-2">
          <Button variant="outline-light" size="sm" onClick={() => setShowModalPass(true)}>ĐỔI PASS</Button>
          <Link to="/"><Button variant="danger" size="sm">THOÁT</Button></Link>
        </div>
      </div>

      <div className="p-4">
        <Tabs defaultActiveKey="products" className="mb-4 bg-white p-2 rounded shadow-sm">
          {/* TAB 1: QUẢN LÝ SẢN PHẨM */}
          <Tab eventKey="products" title="📦 SẢN PHẨM">
            <Button variant="primary" className="my-3 fw-bold" onClick={() => { setEditingSP(null); setFormDataSP({ ten: '', giaGoc: '', phanTramGiam: 0, giaBan: '', donVi: 'Cái', soLuong: 10, moTa: '', anh: '', phanLoai: '', isMoi: false, isKhuyenMai: false, isBanChay: false }); setShowModalSP(true); }}>+ THÊM SẢN PHẨM</Button>
            <Table hover responsive className="bg-white border rounded align-middle">
              <thead className="table-light"><tr><th>Ảnh</th><th>Tên sản phẩm & Nhãn</th><th>Giá</th><th>Thao tác</th></tr></thead>
              <tbody>{dsSanPham.map(sp => (
                <tr key={sp.id}>
                  <td width="100">
                    <div className="product-image-wrapper">
                      <img src={sp.anh || NO_IMAGE} className="admin-thumb" alt="" />
                      <div className="badge-overlay">
                        {sp.isMoi && <span className="badge-item badge-new">Mới</span>}
                        {sp.isBanChay && <span className="badge-item badge-hot">Hot</span>}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="fw-bold text-success">{sp.ten}</div>
                    <div className="d-flex gap-1 mt-1">
                      {sp.isMoi && <Badge bg="success">NEW</Badge>}
                      {sp.isBanChay && <Badge bg="danger">HOT</Badge>}
                      {sp.isKhuyenMai && <Badge bg="warning" text="dark">SALE</Badge>}
                    </div>
                  </td>
                  <td>
                    {sp.phanTramGiam > 0 ? (
                      <div><span className="price-original">{sp.giaGoc} ¥</span> <span className="price-sale">{sp.giaBan} ¥</span></div>
                    ) : <span className="price-sale">{sp.giaGoc} ¥</span>}
                  </td>
                  <td>
                    <Button size="sm" variant="warning" className="me-2" onClick={() => { setEditingSP(sp); setFormDataSP(sp); setShowModalSP(true); }}>Sửa</Button>
                    <Button size="sm" variant="danger" onClick={() => { if(window.confirm('Xóa?')) handleUpdateDS_SP('DELETE', sp.id) }}>Xóa</Button>
                  </td>
                </tr>
              ))}</tbody>
            </Table>
          </Tab>

          {/* TAB 2: QUẢN LÝ ĐƠN HÀNG */}
          <Tab eventKey="orders" title={`📋 ĐƠN HÀNG (${dsDonHang.length})`}>
            <Table hover responsive className="bg-white border rounded align-middle mt-3">
              <thead className="table-primary text-white"><tr><th>Ngày đặt</th><th>Khách hàng</th><th>Tổng tiền</th><th>Thao tác</th></tr></thead>
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

          {/* TAB 3: QUẢN LÝ DANH MỤC */}
          <Tab eventKey="menu" title="📂 DANH MỤC">
            <div className="bg-white p-3 rounded border mt-3">
              <Button variant="success" className="mb-3 fw-bold" onClick={() => { setEditingDM(null); setFormDataDM({ten:'', icon:'', parent:'', order:''}); setShowModalDM(true); }}>+ THÊM MENU</Button>
              <Table bordered hover className="align-middle">
                <thead><tr><th width="100">Thứ tự</th><th>Tên danh mục</th><th>Icon</th><th className="text-end">Thao tác</th></tr></thead>
                <tbody>{sortedDanhMuc.map(dm => (
                  <tr key={dm.id} className={dm.parent ? "category-row-child" : "category-row-parent"}>
                    <td className="text-center">
                      <Form.Control size="sm" type="text" className="menu-order-input mx-auto" defaultValue={dm.order} onBlur={(e) => handleUpdateDS_DM('UPDATE', { ...dm, order: e.target.value })} />
                    </td>
                    <td>{dm.parent ? <span className="ms-4 text-muted">↳</span> : <Badge bg="success">Gốc</Badge>} <b>{dm.ten}</b></td>
                    <td className="text-center fs-5">{dm.icon || 'None'}</td>
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

      {/* CÁC MODAL HỆ THỐNG */}
      <Modal show={showModalSP} onHide={() => setShowModalSP(false)} size="lg" centered>
        <Modal.Header closeButton><Modal.Title className="fw-bold text-success">THÔNG TIN SẢN PHẨM</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={8}>
                <Form.Group className="mb-3"><Form.Label className="fw-bold">Tên SP</Form.Label><Form.Control value={formDataSP.ten} onChange={e=>setFormDataSP({...formDataSP, ten: e.target.value})} /></Form.Group>
                <Row>
                  <Col md={4}><Form.Group className="mb-3"><Form.Label>Giá Gốc</Form.Label><Form.Control type="number" value={formDataSP.giaGoc} onChange={e=>setFormDataSP({...formDataSP, giaGoc: e.target.value})} /></Form.Group></Col>
                  <Col md={4}><Form.Group className="mb-3"><Form.Label>% Giảm</Form.Label><Form.Control type="number" value={formDataSP.phanTramGiam} onChange={e=>setFormDataSP({...formDataSP, phanTramGiam: e.target.value})} /></Form.Group></Col>
                  <Col md={4}><Form.Group className="mb-3"><Form.Label className="text-danger">Giá Bán</Form.Label><Form.Control value={formDataSP.giaBan} readOnly className="bg-light fw-bold text-danger" /></Form.Group></Col>
                </Row>
                <div className="bg-light p-3 rounded mb-3 d-flex gap-3 flex-wrap">
                  <Form.Check type="switch" label="Sản phẩm MỚI" checked={formDataSP.isMoi} onChange={e=>setFormDataSP({...formDataSP, isMoi: e.target.checked})} />
                  <Form.Check type="switch" label="BÁN CHẠY (HOT)" checked={formDataSP.isBanChay} onChange={e=>setFormDataSP({...formDataSP, isBanChay: e.target.checked})} />
                  <Form.Check type="switch" label="KHUYẾN MÃI" checked={formDataSP.isKhuyenMai} onChange={e=>setFormDataSP({...formDataSP, isKhuyenMai: e.target.checked})} />
                </div>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">Ảnh (Từ máy tính)</Form.Label>
                  <Form.Control type="file" onChange={handleImageUpload} />
                  <div className="mt-2 border p-2 text-center bg-white"><img src={formDataSP.anh || NO_IMAGE} style={{maxHeight:'150px', maxWidth:'100%'}} alt="" /></div>
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3"><Form.Label>Mô tả chi tiết</Form.Label><ReactQuill theme="snow" value={formDataSP.moTa} onChange={v=>setFormDataSP({...formDataSP, moTa: v})} /></Form.Group>
            <Button variant="success" className="w-100 py-3 fw-bold rounded-pill" onClick={() => { handleUpdateDS_SP(editingSP ? 'UPDATE' : 'ADD', formDataSP); setShowModalSP(false); }}>LƯU DỮ LIỆU</Button>
          </Form>
        </Modal.Body>
      </Modal>

      <Modal show={showModalDM} onHide={() => setShowModalDM(false)} centered>
        <Modal.Header closeButton><Modal.Title className="fw-bold text-success">CÀI ĐẶT MENU</Modal.Title></Modal.Header>
        <Modal.Body className="p-4">
          <Form.Group className="mb-3"><Form.Label className="fw-bold small">TÊN MENU</Form.Label><Form.Control value={formDataDM.ten} onChange={e => setFormDataDM({...formDataDM, ten: e.target.value})} /></Form.Group>
          <Row className="mb-3">
            <Col><Form.Label className="fw-bold small">THỨ TỰ (VD: 18.1)</Form.Label><Form.Control value={formDataDM.order} onChange={e => setFormDataDM({...formDataDM, order: e.target.value})} /></Col>
            <Col><Form.Label className="fw-bold small">ICON</Form.Label><Form.Select value={formDataDM.icon} onChange={e => setFormDataDM({...formDataDM, icon: e.target.value})}><option value="">None</option>{ICON_LIST.map(i => <option key={i} value={i}>{i}</option>)}</Form.Select></Col>
          </Row>
          {!editingDM && <Form.Group className="mb-4"><Form.Label className="fw-bold small">DANH MỤC CHA</Form.Label><Form.Select value={formDataDM.parent} onChange={e => setFormDataDM({...formDataDM, parent: e.target.value})}><option value="">Gốc</option>{dsDanhMuc.filter(d => !d.parent).map(d => <option key={d.id} value={d.customId || d.id}>{d.ten}</option>)}</Form.Select></Form.Group>}
          <Button variant="success" className="w-100 py-3 fw-bold rounded-pill" onClick={() => { handleUpdateDS_DM(editingDM ? 'UPDATE' : 'ADD', formDataDM); setShowModalDM(false); }}>LƯU MENU</Button>
        </Modal.Body>
      </Modal>

      <Modal show={showModalPass} onHide={() => setShowModalPass(false)} centered>
        <Modal.Header closeButton><Modal.Title className="fw-bold">BẢO MẬT ADMIN</Modal.Title></Modal.Header>
        <Modal.Body className="p-4">
          <Form.Group className="mb-3"><Form.Label className="small fw-bold text-muted">MẬT KHẨU CŨ</Form.Label>
            <div className="password-input-wrapper"><Form.Control type={showOldPass ? "text" : "password"} onChange={e => setPassForm({...passForm, oldPass: e.target.value})} /><i className={`fa-solid fa-eye${showOldPass ? '-slash' : ''} password-eye-icon`} onClick={() => setShowOldPass(!showOldPass)}></i></div>
          </Form.Group>
          <Form.Group className="mb-4"><Form.Label className="small fw-bold text-muted">MẬT KHẨU MỚI</Form.Label>
            <div className="password-input-wrapper"><Form.Control type={showNewPass ? "text" : "password"} onChange={e => setPassForm({...passForm, newPass: e.target.value})} /><i className={`fa-solid fa-eye${showNewPass ? '-slash' : ''} password-eye-icon`} onClick={() => setShowNewPass(!showNewPass)}></i></div>
          </Form.Group>
          <Button variant="success" className="w-100 py-3 fw-bold rounded-pill shadow" onClick={() => { if (passForm.oldPass === adminConfig.password) { setAdminConfig({...adminConfig, password: passForm.newPass}); alert("Thành công!"); setShowModalPass(false); } else alert("Sai pass!"); }}>CẬP NHẬT PASS</Button>
        </Modal.Body>
      </Modal>
    </div>
  );
}
export default Admin;