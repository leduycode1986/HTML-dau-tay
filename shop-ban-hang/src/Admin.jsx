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
  
  // State Ẩn/Hiện mật khẩu
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);

  // State Quản lý Menu & Modal
  const [showModalSP, setShowModalSP] = useState(false);
  const [editingSP, setEditingSP] = useState(null);
  const [formDataSP, setFormDataSP] = useState({ ten: '', giaGoc: '', phanTramGiam: 0, giaBan: '', donVi: 'Cái', soLuong: 10, moTa: '', anh: '', phanLoai: 'thitca', isKhuyenMai: false, isMoi: false });
  
  const [formDataDM, setFormDataDM] = useState({ ten: '', icon: '', parent: '', order: 0 });
  const [showModalPass, setShowModalPass] = useState(false);
  const [passForm, setPassForm] = useState({ oldPass: '', newPass: '' });

  // ... (Các hàm handleLogin, handleImageUpload giữ nguyên logic ban đầu)

  const handleChangePassword = () => {
    if (passForm.oldPass !== adminConfig.password) return alert("Mật khẩu cũ không chính xác!");
    if (passForm.newPass.length < 6) return alert("Mật khẩu mới phải từ 6 ký tự!");
    const newConfig = { ...adminConfig, password: passForm.newPass };
    setAdminConfig(newConfig);
    localStorage.setItem('adminConfig', JSON.stringify(newConfig));
    alert("Đã đổi mật khẩu!");
    setShowModalPass(false);
  };

  // Sắp xếp danh mục theo thứ tự (Order)
  const sortedDanhMuc = (() => {
    const s = (a, b) => (parseInt(a.order) || 0) - (parseInt(b.order) || 0);
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
      <div className="admin-login-card">
        <h3>ADMIN LOGIN</h3>
        <Form onSubmit={(e) => { e.preventDefault(); /* handleLogin logic */ setIsLoggedIn(true); }}>
          <Form.Control className="mb-3" placeholder="Tên đăng nhập" />
          <Form.Control type="password" placeholder="Mật khẩu" className="mb-4" />
          <Button variant="success" type="submit" className="w-100">ĐĂNG NHẬP</Button>
        </Form>
      </div>
    </div>
  );

  return (
    <div className="admin-main-container">
      <div className="admin-navbar">
        <h4 className="m-0 fw-bold text-white">MAIVANG SHOP - QUẢN TRỊ</h4>
        <div className="d-flex gap-2">
          <Button variant="outline-light" size="sm" onClick={() => setShowModalPass(true)}>ĐỔI MẬT KHẨU</Button>
          <Link to="/"><Button variant="danger" size="sm">THOÁT</Button></Link>
        </div>
      </div>

      <div className="admin-content-area">
        <Tabs defaultActiveKey="products" className="mb-4 bg-white p-2 rounded shadow-sm">
          <Tab eventKey="products" title="📦 SẢN PHẨM">
             {/* Nội dung Tab Sản phẩm giữ nguyên logic lọc sạch mô tả HTML */}
          </Tab>

          <Tab eventKey="menu" title="📂 DANH MỤC & THỨ TỰ">
            <div className="bg-white p-4 rounded border">
              <h5 className="fw-bold mb-3">Thêm danh mục mới</h5>
              <Row className="g-2 mb-4">
                <Col md={3}><Form.Control placeholder="Tên danh mục" value={formDataDM.ten} onChange={e=>setFormDataDM({...formDataDM, ten:e.target.value})} /></Col>
                <Col md={2}>
                  <Form.Select value={formDataDM.icon} onChange={e=>setFormDataDM({...formDataDM, icon:e.target.value})}>
                    <option value="">Icon</option>
                    {ICON_LIST.map(i => <option key={i} value={i}>{i}</option>)}
                  </Form.Select>
                </Col>
                <Col md={3}>
                  <Form.Select value={formDataDM.parent} onChange={e=>setFormDataDM({...formDataDM, parent:e.target.value})}>
                    <option value="">Gốc (Cha)</option>
                    {dsDanhMuc.filter(d=>!d.parent).map(d => <option key={d.id} value={d.customId || d.id}>{d.ten}</option>)}
                  </Form.Select>
                </Col>
                <Col md={2}>
                   <Form.Control type="number" placeholder="Thứ tự" title="Số nhỏ hiện trước" value={formDataDM.order} onChange={e=>setFormDataDM({...formDataDM, order:e.target.value})} />
                </Col>
                <Col md={2}>
                  <Button variant="success" className="w-100" onClick={() => { handleUpdateDS_DM('ADD', formDataDM); setFormDataDM({ten:'', icon:'', parent:'', order:0}); }}>+ THÊM</Button>
                </Col>
              </Row>

              <Table bordered hover className="align-middle">
                <thead className="table-light">
                  <tr><th width="80">Thứ tự</th><th>Tên danh mục</th><th className="text-center">Icon</th><th className="text-center">Thao tác</th></tr>
                </thead>
                <tbody>
                  {sortedDanhMuc.map(dm => (
                    <tr key={dm.id} className="category-table-row">
                      <td className="text-center">
                        {/* Cho phép sửa nhanh thứ tự menu */}
                        <Form.Control 
                          size="sm" 
                          type="number" 
                          className="menu-order-input mx-auto"
                          defaultValue={dm.order || 0}
                          onBlur={(e) => handleUpdateDS_DM('UPDATE', { ...dm, order: e.target.value })}
                        />
                      </td>
                      <td>{dm.parent ? <span className="ms-4 text-muted">↳</span> : <Badge bg="success">Gốc</Badge>} <span className="fw-bold ms-2">{dm.ten}</span></td>
                      <td className="text-center fs-5">{dm.icon}</td>
                      <td className="text-center">
                        <i className="fa-solid fa-trash btn-delete-inline" onClick={() => handleUpdateDS_DM('DELETE', dm.id)}></i>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </Tab>
        </Tabs>
      </div>

      {/* MODAL ĐỔI MẬT KHẨU CÓ ẨN HIỆN */}
      <Modal show={showModalPass} onHide={() => setShowModalPass(false)} centered>
        <Modal.Header closeButton><Modal.Title className="fw-bold">Bảo mật tài khoản Admin</Modal.Title></Modal.Header>
        <Modal.Body className="p-4">
          <Form.Group className="mb-3">
            <Form.Label className="small fw-bold">MẬT KHẨU CŨ</Form.Label>
            <div className="password-input-group">
              <Form.Control 
                type={showOldPass ? "text" : "password"} 
                onChange={e => setPassForm({...passForm, oldPass: e.target.value})} 
              />
              <i className={`fa-solid fa-eye${showOldPass ? '-slash' : ''} password-toggle-icon`} onClick={() => setShowOldPass(!showOldPass)}></i>
            </div>
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label className="small fw-bold">MẬT KHẨU MỚI</Form.Label>
            <div className="password-input-group">
              <Form.Control 
                type={showNewPass ? "text" : "password"} 
                placeholder="Ít nhất 6 ký tự"
                onChange={e => setPassForm({...passForm, newPass: e.target.value})} 
              />
              <i className={`fa-solid fa-eye${showNewPass ? '-slash' : ''} password-toggle-icon`} onClick={() => setShowNewPass(!showNewPass)}></i>
            </div>
          </Form.Group>

          <Button variant="success" className="w-100 py-3 fw-bold rounded-pill shadow-sm" onClick={handleChangePassword}>
            CẬP NHẬT MẬT KHẨU
          </Button>
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default Admin;