import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { db, auth } from './firebase'; 
import { collection, onSnapshot, doc, deleteDoc, updateDoc, addDoc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { Badge, Button, Form, Container, Navbar, Nav, Dropdown, Row, Col } from 'react-bootstrap';
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
  
  const [shopConfig, setShopConfig] = useState({ 
    tenShop: 'MaiVang Shop', slogan: '', logo: '', diaChi: '', sdt: '', zalo: '', linkFacebook: '', copyright: '', tyLeDiem: 1000, gioiThieu: '', flashSaleEnd: '',
    topBarText: '🚀 Nhận giao hàng miễn phí trong bán kính 5km!', openingHours: '' 
  });
  
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null); 
  const [showTopBtn, setShowTopBtn] = useState(false);

  useEffect(() => { AOS.init({ duration: 800, once: false, offset: 50 }); }, []);
  useEffect(() => { window.scrollTo(0, 0); }, [location]);

  useEffect(() => {
    const unsubSP = onSnapshot(collection(db, "sanPham"), (sn) => setDsSanPham(sn.docs.map(d => ({id: d.id, ...d.data()}))));
    const unsubDM = onSnapshot(collection(db, "danhMuc"), (sn) => { const data = sn.docs.map(d => ({id: d.id, ...d.data()})); data.sort((a, b) => parseFloat(a.order || 0) - parseFloat(b.order || 0)); setDsDanhMuc(data); });
    const unsubDH = onSnapshot(collection(db, "donHang"), (sn) => setDsDonHang(sn.docs.map(d => ({id: d.id, ...d.data()}))));
    const unsubBanner = onSnapshot(collection(db, "banners"), (sn) => setBanners(sn.docs.map(d => ({id: d.id, ...d.data()}))));
    const unsubConfig = onSnapshot(doc(db, "cauHinh", "thongTinChung"), (doc) => { if (doc.exists()) setShopConfig(doc.data()); });
    const unsubAuth = onAuthStateChanged(auth, async (user) => { setCurrentUser(user); if (user) { const userDoc = await getDoc(doc(db, "users", user.uid)); if (userDoc.exists()) setUserData(userDoc.data()); else setUserData({ diemTichLuy: 0, ten: user.displayName || user.email }); } else { setUserData(null); } });
    const handleScroll = () => setShowTopBtn(window.scrollY > 300);
    window.addEventListener('scroll', handleScroll);
    return () => { unsubSP(); unsubDM(); unsubDH(); unsubBanner(); unsubConfig(); unsubAuth(); window.removeEventListener('scroll', handleScroll); };
  }, []);

  useEffect(() => localStorage.setItem('cart', JSON.stringify(gioHang)), [gioHang]);

  const themVaoGio = (sp) => { const check = gioHang.find(i => i.id === sp.id); if (check) setGioHang(gioHang.map(i => i.id === sp.id ? {...i, soLuong: i.soLuong + 1} : i)); else setGioHang([...gioHang, {...sp, soLuong: 1}]); toast.success(`Đã thêm "${sp.ten}" vào giỏ!`); };
  const chinhSuaSoLuong = (id, kieu) => { setGioHang(gioHang.map(i => i.id === id ? {...i, soLuong: kieu === 'tang' ? i.soLuong + 1 : Math.max(1, i.soLuong - 1)} : i)); };
  const xoaSanPham = (id) => { setGioHang(gioHang.filter(i => i.id !== id)); toast.warning("Đã xóa sản phẩm khỏi giỏ."); };
  const handleLogout = async () => { await signOut(auth); setUserData(null); navigate('/'); toast.info("Đã đăng xuất."); };
  const handleDatHang = async (khach) => { 
    const tongTien = gioHang.reduce((t, s) => t + (s.giaBan || s.giaGoc) * s.soLuong, 0); 
    if (currentUser && userData) { 
      const tyLe = parseInt(shopConfig.tyLeDiem) || 1000; 
      const diemCong = Math.floor(tongTien / tyLe); 
      await updateDoc(doc(db, "users", currentUser.uid), { diemTichLuy: (userData.diemTichLuy || 0) + diemCong }); 
      setUserData({ ...userData, diemTichLuy: (userData.diemTichLuy || 0) + diemCong }); 
      toast.info(`Bạn được cộng ${diemCong} điểm tích lũy!`); 
    } 
    await addDoc(collection(db, "donHang"), { 
      maDonHang: 'MV-'+Math.floor(100000+Math.random()*900000), 
      khachHang: khach, 
      gioHang, 
      tongTien, 
      trangThai: 'Mới đặt', 
      ngayDat: serverTimestamp(), 
      userId: currentUser ? currentUser.uid : null 
    }); 
    setGioHang([]); 
    toast.success("Đặt hàng thành công!"); 
    navigate('/'); 
  };

  const sanPhamHienThi = dsSanPham.filter(sp => sp.ten?.toLowerCase().includes(tuKhoa.toLowerCase()));
  const isAdminPage = location.pathname.startsWith('/admin');
  const sliderSettings = { dots: true, infinite: true, speed: 500, slidesToShow: 1, slidesToScroll: 1, autoplay: true, autoplaySpeed: 3000, arrows: true };

  return (
    <div className="app-container d-flex flex-column min-vh-100">
      <ToastContainer />
      <div className={`back-to-top ${showTopBtn ? 'visible' : ''}`} onClick={() => window.scrollTo({top:0, behavior:'smooth'})}><i className="fa-solid fa-arrow-up"></i></div>

      {!isAdminPage && (
        <>
          {/* HEADER CHẠY CHỮ + GIỜ MỞ CỬA */}
          <div className="top-bar-notification d-flex justify-content-center align-items-center">
            <div className="marquee-text">
              {shopConfig.topBarText || "Chào mừng đến với cửa hàng!"}
              {shopConfig.openingHours && <span className="ms-4"><i className="fa-regular fa-clock"></i> Mở cửa: {shopConfig.openingHours}</span>}
            </div>
          </div>

          <Navbar bg="white" variant="light" expand="lg" className="sticky-top shadow-sm py-2 border-bottom">
            <Container>
              <Navbar.Brand as={Link} to="/">{shopConfig.logo ? <img src={shopConfig.logo} alt="Logo" className="me-2 rounded shop-logo" /> : <span className="fs-2 me-2">🦁</span>}<div className="d-flex flex-column"><span className="fw-bold text-success text-uppercase" style={{fontSize: '1.1rem'}}>{shopConfig.tenShop}</span><span className="text-warning small fw-bold" style={{fontSize: '0.7rem'}}>⭐ {shopConfig.slogan} ⭐</span></div></Navbar.Brand>
              <Navbar.Toggle aria-controls="basic-navbar-nav" />
              <Navbar.Collapse id="basic-navbar-nav">
                <Nav className="w-100 d-flex justify-content-between align-items-center ms-lg-4 mt-3 mt-lg-0">
                  <Form className="d-flex flex-grow-1 mx-lg-3"><Form.Control type="search" placeholder="🔍 Tìm kiếm..." className="rounded-start border-1 bg-light px-3 py-2" value={tuKhoa} onChange={(e) => setTuKhoa(e.target.value)} /><Button variant="success" className="rounded-end px-3"><i className="fa-solid fa-magnifying-glass"></i></Button></Form>
                  {shopConfig.sdt && (<div className="d-none d-lg-block ms-3 me-3" style={{minWidth: 'fit-content'}}><div className="d-flex align-items-center border rounded-pill px-3 py-1 bg-light"><i className="fa-solid fa-phone-volume fa-shake text-danger fs-5 me-2"></i><div className="lh-1"><span className="d-block text-muted" style={{fontSize:'10px', textTransform:'uppercase', fontWeight:'bold'}}>Hotline</span><span className="fw-bold text-danger" style={{fontSize:'1.1rem'}}>{shopConfig.sdt}</span></div></div></div>)}
                  <div className="d-flex align-items-center gap-2">
                    <Link to="/tra-cuu" className="text-decoration-none"><Button variant="outline-info" size="sm" className="rounded-pill fw-bold text-nowrap me-2"><i className="fa-solid fa-truck-fast"></i> Tra đơn</Button></Link>
                    {currentUser ? (<Dropdown align="end"><Dropdown.Toggle variant="light" className="d-flex align-items-center gap-2 border-0 bg-transparent"><div className="text-end lh-1"><div className="fw-bold small">{userData?.ten || 'Thành viên'}</div><div className="text-warning small fw-bold" style={{fontSize:'0.7rem'}}>💎 {userData?.diemTichLuy || 0} điểm</div></div><i className="fa-solid fa-circle-user fs-4 text-secondary"></i></Dropdown.Toggle><Dropdown.Menu><Dropdown.Item as={Link} to="/member">Quản lý tài khoản</Dropdown.Item><Dropdown.Item onClick={handleLogout}>Đăng xuất</Dropdown.Item></Dropdown.Menu></Dropdown>) : ( <Link to="/auth" className="text-decoration-none"><Button variant="outline-primary" size="sm" className="rounded-pill fw-bold text-nowrap"><i className="fa-regular fa-user me-1"></i> Đăng nhập</Button></Link> )}
                    <Link to="/cart" className="text-decoration-none"><Button variant="success" className="rounded-pill fw-bold px-3 py-2 d-flex align-items-center gap-2 shadow-sm text-nowrap"><i className="fa-solid fa-cart-shopping"></i> <Badge bg="warning" text="dark" pill>{gioHang.reduce((acc, item) => acc + item.soLuong, 0)}</Badge></Button></Link>
                  </div>
                </Nav>
              </Navbar.Collapse>
            </Container>
          </Navbar>

          {banners.length > 0 && (<div className="banner-global-container"><Slider {...sliderSettings}>{banners.map(b => (<div key={b.id}>{b.link ? (<Link to={b.link}><img src={b.img} alt="Banner" className="banner-img" /></Link>) : (<img src={b.img} alt="Banner" className="banner-img" />)}</div>))}</Slider></div>)}
        </>
      )}

      <div className="flex-grow-1">
        <Routes>
          <Route path="/" element={<Home dsSanPham={sanPhamHienThi} dsDanhMuc={dsDanhMuc} themVaoGio={themVaoGio} shopConfig={shopConfig} />} />
          <Route path="/san-pham/:slug/:id" element={<ProductDetail dsSanPham={dsSanPham} dsDanhMuc={dsDanhMuc} themVaoGio={themVaoGio} />} />
          <Route path="/danh-muc/:slug/:id" element={<Home dsSanPham={sanPhamHienThi} dsDanhMuc={dsDanhMuc} themVaoGio={themVaoGio} shopConfig={shopConfig} />} />
          <Route path="/cart" element={<Cart gioHang={gioHang} dsDanhMuc={dsDanhMuc} handleDatHang={handleDatHang} chinhSuaSoLuong={chinhSuaSoLuong} xoaSanPham={xoaSanPham} currentUser={currentUser} userData={userData} />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/member" element={<Member />} />
          <Route path="/tra-cuu" element={<OrderLookup />} />
          <Route path="/flash-sale" element={<FlashSale dsSanPham={dsSanPham} themVaoGio={themVaoGio} shopConfig={shopConfig} />} />
          <Route path="/admin" element={
            <Admin 
              dsSanPham={dsSanPham} 
              dsDanhMuc={dsDanhMuc} 
              dsDonHang={dsDonHang} 
              handleUpdateDS_SP={async (t, d) => t==='DELETE'?await deleteDoc(doc(db,"sanPham",d)):(t==='ADD'?await addDoc(collection(db,"sanPham"),d):await updateDoc(doc(db,"sanPham",d.id),d))} 
              handleUpdateDS_DM={async (t, d) => t==='DELETE'?await deleteDoc(doc(db,"danhMuc",d)):(t==='ADD'?await addDoc(collection(db,"danhMuc"),d):await updateDoc(doc(db,"danhMuc",d.id),d))} 
              handleUpdateStatusOrder={async (id, s) => await updateDoc(doc(db,"donHang",id),{trangThai:s})} 
              handleDeleteOrder={async (id) => await deleteDoc(doc(db,"donHang",id))} 
            />
          } />
        </Routes>
      </div>

      {!isAdminPage && (
        <footer className="footer-section pt-5 mt-4">
           <Container>
            <Row className="pb-4">
              <Col md={4} className="mb-4"><div className="d-flex align-items-center mb-3"><span className="fw-bold text-success fs-5 text-uppercase">{shopConfig.tenShop}</span></div><p className="text-muted small" style={{textAlign: 'justify'}}>{shopConfig.gioiThieu || 'Chuyên cung cấp thực phẩm tươi ngon...'}</p></Col>
              <Col md={4} className="mb-4"><div className="footer-title">Thông tin liên hệ</div><div className="footer-info-item"><i className="fa-solid fa-location-dot mt-1 text-success"></i> <span>{shopConfig.diaChi}</span></div><div className="footer-info-item"><i className="fa-solid fa-phone mt-1 text-success"></i> <span>{shopConfig.sdt}</span></div><div className="footer-info-item"><i className="fa-brands fa-facebook mt-1 text-success"></i> <a href={shopConfig.linkFacebook} target="_blank" rel="noreferrer" className="text-dark">Fanpage Facebook</a></div></Col>
              <Col md={4} className="mb-4"><div className="footer-title">Hỗ trợ khách hàng</div><div className="footer-info-item"><i className="fa-solid fa-check text-success"></i> Hướng dẫn mua hàng</div><div className="footer-info-item"><i className="fa-solid fa-check text-success"></i> Chính sách đổi trả</div>{shopConfig.zalo && <div className="footer-info-item"><i className="fa-solid fa-comment-dots text-primary"></i> Zalo: {shopConfig.zalo}</div>}</Col>
            </Row>
          </Container>
          <div className="copyright-bar">{shopConfig.copyright}</div>
        </footer>
      )}
      {!isAdminPage && (<div className="floating-chat-container">{shopConfig.linkFacebook && (<a href={shopConfig.linkFacebook} target="_blank" rel="noreferrer" className="chat-btn mess-btn"><i className="fa-brands fa-facebook-messenger"></i></a>)}{shopConfig.zalo && (<a href={`https://zalo.me/${shopConfig.zalo}`} target="_blank" rel="noreferrer" className="chat-btn zalo-btn"><i className="fa-solid fa-comment-dots"></i></a>)}</div>)}
    </div>
  );
}
export default App;