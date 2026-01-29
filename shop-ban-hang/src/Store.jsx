// ... (Phần Import giữ nguyên) ...
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

function Store() {
  // ... (Phần Logic State giữ nguyên) ...
  const navigate = useNavigate();
  const location = useLocation();
  
  const [dsSanPham, setDsSanPham] = useState([]);
  const [dsDanhMuc, setDsDanhMuc] = useState([]);
  const [dsDonHang, setDsDonHang] = useState([]);
  const [banners, setBanners] = useState([]); 
  
  const [gioHang, setGioHang] = useState(() => {
    try {
      const localData = localStorage.getItem('cart');
      return localData ? JSON.parse(localData) : [];
    } catch (error) {
      return [];
    }
  });

  const [tuKhoa, setTuKhoa] = useState('');
  // Cập nhật State shopConfig để nhận thêm các trường mới
  const [shopConfig, setShopConfig] = useState({ 
    tenShop: 'MaiVang Shop', slogan: '', logo: '', diaChi: '', sdt: '', fax:'', email:'',
    openingHours: '', topBarText: '', flashSaleEnd: '', copyright:'', linkPolicy:'', linkGuide:'', 
    linkFacebook:'', zalo:''
  });
  
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null); 

  const [showTopBtn, setShowTopBtn] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [recentProducts, setRecentProducts] = useState([]);
  const [timeLeft, setTimeLeft] = useState({ d:0, h:0, m:0, s:0 });

  useEffect(() => { AOS.init({ duration: 800, once: false }); }, []);
  useEffect(() => { window.scrollTo(0, 0); }, [location]);

  useEffect(() => {
    // ... (Giữ nguyên logic lấy dữ liệu) ...
    const unsubSP = onSnapshot(collection(db, "sanPham"), sn => {
        const data = sn.docs.map(d => ({ id: d.id, ...d.data() }));
        setDsSanPham(data.reverse()); 
    });
    const unsubDM = onSnapshot(collection(db, "danhMuc"), sn => { const d=sn.docs.map(x=>({id:x.id,...x.data()})); d.sort((a,b)=>parseFloat(a.order||0)-parseFloat(b.order||0)); setDsDanhMuc(d); });
    const unsubDH = onSnapshot(collection(db, "donHang"), sn => setDsDonHang(sn.docs.map(d=>({id:d.id,...d.data()}))));
    const unsubBanner = onSnapshot(collection(db, "banners"), sn => setBanners(sn.docs.map(d=>({id:d.id,...d.data()}))));
    const unsubConfig = onSnapshot(doc(db, "cauHinh", "thongTinChung"), d => { if(d.exists()) setShopConfig(d.data()); });
    
    const unsubAuth = onAuthStateChanged(auth, async u => { 
      setCurrentUser(u);
      if (u) {
        const docSnap = await getDoc(doc(db, "users", u.uid));
        if (docSnap.exists()) setUserData(docSnap.data());
      } else {
        setUserData(null);
      }
    });
    
    const scrollH = () => setShowTopBtn(window.scrollY > 300); window.addEventListener('scroll', scrollH);
    return () => { unsubSP(); unsubDM(); unsubDH(); unsubBanner(); unsubConfig(); unsubAuth(); window.removeEventListener('scroll', scrollH); };
  }, []);

  // ... (Giữ nguyên các useEffect khác: FlashSale, Recent, Cart, LocalStorage) ...
  useEffect(() => {
    if(!shopConfig?.flashSaleEnd) return;
    const check = () => {
      const dist = new Date(shopConfig.flashSaleEnd).getTime() - new Date().getTime();
      if (dist > 0) {
        setTimeLeft({ d:Math.floor(dist/(1000*60*60*24)), h:Math.floor((dist%(1000*60*60*24))/(1000*60*60)), m:Math.floor((dist%(1000*60*60))/(1000*60)), s:Math.floor((dist%(1000*60))/1000) });
      }
    };
    check(); const t = setInterval(check, 1000); return () => clearInterval(t);
  }, [shopConfig]);

  useEffect(() => {
    if(dsSanPham.length > 0) {
      try {
        const recentIds = JSON.parse(localStorage.getItem('recent') || '[]');
        const found = recentIds.map(id => dsSanPham.find(p => p.id === id)).filter(Boolean);
        setRecentProducts(found);
      } catch (e) { localStorage.removeItem('recent'); }
    }
  }, [dsSanPham, location.pathname]);

  useEffect(() => {
    if (dsSanPham.length > 0) {
      setGioHang(currentCart => {
        let isChanged = false;
        const newCart = currentCart.map(item => {
          const liveItem = dsSanPham.find(db => db.id === item.id);
          if (liveItem) {
            if (liveItem.soLuong !== item.tonKho) {
              isChanged = true;
              return { ...item, tonKho: liveItem.soLuong }; 
            }
          }
          return item;
        });
        return isChanged ? newCart : currentCart;
      });
    }
  }, [dsSanPham]);

  useEffect(() => localStorage.setItem('cart', JSON.stringify(gioHang)), [gioHang]);

  // ... (Giữ nguyên các hàm: themVaoGio, chinhSuaSoLuong, xoaSanPham, handleLogout) ...
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
  const sanPhamHienThi = dsSanPham.filter(sp => sp.ten?.toLowerCase().includes(tuKhoa.toLowerCase()));
  const isAdminPage = location.pathname.startsWith('/admin');
  const sliderSettings = { dots: true, infinite: true, speed: 500, slidesToShow: 1, slidesToScroll: 1, autoplay: true };

  return (
    <div className="app-container d-flex flex-column min-vh-100">
      <ToastContainer autoClose={2000} />
      <div className={`back-to-top ${showTopBtn ? 'visible' : ''}`} onClick={() => window.scrollTo({top:0, behavior:'smooth'})}><i className="fa-solid fa-arrow-up"></i></div>

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
                <Form className="d-flex flex-grow-1 mx-lg-5 my-2 my-lg-0 search-form-custom" onSubmit={(e) => { e.preventDefault(); navigate('/'); }}>
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
                    {dsSanPham.some(s => s.phanTramGiam > 0) && (
                      <div className={`category-item fw-bold text-danger ${location.pathname.includes('khuyen-mai-soc') ? 'active' : ''}`} onClick={() => navigate('/danh-muc/khuyen-mai-soc')}><span>🔥 KHUYẾN MÃI SỐC</span><i className="fa-solid fa-chevron-right small"></i></div>
                    )}
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
            {!isAdminPage && (
            <div className="mb-4">
                {(() => {
                const isFlashSaleActive = shopConfig?.flashSaleEnd && new Date(shopConfig.flashSaleEnd) > new Date();
                return (
                    <Row className="g-3">
                    {banners.length > 0 && (
                        <Col lg={isFlashSaleActive ? 8 : 12} md={12}>
                        <div className="banner-slider-box">
                            <Slider {...sliderSettings}>
                            {banners.map(b => (<Link key={b.id} to={b.link || '#'}><img src={b.img} className="banner-img-fixed" alt="Banner" /></Link>))}
                            </Slider>
                        </div>
                        </Col>
                    )}
                    {isFlashSaleActive && (
                        <Col lg={banners.length > 0 ? 4 : 12} md={12}>
                        <div className="flash-sale-side-box">
                            <i className="fa-solid fa-bolt flash-bg-icon"></i>
                            <h3 className="flash-side-title"><i className="fa-solid fa-bolt fa-shake me-2 text-warning"></i>FLASH SALE</h3>
                            <p className="small text-white-50 mb-3">Kết thúc sau</p>
                            <div className="d-flex gap-2 mb-3">
                            {[{ val: timeLeft.d, label: 'Ngày' }, { val: timeLeft.h, label: 'Giờ' }, { val: timeLeft.m, label: 'Phút' }, { val: timeLeft.s, label: 'Giây' }].map((item, idx) => (<div key={idx} className="text-center"><div className="countdown-box-sm">{String(item.val).padStart(2,'0')}</div><div className="countdown-label-sm">{item.label}</div></div>))}
                            </div>
                            <Button variant="light" size="sm" className="rounded-pill fw-bold text-danger px-4 shadow-sm" onClick={() => navigate('/flash-sale')}>XEM TẤT CẢ <i className="fa-solid fa-arrow-right ms-1"></i></Button>
                        </div>
                        </Col>
                    )}
                    </Row>
                );
                })()}
            </div>
            )}
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
      
        {!isAdminPage && recentProducts.length > 0 && (
        <div className="recent-view-section">
            <Container>
            <h5 className="recent-title"><i className="fa-solid fa-clock-rotate-left"></i> Sản phẩm bạn vừa xem</h5>
            <div className="recent-list-scroll">
                {recentProducts.map(sp => (
                <Link key={sp.id} to={`/san-pham/${sp.slug || toSlug(sp.ten)}`} className="recent-card">
                <img src={sp.anh} alt={sp.ten} className="recent-card-img" />
                <div className="recent-card-body">
                <div className="recent-card-name" title={sp.ten}>{sp.ten}</div>
                <div className="recent-card-price mb-1">{sp.giaBan?.toLocaleString()} <span className="currency-symbol">¥</span></div>
                <div className="small text-muted d-flex align-items-center gap-1"><span>Số lượng:</span><span className="fw-bold text-danger">{sp.soLuong}</span><span className="tag-donvi" style={{fontSize:'10px', padding:'1px 5px', margin:0}}>{sp.donVi}</span></div>
                </div>                    
            </Link>
                ))}
            </div>
            </Container>
        </div>
        )}

      {/* --- FOOTER ĐÃ ĐƯỢC CẬP NHẬT --- */}
      {!isAdminPage && (
        <footer className="footer-section">
          <Container>
            <Row>
              <Col md={4} className="mb-4">
                <h5 className="footer-title">{shopConfig.tenShop}</h5>
                <p><i className="fa-solid fa-location-dot me-2 text-success"></i> {shopConfig.diaChi}</p>
                <p><i className="fa-solid fa-phone me-2 text-success"></i> {shopConfig.sdt}</p>
                {/* Thêm Fax và Email */}
                {shopConfig.fax && <p><i className="fa-solid fa-fax me-2 text-success"></i> {shopConfig.fax}</p>}
                {shopConfig.email && <p><i className="fa-solid fa-envelope me-2 text-success"></i> {shopConfig.email}</p>}
              </Col>
              
              <Col md={3} className="mb-4">
                <h5 className="footer-title">VỀ CHÚNG TÔI</h5>
                <Link to="/" className="footer-link">Trang chủ</Link>
                <Link to="/flash-sale" className="footer-link">Khuyến mãi</Link>
                <Link to="/tra-cuu" className="footer-link">Tra cứu đơn</Link>
              </Col>
              
              <Col md={3} className="mb-4">
                <h5 className="footer-title">HỖ TRỢ</h5>
                {/* Sử dụng Link từ Admin Config */}
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
          {/* Hiển thị Copyright từ Admin */}
          <div className="copyright-bar">
            {shopConfig.copyright || `@${new Date().getFullYear()} ${shopConfig.tenShop}. All rights reserved.`}
          </div>
        </footer>
      )}
    </div>
  );
}
export default Store;