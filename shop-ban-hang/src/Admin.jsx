import React, { useState, useEffect } from 'react';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import Badge from 'react-bootstrap/Badge';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import { Link } from 'react-router-dom';

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
  
  // --- STATE ---
  const [adminConfig, setAdminConfig] = useState(() => {
      const saved = localStorage.getItem('adminConfig');
      return saved ? JSON.parse(saved) : { username: 'admin', password: 'admin123' };
  });
  useEffect(() => { localStorage.setItem('adminConfig', JSON.stringify(adminConfig)); }, [adminConfig]);
  
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginInput, setLoginInput] = useState({ username: '', password: '' });
  const [showModalPass, setShowModalPass] = useState(false);
  const [passForm, setPassForm] = useState({ oldPass: '', newPass: '', confirmPass: '' });

  // --- FORM SẢN PHẨM MỚI (ĐẦY ĐỦ THÔNG TIN) ---
  const [showModalSP, setShowModalSP] = useState(false);
  const [editingSP, setEditingSP] = useState(null);
  const [formDataSP, setFormDataSP] = useState({ 
      ten: '', 
      giaGoc: '',       // Giá chưa giảm
      phanTramGiam: 0,  // % Giảm
      giaBan: '',       // Giá thực tế (Tự tính)
      donVi: 'Cái',     // Đơn vị (Kg, Hộp...)
      soLuong: 10,      // Tồn kho
      moTa: '',         // Nội dung chi tiết
      anh: '', 
      phanLoai: 'thitca', 
      isKhuyenMai: false, isBanChay: false, isMoi: false 
  });

  // TỰ ĐỘNG TÍNH GIÁ BÁN KHI NHẬP GIÁ GỐC HOẶC % GIẢM
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

  function handleSaveSP() {
      if (!formDataSP.ten || !formDataSP.giaBan) return alert("Thiếu tên hoặc giá bán!");
      
      const productData = {
          ...formDataSP,
          // Đảm bảo lưu số là số
          giaGoc: parseInt(formDataSP.giaGoc),
          giaBan: parseInt(formDataSP.giaBan),
          phanTramGiam: parseInt(formDataSP.phanTramGiam),
          soLuong: parseInt(formDataSP.soLuong),
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

  // Sắp xếp danh mục
  const sortedDanhMuc = (() => {
      const sortFunc = (a, b) => (a.order || 0) - (b.order || 0);
      const roots = dsDanhMuc.filter(dm => !dm.parent).sort(sortFunc);
      const children = dsDanhMuc.filter(dm => dm.parent).sort(sortFunc);
      let result = [];
      roots.forEach(root => { result.push(root); result.push(...children.filter(child => child.parent === (root.customId || root.id))); });
      return result;
  })();

  const handleMoveCategory = (item, direction) => { /* Giữ nguyên logic cũ */ };

  const renderStatus = (status) => {
      switch(status) {
          case 'Mới đặt': return <Badge bg="primary">Mới đặt</Badge>;
          case 'Đang giao': return <Badge bg="warning" text="dark">Giao hàng 🚚</Badge>;
          case 'Hoàn thành': return <Badge bg="success">Hoàn thành ✅</Badge>;
          case 'Hủy': return <Badge bg="secondary">Đã hủy ❌</Badge>;
          default: return <Badge bg="light" text="dark">{status}</Badge>;
      }
  };

  if (!isLoggedIn) return ( /* Giao diện login giữ nguyên */ <div style={{height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#e8f5e9'}}><Button onClick={() => setIsLoggedIn(true)}>Đăng nhập nhanh (Test)</Button></div> );

  return (
    <div style={{ padding: '20px', backgroundColor: '#fff', minHeight: '100vh' }}>
      <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '2px solid #008848', paddingBottom: '10px'}}>
          <h2 style={{color: '#008848'}}>QUẢN TRỊ HỆ THỐNG</h2>
          <div><Link to="/"><Button variant="outline-danger">Thoát</Button></Link></div>
      </div>

      <Tabs defaultActiveKey="products" className="mb-3">
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
                                {sp.moTa && <div style={{fontSize: '11px', color: '#777', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{sp.moTa}</div>}
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
        <Tab eventKey="orders" title="📋 Đơn hàng">
             {/* Giữ nguyên tab đơn hàng */}
             <div className="p-3 text-center text-muted">Vui lòng xem code cũ hoặc thêm lại tab Đơn hàng vào đây</div>
        </Tab>
        <Tab eventKey="menu" title="📂 Danh Mục">
            {/* Giữ nguyên tab Menu */}
             <div className="p-3 text-center text-muted">Vui lòng xem code cũ hoặc thêm lại tab Menu vào đây</div>
        </Tab>
      </Tabs>

      {/* MODAL SP NÂNG CẤP */}
      <Modal show={showModalSP} onHide={() => setShowModalSP(false)} size="lg">
         <Modal.Header closeButton><Modal.Title>{editingSP ? 'Cập nhật' : 'Thêm mới'}</Modal.Title></Modal.Header>
         <Modal.Body>
             <Form>
                <Row className="mb-3">
                    <Col md={8}><Form.Label>Tên sản phẩm</Form.Label><Form.Control value={formDataSP.ten} onChange={e => setFormDataSP({...formDataSP, ten: e.target.value})} /></Col>
                    <Col md={4}><Form.Label>Danh mục</Form.Label>
                        <Form.Select value={formDataSP.phanLoai} onChange={e => setFormDataSP({...formDataSP, phanLoai: e.target.value})}>{dsDanhMuc.map(dm => <option key={dm.id} value={dm.customId || dm.id}>{dm.parent ? `-- ${dm.ten}` : dm.ten}</option>)}</Form.Select>
                    </Col>
                </Row>
                
                {/* HÀNG GIÁ VÀ ĐƠN VỊ */}
                <Row className="mb-3" style={{background: '#f8f9fa', padding: '10px', borderRadius: '5px'}}>
                    <Col md={3}>
                        <Form.Label>Giá Gốc (¥)</Form.Label>
                        <Form.Control type="number" value={formDataSP.giaGoc} onChange={e => setFormDataSP({...formDataSP, giaGoc: e.target.value})} />
                    </Col>
                    <Col md={3}>
                        <Form.Label>% Giảm</Form.Label>
                        <Form.Control type="number" value={formDataSP.phanTramGiam} onChange={e => setFormDataSP({...formDataSP, phanTramGiam: e.target.value})} />
                    </Col>
                    <Col md={3}>
                        <Form.Label style={{color: 'red', fontWeight: 'bold'}}>Giá Bán (¥)</Form.Label>
                        <Form.Control type="number" value={formDataSP.giaBan} readOnly style={{fontWeight: 'bold', color: 'red'}} />
                    </Col>
                    <Col md={3}>
                        <Form.Label>Đơn vị (Hộp, Kg..)</Form.Label>
                        <Form.Control type="text" value={formDataSP.donVi} onChange={e => setFormDataSP({...formDataSP, donVi: e.target.value})} />
                    </Col>
                </Row>

                <Row className="mb-3">
                    <Col md={4}>
                        <Form.Label>Số lượng kho</Form.Label>
                        <Form.Control type="number" value={formDataSP.soLuong} onChange={e => setFormDataSP({...formDataSP, soLuong: e.target.value})} />
                    </Col>
                    <Col md={8}>
                        <Form.Label>Link Ảnh</Form.Label>
                        <div className="d-flex"><Form.Control type="file" onChange={handleImageUpload} />{formDataSP.anh && <img src={formDataSP.anh} height="38" className="ms-2" />}</div>
                    </Col>
                </Row>

                <Form.Group className="mb-3">
                    <Form.Label>Mô tả chi tiết sản phẩm</Form.Label>
                    <Form.Control as="textarea" rows={3} value={formDataSP.moTa} onChange={e => setFormDataSP({...formDataSP, moTa: e.target.value})} placeholder="Thành phần, nguồn gốc, hướng dẫn sử dụng..." />
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
    </div>
  );
}
export default Admin;