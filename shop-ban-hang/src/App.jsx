import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { db } from './firebase'; 
import { collection, onSnapshot, doc, deleteDoc, updateDoc, addDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Badge, Button, Form, Container, Navbar, Nav, Row, Col } from 'react-bootstrap';

import Home from './Home';
import ProductDetail from './ProductDetail';
import Cart from './Cart';
import Admin from './Admin';

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [dsSanPham, setDsSanPham] = useState([]);
  const [dsDanhMuc, setDsDanhMuc] = useState([]);
  const [dsDonHang, setDsDonHang] = useState([]);
  const [gioHang, setGioHang] = useState(() => JSON.parse(localStorage.getItem('cart') || '[]'));
  const [tuKhoa, setTuKhoa] = useState('');
  const [shopConfig, setShopConfig] = useState({ 
    tenShop: 'MaiVang Shop', slogan: '', logo: '', 
    diaChi: '', sdt: '', linkFacebook: '', copyright: '@2024 Thực phẩm Mai Vàng' 
  });

  useEffect(() => {
    const unsubSP = onSnapshot(collection(db, "sanPham"), (sn) => setDsSanPham(sn.docs.map(d => ({id: d.id, ...d.data()}))));
    const unsubDM = onSnapshot(collection(db, "danhMuc"), (sn) => {
      const data = sn.docs.map(d => ({id: d.id, ...d.data()}));
      data.sort((a, b) => parseFloat(a.order || 0) - parseFloat(b.order || 0));
      setDsDanhMuc(data);
    });
    const unsubDH = onSnapshot(collection(db, "donHang"), (sn) => setDsDonHang(sn.docs.map(d => ({id: d.id, ...d.data()}))));
    const unsubConfig = onSnapshot(doc(db, "cauHinh", "thongTinChung"), (doc) => { if (doc.exists()) setShopConfig(doc.data()); });
    return () => { unsubSP(); unsubDM(); unsubDH(); unsubConfig(); };
  }, []);

  useEffect(() => localStorage.setItem('cart', JSON.stringify(gioHang)), [gioHang]);

  const themVaoGio = (sp) => {
    const check = gioHang.find(i => i.id === sp.id);
    if (check) setGioHang(gioHang.map(i => i.id === sp.id ? {...i, soLuong: i.soLuong + 1} : i));
    else setGioHang([...gioHang, {...sp, soLuong: 1}]);
  };

  const handleDatHang = async (khach) => {
    const tongTien = gioHang.reduce((t, s) => t + (s.giaBan || s.giaGoc) * s.soLuong, 0);
    await addDoc(collection(db, "donHang"), { khachHang: khach, gioHang, tongTien, trangThai: 'Mới đặt', ngayDat: serverTimestamp() });
    setGioHang([]); alert("Đặt hàng thành công!"); navigate('/');
  };

  const chinhSuaSoLuong = (id, kieu) => {
    setGioHang(gioHang.map(i => i.id === id ? {...i, soLuong: kieu === 'tang' ? i.soLuong + 1 : Math.max(1, i.soLuong - 1)} : i));
  };
  const xoaSanPham = (id) => setGioHang(gioHang.filter(i => i.id !== id));
  
  const sanPhamHienThi = dsSanPham.filter(sp => sp.ten?.toLowerCase().includes(tuKhoa.toLowerCase()));
  const isAdminPage = location.pathname.startsWith('/admin');

  return (
    <div className="app-container d-flex flex-column min-vh-100">
      {!isAdminPage && (
        <Navbar bg="white" variant="light" expand="lg" className="sticky-top shadow-sm py-2 border-bottom">
          <Container>
            <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
              {shopConfig.logo ? (
                <img src={shopConfig.logo} alt="Logo" className="me-2 rounded shop-logo" />
              ) : (
                <span className="fs-2 me-2">🦁</span>
              )}
              <div className="d-flex flex-column">
                <span className="fw-bold text-success text-uppercase" style={{fontSize: '1.1rem'}}>{shopConfig.tenShop}</span>
                <span className="text-warning small fw-bold" style={{fontSize: '0.7rem'}}>⭐ {shopConfig.slogan} ⭐</span>
              </div>
            </Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="w-100 d-flex justify-content-between align-items-center ms-lg-4 mt-3 mt-lg-0">
                
                {/* --- 1. Ô TÌM KIẾM CÓ NÚT + HOTLINE --- */}
                <Form className="d-flex flex-grow-1 mx-lg-3">
                  <Form.Control type="search" placeholder="🔍 Tìm kiếm..." className="rounded-start border-1 bg-light px-3 py-2" value={tuKhoa} onChange={(e) => setTuKhoa(e.target.value)} />
                  <Button variant="success" className="rounded-end px-3"><i className="fa-solid fa-magnifying-glass"></i></Button>
                </Form>
                {shopConfig.sdt && (
                  <div className="d-none d-xl-block ms-3 header-hotline">
                    <i className="fa-solid fa-phone-volume me-1"></i> Hotline/Zalo:<br/>
                    <span className="fs-6">{shopConfig.sdt}</span>
                  </div>
                )}
                {/* --------------------------------------- */}

                <Link to="/cart" className="text-decoration-none ms-lg-3 mt-3 mt-lg-0">
                  <Button variant="success" className="rounded-pill fw-bold px-4 py-2 d-flex align-items-center gap-2 shadow-sm">
                    <i className="fa-solid fa-cart-shopping"></i> Giỏ <Badge bg="warning" text="dark" pill>{gioHang.reduce((acc, item) => acc + item.soLuong, 0)}</Badge>
                  </Button>
                </Link>
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>
      )}

      <div className="flex-grow-1">
        <Routes>
          <Route path="/" element={<Home dsSanPham={sanPhamHienThi} dsDanhMuc={dsDanhMuc} themVaoGio={themVaoGio} />} />
          <Route path="/product/:id" element={<ProductDetail dsSanPham={dsSanPham} dsDanhMuc={dsDanhMuc} themVaoGio={themVaoGio} />} />
          <Route path="/category/:id" element={<Home dsSanPham={sanPhamHienThi} dsDanhMuc={dsDanhMuc} themVaoGio={themVaoGio} />} />
          <Route path="/cart" element={<Cart gioHang={gioHang} dsDanhMuc={dsDanhMuc} handleDatHang={handleDatHang} chinhSuaSoLuong={chinhSuaSoLuong} xoaSanPham={xoaSanPham} />} />
          
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

      {/* --- 2. FOOTER (CHÂN TRANG) --- */}
      {!isAdminPage && (
        <footer className="footer-section pt-5 mt-4">
          <Container>
            <Row className="pb-4">
              <Col md={4} className="mb-4">
                <div className="d-flex align-items-center mb-3">
                  {shopConfig.logo ? <img src={shopConfig.logo} alt="Logo" style={{height:'40px', marginRight:'10px'}} /> : <span className="fs-3 me-2">🦁</span>}
                  <span className="fw-bold text-success fs-5">{shopConfig.tenShop}</span>
                </div>
                <p className="text-muted small">{shopConfig.slogan}</p>
              </Col>
              <Col md={4} className="mb-4">
                <div className="footer-title">Thông tin liên hệ</div>
                <div className="footer-info-item"><i className="fa-solid fa-location-dot mt-1 text-success"></i> <span>{shopConfig.diaChi || 'Đang cập nhật địa chỉ...'}</span></div>
                <div className="footer-info-item"><i className="fa-solid fa-phone mt-1 text-success"></i> <span>{shopConfig.sdt || 'Đang cập nhật SĐT...'}</span></div>
                <div className="footer-info-item"><i className="fa-brands fa-facebook mt-1 text-success"></i> <a href={shopConfig.linkFacebook || '#'} target="_blank" rel="noreferrer" className="text-dark">Fanpage Facebook</a></div>
              </Col>
              <Col md={4} className="mb-4">
                <div className="footer-title">Hỗ trợ khách hàng</div>
                <div className="footer-info-item"><i className="fa-solid fa-check text-success"></i> Hướng dẫn mua hàng</div>
                <div className="footer-info-item"><i className="fa-solid fa-check text-success"></i> Chính sách đổi trả</div>
                <div className="footer-info-item"><i className="fa-solid fa-check text-success"></i> Hình thức thanh toán</div>
              </Col>
            </Row>
          </Container>
          <div className="copyright-bar">
            {shopConfig.copyright || '@2024 Thực phẩm Mai Vàng'}
          </div>
        </footer>
      )}

      {/* --- 3. NÚT CHAT ZALO & MESSENGER --- */}
      {!isAdminPage && (
        <div className="floating-chat-container">
          {shopConfig.linkFacebook && (
            <a href={shopConfig.linkFacebook} target="_blank" rel="noreferrer" className="chat-btn mess-btn" title="Chat Messenger">
              <i className="fa-brands fa-facebook-messenger"></i>
            </a>
          )}
          {shopConfig.sdt && (
            <a href={`https://zalo.me/${shopConfig.sdt}`} target="_blank" rel="noreferrer" className="chat-btn zalo-btn" title="Chat Zalo">
              <i className="fa-solid fa-comment-dots"></i>
            </a>
          )}
        </div>
      )}
    </div>
  );
}
export default App;