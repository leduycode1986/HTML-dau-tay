import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { db, auth } from './firebase'; 
import { collection, onSnapshot, doc, deleteDoc, updateDoc, addDoc, getDoc } from 'firebase/firestore';
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
import Checkout from './Checkout'; 
import { toSlug } from './utils';

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
    tenShop: 'MaiVang Shop', slogan: '', logo: '', diaChi: '', sdt: '', openingHours: '', topBarText: '', flashSaleEnd: '' 
  });
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null); 
  const [showTopBtn, setShowTopBtn] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [recentProducts, setRecentProducts] = useState([]);

  useEffect(() => { AOS.init({ duration: 800, once: false }); }, []);
  useEffect(() => { window.scrollTo(0, 0); }, [location]);

  useEffect(() => {
    const unsubSP = onSnapshot(collection(db, "sanPham"), sn => setDsSanPham(sn.docs.map(d=>({id:d.id,...d.data()}))));
    const unsubDM = onSnapshot(collection(db, "danhMuc"), sn => { const d=sn.docs.map(x=>({id:x.id,...x.data()})); d.sort((a,b)=>parseFloat(a.order||0)-parseFloat(b.order||0)); setDsDanhMuc(d); });
    const unsubDH = onSnapshot(collection(db, "donHang"), sn => setDsDonHang(sn.docs.map(d=>({id:d.id,...d.data()}))));
    const unsubBanner = onSnapshot(collection(db, "banners"), sn => setBanners(sn.docs.map(d=>({id:d.id,...d.data()}))));
    const unsubConfig = onSnapshot(doc(db, "cauHinh", "thongTinChung"), d => { if(d.exists()) setShopConfig(d.data()); });
    const unsubAuth = onAuthStateChanged(auth, async u => { setCurrentUser(u); if(u) { const d = await getDoc(doc(db,"users",u.uid)); setUserData(d.exists()?d.data():{}); } else setUserData(null); });
    
    const scrollH = () => setShowTopBtn(window.scrollY > 300); window.addEventListener('scroll', scrollH);
    return () => { unsubSP(); unsubDM(); unsubDH(); unsubBanner(); unsubConfig(); unsubAuth(); window.removeEventListener('scroll', scrollH); };
  }, []);

  useEffect(() => {
    if(dsSanPham.length > 0) {
      const recentIds = JSON.parse(localStorage.getItem('recent') || '[]');
      const found = recentIds.map(id => dsSanPham.find(p => p.id === id)).filter(Boolean);
      setRecentProducts(found);
    }
  }, [dsSanPham, location.pathname]);

  useEffect(() => localStorage.setItem('cart', JSON.stringify(gioHang)), [gioHang]);

  const themVaoGio = (sp) => { 
    if(sp.soLuong <= 0) return toast.error("Hết hàng!");
    const check = gioHang.find(i => i.id === sp.id); 
    if (check) setGioHang(gioHang.map(i => i.id === sp.id ? {...i, soLuong: i.soLuong + 1} : i)); 
    else setGioHang([...gioHang, {...sp, soLuong: 1}]); 
    toast.success(`Đã thêm "${sp.ten}"!`); 
  };
  const chinhSuaSoLuong = (id, type) => setGioHang(gioHang.map(i => i.id===id ? {...i, soLuong: type==='tang'?i.soLuong+1:Math.max(1,i.soLuong-1)} : i));
  const xoaSanPham = (id) => setGioHang(gioHang.filter(i=>i.id!==id));
  const handleLogout = async () => { await signOut(auth); navigate('/'); };

  const sanPhamHienThi = dsSanPham.filter(sp => sp.ten?.toLowerCase().includes(tuKhoa.toLowerCase()));
  const isAdminPage = location.pathname.startsWith('/admin');
  const sliderSettings = { dots: true, infinite: true, speed: 500, slidesToShow: 1, slidesToScroll: 1, autoplay: true };

  return (
    <div className="app-container d-flex flex-column min-vh-100">
      <ToastContainer autoClose={2000} />
      <div className={`back-to-top ${showTopBtn ? 'visible' : ''}`} onClick={() => window.scrollTo({top:0, behavior:'smooth'})}><i className="fa-solid fa-arrow-up"></i></div>

      {!isAdminPage && (
        <>
          <div className="top-bar-notification"><div className="marquee-text"><span className="me-5">{shopConfig.topBarText}</span>{shopConfig.openingHours && <span><i className="fa-regular fa-clock"></i> Mở cửa: {shopConfig.openingHours}</span>}</div></div>
          
          <Navbar bg="white" expand="lg" className="sticky-top shadow-sm py-2" style={{zIndex: 100}}>
            <Container>
              {/* --- HEADER LOGO CHUẨN --- */}
              <Navbar.Brand as={Link} to="/" className="me-4 text-decoration-none">
                <div className="brand-group">
                  {shopConfig.logo ? <img src={shopConfig.logo} alt="Logo" className="brand-logo-img" /> : <span className="fs-1">🦁</span>}
                  <div className="brand-info">
                    <h1 className="shop-name">{shopConfig.tenShop}</h1>
                    <span className="shop-slogan">{shopConfig.slogan}</span>
                  </div>
                </div>
              </Navbar.Brand>

              <Navbar.Toggle />
              <Navbar.Collapse>
                <Form className="d-flex flex-grow-1 mx-lg-4 my-2 my-lg-0" onSubmit={e=>e.preventDefault()}>
                  <div className="input-group">
                    <Form.Control type="search" placeholder="Bạn tìm gì...?" value={tuKhoa} onChange={e=>setTuKhoa(e.target.value)} className="border-end-0 bg-light" />
                    <Button variant="light" className="border border-start-0 bg-light"><i className="fa-solid fa-magnifying-glass text-muted"></i></Button>
                  </div>
                </Form>
                <Nav className="align-items-center gap-3">
                  {/* --- HOTLINE CHUẨN --- */}
                  <div className="header-hotline-box d-none d-lg-flex">
                    <span className="hotline-label">Tổng đài hỗ trợ</span>
                    <span className="hotline-number">{shopConfig.sdt}</span>
                  </div>

                  <Link to="/tra-cuu" className="btn btn-outline-secondary rounded-pill btn-sm fw-bold">Tra đơn</Link>
                  <Link to="/cart" className="btn btn-success rounded-pill position-relative fw-bold px-3">
                    Giỏ <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">{gioHang.reduce((a,b)=>a+b.soLuong,0)}</span>
                  </Link>
                  {currentUser ? (
                    <Dropdown align="end">
                      <Dropdown.Toggle variant="light" className="border-0 fw-bold"><i className="fa-solid fa-circle-user fs-4 text-secondary"></i></Dropdown.Toggle>
                      <Dropdown.Menu>
                        <Dropdown.Item as={Link} to="/member">Tài khoản</Dropdown.Item>
                        <Dropdown.Item onClick={handleLogout} className="text-danger">Đăng xuất</Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                  ) : <Link to="/auth" className="fw-bold text-dark ms-2">Đăng nhập</Link>}
                </Nav>
              </Navbar.Collapse>
            </Container>
          </Navbar>
        </>
      )}

      <div className="flex-grow-1 py-3" style={{background: '#f4f6f9'}}>
        <Container>
          <Row>
            {!isAdminPage && (
              <Col lg={3} className="d-none d-lg-block mb-4">
                <div className="sidebar-main">
                  <div className="sidebar-header"><i className="fa-solid fa-bars me-2"></i> DANH MỤC</div>
                  {shopConfig.flashSaleEnd && new Date(shopConfig.flashSaleEnd) > new Date() && <Link to="/flash-sale" className="d-block p-2 bg-danger text-white fw-bold text-center text-decoration-none">⚡ FLASH SALE ĐANG DIỄN RA</Link>}
                  <div className="category-list">
                    {dsDanhMuc.filter(d => !d.parent).map(parent => {
                      const hasChild = dsDanhMuc.some(c => c.parent === parent.id);
                      const isOpen = openMenuId === parent.id;
                      return (
                        <div key={parent.id}>
                          <div className={`category-item ${location.pathname.includes(parent.slug || toSlug(parent.ten)) ? 'active' : ''}`} onClick={() => { if(hasChild) setOpenMenuId(isOpen ? null : parent.id); else navigate(`/danh-muc/${parent.slug || toSlug(parent.ten)}`); }}>
                            <span>{parent.icon} {parent.ten}</span>
                            {hasChild && <i className={`fa-solid fa-chevron-${isOpen?'down':'right'} small`}></i>}
                          </div>
                          {hasChild && isOpen && <div className="submenu">{dsDanhMuc.filter(c=>c.parent===parent.id).map(child=><Link key={child.id} to={`/danh-muc/${child.slug || toSlug(child.ten)}`}>{child.ten}</Link>)}</div>}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </Col>
            )}

            <Col lg={!isAdminPage ? 9 : 12}>
              {!isAdminPage && location.pathname === '/' && banners.length > 0 && <div className="mb-4 rounded overflow-hidden shadow-sm"><Slider {...sliderSettings}>{banners.map(b=><Link key={b.id} to={b.link||'#'}><img src={b.img} className="w-100" style={{height:320, objectFit:'cover'}}/></Link>)}</Slider></div>}
              
              <Routes>
                <Route path="/" element={<Home dsSanPham={sanPhamHienThi} dsDanhMuc={dsDanhMuc} themVaoGio={themVaoGio} shopConfig={shopConfig} />} />
                <Route path="/danh-muc/:slug" element={<Home dsSanPham={sanPhamHienThi} dsDanhMuc={dsDanhMuc} themVaoGio={themVaoGio} shopConfig={shopConfig} />} />
                <Route path="/san-pham/:slug" element={<ProductDetail dsSanPham={dsSanPham} themVaoGio={themVaoGio} />} />
                <Route path="/cart" element={<Cart gioHang={gioHang} chinhSuaSoLuong={chinhSuaSoLuong} xoaSanPham={xoaSanPham} currentUser={currentUser} />} />
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

      {/* --- RECENT PRODUCTS: FIX CẤU TRÚC ĐỂ KHÔNG BỊ VỠ --- */}
      {!isAdminPage && recentProducts.length > 0 && (
        <div className="recent-view-bar">
          <Container>
            <h5 className="fw-bold text-secondary mb-3 small text-uppercase" style={{letterSpacing:1}}>
              <i className="fa-solid fa-clock-rotate-left me-2"></i> Sản phẩm bạn vừa xem
            </h5>
            <div className="recent-scroll">
              {recentProducts.map(sp => (
                <Link key={sp.id} to={`/san-pham/${sp.slug || toSlug(sp.ten)}`} className="recent-card text-decoration-none">
                  <img src={sp.anh} alt={sp.ten} />
                  <div className="recent-card-body">
                    <div className="recent-name">{sp.ten}</div>
                    <div className="recent-price">{sp.giaBan?.toLocaleString()}₫</div>
                  </div>
                </Link>
              ))}
            </div>
          </Container>
        </div>
      )}

      {!isAdminPage && (
        <footer className="footer-section">
          <Container><Row><Col md={4}><h5 className="footer-title">{shopConfig.tenShop}</h5><p className="small text-secondary">{shopConfig.gioiThieu}</p><p>🏠 {shopConfig.diaChi}</p><p>☎️ {shopConfig.sdt}</p></Col><Col md={3}><h5 className="footer-title">VỀ CHÚNG TÔI</h5><Link to="/" className="footer-link">Trang chủ</Link><Link to="/flash-sale" className="footer-link">Khuyến mãi</Link><Link to="/tra-cuu" className="footer-link">Tra cứu đơn</Link></Col><Col md={3}><h5 className="footer-title">HỖ TRỢ</h5><Link to="#" className="footer-link">Chính sách đổi trả</Link><Link to="#" className="footer-link">Hướng dẫn mua hàng</Link></Col><Col md={2}><h5 className="footer-title">KẾT NỐI</h5>{shopConfig.linkFacebook && <a href={shopConfig.linkFacebook} target="_blank" className="d-block mb-2">Facebook</a>}{shopConfig.zalo && <a href={`https://zalo.me/${shopConfig.zalo}`} target="_blank">Zalo OA</a>}</Col></Row></Container>
          <div className="copyright-bar">{shopConfig.copyright}</div>
        </footer>
      )}
    </div>
  );
}
export default App;