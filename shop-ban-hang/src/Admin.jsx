import React, { useState, useEffect } from 'react';
import { Table, Button, Form, Modal, Badge, Tab, Tabs, Row, Col, Container, InputGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { doc, setDoc, collection, onSnapshot, deleteDoc, updateDoc, addDoc } from 'firebase/firestore'; 
import { db } from './firebase'; 

const ICON_LIST = ['🏠','📦','🥩','🥦','🍎','🍞','🥫','❄️','🍬','🍫','🍪','🍦','🍺','🥤','🥛','🧃','🧺','🛋️','🍳','🧹','🧽','🧼','🧴','🪥','💄','🔖','⚡','🔥','🎉','🎁'];
const NO_IMAGE = "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg";

function Admin({ dsSanPham, handleUpdateDS_SP, dsDanhMuc, handleUpdateDS_DM, dsDonHang, handleUpdateStatusOrder, handleDeleteOrder }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginInput, setLoginInput] = useState({ user: '', pass: '' });
  const [showPass, setShowPass] = useState(false); // State ẩn hiện mật khẩu

  // --- FIX LỖI "UNDEFINED": Tự động tương thích dữ liệu cũ & mới ---
  const [adminConfig] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('adminConfig') || '{}');
      return {
        // Ưu tiên key mới 'user', nếu không có thì tìm key cũ 'username', không có nữa thì về mặc định 'admin'
        user: saved.user || saved.username || 'admin',
        pass: saved.pass || saved.password || '123'
      };
    } catch {
      return { user: 'admin', pass: '123' };
    }
  });
  // ---------------------------------------------------------------

  const [data, setData] = useState({ banners: [], coupons: [], ships: [], users: [], reviews: [] });
  const [shopConfig, setShopConfig] = useState({ tenShop:'', slogan:'', logo:'', diaChi:'', sdt:'', zalo:'', linkFacebook:'', copyright:'', tyLeDiem:1000, gioiThieu:'', flashSaleEnd:'' });
  
  const [modal, setModal] = useState({ sp: false, dm: false, order: false, user: false });
  const [editData, setEditData] = useState({ sp: null, dm: null, user: null, order: null });
  
  const [formSP, setFormSP] = useState({ ten:'', giaGoc:'', phanTramGiam:0, giaBan:'', donVi:'Cái', moTa:'', anh:'', phanLoai:'', isMoi:false, isKhuyenMai:false, isBanChay:false, isFlashSale:false });
  const [formDM, setFormDM] = useState({ ten:'', icon:'', parent:'', order:'' });
  const [formBanner, setFormBanner] = useState({ img:'', link:'' });
  const [formCoupon, setFormCoupon] = useState({ code:'', giamGia:0 });
  const [formShip, setFormShip] = useState({ khuVuc:'', phi:0 });
  const [userPoint, setUserPoint] = useState(0);

  const thongKe = (() => {
    const today = new Date().toLocaleDateString('vi-VN'), thisMonth = new Date().getMonth() + 1, thisYear = new Date().getFullYear();
    let dNgay = 0, dThang = 0, dNam = 0;
    dsDonHang.forEach(dh => {
      const date = dh.ngayDat?.toDate ? dh.ngayDat.toDate() : null;
      if (!date) return;
      if (date.toLocaleDateString('vi-VN') === today) dNgay += dh.tongTien;
      if (date.getMonth() + 1 === thisMonth && date.getFullYear() === thisYear) dThang += dh.tongTien;
      if (date.getFullYear() === thisYear) dNam += dh.tongTien;
    });
    return { dNgay, dThang, dNam, tongDon: dsDonHang.length };
  })();

  useEffect(() => {
    if (isLoggedIn) {
      const unsubs = [
        onSnapshot(doc(db, "cauHinh", "thongTinChung"), d => d.exists() && setShopConfig(d.data())),
        onSnapshot(collection(db, "banners"), s => setData(p => ({...p, banners: s.docs.map(d=>({id:d.id,...d.data()}))}))),
        onSnapshot(collection(db, "coupons"), s => setData(p => ({...p, coupons: s.docs.map(d=>({id:d.id,...d.data()}))}))),
        onSnapshot(collection(db, "shipping"), s => setData(p => ({...p, ships: s.docs.map(d=>({id:d.id,...d.data()}))}))),
        onSnapshot(collection(db, "users"), s => setData(p => ({...p, users: s.docs.map(d=>({id:d.id,...d.data()}))}))),
        onSnapshot(collection(db, "reviews"), s => setData(p => ({...p, reviews: s.docs.map(d=>({id:d.id,...d.data()}))})))
      ];
      return () => unsubs.forEach(u => u());
    }
  }, [isLoggedIn]);

  const handleLogin = (e) => { 
    e.preventDefault(); 
    if (loginInput.user === adminConfig.user && loginInput.pass === adminConfig.pass) {
      // Khi đăng nhập thành công, cập nhật lại localStorage theo chuẩn mới để lần sau không lỗi nữa
      localStorage.setItem('adminConfig', JSON.stringify({ user: adminConfig.user, pass: adminConfig.pass }));
      setIsLoggedIn(true);
    } else {
      alert(`Sai mật khẩu! Mặc định là: ${adminConfig.user} / ${adminConfig.pass}`);
    }
  };

  const handleUpload = (e, type) => { 
    const file = e.target.files[0]; if(!file) return; 
    const rd = new FileReader(); rd.onloadend=()=>{ 
      if(type==='LOGO') setShopConfig({...shopConfig, logo: rd.result}); 
      if(type==='PRODUCT') setFormSP({...formSP, anh: rd.result}); 
      if(type==='BANNER') setFormBanner({...formBanner, img: rd.result}); 
    }; rd.readAsDataURL(file); 
  };
  
  const add = async (col, d) => await addDoc(collection(db, col), d);
  const del = async (col, id) => confirm('Xóa?') && await deleteDoc(doc(db, col, id));
  const updatePrice = () => { const g = parseInt(formSP.giaGoc)||0, p = parseInt(formSP.phanTramGiam)||0; setFormSP(prev => ({...prev, giaBan: g > 0 ? Math.floor(g*(1-p/100)) : ''})); };
  useEffect(updatePrice, [formSP.giaGoc, formSP.phanTramGiam]);

  if (!isLoggedIn) return (
    <div className="admin-login-wrapper">
      <div className="admin-login-card shadow">
        <h3 className="text-center text-success fw-bold mb-4">ADMIN LOGIN</h3>
        <Form onSubmit={handleLogin}>
          <Form.Group className="mb-3">
            <Form.Control className="p-3" placeholder="Username" value={loginInput.user} onChange={e=>setLoginInput({...loginInput, user:e.target.value})}/>
          </Form.Group>
          <Form.Group className="mb-4">
            <InputGroup>
              <Form.Control className="p-3" type={showPass ? "text" : "password"} placeholder="Password" value={loginInput.pass} onChange={e=>setLoginInput({...loginInput, pass:e.target.value})}/>
              <Button variant="outline-secondary" onClick={()=>setShowPass(!showPass)}>
                <i className={showPass ? "fa-solid fa-eye-slash" : "fa-solid fa-eye"}></i>
              </Button>
            </InputGroup>
          </Form.Group>
          <Button type="submit" variant="success" className="w-100 py-3 fw-bold rounded-pill">ĐĂNG NHẬP</Button>
        </Form>
      </div>
    </div>
  );

  return (
    <div className="admin-main-container">
      <div className="admin-navbar"><h4>QUẢN TRỊ SHOP</h4><div className="d-flex align-items-center gap-3">{shopConfig.sdt && <span className="text-white small d-none d-md-block"><i className="fa-solid fa-phone me-1"></i> Hotline: {shopConfig.sdt}</span>}<Link to="/"><Button variant="danger" size="sm">Thoát</Button></Link></div></div>
      <Container fluid className="p-3">
        <Row className="mb-3 g-2"><Col xs={6} md={3}><div className="stats-box bg-primary"><h5>Hôm nay</h5><h3>{thongKe.dNgay.toLocaleString()} ¥</h3></div></Col><Col xs={6} md={3}><div className="stats-box bg-success"><h5>Tháng này</h5><h3>{thongKe.dThang.toLocaleString()} ¥</h3></div></Col><Col xs={6} md={3}><div className="stats-box bg-warning text-dark"><h5>Cả năm</h5><h3>{thongKe.dNam.toLocaleString()} ¥</h3></div></Col><Col xs={6} md={3}><div className="stats-box bg-info"><h5>Tổng đơn</h5><h3>{thongKe.tongDon} đơn</h3></div></Col></Row>

        <Tabs defaultActiveKey="config" className="bg-white p-2 rounded border shadow-sm mb-3">
          <Tab eventKey="config" title="⚙️ CẤU HÌNH">
            <div className="bg-white p-3"><Row>
              <Col md={4} className="text-center"><div className="border p-2 mb-2 d-flex align-items-center justify-content-center" style={{height:120}}><img src={shopConfig.logo} style={{maxHeight:'100%', maxWidth:'100%'}} alt="Logo"/></div><Form.Control type="file" size="sm" onChange={e=>handleUpload(e,'LOGO')}/></Col>
              <Col md={8}><Row className="g-2">
                <Col md={6}><Form.Control placeholder="Tên Shop" value={shopConfig.tenShop} onChange={e=>setShopConfig({...shopConfig, tenShop:e.target.value})}/></Col>
                <Col md={6}><Form.Control placeholder="Slogan" value={shopConfig.slogan} onChange={e=>setShopConfig({...shopConfig, slogan:e.target.value})}/></Col>
                <Col md={12}><Form.Control as="textarea" placeholder="Giới thiệu footer" rows={2} value={shopConfig.gioiThieu} onChange={e=>setShopConfig({...shopConfig, gioiThieu:e.target.value})}/></Col>
                <Col md={6}><Form.Control placeholder="Hotline" value={shopConfig.sdt} onChange={e=>setShopConfig({...shopConfig, sdt:e.target.value})}/></Col>
                <Col md={6}><Form.Control placeholder="Zalo" value={shopConfig.zalo} onChange={e=>setShopConfig({...shopConfig, zalo:e.target.value})}/></Col>
                <Col md={12}><Form.Control placeholder="Địa chỉ" value={shopConfig.diaChi} onChange={e=>setShopConfig({...shopConfig, diaChi:e.target.value})}/></Col>
                <Col md={6}><Form.Label className="small fw-bold text-danger">Kết thúc Flash Sale:</Form.Label><Form.Control type="datetime-local" value={shopConfig.flashSaleEnd} onChange={e=>setShopConfig({...shopConfig, flashSaleEnd:e.target.value})}/></Col>
                <Col md={6}><Form.Label className="small fw-bold">Tỷ lệ điểm (¥/1 điểm)</Form.Label><Form.Control type="number" value={shopConfig.tyLeDiem} onChange={e=>setShopConfig({...shopConfig, tyLeDiem:e.target.value})}/></Col>
                <Col md={12}><Form.Control placeholder="Link Facebook" value={shopConfig.linkFacebook} onChange={e=>setShopConfig({...shopConfig, linkFacebook:e.target.value})}/></Col>
                <Col md={12}><Button variant="success" className="w-100" onClick={async()=>{await setDoc(doc(db,"cauHinh","thongTinChung"),shopConfig); alert('Đã lưu!');}}>LƯU CẤU HÌNH</Button></Col>
              </Row></Col>
            </Row></div>
          </Tab>

          <Tab eventKey="banner" title="🖼️ BANNER">
            <div className="bg-white p-3"><div className="d-flex gap-2 mb-3"><Form.Control type="file" onChange={e=>handleUpload(e,'BANNER')}/><Form.Control placeholder="Link..." value={formBanner.link} onChange={e=>setFormBanner({...formBanner,link:e.target.value})}/><Button onClick={()=>{add('banners', formBanner); setFormBanner({img:'', link:''})}}>Thêm</Button></div>
            <div className="d-flex flex-wrap gap-2">{data.banners.map(b=><div key={b.id} className="position-relative" style={{width:200}}><img src={b.img} className="w-100 rounded"/><Button size="sm" variant="danger" className="position-absolute top-0 end-0" onClick={()=>del('banners', b.id)}>X</Button></div>)}</div></div>
          </Tab>

          <Tab eventKey="marketing" title="🎟️ SHIP & COUPON">
            <Row><Col md={6} className="border-end p-3"><h6 className="fw-bold text-success">MÃ GIẢM GIÁ</h6><div className="d-flex gap-1 mb-2"><Form.Control placeholder="Mã" value={formCoupon.code} onChange={e=>setFormCoupon({...formCoupon,code:e.target.value.toUpperCase()})}/><Form.Control type="number" placeholder="Giảm (¥)" value={formCoupon.giamGia} onChange={e=>setFormCoupon({...formCoupon,giamGia:e.target.value})}/><Button size="sm" onClick={()=>{add('coupons',formCoupon); setFormCoupon({code:'',giamGia:0})}}>Thêm</Button></div>
            <Table size="sm"><tbody>{data.coupons.map(c=><tr key={c.id}><td>{c.code}</td><td>{parseInt(c.giamGia).toLocaleString()}¥</td><td><Button size="sm" variant="danger" onClick={()=>del('coupons',c.id)}>X</Button></td></tr>)}</tbody></Table></Col>
            <Col md={6} className="p-3"><h6 className="fw-bold text-primary">PHÍ SHIP</h6><div className="d-flex gap-1 mb-2"><Form.Control placeholder="Khu vực" value={formShip.khuVuc} onChange={e=>setFormShip({...formShip,khuVuc:e.target.value})}/><Form.Control type="number" placeholder="Phí (¥)" value={formShip.phi} onChange={e=>setFormShip({...formShip,phi:e.target.value})}/><Button size="sm" onClick={()=>{add('shipping',formShip); setFormShip({khuVuc:'',phi:0})}}>Thêm</Button></div>
            <Table size="sm"><tbody>{data.ships.map(s=><tr key={s.id}><td>{s.khuVuc}</td><td>{parseInt(s.phi).toLocaleString()}¥</td><td><Button size="sm" variant="danger" onClick={()=>del('shipping',s.id)}>X</Button></td></tr>)}</tbody></Table></Col></Row>
          </Tab>

          <Tab eventKey="products" title="📦 SẢN PHẨM">
            <Button size="sm" className="mb-2 fw-bold" onClick={()=>{setEditData({...editData, sp:null}); setFormSP({ ten:'', giaGoc:'', phanTramGiam:0, giaBan:'', donVi:'Cái', moTa:'', anh:'', phanLoai:'', isMoi:false, isKhuyenMai:false, isBanChay:false, isFlashSale:false }); setModal({...modal, sp:true})}}>+ THÊM MỚI</Button>
            <div className="table-responsive"><Table hover bordered size="sm" className="align-middle">
              <thead className="bg-light"><tr><th>Ảnh</th><th>Tên</th><th>Giá</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
              <tbody>{dsSanPham.map(sp=><tr key={sp.id}><td><img src={sp.anh||NO_IMAGE} width="40"/></td><td className="fw-bold">{sp.ten}</td><td className="text-danger fw-bold">{sp.giaBan?.toLocaleString()}¥</td><td>{sp.isFlashSale && <Badge bg="warning" text="dark" className="me-1">Flash</Badge>}{sp.isMoi && <Badge bg="success" className="me-1">New</Badge>}{sp.isKhuyenMai && <Badge bg="secondary">Sale</Badge>}</td><td><Button size="sm" variant="warning" className="me-1" onClick={()=>{setEditData({...editData, sp}); setFormSP(sp); setModal({...modal, sp:true})}}>✏️</Button><Button size="sm" variant="danger" onClick={()=>{if(confirm('Xóa?')) handleUpdateDS_SP('DELETE',sp.id)}}>🗑️</Button></td></tr>)}</tbody>
            </Table></div>
          </Tab>

          <Tab eventKey="menu" title="📂 DANH MỤC">
            <Button size="sm" className="mb-2 fw-bold" onClick={()=>{setEditData({...editData, dm:null}); setFormDM({ten:'', icon:'', parent:'', order:''}); setModal({...modal, dm:true})}}>+ DANH MỤC</Button>
            <Table bordered size="sm"><tbody>{dsDanhMuc.sort((a,b)=>a.order-b.order).map(d=><tr key={d.id}><td>{d.order}</td><td>{d.parent?'↳ ':''}{d.ten}</td><td>{d.icon}</td><td><Button size="sm" variant="warning" className="me-1" onClick={()=>{setEditData({...editData, dm:d}); setFormDM(d); setModal({...modal, dm:true})}}>✏️</Button><Button size="sm" variant="danger" onClick={()=>handleUpdateDS_DM('DELETE',d.id)}>🗑️</Button></td></tr>)}</tbody></Table>
          </Tab>

          <Tab eventKey="orders" title={`📋 ĐƠN HÀNG (${dsDonHang.length})`}>
            <div className="table-responsive"><Table hover bordered size="sm" className="align-middle"><thead className="bg-light"><tr><th>Mã</th><th>Ngày</th><th>Khách</th><th>Tổng</th><th>TT</th><th>Xử lý</th></tr></thead><tbody>{dsDonHang.sort((a,b)=>b.ngayDat-a.ngayDat).map(dh=><tr key={dh.id}><td><span className="text-primary fw-bold">{dh.maDonHang||`#${dh.id.slice(0,5)}`}</span></td><td>{dh.ngayDat?.toDate?dh.ngayDat.toDate().toLocaleDateString('vi-VN'):''}</td><td><div className="fw-bold">{dh.khachHang?.ten}</div><small>{dh.khachHang?.sdt}</small></td><td className="text-danger fw-bold">{dh.tongTien?.toLocaleString()}¥</td><td><Badge bg={dh.trangThai==='Hoàn thành'?'success':'warning'}>{dh.trangThai}</Badge></td><td><Button size="sm" variant="info" className="me-1 text-white" onClick={()=>{setEditData({...editData, order:dh}); setModal({...modal, order:true})}}>Xem</Button><Button size="sm" variant="success" className="me-1" onClick={()=>handleUpdateStatusOrder(dh.id,'Hoàn thành')}>✔</Button><Button size="sm" variant="danger" onClick={()=>handleDeleteOrder(dh.id)}>✘</Button></td></tr>)}</tbody></Table></div>
          </Tab>

          <Tab eventKey="users" title="👥 USER & REVIEW">
            <Row><Col md={7}><div className="table-responsive"><Table size="sm"><thead><tr><th>Tên</th><th>Email</th><th>Điểm</th><th>Sửa</th></tr></thead><tbody>{data.users.map(u=><tr key={u.id}><td>{u.ten}</td><td>{u.email}</td><td>{u.diemTichLuy}</td><td><Button size="sm" onClick={()=>{setEditData({...editData, user:u}); setUserPoint(u.diemTichLuy); setModal({...modal, user:true})}}>Sửa</Button></td></tr>)}</tbody></Table></div></Col>
            <Col md={5}><div style={{maxHeight:400,overflowY:'auto'}}>{data.reviews.map(r=><div key={r.id} className="border p-2 mb-2 bg-light rounded"><div className="d-flex justify-content-between"><strong>{r.userName}</strong><small>{r.ngay?.toDate().toLocaleDateString()}</small></div><div className="text-warning">{'⭐'.repeat(r.rating)}</div><p className="mb-1 bg-white p-1 border">{r.comment}</p><Button size="sm" variant="danger" onClick={()=>del('reviews',r.id)}>Xóa</Button></div>)}</div></Col></Row>
          </Tab>
        </Tabs>
      </Container>

      {/* MODAL SP */}
      <Modal show={modal.sp} onHide={()=>setModal({...modal,sp:false})} size="lg" centered><Modal.Header closeButton><Modal.Title>{editData.sp?'Cập nhật':'Thêm mới'}</Modal.Title></Modal.Header><Modal.Body><Form><Row><Col md={8}><Form.Control className="mb-2" placeholder="Tên SP" value={formSP.ten} onChange={e=>setFormSP({...formSP,ten:e.target.value})}/><Form.Select className="mb-2" value={formSP.phanLoai} onChange={e=>setFormSP({...formSP,phanLoai:e.target.value})}><option value="">Danh mục</option>{dsDanhMuc.map(d=><option key={d.id} value={d.id}>{d.parent?'-- ':''}{d.ten}</option>)}</Form.Select><div className="d-flex gap-2 mb-2"><Form.Control type="number" placeholder="Giá gốc" value={formSP.giaGoc} onChange={e=>setFormSP({...formSP,giaGoc:e.target.value})}/><Form.Control type="number" placeholder="% Giảm" value={formSP.phanTramGiam} onChange={e=>setFormSP({...formSP,phanTramGiam:e.target.value})}/></div><Form.Control className="mb-2 bg-light fw-bold text-danger" readOnly value={formSP.giaBan}/><div className="d-flex flex-wrap gap-3 border p-2 rounded"><Form.Check type="switch" label="⚡ FLASH SALE" className="fw-bold text-warning" checked={formSP.isFlashSale} onChange={e=>setFormSP({...formSP,isFlashSale:e.target.checked})}/><Form.Check type="switch" label="New" checked={formSP.isMoi} onChange={e=>setFormSP({...formSP,isMoi:e.target.checked})}/><Form.Check type="switch" label="Hot" checked={formSP.isBanChay} onChange={e=>setFormSP({...formSP,isBanChay:e.target.checked})}/><Form.Check type="switch" label="Sale" checked={formSP.isKhuyenMai} onChange={e=>setFormSP({...formSP,isKhuyenMai:e.target.checked})}/></div></Col><Col md={4}><Form.Control type="file" onChange={e=>handleUpload(e,'PRODUCT')}/><img src={formSP.anh||NO_IMAGE} className="w-100 mt-2 border rounded"/></Col></Row><ReactQuill theme="snow" value={formSP.moTa} onChange={v=>setFormSP({...formSP,moTa:v})} className="mt-2"/></Form></Modal.Body><Modal.Footer><Button onClick={()=>handleUpdateDS_SP(editData.sp?'UPDATE':'ADD', formSP)}>Lưu</Button></Modal.Footer></Modal>
      {/* MODAL DM */}
      <Modal show={modal.dm} onHide={()=>setModal({...modal,dm:false})} centered><Modal.Header closeButton><Modal.Title>Danh mục</Modal.Title></Modal.Header><Modal.Body><Form.Control className="mb-2" placeholder="Tên" value={formDM.ten} onChange={e=>setFormDM({...formDM,ten:e.target.value})}/><Form.Control className="mb-2" type="number" placeholder="Thứ tự" value={formDM.order} onChange={e=>setFormDM({...formDM,order:e.target.value})}/><Form.Select className="mb-2" value={formDM.icon} onChange={e=>setFormDM({...formDM,icon:e.target.value})}><option>Icon</option>{ICON_LIST.map(i=><option key={i} value={i}>{i}</option>)}</Form.Select><Form.Select value={formDM.parent} onChange={e=>setFormDM({...formDM,parent:e.target.value})}><option value="">Gốc</option>{dsDanhMuc.filter(d=>!d.parent).map(d=><option key={d.id} value={d.customId||d.id}>{d.ten}</option>)}</Form.Select></Modal.Body><Modal.Footer><Button onClick={()=>handleUpdateDS_DM(editData.dm?'UPDATE':'ADD', formDM)}>Lưu</Button></Modal.Footer></Modal>
      {/* MODAL ORDER */}
      <Modal show={modal.order} onHide={()=>setModal({...modal,order:false})} size="lg" centered><Modal.Header closeButton><Modal.Title>Chi tiết đơn hàng</Modal.Title></Modal.Header><Modal.Body>{editData.order && (<div className="p-2"><p><strong>Mã:</strong> <span className="text-primary fw-bold">{editData.order.maDonHang || editData.order.id}</span></p><p><strong>Khách:</strong> {editData.order.khachHang?.ten} - {editData.order.khachHang?.sdt}</p><p><strong>ĐC:</strong> {editData.order.khachHang?.diachi}</p><Table bordered><thead><tr><th>SP</th><th>SL</th><th>Giá</th></tr></thead><tbody>{editData.order.gioHang?.map((i,x)=><tr key={x}><td>{i.ten}</td><td>{i.soLuong}</td><td>{i.giaBan}¥</td></tr>)}</tbody></Table><h4 className="text-end text-danger">{editData.order.tongTien?.toLocaleString()}¥</h4></div>)}</Modal.Body></Modal>
      {/* MODAL USER */}
      <Modal show={modal.user} onHide={()=>setModal({...modal,user:false})} centered><Modal.Header closeButton><Modal.Title>Sửa điểm</Modal.Title></Modal.Header><Modal.Body><Form.Control type="number" value={userPoint} onChange={e=>setUserPoint(e.target.value)}/></Modal.Body><Modal.Footer><Button onClick={async()=>{await updateDoc(doc(db,"users",editData.user.id),{diemTichLuy:parseInt(userPoint)}); setModal({...modal,user:false})}}>Lưu</Button></Modal.Footer></Modal>
    </div>
  );
}
export default Admin;