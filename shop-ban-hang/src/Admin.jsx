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
  
  // State Ẩn/Hiện mật khẩu
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);

  // State Quản lý Sản phẩm
  const [showModalSP, setShowModalSP] = useState(false);
  const [editingSP, setEditingSP] = useState(null);
  const [formDataSP, setFormDataSP] = useState({ ten: '', giaGoc: '', phanTramGiam: 0, giaBan: '', donVi: 'Cái', soLuong: 10, moTa: '', anh: '', phanLoai: '', isKhuyenMai: false, isMoi: false });
  
  // State Quản lý Danh mục
  const [formDataDM, setFormDataDM] = useState({ ten: '', icon: '', parent: '', order: 0 });
  
  // State Đổi mật khẩu
  const [showModalPass, setShowModalPass] = useState(false);
  const [passForm, setPassForm] = useState({ oldPass: '', newPass: '' });

  // Logic Đăng nhập
  const handleLogin = (e) => {
    e.preventDefault();
    if (loginInput.username === adminConfig.username && loginInput.password === adminConfig.password) setIsLoggedIn(true);
    else alert("Sai tài khoản hoặc mật khẩu!");
  };

  // Logic Đổi mật khẩu
  const handleChangePassword = () => {
    if (passForm.oldPass !== adminConfig.password) return alert("Mật khẩu cũ không chính xác!");
    if (passForm.newPass.length < 6) return alert("Mật khẩu mới phải từ 6 ký tự!");
    const newConfig = { ...adminConfig, password: passForm.newPass };
    setAdminConfig(newConfig);
    localStorage.setItem('adminConfig', JSON.stringify(newConfig));
    alert("Đã cập nhật mật khẩu mới!");
    setShowModalPass(false);
    setPassForm({ oldPass: '', newPass: '' });
  };

  // Sắp xếp Danh mục theo thứ tự (Order)
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
      <div className="admin-login-card shadow">
        <h3 className="text-success fw-bold">ADMIN LOGIN</h3>
        <Form onSubmit={handleLogin}>
          <Form.Control className="mb-3 p-3" placeholder="Tên đăng nhập" onChange={e => setLoginInput({...loginInput, username: e.target.value})} />
          <Form.Control type="password" className="mb-4 p-3" placeholder="Mật khẩu" onChange={e => setLoginInput({...loginInput, password: e.target.value})} />
          <Button variant="success" type="submit" className="w-100 py-2 fw-bold">ĐĂNG NHẬP</Button>
        </Form>
      </div>
    </div>
  );

  return (
    <div className="admin-main-container">
      <div className="admin-navbar d-flex justify-content-between align-items-center">
        <h4 className="m-0 fw-bold">MAIVANG SHOP - DASHBOARD</h4>
        <div className="d-flex gap-2">
          <Button variant="outline-light" size="sm" onClick={() => setShowModalPass(true)}>ĐỔI MẬT KHẨU</Button>
          <Link to="/"><Button variant="danger" size="sm">THOÁT</Button></Link>
        </div>
      </div>

      <div className="admin-content-area p-4">
        <Tabs defaultActiveKey="products" className="mb-4 bg-white p-2 rounded shadow-sm">
          
          {/* 1. QUẢN LÝ SẢN PHẨM */}
          <Tab eventKey="products" title="📦 SẢN PHẨM">
            <div className="d-flex justify-content-between align-items-center my-3">
              <Button variant="primary" className="fw-bold" onClick={() => { setEditingSP(null); setFormDataSP({ ten: '', giaGoc: '', phanTramGiam: 0, giaBan: '', donVi: 'Cái', soLuong: 10, moTa: '', anh: '', phanLoai: '', isKhuyenMai: false, isMoi: false }); setShowModalSP(true); }}>+ THÊM SẢN PHẨM MỚI</Button>
              <Badge bg="info">Tổng: {dsSanPham.length} SP</Badge>
            </div>
            <Table hover responsive className="bg-white border rounded align-middle">
              <thead className="table-light">
                <tr><th>Ảnh</th><th>Tên sản phẩm</th><th>Giá bán</th><th>Kho</th><th>Thao tác</th></tr>
              </thead>
              <tbody>
                {dsSanPham.map(sp => (
                  <tr key={sp.id}>
                    <td><img src={sp.anh || NO_IMAGE} className="admin-thumb" alt="" /></td>
                    <td>
                      <div className="fw-bold text-success">{sp.ten}</div>
                      <div className="text-muted small text-truncate" style={{maxWidth: '250px'}}>
                        {sp.moTa ? sp.moTa.replace(/<[^>]*>?/gm, '') : 'Không có mô tả'}
                      </div>
                    </td>
                    <td className="text-danger fw-bold">{Number(sp.giaBan).toLocaleString()} ¥</td>
                    <td>{sp.soLuong}</td>
                    <td>
                      <Button size="sm" variant="warning" className="me-2" onClick={() => { setEditingSP(sp); setFormDataSP(sp); setShowModalSP(true); }}>Sửa</Button>
                      <Button size="sm" variant="danger" onClick={() => { if(window.confirm('Xóa sản phẩm này?')) handleUpdateDS_SP('DELETE', sp.id) }}>Xóa</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Tab>

          {/* 2. QUẢN LÝ ĐƠN HÀNG */}
          <Tab eventKey="orders" title={`📋 ĐƠN HÀNG (${dsDonHang.length})`}>
            <Table hover responsive className="bg-white border rounded align-middle mt-3">
              <thead className="table-primary text-white">
                <tr><th>Ngày đặt</th><th>Khách hàng</th><th>Chi tiết sản phẩm</th><th>Tổng tiền</th><th>Trạng thái</th><th>Thao tác</th></tr>
              </thead>
              <tbody>
                {dsDonHang.map(dh => (
                  <tr key={dh.id} className="order-card">
                    <td>{dh.ngayDat?.toDate ? dh.ngayDat.toDate().toLocaleString('vi-VN') : 'Mới'}</td>
                    <td>
                      <div className="fw-bold">{dh.khachHang?.ten}</div>
                      <div className="small text-muted">{dh.khachHang?.sdt}</div>
                      <div className="small fst-italic">{dh.khachHang?.diachi}</div>
                    </td>
                    <td>
                      {dh.gioHang?.map((item, idx) => (
                        <div key={idx} className="small border-bottom mb-1 pb-1">
                          {item.ten} x <b>{item.soLuong}</b>
                        </div>
                      ))}
                    </td>
                    <td className="text-danger fw-bold">{dh.tongTien?.toLocaleString()} ¥</td>
                    <td><Badge bg={dh.trangThai === 'Mới đặt' ? 'primary' : 'success'}>{dh.trangThai}</Badge></td>
                    <td>
                      <div className="d-flex gap-2">
                        <Button size="sm" variant="success" onClick={() => handleUpdateStatusOrder(dh.id, 'Hoàn thành')}>Hoàn tất</Button>
                        <Button size="sm" variant="danger" onClick={() => { if(window.confirm('Xóa đơn hàng này?')) handleDeleteOrder(dh.id) }}>Xóa</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Tab>

          {/* 3. QUẢN LÝ DANH MỤC (MENU) */}
          <Tab eventKey="menu" title="📂 DANH MỤC">
            <div className="bg-white p-3 rounded border mt-3">
              <h5 className="fw-bold mb-3 text-success">Thêm danh mục / Menu</h5>
              <Row className="g-2 mb-4 p-3 bg-light rounded">
                <Col md={3}><Form.Control placeholder="Tên danh mục" value={formDataDM.ten} onChange={e => setFormDataDM({...formDataDM, ten: e.target.value})} /></Col>
                <Col md={2}>
                  <Form.Select value={formDataDM.icon} onChange={e => setFormDataDM({...formDataDM, icon: e.target.value})}>
                    <option value="">Chọn Icon</option>
                    {ICON_LIST.map(i => <option key={i} value={i}>{i}</option>)}
                  </Form.Select>
                </Col>
                <Col md={3}>
                  <Form.Select value={formDataDM.parent} onChange={e => setFormDataDM({...formDataDM, parent: e.target.value})}>
                    <option value="">Danh mục Gốc (Cha)</option>
                    {dsDanhMuc.filter(d => !d.parent).map(d => <option key={d.id} value={d.customId || d.id}>{d.ten}</option>)}
                  </Form.Select>
                </Col>
                <Col md={2}><Form.Control type="number" placeholder="Thứ tự" value={formDataDM.order} onChange={e => setFormDataDM({...formDataDM, order: e.target.value})} /></Col>
                <Col md={2}><Button variant="success" className="w-100 fw-bold" onClick={() => { handleUpdateDS_DM('ADD', formDataDM); setFormDataDM({ten:'', icon:'', parent:'', order:0}); }}>+ THÊM</Button></Col>
              </Row>

              <Table bordered hover className="align-middle">
                <thead className="table-light">
                  <tr><th width="100">Thứ tự</th><th>Tên danh mục</th><th className="text-center">Icon</th><th className="text-center">Thao tác</th></tr>
                </thead>
                <tbody>
                  {sortedDanhMuc.map(dm => (
                    <tr key={dm.id}>
                      <td>
                        <Form.Control size="sm" type="number" className="text-center fw-bold" defaultValue={dm.order || 0} 
                          onBlur={(e) => handleUpdateDS_DM('UPDATE', { ...dm, order: e.target.value })} 
                        />
                      </td>
                      <td>{dm.parent ? <span className="ms-4 text-muted">↳</span> : <Badge bg="success">Gốc</Badge>} <span className="ms-2 fw-bold">{dm.ten}</span></td>
                      <td className="text-center fs-5">{dm.icon}</td>
                      <td className="text-center">
                        <Button size="sm" variant="outline-danger" onClick={() => { if(window.confirm('Xóa danh mục này?')) handleUpdateDS_DM('DELETE', dm.id) }}>Xóa</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </Tab>
        </Tabs>
      </div>

      {/* MODAL SẢN PHẨM */}
      <Modal show={showModalSP} onHide={() => setShowModalSP(false)} size="lg" centered>
        <Modal.Header closeButton><Modal.Title className="fw-bold">{editingSP ? 'CẬP NHẬT SẢN PHẨM' : 'THÊM SẢN PHẨM MỚI'}</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3"><Form.Label>Tên sản phẩm</Form.Label><Form.Control value={formDataSP.ten} onChange={e=>setFormDataSP({...formDataSP, ten: e.target.value})} /></Form.Group>
                <Form.Group className="mb-3"><Form.Label>Phân loại</Form.Label>
                  <Form.Select value={formDataSP.phanLoai} onChange={e=>setFormDataSP({...formDataSP, phanLoai: e.target.value})}>
                    <option value="">Chọn danh mục</option>
                    {dsDanhMuc.map(d => <option key={d.id} value={d.customId || d.id}>{d.ten}</option>)}
                  </Form.Select>
                </Form.Group>
                <Row>
                  <Col md={6}><Form.Group className="mb-3"><Form.Label>Giá bán (¥)</Form.Label><Form.Control type="number" value={formDataSP.giaBan} onChange={e=>setFormDataSP({...formDataSP, giaBan: e.target.value})} /></Form.Group></Col>
                  <Col md={6}><Form.Group className="mb-3"><Form.Label>Số lượng kho</Form.Label><Form.Control type="number" value={formDataSP.soLuong} onChange={e=>setFormDataSP({...formDataSP, soLuong: e.target.value})} /></Form.Group></Col>
                </Row>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3"><Form.Label>Link ảnh sản phẩm</Form.Label><Form.Control value={formDataSP.anh} onChange={e=>setFormDataSP({...formDataSP, anh: e.target.value})} /></Form.Group>
                <div className="text-center border p-2 mb-3 rounded" style={{height: '180px'}}><img src={formDataSP.anh || NO_IMAGE} style={{height: '100%', objectFit: 'contain'}} alt="" /></div>
              </Col>
            </Row>
            <Form.Group className="mb-3"><Form.Label>Mô tả sản phẩm</Form.Label><ReactQuill theme="snow" value={formDataSP.moTa} onChange={(content) => setFormDataSP({...formDataSP, moTa: content})} style={{height: '150px', marginBottom: '50px'}} /></Form.Group>
            <div className="d-flex gap-4 mt-5">
              <Form.Check type="switch" label="Sản phẩm Mới" checked={formDataSP.isMoi} onChange={e=>setFormDataSP({...formDataSP, isMoi: e.target.checked})} />
              <Form.Check type="switch" label="Khuyến mãi" checked={formDataSP.isKhuyenMai} onChange={e=>setFormDataSP({...formDataSP, isKhuyenMai: e.target.checked})} />
            </div>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModalSP(false)}>Hủy</Button>
          <Button variant="success" className="px-5 fw-bold" onClick={() => { handleUpdateDS_SP(editingSP ? 'UPDATE' : 'ADD', formDataSP); setShowModalSP(false); }}>LƯU DỮ LIỆU</Button>
        </Modal.Footer>
      </Modal>

      {/* MODAL ĐỔI MẬT KHẨU (ẨN HIỆN) */}
      <Modal show={showModalPass} onHide={() => setShowModalPass(false)} centered>
        <Modal.Header closeButton><Modal.Title className="fw-bold">Bảo mật tài khoản</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label className="small fw-bold">MẬT KHẨU HIỆN TẠI</Form.Label>
            <div className="password-group">
              <Form.Control type={showOldPass ? "text" : "password"} value={passForm.oldPass} onChange={e => setPassForm({...passForm, oldPass: e.target.value})} />
              <i className={`fa-solid fa-eye${showOldPass ? '-slash' : ''} password-icon`} onClick={() => setShowOldPass(!showOldPass)}></i>
            </div>
          </Form.Group>
          <Form.Group className="mb-4">
            <Form.Label className="small fw-bold">MẬT KHẨU MỚI</Form.Label>
            <div className="password-group">
              <Form.Control type={showNewPass ? "text" : "password"} value={passForm.newPass} placeholder="Tối thiểu 6 ký tự" onChange={e => setPassForm({...passForm, newPass: e.target.value})} />
              <i className={`fa-solid fa-eye${showNewPass ? '-slash' : ''} password-icon`} onClick={() => setShowNewPass(!showNewPass)}></i>
            </div>
          </Form.Group>
          <Button variant="success" className="w-100 py-3 fw-bold rounded-pill" onClick={handleChangePassword}>CẬP NHẬT MẬT KHẨU</Button>
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default Admin;