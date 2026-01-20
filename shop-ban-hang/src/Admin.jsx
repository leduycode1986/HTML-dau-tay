import React, { useState, useEffect } from 'react';
import { Table, Button, Form, Modal, Badge, Tab, Tabs, Row, Col, Container, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { doc, getDoc, setDoc, collection, onSnapshot, deleteDoc, updateDoc, addDoc } from 'firebase/firestore'; 
import { db } from './firebase'; 

const ICON_LIST = ['🏠', '🥩', '🥦', '🍎', '🥛', '🥤', '🍞', '🥫', '🧼', '🧸', '📦', '🐟', '🍗', '🍜', '🍚', '🍦', '🍪', '🍫', '👕', '👠', '💄', '💊', '⚡', '🎉', '⚽', '🔥', '❄️', '🐶', '🐱'];
const NO_IMAGE = "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg";

function Admin({ dsSanPham, handleUpdateDS_SP, dsDanhMuc, handleUpdateDS_DM, dsDonHang, handleUpdateStatusOrder, handleDeleteOrder }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginInput, setLoginInput] = useState({ username: '', password: '' });
  const [adminConfig, setAdminConfig] = useState(() => JSON.parse(localStorage.getItem('adminConfig') || '{"username":"admin","password":"123"}'));

  // --- STATES QUẢN LÝ ---
  const [dsBanner, setDsBanner] = useState([]);
  const [dsCoupon, setDsCoupon] = useState([]);
  const [dsShip, setDsShip] = useState([]); // Phí ship
  const [dsUser, setDsUser] = useState([]); // Thành viên
  const [dsReview, setDsReview] = useState([]); // Bình luận

  // --- STATES MODAL & FORM ---
  const [showModalSP, setShowModalSP] = useState(false);
  const [editingSP, setEditingSP] = useState(null);
  const [formDataSP, setFormDataSP] = useState({ ten: '', giaGoc: '', phanTramGiam: 0, giaBan: '', donVi: 'Cái', soLuong: 10, moTa: '', anh: '', phanLoai: '', isMoi: false, isKhuyenMai: false, isBanChay: false });
  
  const [showModalDM, setShowModalDM] = useState(false);
  const [editingDM, setEditingDM] = useState(null);
  const [formDataDM, setFormDataDM] = useState({ ten: '', icon: '', parent: '', order: '' });

  // Banner Form
  const [formBanner, setFormBanner] = useState({ img: '', link: '' });
  
  // Coupon Form
  const [formCoupon, setFormCoupon] = useState({ code: '', giamGia: 0 });

  // Ship Form
  const [formShip, setFormShip] = useState({ khuVuc: '', phi: 0 });

  const [shopConfig, setShopConfig] = useState({ 
    tenShop: '', slogan: '', logo: '', diaChi: '', sdt: '', linkFacebook: '', copyright: '', tyLeDiem: 1000, gioiThieu: '' 
  });
  const [showModalOrder, setShowModalOrder] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // --- LOAD DATA ---
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
  const luuCauHinh = async () => { await setDoc(doc(db, "cauHinh", "thongTinChung"), shopConfig); alert("Đã lưu!"); };
  const handleUpload = (e, type) => { const file = e.target.files[0]; if(!file) return; const rd = new FileReader(); rd.onloadend=()=>{ if(type==='LOGO') setShopConfig({...shopConfig, logo: rd.result}); else if(type==='PRODUCT') setFormDataSP({...formDataSP, anh: rd.result}); else if(type==='BANNER') setFormBanner({...formBanner, img: rd.result}); }; rd.readAsDataURL(file); };

  // --- XỬ LÝ DỮ LIỆU (ADD/DELETE) ---
  const addBanner = async () => { await addDoc(collection(db, "banners"), formBanner); setFormBanner({img:'', link:''}); };
  const delBanner = async (id) => await deleteDoc(doc(db, "banners", id));
  
  const addCoupon = async () => { await addDoc(collection(db, "coupons"), formCoupon); setFormCoupon({code:'', giamGia:0}); };
  const delCoupon = async (id) => await deleteDoc(doc(db, "coupons", id));

  const addShip = async () => { await addDoc(collection(db, "shipping"), formShip); setFormShip({khuVuc:'', phi:0}); };
  const delShip = async (id) => await deleteDoc(doc(db, "shipping", id));

  const delReview = async (id) => { if(confirm("Xóa bình luận này?")) await deleteDoc(doc(db, "reviews", id)); };
  
  // Logic hiển thị danh mục
  const sortedDanhMuc = (() => { const s = (a, b) => parseFloat(a.order || 0) - parseFloat(b.order || 0); const list = dsDanhMuc || []; const roots = list.filter(d => !d.parent).sort(s); const children = list.filter(d => d.parent).sort(s); let res = []; roots.forEach(root => { res.push(root); res.push(...children.filter(c => c.parent === (root.customId || root.id))); }); return res; })();

  if (!isLoggedIn) return ( <div className="admin-login-wrapper"><div className="admin-login-card shadow"><h3 className="text-center text-success fw-bold">ADMIN PANEL</h3><Form onSubmit={handleLogin}><Form.Control className="mb-3" placeholder="User" onChange={e=>setLoginInput({...loginInput, username:e.target.value})}/><Form.Control type="password" className="mb-3" placeholder="Pass" onChange={e=>setLoginInput({...loginInput, password:e.target.value})}/><Button type="submit" variant="success" className="w-100">Đăng Nhập</Button></Form></div></div> );

  return (
    <div className="admin-main-container">
      <div className="admin-navbar"><h4>QUẢN TRỊ SHOP</h4> <Link to="/"><Button variant="danger" size="sm">Thoát</Button></Link></div>
      <Container fluid className="p-3">
        <Tabs defaultActiveKey="config" className="mb-4 bg-white p-2 rounded shadow-sm border">
          
          {/* 1. CẤU HÌNH */}
          <Tab eventKey="config" title="⚙️ CẤU HÌNH">
            <Row className="bg-white p-3 rounded">
              <Col md={4}><Form.Label>Logo</Form.Label><div className="border p-2 text-center mb-2"><img src={shopConfig.logo} style={{maxHeight:100}} alt=""/></div><Form.Control type="file" onChange={e=>handleUpload(e,'LOGO')}/></Col>
              <Col md={8}>
                <Row>
                  <Col md={6}><Form.Control placeholder="Tên Shop" value={shopConfig.tenShop} onChange={e=>setShopConfig({...shopConfig, tenShop:e.target.value})} className="mb-2"/></Col>
                  <Col md={6}><Form.Control placeholder="Slogan" value={shopConfig.slogan} onChange={e=>setShopConfig({...shopConfig, slogan:e.target.value})} className="mb-2"/></Col>
                  <Col md={12}><Form.Control as="textarea" placeholder="Giới thiệu" value={shopConfig.gioiThieu} onChange={e=>setShopConfig({...shopConfig, gioiThieu:e.target.value})} className="mb-2"/></Col>
                  <Col md={12}><Form.Control placeholder="Địa chỉ" value={shopConfig.diaChi} onChange={e=>setShopConfig({...shopConfig, diaChi:e.target.value})} className="mb-2"/></Col>
                  <Col md={6}><Form.Control placeholder="SĐT/Zalo" value={shopConfig.sdt} onChange={e=>setShopConfig({...shopConfig, sdt:e.target.value})} className="mb-2"/></Col>
                  <Col md={6}><Form.Control type="number" placeholder="Tỷ lệ điểm (VNĐ/1 điểm)" value={shopConfig.tyLeDiem} onChange={e=>setShopConfig({...shopConfig, tyLeDiem:e.target.value})} className="mb-2"/></Col>
                </Row>
                <Button variant="success" onClick={luuCauHinh}>Lưu Cấu Hình</Button>
              </Col>
            </Row>
          </Tab>

          {/* 2. QUẢN LÝ BANNER (MỚI) */}
          <Tab eventKey="banner" title="🖼️ BANNER">
            <Row className="mb-3 align-items-end">
              <Col md={4}><Form.Label>Chọn ảnh</Form.Label><Form.Control type="file" onChange={e=>handleUpload(e,'BANNER')}/></Col>
              <Col md={6}><Form.Label>Link khi click (Tùy chọn)</Form.Label><Form.Control placeholder="/product/..." value={formBanner.link} onChange={e=>setFormBanner({...formBanner, link:e.target.value})}/></Col>
              <Col md={2}><Button variant="primary" onClick={addBanner} disabled={!formBanner.img}>+ Thêm</Button></Col>
            </Row>
            <div className="d-flex flex-wrap gap-3">
              {dsBanner.map(b => (
                <div key={b.id} className="position-relative border rounded" style={{width:200}}>
                  <img src={b.img} alt="" className="w-100 rounded" />
                  <Button variant="danger" size="sm" className="position-absolute top-0 end-0 m-1" onClick={()=>delBanner(b.id)}>X</Button>
                  <div className="small text-truncate p-1">{b.link || 'No link'}</div>
                </div>
              ))}
            </div>
          </Tab>

          {/* 3. MÃ GIẢM GIÁ & SHIP (MỚI) */}
          <Tab eventKey="marketing" title="🎟️ VOUCHER & SHIP">
            <Row>
              <Col md={6} className="border-end">
                <h5 className="text-success fw-bold">MÃ GIẢM GIÁ (COUPON)</h5>
                <div className="d-flex gap-2 mb-2">
                  <Form.Control placeholder="Mã (VD: SALE10)" value={formCoupon.code} onChange={e=>setFormCoupon({...formCoupon, code:e.target.value.toUpperCase()})}/>
                  <Form.Control type="number" placeholder="Giảm (VNĐ)" value={formCoupon.giamGia} onChange={e=>setFormCoupon({...formCoupon, giamGia:e.target.value})}/>
                  <Button onClick={addCoupon}>Thêm</Button>
                </div>
                <Table size="sm">
                  <thead><tr><th>Mã</th><th>Giảm</th><th>Xóa</th></tr></thead>
                  <tbody>{dsCoupon.map(c=>(<tr key={c.id}><td>{c.code}</td><td>{parseInt(c.giamGia).toLocaleString()}</td><td><Button size="sm" variant="danger" onClick={()=>delCoupon(c.id)}>X</Button></td></tr>))}</tbody>
                </Table>
              </Col>
              <Col md={6}>
                <h5 className="text-primary fw-bold">PHÍ VẬN CHUYỂN (THEO KHU VỰC)</h5>
                <div className="d-flex gap-2 mb-2">
                  <Form.Control placeholder="Khu vực (VD: Quận 1)" value={formShip.khuVuc} onChange={e=>setFormShip({...formShip, khuVuc:e.target.value})}/>
                  <Form.Control type="number" placeholder="Phí ship" value={formShip.phi} onChange={e=>setFormShip({...formShip, phi:e.target.value})}/>
                  <Button onClick={addShip}>Thêm</Button>
                </div>
                <Table size="sm">
                  <thead><tr><th>Khu vực</th><th>Phí</th><th>Xóa</th></tr></thead>
                  <tbody>{dsShip.map(s=>(<tr key={s.id}><td>{s.khuVuc}</td><td>{parseInt(s.phi).toLocaleString()}</td><td><Button size="sm" variant="danger" onClick={()=>delShip(s.id)}>X</Button></td></tr>))}</tbody>
                </Table>
              </Col>
            </Row>
          </Tab>

          {/* 4. SẢN PHẨM & DANH MỤC */}
          <Tab eventKey="products" title="📦 SẢN PHẨM">
             <Button variant="primary" className="my-2" onClick={()=>{setEditingSP(null); setShowModalSP(true)}}>+ Thêm SP</Button>
             <div className="table-responsive"><Table hover><thead><tr><th>Tên</th><th>Giá</th><th>Danh mục</th><th>Thao tác</th></tr></thead><tbody>{dsSanPham.map(sp=>(<tr key={sp.id}><td>{sp.ten}</td><td>{sp.giaBan}</td><td>{dsDanhMuc.find(d=>d.id===sp.phanLoai)?.ten}</td><td><Button size="sm" onClick={()=>{setEditingSP(sp); setFormDataSP(sp); setShowModalSP(true)}}>Sửa</Button> <Button variant="danger" size="sm" onClick={()=>handleUpdateDS_SP('DELETE', sp.id)}>Xóa</Button></td></tr>))}</tbody></Table></div>
          </Tab>
          
          <Tab eventKey="menu" title="📂 DANH MỤC">
             <Button variant="success" className="my-2" onClick={()=>{setEditingDM(null); setShowModalDM(true)}}>+ Thêm Menu</Button>
             <Table bordered><tbody>{sortedDanhMuc.map(dm=>(<tr key={dm.id}><td>{dm.order}</td><td>{dm.parent?'↳ ':''}{dm.ten}</td><td><Button size="sm" variant="danger" onClick={()=>handleUpdateDS_DM('DELETE',dm.id)}>Xóa</Button></td></tr>))}</tbody></Table>
          </Tab>

          {/* 5. ĐƠN HÀNG */}
          <Tab eventKey="orders" title={`📋 ĐƠN HÀNG (${dsDonHang.length})`}>
            <Table hover><thead><tr><th>Ngày</th><th>Khách</th><th>Tổng</th><th>TT</th><th>Xem</th></tr></thead><tbody>{dsDonHang.sort((a,b)=>b.ngayDat-a.ngayDat).map(dh=>(<tr key={dh.id}><td>{dh.ngayDat?.toDate?dh.ngayDat.toDate().toLocaleDateString('vi-VN'):''}</td><td>{dh.khachHang?.ten}</td><td>{dh.tongTien?.toLocaleString()}</td><td><Badge bg={dh.trangThai==='Hoàn thành'?'success':'warning'}>{dh.trangThai}</Badge></td><td><Button size="sm" onClick={()=>{setSelectedOrder(dh);setShowModalOrder(true)}}>Xem</Button></td></tr>))}</tbody></Table>
          </Tab>

          {/* 6. THÀNH VIÊN & BÌNH LUẬN (MỚI) */}
          <Tab eventKey="users" title="👥 USER & REVIEW">
            <Row>
              <Col md={6}>
                 <h5 className="text-info">DANH SÁCH THÀNH VIÊN</h5>
                 <Table size="sm" bordered><thead><tr><th>Tên</th><th>Email</th><th>Điểm</th></tr></thead><tbody>{dsUser.map(u=>(<tr key={u.id}><td>{u.ten}</td><td>{u.email}</td><td>{u.diemTichLuy}</td></tr>))}</tbody></Table>
              </Col>
              <Col md={6}>
                 <h5 className="text-warning">QUẢN LÝ BÌNH LUẬN</h5>
                 <div style={{maxHeight: 400, overflowY:'auto'}}>
                   {dsReview.map(r => {
                     const sp = dsSanPham.find(p=>p.id===r.productId);
                     return (
                       <div key={r.id} className="border p-2 mb-2 rounded bg-light">
                         <div className="d-flex justify-content-between">
                           <strong>{r.userName}</strong>
                           <span className="text-muted small">{r.ngay ? r.ngay.toDate().toLocaleDateString() : ''}</span>
                         </div>
                         <div className="small text-muted">SP: {sp?.ten || 'SP đã xóa'}</div>
                         <div className="text-warning">{'⭐'.repeat(r.rating)}</div>
                         <p className="mb-1">{r.comment}</p>
                         <Button size="sm" variant="outline-danger" onClick={()=>delReview(r.id)}>Xóa Comment</Button>
                       </div>
                     )
                   })}
                 </div>
              </Col>
            </Row>
          </Tab>

        </Tabs>
      </Container>
      
      {/* (Giữ nguyên phần Modal SP, Modal DM, Modal Order như cũ để tiết kiệm chỗ, bạn chỉ cần copy lại phần modal từ code cũ sang đây) */}
      <Modal show={showModalSP} onHide={()=>setShowModalSP(false)} size="lg"><Modal.Header closeButton><Modal.Title>Sản phẩm</Modal.Title></Modal.Header><Modal.Body><Form><Row><Col md={8}><Form.Control placeholder="Tên" value={formDataSP.ten} onChange={e=>setFormDataSP({...formDataSP,ten:e.target.value})} className="mb-2"/><Form.Select value={formDataSP.phanLoai} onChange={e=>setFormDataSP({...formDataSP,phanLoai:e.target.value})} className="mb-2"><option value="">Danh mục</option>{sortedDanhMuc.map(d=><option key={d.id} value={d.id}>{d.parent?'-- ':''}{d.ten}</option>)}</Form.Select><Row><Col><Form.Control placeholder="Giá Gốc" type="number" value={formDataSP.giaGoc} onChange={e=>setFormDataSP({...formDataSP,giaGoc:e.target.value})}/></Col><Col><Form.Control placeholder="% Giảm" type="number" value={formDataSP.phanTramGiam} onChange={e=>setFormDataSP({...formDataSP,phanTramGiam:e.target.value})}/></Col></Row><Form.Control className="mt-2 text-danger fw-bold" readOnly value={formDataSP.giaBan} /><div className="d-flex gap-3 mt-2"><Form.Check label="Mới" checked={formDataSP.isMoi} onChange={e=>setFormDataSP({...formDataSP,isMoi:e.target.checked})}/><Form.Check label="Hot" checked={formDataSP.isBanChay} onChange={e=>setFormDataSP({...formDataSP,isBanChay:e.target.checked})}/><Form.Check label="Sale" checked={formDataSP.isKhuyenMai} onChange={e=>setFormDataSP({...formDataSP,isKhuyenMai:e.target.checked})}/></div></Col><Col md={4}><Form.Control type="file" onChange={e=>handleUpload(e,'PRODUCT')}/><img src={formDataSP.anh} width="100%" className="mt-2"/></Col></Row><ReactQuill value={formDataSP.moTa} onChange={v=>setFormDataSP({...formDataSP,moTa:v})} className="mt-2"/></Form></Modal.Body><Modal.Footer><Button onClick={()=>handleUpdateDS_SP(editingSP?'UPDATE':'ADD', formDataSP)}>Lưu</Button></Modal.Footer></Modal>
      <Modal show={showModalDM} onHide={()=>setShowModalDM(false)}><Modal.Header closeButton><Modal.Title>Menu</Modal.Title></Modal.Header><Modal.Body><Form.Control placeholder="Tên" value={formDataDM.ten} onChange={e=>setFormDataDM({...formDataDM,ten:e.target.value})} className="mb-2"/><Form.Control placeholder="Thứ tự" value={formDataDM.order} onChange={e=>setFormDataDM({...formDataDM,order:e.target.value})} className="mb-2"/><Form.Select value={formDataDM.icon} onChange={e=>setFormDataDM({...formDataDM,icon:e.target.value})} className="mb-2"><option>Icon</option>{ICON_LIST.map(i=><option key={i} value={i}>{i}</option>)}</Form.Select><Form.Select value={formDataDM.parent} onChange={e=>setFormDataDM({...formDataDM,parent:e.target.value})}><option value="">Gốc</option>{dsDanhMuc.filter(d=>!d.parent).map(d=><option key={d.id} value={d.customId||d.id}>{d.ten}</option>)}</Form.Select></Modal.Body><Modal.Footer><Button onClick={()=>handleUpdateDS_DM(editingDM?'UPDATE':'ADD', formDataDM)}>Lưu</Button></Modal.Footer></Modal>
      <Modal show={showModalOrder} onHide={() => setShowModalOrder(false)} size="lg" centered><Modal.Header closeButton className="bg-success text-white"><Modal.Title>Chi Tiết Đơn</Modal.Title></Modal.Header><Modal.Body>{selectedOrder && (<div><p>Khách: {selectedOrder.khachHang.ten} - {selectedOrder.khachHang.sdt}</p><p>ĐC: {selectedOrder.khachHang.diachi}</p><Table><thead><tr><th>SP</th><th>SL</th><th>Giá</th></tr></thead><tbody>{selectedOrder.gioHang.map((i,x)=><tr key={x}><td>{i.ten}</td><td>{i.soLuong}</td><td>{i.giaBan}</td></tr>)}</tbody></Table><h4 className="text-end text-danger">{selectedOrder.tongTien?.toLocaleString()}</h4></div>)}</Modal.Body><Modal.Footer><Button onClick={()=>{handleUpdateStatusOrder(selectedOrder.id,'Hoàn thành');setShowModalOrder(false)}}>Hoàn thành</Button></Modal.Footer></Modal>
    </div>
  );
}
export default Admin;