import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { db, auth } from './firebase'; 
import { collection, onSnapshot, doc, deleteDoc, updateDoc, addDoc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { Badge, Button, Form, Container, Navbar, Nav, Dropdown, Row, Col, Card } from 'react-bootstrap';
import { ToastContainer, toast } from 'react-toastify'; 
import Slider from "react-slick"; 
import 'react-toastify/dist/ReactToastify.css'; 
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";
import AOS from 'aos'; import 'aos/dist/aos.css';

import Home from './Home';
import ProductDetail from './ProductDetail';
import Cart from './Cart';
import Admin from './Admin';
import Auth from './Auth';
import Member from './Member';
import OrderLookup from './OrderLookup';
import FlashSale from './FlashSale'; 
import Checkout from './Checkout'; 

export const toSlug = (str) => {
  if (!str) return '';
  str = str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "");
  str = str.replace(/[đĐ]/g, 'd').replace(/([^0-9a-z-\s])/g, '').replace(/(\s+)/g, '-').replace(/-+/g, '-').replace(/^-+|-+$/g, '');
  return str;
};

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [dsSanPham, setDsSanPham] = useState([]);
  const [dsDanhMuc, setDsDanhMuc] = useState([]);
  const [dsDonHang, setDsDonHang] = useState([]);
  const [banners, setBanners] = useState([]); 
  const [gioHang, setGioHang] = useState(() => JSON.parse(localStorage.getItem('cart') || '[]'));
  const [tuKhoa, setTuKhoa] = useState('');
  const [shopConfig, setShopConfig] = useState({ tenShop: 'MaiVang Shop', slogan: '', logo: '', diaChi: '', sdt: '', openingHours: '', topBarText: '', flashSaleEnd: '' });
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null); 
  const [showTopBtn, setShowTopBtn] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [recentProducts, setRecentProducts] = useState([]); // State cho SP vừa xem

  useEffect(() => { AOS.init({ duration: 800, once: false, offset: 50 }); }, []);
  useEffect(() => { window.scrollTo(0, 0); }, [location]);

  // LOAD DỮ LIỆU
  useEffect(() => {
    const unsubSP = onSnapshot(collection(db, "sanPham"), sn => setDsSanPham(sn.docs.map(d=>({id:d.id,...d.data()}))));
    const unsubDM = onSnapshot(collection(db, "danhMuc"), sn => { const d=sn.docs.map(x=>({id:x.id,...x.data()})); d.sort((a,b)=>parseFloat(a.order||0)-parseFloat(b.order||0)); setDsDanhMuc(d); });
    const unsubConfig = onSnapshot(doc(db, "cauHinh", "thongTinChung"), d => d.exists() && setShopConfig(d.data()));
    const unsubAuth = onAuthStateChanged(auth, async u => { setCurrentUser(u); if(u) { const d = await getDoc(doc(db,"users",u.uid)); setUserData(d.exists()?d.data():{}); } });
    onSnapshot(collection(db, "banners"), sn => setBanners(sn.docs.map(d=>({id:d.id,...d.data()}))));
    
    // Load SP vừa xem từ LocalStorage
    const recentIds = JSON.parse(localStorage.getItem('recent') || '[]');
    // Cần đợi dsSanPham load xong mới map được, tạm thời check length > 0
    return () => { unsubSP(); unsubDM(); unsubConfig(); unsubAuth(); };
  }, []);

  // Cập nhật Recent Products khi dsSanPham thay đổi
  useEffect(() => {
    if(dsSanPham.length > 0) {
      const recentIds = JSON.parse(localStorage.getItem('recent') || '[]');
      const found = recentIds.map(id => dsSanPham.find(p => p.id === id)).filter(Boolean);
      setRecentProducts(found);
    }
  }, [dsSanPham, location.pathname]); // Update khi chuyển trang

  useEffect(() => localStorage.setItem('cart', JSON.stringify(gioHang)), [gioHang]);

  const themVaoGio = (sp) => { 
    const check = gioHang.find(i => i.id === sp.id); 
    if (check) setGioHang(gioHang.map(i => i.id === sp.id ? {...i, soLuong: i.soLuong + 1} : i)); 
    else setGioHang([...gioHang, {...sp, soLuong: 1}]); 
    toast.success(`Đã thêm "${sp.ten}" vào giỏ!`); 
  };
  const chinhSuaSoLuong = (id, type) => setGioHang(gioHang.map(i => i.id===id ? {...i, soLuong: type==='tang'?i.soLuong+1:Math.max(1,i.soLuong-1)} : i));
  const xoaSanPham = (id) => setGioHang(gioHang.filter(i=>i.id!==id));
  const handleLogout = async () => { await signOut(auth); setUserData(null); navigate('/'); };

  const sanPhamHienThi = dsSanPham.filter(sp => sp.ten?.toLowerCase().includes(tuKhoa.toLowerCase()));
  const isAdminPage = location.pathname.startsWith('/admin');
  const sliderSettings = { dots: true, infinite: true, speed: 500, slidesToShow: 1, autoplay: true };

  return (
    <div className="app-container d-flex flex-column min-vh-100">
      <ToastContainer autoClose={2000} />
      {!isAdminPage && (
        <>
          <div className="top-bar-notification"><div className="marquee-text"><span className="me-5">{shopConfig.topBarText}</span>{shopConfig.openingHours && <span><i className="fa-regular fa-clock"></i> Mở cửa: {shopConfig.openingHours}</span>}</div></div>
          <Navbar bg="white" expand="lg" className="sticky-top shadow-sm py-2 border-bottom">
            <Container>
              <Navbar.Brand as={Link} to="/"><img src={shopConfig.logo} className="me-2 rounded" style={{height:45}} alt=""/><span className="fw-bold text-success fs-5">{shopConfig.tenShop}</span></Navbar.Brand>
              <Navbar.Toggle />
              <Navbar.Collapse>
                <Nav className="w-100 align-items-center ms-lg-4">
                  <Form className="d-flex flex-grow-1 mx-lg-3"><Form.Control type="search" placeholder="🔍 Tìm kiếm..." value={tuKhoa} onChange={e=>setTuKhoa(e.target.value)} className="rounded-pill border-1 bg-light px-3"/></Form>
                  <Link to="/cart" className="btn btn-success rounded-pill fw-bold ms-2"><i className="fa-solid fa-cart-shopping"></i> <Badge bg="warning" text="dark" pill>{gioHang.reduce((a,b)=>a+b.soLuong,0)}</Badge></Link>
                  {currentUser ? <Dropdown className="ms-2"><Dropdown.Toggle variant="light" className="border-0 fw-bold"><i className="fa-solid fa-user me-1"></i> {userData?.ten}</Dropdown.Toggle><Dropdown.Menu><Dropdown.Item as={Link} to="/member">Tài khoản</Dropdown.Item><Dropdown.Item onClick={handleLogout}>Đăng xuất</Dropdown.Item></Dropdown.Menu></Dropdown> : <Link to="/auth" className="btn btn-outline-primary rounded-pill ms-2 fw-bold">Đăng nhập</Link>}
                </Nav>
              </Navbar.Collapse>
            </Container>
          </Navbar>
        </>
      )}

      <div className="flex-grow-1 py-3" style={{background: '#f4f6f9'}}>
        <Container fluid>
          <Row>
            {/* --- MENU BÊN TRÁI (HIỂN THỊ MỌI TRANG TRỪ ADMIN) --- */}
            {!isAdminPage && (
              <Col lg={2} className="d-none d-lg-block">
                <div className="sidebar-main">
                  <div className="sidebar-header"><i className="fa-solid fa-bars"></i> DANH MỤC</div>
                  
                  {/* NÚT FLASH SALE CỐ ĐỊNH TRONG MENU */}
                  {shopConfig.flashSaleEnd && new Date(shopConfig.flashSaleEnd) > new Date() && (
                    <Link to="/flash-sale" className="flash-sale-mini-banner m-2 text-decoration-none">
                      <div className="fw-bold"><i className="fa-solid fa-bolt fa-shake"></i> FLASH SALE</div>
                      <Badge bg="white" text="danger">Đang diễn ra</Badge>
                    </Link>
                  )}

                  <div className="category-list">
                    {dsDanhMuc.filter(d => !d.parent).map(parent => {
                      const hasChild = dsDanhMuc.some(c => c.parent === parent.id);
                      return (
                        <div key={parent.id}>
                          <div className="category-item">
                            <Link to={`/danh-muc/${toSlug(parent.ten)}/${parent.id}`} className="flex-grow-1 d-flex align-items-center"><span className="me-2">{parent.icon}</span> {parent.ten}</Link>
                            {hasChild && <span onClick={()=>setOpenMenuId(openMenuId===parent.id?null:parent.id)} style={{cursor:'pointer'}}>{openMenuId===parent.id?'▲':'▼'}</span>}
                          </div>
                          {hasChild && openMenuId===parent.id && <div className="submenu">{dsDanhMuc.filter(c=>c.parent===parent.id).map(child=><Link key={child.id} to={`/danh-muc/${toSlug(child.ten)}/${child.id}`}>• {child.ten}</Link>)}</div>}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </Col>
            )}

            {/* --- NỘI DUNG CHÍNH --- */}
            <Col lg={!isAdminPage ? 10 : 12}>
              {!isAdminPage && banners.length > 0 && location.pathname === '/' && <div className="mb-3 rounded overflow-hidden shadow-sm"><Slider {...sliderSettings}>{banners.map(b=><Link key={b.id} to={b.link||'#'}><img src={b.img} className="w-100" style={{height:300, objectFit:'cover'}}/></Link>)}</Slider></div>}
              
              <Routes>
                <Route path="/" element={<Home dsSanPham={sanPhamHienThi} themVaoGio={themVaoGio} shopConfig={shopConfig} />} />
                <Route path="/danh-muc/:slug/:id" element={<Home dsSanPham={sanPhamHienThi} themVaoGio={themVaoGio} shopConfig={shopConfig} />} />
                <Route path="/san-pham/:slug/:id" element={<ProductDetail dsSanPham={dsSanPham} themVaoGio={themVaoGio} />} />
                <Route path="/cart" element={<Cart gioHang={gioHang} chinhSuaSoLuong={chinhSuaSoLuong} xoaSanPham={xoaSanPham} currentUser={currentUser} userData={userData} />} />
                <Route path="/checkout" element={<Checkout gioHang={gioHang} setGioHang={setGioHang} userData={userData} />} />
                <Route path="/member" element={<Member themVaoGio={themVaoGio} />} />
                <Route path="/tra-cuu" element={<OrderLookup />} />
                <Route path="/flash-sale" element={<FlashSale dsSanPham={dsSanPham} themVaoGio={themVaoGio} shopConfig={shopConfig} />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/admin" element={<Admin dsSanPham={dsSanPham} dsDanhMuc={dsDanhMuc} dsDonHang={dsDonHang} handleUpdateDS_SP={async (t,d)=>t==='ADD'?addDoc(collection(db,"sanPham"),d):t==='DELETE'?deleteDoc(doc(db,"sanPham",d)):updateDoc(doc(db,"sanPham",d.id),d)} handleUpdateDS_DM={async (t,d)=>t==='ADD'?addDoc(collection(db,"danhMuc"),d):t==='DELETE'?deleteDoc(doc(db,"danhMuc",d)):updateDoc(doc(db,"danhMuc",d.id),d)} handleUpdateStatusOrder={(id,s)=>updateDoc(doc(db,"donHang",id),{trangThai:s})} handleDeleteOrder={(id)=>deleteDoc(doc(db,"donHang",id))} />} />
              </Routes>
            </Col>
          </Row>
        </Container>
      </div>

      {/* --- SẢN PHẨM VỪA XEM (TOÀN TRANG) --- */}
      {!isAdminPage && recentProducts.length > 0 && (
        <div className="recent-view-bar">
          <Container>
            <h5 className="fw-bold text-secondary mb-3"><i className="fa-solid fa-clock-rotate-left me-2"></i> SẢN PHẨM BẠN VỪA XEM</h5>
            <div className="recent-scroll">
              {recentProducts.map(sp => (
                <div key={sp.id} className="recent-card bg-white">
                  <Link to={`/san-pham/${toSlug(sp.ten)}/${sp.id}`}>
                    <img src={sp.anh} style={{width:'100%', height:100, objectFit:'cover'}} />
                    <div className="p-2 text-center" style={{fontSize:12}}>
                      <div className="fw-bold text-truncate">{sp.ten}</div>
                      <div className="text-danger fw-bold">{sp.giaBan?.toLocaleString()}¥</div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </Container>
        </div>
      )}

      {!isAdminPage && (
        <footer className="footer-section pt-5 pb-3">
          <Container><Row><Col md={4}><h5 className="footer-title">{shopConfig.tenShop}</h5><p>{shopConfig.gioiThieu}</p></Col><Col md={4}><h5 className="footer-title">Liên hệ</h5><p>🏠 {shopConfig.diaChi}</p><p>☎️ {shopConfig.sdt}</p></Col><Col md={4}><h5 className="footer-title">Hỗ trợ</h5><p>Chính sách đổi trả</p><p>Hướng dẫn mua hàng</p></Col></Row><div className="text-center mt-4 pt-3 border-top">{shopConfig.copyright}</div></Container>
        </footer>
      )}
    </div>
  );
}
export default App;