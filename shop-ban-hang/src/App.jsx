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
import { useState, useEffect } from 'react';
import { products as khoHangBanDau } from './products'

const colors = { primaryGreen: '#008848', accentYellow: '#ffc107', bgLight: '#f0fdf4', textDark: '#333' };

function App() {
  
  // 1. DỮ LIỆU SẢN PHẨM (CÓ LƯU BỘ NHỚ)
  const [dsSanPham, setDsSanPham] = useState(() => {
      // Thử lấy dữ liệu cũ từ bộ nhớ
      const saved = localStorage.getItem('dsSanPham');
      // Nếu có thì dùng, không thì dùng kho hàng mặc định
      return saved ? JSON.parse(saved) : khoHangBanDau;
  });

  // Mỗi khi dsSanPham thay đổi, lưu ngay vào bộ nhớ
  useEffect(() => {
      localStorage.setItem('dsSanPham', JSON.stringify(dsSanPham));
  }, [dsSanPham]);

  
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

  useEffect(() => {
      localStorage.setItem('dsDanhMuc', JSON.stringify(dsDanhMuc));
  }, [dsDanhMuc]);


  const [danhMucHienTai, setDanhMucHienTai] = useState('all'); 
  const [tuKhoa, setTuKhoa] = useState('');
  const navigate = useNavigate();
  const location = useLocation(); 

  // 3. GIỎ HÀNG (GIỮ NGUYÊN)
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

  // --- TRANG ADMIN ---
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
      
      {/* Navbar */}
      <Navbar style={{ backgroundColor: colors.primaryGreen, borderBottom: `4px solid ${colors.accentYellow}` }} variant="dark" expand="lg" sticky="top">
        <Container>
          <Navbar.Brand as={Link} to="/" onClick={() => { setDanhMucHienTai('all'); setTuKhoa('') }} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ backgroundColor: 'white', borderRadius: '50%', padding: '2px', width: '50px', height: '50px', border: `2px solid ${colors.accentYellow}` }}>
                <img src="/img/logo.jpg" alt="Logo" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'contain' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '1' }}>
                <span style={{ color: '#fff', fontSize: '12px' }}>Thực phẩm sạch</span>
                <span style={{ color: colors.accentYellow, fontWeight: '900', fontSize: '24px' }}>MAIVANG</span>
            </div>
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <div className="mx-auto my-2" style={{ width: '100%', maxWidth: '500px' }}>
                <Form className="d-flex">
                    <Form.Control 
                        type="search" 
                        placeholder="🔍 Tìm kiếm..." 
                        className="me-2" 
                        style={{ borderRadius: '20px' }} 
                        value={tuKhoa} 
                        onChange={(e) => { setTuKhoa(e.target.value); navigate('/'); }} 
                    />
                </Form>
            </div>
            <Nav className="ms-auto" style={{alignItems: 'center', gap: '15px'}}>
                <Link to="/admin" style={{color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '13px'}}>🔧 Admin</Link>

                <Nav.Link as={Link} to="/cart" className="d-flex align-items-center gap-2 text-white">
                    <div style={{ position: 'relative' }}>
                        <span style={{fontSize: '28px'}}>🛒</span> 
                        <Badge bg="warning" text="dark" style={{ position: 'absolute', top: '-5px', right: '-10px', borderRadius: '50%' }}>{gioHang.reduce((t, sp) => t + sp.soLuong, 0)}</Badge>
                    </div>
                </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Menu Danh Mục */}
      <div style={{ backgroundColor: 'white', padding: '12px 0', borderBottom: '1px solid #eee' }}>
        <Container style={{ display: 'flex', gap: '10px', overflowX: 'auto', whiteSpace: 'nowrap', justifyContent: 'center' }}>
            {dsDanhMuc.map(dm => (
                <button key={dm.id} onClick={() => setDanhMucHienTai(dm.id)}
                    style={{ 
                        padding: '8px 16px', borderRadius: '20px', 
                        border: danhMucHienTai === dm.id ? `2px solid ${colors.accentYellow}` : '1px solid #ddd', 
                        backgroundColor: danhMucHienTai === dm.id ? colors.accentYellow : 'white', 
                        color: danhMucHienTai === dm.id ? 'black' : '#555', fontWeight: 'bold', 
                        cursor: 'pointer', display: 'flex', gap: '5px', alignItems: 'center'
                    }}>
                    <span>{dm.icon}</span> {dm.ten}
                </button>
            ))}
        </Container>
      </div>

      <Container style={{ marginTop: '25px', marginBottom: '40px' }}>
         <Routes>
            <Route path="/" element={<Home dsSanPham={dsSanPham} themVaoGio={themVaoGio} danhMuc={danhMucHienTai} tuKhoa={tuKhoa} colors={colors} />} />
            <Route path="/product/:id" element={<ProductDetail dsSanPham={dsSanPham} themVaoGio={themVaoGio} colors={colors} />} />
            <Route path="/cart" element={<Cart gioHang={gioHang} chinhSuaSoLuong={chinhSuaSoLuong} xoaSanPham={xoaSanPham} xoaHetGioHang={xoaHetGioHang} colors={colors} />} />
         </Routes>
      </Container>
      
      <footer style={{ textAlign: 'center', padding: '30px', backgroundColor: colors.primaryGreen, color: 'white', marginTop: 'auto' }}>
        <p>© 2024 Thực phẩm MaiVang</p>
      </footer>
    </div>
  )
}
export default App