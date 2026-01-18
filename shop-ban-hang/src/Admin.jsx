import React, { useState, useEffect } from 'react';
// NHẬP ĐẦY ĐỦ THƯ VIỆN (Đảm bảo không lỗi Row is not defined)
import { Table, Button, Form, Modal, Badge, Tab, Tabs, Row, Col, Container } from 'react-bootstrap';
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
          const goc = parseInt(formDataSP.giaGoc) || 0;
          const giam = parseInt(formDataSP.phanTramGiam) || 0;
          setFormDataSP(prev => ({ ...prev, giaBan: Math.floor(goc * (1 - giam/100)) }));
      }
  }, [formDataSP.giaGoc, formDataSP.phanTramGiam]);

  function handleLogin() { 
      if (loginInput.username === adminConfig.username && loginInput.password === adminConfig.password) setIsLoggedIn(true); 
      else alert("Sai thông tin!"); 
  }
  function handleChangePassword() {
      if (passForm.oldPass !== adminConfig.password) return alert("Sai mật khẩu cũ!");
      setAdminConfig({ ...adminConfig, password: passForm.newPass });
      alert("Đổi thành công!"); setShowModalPass(false);
  }
  const handleImageUpload = (e) => { const file = e.target.files[0]; if (file) { const reader = new FileReader(); reader.onloadend = () => setFormDataSP({ ...formDataSP, anh: reader.result }); reader.readAsDataURL(file); } };
  function handleSaveSP() {
      if (!formDataSP.ten || !formDataSP.giaBan) return alert("Thiếu tên/giá!");
      const p = { ...formDataSP, giaGoc: parseInt(formDataSP.giaGoc)||0, giaBan: parseInt(formDataSP.giaBan)||0, phanTramGiam: parseInt(formDataSP.phanTramGiam)||0, soLuong: parseInt(formDataSP.soLuong)||0, anh: formDataSP.anh||'https://via.placeholder.com/150' };
      if (editingSP) handleUpdateDS_SP('UPDATE', { ...p, id: editingSP.id }); else handleUpdateDS_SP('ADD', p);
      setShowModalSP(false); setEditingSP(null); setFormDataSP({ ten: '', giaGoc: '', phanTramGiam: 0, giaBan: '', donVi: 'Cái', soLuong: 10, moTa: '', anh: '', phanLoai: 'thitca', isKhuyenMai: false, isBanChay: false, isMoi: false });
  }

  function handleAddDM() { if (!formDataDM.ten) return alert("Nhập tên!"); handleUpdateDS_DM('ADD', { ...formDataDM, order: dsDanhMuc.length }); setFormDataDM({ ten: '', icon: '', parent: '' }); }
  function handleSaveEditDM() { handleUpdateDS_DM('UPDATE', editFormDM); setShowModalEditDM(false); }
  function handleDeleteSP(id) { if(window.confirm("Xóa?")) handleUpdateDS_SP('DELETE', id); }
  function handleDeleteDM(id) { if(id==='all') return alert("Cấm xóa gốc"); if(window.confirm("Xóa?")) handleUpdateDS_DM('DELETE', id); }
  const sortedDanhMuc = (() => { const s=(a,b)=>(a.order||0)-(b.order||0); const r=dsDanhMuc.filter(d=>!d.parent).sort(s); const c=dsDanhMuc.filter(d=>d.parent).sort(s); let res=[]; r.forEach(root=>{res.push(root); res.push(...c.filter(ch=>ch.parent===(root.customId||root.id)))}); return res; })();
  const handleMoveCategory = (item, dir) => { /* Logic sắp xếp */ };

  // --- GIAO DIỆN ĐĂNG NHẬP (Chia cột đẹp) ---
  if (!isLoggedIn) return (
      <div className="d-flex vh-100">
          <div className="d-none d-md-flex col-md-6 bg-success justify-content-center align-items-center text-white p-5">
              <div>
                  <h1 className="fw-bold display-4">MAIVANG SHOP</h1>
                  <p className="fs-5">Hệ thống quản trị bán hàng chuyên nghiệp</p>
              </div>
          </div>
          <div className="col-12 col-md-6 d-flex justify-content-center align-items-center bg-light">
              <div className="bg-white p-5 rounded shadow w-75">
                  <h3 className="text-success fw-bold mb-4 text-center">ĐĂNG NHẬP</h3>
                  <Form onSubmit={e => {e.preventDefault(); handleLogin()}}>
                      <Form.Control className="mb-3 p-3" placeholder="Tên đăng nhập" value={loginInput.username} onChange={e=>setLoginInput({...loginInput, username:e.target.value})} />
                      <Form.Control className="mb-4 p-3" type="password" placeholder="Mật khẩu" value={loginInput.password} onChange={e=>setLoginInput({...loginInput, password:e.target.value})} />
                      <Button variant="success" type="submit" className="w-100 p-3 fw-bold">VÀO HỆ THỐNG</Button>
                  </Form>
                  <div className="text-center mt-3"><Link to="/" className="text-decoration-none text-success fw-bold">← Quay lại trang bán hàng</Link></div>
              </div>
          </div>
      </div>
  );

  return (
    <Container fluid className="p-0 bg-light min-vh-100">
      <div className="bg-success text-white p-3 d-flex justify-content-between align-items-center shadow-sm">
          <h4 className="m-0 fw-bold">ADMIN CP</h4>
          <div><Button variant="light" size="sm" className="me-2 fw-bold text-success" onClick={()=>setShowModalPass(true)}>Đổi Pass</Button><Link to="/"><Button variant="danger" size="sm" className="fw-bold">Thoát</Button></Link></div>
      </div>
      
      <Container className="py-4">
        <Tabs defaultActiveKey="products" className="mb-3 custom-tabs bg-white rounded shadow-sm p-2">
            <Tab eventKey="products" title="📦 Quản lý Sản phẩm">
                <div className="bg-white p-3 rounded shadow-sm">
                    <Button className="mb-3" variant="success" onClick={() => {setEditingSP(null); setShowModalSP(true)}}>+ Thêm Sản Phẩm Mới</Button>
                    <Table striped hover responsive className="align-middle">
                        <thead className="table-success"><tr><th>Ảnh</th><th>Tên SP</th><th>Giá bán (¥)</th><th>Kho</th><th>Tags</th><th>Xử lý</th></tr></thead>
                        <tbody>{dsSanPham.map(sp => (
                            <tr key={sp.id}>
                                <td><img src={sp.anh} width="50" height="50" style={{objectFit:'cover', borderRadius:'5px'}}/></td>
                                <td><div className="fw-bold">{sp.ten}</div><small className="text-muted">{sp.donVi}</small></td>
                                <td><div className="text-danger fw-bold">{sp.giaBan?.toLocaleString()} ¥</div>{sp.isKhuyenMai && <small className="text-muted text-decoration-line-through">{sp.giaGoc?.toLocaleString()} ¥</small>}</td>
                                <td>{sp.soLuong}</td>
                                <td>{sp.isKhuyenMai && <Badge bg="danger" className="me-1">Sale</Badge>}{sp.isMoi && <Badge bg="success">New</Badge>}</td>
                                <td><Button size="sm" variant="warning" className="me-1" onClick={()=>{setEditingSP(sp); setFormDataSP(sp); setShowModalSP(true)}}>Sửa</Button><Button size="sm" variant="danger" onClick={() => handleDeleteSP(sp.id)}>Xóa</Button></td>
                            </tr>
                        ))}</tbody>
                    </Table>
                </div>
            </Tab>
            
            <Tab eventKey="menu" title="📂 Danh mục">
                 <div className="bg-white p-3 rounded shadow-sm">
                    <div className="d-flex gap-2 mb-3">
                        <Form.Control placeholder="Tên danh mục..." value={formDataDM.ten} onChange={e=>setFormDataDM({...formDataDM, ten:e.target.value})} />
                        <Form.Select value={formDataDM.icon} onChange={e=>setFormDataDM({...formDataDM, icon:e.target.value})} style={{maxWidth:'150px'}}><option value="">Chọn Icon</option>{ICON_LIST.map(i=><option key={i} value={i}>{i}</option>)}</Form.Select>
                        <Form.Select value={formDataDM.parent} onChange={e=>setFormDataDM({...formDataDM, parent:e.target.value})} style={{maxWidth:'200px'}}><option value="">-- Danh mục gốc --</option>{dsDanhMuc.filter(d=>!d.parent).map(d=><option key={d.id} value={d.customId||d.id}>{d.ten}</option>)}</Form.Select>
                        <Button variant="success" style={{minWidth:'100px'}} onClick={handleAddDM}>Thêm</Button>
                    </div>
                    <Table bordered hover>
                        <thead className="table-light"><tr><th>Tên danh mục</th><th>Icon</th><th>Thao tác</th></tr></thead>
                        <tbody>{sortedDanhMuc.map(dm => (<tr key={dm.id}><td>{dm.parent ? <span className="text-muted ms-4">↳ </span> : <Badge bg="success" className="me-2">Gốc</Badge>}<b>{dm.ten}</b></td><td className="fs-5 text-center">{dm.icon}</td><td><Button size="sm" variant="warning" onClick={()=>{setEditingDM(dm); setEditFormDM(dm); setShowModalEditDM(true)}}>Sửa</Button> <Button size="sm" variant="danger" onClick={()=>handleDeleteDM(dm.id)}>Xóa</Button></td></tr>))}</tbody>
                    </Table>
                 </div>
            </Tab>
        </Tabs>
      </Container>

      <Modal show={showModalSP} onHide={()=>setShowModalSP(false)} size="lg">
         <Modal.Header closeButton><Modal.Title>{editingSP?'Cập nhật sản phẩm':'Thêm sản phẩm mới'}</Modal.Title></Modal.Header>
         <Modal.Body><Form>
            <Row className="mb-3"><Col md={8}><Form.Label>Tên sản phẩm</Form.Label><Form.Control value={formDataSP.ten} onChange={e=>setFormDataSP({...formDataSP, ten:e.target.value})} /></Col><Col md={4}><Form.Label>Danh mục</Form.Label><Form.Select value={formDataSP.phanLoai} onChange={e=>setFormDataSP({...formDataSP, phanLoai:e.target.value})}>{dsDanhMuc.map(d=><option key={d.id} value={d.customId||d.id}>{d.ten}</option>)}</Form.Select></Col></Row>
            <div className="bg-light p-3 rounded mb-3 border">
                <Row>
                    <Col><Form.Label>Giá Gốc (¥)</Form.Label><Form.Control type="number" value={formDataSP.giaGoc} onChange={e=>setFormDataSP({...formDataSP, giaGoc:e.target.value})} /></Col>
                    <Col><Form.Label>% Giảm</Form.Label><Form.Control type="number" value={formDataSP.phanTramGiam} onChange={e=>setFormDataSP({...formDataSP, phanTramGiam:e.target.value})} /></Col>
                    <Col><Form.Label className="text-danger fw-bold">Giá Bán (¥)</Form.Label><Form.Control value={formDataSP.giaBan} readOnly className="fw-bold text-danger" /></Col>
                    <Col><Form.Label>Đơn vị tính</Form.Label><Form.Control value={formDataSP.donVi} onChange={e=>setFormDataSP({...formDataSP, donVi:e.target.value})} placeholder="Hộp, Kg..." /></Col>
                </Row>
            </div>
            <Row className="mb-3"><Col md={4}><Form.Label>Tồn kho</Form.Label><Form.Control type="number" value={formDataSP.soLuong} onChange={e=>setFormDataSP({...formDataSP, soLuong:e.target.value})} /></Col><Col md={8}><Form.Label>Link Ảnh</Form.Label><Form.Control type="file" onChange={handleImageUpload} /></Col></Row>
            <Form.Group className="mb-3"><Form.Label>Mô tả chi tiết (Hỗ trợ SEO)</Form.Label><ReactQuill theme="snow" value={formDataSP.moTa} onChange={v=>setFormDataSP({...formDataSP, moTa:v})} /></Form.Group>
            <div className="d-flex gap-3 border p-2 rounded"><Form.Check label="Đang Khuyến Mãi" checked={formDataSP.isKhuyenMai} onChange={e=>setFormDataSP({...formDataSP, isKhuyenMai:e.target.checked})} /><Form.Check label="Sản Phẩm Bán Chạy" checked={formDataSP.isBanChay} onChange={e=>setFormDataSP({...formDataSP, isBanChay:e.target.checked})} /><Form.Check label="Sản Phẩm Mới" checked={formDataSP.isMoi} onChange={e=>setFormDataSP({...formDataSP, isMoi:e.target.checked})} /></div>
         </Form></Modal.Body>
         <Modal.Footer><Button onClick={handleSaveSP} variant="success">Lưu thông tin</Button></Modal.Footer>
      </Modal>

      <Modal show={showModalEditDM} onHide={()=>setShowModalEditDM(false)}><Modal.Body><Form.Control value={editFormDM.ten} onChange={e=>setEditFormDM({...editFormDM, ten:e.target.value})} /><Button onClick={handleSaveEditDM} className="mt-2 w-100">Cập nhật</Button></Modal.Body></Modal>
      <Modal show={showModalPass} onHide={()=>setShowModalPass(false)}><Modal.Body><Form.Control placeholder="Nhập mật khẩu mới" onChange={e=>setPassForm({...passForm, newPass:e.target.value})} /><Button onClick={handleChangePassword} className="mt-2 w-100">Đổi Mật Khẩu</Button></Modal.Body></Modal>
    </Container>
  );
}
export default Admin;