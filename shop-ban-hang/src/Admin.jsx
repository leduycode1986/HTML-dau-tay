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
  const [showModalEditDM, setShowModalEditDM] = useState(false);
  const [editingDM, setEditingDM] = useState(null);
  const [editFormDM, setEditFormDM] = useState({ id: '', ten: '', icon: '', parent: '' });
  const [showModalPass, setShowModalPass] = useState(false);
  const [passForm, setPassForm] = useState({ oldPass: '', newPass: '', confirmPass: '' });

  useEffect(() => { if(formDataSP.giaGoc) { const goc = parseInt(formDataSP.giaGoc) || 0; const giam = parseInt(formDataSP.phanTramGiam) || 0; setFormDataSP(prev => ({ ...prev, giaBan: Math.floor(goc * (1 - giam/100)) })); } }, [formDataSP.giaGoc, formDataSP.phanTramGiam]);
  function handleLogin() { if (loginInput.username === adminConfig.username && loginInput.password === adminConfig.password) setIsLoggedIn(true); else alert("Sai thông tin!"); }
  function handleChangePassword() { if (passForm.oldPass !== adminConfig.password) return alert("Sai mật khẩu cũ!"); setAdminConfig({ ...adminConfig, password: passForm.newPass }); alert("Đổi thành công!"); setShowModalPass(false); }
  const handleImageUpload = (e) => { const file = e.target.files[0]; if (file) { const reader = new FileReader(); reader.onloadend = () => setFormDataSP({ ...formDataSP, anh: reader.result }); reader.readAsDataURL(file); } };
  function handleSaveSP() { if (!formDataSP.ten || !formDataSP.giaBan) return alert("Thiếu tên/giá!"); const finalAnh = formDataSP.anh ? formDataSP.anh : NO_IMAGE; const p = { ...formDataSP, giaGoc: parseInt(formDataSP.giaGoc)||0, giaBan: parseInt(formDataSP.giaBan)||0, phanTramGiam: parseInt(formDataSP.phanTramGiam)||0, soLuong: parseInt(formDataSP.soLuong)||0, anh: finalAnh }; if (editingSP) handleUpdateDS_SP('UPDATE', { ...p, id: editingSP.id }); else handleUpdateDS_SP('ADD', p); setShowModalSP(false); setEditingSP(null); setFormDataSP({ ten: '', giaGoc: '', phanTramGiam: 0, giaBan: '', donVi: 'Cái', soLuong: 10, moTa: '', anh: '', phanLoai: 'thitca', isKhuyenMai: false, isBanChay: false, isMoi: false }); }
  function handleAddDM() { if (!formDataDM.ten) return alert("Nhập tên!"); handleUpdateDS_DM('ADD', { ...formDataDM, order: dsDanhMuc.length }); setFormDataDM({ ten: '', icon: '', parent: '' }); }
  function handleSaveEditDM() { handleUpdateDS_DM('UPDATE', editFormDM); setShowModalEditDM(false); }
  function handleDeleteSP(id) { if(window.confirm("Xóa?")) handleUpdateDS_SP('DELETE', id); }
  function handleDeleteDM(id) { if(id==='all') return alert("Cấm xóa gốc"); if(window.confirm("Xóa?")) handleUpdateDS_DM('DELETE', id); }
  const sortedDanhMuc = (() => { const s=(a,b)=>(a.order||0)-(b.order||0); const r=dsDanhMuc.filter(d=>!d.parent).sort(s); const c=dsDanhMuc.filter(d=>d.parent).sort(s); let res=[]; r.forEach(root=>{res.push(root); res.push(...c.filter(ch=>ch.parent===(root.customId||root.id)))}); return res; })();

  if (!isLoggedIn) return (
      <div className="admin-login-bg">
          <div className="login-card">
              <h3 className="fw-bold text-success mb-3">ADMIN CP</h3>
              <Form onSubmit={e => {e.preventDefault(); handleLogin()}}>
                  <Form.Control className="mb-3 p-3 bg-light" placeholder="Username" value={loginInput.username} onChange={e => setLoginInput({...loginInput, username: e.target.value})} />
                  <Form.Control className="mb-4 p-3 bg-light" type="password" placeholder="Password" value={loginInput.password} onChange={e => setLoginInput({...loginInput, password: e.target.value})} />
                  <Button variant="success" type="submit" className="w-100 py-3 fw-bold">ĐĂNG NHẬP</Button>
              </Form>
              <Link to="/" className="d-block mt-4 text-decoration-none text-success">← Về trang chủ</Link>
          </div>
      </div>
  );

  return (
    <Container fluid className="p-0 bg-light min-vh-100">
      <div className="admin-header d-flex justify-content-between align-items-center sticky-top">
          <h4 className="m-0 fw-bold">QUẢN TRỊ HỆ THỐNG</h4>
          <div><Button variant="light" size="sm" className="me-2 text-success fw-bold" onClick={()=>setShowModalPass(true)}>Đổi Pass</Button><Link to="/"><Button variant="danger" size="sm" className="fw-bold">Thoát</Button></Link></div>
      </div>
      <div className="p-3">
          <Tabs defaultActiveKey="products" className="mb-3 bg-white rounded shadow-sm p-2">
            <Tab eventKey="products" title="📦 Quản lý Sản phẩm">
                <Button className="mb-3 fw-bold" variant="primary" onClick={() => {setEditingSP(null); setShowModalSP(true)}}>+ Thêm Sản Phẩm Mới</Button>
                <div className="bg-white rounded shadow-sm table-responsive">
                    <Table hover className="m-0 align-middle">
                        <thead className="table-light"><tr><th>Ảnh</th><th>Tên sản phẩm</th><th>Giá bán</th><th>Kho</th><th>Thao tác</th></tr></thead>
                        <tbody>{dsSanPham.map(sp => (
                            <tr key={sp.id}>
                                <td><img src={sp.anh || NO_IMAGE} className="admin-table-img" onError={e=>e.target.src=NO_IMAGE}/></td>
                                <td><span className="fw-bold">{sp.ten}</span><br/><small className="text-muted">{sp.phanLoai}</small></td>
                                <td className="text-danger fw-bold">{sp.giaBan?.toLocaleString()} ¥</td>
                                <td>{sp.soLuong}</td>
                                <td><Button size="sm" variant="warning" className="me-1" onClick={()=>{setEditingSP(sp); setFormDataSP(sp); setShowModalSP(true)}}>Sửa</Button><Button size="sm" variant="danger" onClick={() => handleDeleteSP(sp.id)}>Xóa</Button></td>
                            </tr>
                        ))}</tbody>
                    </Table>
                </div>
            </Tab>
            <Tab eventKey="orders" title={`📋 Đơn hàng (${dsDonHang ? dsDonHang.length : 0})`}>
                 <div className="bg-white rounded shadow-sm table-responsive">
                    <Table hover className="m-0 align-middle">
                        <thead className="table-primary"><tr><th>Ngày</th><th>Khách hàng</th><th>Tổng tiền</th><th>Trạng thái</th><th>Xử lý</th></tr></thead>
                        <tbody>{dsDonHang?.map(dh=><tr key={dh.id}><td>{dh.ngayDat?.toDate ? dh.ngayDat.toDate().toLocaleString('vi-VN') : 'Mới'}</td><td>{dh.khachHang.ten}<br/><small>{dh.khachHang.sdt}</small></td><td className="fw-bold text-danger">{parseInt(dh.tongTien).toLocaleString()} ¥</td><td><Badge bg={dh.trangThai==='Mới đặt'?'primary':'success'}>{dh.trangThai}</Badge></td><td><Button size="sm" variant="success" onClick={()=>handleUpdateStatusOrder(dh.id,'Hoàn thành')}>Xong</Button> <Button size="sm" variant="danger" onClick={()=>handleDeleteOrder(dh.id)}>Xóa</Button></td></tr>)}</tbody>
                    </Table>
                 </div>
            </Tab>
            <Tab eventKey="menu" title="📂 Danh mục">
                 <div className="bg-white rounded shadow-sm p-3">
                    <div className="d-flex gap-2 mb-3"><Form.Control placeholder="Tên danh mục" value={formDataDM.ten} onChange={e=>setFormDataDM({...formDataDM, ten:e.target.value})} /><Form.Select value={formDataDM.icon} onChange={e=>setFormDataDM({...formDataDM, icon:e.target.value})}><option value="">Icon</option>{ICON_LIST.map(i=><option key={i} value={i}>{i}</option>)}</Form.Select><Form.Select value={formDataDM.parent} onChange={e=>setFormDataDM({...formDataDM, parent:e.target.value})}><option value="">Gốc</option>{dsDanhMuc.filter(d=>!d.parent).map(d=><option key={d.id} value={d.customId||d.id}>{d.ten}</option>)}</Form.Select><Button variant="success" onClick={handleAddDM} style={{whiteSpace:'nowrap'}}>+ Thêm</Button></div>
                    <Table bordered><thead className="table-light"><tr><th>Tên danh mục</th><th>Icon</th><th>Thao tác</th></tr></thead><tbody>{sortedDanhMuc.map(dm => (<tr key={dm.id}><td>{dm.parent ? <span className="ms-4 text-muted">↳</span> : <Badge bg="success" className="me-2">Gốc</Badge>} <b>{dm.ten}</b></td><td className="text-center fs-5">{dm.icon}</td><td><Button size="sm" variant="warning" onClick={()=>{setEditingDM(dm); setEditFormDM(dm); setShowModalEditDM(true)}}>Sửa</Button> <Button size="sm" variant="danger" onClick={()=>handleDeleteDM(dm.id)}>Xóa</Button></td></tr>))}</tbody></Table>
                 </div>
            </Tab>
          </Tabs>
      </div>
      {/* MODAL GIỮ NGUYÊN */}
      <Modal show={showModalSP} onHide={()=>setShowModalSP(false)} size="lg" backdrop="static"><Modal.Header closeButton><Modal.Title>{editingSP?'Sửa':'Thêm'}</Modal.Title></Modal.Header><Modal.Body><Form><Row className="mb-3"><Col md={8}><Form.Label>Tên</Form.Label><Form.Control value={formDataSP.ten} onChange={e=>setFormDataSP({...formDataSP, ten:e.target.value})} /></Col><Col md={4}><Form.Label>Loại</Form.Label><Form.Select value={formDataSP.phanLoai} onChange={e=>setFormDataSP({...formDataSP, phanLoai:e.target.value})}>{dsDanhMuc.map(d=><option key={d.id} value={d.customId||d.id}>{d.ten}</option>)}</Form.Select></Col></Row><Row className="mb-3 bg-light p-2 rounded mx-0"><Col><Form.Label>Giá Gốc</Form.Label><Form.Control type="number" value={formDataSP.giaGoc} onChange={e=>setFormDataSP({...formDataSP, giaGoc:e.target.value})} /></Col><Col><Form.Label>% Giảm</Form.Label><Form.Control type="number" value={formDataSP.phanTramGiam} onChange={e=>setFormDataSP({...formDataSP, phanTramGiam:e.target.value})} /></Col><Col><Form.Label className="text-danger fw-bold">Giá Bán</Form.Label><Form.Control value={formDataSP.giaBan} readOnly /></Col><Col><Form.Label>Đơn vị</Form.Label><Form.Control value={formDataSP.donVi} onChange={e=>setFormDataSP({...formDataSP, donVi:e.target.value})} placeholder="Hộp" /></Col></Row><Row className="mb-3"><Col md={4}><Form.Label>Kho</Form.Label><Form.Control type="number" value={formDataSP.soLuong} onChange={e => setFormDataSP({...formDataSP, soLuong: e.target.value})} /></Col><Col md={8}><Form.Label>Ảnh (Upload)</Form.Label><Form.Control type="file" onChange={handleImageUpload} /></Col></Row><Form.Group className="mb-3"><Form.Label>Mô tả</Form.Label><ReactQuill theme="snow" value={formDataSP.moTa} onChange={v=>setFormDataSP({...formDataSP, moTa:v})} /></Form.Group><div className="d-flex gap-3"><Form.Check label="Khuyến mãi" checked={formDataSP.isKhuyenMai} onChange={e=>setFormDataSP({...formDataSP, isKhuyenMai:e.target.checked})} /><Form.Check label="Hàng Mới" checked={formDataSP.isMoi} onChange={e=>setFormDataSP({...formDataSP, isMoi:e.target.checked})} /></div></Form></Modal.Body><Modal.Footer><Button onClick={handleSaveSP}>Lưu</Button></Modal.Footer></Modal>
      <Modal show={showModalEditDM} onHide={()=>setShowModalEditDM(false)}><Modal.Body><Form.Control value={editFormDM.ten} onChange={e=>setEditFormDM({...editFormDM, ten:e.target.value})} /><Button onClick={handleSaveEditDM} className="mt-2 w-100">Cập nhật</Button></Modal.Body></Modal>
      <Modal show={showModalPass} onHide={()=>setShowModalPass(false)}><Modal.Body><Form.Control placeholder="Mật khẩu mới" onChange={e=>setPassForm({...passForm, newPass:e.target.value})} /><Button onClick={handleChangePassword} className="mt-2 w-100">Đổi Mật Khẩu</Button></Modal.Body></Modal>
    </Container>
  );
}
export default Admin;