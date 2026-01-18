import React, { useState, useEffect } from 'react';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import Badge from 'react-bootstrap/Badge';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import { Link } from 'react-router-dom';

// --- BỘ ICON ---
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
  
  // --- LOGIC SẮP XẾP ---
  const getSortedDanhMuc = () => {
      const sortFunc = (a, b) => (a.order || 0) - (b.order || 0);
      const roots = dsDanhMuc.filter(dm => !dm.parent).sort(sortFunc);
      const children = dsDanhMuc.filter(dm => dm.parent).sort(sortFunc);
      let result = [];
      roots.forEach(root => {
          result.push(root);
          // Tìm con theo ID của Firebase hoặc customId cũ (để tương thích dữ liệu cũ)
          const myChildren = children.filter(child => child.parent === (root.customId || root.id));
          result.push(...myChildren);
      });
      return result;
  };
  const sortedDanhMuc = getSortedDanhMuc();

  const handleMoveCategory = (item, direction) => {
      const siblings = dsDanhMuc.filter(dm => {
          if (!item.parent) return !dm.parent;
          return dm.parent === item.parent;
      }).sort((a, b) => (a.order || 0) - (b.order || 0));

      const currentIndex = siblings.findIndex(dm => dm.id === item.id);
      if (currentIndex === -1) return;
      const targetIndex = direction === 'UP' ? currentIndex - 1 : currentIndex + 1;
      if (targetIndex < 0 || targetIndex >= siblings.length) return;

      const targetItem = siblings[targetIndex];
      const order1 = item.order !== undefined ? item.order : currentIndex;
      const order2 = targetItem.order !== undefined ? targetItem.order : targetIndex;

      handleUpdateDS_DM('UPDATE', { ...item, order: order2 });
      handleUpdateDS_DM('UPDATE', { ...targetItem, order: order1 });
  };

  // --- CONFIG ---
  const [adminConfig, setAdminConfig] = useState(() => {
      const saved = localStorage.getItem('adminConfig');
      return saved ? JSON.parse(saved) : { username: 'admin', password: 'admin123' };
  });
  useEffect(() => { localStorage.setItem('adminConfig', JSON.stringify(adminConfig)); }, [adminConfig]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginInput, setLoginInput] = useState({ username: '', password: '' });
  const [showModalPass, setShowModalPass] = useState(false);
  const [passForm, setPassForm] = useState({ oldPass: '', newPass: '', confirmPass: '' });

  function handleLogin() {
      if (loginInput.username === adminConfig.username && loginInput.password === adminConfig.password) setIsLoggedIn(true);
      else alert("❌ Sai thông tin đăng nhập!");
  }
  function handleChangePassword() {
      if (passForm.oldPass !== adminConfig.password) return alert("Sai mật khẩu cũ!");
      if (passForm.newPass !== passForm.confirmPass) return alert("Mật khẩu mới không khớp!");
      setAdminConfig({ ...adminConfig, password: passForm.newPass });
      alert("✅ Đổi mật khẩu thành công!"); setShowModalPass(false);
  }

  // --- SẢN PHẨM ---
  const [showModalSP, setShowModalSP] = useState(false);
  const [editingSP, setEditingSP] = useState(null);
  const [formDataSP, setFormDataSP] = useState({ ten: '', gia: '', anh: '', phanLoai: 'thitca', isKhuyenMai: false, isBanChay: false, isMoi: false });
  const handleImageUpload = (e) => {
      const file = e.target.files[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => setFormDataSP({ ...formDataSP, anh: reader.result });
          reader.readAsDataURL(file);
      }
  };
  function handleSaveSP() {
      if (!formDataSP.ten || !formDataSP.gia) return alert("Thiếu tên/giá!");
      if (editingSP) handleUpdateDS_SP('UPDATE', { ...formDataSP, id: editingSP.id });
      else handleUpdateDS_SP('ADD', { ...formDataSP, anh: formDataSP.anh || 'https://via.placeholder.com/150' });
      setShowModalSP(false); setEditingSP(null); resetFormSP();
  }
  function handleEditSP(sp) { setEditingSP(sp); setFormDataSP(sp); setShowModalSP(true); }
  function handleDeleteSP(id) { if(window.confirm("Xóa sản phẩm?")) handleUpdateDS_SP('DELETE', id); }
  function resetFormSP() { setFormDataSP({ ten: '', gia: '', anh: '', phanLoai: 'thitca', isKhuyenMai: false, isBanChay: false, isMoi: false }); }

  // --- MENU (ĐÃ XÓA MÃ) ---
  const [formDataDM, setFormDataDM] = useState({ ten: '', icon: '', parent: '' });
  const [showModalEditDM, setShowModalEditDM] = useState(false);
  const [editingDM, setEditingDM] = useState(null);
  const [editFormDM, setEditFormDM] = useState({ id: '', ten: '', icon: '', parent: '' });

  function handleAddDM() {
      if (!formDataDM.ten) return alert("Nhập Tên!");
      const currentCount = dsDanhMuc.length;
      const newItem = { 
          ten: formDataDM.ten, 
          icon: formDataDM.icon, 
          parent: formDataDM.parent || null,
          // Không cần customId nữa, Firebase tự lo ID
          order: currentCount 
      };
      handleUpdateDS_DM('ADD', newItem);
      setFormDataDM({ ten: '', icon: '', parent: '' });
  }
  function handleEditDM(dm) { setEditingDM(dm); setEditFormDM(dm); setShowModalEditDM(true); }
  function handleSaveEditDM() { handleUpdateDS_DM('UPDATE', editFormDM); setShowModalEditDM(false); setEditingDM(null); }
  function handleDeleteDM(id) { if(id === 'all') return alert("Cấm xóa gốc!"); if(window.confirm("Xóa danh mục?")) handleUpdateDS_DM('DELETE', id); }

  const renderStatus = (status) => {
      switch(status) {
          case 'Mới đặt': return <Badge bg="primary">Mới đặt</Badge>;
          case 'Đang giao': return <Badge bg="warning" text="dark">Đang giao 🚚</Badge>;
          case 'Hoàn thành': return <Badge bg="success">Hoàn thành ✅</Badge>;
          case 'Hủy': return <Badge bg="secondary">Đã hủy ❌</Badge>;
          default: return <Badge bg="light" text="dark">{status}</Badge>;
      }
  };

  if (!isLoggedIn) return (
      <div style={{height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'linear-gradient(135deg, #008848, #e8f5e9)'}}>
          <div style={{background: 'white', padding: '40px', borderRadius: '15px', width: '400px', textAlign: 'center', boxShadow: '0 10px 20px rgba(0,0,0,0.2)'}}>
              <h3 style={{color: '#008848', fontWeight: 'bold'}}>ADMIN MAI VÀNG</h3>
              <Form onSubmit={e => {e.preventDefault(); handleLogin()}}>
                  <Form.Control className="mb-3" placeholder="User" value={loginInput.username} onChange={e => setLoginInput({...loginInput, username: e.target.value})} />
                  <Form.Control className="mb-3" type="password" placeholder="Pass" value={loginInput.password} onChange={e => setLoginInput({...loginInput, password: e.target.value})} />
                  <Button variant="success" type="submit" style={{width: '100%'}}>ĐĂNG NHẬP</Button>
              </Form>
              <Link to="/" style={{display: 'block', marginTop: '15px', textDecoration: 'none', color: '#008848'}}>← Về trang bán hàng</Link>
          </div>
      </div>
  );

  return (
    <div style={{ padding: '20px', backgroundColor: '#fff', minHeight: '100vh' }}>
      <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '2px solid #008848', paddingBottom: '10px'}}>
          <h2 style={{color: '#008848'}}>QUẢN TRỊ HỆ THỐNG</h2>
          <div>
              <Button variant="outline-primary" className="me-2" onClick={() => setShowModalPass(true)}>Đổi mật khẩu</Button>
              <Link to="/"><Button variant="outline-danger">Thoát</Button></Link>
          </div>
      </div>

      <Tabs defaultActiveKey="menu" className="mb-3">
        {/* TAB ĐƠN HÀNG */}
        <Tab eventKey="orders" title={`📋 Đơn hàng (${dsDonHang ? dsDonHang.length : 0})`}>
            <Table striped bordered hover responsive>
                <thead style={{background: '#e3f2fd'}}><tr><th>Ngày</th><th>Khách</th><th>Chi tiết</th><th>Tổng tiền</th><th>Trạng thái</th><th>Xử lý</th></tr></thead>
                <tbody>
                    {dsDonHang && dsDonHang.map(dh => (
                        <tr key={dh.id}>
                            <td>{dh.ngayDat?.toDate ? dh.ngayDat.toDate().toLocaleString('vi-VN') : 'Vừa xong'}</td>
                            <td><b>{dh.khachHang.ten}</b><br/><small>{dh.khachHang.sdt}</small></td>
                            <td><ul style={{margin:0, paddingLeft:'15px', fontSize:'13px'}}>{dh.gioHang.map((sp,i)=><li key={i}>{sp.ten} (x{sp.soLuong})</li>)}</ul></td>
                            <td style={{color: 'red', fontWeight: 'bold'}}>{dh.tongTien.toLocaleString()} đ</td>
                            <td>{renderStatus(dh.trangThai)}</td>
                            <td>
                                <Button size="sm" variant="outline-primary" onClick={()=>handleUpdateStatusOrder(dh.id,'Đang giao')} className="me-1">Giao</Button>
                                <Button size="sm" variant="outline-success" onClick={()=>handleUpdateStatusOrder(dh.id,'Hoàn thành')} className="me-1">Xong</Button>
                                <Button size="sm" variant="outline-danger" onClick={()=>handleDeleteOrder(dh.id)}>Xóa</Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </Tab>

        {/* TAB SẢN PHẨM */}
        <Tab eventKey="products" title="📦 Sản phẩm">
            <Button className="mb-3" onClick={() => {setEditingSP(null); resetFormSP(); setShowModalSP(true)}}>+ Thêm Sản Phẩm</Button>
            <Table striped bordered hover responsive>
                <thead><tr><th>Ảnh</th><th>Tên</th><th>Giá</th><th>Danh mục</th><th>Xử lý</th></tr></thead>
                <tbody>
                    {dsSanPham.map(sp => (
                        <tr key={sp.id}>
                            <td><img src={sp.anh} width="50" style={{borderRadius: '5px'}}/></td>
                            <td><b>{sp.ten}</b></td>
                            <td style={{color: 'red'}}>{sp.gia}</td>
                            <td>{dsDanhMuc.find(dm => (dm.customId || dm.id) === sp.phanLoai)?.ten || sp.phanLoai}</td>
                            <td>
                                <Button size="sm" variant="warning" onClick={() => handleEditSP(sp)} className="me-1">Sửa</Button>
                                <Button size="sm" variant="danger" onClick={() => handleDeleteSP(sp.id)}>Xóa</Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </Tab>

        {/* TAB MENU (ĐÃ XÓA MÃ) */}
        <Tab eventKey="menu" title="📂 Menu Danh Mục">
            <div style={{background: '#f8f9fa', padding: '15px', borderRadius: '10px', marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap'}}>
                {/* Ô NHẬP MÃ ĐÃ BỊ XÓA */}
                <Form.Control placeholder="Tên danh mục (vd: Thịt Heo)" style={{flex: 2, minWidth: '200px'}} value={formDataDM.ten} onChange={e => setFormDataDM({...formDataDM, ten: e.target.value})} />
                
                <Form.Select style={{width: '100px', fontSize: '16px'}} value={formDataDM.icon} onChange={e => setFormDataDM({...formDataDM, icon: e.target.value})}>
                    <option value="">(None)</option>
                    {ICON_LIST.map(icon => <option key={icon} value={icon}>{icon}</option>)}
                </Form.Select>

                <Form.Select style={{flex: 2, minWidth: '200px'}} value={formDataDM.parent} onChange={e => setFormDataDM({...formDataDM, parent: e.target.value})}>
                    <option value="">-- Danh Mục Gốc (Tạo cha) --</option>
                    {dsDanhMuc.filter(dm => !dm.parent && dm.id !== 'all').map(dm => (<option key={dm.id} value={dm.customId || dm.id}>Con của: {dm.ten}</option>))}
                </Form.Select>
                <Button variant="success" onClick={handleAddDM}>+ Thêm</Button>
            </div>

            <Table bordered hover>
                <thead style={{background: '#eee'}}><tr><th>Sắp xếp</th><th>Loại</th><th>Tên hiển thị</th><th>Icon</th><th>Xử lý</th></tr></thead>
                <tbody>
                    {sortedDanhMuc.map(dm => (
                        <tr key={dm.id}>
                            <td style={{textAlign: 'center', width: '100px'}}>
                                <Button size="sm" variant="light" onClick={() => handleMoveCategory(dm, 'UP')} disabled={dm.id === 'all'}>↑</Button>
                                <Button size="sm" variant="light" onClick={() => handleMoveCategory(dm, 'DOWN')} className="ms-1" disabled={dm.id === 'all'}>↓</Button>
                            </td>
                            <td>{dm.parent ? <Badge bg="info">Con</Badge> : <Badge bg="primary">Gốc</Badge>}</td>
                            <td>{dm.parent && <span style={{color: '#ccc', marginRight: '5px'}}>↳</span>}<b>{dm.ten}</b></td>
                            <td style={{textAlign: 'center', fontSize: '20px'}}>
                                {dm.icon ? dm.icon : <span style={{color: '#ccc', fontSize: '12px'}}>(None)</span>}
                            </td>
                            <td>
                                {dm.id !== 'all' && (
                                    <>
                                        <Button size="sm" variant="warning" className="me-1" onClick={() => handleEditDM(dm)}>Sửa</Button>
                                        <Button size="sm" variant="danger" onClick={() => handleDeleteDM(dm.id)}>Xóa</Button>
                                    </>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </Tab>
      </Tabs>

      {/* MODAL SP */}
      <Modal show={showModalSP} onHide={() => setShowModalSP(false)} size="lg">
         <Modal.Header closeButton><Modal.Title>{editingSP ? 'Sửa SP' : 'Thêm SP'}</Modal.Title></Modal.Header>
         <Modal.Body>
             <Form>
                <Form.Group className="mb-3"><Form.Label>Tên SP</Form.Label><Form.Control value={formDataSP.ten} onChange={e => setFormDataSP({...formDataSP, ten: e.target.value})} /></Form.Group>
                <div className="d-flex gap-3 mb-3">
                    <Form.Group className="flex-fill"><Form.Label>Giá</Form.Label><Form.Control value={formDataSP.gia} onChange={e => setFormDataSP({...formDataSP, gia: e.target.value})} /></Form.Group>
                    <Form.Group className="flex-fill"><Form.Label>Loại</Form.Label>
                        <Form.Select value={formDataSP.phanLoai} onChange={e => setFormDataSP({...formDataSP, phanLoai: e.target.value})}>{dsDanhMuc.map(dm => <option key={dm.id} value={dm.customId || dm.id}>{dm.parent ? `-- ${dm.ten}` : dm.ten}</option>)}</Form.Select>
                    </Form.Group>
                </div>
                <Form.Group className="mb-3"><Form.Label>Ảnh</Form.Label><Form.Control type="file" onChange={handleImageUpload} />{formDataSP.anh && <img src={formDataSP.anh} height="60" style={{marginTop:'5px'}}/>}</Form.Group>
                <div className="d-flex gap-3"><Form.Check label="Khuyến mãi" checked={formDataSP.isKhuyenMai} onChange={e => setFormDataSP({...formDataSP, isKhuyenMai: e.target.checked})} /><Form.Check label="Bán chạy" checked={formDataSP.isBanChay} onChange={e => setFormDataSP({...formDataSP, isBanChay: e.target.checked})} /><Form.Check label="Mới" checked={formDataSP.isMoi} onChange={e => setFormDataSP({...formDataSP, isMoi: e.target.checked})} /></div>
             </Form>
         </Modal.Body>
         <Modal.Footer><Button onClick={handleSaveSP}>Lưu</Button></Modal.Footer>
      </Modal>

      {/* MODAL MENU - ĐÃ XÓA MÃ */}
      <Modal show={showModalEditDM} onHide={() => setShowModalEditDM(false)}>
        <Modal.Header closeButton><Modal.Title>Sửa Danh Mục</Modal.Title></Modal.Header>
        <Modal.Body>
            <Form>
                {/* ĐÃ XÓA FORM MÃ */}
                <Form.Group className="mb-3"><Form.Label>Tên</Form.Label><Form.Control value={editFormDM.ten} onChange={e => setEditFormDM({...editFormDM, ten: e.target.value})} /></Form.Group>
                <Form.Group className="mb-3"><Form.Label>Icon</Form.Label>
                    <Form.Select value={editFormDM.icon} onChange={e => setEditFormDM({...editFormDM, icon: e.target.value})}>
                        <option value="">(None)</option>
                        {ICON_LIST.map(icon => <option key={icon} value={icon}>{icon}</option>)}
                    </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3"><Form.Label>Thuộc cha</Form.Label>
                    <Form.Select value={editFormDM.parent || ''} onChange={e => setEditFormDM({...editFormDM, parent: e.target.value})}><option value="">-- Gốc --</option>{dsDanhMuc.filter(dm => !dm.parent && dm.id !== 'all' && dm.id !== editFormDM.id).map(dm => <option key={dm.id} value={dm.customId || dm.id}>Con của: {dm.ten}</option>)}</Form.Select>
                </Form.Group>
            </Form>
        </Modal.Body>
        <Modal.Footer><Button onClick={handleSaveEditDM}>Cập nhật</Button></Modal.Footer>
      </Modal>

      <Modal show={showModalPass} onHide={() => setShowModalPass(false)}>
         <Modal.Body>
             <Form.Control className="mb-2" type="password" placeholder="Pass cũ" onChange={e => setPassForm({...passForm, oldPass: e.target.value})} />
             <Form.Control className="mb-2" type="password" placeholder="Pass mới" onChange={e => setPassForm({...passForm, newPass: e.target.value})} />
             <Form.Control type="password" placeholder="Nhập lại mới" onChange={e => setPassForm({...passForm, confirmPass: e.target.value})} />
         </Modal.Body>
         <Modal.Footer><Button onClick={handleChangePassword}>Đổi</Button></Modal.Footer>
      </Modal>
    </div>
  );
}
export default Admin;