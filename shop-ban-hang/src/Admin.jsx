import React, { useState, useEffect } from 'react';
import { Table, Button, Form, Modal, Badge, Tab, Tabs, Row, Col, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const NO_IMAGE = "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg";
const ICON_LIST = ['🔥', '⚡', '💎', '🆕', '🎁', '🏷️', '📦', '🥩', '🍗', '🍖', '🐟', '🦀', '🦐', '🐙', '🥚', '🥬', '🥦', '🥕', '🥔', '🍆', '🌽', '🍄', '🍅', '🍎', '🍇', '🍉', '🍌', '🍋', '🍊', '🍓', '🥭', '🥥', '🍚', '🌾', '🍞', '🥖', '🥪', '🥜', '🌰', '🍜', '🍝', '🍲', '🥣', '🥢', '🥡', '🥘', '🍾', '🧂', '🌶️', '🧄', '🧅', '🥫', '🍯', '🧈', '🍺', '🍷', '🥂', '🥤', '🧃', '☕', '🍵', '🍼', '🥛', '🧀', '🍦', '🍧', '🍰', '🍪', '🍫', '🍬', '🧴', '🧼', '🧽', '🧻', '🪥', '🧹', '🧺', '🏠', '👶', '🧸', '🐶', '🐱'];

function Admin({ dsSanPham, handleUpdateDS_SP, dsDanhMuc, handleUpdateDS_DM, dsDonHang, handleUpdateStatusOrder, handleDeleteOrder }) {
  const [adminConfig, setAdminConfig] = useState(() => JSON.parse(localStorage.getItem('adminConfig') || '{"username":"admin","password":"123"}'));
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginInput, setLoginInput] = useState({ username: '', password: '' });
  const [showModalSP, setShowModalSP] = useState(false);
  const [editingSP, setEditingSP] = useState(null);
  const [formDataSP, setFormDataSP] = useState({ ten: '', giaGoc: '', phanTramGiam: 0, giaBan: '', donVi: 'Cái', soLuong: 10, moTa: '', anh: '', phanLoai: 'thitca', isKhuyenMai: false, isBanChay: false, isMoi: false });
  const [formDataDM, setFormDataDM] = useState({ ten: '', icon: '', parent: '' });
  
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

  const handleImageUpload = (e) => {
      const file = e.target.files[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => setFormDataSP({ ...formDataSP, anh: reader.result });
          reader.readAsDataURL(file);
      }
  };

  function handleSaveSP() {
      if (!formDataSP.ten || !formDataSP.giaBan) return alert("Thiếu tên/giá!");
      const finalAnh = formDataSP.anh ? formDataSP.anh : NO_IMAGE;
      const p = { ...formDataSP, giaGoc: parseInt(formDataSP.giaGoc)||0, giaBan: parseInt(formDataSP.giaBan)||0, phanTramGiam: parseInt(formDataSP.phanTramGiam)||0, soLuong: parseInt(formDataSP.soLuong)||0, anh: finalAnh };
      if (editingSP) handleUpdateDS_SP('UPDATE', { ...p, id: editingSP.id }); else handleUpdateDS_SP('ADD', p);
      setShowModalSP(false); setEditingSP(null); setFormDataSP({ ten: '', giaGoc: '', phanTramGiam: 0, giaBan: '', donVi: 'Cái', soLuong: 10, moTa: '', anh: '', phanLoai: 'thitca', isKhuyenMai: false, isBanChay: false, isMoi: false });
  }

  function handleAddDM() { if (!formDataDM.ten) return alert("Nhập tên!"); handleUpdateDS_DM('ADD', { ...formDataDM, order: dsDanhMuc.length }); setFormDataDM({ ten: '', icon: '', parent: '' }); }
  function handleDeleteSP(id) { if(window.confirm("Xóa?")) handleUpdateDS_SP('DELETE', id); }

  if (!isLoggedIn) return (
      <div style={{height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#008848'}}>
          <div className="bg-white p-5 rounded shadow text-center" style={{width: '400px'}}>
              <h2 className="text-success fw-bold mb-3">ADMIN LOGIN</h2>
              <Form onSubmit={e => {e.preventDefault(); handleLogin()}}>
                  <Form.Control className="mb-3 p-3" placeholder="Username" value={loginInput.username} onChange={e => setLoginInput({...loginInput, username: e.target.value})} />
                  <Form.Control className="mb-4 p-3" type="password" placeholder="Password" value={loginInput.password} onChange={e => setLoginInput({...loginInput, password: e.target.value})} />
                  <Button variant="success" type="submit" className="w-100 py-3 fw-bold">ĐĂNG NHẬP</Button>
              </Form>
              <Link to="/" className="d-block mt-4 text-decoration-none text-success">← Về trang chủ</Link>
          </div>
      </div>
  );

  return (
    // DÙNG CONTAINER FLUID ĐỂ TRÀN MÀN HÌNH
    <Container fluid className="p-0 bg-light min-vh-100">
      <div className="bg-success text-white p-3 d-flex justify-content-between align-items-center shadow-sm">
          <h4 className="m-0 fw-bold">QUẢN TRỊ HỆ THỐNG</h4>
          <div>
            <Button variant="outline-light" size="sm" className="me-2">Đổi Pass</Button>
            <Link to="/"><Button variant="danger" size="sm">Thoát</Button></Link>
          </div>
      </div>

      <div className="p-3">
          <Tabs defaultActiveKey="products" className="mb-3 bg-white rounded shadow-sm p-2">
            <Tab eventKey="products" title="📦 Quản lý Sản phẩm">
                <Button className="mb-3" variant="success" onClick={() => {setEditingSP(null); setShowModalSP(true)}}>+ Thêm Sản Phẩm</Button>
                <div className="bg-white rounded shadow-sm">
                    <Table hover responsive className="m-0 align-middle">
                        <thead className="table-light"><tr><th>Ảnh</th><th>Tên sản phẩm</th><th>Giá bán</th><th>Kho</th><th>Thao tác</th></tr></thead>
                        <tbody>{dsSanPham.map(sp => (
                            <tr key={sp.id}>
                                <td><img src={sp.anh || NO_IMAGE} width="50" height="50" className="rounded border" style={{objectFit:'cover'}} onError={e=>e.target.src=NO_IMAGE}/></td>
                                <td><span className="fw-bold">{sp.ten}</span><br/><small className="text-muted">{sp.phanLoai}</small></td>
                                <td className="text-danger fw-bold">{sp.giaBan?.toLocaleString()} ¥</td>
                                <td>{sp.soLuong}</td>
                                <td><Button size="sm" variant="warning" className="me-1" onClick={()=>{setEditingSP(sp); setFormDataSP(sp); setShowModalSP(true)}}>Sửa</Button><Button size="sm" variant="danger" onClick={() => handleDeleteSP(sp.id)}>Xóa</Button></td>
                            </tr>
                        ))}</tbody>
                    </Table>
                </div>
            </Tab>
            <Tab eventKey="orders" title="📋 Đơn hàng">
                 <div className="bg-white rounded shadow-sm p-3 text-center text-muted">Chức năng quản lý đơn hàng đang phát triển</div>
            </Tab>
            <Tab eventKey="menu" title="📂 Danh mục">
                 <div className="bg-white rounded shadow-sm p-3">
                    <div className="d-flex gap-2 mb-3">
                        <Form.Control placeholder="Tên danh mục" value={formDataDM.ten} onChange={e=>setFormDataDM({...formDataDM, ten:e.target.value})} />
                        <Button variant="success" onClick={handleAddDM}>Thêm</Button>
                    </div>
                    {/* BẢNG DANH MỤC TRÀN RỘNG */}
                    <Table bordered>
                        <thead className="table-light"><tr><th>Tên danh mục</th><th>Thao tác</th></tr></thead>
                        <tbody>{dsDanhMuc.map(dm => (<tr key={dm.id}><td>{dm.ten}</td><td><Button size="sm" variant="danger">Xóa</Button></td></tr>))}</tbody>
                    </Table>
                 </div>
            </Tab>
          </Tabs>
      </div>

      {/* MODAL GIỮ NGUYÊN */}
      <Modal show={showModalSP} onHide={()=>setShowModalSP(false)} size="lg">
         <Modal.Header closeButton><Modal.Title>{editingSP?'Sửa Sản Phẩm':'Thêm Sản Phẩm'}</Modal.Title></Modal.Header>
         <Modal.Body>
             <Form>
                <Row className="mb-3"><Col><Form.Label>Tên</Form.Label><Form.Control value={formDataSP.ten} onChange={e=>setFormDataSP({...formDataSP, ten:e.target.value})} /></Col><Col><Form.Label>Loại</Form.Label><Form.Select value={formDataSP.phanLoai} onChange={e=>setFormDataSP({...formDataSP, phanLoai:e.target.value})}>{dsDanhMuc.map(d=><option key={d.id} value={d.customId||d.id}>{d.ten}</option>)}</Form.Select></Col></Row>
                <Row className="mb-3"><Col><Form.Label>Giá Gốc</Form.Label><Form.Control type="number" value={formDataSP.giaGoc} onChange={e=>setFormDataSP({...formDataSP, giaGoc:e.target.value})} /></Col><Col><Form.Label>Giá Bán</Form.Label><Form.Control value={formDataSP.giaBan} readOnly /></Col></Row>
                <Form.Group className="mb-3"><Form.Label>Ảnh</Form.Label><Form.Control type="file" onChange={handleImageUpload} /></Form.Group>
                <Form.Group className="mb-3"><Form.Label>Mô tả</Form.Label><ReactQuill theme="snow" value={formDataSP.moTa} onChange={v=>setFormDataSP({...formDataSP, moTa:v})} /></Form.Group>
             </Form>
         </Modal.Body>
         <Modal.Footer><Button onClick={handleSaveSP}>Lưu</Button></Modal.Footer>
      </Modal>
    </Container>
  );
}
export default Admin;