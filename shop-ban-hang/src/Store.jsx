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
          <div className="top-bar-notification" style={{background: '#b71c1c', color: 'white', padding: '8px 0', fontSize: '13px', fontWeight: 'bold', textAlign:'center'}}>
            <span>{shopConfig.topBarText}</span>
            {shopConfig.openingHours && <span className="ms-3"><i className="fa-regular fa-clock"></i> Mở cửa: {shopConfig.openingHours}</span>}
          </div>
          
          <Navbar bg="white" expand="lg" className="sticky-top shadow-sm py-3" style={{zIndex: 100, borderBottom:'3px solid #198754'}}>
            <Container>
              <Navbar.Brand as={Link} to="/" className="me-4 text-decoration-none d-flex align-items-center gap-3">
                {shopConfig.logo ? <img src={shopConfig.logo} alt="Logo" style={{height:'80px', width:'auto', objectFit:'contain'}} /> : <span className="fs-1">🦁</span>}
                <div className="d-flex flex-column justify-content-center" style={{lineHeight:1}}>
                  <h1 style={{fontSize:'2rem', fontWeight:'900', color:'#198754', textTransform:'uppercase', margin:0}}>{shopConfig.tenShop}</h1>
                  <span style={{fontSize:'0.9rem', color:'#d63384', fontWeight:'700', letterSpacing:'1px', textTransform:'uppercase'}}>{shopConfig.slogan}</span>
                </div>
              </Navbar.Brand>

              <Navbar.Toggle />
              <Navbar.Collapse>
                <Form className="d-flex flex-grow-1 mx-lg-4 my-2 my-lg-0" onSubmit={e=>e.preventDefault()}>
                  <div className="input-group">
                    <Form.Control type="search" placeholder="Bạn tìm gì...?" value={tuKhoa} onChange={e=>setTuKhoa(e.target.value)} className="border-end-0 bg-light p-2" />
                    <Button variant="light" className="border border-start-0 bg-light"><i className="fa-solid fa-magnifying-glass"></i></Button>
                  </div>
                </Form>
                
                <Nav className="align-items-center gap-3">
                  <div className="d-none d-lg-flex flex-column align-items-end pe-3" style={{borderRight:'2px solid #eee'}}>
                    <span className="text-muted small fw-bold text-uppercase">Tổng đài hỗ trợ</span>
                    <span style={{fontSize:'2rem', fontWeight:'900', color:'#d32f2f', lineHeight:1}}>{shopConfig.sdt}</span>
                  </div>

                  <Link to="/tra-cuu" className="btn btn-outline-secondary rounded-pill fw-bold">Tra đơn</Link>
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
              {!isAdminPage && (
                <>
                  {shopConfig?.flashSaleEnd && new Date(shopConfig.flashSaleEnd) > new Date() && (
                    <div className="text-center shadow-sm rounded-3 mb-4" style={{ background: 'linear-gradient(135deg, #d32f2f, #ff5252)', color: 'white', padding: '25px 0', borderBottom: '4px solid #b71c1c' }}>
                      <Container>
                        <h2 style={{ fontWeight: '800', fontSize: '1.8rem', textTransform: 'uppercase', marginBottom: '15px', textShadow: '2px 2px 4px rgba(0,0,0,0.2)' }}>
                          <i className="fa-solid fa-bolt fa-shake"></i> FLASH SALE
                        </h2>
                        <div className="d-flex justify-content-center gap-3 align-items-center">
                          <div className="time-box" style={{ width: '45px', height: '45px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.4)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '18px', borderRadius: '6px' }}>{String(timeLeft.d).padStart(2,'0')}</div>:
                          <div className="time-box" style={{ width: '45px', height: '45px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.4)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '18px', borderRadius: '6px' }}>{String(timeLeft.h).padStart(2,'0')}</div>:
                          <div className="time-box" style={{ width: '45px', height: '45px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.4)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '18px', borderRadius: '6px' }}>{String(timeLeft.m).padStart(2,'0')}</div>:
                          <div className="time-box bg-white text-danger border-0" style={{ width: '45px', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '18px', borderRadius: '6px' }}>{String(timeLeft.s).padStart(2,'0')}</div>
                        </div>
                        <Button variant="light" className="mt-4 rounded-pill fw-bold text-danger px-4" onClick={()=>navigate('/flash-sale')}>XEM TẤT CẢ</Button>
                      </Container>
                    </div>
                  )}

                  {banners.length > 0 && (
                    <div className="mb-4 rounded overflow-hidden shadow-sm">
                      <Slider {...sliderSettings}>
                        {banners.map(b=><Link key={b.id} to={b.link||'#'}><img src={b.img} className="w-100" style={{height:320, objectFit:'cover'}}/></Link>)}
                      </Slider>
                    </div>
                  )}
                </>
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
        <div style={{ background: 'white', borderTop: '4px solid #198754', padding: '30px 0', marginTop: '40px', boxShadow: '0 -5px 15px rgba(0,0,0,0.05)' }}>
          <Container>
            <h5 className="fw-bold text-secondary mb-3 small text-uppercase" style={{letterSpacing:1}}>
              <i className="fa-solid fa-clock-rotate-left me-2"></i> Sản phẩm bạn vừa xem
            </h5>
            <div style={{ display: 'flex', gap: '20px', overflowX: 'auto', padding: '15px 5px', scrollbarWidth: 'thin' }}>
              {recentProducts.map(sp => (
                <Link key={sp.id} to={`/san-pham/${sp.slug || toSlug(sp.ten)}`} className="text-decoration-none" style={{ 
                    flex: '0 0 auto', width: '180px', minWidth: '180px', border: '1px solid #eee', borderRadius: '8px', 
                    overflow: 'hidden', background: 'white', boxShadow: '0 3px 8px rgba(0,0,0,0.05)', color: 'inherit' 
                  }}>
                  <img src={sp.anh} alt={sp.ten} style={{ width: '100%', height: '140px', objectFit: 'cover', borderBottom: '1px solid #f1f1f1' }} />
                  <div style={{ padding: '12px', textAlign: 'center' }}>
                    <div style={{ fontSize: '13px', fontWeight: '700', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '5px', color: '#333' }}>{sp.ten}</div>
                    <div style={{ fontSize: '15px', fontWeight: '800', color: '#d32f2f' }}>{sp.giaBan?.toLocaleString()}₫</div>
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