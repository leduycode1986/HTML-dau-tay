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

// Nhận các hàm xử lý Firebase từ App truyền xuống
function Admin({ dsSanPham, handleUpdateDS_SP, dsDanhMuc, handleUpdateDS_DM }) {
  
  // --- 1. QUẢN LÝ TÀI KHOẢN ADMIN (Lưu ở máy cá nhân) ---
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
      if (passForm.oldPass !== adminConfig.password) return alert("Mật khẩu cũ không đúng!");
      if (passForm.newPass !== passForm.confirmPass) return alert("Mật khẩu mới không khớp!");
      if (passForm.newPass.length < 6) return alert("Mật khẩu phải dài hơn 6 ký tự!");

      setAdminConfig({ ...adminConfig, password: passForm.newPass });
      alert("✅ Đổi mật khẩu thành công!");
      setShowModalPass(false);
      setPassForm({ oldPass: '', newPass: '', confirmPass: '' });
  }

  // --- 2. QUẢN LÝ SẢN PHẨM (GỌI FIREBASE) ---
  const [showModalSP, setShowModalSP] = useState(false);
  const [editingSP, setEditingSP] = useState(null);
  const [formDataSP, setFormDataSP] = useState({
      ten: '', gia: '', anh: '', phanLoai: 'thitca', 
      isKhuyenMai: false, isBanChay: false, isMoi: false
  });

  // Hàm xử lý chọn ảnh từ máy tính
  const handleImageUpload = (e) => {
      const file = e.target.files[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => setFormDataSP({ ...formDataSP, anh: reader.result });
          reader.readAsDataURL(file);
      }
  };

  function handleSaveSP() {
      if (!formDataSP.ten || !formDataSP.gia) return alert("Vui lòng nhập Tên và Giá!");
      
      if (editingSP) {
          // Gửi lệnh UPDATE lên Firebase
          handleUpdateDS_SP('UPDATE', { ...formDataSP, id: editingSP.id });
      } else {
          // Gửi lệnh ADD lên Firebase
          // (Không cần tạo ID, Firebase tự tạo, nhưng cần ảnh mặc định nếu thiếu)
          handleUpdateDS_SP('ADD', { 
              ...formDataSP, 
              anh: formDataSP.anh || 'https://via.placeholder.com/150' 
          });
      }
      setShowModalSP(false); setEditingSP(null); resetFormSP();
  }

  function handleEditSP(sp) {
      setEditingSP(sp);
      setFormDataSP(sp);
      setShowModalSP(true);
  }

  function handleDeleteSP(id) {
      if (window.confirm("Bạn chắc chắn muốn xóa sản phẩm này?")) {
          // Gửi lệnh DELETE lên Firebase
          handleUpdateDS_SP('DELETE', id);
      }
  }

  function resetFormSP() {
      setFormDataSP({ ten: '', gia: '', anh: '', phanLoai: 'thitca', isKhuyenMai: false, isBanChay: false, isMoi: false });
  }

  // --- 3. QUẢN LÝ MENU (GỌI FIREBASE) ---
  const [formDataDM, setFormDataDM] = useState({ id: '', ten: '', icon: '', parent: '' });
  const [showModalEditDM, setShowModalEditDM] = useState(false);
  const [editingDM, setEditingDM] = useState(null);
  const [editFormDM, setEditFormDM] = useState({ id: '', ten: '', icon: '', parent: '' });

  function handleAddDM() {
      if (!formDataDM.ten) return alert("Vui lòng nhập Tên danh mục!");
      
      // Gửi lệnh ADD danh mục lên Firebase
      const newDM = {
          ten: formDataDM.ten,
          icon: formDataDM.icon || '📦',
          parent: formDataDM.parent || null,
          customId: formDataDM.id // Lưu mã riêng (vd: thitheo) để dùng lọc
      };
      handleUpdateDS_DM('ADD', newDM);
      setFormDataDM({ id: '', ten: '', icon: '', parent: '' });
  }

  function handleEditDM(dm) {
      setEditingDM(dm);
      setEditFormDM(dm);
      setShowModalEditDM(true);
  }

  function handleSaveEditDM() {
      // Gửi lệnh UPDATE danh mục lên Firebase
      handleUpdateDS_DM('UPDATE', editFormDM);
      setShowModalEditDM(false);
      setEditingDM(null);
  }

  function handleDeleteDM(id) {
      if (id === 'all') return alert("Không thể xóa danh mục gốc!");
      if (window.confirm("Xóa danh mục này sẽ ảnh hưởng đến sản phẩm. Tiếp tục?")) {
          // Gửi lệnh DELETE danh mục lên Firebase
          handleUpdateDS_DM('DELETE', id);
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
                  <Form onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
                    <InputGroup className="mb-3">
                        <InputGroup.Text>👤</InputGroup.Text>
                        <Form.Control placeholder="Tên đăng nhập" value={loginInput.username} onChange={e => setLoginInput({...loginInput, username: e.target.value})} />
                    </InputGroup>
                    <InputGroup className="mb-4">
                        <InputGroup.Text>🔑</InputGroup.Text>
                        <Form.Control type="password" placeholder="Mật khẩu" value={loginInput.password} onChange={e => setLoginInput({...loginInput, password: e.target.value})} />
                    </InputGroup>
                    <Button variant="success" type="submit" style={{ width: '100%', padding: '12px', fontWeight: 'bold' }}>ĐĂNG NHẬP</Button>
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
            <Link to="/"><Button variant="outline-danger">⬅ Thoát</Button></Link>
          </div>
      </div>

      <Tabs defaultActiveKey="products" className="mb-3">
        
        {/* TAB 1: SẢN PHẨM */}
        <Tab eventKey="products" title="📦 Quản lý Sản phẩm">
            <Button variant="primary" className="mb-3" onClick={() => { setEditingSP(null); resetFormSP(); setShowModalSP(true); }}>+ Thêm sản phẩm mới</Button>
            <Table striped bordered hover responsive>
                <thead><tr><th>Ảnh</th><th>Tên</th><th>Giá</th><th>Danh mục</th><th>Tags</th><th>Hành động</th></tr></thead>
                <tbody>
                    {dsSanPham.map(sp => (
                        <tr key={sp.id}>
                            <td><img src={sp.anh} alt="" style={{width: '50px', height: '50px', objectFit: 'cover', borderRadius: '5px'}} /></td>
                            <td style={{fontWeight: 'bold'}}>{sp.ten}</td>
                            <td style={{color: '#d63031'}}>{sp.gia}</td>
                            <td>{dsDanhMuc.find(dm => (dm.customId || dm.id) === sp.phanLoai)?.ten || sp.phanLoai}</td>
                            <td>
                                {sp.isKhuyenMai && <Badge bg="danger" className="me-1">Giảm</Badge>}
                                {sp.isBanChay && <Badge bg="warning" text="dark" className="me-1">Hot</Badge>}
                                {sp.isMoi && <Badge bg="success">New</Badge>}
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

        {/* TAB 2: MENU */}
        <Tab eventKey="menu" title="📂 Quản lý Menu">
             <div style={{ maxWidth: '900px' }}>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', background: '#f8f9fa', padding: '15px', borderRadius: '10px', flexWrap: 'wrap' }}>
                    <Form.Control placeholder="Mã (vd: thitheo)" style={{flex: 1, minWidth: '150px'}} value={formDataDM.id} onChange={e => setFormDataDM({...formDataDM, id: e.target.value})} />
                    <Form.Control placeholder="Tên (vd: Thịt Heo)" style={{flex: 2, minWidth: '200px'}} value={formDataDM.ten} onChange={e => setFormDataDM({...formDataDM, ten: e.target.value})} />
                    <Form.Control placeholder="Icon (🐷)" style={{width: '100px'}} value={formDataDM.icon} onChange={e => setFormDataDM({...formDataDM, icon: e.target.value})} />
                    
                    {/* CHỌN DANH MỤC CHA */}
                    <Form.Select style={{flex: 2, minWidth: '200px'}} value={formDataDM.parent} onChange={e => setFormDataDM({...formDataDM, parent: e.target.value})}>
                        <option value="">-- Là Danh Mục Gốc --</option>
                        {dsDanhMuc.filter(dm => !dm.parent && dm.id !== 'all').map(dm => (
                            <option key={dm.id} value={dm.customId || dm.id}>Con của: {dm.ten}</option>
                        ))}
                    </Form.Select>

                    <Button variant="success" onClick={handleAddDM}>+ Thêm</Button>
                </div>
                
                <Table bordered hover>
                    <thead style={{background: '#f1f1f1'}}><tr><th>Cấp độ</th><th>Mã</th><th>Tên hiển thị</th><th>Icon</th><th>Hành động</th></tr></thead>
                    <tbody>
                        {dsDanhMuc.map(dm => (
                            <tr key={dm.id}>
                                <td>{dm.parent ? <Badge bg="info">Con</Badge> : <Badge bg="primary">Gốc</Badge>}</td>
                                <td><code>{dm.customId || dm.id}</code></td>
                                <td>{dm.parent ? <span style={{color: '#999', marginRight: '5px'}}>↳</span> : ''}<b>{dm.ten}</b></td>
                                <td style={{textAlign: 'center', fontSize: '18px'}}>{dm.icon}</td>
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
                <div className="d-flex gap-3 mb-3">
                    <Form.Group className="flex-fill"><Form.Label>Giá tiền</Form.Label><Form.Control value={formDataSP.gia} onChange={e => setFormDataSP({...formDataSP, gia: e.target.value})} /></Form.Group>
                    <Form.Group className="flex-fill"><Form.Label>Phân loại</Form.Label>
                        <Form.Select value={formDataSP.phanLoai} onChange={e => setFormDataSP({...formDataSP, phanLoai: e.target.value})}>
                            {dsDanhMuc.map(dm => (
                                <option key={dm.id} value={dm.customId || dm.id}>
                                    {dm.parent ? ` -- ${dm.ten}` : dm.ten}
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>
                </div>
                <Form.Group className="mb-3">
                    <Form.Label>Hình ảnh (Chọn file từ máy)</Form.Label>
                    <Form.Control type="file" accept="image/*" onChange={handleImageUpload} />
                    {formDataSP.anh && (<div style={{marginTop: '10px', border: '1px dashed #ccc', padding: '5px', display: 'inline-block'}}><img src={formDataSP.anh} alt="Preview" style={{height: '100px'}} /></div>)}
                </Form.Group>
                <div className="d-flex gap-3">
                    <Form.Check type="checkbox" label="🔥 Khuyến mãi" checked={formDataSP.isKhuyenMai} onChange={e => setFormDataSP({...formDataSP, isKhuyenMai: e.target.checked})} />
                    <Form.Check type="checkbox" label="💎 Bán chạy" checked={formDataSP.isBanChay} onChange={e => setFormDataSP({...formDataSP, isBanChay: e.target.checked})} />
                    <Form.Check type="checkbox" label="🆕 Hàng mới" checked={formDataSP.isMoi} onChange={e => setFormDataSP({...formDataSP, isMoi: e.target.checked})} />
                </div>
            </Form>
        </Modal.Body>
        <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModalSP(false)}>Hủy</Button>
            <Button variant="primary" onClick={handleSaveSP}>Lưu</Button>
        </Modal.Footer>
      </Modal>

      {/* MODAL SỬA MENU */}
      <Modal show={showModalEditDM} onHide={() => setShowModalEditDM(false)}>
          <Modal.Header closeButton><Modal.Title>Sửa Danh Mục</Modal.Title></Modal.Header>
          <Modal.Body>
              <Form>
                  <Form.Group className="mb-3">
                      <Form.Label>Mã (Không thể sửa)</Form.Label>
                      <Form.Control type="text" value={editFormDM.customId || editFormDM.id} disabled style={{background: '#eee'}} />
                  </Form.Group>
                  <Form.Group className="mb-3">
                      <Form.Label>Tên hiển thị</Form.Label>
                      <Form.Control type="text" value={editFormDM.ten} onChange={e => setEditFormDM({...editFormDM, ten: e.target.value})} />
                  </Form.Group>
                  <Form.Group className="mb-3">
                      <Form.Label>Icon</Form.Label>
                      <Form.Control type="text" value={editFormDM.icon} onChange={e => setEditFormDM({...editFormDM, icon: e.target.value})} />
                  </Form.Group>
                  <Form.Group className="mb-3">
                      <Form.Label>Thuộc danh mục cha</Form.Label>
                      <Form.Select value={editFormDM.parent || ''} onChange={e => setEditFormDM({...editFormDM, parent: e.target.value})}>
                        <option value="">-- Là Danh Mục Gốc --</option>
                        {dsDanhMuc.filter(dm => !dm.parent && dm.id !== 'all' && dm.id !== editFormDM.id).map(dm => (
                            <option key={dm.id} value={dm.customId || dm.id}>Con của: {dm.ten}</option>
                        ))}
                      </Form.Select>
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
          <Modal.Body>
              <Form.Control className="mb-2" type="password" placeholder="Mật khẩu cũ" onChange={e => setPassForm({...passForm, oldPass: e.target.value})} />
              <Form.Control className="mb-2" type="password" placeholder="Mật khẩu mới" onChange={e => setPassForm({...passForm, newPass: e.target.value})} />
              <Form.Control type="password" placeholder="Xác nhận mới" onChange={e => setPassForm({...passForm, confirmPass: e.target.value})} />
          </Modal.Body>
          <Modal.Footer><Button onClick={handleChangePassword}>Đổi Mật Khẩu</Button></Modal.Footer>
      </Modal>

    </div>
  );
}

export default Admin;