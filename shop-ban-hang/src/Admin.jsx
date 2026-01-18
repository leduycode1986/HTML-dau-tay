import React, { useState, useEffect } from 'react';
import { Table, Button, Form, Modal, Badge, Tab, Tabs, Row, Col, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const NO_IMAGE = "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg";

function Admin({ dsSanPham, handleUpdateDS_SP, dsDanhMuc, handleUpdateDS_DM, dsDonHang, handleUpdateStatusOrder, handleDeleteOrder }) {
  const [adminConfig, setAdminConfig] = useState(() => JSON.parse(localStorage.getItem('adminConfig') || '{"username":"admin","password":"123"}'));
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginInput, setLoginInput] = useState({ username: '', password: '' });
  
  // State quản lý Modal
  const [showModalSP, setShowModalSP] = useState(false);
  const [editingSP, setEditingSP] = useState(null);
  const [formDataSP, setFormDataSP] = useState({ ten: '', giaGoc: '', phanTramGiam: 0, giaBan: '', donVi: 'Cái', soLuong: 10, moTa: '', anh: '', phanLoai: 'thitca', isKhuyenMai: false, isBanChay: false, isMoi: false });

  // Logic đăng nhập
  const handleLogin = (e) => {
    e.preventDefault();
    if (loginInput.username === adminConfig.username && loginInput.password === adminConfig.password) {
      setIsLoggedIn(true);
    } else {
      alert("Sai tài khoản hoặc mật khẩu!");
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFormDataSP({ ...formDataSP, anh: reader.result });
      reader.readAsDataURL(file);
    }
  };

  // --- GIAO DIỆN ĐĂNG NHẬP (Dùng Class từ style.css) ---
  if (!isLoggedIn) {
    return (
      <div className="admin-login-wrapper">
        <div className="admin-login-card">
          <h3>ADMIN LOGIN</h3>
          <Form onSubmit={handleLogin}>
            <Form.Control 
              className="mb-3 p-3" 
              placeholder="Username" 
              onChange={e => setLoginInput({...loginInput, username: e.target.value})} 
            />
            <Form.Control 
              type="password" 
              className="mb-4 p-3" 
              placeholder="Password" 
              onChange={e => setLoginInput({...loginInput, password: e.target.value})} 
            />
            <Button variant="success" type="submit" className="w-100 py-2 fw-bold">VÀO HỆ THỐNG</Button>
          </Form>
          <Link to="/" className="d-block mt-4 text-decoration-none text-success small">← Quay lại trang chủ</Link>
        </div>
      </div>
    );
  }

  // --- GIAO DIỆN QUẢN TRỊ CHÍNH (Dùng Class từ style.css) ---
  return (
    <div className="admin-main-container">
      <div className="admin-navbar">
        <h4 className="m-0 fw-bold">MAIVANG SHOP - QUẢN TRỊ</h4>
        <Link to="/"><Button variant="danger" size="sm">THOÁT</Button></Link>
      </div>

      <div className="admin-content-area">
        <Tabs defaultActiveKey="products" className="mb-4 bg-white p-2 rounded shadow-sm">
          <Tab eventKey="products" title="📦 Sản phẩm">
            <Button variant="primary" className="my-3 fw-bold" onClick={() => setShowModalSP(true)}>+ THÊM SẢN PHẨM</Button>
            <Table hover responsive className="bg-white border rounded">
              <thead className="table-light">
                <tr><th>Ảnh</th><th>Tên & Mô tả</th><th>Giá</th><th>Kho</th><th>Thao tác</th></tr>
              </thead>
              <tbody>
                {dsSanPham.map(sp => (
                  <tr key={sp.id}>
                    <td><img src={sp.anh || NO_IMAGE} className="admin-thumb" alt={sp.ten} /></td>
                    <td>
                      <div className="fw-bold text-success">{sp.ten}</div>
                      <div className="text-muted small text-truncate" style={{maxWidth: '250px'}}>
                        {sp.moTa ? sp.moTa.replace(/<[^>]*>?/gm, '') : 'Chưa có mô tả'}
                      </div>
                    </td>
                    <td className="text-danger fw-bold">{sp.giaBan?.toLocaleString()} ¥</td>
                    <td>{sp.soLuong}</td>
                    <td>
                      <Button size="sm" variant="warning" className="me-2">Sửa</Button>
                      <Button size="sm" variant="danger" onClick={() => handleUpdateDS_SP('DELETE', sp.id)}>Xóa</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Tab>
          
          <Tab eventKey="orders" title="📋 Đơn hàng">
            <div className="p-5 text-center text-muted bg-white border rounded">Danh sách đơn hàng sẽ hiện ở đây.</div>
          </Tab>
        </Tabs>
      </div>

      {/* Modal Thêm SP - Giữ nguyên logic ban đầu */}
      <Modal show={showModalSP} onHide={() => setShowModalSP(false)} size="lg">
        <Modal.Header closeButton><Modal.Title>Thêm Sản Phẩm Mới</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3"><Form.Label>Tên sản phẩm</Form.Label><Form.Control onChange={e => setFormDataSP({...formDataSP, ten: e.target.value})} /></Form.Group>
            <Form.Group className="mb-3"><Form.Label>Ảnh từ máy</Form.Label><Form.Control type="file" onChange={handleImageUpload} /></Form.Group>
            <Form.Group className="mb-3"><Form.Label>Mô tả chi tiết</Form.Label><ReactQuill theme="snow" value={formDataSP.moTa} onChange={val => setFormDataSP({...formDataSP, moTa: val})} /></Form.Group>
            <Button variant="primary" onClick={() => { handleUpdateDS_SP('ADD', formDataSP); setShowModalSP(false); }}>LƯU SẢN PHẨM</Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default Admin;