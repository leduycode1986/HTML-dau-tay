import { Routes, Route, Link, useNavigate } from 'react-router-dom'
import Home from './Home'
import Cart from './Cart'
import ProductDetail from './ProductDetail'
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Badge from 'react-bootstrap/Badge';
import Form from 'react-bootstrap/Form';
import { useState, useEffect } from 'react';

// --- BỘ MÀU SẮC CHUẨN THEO LOGO ---
const colors = {
  primaryGreen: '#00a651', // Xanh lá đậm
  accentGold: '#ffc107',   // Vàng tươi
  bgLight: '#e8f5e9',      // Nền xanh nhạt
  textDark: '#212529'      // Chữ đen
};

function App() {
  const [danhMuc, setDanhMuc] = useState('all'); 
  const [tuKhoa, setTuKhoa] = useState('');
  const navigate = useNavigate();

  const [gioHang, setGioHang] = useState(() => {
      const duLieuCu = localStorage.getItem('gioHangCuaDuy');
      return duLieuCu ? JSON.parse(duLieuCu) : [];
  });

  useEffect(() => {
      localStorage.setItem('gioHangCuaDuy', JSON.stringify(gioHang));
  }, [gioHang]);

  function themVaoGio(sanPhamCanMua) {
    const sanPhamDaCo = gioHang.find(sp => sp.id === sanPhamCanMua.id);
    if (sanPhamDaCo) {
      setGioHang(gioHang.map(sp => 
        sp.id === sanPhamCanMua.id ? { ...sp, soLuong: sp.soLuong + 1 } : sp
      ));
    } else {
      setGioHang([...gioHang, { ...sanPhamCanMua, soLuong: 1 }]);
    }
  }

  function chinhSuaSoLuong(idSanPham, loai) {
     setGioHang(gioHang.map(sp => {
        if (sp.id === idSanPham) {
           const soLuongMoi = loai === 'tang' ? sp.soLuong + 1 : sp.soLuong - 1;
           return { ...sp, soLuong: Math.max(1, soLuongMoi) }; 
        }
        return sp;
     }));
  }

  function xoaSanPham(idSanPham) {
     setGioHang(gioHang.filter(sp => sp.id !== idSanPham));
  }

  function xoaHetGioHang() {
      setGioHang([]);
  }

  return (
    <div style={{ backgroundColor: colors.bgLight, minHeight: '100vh', fontFamily: 'Segoe UI, Roboto, sans-serif' }}>
      
      {/* --- THANH MENU (NAVBAR) --- */}
      <Navbar style={{ backgroundColor: colors.primaryGreen, boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }} variant="dark" expand="lg" sticky="top">
        <Container>
          
          {/* KHU VỰC LOGO + TÊN THƯƠNG HIỆU */}
          <Navbar.Brand as={Link} to="/" onClick={() => { setDanhMuc('all'); setTuKhoa('') }} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            
            {/* 1. Ảnh Logo (Trong khung tròn trắng) */}
            <div style={{ backgroundColor: 'white', borderRadius: '50%', padding: '3px', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '55px', height: '55px', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}>
                <img 
                    src="/img/logo.jpg" 
                    alt="Logo Mai Vang" 
                    style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'contain' }}
                />
            </div>

            {/* 2. Tên thương hiệu (Xếp dọc cho đẹp) */}
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '1' }}>
                <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '14px', fontWeight: '500', letterSpacing: '1px' }}>Thực phẩm</span>
                <span style={{ color: colors.accentGold, textTransform: 'uppercase', fontWeight: '900', fontSize: '22px', textShadow: '1px 1px 2px rgba(0,0,0,0.2)' }}>
                    MaiVang
                </span>
            </div>
          </Navbar.Brand>
          
          <Navbar.Toggle aria-controls="basic-navbar-nav" style={{ border: 'none' }} />
          <Navbar.Collapse id="basic-navbar-nav">
            
            <div className="mx-auto my-2" style={{ width: '100%', maxWidth: '500px' }}>
                <Form className="d-flex">
                    <Form.Control
                    type="search"
                    placeholder="Tìm kiếm: Thịt, Cá, Rau sạch..."
                    className="me-2"
                    style={{ borderRadius: '25px', border: 'none', padding: '10px 20px', fontSize: '15px', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)' }}
                    value={tuKhoa}
                    onChange={(e) => {
                        setTuKhoa(e.target.value);
                        navigate('/');
                    }}
                    />
                </Form>
            </div>

            <Nav className="ms-auto">
              <Nav.Link as={Link} to="/cart" className="d-flex align-items-center gap-2 text-white" style={{ fontWeight: '600' }}>
                <div style={{ position: 'relative', display: 'inline-block', marginRight: '5px' }}>
                    <span style={{fontSize: '28px'}}>🛒</span> 
                    <Badge bg="none" style={{ backgroundColor: colors.accentGold, color: colors.textDark, position: 'absolute', top: '-8px', right: '-12px', borderRadius: '50%', padding: '5px 8px', fontSize: '12px', fontWeight: 'bold', border: `2px solid ${colors.primaryGreen}` }}>
                    {gioHang.reduce((tong, sp) => tong + sp.soLuong, 0)}
                    </Badge>
                </div>
                <span>Giỏ hàng</span>
              </Nav.Link>
            </Nav>

          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* --- MENU DANH MỤC NGANG --- */}
      <div style={{ backgroundColor: 'white', padding: '15px 0', borderBottom: `1px solid ${colors.primaryGreen}20` }}>
        <Container style={{ display: 'flex', gap: '15px', overflowX: 'auto', whiteSpace: 'nowrap', paddingBottom: '5px', justifyContent: 'center' }}>
            <NutDanhMuc ten="Tất cả" icon="🏠" dangChon={danhMuc === 'all'} onClick={() => setDanhMuc('all')} colors={colors} />
            <NutDanhMuc ten="Thịt, Cá" icon="🥩" dangChon={danhMuc === 'thitca'} onClick={() => setDanhMuc('thitca')} colors={colors} />
            <NutDanhMuc ten="Rau Củ" icon="🥦" dangChon={danhMuc === 'raucu'} onClick={() => setDanhMuc('raucu')} colors={colors} />
            <NutDanhMuc ten="Đồ Uống" icon="🍺" dangChon={danhMuc === 'douong'} onClick={() => setDanhMuc('douong')} colors={colors} />
        </Container>
      </div>

      <Container style={{ marginTop: '30px', marginBottom: '40px' }}>
         <Routes>
            <Route path="/" element={<Home themVaoGio={themVaoGio} danhMuc={danhMuc} tuKhoa={tuKhoa} colors={colors} />} />
            <Route path="/product/:id" element={<ProductDetail themVaoGio={themVaoGio} colors={colors} />} />
            <Route 
                path="/cart" 
                element={
                    <Cart 
                        gioHang={gioHang} 
                        chinhSuaSoLuong={chinhSuaSoLuong} 
                        xoaSanPham={xoaSanPham}
                        xoaHetGioHang={xoaHetGioHang}
                        colors={colors}
                    />
                } 
            />
         </Routes>
      </Container>
      
      <footer style={{ textAlign: 'center', padding: '25px', backgroundColor: colors.primaryGreen, color: 'white', marginTop: 'auto' }}>
        <h5 style={{fontWeight: 'bold', color: colors.accentGold}}>THỰC PHẨM MAI VÀNG</h5>
        <p style={{ margin: '5px 0', fontSize: '14px', opacity: 0.9 }}>Địa chỉ: Chợ Bình Trưng, Quận 2, TP.HCM</p>
        <p style={{ margin: 0, fontSize: '14px', opacity: 0.9 }}>© 2024 - Cam kết tươi ngon mỗi ngày!</p>
      </footer>
    </div>
  )
}

// Component Nút Danh Mục
function NutDanhMuc({ ten, icon, dangChon, onClick, colors }) {
    return (
        <button 
            onClick={onClick}
            style={{ 
                padding: '8px 20px', 
                borderRadius: '30px', 
                border: dangChon ? `2px solid ${colors.primaryGreen}` : '1px solid #ddd', 
                cursor: 'pointer',
                backgroundColor: dangChon ? colors.primaryGreen : 'white', 
                color: dangChon ? 'white' : '#555', 
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s',
                fontSize: '15px',
                boxShadow: dangChon ? '0 4px 10px rgba(0,166,81,0.3)' : 'none'
            }}
        >
            <span style={{ fontSize: '1.2em' }}>{icon}</span> {ten}
        </button>
    )
}

export default App