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
          {/* --- BẮT ĐẦU ĐOẠN CODE NAVBAR ĐÃ TỐI ƯU --- */}
          <Navbar bg="white" expand="lg" className="sticky-top shadow-sm py-2" style={{zIndex: 100, borderBottom:'3px solid #198754'}}>
            <Container>
              {/* 1. LOGO SHOP */}
              <Navbar.Brand as={Link} to="/" className="me-2 text-decoration-none brand-group d-flex align-items-center">
                  {shopConfig.logo ? (<img src={shopConfig.logo} alt="Logo" className="brand-logo-img" style={{maxHeight:'50px'}} />) : (<span className="fs-1">🦁</span>)}
                  <div className="brand-info ms-2 d-none d-xl-block"> {/* Ẩn tên shop trên màn hình nhỏ để nhường chỗ */}
                      <h1 className="shop-name m-0" style={{fontSize:'1.2rem', fontWeight:'bold', color:'#198754'}}>{shopConfig.tenShop}</h1>
                      <span className="shop-slogan small text-muted" style={{fontSize:'0.75rem'}}>{shopConfig.slogan}</span>
                  </div>
              </Navbar.Brand>

              <Navbar.Toggle />

              <Navbar.Collapse>
                {/* 2. Ô TÌM KIẾM (Đã chỉnh mx-lg-2 để rộng hơn) */}
                <Form className="d-flex flex-grow-1 mx-2 mx-lg-3 my-2 my-lg-0 search-form-custom" onSubmit={handleSearch}>
                  <div className="input-group">
                      <Form.Control 
                          type="search" 
                          placeholder="Bạn tìm gì hôm nay...?" 
                          value={tuKhoa} 
                          onChange={e => setTuKhoa(e.target.value)} 
                          className="search-input border-success" 
                      />
                      <Button variant="success" type="submit" className="search-btn"><i className="fa-solid fa-magnifying-glass"></i></Button>
                  </div>
                </Form>

                {/* 3. CÁC NÚT CHỨC NĂNG (Bên phải) */}
                <Nav className="align-items-center gap-1 gap-xl-2">
                  {/* Hotline: Chỉ hiện trên màn hình to (XL) */}
                  <div className="d-none d-xl-flex header-hotline-box align-items-center me-2">
                      <div className="hotline-icon bg-light text-success rounded-circle d-flex align-items-center justify-content-center me-2" style={{width:35, height:35}}><i className="fa-solid fa-phone"></i></div>
                      <span className="hotline-number fw-bold text-danger">{shopConfig.sdt}</span>
                  </div>

                  {/* Nút Tra cứu: Chỉ hiện Icon trên Laptop nhỏ, hiện chữ trên màn to */}
                  <Link to="/tra-cuu" className="btn btn-light rounded-pill border-0 position-relative text-dark d-flex align-items-center" title="Tra cứu đơn">
                      <i className="fa-solid fa-truck-fast text-success fs-5"></i>
                      <span className="d-none d-xl-inline ms-2 small fw-bold">Tra đơn</span>
                  </Link>
                  
                  {/* Nút Yêu thích (Wishlist) */}
                  <Link to="/wishlist" className="btn btn-light rounded-pill border-0 position-relative text-dark d-flex align-items-center" title="Yêu thích">
                      <i className={`fa-solid fa-heart fs-5 ${wishlist.length > 0 ? 'text-danger' : 'text-secondary'}`}></i>
                      {wishlist.length > 0 && (
                        <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{fontSize:'9px'}}>
                          {wishlist.length}
                        </span>
                      )}
                  </Link>

                  {/* Nút Giỏ hàng */}
                  <Link to="/cart" className="btn btn-light rounded-pill border-0 position-relative text-dark d-flex align-items-center me-2" title="Giỏ hàng">
                      <i className="fa-solid fa-cart-shopping fs-5 text-success"></i>
                      <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-warning text-dark" style={{fontSize:'10px'}}>
                        {gioHang.reduce((a,b)=>a+b.soLuong,0)}
                      </span>
                  </Link>
                  
                  {/* Nút Tài khoản / Đăng nhập */}
                  {currentUser ? (
                      <Dropdown align="end">
                      <Dropdown.Toggle variant="white" className="border-0 fw-bold d-flex align-items-center gap-2 p-0" style={{outline:'none', boxShadow:'none', background:'transparent'}}>
                          <img src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png" width="38" alt="User" />
                          <span className="d-none d-xl-block small text-start">
                              <div style={{fontSize:'10px', color:'#999', lineHeight: '10px'}}>Xin chào,</div>
                              <div className="text-success text-truncate" style={{maxWidth:'80px'}}>{currentUser.displayName || 'Bạn'}</div>
                          </span>
                      </Dropdown.Toggle>
                      <Dropdown.Menu className="shadow border-0 mt-2">
                          <Dropdown.Item as={Link} to="/member"><i className="fa-solid fa-user-gear me-2"></i> Tài khoản</Dropdown.Item>
                          <Dropdown.Divider />
                          <Dropdown.Item onClick={handleLogout} className="text-danger"><i className="fa-solid fa-right-from-bracket me-2"></i> Đăng xuất</Dropdown.Item>
                      </Dropdown.Menu>
                      </Dropdown>
                  ) : (
                      <Link to="/auth" state={{ from: location.pathname }} className="btn btn-danger rounded-pill fw-bold px-3 py-1 small shadow-sm">
                          <i className="fa-regular fa-user me-1"></i> Đăng nhập
                      </Link>
                  )}
                </Nav>
              </Navbar.Collapse>
            </Container>
          </Navbar>
          {/* --- KẾT THÚC ĐOẠN CODE NAVBAR --- */}          
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