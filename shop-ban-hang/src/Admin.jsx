import React, { useState, useEffect } from 'react';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import Badge from 'react-bootstrap/Badge';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import InputGroup from 'react-bootstrap/InputGroup';
import { Link } from 'react-router-dom';

function Admin({ dsSanPham, setDsSanPham, dsDanhMuc, setDsDanhMuc }) {
  // --- 1. QUẢN LÝ TÀI KHOẢN ADMIN ---
  const [adminConfig, setAdminConfig] = useState(() => {
      const saved = localStorage.getItem('adminConfig');
      return saved ? JSON.parse(saved) : { username: 'admin', password: 'admin123' };
  });

  useEffect(() => {
      localStorage.setItem('adminConfig', JSON.stringify(adminConfig));
  }, [adminConfig]);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginInput, setLoginInput] = useState({ username: '', password: '' });
  const [showModalPass, setShowModalPass] = useState(false);
  const [passForm, setPassForm] = useState({ oldPass: '', newPass: '', confirmPass: '' });

  function handleLogin() {
      if (loginInput.username === adminConfig.username && loginInput.password === adminConfig.password) {
          setIsLoggedIn(true);
      } else {
          alert("❌ Sai tên đăng nhập hoặc mật khẩu!");
      }
  }

  function handleChangePassword() {
      if (passForm.oldPass !== adminConfig.password) { alert("Mật khẩu cũ không đúng!"); return; }
      if (passForm.newPass !== passForm.confirmPass) { alert("Mật khẩu mới không khớp!"); return; }
      if (passForm.newPass.length < 6) { alert("Mật khẩu mới phải dài hơn 6 ký tự!"); return; }

      setAdminConfig({ ...adminConfig, password: passForm.newPass });
      alert("✅ Đổi mật khẩu thành công!");
      setShowModalPass(false);
      setPassForm({ oldPass: '', newPass: '', confirmPass: '' });
  }

  // --- 2. QUẢN LÝ SẢN PHẨM ---
  const [showModalSP, setShowModalSP] = useState(false);
  const [editingSP, setEditingSP] = useState(null);
  const [formDataSP, setFormDataSP] = useState({
      ten: '', gia: '', anh: '', phanLoai: 'thitca', 
      isKhuyenMai: false, isBanChay: false, isMoi: false
  });

  const handleImageUpload = (e) => {
      const file = e.target.files[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => setFormDataSP({ ...formDataSP, anh: reader.result });
          reader.readAsDataURL(file);
      }
  };

  function handleSaveSP() {
      if (!formDataSP.ten || !formDataSP.gia) { alert("Thiếu tên hoặc giá!"); return; }
      if (editingSP) {
          setDsSanPham(dsSanPham.map(sp => sp.id === editingSP.id ? { ...formDataSP, id: editingSP.id } : sp));
      } else {
          const newId = dsSanPham.length > 0 ? Math.max(...dsSanPham.map(s => s.id)) + 1 : 1;
          const sanPhamMoi = { ...formDataSP, id: newId, anh: formDataSP.anh || 'https://via.placeholder.com/150' };
          setDsSanPham([...dsSanPham, sanPhamMoi]);
      }
      setShowModalSP(false);
      setEditingSP(null);
      resetFormSP();
  }

  function handleEditSP(sp) {
      setEditingSP(sp);
      setFormDataSP(sp);
      setShowModalSP(true);
  }

  function handleDeleteSP(id) {
      if (window.confirm("Xóa sản phẩm này?")) setDsSanPham(dsSanPham.filter(sp => sp.id !== id));
  }

  function resetFormSP() {
      setFormDataSP({ ten: '', gia: '', anh: '', phanLoai: 'thitca', isKhuyenMai: false, isBanChay: false, isMoi: false });
  }

  // --- 3. QUẢN LÝ MENU (ĐÃ NÂNG CẤP: THÊM - SỬA - XÓA) ---
  const [formDataDM, setFormDataDM] = useState({ id: '', ten: '', icon: '' });
  
  // State mới cho việc Sửa Menu
  const [showModalEditDM, setShowModalEditDM] = useState(false);
  const [editingDM, setEditingDM] = useState(null); // Lưu danh mục đang sửa
  const [editFormDM, setEditFormDM] = useState({ id: '', ten: '', icon: '' });

  // Hàm thêm mới (Giữ nguyên)
  function handleAddDM() {
      if (!formDataDM.id || !formDataDM.ten) { alert("Vui lòng nhập Mã và Tên!"); return; }
      if (dsDanhMuc.some(dm => dm.id === formDataDM.id)) { alert("Mã danh mục này đã tồn tại!"); return; }
      
      setDsDanhMuc([...dsDanhMuc, formDataDM]);
      setFormDataDM({ id: '', ten: '', icon: '' });
  }

  // Hàm mở modal sửa
  function handleEditDM(dm) {
      setEditingDM(dm);
      setEditFormDM(dm); // Load dữ liệu cũ vào form sửa
      setShowModalEditDM(true);
  }

  // Hàm lưu sau khi sửa
  function handleSaveEditDM() {
      setDsDanhMuc(dsDanhMuc.map(dm => 
          dm.id === editingDM.id ? editFormDM : dm
      ));
      setShowModalEditDM(false);
      setEditingDM(null);
  }

  function handleDeleteDM(id) {
      if (id === 'all') { alert("Không thể xóa danh mục gốc!"); return; }
      if (window.confirm("Xóa danh mục này sẽ ảnh hưởng đến việc lọc sản phẩm. Bạn chắc chứ?")) {
          setDsDanhMuc(dsDanhMuc.filter(dm => dm.id !== id));
      }
  }

  // --- GIAO DIỆN ĐĂNG NHẬP ---
  if (!isLoggedIn) {
      return (
          <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'linear-gradient(135deg, #008848 0%, #e8f5e9 100%)' }}>
              <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '15px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', width: '100%', maxWidth: '400px', textAlign: 'center' }}>
                  <div style={{width: '80px', height: '80px', margin: '0 auto 20px', borderRadius: '50%', border: '3px solid #ffc107', padding: '5px'}}>
                     <img src="/img/logo.jpg" alt="Logo" style={{width: '100%', height: '100%', objectFit: 'contain', borderRadius: '50%'}} />
                  </div>
                  <h3 style={{ marginBottom: '5px', color: '#008848', fontWeight: 'bold' }}>QUẢN TRỊ VIÊN</h3>
                  <p style={{color: '#666', marginBottom: '25px'}}>Đăng nhập hệ thống Mai Vàng</p>
                  
                  <Form onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
                    <InputGroup className="mb-3">
                        <InputGroup.Text>👤</InputGroup.Text>
                        <Form.Control placeholder="Tên đăng nhập" value={loginInput.username} onChange={e => setLoginInput({...loginInput, username: e.target.value})} />
                    </InputGroup>
                    <InputGroup className="mb-4">
                        <InputGroup.Text>🔑</InputGroup.Text>
                        <Form.Control type="password" placeholder="Mật khẩu" value={loginInput.password} onChange={e => setLoginInput({...loginInput, password: e.target.value})} />
                    </InputGroup>
                    <Button variant="success" type="submit" style={{ width: '100%', padding: '12px', fontWeight: 'bold', fontSize: '16px' }}>ĐĂNG NHẬP</Button>
                  </Form>
                  
                  <div style={{marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '15px'}}>
                      <Link to="/" style={{color: '#008848', textDecoration: 'none'}}>← Quay về trang bán hàng</Link>
                  </div>
              </div>
          </div>
      )
  }

  // --- GIAO DIỆN QUẢN LÝ CHÍNH ---
  return (
    <div style={{ padding: '20px', backgroundColor: '#fff', minHeight: '100vh' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '2px solid #008848', paddingBottom: '15px' }}>
          <div>
            <h2 style={{ color: '#008848', margin: 0 }}>⚙️ HỆ THỐNG QUẢN TRỊ</h2>
            <small style={{color: '#666'}}>Xin chào, <strong>{adminConfig.username}</strong>!</small>
          </div>
          <div style={{display: 'flex', gap: '10px'}}>
            <Button variant="outline-primary" onClick={() => setShowModalPass(true)}>🔑 Đổi mật khẩu</Button>
            <Link to="/"><Button variant="outline-danger">⬅ Thoát về Trang chủ</Button></Link>
          </div>
      </div>

      <Tabs defaultActiveKey="products" id="admin-tabs" className="mb-3">
        
        {/* TAB 1: SẢN PHẨM */}
        <Tab eventKey="products" title="📦 Quản lý Sản phẩm">
            <Button variant="primary" className="mb-3" onClick={() => { setEditingSP(null); resetFormSP(); setShowModalSP(true); }}>+ Thêm sản phẩm mới</Button>
            <Table striped bordered hover responsive>
                <thead>
                    <tr><th>ID</th><th>Ảnh</th><th>Tên</th><th>Giá</th><th>Loại</th><th>Tags</th><th>Hành động</th></tr>
                </thead>
                <tbody>
                    {dsSanPham.map(sp => (
                        <tr key={sp.id}>
                            <td>{sp.id}</td>
                            <td><img src={sp.anh} alt="" style={{width: '50px', height: '50px', objectFit: 'cover', borderRadius: '5px'}} /></td>
                            <td style={{fontWeight: 'bold'}}>{sp.ten}</td>
                            <td style={{color: '#d63031'}}>{sp.gia}</td>
                            <td>{dsDanhMuc.find(dm => dm.id === sp.phanLoai)?.ten || sp.phanLoai}</td>
                            <td>
                                {sp.isKhuyenMai && <Badge bg="danger" className="me-1">Giảm giá</Badge>}
                                {sp.isBanChay && <Badge bg="warning" text="dark" className="me-1">Bán chạy</Badge>}
                                {sp.isMoi && <Badge bg="success">Mới</Badge>}
                            </td>
                            <td>
                                <Button size="sm" variant="warning" className="me-2" onClick={() => handleEditSP(sp)}>Sửa</Button>
                                <Button size="sm" variant="danger" onClick={() => handleDeleteSP(sp.id)}>Xóa</Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </Tab>

        {/* TAB 2: MENU (ĐÃ THÊM NÚT SỬA) */}
        <Tab eventKey="categories" title="📂 Quản lý Menu">
             <div style={{ maxWidth: '800px' }}>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', background: '#f9f9f9', padding: '15px', borderRadius: '10px' }}>
                    <input placeholder="Mã (vd: dokho)" className="form-control" value={formDataDM.id} onChange={e => setFormDataDM({...formDataDM, id: e.target.value})} />
                    <input placeholder="Tên (vd: Đồ Khô)" className="form-control" value={formDataDM.ten} onChange={e => setFormDataDM({...formDataDM, ten: e.target.value})} />
                    <input placeholder="Icon (vd: 🍪)" className="form-control" style={{width: '120px'}} value={formDataDM.icon} onChange={e => setFormDataDM({...formDataDM, icon: e.target.value})} />
                    <Button variant="success" onClick={handleAddDM} style={{whiteSpace: 'nowrap'}}>+ Thêm mới</Button>
                </div>
                
                <Table bordered hover>
                    <thead style={{background: '#f1f1f1'}}><tr><th>Mã danh mục</th><th>Tên hiển thị</th><th>Icon</th><th>Hành động</th></tr></thead>
                    <tbody>
                        {dsDanhMuc.map(dm => (
                            <tr key={dm.id}>
                                <td><code>{dm.id}</code></td>
                                <td style={{fontWeight: 'bold'}}>{dm.ten}</td>
                                <td style={{fontSize: '20px', textAlign: 'center'}}>{dm.icon}</td>
                                <td>
                                    {dm.id !== 'all' && (
                                        <>
                                            <Button size="sm" variant="warning" className="me-2" onClick={() => handleEditDM(dm)}>Sửa</Button>
                                            <Button size="sm" variant="danger" onClick={() => handleDeleteDM(dm.id)}>Xóa</Button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
             </div>
        </Tab>
      </Tabs>

      {/* MODAL THÊM/SỬA SẢN PHẨM */}
      <Modal show={showModalSP} onHide={() => setShowModalSP(false)} size="lg">
        <Modal.Header closeButton><Modal.Title>{editingSP ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm mới'}</Modal.Title></Modal.Header>
        <Modal.Body>
            <Form>
                <Form.Group className="mb-3"><Form.Label>Tên sản phẩm</Form.Label><Form.Control value={formDataSP.ten} onChange={e => setFormDataSP({...formDataSP, ten: e.target.value})} /></Form.Group>
                <div className="d-flex gap-3">
                    <Form.Group className="mb-3 flex-fill"><Form.Label>Giá tiền</Form.Label><Form.Control value={formDataSP.gia} onChange={e => setFormDataSP({...formDataSP, gia: e.target.value})} /></Form.Group>
                    <Form.Group className="mb-3 flex-fill"><Form.Label>Phân loại</Form.Label>
                        <Form.Select value={formDataSP.phanLoai} onChange={e => setFormDataSP({...formDataSP, phanLoai: e.target.value})}>
                            {dsDanhMuc.map(dm => <option key={dm.id} value={dm.id}>{dm.ten}</option>)}
                        </Form.Select>
                    </Form.Group>
                </div>
                <Form.Group className="mb-3">
                    <Form.Label>Hình ảnh sản phẩm</Form.Label>
                    <Form.Control type="file" accept="image/*" onChange={handleImageUpload} />
                    {formDataSP.anh && (<div style={{marginTop: '10px', border: '1px dashed #ccc', padding: '5px', display: 'inline-block', borderRadius: '5px'}}><img src={formDataSP.anh} alt="Preview" style={{height: '100px', objectFit: 'contain'}} /></div>)}
                </Form.Group>
                <div className="d-flex gap-3">
                    <Form.Check type="checkbox" label="🔥 Khuyến mãi sốc" checked={formDataSP.isKhuyenMai} onChange={e => setFormDataSP({...formDataSP, isKhuyenMai: e.target.checked})} />
                    <Form.Check type="checkbox" label="💎 Bán chạy nhất" checked={formDataSP.isBanChay} onChange={e => setFormDataSP({...formDataSP, isBanChay: e.target.checked})} />
                    <Form.Check type="checkbox" label="🆕 Hàng mới về" checked={formDataSP.isMoi} onChange={e => setFormDataSP({...formDataSP, isMoi: e.target.checked})} />
                </div>
            </Form>
        </Modal.Body>
        <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModalSP(false)}>Hủy</Button>
            <Button variant="primary" onClick={handleSaveSP}>Lưu thông tin</Button>
        </Modal.Footer>
      </Modal>

      {/* MODAL SỬA MENU (MỚI) */}
      <Modal show={showModalEditDM} onHide={() => setShowModalEditDM(false)}>
          <Modal.Header closeButton><Modal.Title>Sửa Danh Mục</Modal.Title></Modal.Header>
          <Modal.Body>
              <Form>
                  <Form.Group className="mb-3">
                      <Form.Label>Mã danh mục (Không thể sửa)</Form.Label>
                      <Form.Control type="text" value={editFormDM.id} disabled style={{backgroundColor: '#e9ecef'}} />
                      <Form.Text className="text-muted">Để sửa mã, vui lòng xóa đi tạo mới.</Form.Text>
                  </Form.Group>
                  <Form.Group className="mb-3">
                      <Form.Label>Tên hiển thị</Form.Label>
                      <Form.Control type="text" value={editFormDM.ten} onChange={e => setEditFormDM({...editFormDM, ten: e.target.value})} />
                  </Form.Group>
                  <Form.Group className="mb-3">
                      <Form.Label>Icon (Emoji)</Form.Label>
                      <Form.Control type="text" value={editFormDM.icon} onChange={e => setEditFormDM({...editFormDM, icon: e.target.value})} />
                  </Form.Group>
              </Form>
          </Modal.Body>
          <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowModalEditDM(false)}>Hủy</Button>
              <Button variant="primary" onClick={handleSaveEditDM}>Cập nhật</Button>
          </Modal.Footer>
      </Modal>

      {/* MODAL ĐỔI MẬT KHẨU */}
      <Modal show={showModalPass} onHide={() => setShowModalPass(false)}>
          <Modal.Header closeButton><Modal.Title>Đổi mật khẩu Admin</Modal.Title></Modal.Header>
          <Modal.Body>
              <Form>
                  <Form.Group className="mb-3"><Form.Label>Mật khẩu cũ</Form.Label><Form.Control type="password" value={passForm.oldPass} onChange={e => setPassForm({...passForm, oldPass: e.target.value})} /></Form.Group>
                  <Form.Group className="mb-3"><Form.Label>Mật khẩu mới</Form.Label><Form.Control type="password" value={passForm.newPass} onChange={e => setPassForm({...passForm, newPass: e.target.value})} /></Form.Group>
                  <Form.Group className="mb-3"><Form.Label>Nhập lại mật khẩu mới</Form.Label><Form.Control type="password" value={passForm.confirmPass} onChange={e => setPassForm({...passForm, confirmPass: e.target.value})} /></Form.Group>
              </Form>
          </Modal.Body>
          <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowModalPass(false)}>Hủy</Button>
              <Button variant="primary" onClick={handleChangePassword}>Xác nhận đổi</Button>
          </Modal.Footer>
      </Modal>

    </div>
  );
}

export default Admin;