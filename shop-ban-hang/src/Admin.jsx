import React, { useState, useEffect } from 'react';
import { Table, Button, Form, Modal, Badge, Tab, Tabs, Row, Col, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const NO_IMAGE = "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg";
const ICON_LIST = ['🔥', '⚡', '💎', '🆕', '🎁', '🏷️', '📦', '🥩', '🍗', '🍖', '🐟', '🦀', '🦐', '🐙', '🥚', '🥬', '🥦', '🥕', '🥔', '🍆', '🌽', '🍄', '🍅', '🍎', '🍇', '🍉', '🍌', '🍋', '🍊', '🍓', '🥭', '🥥', '🍚', '🌾', '🍞', '🥖', '🥪', '🥜', '🌰', '🍜', '🍝', '🍲', '🥣', '🥢', '🥡', '🥘', '🍾', '🧂', '🌶️', '🧄', '🧅', '🥫', '🍯', '🧈', '🍺', '🍷', '🥂', '🥤', '🧃', '☕', '🍵', '🍼', '🥛', '🧀', '🍦', '🍧', '🍰', '🍪', '🍫', '🍬', '🏠', '👶', '🧸', '🐶', '🐱'];

function Admin({ dsSanPham, handleUpdateDS_SP, dsDanhMuc, handleUpdateDS_DM, dsDonHang, handleUpdateStatusOrder, handleDeleteOrder }) {
  const [adminConfig, setAdminConfig] = useState(() => JSON.parse(localStorage.getItem('adminConfig') || '{"username":"admin","password":"123"}'));
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginInput, setLoginInput] = useState({ username: '', password: '' });
  
  // State quản lý Modal & Form
  const [showModalSP, setShowModalSP] = useState(false);
  const [editingSP, setEditingSP] = useState(null);
  const [formDataSP, setFormDataSP] = useState({ ten: '', giaGoc: '', phanTramGiam: 0, giaBan: '', donVi: 'Cái', soLuong: 10, moTa: '', anh: '', phanLoai: 'thitca', isKhuyenMai: false, isMoi: false });
  
  const [formDataDM, setFormDataDM] = useState({ ten: '', icon: '', parent: '' });
  const [showModalPass, setShowModalPass] = useState(false);
  const [passForm, setPassForm] = useState({ oldPass: '', newPass: '' });

  // Tính toán giá bán tự động
  useEffect(() => { 
    if(formDataSP.giaGoc) {
      const goc = parseInt(formDataSP.giaGoc) || 0;
      const giam = parseInt(formDataSP.phanTramGiam) || 0;
      setFormDataSP(prev => ({ ...prev, giaBan: Math.floor(goc * (1 - giam/100)) }));
    }
  }, [formDataSP.giaGoc, formDataSP.phanTramGiam]);

  // Logic Đăng nhập & Đổi Pass
  const handleLogin = (e) => {
    e.preventDefault();
    if (loginInput.username === adminConfig.username && loginInput.password === adminConfig.password) setIsLoggedIn(true);
    else alert("Sai tài khoản hoặc mật khẩu!");
  };

  const handleChangePassword = () => {
    if (passForm.oldPass !== adminConfig.password) return alert("Mật khẩu cũ không đúng!");
    const newConfig = { ...adminConfig, password: passForm.newPass };
    setAdminConfig(newConfig);
    localStorage.setItem('adminConfig', JSON.stringify(newConfig));
    alert("Đổi mật khẩu thành công!");
    setShowModalPass(false);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFormDataSP({ ...formDataSP, anh: reader.result });
      reader.readAsDataURL(file);
    }
  };

  // Sắp xếp danh mục cha-con
  const sortedDanhMuc = (() => {
    const roots = dsDanhMuc.filter(d => !d.parent);
    const children = dsDanhMuc.filter(d => d.parent);
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
        <Form onSubmit={handleLogin}>
          <Form.Control className="mb-3 p-3" placeholder="Username" onChange={e => setLoginInput({...loginInput, username: e.target.value})} />
          <Form.Control type="password" className="mb-4 p-3" placeholder="Password" onChange={e => setLoginInput({...loginInput, password: e.target.value})} />
          <Button variant="success" type="submit" className="w-100 py-2 fw-bold">VÀO HỆ THỐNG</Button>
        </Form>
      </div>
    </div>
  );

  return (
    <div className="admin-main-container">
      <div className="admin-navbar">
        <h4 className="m-0 fw-bold text-uppercase">MAIVANG SHOP - QUẢN TRỊ</h4>
        <div className="d-flex gap-2">
          <Button variant="light" size="sm" onClick={() => setShowModalPass(true)}>ĐỔI PASS</Button>
          <Link to="/"><Button variant="danger" size="sm">THOÁT</Button></Link>
        </div>
      </div>

      <div className="admin-content-area">
        <Tabs defaultActiveKey="products" className="mb-4 bg-white p-2 rounded shadow-sm">
          {/* TAB 1: SẢN PHẨM */}
          <Tab eventKey="products" title="📦 SẢN PHẨM">
            <Button variant="primary" className="my-3 fw-bold" onClick={() => { setEditingSP(null); setShowModalSP(true); }}>+ THÊM SẢN PHẨM</Button>
            <Table hover responsive className="bg-white border rounded align-middle">
              <thead className="table-light">
                <tr><th>Ảnh</th><th>Tên & Mô tả</th><th>Giá</th><th>Kho</th><th>Thao tác</th></tr>
              </thead>
              <tbody>
                {dsSanPham.map(sp => (
                  <tr key={sp.id}>
                    <td><img src={sp.anh || NO_IMAGE} className="admin-thumb" /></td>
                    <td>
                      <div className="fw-bold text-success">{sp.ten}</div>
                      <div className="text-muted small text-truncate" style={{maxWidth: '300px'}}>
                        {sp.moTa ? sp.moTa.replace(/<[^>]*>?/gm, '') : ''}
                      </div>
                    </td>
                    <td className="text-danger fw-bold">{sp.giaBan?.toLocaleString()} ¥</td>
                    <td>{sp.soLuong}</td>
                    <td>
                      <Button size="sm" variant="warning" className="me-2" onClick={() => { setEditingSP(sp); setFormDataSP(sp); setShowModalSP(true); }}>Sửa</Button>
                      <Button size="sm" variant="danger" onClick={() => handleUpdateDS_SP('DELETE', sp.id)}>Xóa</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Tab>

          {/* TAB 2: ĐƠN HÀNG */}
          <Tab eventKey="orders" title={`📋 ĐƠN HÀNG (${dsDonHang.length})`}>
            <Table hover responsive className="bg-white border rounded align-middle mt-3">
              <thead className="table-primary">
                <tr><th>Ngày</th><th>Khách hàng</th><th>Tổng tiền</th><th>Trạng thái</th><th>Thao tác</th></tr>
              </thead>
              <tbody>
                {dsDonHang.map(dh => (
                  <tr key={dh.id}>
                    <td>{dh.ngayDat?.toDate ? dh.ngayDat.toDate().toLocaleString('vi-VN') : 'Mới'}</td>
                    <td><b>{dh.khachHang?.ten}</b><br/><small>{dh.khachHang?.sdt}</small></td>
                    <td className="text-danger fw-bold">{dh.tongTien?.toLocaleString()} ¥</td>
                    <td><Badge bg={dh.trangThai === 'Mới đặt' ? 'primary' : 'success'}>{dh.trangThai}</Badge></td>
                    <td>
                      <Button size="sm" variant="success" className="me-2" onClick={() => handleUpdateStatusOrder(dh.id, 'Hoàn thành')}>Xong</Button>
                      <Button size="sm" variant="danger" onClick={() => handleDeleteOrder(dh.id)}>Xóa</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Tab>

          {/* TAB 3: DANH MỤC (MENU) */}
          <Tab eventKey="menu" title="📂 DANH MỤC">
            <div className="bg-white p-3 rounded border mt-3">
              <div className="d-flex gap-2 mb-4">
                <Form.Control placeholder="Tên danh mục" value={formDataDM.ten} onChange={e => setFormDataDM({...formDataDM, ten: e.target.value})} />
                <Form.Select value={formDataDM.icon} onChange={e => setFormDataDM({...formDataDM, icon: e.target.value})}>
                  <option value="">Chọn Icon</option>
                  {ICON_LIST.map(i => <option key={i} value={i}>{i}</option>)}
                </Form.Select>
                <Form.Select value={formDataDM.parent} onChange={e => setFormDataDM({...formDataDM, parent: e.target.value})}>
                  <option value="">Danh mục Gốc</option>
                  {dsDanhMuc.filter(d => !d.parent).map(d => <option key={d.id} value={d.customId || d.id}>{d.ten}</option>)}
                </Form.Select>
                <Button variant="success" onClick={() => { handleUpdateDS_DM('ADD', formDataDM); setFormDataDM({ten:'', icon:'', parent:''}); }}>+ THÊM</Button>
              </div>
              <Table bordered hover>
                <thead><tr><th>Tên danh mục</th><th>Icon</th><th>Thao tác</th></tr></thead>
                <tbody>
                  {sortedDanhMuc.map(dm => (
                    <tr key={dm.id}>
                      <td>{dm.parent ? <span className="ms-4 text-muted">↳</span> : <Badge bg="success">Gốc</Badge>} <b>{dm.ten}</b></td>
                      <td className="text-center">{dm.icon}</td>
                      <td><Button size="sm" variant="danger" onClick={() => handleUpdateDS_DM('DELETE', dm.id)}>Xóa</Button></td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </Tab>
        </Tabs>
      </div>

      {/* MODAL SẢN PHẨM */}
      <Modal show={showModalSP} onHide={() => setShowModalSP(false)} size="lg">
        <Modal.Header closeButton><Modal.Title>{editingSP ? 'Cập nhật' : 'Thêm mới'}</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={8}><Form.Group className="mb-3"><Form.Label>Tên SP</Form.Label><Form.Control value={formDataSP.ten} onChange={e => setFormDataSP({...formDataSP, ten: e.target.value})} /></Form.Group></Col>
              <Col md={4}><Form.Group className="mb-3"><Form.Label>Phân loại</Form.Label><Form.Select value={formDataSP.phanLoai} onChange={e => setFormDataSP({...formDataSP, phanLoai: e.target.value})}>{dsDanhMuc.map(d => <option key={d.id} value={d.customId || d.id}>{d.ten}</option>)}</Form.Select></Form.Group></Col>
            </Row>
            <Row className="bg-light p-3 rounded mb-3">
              <Col><Form.Label>Giá Gốc</Form.Label><Form.Control type="number" value={formDataSP.giaGoc} onChange={e => setFormDataSP({...formDataSP, giaGoc: e.target.value})} /></Col>
              <Col><Form.Label>% Giảm</Form.Label><Form.Control type="number" value={formDataSP.phanTramGiam} onChange={e => setFormDataSP({...formDataSP, phanTramGiam: e.target.value})} /></Col>
              <Col><Form.Label className="text-danger fw-bold">Giá Bán</Form.Label><Form.Control value={formDataSP.giaBan} readOnly /></Col>
            </Row>
            <Form.Group className="mb-3"><Form.Label>Ảnh (Tải lên)</Form.Label><Form.Control type="file" onChange={handleImageUpload} /></Form.Group>
            <Form.Group className="mb-3"><Form.Label>Mô tả chi tiết</Form.Label><ReactQuill theme="snow" value={formDataSP.moTa} onChange={v => setFormDataSP({...formDataSP, moTa: v})} /></Form.Group>
            <Button className="w-100" onClick={() => { handleUpdateDS_SP(editingSP ? 'UPDATE' : 'ADD', formDataSP); setShowModalSP(false); }}>LƯU LẠI</Button>
          </Form>
        </Modal.Body>
      </Modal>

      {/* MODAL ĐỔI PASS */}
      <Modal show={showModalPass} onHide={() => setShowModalPass(false)}>
        <Modal.Header closeButton><Modal.Title>Đổi mật khẩu Admin</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form.Control className="mb-2" type="password" placeholder="Mật khẩu cũ" onChange={e => setPassForm({...passForm, oldPass: e.target.value})} />
          <Form.Control className="mb-3" type="password" placeholder="Mật khẩu mới" onChange={e => setPassForm({...passForm, newPass: e.target.value})} />
          <Button variant="success" className="w-100" onClick={handleChangePassword}>XÁC NHẬN ĐỔI</Button>
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default Admin;