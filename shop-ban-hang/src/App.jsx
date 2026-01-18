import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom'
import Home from './Home'
import Cart from './Cart'
import ProductDetail from './ProductDetail'
import Admin from './Admin'
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Badge from 'react-bootstrap/Badge';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { useState, useEffect } from 'react';
import { products as khoHangBanDau } from './products'

const colors = { 
    primaryGreen: '#008848', 
    accentYellow: '#ffc107', 
    bgLight: '#f0fdf4', 
    textDark: '#333',
    menuActiveBg: '#e6f7eb' 
};

function App() {
  
  // 1. DỮ LIỆU SẢN PHẨM (CÓ LƯU BỘ NHỚ)
  const [dsSanPham, setDsSanPham] = useState(() => {
      const saved = localStorage.getItem('dsSanPham');
      return saved ? JSON.parse(saved) : khoHangBanDau;
  });
  useEffect(() => { localStorage.setItem('dsSanPham', JSON.stringify(dsSanPham)); }, [dsSanPham]);

  // 2. DỮ LIỆU DANH MỤC (CÓ LƯU BỘ NHỚ)
  const [dsDanhMuc, setDsDanhMuc] = useState(() => {
      const saved = localStorage.getItem('dsDanhMuc');
      return saved ? JSON.parse(saved) : [
        { id: 'all', ten: 'Tất cả', icon: '🏠' },
        { id: 'thitca', ten: 'Thịt, Cá', icon: '🥩' },
        { id: 'raucu', ten: 'Rau Củ', icon: '🥦' },
        { id: 'douong', ten: 'Đồ Uống', icon: '🍺' }
      ];
  });
  useEffect(() => { localStorage.setItem('dsDanhMuc', JSON.stringify(dsDanhMuc)); }, [dsDanhMuc]);

  const [danhMucHienTai, setDanhMucHienTai] = useState('all'); 
  const [tuKhoa, setTuKhoa] = useState('');
  const navigate = useNavigate();
  const location = useLocation(); 

  // 3. GIỎ HÀNG
  const [gioHang, setGioHang] = useState(() => {
      const duLieuCu = localStorage.getItem('gioHangCuaDuy');
      return duLieuCu ? JSON.parse(duLieuCu) : [];
  });
  useEffect(() => { localStorage.setItem('gioHangCuaDuy', JSON.stringify(gioHang)); }, [gioHang]);

  function themVaoGio(sanPhamCanMua) {
    const sanPhamDaCo = gioHang.find(sp => sp.id === sanPhamCanMua.id);
    if (sanPhamDaCo) {
      setGioHang(gioHang.map(sp => sp.id === sanPhamCanMua.id ? { ...sp, soLuong: sp.soLuong + 1 } : sp));
    } else {
      setGioHang([...gioHang, { ...sanPhamCanMua, soLuong: 1 }]);
    }
  }

  function chinhSuaSoLuong(id, loai) {
     setGioHang(gioHang.map(sp => {
        if (sp.id === id) {
           const sl = loai === 'tang' ? sp.soLuong + 1 : sp.soLuong - 1;
           return { ...sp, soLuong: Math.max(1, sl) }; 
        } return sp;
     }));
  }

  function xoaSanPham(id) { setGioHang(gioHang.filter(sp => sp.id !== id)); }
  function xoaHetGioHang() { setGioHang([]); }

  // --- NẾU LÀ TRANG ADMIN ---
  if (location.pathname === '/admin') {
      return (
        <Routes>
            <Route path="/admin" element={
                <Admin 
                    dsSanPham={dsSanPham} setDsSanPham={setDsSanPham} 
                    dsDanhMuc={dsDanhMuc} setDsDanhMuc={setDsDanhMuc} 
                />
            } />
        </Routes>
      );
  }

  // --- GIAO DIỆN KHÁCH HÀNG ---
  return (
    <div style={{ backgroundColor: colors.bgLight, minHeight: '100vh', fontFamily: 'Segoe UI, sans-serif' }}>
      
      {/* HEADER */}
      <Navbar style={{ backgroundColor: colors.primaryGreen, borderBottom: `4px solid ${colors.accentYellow}` }} variant="dark" expand="lg" sticky="top">
        <Container fluid>
          <Navbar.Brand as={Link} to="/" onClick={() => { setDanhMucHienTai('all'); setTuKhoa('') }} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ backgroundColor: 'white', borderRadius: '50%', padding: '2px', width: '45px', height: '45px', border: `2px solid ${colors.accentYellow}` }}>
                <img src="/img/logo.jpg" alt="Logo" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'contain' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '1' }}>
                <span style={{ color: '#fff', fontSize: '12px' }}>Thực phẩm sạch</span>
                <span style={{ color: colors.accentYellow, fontWeight: '900', fontSize: '20px' }}>MAIVANG</span>
            </div>
          </Navbar.Brand>
          
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <div className="mx-auto my-2" style={{ width: '100%', maxWidth: '600px' }}>
                <Form className="d-flex">
                    <Form.Control 
                        type="search" 
                        placeholder="🔍 Tìm kiếm thịt, cá, rau củ..." 
                        className="me-2" 
                        style={{ borderRadius: '20px' }} 
                        value={tuKhoa} 
                        onChange={(e) => { setTuKhoa(e.target.value); navigate('/'); }} 
                    />
                </Form>
            </div>
            <Nav className="ms-auto" style={{alignItems: 'center', gap: '15px'}}>
                <Link to="/admin" style={{color: 'rgba(255,255,255,0.8)', textDecoration: 'none', fontSize: '14px', fontWeight: 'bold'}}>🔧 Admin</Link>

                <Nav.Link as={Link} to="/cart" className="d-flex align-items-center gap-2 text-white">
                    <div style={{ position: 'relative' }}>
                        <span style={{fontSize: '24px'}}>🛒</span> 
                        <Badge bg="warning" text="dark" style={{ position: 'absolute', top: '-8px', right: '-10px', borderRadius: '50%' }}>
                        {gioHang.reduce((tong, sp) => tong + sp.soLuong, 0)}
                        </Badge>
                    </div>
                </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* --- PHẦN THÂN TRANG (BỐ CỤC 2 CỘT) --- */}
      <Container fluid style={{ marginTop: '20px' }}>
        <Row>
            {/* 1. CỘT TRÁI: MENU DỌC (Chỉ hiện trên Desktop) */}
            <Col md={3} lg={2} className="d-none d-md-block" style={{ marginBottom: '20px' }}>
                <div style={{ backgroundColor: 'white', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', overflow: 'hidden', position: 'sticky', top: '90px' }}>
                    <h5 style={{ backgroundColor: colors.primaryGreen, color: 'white', padding: '15px', margin: 0, textAlign: 'center', fontWeight: 'bold', fontSize: '16px' }}>
                        ☰ DANH MỤC
                    </h5>
                    <div style={{ padding: '10px' }}>
                        {dsDanhMuc.map((dm) => (
                            <button 
                                key={dm.id}
                                onClick={() => {
                                    setDanhMucHienTai(dm.id);
                                    navigate('/');
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                                style={{
                                    width: '100%', textAlign: 'left', padding: '12px 15px', border: 'none', borderRadius: '8px', marginBottom: '5px',
                                    backgroundColor: danhMucHienTai === dm.id ? colors.menuActiveBg : 'transparent',
                                    color: danhMucHienTai === dm.id ? colors.primaryGreen : colors.textDark,
                                    fontWeight: danhMucHienTai === dm.id ? 'bold' : 'normal',
                                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', transition: 'all 0.2s'
                                }}
                            >
                                <span style={{fontSize: '18px'}}>{dm.icon}</span> {dm.ten}
                            </button>
                        ))}
                    </div>
                </div>
            </Col>

            {/* 2. CỘT PHẢI: NỘI DUNG CHÍNH */}
            <Col md={9} lg={10}>
                 {/* Menu ngang cho Mobile (Chỉ hiện khi màn hình nhỏ) */}
                 <div className="d-md-none" style={{ overflowX: 'auto', whiteSpace: 'nowrap', paddingBottom: '10px', marginBottom: '15px' }}>
                    {dsDanhMuc.map(dm => (
                         <button key={dm.id} onClick={() => setDanhMucHienTai(dm.id)} style={{
                             padding: '8px 15px', marginRight: '10px', borderRadius: '20px', 
                             border: danhMucHienTai === dm.id ? `2px solid ${colors.accentYellow}` : '1px solid #ccc',
                             backgroundColor: danhMucHienTai === dm.id ? colors.accentYellow : 'white',
                             color: danhMucHienTai === dm.id ? 'black' : '#555', fontWeight: 'bold'
                         }}>
                             {dm.icon} {dm.ten}
                         </button>
                    ))}
                 </div>

                 <Routes>
                    <Route path="/" element={<Home dsSanPham={dsSanPham} themVaoGio={themVaoGio} danhMuc={danhMucHienTai} tuKhoa={tuKhoa} colors={colors} />} />
                    <Route path="/product/:id" element={<ProductDetail dsSanPham={dsSanPham} themVaoGio={themVaoGio} colors={colors} />} />
                    <Route path="/cart" element={<Cart gioHang={gioHang} chinhSuaSoLuong={chinhSuaSoLuong} xoaSanPham={xoaSanPham} xoaHetGioHang={xoaHetGioHang} colors={colors} />} />
                 </Routes>
            </Col>
        </Row>
      </Container>
      
      {/* Footer */}
      <footer style={{ textAlign: 'center', padding: '30px', backgroundColor: colors.primaryGreen, color: 'white', marginTop: '50px' }}>
        <p>© 2024 Thực phẩm MaiVang</p>
      </footer>
    </div>
  )
}

export default App