import React, { useState, useEffect } from 'react';
import { Table, Button, Form, Modal, Badge, Tab, Tabs, Row, Col, Container, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { doc, getDoc, setDoc } from 'firebase/firestore'; 
import { db } from './firebase'; 

const ICON_LIST = ['🏠', '🥩', '🥦', '🍎', '🥛', '🥤', '🍞', '🥫', '🧼', '🧸', '📦', '🐟', '🍗', '🍜', '🍚', '🍦', '🍪', '🍫', '👕', '👠', '💄', '💊', '⚡', '🎉', '⚽', '🔥', '❄️', '🐶', '🐱'];
const NO_IMAGE = "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg";

function Admin({ dsSanPham, handleUpdateDS_SP, dsDanhMuc, handleUpdateDS_DM, dsDonHang, handleUpdateStatusOrder, handleDeleteOrder }) {
  const [adminConfig, setAdminConfig] = useState(() => JSON.parse(localStorage.getItem('adminConfig') || '{"username":"admin","password":"123"}'));
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginInput, setLoginInput] = useState({ username: '', password: '' });
  
  const [showModalSP, setShowModalSP] = useState(false);
  const [editingSP, setEditingSP] = useState(null);
  const [formDataSP, setFormDataSP] = useState({ ten: '', giaGoc: '', phanTramGiam: 0, giaBan: '', donVi: 'Cái', soLuong: 10, moTa: '', anh: '', phanLoai: '', isMoi: false, isKhuyenMai: false, isBanChay: false });
  
  const [showModalDM, setShowModalDM] = useState(false);
  const [editingDM, setEditingDM] = useState(null);
  const [formDataDM, setFormDataDM] = useState({ ten: '', icon: '', parent: '', order: '' });
  
  const [showModalPass, setShowModalPass] = useState(false);
  const [passForm, setPassForm] = useState({ oldPass: '', newPass: '' });
  
  // STATE CẤU HÌNH SHOP (Đã thêm các trường mới)
  const [shopConfig, setShopConfig] = useState({ 
    tenShop: '', slogan: '', logo: '', 
    diaChi: '', sdt: '', linkFacebook: '', copyright: '@2024 Thực phẩm Mai Vàng' 
  });
  
  const [showModalOrder, setShowModalOrder] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const thongKe = (() => {
    const today = new Date().toLocaleDateString('vi-VN');
    const thisMonth = new Date().getMonth() + 1;
    const thisYear = new Date().getFullYear();
    let doanhThuNgay = 0, doanhThuThang = 0, doanhThuNam = 0, tongDon = dsDonHang.length;
    dsDonHang.forEach(dh => {
      if (!dh.ngayDat || !dh.ngayDat.toDate) return;
      const date = dh.ngayDat.toDate();
      const tien = dh.tongTien || 0;
      if (date.toLocaleDateString('vi-VN') === today) doanhThuNgay += tien;
      if (date.getMonth() + 1 === thisMonth && date.getFullYear() === thisYear) doanhThuThang += tien;
      if (date.getFullYear() === thisYear) doanhThuNam += tien;
    });
    return { doanhThuNgay, doanhThuThang, doanhThuNam, tongDon };
  })();

  const luuCauHinhTrucTiep = async () => { try { await setDoc(doc(db, "cauHinh", "thongTinChung"), shopConfig); alert("✅ Đã lưu cấu hình thành công!"); } catch (error) { alert("❌ Lỗi: " + error.message); } };
  const handleFastImageUpload = (e, type) => { const file = e.target.files[0]; if (!file) return; const reader = new FileReader(); reader.onloadend = () => { if (type === 'LOGO') setShopConfig({ ...shopConfig, logo: reader.result }); else if (type === 'PRODUCT') setFormDataSP({ ...formDataSP, anh: reader.result }); }; reader.readAsDataURL(file); };
  useEffect(() => { if (isLoggedIn) { const fetch = async () => { const d = await getDoc(doc(db, "cauHinh", "thongTinChung")); if (d.exists()) setShopConfig(d.data()); }; fetch(); } }, [isLoggedIn]);
  const sortedDanhMuc = (() => { const s = (a, b) => parseFloat(a.order || 0) - parseFloat(b.order || 0); const list = dsDanhMuc || []; const roots = list.filter(d => !d.parent).sort(s); const children = list.filter(d => d.parent).sort(s); let res = []; roots.forEach(root => { res.push(root); res.push(...children.filter(c => c.parent === (root.customId || root.id))); }); return res; })();
  useEffect(() => { const goc = parseInt(formDataSP.giaGoc) || 0; const giam = parseInt(formDataSP.phanTramGiam) || 0; setFormDataSP(p => ({ ...p, giaBan: goc > 0 ? Math.floor(goc * (1 - giam / 100)) : '' })); }, [formDataSP.giaGoc, formDataSP.phanTramGiam]);

  if (!isLoggedIn) return (
    <div className="admin-login-wrapper">
      <div className="admin-login-card shadow">
        <h3 className="fw-bold text-success mb-4 text-center">ADMIN LOGIN</h3>
        <Form onSubmit={(e) => { e.preventDefault(); if (loginInput.username === adminConfig.username && loginInput.password === adminConfig.password) setIsLoggedIn(true); else alert("Sai!"); }}>
          <Form.Control className="mb-3 p-3" placeholder="User" onChange={e => setLoginInput({...loginInput, username: e.target.value})} />
          <Form.Control type="password" className="mb-4 p-3" placeholder="Pass" onChange={e => setLoginInput({...loginInput, password: e.target.value})} />
          <Button variant="success" type="submit" className="w-100 py-3 fw-bold rounded-pill">ĐĂNG NHẬP</Button>
        </Form>
      </div>
    </div>
  );

  return (
    <div className="admin-main-container">
      <div className="admin-navbar">
        <h4 className="m-0 fw-bold">QUẢN TRỊ MAIVANG SHOP</h4>
        <div className="d-flex gap-2">
          <Button variant="outline-light" size="sm" onClick={() => setShowModalPass(true)}>ĐỔI PASS</Button>
          <Link to="/"><Button variant="danger" size="sm">THOÁT</Button></Link>
        </div>
      </div>
      
      <Container fluid className="p-3 p-md-4 admin-content-container">
        <Row className="mb-3 g-2">
          <Col xs={6} md={3}><div className="stats-box bg-primary shadow-sm"><h5>Hôm nay</h5><h3>{thongKe.doanhThuNgay.toLocaleString()} ¥</h3></div></Col>
          <Col xs={6} md={3}><div className="stats-box bg-success shadow-sm"><h5>Tháng này</h5><h3>{thongKe.doanhThuThang.toLocaleString()} ¥</h3></div></Col>
          <Col xs={6} md={3}><div className="stats-box bg-warning text-dark shadow-sm"><h5>Cả năm</h5><h3>{thongKe.doanhThuNam.toLocaleString()} ¥</h3></div></Col>
          <Col xs={6} md={3}><div className="stats-box bg-info shadow-sm"><h5>Tổng đơn</h5><h3>{thongKe.tongDon} đơn</h3></div></Col>
        </Row>

        <Tabs defaultActiveKey="config" className="mb-4 bg-white p-2 rounded shadow-sm border" style={{overflowX: 'auto', flexWrap: 'nowrap'}}>
          <Tab eventKey="config" title="⚙️ CẤU HÌNH & LIÊN HỆ">
            <div className="bg-white p-3 rounded">
              <Row>
                <Col md={4} className="mb-3 text-center">
                  <Form.Group><Form.Label className="fw-bold">Logo Shop</Form.Label><div className="border p-2 rounded mb-2 d-flex justify-content-center align-items-center" style={{height:'150px', background:'#f8f9fa'}}>{shopConfig.logo ? <img src={shopConfig.logo} style={{maxHeight:'100%', maxWidth:'100%'}} alt="Logo" /> : <span className="text-muted">Chưa có logo</span>}</div><Form.Control type="file" onChange={(e) => handleFastImageUpload(e, 'LOGO')} /></Form.Group>
                </Col>
                <Col md={8}>
                  <Row>
                    <Col md={6}><Form.Group className="mb-3"><Form.Label className="fw-bold">Tên Shop</Form.Label><Form.Control value={shopConfig.tenShop} onChange={e => setShopConfig({...shopConfig, tenShop: e.target.value})} /></Form.Group></Col>
                    <Col md={6}><Form.Group className="mb-3"><Form.Label className="fw-bold">Slogan</Form.Label><Form.Control value={shopConfig.slogan} onChange={e => setShopConfig({...shopConfig, slogan: e.target.value})} /></Form.Group></Col>
                    
                    {/* --- CÁC TRƯỜNG MỚI THÊM --- */}
                    <Col md={12}><Form.Group className="mb-3"><Form.Label className="fw-bold">Địa chỉ Shop (Hiển thị ở Footer)</Form.Label><Form.Control as="textarea" rows={2} value={shopConfig.diaChi} onChange={e => setShopConfig({...shopConfig, diaChi: e.target.value})} placeholder="VD: 123 Đường ABC, Quận 1, TP.HCM" /></Form.Group></Col>
                    <Col md={6}><Form.Group className="mb-3"><Form.Label className="fw-bold">Số Hotline / Zalo</Form.Label><Form.Control value={shopConfig.sdt} onChange={e => setShopConfig({...shopConfig, sdt: e.target.value})} placeholder="VD: 0909123456" /></Form.Group></Col>
                    <Col md={6}> <Form.Group className="mb-3"><Form.Label className="fw-bold">Tỷ lệ tích điểm (VNĐ đổi 1 điểm)</Form.Label><Form.Control type="number" value={shopConfig.tyLeDiem} onChange={e => setShopConfig({...shopConfig, tyLeDiem: e.target.value})} placeholder="VD: 1000" /><Form.Text className="text-muted">Ví dụ nhập 1000: Khách mua 100.000đ được 100 điểm.</Form.Text></Form.Group></Col>
                    <Col md={6}><Form.Group className="mb-3"><Form.Label className="fw-bold">Link Facebook / Messenger</Form.Label><Form.Control value={shopConfig.linkFacebook} onChange={e => setShopConfig({...shopConfig, linkFacebook: e.target.value})} placeholder="VD: https://m.me/shopmaivang" /></Form.Group></Col>
                    <Col md={12}><Form.Group className="mb-3"><Form.Label className="fw-bold">Dòng bản quyền (Copyright)</Form.Label><Form.Control value={shopConfig.copyright} onChange={e => setShopConfig({...shopConfig, copyright: e.target.value})} /></Form.Group></Col>
                  </Row>
                  <Button variant="success" className="w-100 fw-bold py-2 mt-2" onClick={luuCauHinhTrucTiep}>💾 LƯU CẤU HÌNH</Button>
                </Col>
              </Row>
            </div>
          </Tab>
          
          <Tab eventKey="products" title="📦 SẢN PHẨM">
            <Button variant="primary" className="my-3 fw-bold w-100 w-md-auto" onClick={() => { setEditingSP(null); setFormDataSP({ ten: '', giaGoc: '', phanTramGiam: 0, giaBan: '', donVi: 'Cái', soLuong: 10, moTa: '', anh: '', phanLoai: '', isMoi: false, isKhuyenMai: false, isBanChay: false }); setShowModalSP(true); }}>+ THÊM SP</Button>
            <div className="table-responsive">
              <Table hover className="bg-white border align-middle text-nowrap">
                <thead><tr><th>Ảnh</th><th>Tên SP</th><th>Danh mục</th><th>Giá bán</th><th>Thao tác</th></tr></thead>
                <tbody>{dsSanPham.map(sp => {
                  const tenDM = dsDanhMuc.find(d => d.id === sp.phanLoai)?.ten || '---';
                  return (<tr key={sp.id}><td><img src={sp.anh || NO_IMAGE} width="40" height="40" style={{objectFit:'cover'}} alt=""/></td><td><b>{sp.ten}</b></td><td><Badge bg="info">{tenDM}</Badge></td><td className="text-danger fw-bold">{sp.giaBan?.toLocaleString()}</td><td><Button size="sm" variant="warning" className="me-1" onClick={() => { setEditingSP(sp); setFormDataSP(sp); setShowModalSP(true); }}>Sửa</Button><Button size="sm" variant="danger" onClick={() => { if(confirm('Xóa?')) handleUpdateDS_SP('DELETE', sp.id) }}>Xóa</Button></td></tr>);
                })}</tbody>
              </Table>
            </div>
          </Tab>

          <Tab eventKey="menu" title="📂 DANH MỤC">
            <Button variant="success" className="my-3 fw-bold w-100 w-md-auto" onClick={() => { setEditingDM(null); setFormDataDM({ten:'', icon:'', parent:'', order:''}); setShowModalDM(true); }}>+ THÊM MENU</Button>
            <div className="table-responsive">
              <Table bordered hover className="align-middle bg-white text-nowrap">
                <thead><tr><th>TT</th><th>Tên</th><th>Icon</th><th>Thao tác</th></tr></thead>
                <tbody>{sortedDanhMuc.map(dm => (<tr key={dm.id}><td className="text-center">{dm.order}</td><td>{dm.parent ? '↳ ' : ''}{dm.ten}</td><td className="text-center">{dm.icon}</td><td><Button size="sm" variant="outline-warning" className="me-1" onClick={() => { setEditingDM(dm); setFormDataDM(dm); setShowModalDM(true); }}>Sửa</Button><Button size="sm" variant="outline-danger" onClick={() => handleUpdateDS_DM('DELETE', dm.id)}>Xóa</Button></td></tr>))}</tbody>
              </Table>
            </div>
          </Tab>

          <Tab eventKey="orders" title={`📋 ĐƠN HÀNG (${dsDonHang.length})`}>
            <div className="table-responsive mt-3">
              <Table hover className="bg-white border text-nowrap">
                <thead><tr><th>Ngày</th><th>Khách</th><th>Tổng</th><th>TT</th><th>Thao tác</th></tr></thead>
                <tbody>{dsDonHang.sort((a,b)=>b.ngayDat - a.ngayDat).map(dh => (
                  <tr key={dh.id}>
                    <td>{dh.ngayDat?.toDate ? dh.ngayDat.toDate().toLocaleString('vi-VN') : 'Mới'}</td>
                    <td><b>{dh.khachHang?.ten}</b></td>
                    <td className="text-danger fw-bold">{dh.tongTien?.toLocaleString()}</td>
                    <td><Badge bg={dh.trangThai === 'Hoàn thành' ? 'success' : 'warning'}>{dh.trangThai}</Badge></td>
                    <td><Button size="sm" variant="info" className="me-1 text-white" onClick={() => { setSelectedOrder(dh); setShowModalOrder(true); }}>Xem</Button><Button size="sm" variant="success" className="me-1" onClick={() => handleUpdateStatusOrder(dh.id, 'Hoàn thành')}>✔</Button><Button size="sm" variant="danger" onClick={() => handleDeleteOrder(dh.id)}>✘</Button></td>
                  </tr>
                ))}</tbody>
              </Table>
            </div>
          </Tab>
        </Tabs>
      </Container>

      <Modal show={showModalOrder} onHide={() => setShowModalOrder(false)} size="lg" centered>
        <Modal.Header closeButton className="bg-success text-white"><Modal.Title className="fw-bold"><i className="fa-solid fa-file-invoice me-2"></i>CHI TIẾT ĐƠN HÀNG</Modal.Title></Modal.Header>
        <Modal.Body className="bg-light">
          {selectedOrder && (
            <div className="p-2"><Row className="mb-4"><Col md={6}><Card className="h-100 shadow-sm border-0"><Card.Header className="bg-white fw-bold text-success border-bottom"><i className="fa-solid fa-user me-2"></i>THÔNG TIN KHÁCH HÀNG</Card.Header><Card.Body><p className="mb-2"><strong>Họ tên:</strong> {selectedOrder.khachHang?.ten}</p><p className="mb-2"><strong>SĐT:</strong> <span className="text-primary fw-bold">{selectedOrder.khachHang?.sdt}</span></p><p className="mb-2"><strong>Địa chỉ:</strong> {selectedOrder.khachHang?.diachi}</p>{selectedOrder.khachHang?.ghiChu && (<div className="alert alert-warning p-2 mt-2 small"><i className="fa-solid fa-note-sticky me-1"></i> <strong>Ghi chú:</strong> {selectedOrder.khachHang.ghiChu}</div>)}</Card.Body></Card></Col><Col md={6} className="mt-3 mt-md-0"><Card className="h-100 shadow-sm border-0"><Card.Header className="bg-white fw-bold text-success border-bottom"><i className="fa-solid fa-circle-info me-2"></i>THÔNG TIN ĐƠN</Card.Header><Card.Body><p className="mb-2"><strong>Mã đơn:</strong> <span className="text-muted small">#{selectedOrder.id}</span></p><p className="mb-2"><strong>Ngày đặt:</strong> {selectedOrder.ngayDat?.toDate ? selectedOrder.ngayDat.toDate().toLocaleString('vi-VN') : 'Vừa xong'}</p><p className="mb-0"><strong>Trạng thái:</strong> <Badge bg={selectedOrder.trangThai === 'Hoàn thành' ? 'success' : 'warning'}>{selectedOrder.trangThai}</Badge></p></Card.Body></Card></Col></Row><Card className="shadow-sm border-0"><Card.Header className="bg-white fw-bold text-dark border-bottom"><i className="fa-solid fa-list me-2"></i>DANH SÁCH SẢN PHẨM</Card.Header><div className="table-responsive"><Table className="align-middle mb-0" hover><thead className="bg-light"><tr><th style={{width: '60px'}}>Ảnh</th><th>Tên sản phẩm</th><th className="text-center">SL</th><th className="text-end">Đơn giá</th><th className="text-end">Thành tiền</th></tr></thead><tbody>{selectedOrder.gioHang?.map((item, idx) => (<tr key={idx}><td><img src={item.anh || NO_IMAGE} width="40" height="40" className="rounded border" style={{objectFit:'cover'}} alt=""/></td><td className="fw-bold text-secondary">{item.ten}</td><td className="text-center fw-bold">{item.soLuong}</td><td className="text-end text-muted">{item.giaBan?.toLocaleString()}</td><td className="text-end fw-bold text-dark">{(item.soLuong * item.giaBan).toLocaleString()}</td></tr>))}</tbody><tfoot className="bg-light"><tr><td colSpan="4" className="text-end fw-bold text-uppercase pt-3">Tổng thanh toán:</td><td className="text-end text-danger fw-bold fs-5 pt-3">{selectedOrder.tongTien?.toLocaleString()} ¥</td></tr></tfoot></Table></div></Card></div>
          )}
        </Modal.Body>
        <Modal.Footer><Button variant="secondary" onClick={() => setShowModalOrder(false)}>Đóng</Button><Button variant="success" onClick={() => { handleUpdateStatusOrder(selectedOrder.id, 'Hoàn thành'); setShowModalOrder(false); }}>✔ Xác nhận Hoàn thành</Button></Modal.Footer>
      </Modal>

      <Modal show={showModalSP} onHide={() => setShowModalSP(false)} size="lg" centered><Modal.Header closeButton><Modal.Title className="fw-bold text-success">CHI TIẾT SẢN PHẨM</Modal.Title></Modal.Header><Modal.Body><Form><Row><Col md={8}><Form.Group className="mb-3"><Form.Label>Tên SP</Form.Label><Form.Control value={formDataSP.ten} onChange={e=>setFormDataSP({...formDataSP, ten: e.target.value})} /></Form.Group><Form.Group className="mb-3"><Form.Label className="fw-bold text-primary">Danh Mục</Form.Label><Form.Select value={formDataSP.phanLoai} onChange={e => setFormDataSP({...formDataSP, phanLoai: e.target.value})}><option value="">-- Chọn --</option>{sortedDanhMuc.map(dm => (<option key={dm.id} value={dm.id}>{dm.parent ? ' -- ' : ''}{dm.ten}</option>))}</Form.Select></Form.Group><Row><Col xs={6}><Form.Group className="mb-3"><Form.Label>Giá Gốc</Form.Label><Form.Control type="number" value={formDataSP.giaGoc} onChange={e=>setFormDataSP({...formDataSP, giaGoc: e.target.value})} /></Form.Group></Col><Col xs={6}><Form.Group className="mb-3"><Form.Label>% Giảm</Form.Label><Form.Control type="number" value={formDataSP.phanTramGiam} onChange={e=>setFormDataSP({...formDataSP, phanTramGiam: e.target.value})} /></Form.Group></Col></Row><Form.Group className="mb-3"><Form.Label className="text-danger">Giá Bán</Form.Label><Form.Control value={formDataSP.giaBan} readOnly className="bg-light fw-bold text-danger" /></Form.Group><div className="bg-light p-2 rounded mb-3 d-flex gap-3 border"><Form.Check type="switch" label="MỚI" checked={formDataSP.isMoi} onChange={e=>setFormDataSP({...formDataSP, isMoi: e.target.checked})} /><Form.Check type="switch" label="HOT" checked={formDataSP.isBanChay} onChange={e=>setFormDataSP({...formDataSP, isBanChay: e.target.checked})} /><Form.Check type="switch" label="SALE" checked={formDataSP.isKhuyenMai} onChange={e=>setFormDataSP({...formDataSP, isKhuyenMai: e.target.checked})} /></div></Col><Col md={4}><Form.Group className="mb-3"><Form.Label className="fw-bold">Ảnh</Form.Label><Form.Control type="file" onChange={(e) => handleFastImageUpload(e, 'PRODUCT')} /><div className="mt-2 border p-2 text-center bg-white rounded"><img src={formDataSP.anh || NO_IMAGE} style={{maxHeight:'160px', maxWidth:'100%'}} alt=""/></div></Form.Group></Col></Row><Form.Group className="mb-3"><Form.Label>Mô tả</Form.Label><ReactQuill theme="snow" value={formDataSP.moTa} onChange={v=>setFormDataSP({...formDataSP, moTa: v})}/></Form.Group><Button variant="success" className="w-100 py-3 fw-bold" onClick={() => { handleUpdateDS_SP(editingSP ? 'UPDATE' : 'ADD', formDataSP); setShowModalSP(false); }}>LƯU DỮ LIỆU</Button></Form></Modal.Body></Modal>
      <Modal show={showModalDM} onHide={() => setShowModalDM(false)} centered><Modal.Header closeButton><Modal.Title className="fw-bold text-success">MENU</Modal.Title></Modal.Header><Modal.Body className="p-4"><Form.Group className="mb-3"><Form.Label className="fw-bold small">TÊN MENU</Form.Label><Form.Control value={formDataDM.ten} onChange={e => setFormDataDM({...formDataDM, ten: e.target.value})} /></Form.Group><Row className="mb-3"><Col><Form.Label className="fw-bold small">THỨ TỰ</Form.Label><Form.Control value={formDataDM.order} onChange={e => setFormDataDM({...formDataDM, order: e.target.value})} /></Col><Col><Form.Label className="fw-bold small">ICON</Form.Label><Form.Select value={formDataDM.icon} onChange={e => setFormDataDM({...formDataDM, icon: e.target.value})}><option value="">None</option>{ICON_LIST.map(i => <option key={i} value={i}>{i}</option>)}</Form.Select></Col></Row>{!editingDM && <Form.Group className="mb-4"><Form.Label className="fw-bold small">DANH MỤC CHA</Form.Label><Form.Select value={formDataDM.parent} onChange={e => setFormDataDM({...formDataDM, parent: e.target.value})}><option value="">Gốc</option>{dsDanhMuc.filter(d => !d.parent).map(d => <option key={d.id} value={d.customId || d.id}>{d.ten}</option>)}</Form.Select></Form.Group>}<Button variant="success" className="w-100 py-3 fw-bold" onClick={() => { handleUpdateDS_DM(editingDM ? 'UPDATE' : 'ADD', formDataDM); setShowModalDM(false); }}>LƯU MENU</Button></Modal.Body></Modal>
      <Modal show={showModalPass} onHide={() => setShowModalPass(false)} centered><Modal.Header closeButton><Modal.Title>ĐỔI MẬT KHẨU</Modal.Title></Modal.Header><Modal.Body className="p-4"><Form.Group className="mb-3"><Form.Label>Pass cũ</Form.Label><Form.Control type="password" onChange={e=>setPassForm({...passForm,oldPass:e.target.value})}/></Form.Group><Form.Group className="mb-3"><Form.Label>Pass mới</Form.Label><Form.Control type="password" onChange={e=>setPassForm({...passForm,newPass:e.target.value})}/></Form.Group><Button onClick={()=>{if(passForm.oldPass===adminConfig.password){localStorage.setItem('adminConfig',JSON.stringify({...adminConfig,password:passForm.newPass}));alert('OK');setShowModalPass(false);}else alert('Sai!');}}>LƯU</Button></Modal.Body></Modal>
    </div>
  );
}
export default Admin;