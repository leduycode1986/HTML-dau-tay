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
  
  // --- STATE CONFIG & LOGIN ---
  const [adminConfig, setAdminConfig] = useState(() => {
      const saved = localStorage.getItem('adminConfig');
      return saved ? JSON.parse(saved) : { username: 'admin', password: 'admin123' };
  });
  useEffect(() => { localStorage.setItem('adminConfig', JSON.stringify(adminConfig)); }, [adminConfig]);
  
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginInput, setLoginInput] = useState({ username: '', password: '' });
  const [showModalPass, setShowModalPass] = useState(false);
  const [passForm, setPassForm] = useState({ oldPass: '', newPass: '', confirmPass: '' });

  // --- FORM SẢN PHẨM ---
  const [showModalSP, setShowModalSP] = useState(false);
  const [editingSP, setEditingSP] = useState(null);
  const [formDataSP, setFormDataSP] = useState({ 
      ten: '', giaGoc: '', phanTramGiam: 0, giaBan: '', 
      donVi: 'Cái', soLuong: 10, moTa: '', // moTa chứa HTML
      anh: '', phanLoai: 'thitca', 
      isKhuyenMai: false, isBanChay: false, isMoi: false 
  });

  // TỰ ĐỘNG TÍNH GIÁ BÁN
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
  function handleChangePassword() {
      if (passForm.oldPass !== adminConfig.password) return alert("Sai mật khẩu cũ!");
      if (passForm.newPass !== passForm.confirmPass) return alert("Mật khẩu mới không khớp!");
      setAdminConfig({ ...adminConfig, password: passForm.newPass });
      alert("✅ Đổi mật khẩu thành công!"); setShowModalPass(false);
  }

  const handleImageUpload = (e) => {
      const file = e.target.files[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => setFormDataSP({ ...formDataSP, anh: reader.result });
          reader.readAsDataURL(file);
      }
  };

  // --- XỬ LÝ SẢN PHẨM ---
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

  // --- MENU ---
  const [formDataDM, setFormDataDM] = useState({ ten: '', icon: '', parent: '' });
  const [showModalEditDM, setShowModalEditDM] = useState(false);
  const [editingDM, setEditingDM] = useState(null);
  const [editFormDM, setEditFormDM] = useState({ id: '', ten: '', icon: '', parent: '' });

  function handleAddDM() {
      if (!formDataDM.ten) return alert("Nhập Tên!");
      handleUpdateDS_DM('ADD', { ...formDataDM, order: dsDanhMuc.length });
      setFormDataDM({ ten: '', icon: '', parent: '' });
  }
  function handleEditDM(dm) { setEditingDM(dm); setEditFormDM(dm); setShowModalEditDM(true); }
  function handleSaveEditDM() { handleUpdateDS_DM('UPDATE', editFormDM); setShowModalEditDM(false); setEditingDM(null); }
  function handleDeleteDM(id) { if(id === 'all') return alert("Cấm xóa gốc!"); if(window.confirm("Xóa danh mục?")) handleUpdateDS_DM('DELETE', id); }

  // --- LOGIC SẮP XẾP ---
  const getSortedDanhMuc = () => {
      const sortFunc = (a, b) => (a.order || 0) - (b.order || 0);
      const roots = dsDanhMuc.filter(dm => !dm.parent).sort(sortFunc);
      const children = dsDanhMuc.filter(dm => dm.parent).sort(sortFunc);
      let result = [];
      roots.forEach(root => {
          result.push(root);
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

  const renderStatus = (status) => {
      switch(status) {
          case 'Mới đặt': return <Badge bg="primary">Mới đặt</Badge>;
          case 'Đang giao': return <Badge bg="warning" text="dark">Giao hàng 🚚</Badge>;
          case 'Hoàn thành': return <Badge bg="success">Hoàn thành ✅</Badge>;
          case 'Hủy': return <Badge bg="secondary">Đã hủy ❌</Badge>;
          default: return <Badge bg="light" text="dark">{status}</Badge>;
      }
  };

  // --- TOOLBAR SOẠN THẢO ---
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{'list': 'ordered'}, {'list': 'bullet'}],
      ['link', 'clean']
    ],
  };

  // --- UI ĐĂNG NHẬP (QUAN TRỌNG: ĐÃ KHÔI PHỤC) ---
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

      <Tabs defaultActiveKey="products" className="mb-3">
        {/* TAB 1: SẢN PHẨM */}
        <Tab eventKey="products" title="📦 Sản phẩm">
            <Button className="mb-3" onClick={() => {setEditingSP(null); setFormDataSP({ ten: '', giaGoc: '', phanTramGiam: 0, giaBan: '', donVi: 'Cái', soLuong: 10, moTa: '', anh: '', phanLoai: 'thitca', isKhuyenMai: false, isBanChay: false, isMoi: false }); setShowModalSP(true)}}>+ Thêm Sản Phẩm</Button>
            <Table striped bordered hover responsive>
                <thead><tr><th>Ảnh</th><th>Tên</th><th>Giá bán / Đơn vị</th><th>Kho</th><th>Trạng thái</th><th>Xử lý</th></tr></thead>
                <tbody>
                    {dsSanPham.map(sp => (
                        <tr key={sp.id}>
                            <td><img src={sp.anh} width="50" style={{borderRadius: '5px'}}/></td>
                            <td>
                                <b>{sp.ten}</b>
                                {/* Chỉ hiển thị 1 đoạn ngắn mô tả nếu có */}
                                {sp.moTa && <div style={{fontSize: '11px', color: '#777', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}} dangerouslySetInnerHTML={{__html: sp.moTa.replace(/<[^>]+>/g, '')}}></div>}
                            </td>
                            <td>
                                <div style={{fontWeight: 'bold', color: 'red'}}>{sp.giaBan?.toLocaleString('ja-JP')} ¥</div>
                                {sp.isKhuyenMai && <div style={{textDecoration: 'line-through', color: '#999', fontSize: '12px'}}>{sp.giaGoc?.toLocaleString('ja-JP')} ¥</div>}
                                <div style={{fontSize: '12px', color: '#555'}}>({sp.donVi})</div>
                            </td>
                            <td>{sp.soLuong}</td>
                            <td>
                                {sp.isKhuyenMai && <Badge bg="danger" className="me-1">-{sp.phanTramGiam}%</Badge>}
                                {sp.isBanChay && <Badge bg="warning" text="dark" className="me-1">Hot</Badge>}
                                {sp.isMoi && <Badge bg="success">New</Badge>}
                            </td>
                            <td><Button size="sm" variant="warning" onClick={() => handleEditSP(sp)}>Sửa</Button> <Button size="sm" variant="danger" onClick={() => handleDeleteSP(sp.id)}>Xóa</Button></td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </Tab>

        {/* TAB 2: ĐƠN HÀNG */}
        <Tab eventKey="orders" title={`📋 Đơn hàng (${dsDonHang ? dsDonHang.length : 0})`}>
            <Table striped bordered hover responsive>
                <thead style={{background: '#e3f2fd'}}><tr><th>Ngày</th><th>Khách</th><th>Chi tiết</th><th>Tổng tiền</th><th>Trạng thái</th><th>Xử lý</th></tr></thead>
                <tbody>
                    {dsDonHang && dsDonHang.map(dh => (
                        <tr key={dh.id}>
                            <td>{dh.ngayDat?.toDate ? dh.ngayDat.toDate().toLocaleString('ja-JP') : 'Vừa xong'}</td>
                            <td><b>{dh.khachHang.ten}</b><br/><small>{dh.khachHang.sdt}</small></td>
                            <td><ul style={{margin:0, paddingLeft:'15px', fontSize:'13px'}}>{dh.gioHang.map((sp,i)=><li key={i}>{sp.ten} (x{sp.soLuong})</li>)}</ul></td>
                            <td style={{color: 'red', fontWeight: 'bold'}}>{parseInt(dh.tongTien).toLocaleString('ja-JP')} ¥</td>
                            <td>{renderStatus(dh.trangThai)}</td>
                            <td>
                                <div style={{display:'flex', gap:'5px', flexWrap:'wrap'}}>
                                    <Button size="sm" variant="outline-primary" onClick={()=>handleUpdateStatusOrder(dh.id,'Đang giao')}>Giao</Button>
                                    <Button size="sm" variant="outline-success" onClick={()=>handleUpdateStatusOrder(dh.id,'Hoàn thành')}>Xong</Button>
                                    <Button size="sm" variant="outline-secondary" onClick={()=>handleUpdateStatusOrder(dh.id,'Hủy')}>Hủy</Button>
                                    <Button size="sm" variant="outline-danger" onClick={()=>handleDeleteOrder(dh.id)}>Xóa</Button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </Tab>

        {/* TAB 3: MENU */}
        <Tab eventKey="menu" title="📂 Menu Danh Mục">
            <div style={{background: '#f8f9fa', padding: '15px', borderRadius: '10px', marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap'}}>
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

      {/* MODAL SP NÂNG CẤP (CÓ SOẠN THẢO) */}
      <Modal show={showModalSP} onHide={() => setShowModalSP(false)} size="lg">
         <Modal.Header closeButton><Modal.Title>{editingSP ? 'Cập nhật' : 'Thêm mới'}</Modal.Title></Modal.Header>
         <Modal.Body>
             <Form>
                <Row className="mb-3">
                    <Col md={8}><Form.Label>Tên sản phẩm</Form.Label><Form.Control value={formDataSP.ten} onChange={e => setFormDataSP({...formDataSP, ten: e.target.value})} placeholder="Vd: Thịt bò Kobe..." /></Col>
                    <Col md={4}><Form.Label>Danh mục</Form.Label>
                        <Form.Select value={formDataSP.phanLoai} onChange={e => setFormDataSP({...formDataSP, phanLoai: e.target.value})}>{dsDanhMuc.map(dm => <option key={dm.id} value={dm.customId || dm.id}>{dm.parent ? `-- ${dm.ten}` : dm.ten}</option>)}</Form.Select>
                    </Col>
                </Row>
                
                <Row className="mb-3" style={{background: '#f8f9fa', padding: '10px', borderRadius: '5px'}}>
                    <Col md={3}><Form.Label>Giá Gốc (¥)</Form.Label><Form.Control type="number" value={formDataSP.giaGoc} onChange={e => setFormDataSP({...formDataSP, giaGoc: e.target.value})} /></Col>
                    <Col md={3}><Form.Label>% Giảm</Form.Label><Form.Control type="number" value={formDataSP.phanTramGiam} onChange={e => setFormDataSP({...formDataSP, phanTramGiam: e.target.value})} /></Col>
                    <Col md={3}><Form.Label style={{color: 'red', fontWeight: 'bold'}}>Giá Bán (¥)</Form.Label><Form.Control type="number" value={formDataSP.giaBan} readOnly style={{fontWeight: 'bold', color: 'red'}} /></Col>
                    <Col md={3}><Form.Label>Đơn vị</Form.Label><Form.Control type="text" value={formDataSP.donVi} onChange={e => setFormDataSP({...formDataSP, donVi: e.target.value})} /></Col>
                </Row>

                <Row className="mb-3">
                    <Col md={4}><Form.Label>Kho</Form.Label><Form.Control type="number" value={formDataSP.soLuong} onChange={e => setFormDataSP({...formDataSP, soLuong: e.target.value})} /></Col>
                    <Col md={8}><Form.Label>Ảnh</Form.Label><div className="d-flex"><Form.Control type="file" onChange={handleImageUpload} />{formDataSP.anh && <img src={formDataSP.anh} height="38" className="ms-2" />}</div></Col>
                </Row>

                {/* --- TRÌNH SOẠN THẢO XỊN --- */}
                <Form.Group className="mb-3">
                    <Form.Label>Mô tả chi tiết (Chuẩn SEO)</Form.Label>
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
                    <Form.Check label="🔥 Đang Khuyến Mãi" checked={formDataSP.isKhuyenMai} onChange={e => setFormDataSP({...formDataSP, isKhuyenMai: e.target.checked})} />
                    <Form.Check label="💎 Sản Phẩm Bán Chạy" checked={formDataSP.isBanChay} onChange={e => setFormDataSP({...formDataSP, isBanChay: e.target.checked})} />
                    <Form.Check label="🆕 Sản Phẩm Mới" checked={formDataSP.isMoi} onChange={e => setFormDataSP({...formDataSP, isMoi: e.target.checked})} />
                </div>
             </Form>
         </Modal.Body>
         <Modal.Footer><Button onClick={handleSaveSP}>Lưu sản phẩm</Button></Modal.Footer>
      </Modal>

      {/* MODAL SỬA MENU */}
      <Modal show={showModalEditDM} onHide={() => setShowModalEditDM(false)}>
        <Modal.Header closeButton><Modal.Title>Sửa Danh Mục</Modal.Title></Modal.Header>
        <Modal.Body>
            <Form>
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

      {/* MODAL ĐỔI PASS */}
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