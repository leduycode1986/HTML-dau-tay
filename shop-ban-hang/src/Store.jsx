import React, { useState, useEffect, Suspense } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { db, auth } from './firebase'; 
import { collection, onSnapshot, doc, deleteDoc, updateDoc, addDoc, getDoc } from 'firebase/firestore'; 
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { Badge, Button, Form, Container, Navbar, Nav, Dropdown, Row, Col, Modal } from 'react-bootstrap';
import { ToastContainer, toast } from 'react-toastify'; 
import 'react-toastify/dist/ReactToastify.css'; 
import AOS from 'aos'; import 'aos/dist/aos.css';

// Import các component
import Home from './Home';
import ProductDetail from './ProductDetail';
import Cart from './Cart';
import Auth from './Auth';
import Member from './Member';
import OrderLookup from './OrderLookup';
import FlashSale from './FlashSale'; 
import Checkout from './Checkout'; 
import { toSlug } from './utils';
import PostPage from './PostPage';
import News from './News';
import NewsDetail from './NewsDetail';

// Lazy Load Admin
const Admin = React.lazy(() => import('./Admin'));

function Store() {
  const navigate = useNavigate();
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith('/admin');
  
  // --- KHAI BÁO STATE (QUAN TRỌNG: Không được xóa) ---
  const [dsDanhMuc, setDsDanhMuc] = useState([]);
  const [banners, setBanners] = useState([]); 
  const [dsSanPham, setDsSanPham] = useState([]); // [FIX]: Thêm state dsSanPham để dùng chung
  const [openMenuId, setOpenMenuId] = useState(null); // [FIX]: State mở menu con

  const [gioHang, setGioHang] = useState(() => {
    try { return JSON.parse(localStorage.getItem('cart')) || []; } catch { return []; }
  });

  const [tuKhoa, setTuKhoa] = useState('');
  const [shopConfig, setShopConfig] = useState({ 
    tenShop: 'Thực Phẩm Mai Vàng', slogan: '', logo: '', diaChi: '', sdt: '', fax:'', email:'',
    openingHours: '', topBarText: '', flashSaleEnd: '', copyright:'', linkPolicy:'', linkGuide:'', 
    linkFacebook:'', zalo:''
  });
  
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null); 
  const [showTopBtn, setShowTopBtn] = useState(false);

  useEffect(() => { AOS.init({ duration: 800, once: false }); }, []);
  useEffect(() => { window.scrollTo(0, 0); }, [location]);

  // --- TẢI DỮ LIỆU TỪ FIREBASE ---
  useEffect(() => {
    const unsubDM = onSnapshot(collection(db, "danhMuc"), sn => { 
        const d=sn.docs.map(x=>({id:x.id,...x.data()})); 
        d.sort((a,b)=>parseFloat(a.order||0)-parseFloat(b.order||0)); 
        setDsDanhMuc(d); 
    });
    // [FIX]: Tải thêm danh sách sản phẩm ở đây để truyền cho FlashSale
    const unsubSP = onSnapshot(collection(db, "sanPham"), sn => {
        setDsSanPham(sn.docs.map(d => ({id:d.id, ...d.data()})));
    });

    const unsubBanner = onSnapshot(collection(db, "banners"), sn => setBanners(sn.docs.map(d=>({id:d.id,...d.data()}))));
    const unsubConfig = onSnapshot(doc(db, "cauHinh", "thongTinChung"), d => { if(d.exists()) setShopConfig(d.data()); });
    
    const unsubAuth = onAuthStateChanged(auth, async u => { 
      setCurrentUser(u);
      if (u) {
        const docSnap = await getDoc(doc(db, "users", u.uid));
        if (docSnap.exists()) setUserData(docSnap.data());
      } else setUserData(null);
    });
    
    const scrollH = () => setShowTopBtn(window.scrollY > 300); window.addEventListener('scroll', scrollH);
    return () => { unsubDM(); unsubSP(); unsubBanner(); unsubConfig(); unsubAuth(); window.removeEventListener('scroll', scrollH); };
  }, []);

  useEffect(() => localStorage.setItem('cart', JSON.stringify(gioHang)), [gioHang]);

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
  
  const chinhSuaSoLuong = (id, type) => {
    setGioHang(gioHang.map(i => {
        if (i.id === id) {
        if (type === 'tang') {
            if (i.soLuong + 1 > i.tonKho) { toast.warning(`Kho chỉ còn ${i.tonKho} sản phẩm!`); return i; }
            return { ...i, soLuong: i.soLuong + 1 };
        } else { return { ...i, soLuong: Math.max(1, i.soLuong - 1) }; }
        }
        return i;
    }));
  };
  
  const xoaSanPham = (id) => setGioHang(gioHang.filter(i=>i.id!==id));
  const handleLogout = async () => { await signOut(auth); if (location.pathname.includes('/member')) {navigate('/');}toast.info("Đã đăng xuất");};

  const handleSearch = (e) => {
    e.preventDefault();
    if(tuKhoa.trim()) navigate(`/?search=${encodeURIComponent(tuKhoa)}`);
  };

  return (
    <div className="app-container d-flex flex-column min-vh-100">
      <ToastContainer autoClose={2000} />
      {!isAdminPage && <div className={`back-to-top ${showTopBtn ? 'visible' : ''}`} onClick={() => window.scrollTo({top:0, behavior:'smooth'})}><i className="fa-solid fa-arrow-up"></i></div>}

      {!isAdminPage && (
        <div className="chat-widget" style={{position:'fixed', bottom:'80px', right:'20px', zIndex:1000, display:'flex', flexDirection:'column', gap:'10px'}}>
          {shopConfig.zalo && <a href={`https://zalo.me/${shopConfig.zalo}`} target="_blank" rel="noreferrer"><img src="https://upload.wikimedia.org/wikipedia/commons/9/91/Icon_of_Zalo.svg" width="45" style={{boxShadow:'0 4px 10px rgba(0,0,0,0.2)', borderRadius:'50%'}}/></a>}
          {shopConfig.linkFacebook && <a href={shopConfig.linkFacebook} target="_blank" rel="noreferrer"><img src="https://upload.wikimedia.org/wikipedia/commons/0/05/Facebook_Logo_%282019%29.png" width="45" style={{boxShadow:'0 4px 10px rgba(0,0,0,0.2)', borderRadius:'50%'}}/></a>}
        </div>
      )}

      {!isAdminPage && (
        <>          
          <div className="top-bar-notification">
            <div className="marquee-text">
                <span className="me-4">{shopConfig.topBarText || "Chào mừng bạn đến với Thực Phẩm Mai Vàng!"}</span>
                {shopConfig.openingHours && (<span className="mx-4"><i className="fa-regular fa-clock me-1"></i> Mở cửa: {shopConfig.openingHours}</span>)}                
            </div>
          </div>
          
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
                    <div className="d-none d-lg-flex header-hotline-box">
                    <div className="hotline-icon"><i className="fa-solid fa-phone"></i></div>
                    <span className="hotline-number">{shopConfig.sdt}</span>
                  </div>
                    <Link to="/tra-cuu" className="btn-header-action btn-lookup"><i className="fa-solid fa-truck-fast"></i> Tra đơn</Link>
                    
                    <div className="header-cart-wrapper">
                      <Link to="/cart" className="btn-header-action btn-cart-header px-4">
                        <i className="fa-solid fa-cart-shopping"></i> Giỏ <span className="cart-badge">{gioHang.reduce((a,b)=>a+b.soLuong,0)}</span>
                      </Link>
                      <div className="mini-cart-box">
                        {gioHang.length === 0 ? (
                          <div className="mini-cart-empty"><div style={{fontSize:'30px', marginBottom:'10px'}}>🛒</div>Chưa có sản phẩm nào</div>
                        ) : (
                          <>
                            <div className="small text-muted mb-2 border-bottom pb-1">Sản phẩm mới thêm</div>
                            <div className="mini-cart-list">
                              {gioHang.slice(0, 5).map((sp) => ( 
                                <div key={sp.id} className="mini-cart-item">
                                  <img src={sp.anh} alt={sp.ten} className="mini-cart-img" />
                                  <div className="mini-cart-info">
                                    <div className="mini-cart-name">{sp.ten}</div>
                                    <div className="d-flex justify-content-between"><span className="mini-cart-price">{sp.giaBan?.toLocaleString()} ¥</span><span className="small text-muted">x{sp.soLuong}</span></div>
                                  </div>
                                </div>
                              ))}
                            </div>
                            <div className="d-flex justify-content-between align-items-center mb-2"><span className="small text-secondary">Tổng cộng:</span><span className="fw-bold text-danger fs-6">{gioHang.reduce((t, s) => t + (s.giaBan || s.giaGoc) * s.soLuong, 0).toLocaleString()} ¥</span></div>
                            <Button variant="success" size="sm" className="w-100 fw-bold" onClick={() => navigate('/cart')}>XEM GIỎ HÀNG</Button>
                          </>
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

          {/* --- MENU NGANG (Đã thêm) --- */}
          <div className="horizontal-menu-section sticky-top" style={{top: '88px', zIndex: 99}}> 
            <Container>
              <div className="horizontal-menu-list">
                <Link to="/flash-sale" className={`h-menu-item h-item-flash ${location.pathname === '/flash-sale' ? 'active' : ''}`}>
                  <i className="fa-solid fa-bolt me-2"></i> Flash Sale
                </Link>
                <Link to="/danh-muc/khuyen-mai-soc" className={`h-menu-item h-item-sale ${location.pathname.includes('khuyen-mai-soc') ? 'active' : ''}`}>
                  <i className="fa-solid fa-tags me-2"></i> Khuyến mãi sốc
                </Link>
                <Link to="/danh-muc/san-pham-moi" className={`h-menu-item h-item-new ${location.pathname.includes('san-pham-moi') ? 'active' : ''}`}>
                  <i className="fa-solid fa-sparkles me-2"></i> Sản phẩm mới
                </Link>
                <Link to="/danh-muc/san-pham-ban-chay" className={`h-menu-item ${location.pathname.includes('san-pham-ban-chay') ? 'active' : ''}`}>
                  <i className="fa-solid fa-fire me-2 text-danger"></i> Bán chạy nhất
                </Link>
                <Link to="/tin-tuc" className={`h-menu-item ${location.pathname.includes('/tin-tuc') ? 'active' : ''}`}>
                  <i className="fa-solid fa-utensils me-2 text-success"></i> Món ngon mỗi ngày
                </Link>
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
                    {/* Các mục Hot đã chuyển lên menu ngang, giờ chỉ còn danh mục thường */}
                    {dsDanhMuc.filter(d => !d.parent).map(parent => {
                      const hasChild = dsDanhMuc.some(c => c.parent === parent.id);
                      const isOpen = openMenuId === parent.id;
                      return (
                        <div key={parent.id}>
                          <div className={`category-item ${location.pathname.includes(parent.slug || toSlug(parent.ten)) ? 'active' : ''}`} onClick={() => { if(hasChild) setOpenMenuId(isOpen ? null : parent.id); else navigate(`/danh-muc/${parent.slug || toSlug(parent.ten)}`); }}>
                            <span>{parent.icon} {parent.ten}</span>{hasChild && <i className={`fa-solid fa-chevron-${isOpen?'down':'right'} small`}></i>}
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
              <Routes>
                <Route path="/" element={<Home dsDanhMuc={dsDanhMuc} themVaoGio={themVaoGio} shopConfig={shopConfig} banners={banners} />} />
                <Route path="/danh-muc/:slug" element={<Home dsDanhMuc={dsDanhMuc} themVaoGio={themVaoGio} shopConfig={shopConfig} banners={banners} />} />
                <Route path="/san-pham/:slug" element={<ProductDetail themVaoGio={themVaoGio} />} />
                <Route path="/cart" element={<Cart gioHang={gioHang} chinhSuaSoLuong={chinhSuaSoLuong} xoaSanPham={xoaSanPham} currentUser={currentUser} />} />
                <Route path="/checkout" element={<Checkout gioHang={gioHang} setGioHang={setGioHang} userData={userData} />} />
                <Route path="/member" element={<Member themVaoGio={themVaoGio} />} />
                <Route path="/tra-cuu" element={<OrderLookup />} />
                
                {/* [FIX]: Truyền thêm dsSanPham vào đây để tránh lỗi trắng trang khi vào Flash Sale */}
                <Route path="/flash-sale" element={<FlashSale dsSanPham={dsSanPham} themVaoGio={themVaoGio} shopConfig={shopConfig} />} />
                
                <Route path="/auth" element={<Auth />} />
                <Route path="/chinh-sach" element={<PostPage title="Chính sách đổi trả" content={shopConfig.policyContent} />} />
                <Route path="/huong-dan" element={<PostPage title="Hướng dẫn mua hàng" content={shopConfig.guideContent} />} />
                <Route path="/tin-tuc" element={<News />} />
                <Route path="/tin-tuc/:slug" element={<NewsDetail />} />
                
                <Route path="/admin" element={
                  <Suspense fallback={<div className="p-5 text-center">Đang tải trang quản trị...</div>}>
                    <Admin />
                  </Suspense>
                } />
              </Routes>
            </Col>
          </Row>
        </Container>
      </div>
      
      {!isAdminPage && (
        <footer className="footer-section">
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
      )}
    </div>
  );
}
export default Store;