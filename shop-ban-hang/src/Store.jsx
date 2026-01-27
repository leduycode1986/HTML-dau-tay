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
  const navigate = useNavigate();
  const location = useLocation();
  
  const [dsSanPham, setDsSanPham] = useState([]);
  const [dsDanhMuc, setDsDanhMuc] = useState([]);
  const [dsDonHang, setDsDonHang] = useState([]);
  const [banners, setBanners] = useState([]); 
  
  // --- Xử lý giỏ hàng an toàn ---
  const [gioHang, setGioHang] = useState(() => {
    try {
      const localData = localStorage.getItem('cart');
      return localData ? JSON.parse(localData) : [];
    } catch (error) {
      return [];
    }
  });

  const [tuKhoa, setTuKhoa] = useState('');
  const [shopConfig, setShopConfig] = useState({ 
    tenShop: 'MaiVang Shop', slogan: '', logo: '', diaChi: '', sdt: '', openingHours: '', topBarText: '', flashSaleEnd: '' 
  });
  
  const [currentUser, setCurrentUser] = useState(null);
  
  // --- ĐÂY LÀ DÒNG BỊ THIẾU GÂY LỖI TRẮNG TRANG (ĐÃ THÊM LẠI) ---
  const [userData, setUserData] = useState(null); 
  // -------------------------------------------------------------

  const [showTopBtn, setShowTopBtn] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [recentProducts, setRecentProducts] = useState([]);
  const [timeLeft, setTimeLeft] = useState({ d:0, h:0, m:0, s:0 });

  useEffect(() => { AOS.init({ duration: 800, once: false }); }, []);
  useEffect(() => { window.scrollTo(0, 0); }, [location]);

  useEffect(() => {
    const unsubSP = onSnapshot(collection(db, "sanPham"), sn => setDsSanPham(sn.docs.map(d=>({id:d.id,...d.data()}))));
    const unsubDM = onSnapshot(collection(db, "danhMuc"), sn => { const d=sn.docs.map(x=>({id:x.id,...x.data()})); d.sort((a,b)=>parseFloat(a.order||0)-parseFloat(b.order||0)); setDsDanhMuc(d); });
    const unsubDH = onSnapshot(collection(db, "donHang"), sn => setDsDonHang(sn.docs.map(d=>({id:d.id,...d.data()}))));
    const unsubBanner = onSnapshot(collection(db, "banners"), sn => setBanners(sn.docs.map(d=>({id:d.id,...d.data()}))));
    const unsubConfig = onSnapshot(doc(db, "cauHinh", "thongTinChung"), d => { if(d.exists()) setShopConfig(d.data()); });
    
    // --- Cập nhật logic lấy UserData ---
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

  // Logic Đếm ngược Flash Sale
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
        {/* --- THANH THÔNG BÁO CHẠY (MARQUEE) --- */}
            <div className="top-bar-notification">
            <div className="marquee-text">
                <span className="me-4">{shopConfig.topBarText || "Chào mừng bạn đến với Thực Phẩm Mai Vàng!"}</span>
                
                {/* Nếu có giờ mở cửa thì hiện thêm icon đồng hồ */}
                {shopConfig.openingHours && (
                <span className="mx-4">
                    <i className="fa-regular fa-clock me-1"></i> Mở cửa: {shopConfig.openingHours}
                </span>
                )}                
            </div>
            </div>
          
          <Navbar bg="white" expand="lg" className="sticky-top shadow-sm py-3" style={{zIndex: 100, borderBottom:'3px solid #198754'}}>
            <Container>
            <Navbar.Brand as={Link} to="/" className="me-4 text-decoration-none brand-group">
                {shopConfig.logo ? (<img src={shopConfig.logo} alt="Logo" className="brand-logo-img" />) : 
                (<span className="fs-1">🦁</span>)}
                <div className="brand-info">
                <h1 className="shop-name">{shopConfig.tenShop}</h1>
                <span className="shop-slogan">{shopConfig.slogan}</span>
                </div>
            </Navbar.Brand>
              <Navbar.Toggle />
              <Navbar.Collapse>
                <Form className="d-flex flex-grow-1 mx-lg-5 my-2 my-lg-0 search-form-custom" onSubmit={(e) => {
                    e.preventDefault();
                    navigate('/'); // QUAN TRỌNG: Bấm tìm là phải về Trang chủ mới thấy kết quả
                }}>
                <div className="input-group">
                    <Form.Control 
                    type="search" 
                    placeholder="Tìm sản phẩm...?" 
                    value={tuKhoa} 
                    onChange={e => setTuKhoa(e.target.value)} 
                    className="search-input" 
                    />
                    <Button variant="success" type="submit" className="search-btn">
                    <i className="fa-solid fa-magnifying-glass"></i>
                    </Button>
                </div>
                </Form>
                    <Nav className="align-items-center gap-3">
                    <div className="d-none d-lg-flex header-hotline-box">
                    <div className="hotline-icon"><i className="fa-solid fa-phone"></i></div>
                    <span className="hotline-number">{shopConfig.sdt}</span>
                  </div>
                  {/* Nút Tra Đơn: Thêm icon xe tải, dùng style viền xanh */}
                    <Link to="/tra-cuu" className="btn-header-action btn-lookup">
                        <i className="fa-solid fa-truck-fast"></i> Tra đơn
                    </Link>
                    <Link to="/cart" className="btn-header-action btn-cart-header px-4">
                        <i className="fa-solid fa-cart-shopping"></i> Giỏ
                        {/* Số lượng món: Đã style lại hình tròn đỏ nổi bật */}
                        <span className="cart-badge">
                        {gioHang.reduce((a,b)=>a+b.soLuong,0)}
                        </span>
                    </Link>
                  
                  {/* Nút Tài Khoản / Đăng Nhập */}
                  {currentUser ? (
                    <Dropdown align="end">
                    <Dropdown.Toggle variant="light" className="border-0 fw-bold d-flex align-items-center gap-2" style={{outline:'none', boxShadow:'none'}}>
                        <img src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png" width="35" alt="User" />
                        <span className="d-none d-xl-block small text-start">
                        <div style={{fontSize:'11px', color:'#999'}}>Xin chào,</div>
                        <div className="text-success">{currentUser.displayName || 'Thành viên'}</div>
                        </span>
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                        <Dropdown.Item as={Link} to="/member"><i className="fa-solid fa-user-gear me-2"></i> Tài khoản của tôi</Dropdown.Item>
                        <Dropdown.Divider />
                        <Dropdown.Item onClick={handleLogout} className="text-danger fw-bold"><i className="fa-solid fa-right-from-bracket me-2"></i> Đăng xuất</Dropdown.Item>
                    </Dropdown.Menu>
                    </Dropdown>
                ) : (
                    // Nút Đăng Nhập: Thay vì chữ text đơn điệu, giờ là nút màu đỏ
                    <Link to="/auth" className="btn-header-action btn-login-header">
                    <i className="fa-regular fa-user"></i> Đăng nhập
                    </Link>
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
             {/* --- KHU VỰC BANNER & FLASH SALE (CLEAN CODE) --- */}
            {!isAdminPage && (
            <div className="mb-4">
                {(() => {
                const isFlashSaleActive = shopConfig?.flashSaleEnd && new Date(shopConfig.flashSaleEnd) > new Date();
                
                return (
                    <Row className="g-3">
                    
                    {/* 1. SLIDER BANNER */}
                    {banners.length > 0 && (
                        <Col lg={isFlashSaleActive ? 8 : 12} md={12}>
                        <div className="banner-slider-box">
                            <Slider {...sliderSettings}>
                            {banners.map(b => (
                                <Link key={b.id} to={b.link || '#'}>
                                <img src={b.img} className="banner-img-fixed" alt="Banner" />
                                </Link>
                            ))}
                            </Slider>
                        </div>
                        </Col>
                    )}

                    {/* 2. FLASH SALE BOX (Bên phải) */}
                    {isFlashSaleActive && (
                        <Col lg={banners.length > 0 ? 4 : 12} md={12}>
                        <div className="flash-sale-side-box">
                            {/* Icon nền trang trí */}
                            <i className="fa-solid fa-bolt flash-bg-icon"></i>

                            <h3 className="flash-side-title">
                            <i className="fa-solid fa-bolt fa-shake me-2 text-warning"></i>FLASH SALE
                            </h3>
                            
                            <p className="small text-white-50 mb-3">Kết thúc sau</p>

                            {/* Bộ đếm giờ */}
                            <div className="d-flex gap-2 mb-3">
                            {[
                                { val: timeLeft.d, label: 'Ngày' }, 
                                { val: timeLeft.h, label: 'Giờ' }, 
                                { val: timeLeft.m, label: 'Phút' }, 
                                { val: timeLeft.s, label: 'Giây' }
                            ].map((item, idx) => (
                                <div key={idx} className="text-center">
                                <div className="countdown-box-sm">
                                    {String(item.val).padStart(2,'0')}
                                </div>
                                <div className="countdown-label-sm">{item.label}</div>
                                </div>
                            ))}
                            </div>

                            <Button variant="light" size="sm" className="rounded-pill fw-bold text-danger px-4 shadow-sm" onClick={() => navigate('/flash-sale')}>
                            XEM TẤT CẢ <i className="fa-solid fa-arrow-right ms-1"></i>
                            </Button>
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
      {/* --- KHU VỰC SẢN PHẨM VỪA XEM (ĐÃ LÀM ĐẸP) --- */}
        {!isAdminPage && recentProducts.length > 0 && (
        <div className="recent-view-section">
            <Container>
            <h5 className="recent-title">
                <i className="fa-solid fa-clock-rotate-left"></i> Sản phẩm bạn vừa xem
            </h5>
            
            <div className="recent-list-scroll">
                {recentProducts.map(sp => (
                <Link key={sp.id} to={`/san-pham/${sp.slug || toSlug(sp.ten)}`} className="recent-card">
                    
                    {/* Ảnh sản phẩm */}
                    <img src={sp.anh} alt={sp.ten} className="recent-card-img" />
                    
                    {/* Tên và Giá */}
                    <div className="recent-card-body">
                    <div className="recent-card-name" title={sp.ten}>{sp.ten}</div>
                    <div className="recent-card-price">
                    {sp.giaBan?.toLocaleString()}
                    {/* Đổi lại thành Yên Nhật theo đúng yêu cầu */}
                    <span className="currency-symbol">¥</span>
                    </div>
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
export default Store;