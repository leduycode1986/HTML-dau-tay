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
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const ICON_LIST = ['🔥', '⚡', '💎', '🆕', '🎁', '🏷️', '📦', '🥩', '🍗', '🍖', '🐟', '🦀', '🦐', '🐙', '🥚', '🥬', '🥦', '🥕', '🥔', '🍆', '🌽', '🍄', '🍅', '🍎', '🍇', '🍉', '🍌', '🍋', '🍊', '🍓', '🥭', '🥥', '🍚', '🌾', '🍞', '🥖', '🥪', '🥜', '🌰', '🍜', '🍝', '🍲', '🥣', '🥢', '🥡', '🥘', '🍾', '🧂', '🌶️', '🧄', '🧅', '🥫', '🍯', '🧈', '🍺', '🍷', '🥂', '🥤', '🧃', '☕', '🍵', '🍼', '🥛', '🧀', '🍦', '🍧', '🍰', '🍪', '🍫', '🍬', '🧴', '🧼', '🧽', '🧻', '🪥', '🧹', '🧺', '🏠', '👶', '🧸', '🐶', '🐱'];

function Admin({ dsSanPham, handleUpdateDS_SP, dsDanhMuc, handleUpdateDS_DM, dsDonHang, handleUpdateStatusOrder, handleDeleteOrder }) {
  const [adminConfig, setAdminConfig] = useState(() => { const saved = localStorage.getItem('adminConfig'); return saved ? JSON.parse(saved) : { username: 'admin', password: 'admin123' }; });
  useEffect(() => { localStorage.setItem('adminConfig', JSON.stringify(adminConfig)); }, [adminConfig]);
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
          const goc = parseInt(formDataSP.giaGoc);
          const giam = parseInt(formDataSP.phanTramGiam) || 0;
          const ban = goc * (1 - giam / 100);
          setFormDataSP(prev => ({ ...prev, giaBan: Math.floor(ban) }));
      }
  }, [formDataSP.giaGoc, formDataSP.phanTramGiam]);

  function handleLogin() { if (loginInput.username === adminConfig.username && loginInput.password === adminConfig.password) setIsLoggedIn(true); else alert("❌ Sai thông tin!"); }
  function handleChangePassword() { if (passForm.oldPass !== adminConfig.password) return alert("Sai mật khẩu cũ!"); if (passForm.newPass !== passForm.confirmPass) return alert("Mật khẩu mới không khớp!"); setAdminConfig({ ...adminConfig, password: passForm.newPass }); alert("✅ Đổi mật khẩu thành công!"); setShowModalPass(false); }
  const handleImageUpload = (e) => { const file = e.target.files[0]; if (file) { const reader = new FileReader(); reader.onloadend = () => setFormDataSP({ ...formDataSP, anh: reader.result }); reader.readAsDataURL(file); } };
  function handleSaveSP() { if (!formDataSP.ten || !formDataSP.giaBan) return alert("Thiếu tên/giá!"); const p = { ...formDataSP, giaGoc: parseInt(formDataSP.giaGoc)||0, giaBan: parseInt(formDataSP.giaBan)||0, phanTramGiam: parseInt(formDataSP.phanTramGiam)||0, soLuong: parseInt(formDataSP.soLuong)||0, anh: formDataSP.anh || 'https://via.placeholder.com/150' }; if (editingSP) handleUpdateDS_SP('UPDATE', { ...p, id: editingSP.id }); else handleUpdateDS_SP('ADD', p); setShowModalSP(false); setEditingSP(null); setFormDataSP({ ten: '', giaGoc: '', phanTramGiam: 0, giaBan: '', donVi: 'Cái', soLuong: 10, moTa: '', anh: '', phanLoai: 'thitca', isKhuyenMai: false, isBanChay: false, isMoi: false }); }
  function handleEditSP(sp) { setEditingSP(sp); setFormDataSP(sp); setShowModalSP(true); }
  function handleDeleteSP(id) { if(window.confirm("Xóa SP?")) handleUpdateDS_SP('DELETE', id); }
  function handleAddDM() { if (!formDataDM.ten) return alert("Nhập tên!"); handleUpdateDS_DM('ADD', { ...formDataDM, order: dsDanhMuc.length }); setFormDataDM({ ten: '', icon: '', parent: '' }); }
  function handleEditDM(dm) { setEditingDM(dm); setEditFormDM(dm); setShowModalEditDM(true); }
  function handleSaveEditDM() { handleUpdateDS_DM('UPDATE', editFormDM); setShowModalEditDM(false); setEditingDM(null); }
  function handleDeleteDM(id) { if(id === 'all') return alert("Cấm xóa gốc!"); if(window.confirm("Xóa DM?")) handleUpdateDS_DM('DELETE', id); }
  
  const sortedDanhMuc = (() => { const s = (a, b) => (a.order||0)-(b.order||0); const r = dsDanhMuc.filter(d=>!d.parent).sort(s); const c = dsDanhMuc.filter(d=>d.parent).sort(s); let res=[]; r.forEach(root=>{res.push(root); res.push(...c.filter(ch=>ch.parent===(root.customId||root.id)))}); return res; })();
  const handleMoveCategory = (item, direction) => { 
      const siblings = dsDanhMuc.filter(dm => (item.parent ? dm.parent === item.parent : !dm.parent)).sort((a,b)=>(a.order||0)-(b.order||0));
      const idx = siblings.findIndex(d=>d.id===item.id); if(idx===-1) return;
      const targetIdx = direction==='UP'?idx-1:idx+1; if(targetIdx<0||targetIdx>=siblings.length) return;
      const tItem = siblings[targetIdx];
      handleUpdateDS_DM('UPDATE', {...item, order: (tItem.order !== undefined ? tItem.order : targetIdx)});
      handleUpdateDS_DM('UPDATE', {...tItem, order: (item.order !== undefined ? item.order : idx)});
  };
  
  const modules = { toolbar: [ [{ 'header': [1, 2, 3, false] }], ['bold', 'italic', 'underline'], [{'list': 'ordered'}, {'list': 'bullet'}], ['link', 'clean'] ] };

  // --- GIAO DIỆN ĐĂNG NHẬP ĐẸP ---
  if (!isLoggedIn) return (
      <div style={{height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'linear-gradient(135deg, #008848, #e8f5e9)'}}>
          <div style={{background: 'white', padding: '40px', borderRadius: '15px', width: '400px', textAlign: 'center', boxShadow: '0 10px 20px rgba(0,0,0,0.2)'}}>
              <h3 style={{color: '#008848', fontWeight: 'bold', marginBottom: '20px'}}>ADMIN MAI VÀNG</h3>
              <Form onSubmit={e => {e.preventDefault(); handleLogin()}}>
                  <Form.Control className="mb-3" placeholder="Tên đăng nhập" value={loginInput.username} onChange={e => setLoginInput({...loginInput, username: e.target.value})} style={{padding: '12px'}} />
                  <Form.Control className="mb-4" type="password" placeholder="Mật khẩu" value={loginInput.password} onChange={e => setLoginInput({...loginInput, password: e.target.value})} style={{padding: '12px'}} />
                  <Button variant="success" type="submit" style={{width: '100%', padding: '12px', fontWeight: 'bold'}}>ĐĂNG NHẬP</Button>
              </Form>
              <Link to="/" style={{display: 'block', marginTop: '20px', textDecoration: 'none', color: '#008848'}}>← Về trang bán hàng</Link>
          </div>
      </div>
  );

  return (
    <div style={{ padding: '20px', backgroundColor: '#fff', minHeight: '100vh' }}>
      <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '2px solid #008848', paddingBottom: '10px'}}>
          <h2 style={{color: '#008848'}}>QUẢN TRỊ HỆ THỐNG</h2>
          <div><Button variant="outline-primary" className="me-2" onClick={() => setShowModalPass(true)}>Đổi mật khẩu</Button><Link to="/"><Button variant="outline-danger">Thoát</Button></Link></div>
      </div>
      <Tabs defaultActiveKey="products" className="mb-3">
        <Tab eventKey="products" title="📦 Sản phẩm">
            <Button className="mb-3" onClick={() => {setEditingSP(null); setFormDataSP({ ten: '', giaGoc: '', phanTramGiam: 0, giaBan: '', donVi: 'Cái', soLuong: 10, moTa: '', anh: '', phanLoai: 'thitca', isKhuyenMai: false, isBanChay: false, isMoi: false }); setShowModalSP(true)}}>+ Thêm Sản Phẩm</Button>
            <Table striped bordered hover responsive>
                <thead><tr><th>Ảnh</th><th>Tên</th><th>Giá bán / Đơn vị</th><th>Kho</th><th>Trạng thái</th><th>Xử lý</th></tr></thead>
                <tbody>{dsSanPham.map(sp => (
                    <tr key={sp.id}>
                        <td><img src={sp.anh} width="50" style={{borderRadius: '5px'}}/></td>
                        <td><b>{sp.ten}</b>{sp.moTa && <div style={{fontSize: '11px', color: '#777', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}} dangerouslySetInnerHTML={{__html: sp.moTa.replace(/<[^>]+>/g, '')}}></div>}</td>
                        <td><div style={{fontWeight: 'bold', color: 'red'}}>{sp.giaBan?.toLocaleString('ja-JP')} ¥</div>{sp.isKhuyenMai && <div style={{textDecoration: 'line-through', color: '#999', fontSize: '12px'}}>{sp.giaGoc?.toLocaleString('ja-JP')} ¥</div>}<div style={{fontSize: '12px', color: '#555'}}>({sp.donVi})</div></td>
                        <td>{sp.soLuong}</td>
                        <td>{sp.isKhuyenMai && <Badge bg="danger" className="me-1">-{sp.phanTramGiam}%</Badge>}{sp.isBanChay && <Badge bg="warning" text="dark" className="me-1">Hot</Badge>}{sp.isMoi && <Badge bg="success">New</Badge>}</td>
                        <td><Button size="sm" variant="warning" onClick={() => handleEditSP(sp)}>Sửa</Button> <Button size="sm" variant="danger" onClick={() => handleDeleteSP(sp.id)}>Xóa</Button></td>
                    </tr>
                ))}</tbody>
            </Table>
        </Tab>
        <Tab eventKey="orders" title={`📋 Đơn hàng (${dsDonHang ? dsDonHang.length : 0})`}>
             <Table striped bordered hover responsive>
                <thead style={{background: '#e3f2fd'}}><tr><th>Ngày</th><th>Khách</th><th>Chi tiết</th><th>Tổng tiền</th><th>Trạng thái</th><th>Xử lý</th></tr></thead>
                <tbody>{dsDonHang && dsDonHang.map(dh => (<tr key={dh.id}>
                    <td>{dh.ngayDat?.toDate ? dh.ngayDat.toDate().toLocaleString('ja-JP') : 'Vừa xong'}</td>
                    <td><b>{dh.khachHang.ten}</b><br/><small>{dh.khachHang.sdt}</small></td>
                    <td><ul style={{margin:0, paddingLeft:'15px', fontSize:'13px'}}>{dh.gioHang.map((sp,i)=><li key={i}>{sp.ten} (x{sp.soLuong})</li>)}</ul></td>
                    <td style={{color: 'red', fontWeight: 'bold'}}>{parseInt(dh.tongTien).toLocaleString('ja-JP')} ¥</td>
                    <td><Badge bg={dh.trangThai === 'Mới đặt' ? 'primary' : dh.trangThai === 'Đang giao' ? 'warning' : dh.trangThai === 'Hoàn thành' ? 'success' : 'secondary'}>{dh.trangThai}</Badge></td>
                    <td><Button size="sm" variant="outline-primary" onClick={()=>handleUpdateStatusOrder(dh.id,'Đang giao')}>Giao</Button> <Button size="sm" variant="outline-success" onClick={()=>handleUpdateStatusOrder(dh.id,'Hoàn thành')}>Xong</Button> <Button size="sm" variant="outline-danger" onClick={()=>handleDeleteOrder(dh.id)}>Xóa</Button></td>
                </tr>))}</tbody>
            </Table>
        </Tab>
        <Tab eventKey="menu" title="📂 Menu">
            <div style={{background: '#f8f9fa', padding: '15px', marginBottom: '20px', display: 'flex', gap: '10px'}}><Form.Control placeholder="Tên" value={formDataDM.ten} onChange={e => setFormDataDM({...formDataDM, ten: e.target.value})} /><Form.Select value={formDataDM.icon} onChange={e => setFormDataDM({...formDataDM, icon: e.target.value})}><option value="">(None)</option>{ICON_LIST.map(i => <option key={i} value={i}>{i}</option>)}</Form.Select><Form.Select value={formDataDM.parent} onChange={e => setFormDataDM({...formDataDM, parent: e.target.value})}><option value="">-- Gốc --</option>{dsDanhMuc.filter(d=>!d.parent && d.id !== 'all').map(d=><option key={d.id} value={d.customId||d.id}>Con của: {d.ten}</option>)}</Form.Select><Button variant="success" onClick={handleAddDM}>+ Thêm</Button></div>
            <Table bordered hover><thead><tr><th>Sắp xếp</th><th>Loại</th><th>Tên</th><th>Icon</th><th>Xử lý</th></tr></thead><tbody>{sortedDanhMuc.map(dm => (<tr key={dm.id}>
                <td style={{width: '100px'}}><Button size="sm" variant="light" onClick={()=>handleMoveCategory(dm,'UP')}>↑</Button> <Button size="sm" variant="light" onClick={()=>handleMoveCategory(dm,'DOWN')}>↓</Button></td>
                <td>{dm.parent ? <Badge bg="info">Con</Badge> : <Badge bg="primary">Gốc</Badge>}</td>
                <td>{dm.parent && <span style={{color: '#ccc', marginRight: '5px'}}>↳</span>}<b>{dm.ten}</b></td>
                <td style={{fontSize: '20px'}}>{dm.icon}</td>
                <td>{dm.id!=='all' && <><Button size="sm" variant="warning" onClick={()=>handleEditDM(dm)}>Sửa</Button> <Button size="sm" variant="danger" onClick={()=>handleDeleteDM(dm.id)}>Xóa</Button></>}</td>
            </tr>))}</tbody></Table>
        </Tab>
      </Tabs>
      <Modal show={showModalSP} onHide={() => setShowModalSP(false)} size="lg">
         <Modal.Header closeButton><Modal.Title>{editingSP ? 'Cập nhật' : 'Thêm mới'}</Modal.Title></Modal.Header>
         <Modal.Body><Form>
            <Row className="mb-3"><Col md={8}><Form.Label>Tên</Form.Label><Form.Control value={formDataSP.ten} onChange={e => setFormDataSP({...formDataSP, ten: e.target.value})} /></Col><Col md={4}><Form.Label>Danh mục</Form.Label><Form.Select value={formDataSP.phanLoai} onChange={e => setFormDataSP({...formDataSP, phanLoai: e.target.value})}>{dsDanhMuc.map(dm => <option key={dm.id} value={dm.customId || dm.id}>{dm.parent ? `-- ${dm.ten}` : dm.ten}</option>)}</Form.Select></Col></Row>
            <Row className="mb-3" style={{background: '#f8f9fa', padding: '10px'}}><Col md={3}><Form.Label>Giá Gốc (¥)</Form.Label><Form.Control type="number" value={formDataSP.giaGoc} onChange={e => setFormDataSP({...formDataSP, giaGoc: e.target.value})} /></Col><Col md={3}><Form.Label>% Giảm</Form.Label><Form.Control type="number" value={formDataSP.phanTramGiam} onChange={e => setFormDataSP({...formDataSP, phanTramGiam: e.target.value})} /></Col><Col md={3}><Form.Label style={{color:'red'}}>Giá Bán</Form.Label><Form.Control value={formDataSP.giaBan} readOnly /></Col><Col md={3}><Form.Label>Đơn vị</Form.Label><Form.Control value={formDataSP.donVi} onChange={e => setFormDataSP({...formDataSP, donVi: e.target.value})} /></Col></Row>
            <Row className="mb-3"><Col md={4}><Form.Label>Kho</Form.Label><Form.Control type="number" value={formDataSP.soLuong} onChange={e => setFormDataSP({...formDataSP, soLuong: e.target.value})} /></Col><Col md={8}><Form.Label>Ảnh</Form.Label><Form.Control type="file" onChange={handleImageUpload} /></Col></Row>
            <Form.Group className="mb-3"><Form.Label>Mô tả (SEO)</Form.Label><ReactQuill theme="snow" value={formDataSP.moTa} onChange={(v) => setFormDataSP({...formDataSP, moTa: v})} modules={modules} /></Form.Group>
            <div className="d-flex gap-4"><Form.Check label="Khuyến Mãi" checked={formDataSP.isKhuyenMai} onChange={e => setFormDataSP({...formDataSP, isKhuyenMai: e.target.checked})} /><Form.Check label="Bán Chạy" checked={formDataSP.isBanChay} onChange={e => setFormDataSP({...formDataSP, isBanChay: e.target.checked})} /><Form.Check label="Mới" checked={formDataSP.isMoi} onChange={e => setFormDataSP({...formDataSP, isMoi: e.target.checked})} /></div>
         </Form></Modal.Body>
         <Modal.Footer><Button onClick={handleSaveSP}>Lưu</Button></Modal.Footer>
      </Modal>
      <Modal show={showModalEditDM} onHide={() => setShowModalEditDM(false)}><Modal.Body><Form.Control className="mb-2" value={editFormDM.ten} onChange={e => setEditFormDM({...editFormDM, ten: e.target.value})} /><Button onClick={handleSaveEditDM}>Lưu</Button></Modal.Body></Modal>
      <Modal show={showModalPass} onHide={() => setShowModalPass(false)}><Modal.Body><Form.Control className="mb-2" placeholder="Pass mới" onChange={e => setPassForm({...passForm, newPass: e.target.value})} /><Button onClick={handleChangePassword}>Đổi</Button></Modal.Body></Modal>
    </div>
  );
}
export default Admin;