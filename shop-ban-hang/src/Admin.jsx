import React, { useState, useEffect } from 'react';
import { Table, Button, Form, Modal, Badge, Tab, Tabs, Row, Col, Container, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { doc, getDoc, setDoc, collection, onSnapshot, deleteDoc, updateDoc, addDoc } from 'firebase/firestore'; 
import { db } from './firebase'; 

// --- ĐÃ CẬP NHẬT: DANH SÁCH ICON ĐẦY ĐỦ (CŨ + MỚI) ---
const ICON_LIST = [
  // 1. Thực phẩm tươi sống (Thịt, Cá, Hải sản)
  '🥩', '🍗', '🍖', '🐟', '🦐', '🦑', '🦀',
  
  // 2. Rau, Củ, Trái cây
  '🥦', '🥬', '🥒', '🥕', '🌽', '🍅', '🍆', '🥔',
  '🍎', '🍌', '🍇', '🍊', '🍓', '🍉', '🥥',
  
  // 3. Gạo, Bột, Đồ khô, Bánh mì
  '🍚', '🌾', '🍞', '🥖', '🥨', '🥜', '🌰',
  
  // 4. Gia vị, Dầu ăn
  '🧂', '🍶', '🌶️', '🧄', '🧅', '🍋',
  
  // 5. Mì, Miến, Cháo, Phở, Chế biến sẵn
  '🍜', '🍝', '🍲', '🥘', '🌭', '🥓', '🍳', '🥫', '🍱',
  
  // 6. Sữa, Kem, Sữa chua (Cũ + Mới: Hộp sữa)
  '🥛', '🍼', '🧀', '🍦', '🍧', '🍨', '🥣', '🧃',
  
  // 7. Đồ uống, Bia, Giải khát (Mới)
  '🍺', '🍻', '🍷', '🥤', '☕', '🍵',
  
  // 8. Bánh kẹo, Ăn vặt (Mới)
  '🍬', '🍭', '🍫', '🍪', '🍰', '🍿',
  
  // 9. Đồ gia dụng, Vệ sinh nhà cửa (Mới)
  '🏠', '🧺', '🧹', '🧽', '🧼', '🪣', '🛋️', '🛏️', '🚪',
  
  // 10. Chăm sóc cá nhân (Mới)
  '🧴', '🪥', '🛁', '💄', '💍', 
  
  // 11. Khác (Đông lạnh, Sale, Hot...)
  '❄️', '🧊', '📦', '🔖', '⚡', '🔥', '🎉', '🎁'
];
// -----------------------------------------------------

const NO_IMAGE = "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg";

function Admin({ dsSanPham, handleUpdateDS_SP, dsDanhMuc, handleUpdateDS_DM, dsDonHang, handleUpdateStatusOrder, handleDeleteOrder }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginInput, setLoginInput] = useState({ username: '', password: '' });
  const [adminConfig, setAdminConfig] = useState(() => JSON.parse(localStorage.getItem('adminConfig') || '{"username":"admin","password":"123"}'));

  const [dsBanner, setDsBanner] = useState([]);
  const [dsCoupon, setDsCoupon] = useState([]);
  const [dsShip, setDsShip] = useState([]); 
  const [dsUser, setDsUser] = useState([]); 
  const [dsReview, setDsReview] = useState([]); 

  const [showModalSP, setShowModalSP] = useState(false);
  const [editingSP, setEditingSP] = useState(null);
  const [formDataSP, setFormDataSP] = useState({ ten: '', giaGoc: '', phanTramGiam: 0, giaBan: '', donVi: 'Cái', soLuong: 10, moTa: '', anh: '', phanLoai: '', isMoi: false, isKhuyenMai: false, isBanChay: false });
  
  const [showModalDM, setShowModalDM] = useState(false);
  const [editingDM, setEditingDM] = useState(null);
  const [formDataDM, setFormDataDM] = useState({ ten: '', icon: '', parent: '', order: '' });

  const [formBanner, setFormBanner] = useState({ img: '', link: '' });
  const [formCoupon, setFormCoupon] = useState({ code: '', giamGia: 0 });
  const [formShip, setFormShip] = useState({ khuVuc: '', phi: 0 });

  const [editingUser, setEditingUser] = useState(null);
  const [showModalUser, setShowModalUser] = useState(false);
  const [userPoint, setUserPoint] = useState(0);

  const [shopConfig, setShopConfig] = useState({ 
    tenShop: '', slogan: '', logo: '', diaChi: '', sdt: '', linkFacebook: '', copyright: '', tyLeDiem: 1000, gioiThieu: '' 
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

  useEffect(() => {
    if (isLoggedIn) {
      const unsubConfig = onSnapshot(doc(db, "cauHinh", "thongTinChung"), (d) => { if(d.exists()) setShopConfig(d.data()); });
      const unsubBanner = onSnapshot(collection(db, "banners"), (sn) => setDsBanner(sn.docs.map(d => ({id: d.id, ...d.data()}))));
      const unsubCoupon = onSnapshot(collection(db, "coupons"), (sn) => setDsCoupon(sn.docs.map(d => ({id: d.id, ...d.data()}))));
      const unsubShip = onSnapshot(collection(db, "shipping"), (sn) => setDsShip(sn.docs.map(d => ({id: d.id, ...d.data()}))));
      const unsubUser = onSnapshot(collection(db, "users"), (sn) => setDsUser(sn.docs.map(d => ({id: d.id, ...d.data()}))));
      const unsubReview = onSnapshot(collection(db, "reviews"), (sn) => setDsReview(sn.docs.map(d => ({id: d.id, ...d.data()}))));
      return () => { unsubConfig(); unsubBanner(); unsubCoupon(); unsubShip(); unsubUser(); unsubReview(); };
    }
  }, [isLoggedIn]);

  const handleLogin = (e) => { e.preventDefault(); if(loginInput.username===adminConfig.username && loginInput.password===adminConfig.password) setIsLoggedIn(true); else alert("Sai mật khẩu!"); };
  const luuCauHinh = async () => { await setDoc(doc(db, "cauHinh", "thongTinChung"), shopConfig); alert("Đã lưu cấu hình!"); };
  const handleUpload = (e, type) => { const file = e.target.files[0]; if(!file) return; const rd = new FileReader(); rd.onloadend=()=>{ if(type==='LOGO') setShopConfig({...shopConfig, logo: rd.result}); else if(type==='PRODUCT') setFormDataSP({...formDataSP, anh: rd.result}); else if(type==='BANNER') setFormBanner({...formBanner, img: rd.result}); }; rd.readAsDataURL(file); };

  const addBanner = async () => { await addDoc(collection(db, "banners"), formBanner); setFormBanner({img:'', link:''}); };
  const delBanner = async (id) => await deleteDoc(doc(db, "banners", id));
  const addCoupon = async () => { await addDoc(collection(db, "coupons"), formCoupon); setFormCoupon({code:'', giamGia:0}); };
  const delCoupon = async (id) => await deleteDoc(doc(db, "coupons", id));
  const addShip = async () => { await addDoc(collection(db, "shipping"), formShip); setFormShip({khuVuc:'', phi:0}); };
  const delShip = async (id) => await deleteDoc(doc(db, "shipping", id));
  const delReview = async (id) => { if(confirm("Xóa bình luận này?")) await deleteDoc(doc(db, "reviews", id)); };
  
  const deleteUser = async (id) => { if(confirm("Xóa thành viên này khỏi danh sách?")) await deleteDoc(doc(db, "users", id)); };
  const updateUserPoint = async () => { if(editingUser) { await updateDoc(doc(db, "users", editingUser.id), { diemTichLuy: parseInt(userPoint) }); setShowModalUser(false); } };

  useEffect(() => { const goc = parseInt(formDataSP.giaGoc) || 0; const giam = parseInt(formDataSP.phanTramGiam) || 0; setFormDataSP(p => ({ ...p, giaBan: goc > 0 ? Math.floor(goc * (1 - giam / 100)) : '' })); }, [formDataSP.giaGoc, formDataSP.phanTramGiam]);
  const sortedDanhMuc = (() => { const s = (a, b) => parseFloat(a.order || 0) - parseFloat(b.order || 0); const list = dsDanhMuc || []; const roots = list.filter(d => !d.parent).sort(s); const children = list.filter(d => d.parent).sort(s); let res = []; roots.forEach(root => { res.push(root); res.push(...children.filter(c => c.parent === (root.customId || root.id))); }); return res; })();

  if (!isLoggedIn) return ( <div className="admin-login-wrapper"><div className="admin-login-card shadow"><h3 className="text-center text-success fw-bold">ADMIN LOGIN</h3><Form onSubmit={handleLogin}><Form.Control className="mb-3 p-3" placeholder="User" onChange={e=>setLoginInput({...loginInput, username:e.target.value})}/><Form.Control type="password" className="mb-3 p-3" placeholder="Pass" onChange={e=>setLoginInput({...loginInput, password:e.target.value})}/><Button type="submit" variant="success" className="w-100 py-2 fw-bold">ĐĂNG NHẬP</Button></Form></div></div> );

  return (
    <div className="admin-main-container">
      {/* --- MENU ADMIN CÓ HOTLINE --- */}
      <div className="admin-navbar">
        <h4>QUẢN TRỊ SHOP</h4> 
        <div className="d-flex align-items-center gap-3">
          {shopConfig.sdt && <span className="text-white small d-none d-md-block"><i className="fa-solid fa-phone me-1"></i> Hotline: {shopConfig.sdt}</span>}
          <Link to="/"><Button variant="danger" size="sm">Thoát</Button></Link>
        </div>
      </div>

      <Container fluid className="p-3 p-md-4">
        <Row className="mb-4 g-2">
          <Col xs={6} md={3}><div className="stats-box bg-primary"><h5>Hôm nay</h5><h3>{thongKe.doanhThuNgay.toLocaleString()} ¥</h3></div></Col>
          <Col xs={6} md={3}><div className="stats-box bg-success"><h5>Tháng này</h5><h3>{thongKe.doanhThuThang.toLocaleString()} ¥</h3></div></Col>
          <Col xs={6} md={3}><div className="stats-box bg-warning text-dark"><h5>Cả năm</h5><h3>{thongKe.doanhThuNam.toLocaleString()} ¥</h3></div></Col>
          <Col xs={6} md={3}><div className="stats-box bg-info"><h5>Tổng đơn</h5><h3>{thongKe.tongDon} đơn</h3></div></Col>
        </Row>

        <Tabs defaultActiveKey="config" className="mb-4 bg-white p-2 rounded shadow-sm border">
          <Tab eventKey="config" title="⚙️ CẤU HÌNH">
            <div className="bg-white p-3 rounded">
              <Row>
                <Col md={4} className="text-center"><Form.Group className="mb-3"><Form.Label className="fw-bold">Logo Cửa Hàng</Form.Label><div className="border p-2 rounded mb-2 d-flex justify-content-center align-items-center" style={{height:'150px', background:'#f8f9fa'}}>{shopConfig.logo ? <img src={shopConfig.logo} style={{maxHeight:'100%', maxWidth:'100%'}} alt="Logo" /> : <span className="text-muted">Chưa có logo</span>}</div><Form.Control type="file" onChange={e=>handleUpload(e,'LOGO')}/></Form.Group></Col>
                <Col md={8}>
                  <Row>
                    <Col md={6}><Form.Group className="mb-3"><Form.Label className="fw-bold">Tên Cửa Hàng</Form.Label><Form.Control value={shopConfig.tenShop} onChange={e=>setShopConfig({...shopConfig, tenShop:e.target.value})}/></Form.Group></Col>
                    <Col md={6}><Form.Group className="mb-3"><Form.Label className="fw-bold">Slogan</Form.Label><Form.Control value={shopConfig.slogan} onChange={e=>setShopConfig({...shopConfig, slogan:e.target.value})}/></Form.Group></Col>
                    <Col md={12}><Form.Group className="mb-3"><Form.Label className="fw-bold">Giới thiệu (Footer)</Form.Label><Form.Control as="textarea" rows={2} value={shopConfig.gioiThieu} onChange={e=>setShopConfig({...shopConfig, gioiThieu:e.target.value})}/></Form.Group></Col>
                    <Col md={12}><Form.Group className="mb-3"><Form.Label className="fw-bold">Địa chỉ</Form.Label><Form.Control value={shopConfig.diaChi} onChange={e=>setShopConfig({...shopConfig, diaChi:e.target.value})}/></Form.Group></Col>
                    <Col md={6}><Form.Group className="mb-3"><Form.Label className="fw-bold">Hotline / Zalo</Form.Label><Form.Control value={shopConfig.sdt} onChange={e=>setShopConfig({...shopConfig, sdt:e.target.value})}/></Form.Group></Col>
                    <Col md={6}><Form.Group className="mb-3"><Form.Label className="fw-bold">Tỷ lệ điểm (¥ đổi 1 điểm)</Form.Label><Form.Control type="number" value={shopConfig.tyLeDiem} onChange={e=>setShopConfig({...shopConfig, tyLeDiem:e.target.value})}/></Form.Group></Col>
                    <Col md={12}><Form.Group className="mb-3"><Form.Label className="fw-bold">Link Facebook</Form.Label><Form.Control value={shopConfig.linkFacebook} onChange={e=>setShopConfig({...shopConfig, linkFacebook:e.target.value})}/></Form.Group></Col>
                  </Row>
                  <Button variant="success" onClick={luuCauHinh}>💾 LƯU CẤU HÌNH</Button>
                </Col>
              </Row>
            </div>
          </Tab>

          <Tab eventKey="banner" title="🖼️ BANNER"><div className="bg-white p-3 rounded"><Row className="align-items-end mb-3"><Col md={5}><Form.Group><Form.Label className="fw-bold">Chọn ảnh Banner <span className="text-danger small">(1200 x 400 px)</span></Form.Label><Form.Control type="file" onChange={e=>handleUpload(e,'BANNER')}/></Form.Group></Col><Col md={5}><Form.Group><Form.Label className="fw-bold">Link (Tùy chọn)</Form.Label><Form.Control placeholder="/product/..." value={formBanner.link} onChange={e=>setFormBanner({...formBanner, link:e.target.value})}/></Form.Group></Col><Col md={2}><Button variant="primary" className="w-100" onClick={addBanner} disabled={!formBanner.img}>+ Thêm</Button></Col></Row><div className="d-flex flex-wrap gap-3">{dsBanner.map(b => (<div key={b.id} className="position-relative border rounded shadow-sm" style={{width:250}}><img src={b.img} alt="" className="w-100 rounded-top" style={{height: 100, objectFit:'cover'}} /><Button variant="danger" size="sm" className="position-absolute top-0 end-0 m-1" onClick={()=>delBanner(b.id)}>X</Button><div className="p-2 small bg-light text-truncate border-top">{b.link || 'Không có link'}</div></div>))}</div></div></Tab>
          <Tab eventKey="marketing" title="🎟️ VOUCHER & SHIP"><Row><Col md={6} className="border-end p-3"><h5 className="text-success fw-bold border-bottom pb-2">MÃ GIẢM GIÁ</h5><div className="d-flex gap-2 mb-3"><Form.Control placeholder="Mã (VD: SALE10)" value={formCoupon.code} onChange={e=>setFormCoupon({...formCoupon, code:e.target.value.toUpperCase()})}/><Form.Control type="number" placeholder="Giảm (¥)" value={formCoupon.giamGia} onChange={e=>setFormCoupon({...formCoupon, giamGia:e.target.value})}/> <Button onClick={addCoupon}>Thêm</Button></div><Table striped bordered hover size="sm"><thead><tr><th>Mã</th><th>Giảm</th><th>Xóa</th></tr></thead><tbody>{dsCoupon.map(c=>(<tr key={c.id}><td className="fw-bold text-primary">{c.code}</td><td className="text-danger fw-bold">{parseInt(c.giamGia).toLocaleString()} ¥</td><td><Button size="sm" variant="danger" onClick={()=>delCoupon(c.id)}>X</Button></td></tr>))}</tbody></Table></Col><Col md={6} className="p-3"><h5 className="text-primary fw-bold border-bottom pb-2">PHÍ SHIP (THEO KHU VỰC)</h5><div className="d-flex gap-2 mb-3"><Form.Control placeholder="Khu vực" value={formShip.khuVuc} onChange={e=>setFormShip({...formShip, khuVuc:e.target.value})}/><Form.Control type="number" placeholder="Phí ship (¥)" value={formShip.phi} onChange={e=>setFormShip({...formShip, phi:e.target.value})}/> <Button onClick={addShip}>Thêm</Button></div><Table striped bordered hover size="sm"><thead><tr><th>Khu vực</th><th>Phí Ship</th><th>Xóa</th></tr></thead><tbody>{dsShip.map(s=>(<tr key={s.id}><td>{s.khuVuc}</td><td className="text-danger fw-bold">{parseInt(s.phi).toLocaleString()} ¥</td><td><Button size="sm" variant="danger" onClick={()=>delShip(s.id)}>X</Button></td></tr>))}</tbody></Table></Col></Row></Tab>
          <Tab eventKey="products" title="📦 SẢN PHẨM"><Button variant="primary" className="my-3 fw-bold shadow-sm" onClick={()=>{setEditingSP(null); setFormDataSP({ ten: '', giaGoc: '', phanTramGiam: 0, giaBan: '', donVi: 'Cái', soLuong: 10, moTa: '', anh: '', phanLoai: '', isMoi: false, isKhuyenMai: false, isBanChay: false }); setShowModalSP(true)}}>+ THÊM SẢN PHẨM</Button><div className="table-responsive"><Table hover bordered className="align-middle bg-white shadow-sm"><thead className="bg-light"><tr><th style={{width:50}}>Ảnh</th><th>Tên sản phẩm</th><th>Danh mục</th><th>Giá bán</th><th>Trạng thái</th><th style={{width:120}}>Thao tác</th></tr></thead><tbody>{dsSanPham.map(sp=>{const tenDM = dsDanhMuc.find(d=>d.id===sp.phanLoai)?.ten || '---';return (<tr key={sp.id}><td><img src={sp.anh || NO_IMAGE} width="50" height="50" style={{objectFit:'cover', borderRadius:5}} alt=""/></td><td className="fw-bold">{sp.ten}</td><td><Badge bg="info">{tenDM}</Badge></td><td className="text-danger fw-bold">{sp.giaBan?.toLocaleString()} ¥</td><td>{sp.isMoi && <Badge bg="success" className="me-1">New</Badge>}{sp.isBanChay && <Badge bg="danger" className="me-1">Hot</Badge>}{sp.isKhuyenMai && <Badge bg="warning" text="dark">Sale</Badge>}</td><td><Button size="sm" variant="warning" className="me-1" onClick={()=>{setEditingSP(sp); setFormDataSP(sp); setShowModalSP(true)}}><i className="fa-solid fa-pen"></i></Button><Button size="sm" variant="danger" onClick={()=>{if(confirm('Xóa?')) handleUpdateDS_SP('DELETE', sp.id)}}><i className="fa-solid fa-trash"></i></Button></td></tr>)})}</tbody></Table></div></Tab>
          <Tab eventKey="menu" title="📂 DANH MỤC"><Button variant="success" className="my-3 fw-bold" onClick={()=>{setEditingDM(null); setFormDataDM({ten:'', icon:'', parent:'', order:''}); setShowModalDM(true)}}>+ THÊM DANH MỤC</Button><Table bordered hover className="align-middle bg-white shadow-sm"><thead className="bg-light"><tr><th className="text-center">TT</th><th>Tên danh mục</th><th className="text-center">Icon</th><th style={{width:120}}>Thao tác</th></tr></thead><tbody>{sortedDanhMuc.map(dm=>(<tr key={dm.id}><td className="text-center fw-bold">{dm.order}</td><td style={{paddingLeft: dm.parent ? '30px' : '10px', fontWeight: dm.parent ? 'normal' : 'bold', color: dm.parent ? '#555' : '#000'}}>{dm.parent ? '↳ ' : ''}{dm.ten}</td><td className="text-center fs-5">{dm.icon}</td><td><Button size="sm" variant="outline-warning" className="me-1" onClick={()=>{setEditingDM(dm); setFormDataDM(dm); setShowModalDM(true)}}>Sửa</Button><Button size="sm" variant="outline-danger" onClick={()=>handleUpdateDS_DM('DELETE',dm.id)}>Xóa</Button></td></tr>))}</tbody></Table></Tab>
          <Tab eventKey="orders" title={`📋 ĐƠN HÀNG (${dsDonHang.length})`}><div className="table-responsive mt-3"><Table hover bordered className="align-middle bg-white shadow-sm"><thead className="bg-light"><tr><th>Ngày đặt</th><th>Khách hàng</th><th>Tổng tiền</th><th>Trạng thái</th><th>Thao tác</th></tr></thead><tbody>{dsDonHang.sort((a,b)=>b.ngayDat-a.ngayDat).map(dh=>(<tr key={dh.id}><td>{dh.ngayDat?.toDate?dh.ngayDat.toDate().toLocaleString('vi-VN'):'Mới'}</td><td><div className="fw-bold">{dh.khachHang?.ten}</div><div className="small text-muted">{dh.khachHang?.sdt}</div></td><td className="text-danger fw-bold">{dh.tongTien?.toLocaleString()} ¥</td><td><Badge bg={dh.trangThai==='Hoàn thành'?'success':'warning'}>{dh.trangThai}</Badge></td><td><Button size="sm" variant="info" className="me-1 text-white" onClick={()=>{setSelectedOrder(dh);setShowModalOrder(true)}}>Xem CT</Button><Button size="sm" variant="success" className="me-1" onClick={()=>handleUpdateStatusOrder(dh.id, 'Hoàn thành')}>✔</Button><Button size="sm" variant="danger" onClick={()=>handleDeleteOrder(dh.id)}>✘</Button></td></tr>))}</tbody></Table></div></Tab>
          <Tab eventKey="users" title="👥 KHÁCH HÀNG & BÌNH LUẬN"><Row><Col md={7}><div className="bg-white p-3 rounded shadow-sm mb-3"><h5 className="text-primary fw-bold border-bottom pb-2">DANH SÁCH THÀNH VIÊN</h5><div className="table-responsive" style={{maxHeight:400, overflowY:'auto'}}><Table hover size="sm" className="align-middle"><thead className="bg-light sticky-top"><tr><th>Tên</th><th>Email</th><th>Điểm</th><th>Thao tác</th></tr></thead><tbody>{dsUser.map(u=>(<tr key={u.id}><td className="fw-bold">{u.ten}</td><td>{u.email}</td><td className="text-warning fw-bold">{u.diemTichLuy}</td><td><Button size="sm" variant="outline-primary" className="me-1" onClick={()=>{setEditingUser(u); setUserPoint(u.diemTichLuy); setShowModalUser(true)}}>Sửa điểm</Button><Button size="sm" variant="outline-danger" onClick={()=>deleteUser(u.id)}>Xóa</Button></td></tr>))}</tbody></Table></div></div></Col><Col md={5}><div className="bg-white p-3 rounded shadow-sm"><h5 className="text-warning fw-bold border-bottom pb-2">QUẢN LÝ BÌNH LUẬN</h5><div style={{maxHeight: 400, overflowY:'auto'}}>{dsReview.map(r => {const sp = dsSanPham.find(p=>p.id===r.productId);return (<div key={r.id} className="border p-3 mb-2 rounded bg-light position-relative"><div className="d-flex justify-content-between align-items-center mb-1"><strong className="text-primary">{r.userName}</strong><span className="badge bg-secondary" style={{fontSize:10}}>{r.ngay ? r.ngay.toDate().toLocaleDateString() : ''}</span></div><div className="small text-muted mb-1 fst-italic">SP: {sp?.ten || 'SP đã xóa'}</div><div className="text-warning mb-1">{'⭐'.repeat(r.rating)}</div><p className="mb-2 bg-white p-2 rounded border">{r.comment}</p><div className="text-end"><Button size="sm" variant="danger" onClick={()=>delReview(r.id)}>Xóa Comment</Button></div></div>)})}</div></div></Col></Row></Tab>
        </Tabs>
      </Container>
      
      {/* MODAL SẢN PHẨM */}
      <Modal show={showModalSP} onHide={()=>setShowModalSP(false)} size="lg" centered><Modal.Header closeButton><Modal.Title className="fw-bold text-success">{editingSP ? 'CẬP NHẬT SẢN PHẨM' : 'THÊM SẢN PHẨM MỚI'}</Modal.Title></Modal.Header><Modal.Body><Form><Row><Col md={8}><Form.Group className="mb-3"><Form.Label className="fw-bold">Tên sản phẩm</Form.Label><Form.Control value={formDataSP.ten} onChange={e=>setFormDataSP({...formDataSP,ten:e.target.value})} /></Form.Group><Form.Group className="mb-3"><Form.Label className="fw-bold">Danh mục</Form.Label><Form.Select value={formDataSP.phanLoai} onChange={e=>setFormDataSP({...formDataSP,phanLoai:e.target.value})}><option value="">-- Chọn danh mục --</option>{sortedDanhMuc.map(d=><option key={d.id} value={d.id}>{d.parent?'-- ':''}{d.ten}</option>)}</Form.Select></Form.Group><Row><Col><Form.Group className="mb-3"><Form.Label className="fw-bold">Giá Gốc (¥)</Form.Label><Form.Control type="number" value={formDataSP.giaGoc} onChange={e=>setFormDataSP({...formDataSP,giaGoc:e.target.value})}/></Form.Group></Col><Col><Form.Group className="mb-3"><Form.Label className="fw-bold">% Giảm</Form.Label><Form.Control type="number" value={formDataSP.phanTramGiam} onChange={e=>setFormDataSP({...formDataSP,phanTramGiam:e.target.value})}/></Form.Group></Col></Row><Form.Group className="mb-3"><Form.Label className="fw-bold text-danger">Giá Bán (Tự động)</Form.Label><Form.Control className="bg-light fw-bold text-danger" readOnly value={formDataSP.giaBan} /></Form.Group><div className="d-flex gap-3 mt-2 border p-2 rounded bg-light"><Form.Check type="switch" label="Hàng Mới (NEW)" checked={formDataSP.isMoi} onChange={e=>setFormDataSP({...formDataSP,isMoi:e.target.checked})}/><Form.Check type="switch" label="Bán Chạy (HOT)" checked={formDataSP.isBanChay} onChange={e=>setFormDataSP({...formDataSP,isBanChay:e.target.checked})}/><Form.Check type="switch" label="Khuyến Mãi (SALE)" checked={formDataSP.isKhuyenMai} onChange={e=>setFormDataSP({...formDataSP,isKhuyenMai:e.target.checked})}/></div></Col><Col md={4}><Form.Group className="mb-2"><Form.Label className="fw-bold">Hình ảnh</Form.Label><Form.Control type="file" onChange={e=>handleUpload(e,'PRODUCT')}/></Form.Group><div className="border rounded p-1 text-center" style={{minHeight:200}}><img src={formDataSP.anh || NO_IMAGE} style={{maxWidth:'100%', maxHeight:250}} alt=""/></div></Col></Row><Form.Group className="mt-3"><Form.Label className="fw-bold">Mô tả chi tiết</Form.Label><ReactQuill theme="snow" value={formDataSP.moTa} onChange={v=>setFormDataSP({...formDataSP,moTa:v})}/></Form.Group></Form></Modal.Body><Modal.Footer><Button variant="secondary" onClick={()=>setShowModalSP(false)}>Hủy</Button><Button variant="success" onClick={()=>handleUpdateDS_SP(editingSP?'UPDATE':'ADD', formDataSP)}>Lưu Dữ Liệu</Button></Modal.Footer></Modal>
      {/* MODAL MENU */}
      <Modal show={showModalDM} onHide={()=>setShowModalDM(false)} centered><Modal.Header closeButton><Modal.Title className="fw-bold text-primary">QUẢN LÝ DANH MỤC</Modal.Title></Modal.Header><Modal.Body><Form.Group className="mb-3"><Form.Label className="fw-bold">Tên danh mục</Form.Label><Form.Control value={formDataDM.ten} onChange={e=>setFormDataDM({...formDataDM,ten:e.target.value})} /></Form.Group><Form.Group className="mb-3"><Form.Label className="fw-bold">Thứ tự hiển thị</Form.Label><Form.Control type="number" value={formDataDM.order} onChange={e=>setFormDataDM({...formDataDM,order:e.target.value})} /></Form.Group><Form.Group className="mb-3"><Form.Label className="fw-bold">Icon (Biểu tượng)</Form.Label><Form.Select value={formDataDM.icon} onChange={e=>setFormDataDM({...formDataDM,icon:e.target.value})}><option value="">-- Không chọn --</option>{ICON_LIST.map(i=><option key={i} value={i}>{i}</option>)}</Form.Select></Form.Group><Form.Group className="mb-3"><Form.Label className="fw-bold">Danh mục cha (Nếu là con)</Form.Label><Form.Select value={formDataDM.parent} onChange={e=>setFormDataDM({...formDataDM,parent:e.target.value})}><option value="">-- Là danh mục Gốc --</option>{dsDanhMuc.filter(d=>!d.parent).map(d=><option key={d.id} value={d.customId||d.id}>{d.ten}</option>)}</Form.Select></Form.Group></Modal.Body><Modal.Footer><Button variant="secondary" onClick={()=>setShowModalDM(false)}>Hủy</Button><Button variant="success" onClick={()=>handleUpdateDS_DM(editingDM?'UPDATE':'ADD', formDataDM)}>Lưu Danh Mục</Button></Modal.Footer></Modal>
      {/* MODAL CHI TIẾT ĐƠN HÀNG */}
      <Modal show={showModalOrder} onHide={() => setShowModalOrder(false)} size="lg" centered><Modal.Header closeButton className="bg-success text-white"><Modal.Title className="fw-bold"><i className="fa-solid fa-file-invoice me-2"></i>CHI TIẾT ĐƠN HÀNG</Modal.Title></Modal.Header><Modal.Body className="bg-light">{selectedOrder && (<div className="p-2"><Row className="mb-4"><Col md={6}><Card className="h-100 shadow-sm border-0"><Card.Header className="bg-white fw-bold text-success border-bottom"><i className="fa-solid fa-user me-2"></i>THÔNG TIN KHÁCH HÀNG</Card.Header><Card.Body><p className="mb-2"><strong>Họ tên:</strong> {selectedOrder.khachHang?.ten}</p><p className="mb-2"><strong>SĐT:</strong> <span className="text-primary fw-bold">{selectedOrder.khachHang?.sdt}</span></p><p className="mb-2"><strong>Địa chỉ:</strong> {selectedOrder.khachHang?.diachi}</p>{selectedOrder.khachHang?.ghiChu && (<div className="alert alert-warning p-2 mt-2 small"><i className="fa-solid fa-note-sticky me-1"></i> <strong>Ghi chú:</strong> {selectedOrder.khachHang.ghiChu}</div>)}</Card.Body></Card></Col><Col md={6} className="mt-3 mt-md-0"><Card className="h-100 shadow-sm border-0"><Card.Header className="bg-white fw-bold text-success border-bottom"><i className="fa-solid fa-circle-info me-2"></i>THÔNG TIN ĐƠN</Card.Header><Card.Body><p className="mb-2"><strong>Mã đơn:</strong> <span className="text-muted small">#{selectedOrder.id}</span></p><p className="mb-2"><strong>Ngày đặt:</strong> {selectedOrder.ngayDat?.toDate ? selectedOrder.ngayDat.toDate().toLocaleString('vi-VN') : 'Vừa xong'}</p><p className="mb-0"><strong>Trạng thái:</strong> <Badge bg={selectedOrder.trangThai === 'Hoàn thành' ? 'success' : 'warning'}>{selectedOrder.trangThai}</Badge></p></Card.Body></Card></Col></Row><Card className="shadow-sm border-0"><Card.Header className="bg-white fw-bold text-dark border-bottom"><i className="fa-solid fa-list me-2"></i>DANH SÁCH SẢN PHẨM</Card.Header><div className="table-responsive"><Table className="align-middle mb-0" hover><thead className="bg-light"><tr><th style={{width: '60px'}}>Ảnh</th><th>Tên sản phẩm</th><th className="text-center">SL</th><th className="text-end">Đơn giá</th><th className="text-end">Thành tiền</th></tr></thead><tbody>{selectedOrder.gioHang?.map((item, idx) => (<tr key={idx}><td><img src={item.anh || NO_IMAGE} width="40" height="40" className="rounded border" style={{objectFit:'cover'}} alt=""/></td><td className="fw-bold text-secondary">{item.ten}</td><td className="text-center fw-bold">{item.soLuong}</td><td className="text-end text-muted">{item.giaBan?.toLocaleString()} ¥</td><td className="text-end fw-bold text-dark">{(item.soLuong * item.giaBan).toLocaleString()} ¥</td></tr>))}</tbody><tfoot className="bg-light"><tr><td colSpan="4" className="text-end fw-bold text-uppercase pt-3">Tổng thanh toán:</td><td className="text-end text-danger fw-bold fs-5 pt-3">{selectedOrder.tongTien?.toLocaleString()} ¥</td></tr></tfoot></Table></div></Card></div>)}</Modal.Body><Modal.Footer><Button variant="secondary" onClick={() => setShowModalOrder(false)}>Đóng</Button><Button variant="success" onClick={() => { handleUpdateStatusOrder(selectedOrder.id, 'Hoàn thành'); setShowModalOrder(false); }}>✔ Xác nhận Hoàn thành</Button></Modal.Footer></Modal>
      {/* MODAL SỬA USER */}
      <Modal show={showModalUser} onHide={()=>setShowModalUser(false)} centered><Modal.Header closeButton><Modal.Title>Cập nhật Thành Viên</Modal.Title></Modal.Header><Modal.Body><Form.Group><Form.Label>Tên</Form.Label><Form.Control value={editingUser?.ten || ''} disabled /></Form.Group><Form.Group className="mt-2"><Form.Label>Email</Form.Label><Form.Control value={editingUser?.email || ''} disabled /></Form.Group><Form.Group className="mt-2"><Form.Label className="fw-bold text-warning">Điểm tích lũy</Form.Label><Form.Control type="number" value={userPoint} onChange={e=>setUserPoint(e.target.value)} /></Form.Group></Modal.Body><Modal.Footer><Button onClick={updateUserPoint}>Lưu Thay Đổi</Button></Modal.Footer></Modal>
    </div>
  );
}
export default Admin;