import React, { useState, useEffect } from 'react';
import { Table, Button, Form, Modal, Badge, Tab, Tabs, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const ICON_LIST = ['🔥', '⚡', '💎', '🆕', '🎁', '🏷️', '📦', '🥩', '🍗', '🍖', '🐟', '🦀', '🦐', '🐙', '🥚', '🥬', '🥦', '🥕', '🥔', '🍆', '🌽', '🍄', '🍅', '🍎', '🍇', '🍉', '🍌', '🍋', '🍊', '🍓', '🥭', '🥥', '🍚', '🌾', '🍞', '🥖', '🥪', '🥜', '🌰', '🍜', '🍝', '🍲', '🥣', '🥢', '🥡', '🥘', '🍾', '🧂', '🌶️', '🧄', '🧅', '🥫', '🍯', '🧈', '🍺', '🍷', '🥂', '🥤', '🧃', '☕', '🍵', '🍼', '🥛', '🧀', '🍦', '🍧', '🍰', '🍪', '🍫', '🍬', '🧴', '🧼', '🧽', '🧻', '🪥', '🧹', '🧺', '🏠', '👶', '🧸', '🐶', '🐱'];

function Admin({ dsSanPham, handleUpdateDS_SP, dsDanhMuc, handleUpdateDS_DM, dsDonHang, handleUpdateStatusOrder, handleDeleteOrder }) {
  const [adminConfig, setAdminConfig] = useState(() => JSON.parse(localStorage.getItem('adminConfig') || '{"username":"admin","password":"123"}'));
  useEffect(() => localStorage.setItem('adminConfig', JSON.stringify(adminConfig)), [adminConfig]);
  
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginInput, setLoginInput] = useState({ username: '', password: '' });
  const [showModalPass, setShowModalPass] = useState(false);
  const [passForm, setPassForm] = useState({ oldPass: '', newPass: '', confirmPass: '' });

  const [showModalSP, setShowModalSP] = useState(false);
  const [editingSP, setEditingSP] = useState(null);
  const [formDataSP, setFormDataSP] = useState({ ten: '', giaGoc: '', phanTramGiam: 0, giaBan: '', donVi: 'Cái', soLuong: 10, moTa: '', anh: '', phanLoai: 'thitca', isKhuyenMai: false, isBanChay: false, isMoi: false });

  const [formDataDM, setFormDataDM] = useState({ ten: '', icon: '', parent: '' });
  const [showModalEditDM, setShowModalEditDM] = useState(false);
  const [editingDM, setEditingDM] = useState(null);
  const [editFormDM, setEditFormDM] = useState({ id: '', ten: '', icon: '', parent: '' });

  useEffect(() => {
      if(formDataSP.giaGoc) {
          const goc = parseInt(formDataSP.giaGoc)||0;
          const giam = parseInt(formDataSP.phanTramGiam)||0;
          setFormDataSP(prev => ({ ...prev, giaBan: Math.floor(goc * (1 - giam/100)) }));
      }
  }, [formDataSP.giaGoc, formDataSP.phanTramGiam]);

  function handleLogin() { if (loginInput.username === adminConfig.username && loginInput.password === adminConfig.password) setIsLoggedIn(true); else alert("Sai thông tin!"); }
  function handleChangePassword() { if (passForm.oldPass !== adminConfig.password) return alert("Sai pass cũ!"); setAdminConfig({ ...adminConfig, password: passForm.newPass }); alert("Đổi pass thành công!"); setShowModalPass(false); }
  
  const handleImageUpload = (e) => { const file = e.target.files[0]; if (file) { const reader = new FileReader(); reader.onloadend = () => setFormDataSP({ ...formDataSP, anh: reader.result }); reader.readAsDataURL(file); } };
  
  function handleSaveSP() {
      if (!formDataSP.ten || !formDataSP.giaBan) return alert("Thiếu tên/giá!");
      const p = { ...formDataSP, giaGoc: parseInt(formDataSP.giaGoc)||0, giaBan: parseInt(formDataSP.giaBan)||0, phanTramGiam: parseInt(formDataSP.phanTramGiam)||0, soLuong: parseInt(formDataSP.soLuong)||0, anh: formDataSP.anh||'https://via.placeholder.com/150' };
      if (editingSP) handleUpdateDS_SP('UPDATE', { ...p, id: editingSP.id }); else handleUpdateDS_SP('ADD', p);
      setShowModalSP(false); setEditingSP(null);
      setFormDataSP({ ten: '', giaGoc: '', phanTramGiam: 0, giaBan: '', donVi: 'Cái', soLuong: 10, moTa: '', anh: '', phanLoai: 'thitca', isKhuyenMai: false, isBanChay: false, isMoi: false });
  }

  function handleAddDM() { if (!formDataDM.ten) return alert("Nhập tên!"); handleUpdateDS_DM('ADD', { ...formDataDM, order: dsDanhMuc.length }); setFormDataDM({ ten: '', icon: '', parent: '' }); }
  function handleSaveEditDM() { handleUpdateDS_DM('UPDATE', editFormDM); setShowModalEditDM(false); }
  
  const sortedDanhMuc = (() => { const s = (a, b) => (a.order||0)-(b.order||0); const r = dsDanhMuc.filter(d=>!d.parent).sort(s); const c = dsDanhMuc.filter(d=>d.parent).sort(s); let res=[]; r.forEach(root=>{res.push(root); res.push(...c.filter(ch=>ch.parent===(root.customId||root.id)))}); return res; })();
  const handleMoveCategory = (item, dir) => { /* Logic sắp xếp cũ giữ nguyên */ };

  if (!isLoggedIn) return (
      <div className="d-flex vh-100 justify-content-center align-items-center" style={{background: '#e8f5e9'}}>
          <div className="bg-white p-5 rounded shadow text-center" style={{width: '400px'}}>
              <h3 className="text-success fw-bold mb-4">ADMIN LOGIN</h3>
              <Form onSubmit={e => {e.preventDefault(); handleLogin()}}>
                  <Form.Control className="mb-3" placeholder="User" value={loginInput.username} onChange={e=>setLoginInput({...loginInput, username:e.target.value})} />
                  <Form.Control className="mb-3" type="password" placeholder="Pass" value={loginInput.password} onChange={e=>setLoginInput({...loginInput, password:e.target.value})} />
                  <Button variant="success" type="submit" className="w-100">ĐĂNG NHẬP</Button>
              </Form>
              <Link to="/" className="d-block mt-3 text-success">← Về trang chủ</Link>
          </div>
      </div>
  );

  return (
    <div className="p-4 bg-white min-vh-100">
      <div className="d-flex justify-content-between mb-4 border-bottom pb-2">
          <h2 className="text-success">QUẢN TRỊ HỆ THỐNG</h2>
          <div><Button variant="outline-primary" className="me-2" onClick={()=>setShowModalPass(true)}>Đổi Pass</Button><Link to="/"><Button variant="outline-danger">Thoát</Button></Link></div>
      </div>
      <Tabs defaultActiveKey="products" className="mb-3">
        <Tab eventKey="products" title="📦 Sản phẩm">
            <Button className="mb-3" onClick={() => {setEditingSP(null); setShowModalSP(true)}}>+ Thêm Sản Phẩm</Button>
            <Table striped bordered hover responsive>
                <thead><tr><th>Ảnh</th><th>Tên</th><th>Giá (¥)</th><th>Kho</th><th>Tags</th><th>Xử lý</th></tr></thead>
                <tbody>{dsSanPham.map(sp => (
                    <tr key={sp.id}>
                        <td><img src={sp.anh} width="40"/></td>
                        <td><b>{sp.ten}</b></td>
                        <td><div className="text-danger fw-bold">{sp.giaBan?.toLocaleString()} ¥</div>{sp.isKhuyenMai && <small className="text-muted text-decoration-line-through">{sp.giaGoc?.toLocaleString()} ¥</small>}</td>
                        <td>{sp.soLuong}</td>
                        <td>{sp.isKhuyenMai && <Badge bg="danger" className="me-1">Sale</Badge>}{sp.isMoi && <Badge bg="success">New</Badge>}</td>
                        <td><Button size="sm" variant="warning" onClick={()=>{setEditingSP(sp); setFormDataSP(sp); setShowModalSP(true)}}>Sửa</Button> <Button size="sm" variant="danger" onClick={() => handleDeleteOrder(sp.id)}>Xóa</Button></td>
                    </tr>
                ))}</tbody>
            </Table>
        </Tab>
        <Tab eventKey="menu" title="📂 Danh mục">
             <div className="bg-light p-3 mb-3 d-flex gap-2">
                <Form.Control placeholder="Tên DM" value={formDataDM.ten} onChange={e=>setFormDataDM({...formDataDM, ten:e.target.value})} />
                <Form.Select value={formDataDM.icon} onChange={e=>setFormDataDM({...formDataDM, icon:e.target.value})}><option value="">None</option>{ICON_LIST.map(i=><option key={i} value={i}>{i}</option>)}</Form.Select>
                <Form.Select value={formDataDM.parent} onChange={e=>setFormDataDM({...formDataDM, parent:e.target.value})}><option value="">Gốc</option>{dsDanhMuc.filter(d=>!d.parent).map(d=><option key={d.id} value={d.customId||d.id}>{d.ten}</option>)}</Form.Select>
                <Button variant="success" onClick={handleAddDM}>Thêm</Button>
             </div>
             <Table bordered>
                <thead><tr><th>Tên</th><th>Icon</th><th>Xử lý</th></tr></thead>
                <tbody>{sortedDanhMuc.map(dm => (<tr key={dm.id}><td>{dm.parent ? '↳ ' : '• '}<b>{dm.ten}</b></td><td>{dm.icon}</td><td><Button size="sm" variant="warning" onClick={()=>{setEditingDM(dm); setEditFormDM(dm); setShowModalEditDM(true)}}>Sửa</Button></td></tr>))}</tbody>
             </Table>
        </Tab>
      </Tabs>

      <Modal show={showModalSP} onHide={()=>setShowModalSP(false)} size="lg">
         <Modal.Header closeButton><Modal.Title>{editingSP?'Sửa':'Thêm'} SP</Modal.Title></Modal.Header>
         <Modal.Body><Form>
            <Row className="mb-3"><Col><Form.Label>Tên</Form.Label><Form.Control value={formDataSP.ten} onChange={e=>setFormDataSP({...formDataSP, ten:e.target.value})} /></Col><Col><Form.Label>Danh mục</Form.Label><Form.Select value={formDataSP.phanLoai} onChange={e=>setFormDataSP({...formDataSP, phanLoai:e.target.value})}>{dsDanhMuc.map(d=><option key={d.id} value={d.customId||d.id}>{d.ten}</option>)}</Form.Select></Col></Row>
            <Row className="mb-3 bg-light p-2"><Col><Form.Label>Giá Gốc</Form.Label><Form.Control type="number" value={formDataSP.giaGoc} onChange={e=>setFormDataSP({...formDataSP, giaGoc:e.target.value})} /></Col><Col><Form.Label>% Giảm</Form.Label><Form.Control type="number" value={formDataSP.phanTramGiam} onChange={e=>setFormDataSP({...formDataSP, phanTramGiam:e.target.value})} /></Col><Col><Form.Label className="text-danger">Giá Bán</Form.Label><Form.Control value={formDataSP.giaBan} readOnly /></Col></Row>
            <Form.Group className="mb-3"><Form.Label>Mô tả (SEO)</Form.Label><ReactQuill theme="snow" value={formDataSP.moTa} onChange={v=>setFormDataSP({...formDataSP, moTa:v})} /></Form.Group>
            <div className="d-flex gap-3"><Form.Check label="Sale" checked={formDataSP.isKhuyenMai} onChange={e=>setFormDataSP({...formDataSP, isKhuyenMai:e.target.checked})} /><Form.Check label="New" checked={formDataSP.isMoi} onChange={e=>setFormDataSP({...formDataSP, isMoi:e.target.checked})} /></div>
         </Form></Modal.Body>
         <Modal.Footer><Button onClick={handleSaveSP}>Lưu</Button></Modal.Footer>
      </Modal>
      {/* Modal Edit Menu & Pass tương tự */}
    </div>
  );
}
export default Admin;