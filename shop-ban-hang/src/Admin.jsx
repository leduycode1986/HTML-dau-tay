import React, { useState, useEffect } from 'react';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import Badge from 'react-bootstrap/Badge';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { Link } from 'react-router-dom';

// --- 1. NHẬP THƯ VIỆN SOẠN THẢO ---
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Import giao diện soạn thảo

const ICON_LIST = [
    '🔥', '⚡', '💎', '🆕', '🎁', '🏷️', '📦',
    '🥩', '🍗', '🍖', '🐟', '🦀', '🦐', '🐙', '🥚',
    '🥬', '🥦', '🥕', '🥔', '🍆', '🌽', '🍄', '🍅', 
    '🍎', '🍇', '🍉', '🍌', '🍋', '🍊', '🍓', '🥭', '🥥',
    '🍚', '🌾', '🍞', '🥖', '🥪', '🥜', '🌰',
    '🍜', '🍝', '🍲', '🥣', '🥢', '🥡', '🥘',
    '🍾', '🧂', '🌶️', '🧄', '🧅', '🥫', '🍯', '🧈',
    '🍺', '🍷', '🥂', '🥤', '🧃', '☕', '🍵', '🍼',
    '🥛', '🧀', '🍦', '🍧', '🍰', '🍪', '🍫', '🍬',
    '🧴', '🧼', '🧽', '🧻', '🪥', '🧹', '🧺', '🏠',
    '👶', '🧸', '🐶', '🐱'
];

function Admin({ dsSanPham, handleUpdateDS_SP, dsDanhMuc, handleUpdateDS_DM, dsDonHang, handleUpdateStatusOrder, handleDeleteOrder }) {
  
  // ... (Phần State Config, Login giữ nguyên) ...
  const [adminConfig, setAdminConfig] = useState(() => {
      const saved = localStorage.getItem('adminConfig');
      return saved ? JSON.parse(saved) : { username: 'admin', password: 'admin123' };
  });
  useEffect(() => { localStorage.setItem('adminConfig', JSON.stringify(adminConfig)); }, [adminConfig]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginInput, setLoginInput] = useState({ username: '', password: '' });
  const [showModalPass, setShowModalPass] = useState(false);
  const [passForm, setPassForm] = useState({ oldPass: '', newPass: '', confirmPass: '' });

  // ... (Phần Form Data giữ nguyên) ...
  const [showModalSP, setShowModalSP] = useState(false);
  const [editingSP, setEditingSP] = useState(null);
  const [formDataSP, setFormDataSP] = useState({ 
      ten: '', giaGoc: '', phanTramGiam: 0, giaBan: '', 
      donVi: 'Cái', soLuong: 10, moTa: '', // moTa bây giờ sẽ chứa mã HTML
      anh: '', phanLoai: 'thitca', 
      isKhuyenMai: false, isBanChay: false, isMoi: false 
  });

  // ... (Phần useEffect tính giá, handleLogin, handleChangePassword, handleImageUpload giữ nguyên) ...
  useEffect(() => {
      if(formDataSP.giaGoc) {
          const goc = parseInt(formDataSP.giaGoc);
          const giam = parseInt(formDataSP.phanTramGiam) || 0;
          const ban = goc * (1 - giam / 100);
          setFormDataSP(prev => ({ ...prev, giaBan: Math.floor(ban) }));
      }
  }, [formDataSP.giaGoc, formDataSP.phanTramGiam]);

  function handleLogin() {
      if (loginInput.username === adminConfig.username && loginInput.password === adminConfig.password) setIsLoggedIn(true);
      else alert("❌ Sai thông tin đăng nhập!");
  }
  function handleChangePassword() { /* Giữ nguyên */ }
  const handleImageUpload = (e) => {
      const file = e.target.files[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => setFormDataSP({ ...formDataSP, anh: reader.result });
          reader.readAsDataURL(file);
      }
  };

  // ... (Phần handleSaveSP, Edit, Delete SP giữ nguyên) ...
  function handleSaveSP() {
      if (!formDataSP.ten || !formDataSP.giaBan) return alert("Thiếu tên hoặc giá bán!");
      const productData = {
          ...formDataSP,
          giaGoc: parseInt(formDataSP.giaGoc) || 0,
          giaBan: parseInt(formDataSP.giaBan) || 0,
          phanTramGiam: parseInt(formDataSP.phanTramGiam) || 0,
          soLuong: parseInt(formDataSP.soLuong) || 0,
          anh: formDataSP.anh || 'https://via.placeholder.com/150'
      };
      if (editingSP) handleUpdateDS_SP('UPDATE', { ...productData, id: editingSP.id });
      else handleUpdateDS_SP('ADD', productData);
      setShowModalSP(false); setEditingSP(null); 
      setFormDataSP({ ten: '', giaGoc: '', phanTramGiam: 0, giaBan: '', donVi: 'Cái', soLuong: 10, moTa: '', anh: '', phanLoai: 'thitca', isKhuyenMai: false, isBanChay: false, isMoi: false });
  }
  function handleEditSP(sp) { setEditingSP(sp); setFormDataSP(sp); setShowModalSP(true); }
  function handleDeleteSP(id) { if(window.confirm("Xóa sản phẩm?")) handleUpdateDS_SP('DELETE', id); }

  // ... (Phần Menu giữ nguyên) ...
  const [formDataDM, setFormDataDM] = useState({ ten: '', icon: '', parent: '' });
  const [showModalEditDM, setShowModalEditDM] = useState(false);
  const [editingDM, setEditingDM] = useState(null);
  const [editFormDM, setEditFormDM] = useState({ id: '', ten: '', icon: '', parent: '' });
  // ... (Các hàm xử lý menu giữ nguyên) ...
  function handleAddDM() { /* Code cũ */ 
      if (!formDataDM.ten) return alert("Nhập Tên!");
      handleUpdateDS_DM('ADD', { ...formDataDM, order: dsDanhMuc.length });
      setFormDataDM({ ten: '', icon: '', parent: '' });
  }
  function handleEditDM(dm) { setEditingDM(dm); setEditFormDM(dm); setShowModalEditDM(true); }
  function handleSaveEditDM() { handleUpdateDS_DM('UPDATE', editFormDM); setShowModalEditDM(false); setEditingDM(null); }
  function handleDeleteDM(id) { if(id === 'all') return alert("Cấm xóa gốc!"); if(window.confirm("Xóa danh mục?")) handleUpdateDS_DM('DELETE', id); }
  const getSortedDanhMuc = () => { /* Code cũ */ return []; }; // (Bạn giữ code cũ của hàm này nhé)
  const handleMoveCategory = () => {}; // (Giữ code cũ)
  const renderStatus = (status) => { /* Code cũ */ };

  // --- CẤU HÌNH TOOLBAR CHO TRÌNH SOẠN THẢO ---
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }], // Tiêu đề H1, H2, H3
      ['bold', 'italic', 'underline', 'strike'], // Bôi đậm, nghiêng...
      [{'list': 'ordered'}, {'list': 'bullet'}], // Danh sách
      ['link', 'clean'] // Chèn link, xóa định dạng
    ],
  };

  if (!isLoggedIn) return ( /* Code Login cũ */ <div style={{padding: 50}}>Vui lòng đăng nhập</div> );

  return (
    <div style={{ padding: '20px', backgroundColor: '#fff', minHeight: '100vh' }}>
      {/* ... Header Admin giữ nguyên ... */}
      <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '2px solid #008848', paddingBottom: '10px'}}>
          <h2 style={{color: '#008848'}}>QUẢN TRỊ HỆ THỐNG</h2>
          <div><Link to="/"><Button variant="outline-danger">Thoát</Button></Link></div>
      </div>

      <Tabs defaultActiveKey="products" className="mb-3">
        <Tab eventKey="products" title="📦 Sản phẩm">
            <Button className="mb-3" onClick={() => {setEditingSP(null); setFormDataSP({ ten: '', giaGoc: '', phanTramGiam: 0, giaBan: '', donVi: 'Cái', soLuong: 10, moTa: '', anh: '', phanLoai: 'thitca', isKhuyenMai: false, isBanChay: false, isMoi: false }); setShowModalSP(true)}}>+ Thêm Sản Phẩm</Button>
            <Table striped bordered hover responsive>
                {/* ... (Phần Table giữ nguyên) ... */}
                <thead><tr><th>Ảnh</th><th>Tên</th><th>Giá bán</th><th>Xử lý</th></tr></thead>
                <tbody>
                    {dsSanPham.map(sp => (
                        <tr key={sp.id}>
                            <td><img src={sp.anh} width="50" style={{borderRadius: '5px'}}/></td>
                            <td><b>{sp.ten}</b></td>
                            <td>{sp.giaBan?.toLocaleString('ja-JP')} ¥</td>
                            <td><Button size="sm" variant="warning" onClick={() => handleEditSP(sp)}>Sửa</Button> <Button size="sm" variant="danger" onClick={() => handleDeleteSP(sp.id)}>Xóa</Button></td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </Tab>
        {/* ... (Các tab khác giữ nguyên) ... */}
        <Tab eventKey="orders" title="Đơn hàng">...</Tab>
        <Tab eventKey="menu" title="Menu">...</Tab>
      </Tabs>

      {/* MODAL SP NÂNG CẤP */}
      <Modal show={showModalSP} onHide={() => setShowModalSP(false)} size="lg">
         <Modal.Header closeButton><Modal.Title>{editingSP ? 'Cập nhật' : 'Thêm mới'}</Modal.Title></Modal.Header>
         <Modal.Body>
             <Form>
                <Row className="mb-3">
                    <Col md={8}><Form.Label>Tên sản phẩm (Chuẩn SEO)</Form.Label><Form.Control value={formDataSP.ten} onChange={e => setFormDataSP({...formDataSP, ten: e.target.value})} placeholder="Vd: Thịt bò Kobe thượng hạng nhập khẩu..." /></Col>
                    <Col md={4}><Form.Label>Danh mục</Form.Label>
                        <Form.Select value={formDataSP.phanLoai} onChange={e => setFormDataSP({...formDataSP, phanLoai: e.target.value})}>{dsDanhMuc.map(dm => <option key={dm.id} value={dm.customId || dm.id}>{dm.parent ? `-- ${dm.ten}` : dm.ten}</option>)}</Form.Select>
                    </Col>
                </Row>
                
                {/* ... (Hàng giá cả giữ nguyên) ... */}
                <Row className="mb-3" style={{background: '#f8f9fa', padding: '10px', borderRadius: '5px'}}>
                    <Col md={3}><Form.Label>Giá Gốc</Form.Label><Form.Control type="number" value={formDataSP.giaGoc} onChange={e => setFormDataSP({...formDataSP, giaGoc: e.target.value})} /></Col>
                    <Col md={3}><Form.Label>% Giảm</Form.Label><Form.Control type="number" value={formDataSP.phanTramGiam} onChange={e => setFormDataSP({...formDataSP, phanTramGiam: e.target.value})} /></Col>
                    <Col md={3}><Form.Label style={{color: 'red'}}>Giá Bán</Form.Label><Form.Control type="number" value={formDataSP.giaBan} readOnly /></Col>
                    <Col md={3}><Form.Label>Đơn vị</Form.Label><Form.Control type="text" value={formDataSP.donVi} onChange={e => setFormDataSP({...formDataSP, donVi: e.target.value})} /></Col>
                </Row>

                <Row className="mb-3">
                    <Col md={4}><Form.Label>Kho</Form.Label><Form.Control type="number" value={formDataSP.soLuong} onChange={e => setFormDataSP({...formDataSP, soLuong: e.target.value})} /></Col>
                    <Col md={8}><Form.Label>Ảnh</Form.Label><Form.Control type="file" onChange={handleImageUpload} /></Col>
                </Row>

                {/* --- TRÌNH SOẠN THẢO XỊN --- */}
                <Form.Group className="mb-3">
                    <Form.Label>Mô tả chi tiết (Bài viết SEO)</Form.Label>
                    <div style={{height: '250px', marginBottom: '50px'}}>
                        <ReactQuill 
                            theme="snow" 
                            value={formDataSP.moTa} 
                            onChange={(value) => setFormDataSP({...formDataSP, moTa: value})} 
                            modules={modules}
                            style={{height: '200px'}}
                        />
                    </div>
                </Form.Group>

                <div className="d-flex gap-4 p-2" style={{border: '1px solid #eee', borderRadius: '5px'}}>
                    <Form.Check label="🔥 Khuyến Mãi" checked={formDataSP.isKhuyenMai} onChange={e => setFormDataSP({...formDataSP, isKhuyenMai: e.target.checked})} />
                    <Form.Check label="💎 Bán Chạy" checked={formDataSP.isBanChay} onChange={e => setFormDataSP({...formDataSP, isBanChay: e.target.checked})} />
                    <Form.Check label="🆕 Mới" checked={formDataSP.isMoi} onChange={e => setFormDataSP({...formDataSP, isMoi: e.target.checked})} />
                </div>
             </Form>
         </Modal.Body>
         <Modal.Footer><Button onClick={handleSaveSP}>Lưu sản phẩm</Button></Modal.Footer>
      </Modal>
      {/* ... (Các Modal khác giữ nguyên) ... */}
    </div>
  );
}
export default Admin;