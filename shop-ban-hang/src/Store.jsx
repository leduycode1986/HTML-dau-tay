import React, { useState, useEffect, Suspense } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { db, auth } from './firebase'; 
import { collection, onSnapshot, doc, getDoc } from 'firebase/firestore'; 
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { Button, Form, Container, Navbar, Nav, Dropdown, Row, Col, Badge } from 'react-bootstrap';
import { ToastContainer, toast } from 'react-toastify'; 
import 'react-toastify/dist/ReactToastify.css'; 
import AOS from 'aos'; import 'aos/dist/aos.css';
import { toSlug } from './utils';

// --- [MỚI] IMPORT CÁC COMPONENT MỚI ---
import SEO from './SEO';
import MobileBottomNav from './MobileBottomNav';
import Wishlist from './Wishlist';
import Compare from './Compare';

import Home from './Home';
import ProductDetail from './ProductDetail';

const Cart = React.lazy(() => import('./Cart'));
const Checkout = React.lazy(() => import('./Checkout'));
const FlashSale = React.lazy(() => import('./FlashSale'));
const Member = React.lazy(() => import('./Member'));
const OrderLookup = React.lazy(() => import('./OrderLookup'));
const PostPage = React.lazy(() => import('./PostPage'));
const News = React.lazy(() => import('./News'));
const NewsDetail = React.lazy(() => import('./NewsDetail'));
const Auth = React.lazy(() => import('./Auth'));
const Admin = React.lazy(() => import('./Admin'));

function Store() {
  const navigate = useNavigate();
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith('/admin');
  
  // --- STATE CŨ (GIỮ NGUYÊN) ---
  const [dsDanhMuc, setDsDanhMuc] = useState([]);
  const [banners, setBanners] = useState([]); 
  const [openMenuId, setOpenMenuId] = useState(null);
  const [gioHang, setGioHang] = useState(() => { try { return JSON.parse(localStorage.getItem('cart')) || []; } catch { return []; } });
  const [tuKhoa, setTuKhoa] = useState('');
  const [shopConfig, setShopConfig] = useState({ tenShop: 'Thực Phẩm Mai Vàng', slogan: '', logo: '', diaChi: '', sdt: '', fax:'', email:'', openingHours: '', topBarText: '', flashSaleEnd: '', copyright:'', linkPolicy:'', linkGuide:'', linkFacebook:'', zalo:'' });
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null); 
  const [showTopBtn, setShowTopBtn] = useState(false);

  // --- [MỚI] STATE YÊU THÍCH & SO SÁNH ---
  const [wishlist, setWishlist] = useState(() => { try { return JSON.parse(localStorage.getItem('wishlist')) || []; } catch { return []; } });
  const [compareList, setCompareList] = useState(() => { try { return JSON.parse(localStorage.getItem('compareList')) || []; } catch { return []; } });

  // Lưu xuống LocalStorage mỗi khi thay đổi
  useEffect(() => { localStorage.setItem('wishlist', JSON.stringify(wishlist)); }, [wishlist]);
  useEffect(() => { localStorage.setItem('compareList', JSON.stringify(compareList)); }, [compareList]);

  // --- [MỚI] HÀM XỬ LÝ YÊU THÍCH & SO SÁNH ---
  const toggleWishlist = (sp) => {
    const exists = wishlist.find(i => i.id === sp.id);
    if (exists) {
        setWishlist(wishlist.filter(i => i.id !== sp.id));
        toast.info(`Đã bỏ thích "${sp.ten}"`);
    } else {
        setWishlist([...wishlist, sp]);
        toast.success(`Đã thích "${sp.ten}"`);
    }
  };

  const toggleCompare = (sp) => {
    const exists = compareList.find(i => i.id === sp.id);
    if (exists) {
        setCompareList(compareList.filter(i => i.id !== sp.id));
        toast.info("Đã bỏ so sánh");
    } else {
        if (compareList.length >= 3) return toast.warning("Chỉ so sánh tối đa 3 sản phẩm!");
        setCompareList([...compareList, sp]);
        toast.success("Đã thêm vào so sánh");
    }
  };

  // --- CÁC USE EFFECT CŨ (GIỮ NGUYÊN) ---
  useEffect(() => { AOS.init({ duration: 800, once: false }); }, []);
  useEffect(() => { window.scrollTo(0, 0); }, [location]);
  
  // Fix lỗi màn hình đen (Backdrop)
  useEffect(() => { 
    if (!location.pathname.startsWith('/admin')) { 
      const cleanBackdrops = () => { 
        document.querySelectorAll('.modal-backdrop, .offcanvas-backdrop').forEach(el => el.remove()); 
        document.body.classList.remove('modal-open', 'offcanvas-open'); 
        document.body.style = ''; 
      }; 
      cleanBackdrops(); 
    } 
  }, [location.pathname]);

  useEffect(() => {
    const unsubDM = onSnapshot(collection(db, "danhMuc"), sn => { const d=sn.docs.map(x=>({id:x.id,...x.data()})); d.sort((a,b)=>parseFloat(a.order||0)-parseFloat(b.order||0)); setDsDanhMuc(d); });
    const unsubBanner = onSnapshot(collection(db, "banners"), sn => setBanners(sn.docs.map(d=>({id:d.id,...d.data()}))));
    const unsubConfig = onSnapshot(doc(db, "cauHinh", "thongTinChung"), d => { if(d.exists()) setShopConfig(d.data()); });
    const unsubAuth = onAuthStateChanged(auth, async u => { setCurrentUser(u); if (u) { const docSnap = await getDoc(doc(db, "users", u.uid)); if (docSnap.exists()) setUserData(docSnap.data()); } else setUserData(null); });
    const scrollH = () => setShowTopBtn(window.scrollY > 300); window.addEventListener('scroll', scrollH);
    return () => { unsubDM(); unsubBanner(); unsubConfig(); unsubAuth(); window.removeEventListener('scroll', scrollH); };
  }, []);
  
  useEffect(() => localStorage.setItem('cart', JSON.stringify(gioHang)), [gioHang]);

  // --- CÁC HÀM GIỎ HÀNG (GIỮ NGUYÊN) ---
  const themVaoGio = (sp) => { 
    if(sp.soLuong <= 0) return toast.error("Sản phẩm đã hết hàng!");
    const check = gioHang.find(i => i.id === sp.id); 
    if (check) {
      if (check.soLuong + 1 > check.tonKho) return toast.warning(`Kho chỉ còn ${check.tonKho} sản phẩm!`);
      setGioHang(gioHang.map(i => i.id === sp.id ? {...i, soLuong: i.soLuong + 1} : i)); 
    } else {
      setGioHang([...gioHang, {...sp, soLuong: 1, tonKho: sp.soLuong}]); 
    }
    toast.success(`Đã thêm "${sp.ten}"!`); 
  };
  const chinhSuaSoLuong = (id, type) => { setGioHang(gioHang.map(i => { if (i.id === id) { if (type === 'tang') { if (i.soLuong + 1 > i.tonKho) { toast.warning(`Kho chỉ còn ${i.tonKho} sản phẩm!`); return i; } return { ...i, soLuong: i.soLuong + 1 }; } else { return { ...i, soLuong: Math.max(1, i.soLuong - 1) }; } } return i; })); };
  const xoaSanPham = (id) => setGioHang(gioHang.filter(i=>i.id!==id));
  const handleLogout = async () => { await signOut(auth); if (location.pathname.includes('/member')) {navigate('/');}toast.info("Đã đăng xuất");};
  const handleSearch = (e) => { e.preventDefault(); if(tuKhoa.trim()) navigate(`/?search=${encodeURIComponent(tuKhoa)}`); };

  return (
    <div className="app-container d-flex flex-column min-vh-100">
      <SEO title={shopConfig.tenShop} /> {/* [MỚI] SEO mặc định */}
      <ToastContainer autoClose={2000} />
      
      {/* [MỚI] Nút so sánh nổi (Floating Compare) */}
      {!isAdminPage && compareList.length > 0 && (
        <Link to="/compare" className="floating-compare-btn" style={{ bottom: '250px' }}>
          <i className="fa-solid fa-scale-balanced"></i>
          <span className="badge bg-danger rounded-pill position-absolute top-0 start-100 translate-middle">{compareList.length}</span>
        </Link>
      )}

      {/* --- HEADER & NAVBAR --- */}
      {!isAdminPage && <div className={`back-to-top ${showTopBtn ? 'visible' : ''}`} onClick={() => window.scrollTo({top:0, behavior:'smooth'})}><i className="fa-solid fa-arrow-up"></i></div>}
      
      {!isAdminPage && (
        <div className="chat-widget" style={{position:'fixed', bottom:'80px', right:'20px', zIndex:1000, display:'flex', flexDirection:'column', gap:'10px'}}>
          {shopConfig.zalo && <a href={`https://zalo.me/${shopConfig.zalo}`} target="_blank" rel="noreferrer"><img src="https://upload.wikimedia.org/wikipedia/commons/9/91/Icon_of_Zalo.svg" width="45" style={{boxShadow:'0 4px 10px rgba(0,0,0,0.2)', borderRadius:'50%'}}/></a>}
          {shopConfig.linkFacebook && <a href={shopConfig.linkFacebook} target="_blank" rel="noreferrer"><img src="https://upload.wikimedia.org/wikipedia/commons/0/05/Facebook_Logo_%282019%29.png" width="45" style={{boxShadow:'0 4px 10px rgba(0,0,0,0.2)', borderRadius:'50%'}}/></a>}
        </div>
      )}

      {!isAdminPage && (
        <>          
          <div className="top-bar-notification"><div className="marquee-text"><span className="me-4">{shopConfig.topBarText || "Chào mừng bạn đến với Thực Phẩm Mai Vàng!"}</span>{shopConfig.openingHours && (<span className="mx-4"><i className="fa-regular fa-clock me-1"></i> Mở cửa: {shopConfig.openingHours}</span>)}</div></div>
          <Navbar bg="white" expand="lg" className="sticky-top shadow-sm py-3" style={{zIndex: 100, borderBottom:'3px solid #198754'}}>
            <Container>
            <Navbar.Brand as={Link} to="/" className="me-4 text-decoration-none brand-group">
                {shopConfig.logo ? (<img src={shopConfig.logo} alt="Logo" className="brand-logo-img" />) : (<span className="fs-1">🦁</span>)}
                <div className="brand-info"><h1 className="shop-name">{shopConfig.tenShop}</h1><span className="shop-slogan">{shopConfig.slogan}</span></div>
            </Navbar.Brand>
              <Navbar.Toggle />
              <Navbar.Collapse>
                <Form className="d-flex flex-grow-1 mx-lg-5 my-2 my-lg-0 search-form-custom" onSubmit={handleSearch}>
                <div className="input-group">
                    <Form.Control type="search" placeholder="Tìm sản phẩm...?" value={tuKhoa} onChange={e => setTuKhoa(e.target.value)} className="search-input" />
                    <Button variant="success" type="submit" className="search-btn"><i className="fa-solid fa-magnifying-glass"></i></Button>
                </div>
                </Form>
                    <Nav className="align-items-center gap-3">
                    <div className="d-none d-lg-flex header-hotline-box"><div className="hotline-icon"><i className="fa-solid fa-phone"></i></div><span className="hotline-number">{shopConfig.sdt}</span></div>
                    <Link to="/tra-cuu" className="btn-header-action btn-lookup"><i className="fa-solid fa-truck-fast"></i> Tra đơn</Link>
                    {/* 👉 DÁN ĐOẠN CODE MỚI NÀY VÀO ĐÂY: NÚT YÊU THÍCH */}
                    <Link to="/wishlist" className="btn-header-action position-relative me-3 text-dark text-decoration-none">
                        <div style={{fontSize:'22px'}}><i className={`fa-solid fa-heart ${wishlist.length > 0 ? 'text-danger' : 'text-secondary'}`}></i></div>
                        {wishlist.length > 0 && (
                          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{fontSize:'10px'}}>
                            {wishlist.length}
                          </span>
                        )}
                    </Link>
                    <div className="header-cart-wrapper">
                      <Link to="/cart" className="btn-header-action btn-cart-header px-4">
                        <i className="fa-solid fa-cart-shopping"></i><span className="cart-badge">{gioHang.reduce((a,b)=>a+b.soLuong,0)}</span>
                      </Link>
                      <div className="mini-cart-box">
                        {gioHang.length === 0 ? (<div className="mini-cart-empty"><div style={{fontSize:'30px', marginBottom:'10px'}}>🛒</div>Chưa có sản phẩm nào</div>) : (
                          <><div className="small text-muted mb-2 border-bottom pb-1">Sản phẩm mới thêm</div><div className="mini-cart-list">{gioHang.slice(0, 5).map((sp) => (<div key={sp.id} className="mini-cart-item"><img src={sp.anh} alt={sp.ten} className="mini-cart-img" /><div className="mini-cart-info"><div className="mini-cart-name">{sp.ten}</div><div className="d-flex justify-content-between"><span className="mini-cart-price">{sp.giaBan?.toLocaleString()} ¥</span><span className="small text-muted">x{sp.soLuong}</span></div></div></div>))}</div><div className="d-flex justify-content-between align-items-center mb-2"><span className="small text-secondary">Tổng cộng:</span><span className="fw-bold text-danger fs-6">{gioHang.reduce((t, s) => t + (s.giaBan || s.giaGoc) * s.soLuong, 0).toLocaleString()} ¥</span></div><Button variant="success" size="sm" className="w-100 fw-bold" onClick={() => navigate('/cart')}>XEM GIỎ HÀNG</Button></>
                        )}
                      </div>
                    </div>
                  
                  {currentUser ? (
                    <Dropdown align="end">
                    <Dropdown.Toggle variant="light" className="border-0 fw-bold d-flex align-items-center gap-2" style={{outline:'none', boxShadow:'none'}}>
                        <img src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png" width="35" alt="User" />
                        <span className="d-none d-xl-block small text-start"><div style={{fontSize:'11px', color:'#999'}}>Xin chào,</div><div className="text-success">{currentUser.displayName || 'Thành viên'}</div></span>
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                        <Dropdown.Item as={Link} to="/member"><i className="fa-solid fa-user-gear me-2"></i> Tài khoản của tôi</Dropdown.Item>
                        <Dropdown.Divider />
                        <Dropdown.Item onClick={handleLogout} className="text-danger fw-bold"><i className="fa-solid fa-right-from-bracket me-2"></i> Đăng xuất</Dropdown.Item>
                    </Dropdown.Menu>
                    </Dropdown>
                ) : (
                    <Link to="/auth" state={{ from: location.pathname }} className="btn-header-action btn-login-header"><i className="fa-regular fa-user"></i> Đăng nhập</Link>
                )}
                </Nav>
              </Navbar.Collapse>
            </Container>
          </Navbar>
          
          <div className="horizontal-menu-section sticky-top" style={{top: '88px', zIndex: 99}}> 
            <Container>
              <div className="horizontal-menu-list">
                <Link to="/flash-sale" className={`h-menu-item h-item-flash ${location.pathname === '/flash-sale' ? 'active' : ''}`}><i className="fa-solid fa-bolt me-2"></i> Flash Sale</Link>
                <Link to="/danh-muc/khuyen-mai-soc" className={`h-menu-item h-item-sale ${location.pathname.includes('khuyen-mai-soc') ? 'active' : ''}`}><i className="fa-solid fa-tags me-2"></i> Khuyến mãi sốc</Link>
                <Link to="/danh-muc/san-pham-moi" className={`h-menu-item h-item-new ${location.pathname.includes('san-pham-moi') ? 'active' : ''}`}><i className="fa-solid fa-sparkles me-2"></i> Sản phẩm mới</Link>
                <Link to="/danh-muc/san-pham-ban-chay" className={`h-menu-item ${location.pathname.includes('san-pham-ban-chay') ? 'active' : ''}`}><i className="fa-solid fa-fire me-2 text-danger"></i> Bán chạy nhất</Link>
                <Link to="/tin-tuc" className={`h-menu-item ${location.pathname.includes('/tin-tuc') ? 'active' : ''}`}><i className="fa-solid fa-utensils me-2 text-success"></i> Món ngon mỗi ngày</Link>
              </div>
            </Container>
          </div>
        </>
      )}
                 
      <div className="flex-grow-1 py-3" style={{background: '#f4f6f9'}}>
        <Container>
          <Row>
            {!isAdminPage && (
              <Col lg={3} className="d-none d-lg-block mb-4">
                <div className="sidebar-main">
                  <div className="sidebar-header"><i className="fa-solid fa-bars me-2"></i> DANH MỤC</div>
                  <div className="category-list">
                    {dsDanhMuc.filter(d => !d.parent).map(parent => {
                      const hasChild = dsDanhMuc.some(c => c.parent === parent.id);
                      const isOpen = openMenuId === parent.id;
                      return (
                          <div key={parent.id}>
                            <div className={`category-item ${location.pathname.includes(parent.slug || toSlug(parent.ten)) ? 'active' : ''}`} onClick={() => { navigate(`/danh-muc/${parent.slug || toSlug(parent.ten)}`); if (hasChild && !isOpen) setOpenMenuId(parent.id); }}>
                              <span>{parent.icon} {parent.ten}</span>
                              {hasChild && (<i className={`fa-solid fa-chevron-${isOpen?'down':'right'} small p-2`} onClick={(e) => { e.stopPropagation(); setOpenMenuId(isOpen ? null : parent.id); }}></i>)}
                            </div>
                            {hasChild && isOpen && (<div className="submenu">{dsDanhMuc.filter(c => c.parent === parent.id).map(child => (<Link key={child.id} to={`/danh-muc/${child.slug || toSlug(child.ten)}`}>{child.ten}</Link>))}</div>)}
                          </div>
                      )
                    })}
                  </div>
                </div>
              </Col>
            )}

            <Col lg={!isAdminPage ? 9 : 12}>
              <Suspense fallback={<div className="text-center py-5"><div className="spinner-border text-success"></div><p>Đang tải...</p></div>}>
                <Routes>
                  {/* [MỚI] TRUYỀN PROPS toggleWishlist VÀ toggleCompare VÀO HOME & PRODUCT DETAIL */}
                  <Route path="/" element={<Home dsDanhMuc={dsDanhMuc} themVaoGio={themVaoGio} shopConfig={shopConfig} banners={banners} toggleWishlist={toggleWishlist} toggleCompare={toggleCompare} wishlist={wishlist} />} />
                  <Route path="/danh-muc/:slug" element={<Home dsDanhMuc={dsDanhMuc} themVaoGio={themVaoGio} shopConfig={shopConfig} banners={banners} toggleWishlist={toggleWishlist} toggleCompare={toggleCompare} wishlist={wishlist} />} />
                  <Route path="/san-pham/:slug" element={<ProductDetail themVaoGio={themVaoGio} toggleWishlist={toggleWishlist} toggleCompare={toggleCompare} wishlist={wishlist} />} />
                  
                  {/* [MỚI] CÁC ROUTE MỚI */}
                  <Route path="/wishlist" element={<Wishlist wishlist={wishlist} toggleWishlist={toggleWishlist} themVaoGio={themVaoGio} />} />
                  <Route path="/compare" element={<Compare compareList={compareList} removeFromCompare={toggleCompare} themVaoGio={themVaoGio} />} />

                  {/* ROUTE CŨ */}
                  <Route path="/cart" element={<Cart gioHang={gioHang} chinhSuaSoLuong={chinhSuaSoLuong} xoaSanPham={xoaSanPham} currentUser={currentUser} />} />
                  <Route path="/checkout" element={<Checkout gioHang={gioHang} setGioHang={setGioHang} userData={userData} />} />
                  <Route path="/member" element={<Member themVaoGio={themVaoGio} />} />
                  <Route path="/tra-cuu" element={<OrderLookup />} />
                  <Route path="/flash-sale" element={<FlashSale themVaoGio={themVaoGio} shopConfig={shopConfig} />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/chinh-sach" element={<PostPage title="Chính sách đổi trả" content={shopConfig.policyContent} />} />
                  <Route path="/huong-dan" element={<PostPage title="Hướng dẫn mua hàng" content={shopConfig.guideContent} />} />
                  <Route path="/tin-tuc" element={<News />} />
                  <Route path="/tin-tuc/:slug" element={<NewsDetail />} />                  
                  <Route path="/admin" element={<Admin />} />
                </Routes>
              </Suspense>
            </Col>
          </Row>
        </Container>
      </div>
      
      {!isAdminPage && (
        <>
          <footer className="footer-section pb-5 pb-lg-0"> 
             <Container>
                <Row>
                  <Col md={4} className="mb-4">
                    <h5 className="footer-title">{shopConfig.tenShop}</h5>
                    <p><i className="fa-solid fa-location-dot me-2 text-success"></i> {shopConfig.diaChi}</p>
                    <p><i className="fa-solid fa-phone me-2 text-success"></i> {shopConfig.sdt}</p>
                    {shopConfig.fax && <p><i className="fa-solid fa-fax me-2 text-success"></i> {shopConfig.fax}</p>}
                    {shopConfig.email && <p><i className="fa-solid fa-envelope me-2 text-success"></i> {shopConfig.email}</p>}
                  </Col>
                  <Col md={3} className="mb-4">
                    <h5 className="footer-title">VỀ CHÚNG TÔI</h5>
                    <Link to="/" className="footer-link">Trang chủ</Link>
                    <Link to="/danh-muc/khuyen-mai-soc" className="footer-link">Khuyến mãi sốc</Link>
                    <Link to="/tra-cuu" className="footer-link">Tra cứu đơn</Link>
                  </Col>
                  <Col md={3} className="mb-4">
                    <h5 className="footer-title">HỖ TRỢ</h5>
                    <a href={shopConfig.linkPolicy || '#'} className="footer-link">Chính sách đổi trả</a>
                    <a href={shopConfig.linkGuide || '#'} className="footer-link">Hướng dẫn mua hàng</a>
                  </Col>
                  <Col md={2} className="mb-4">
                    <h5 className="footer-title">KẾT NỐI</h5>
                    {shopConfig.linkFacebook && <a href={shopConfig.linkFacebook} target="_blank" className="d-block mb-2 text-white text-decoration-none"><i className="fa-brands fa-facebook me-2 text-primary"></i> Facebook</a>}
                    {shopConfig.zalo && <a href={`https://zalo.me/${shopConfig.zalo}`} target="_blank" className="text-white text-decoration-none"><i className="fa-solid fa-comment-dots me-2 text-info"></i> Zalo OA</a>}
                  </Col>
                </Row>
              </Container>
              <div className="copyright-bar">
                {shopConfig.copyright || `@${new Date().getFullYear()} ${shopConfig.tenShop}. All rights reserved.`}
              </div>
          </footer>
          
          {/* [MỚI] THANH ĐIỀU HƯỚNG MOBILE */}
          <MobileBottomNav cartCount={gioHang.reduce((a,b)=>a+b.soLuong,0)} wishlistCount={wishlist.length} />
        </>
      )}
    </div>
  );
}
export default Store;