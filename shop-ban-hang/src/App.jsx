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

// --- BỘ MÀU MỚI: XANH LÁ + VÀNG RỰC RỠ ---
const colors = {
  primaryGreen: '#008848', // Xanh lá Bách Hóa (đậm đà hơn)
  accentYellow: '#ffc107', // Vàng tươi (Hoa mai)
  priceText: '#ff8f00',    // Cam vàng (Giá tiền)
  bgLight: '#f7fcf5',      // Nền xanh siêu nhạt
  textDark: '#333'
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
    <div style={{ backgroundColor: colors.bgLight, minHeight: '100vh', fontFamily: 'Segoe UI, sans-serif' }}>
      
      {/* NAVBAR: Thêm viền dưới màu Vàng rực rỡ */}
      <Navbar style={{ backgroundColor: colors.primaryGreen, borderBottom: `4px solid ${colors.accentYellow}`, boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }} variant="dark" expand="lg" sticky="top">
        <Container>
          
          <Navbar.Brand as={Link} to="/" onClick={() => { setDanhMuc('all'); setTuKhoa('') }} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Logo tròn */}
            <div style={{ backgroundColor: 'white', borderRadius: '50%', padding: '2px', width: '50px', height: '50px', border: `2px solid ${colors.accentYellow}` }}>
                <img src="/img/logo.jpg" alt="Logo" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'contain' }} />
            </div>
            {/* Tên thương hiệu */}
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.1' }}>
                <span style={{ color: '#fff', fontSize: '13px', letterSpacing: '1px' }}>Thực phẩm sạch</span>
                <span style={{ color: colors.accentYellow, textTransform: 'uppercase', fontWeight: '900', fontSize: '24px', textShadow: '1px 1px 0 #000' }}>
                    MaiVang
                </span>
            </div>
          </Navbar.Brand>
          
          <Navbar.Toggle aria-controls="basic-navbar-nav" style={{border: 'none'}} />
          <Navbar.Collapse id="basic-navbar-nav">
            
            <div className="mx-auto my-2" style={{ width: '100%', maxWidth: '500px' }}>
                <Form className="d-flex">
                    <Form.Control
                    type="search"
                    placeholder="Hôm nay bạn muốn ăn gì? 🍖🥦"
                    className="me-2"
                    style={{ borderRadius: '5px', border: 'none', padding: '10px 15px', fontSize: '15px' }}
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
                <div style={{ position: 'relative' }}>
                    <span style={{fontSize: '28px'}}>🛒</span> 
                    <Badge bg="warning" text="dark" style={{ position: 'absolute', top: '-5px', right: '-10px', borderRadius: '50%', border: '2px solid white' }}>
                    {gioHang.reduce((tong, sp) => tong + sp.soLuong, 0)}
                    </Badge>
                </div>
                <span>Giỏ hàng</span>
              </Nav.Link>
            </Nav>

          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* MENU DANH MỤC: Nền trắng sạch sẽ */}
      <div style={{ backgroundColor: 'white', padding: '12px 0', borderBottom: '1px solid #eee' }}>
        <Container style={{ display: 'flex', gap: '10px', overflowX: 'auto', whiteSpace: 'nowrap', justifyContent: 'center' }}>
            <NutDanhMuc ten="Tất cả" icon="🏠" dangChon={danhMuc === 'all'} onClick={() => setDanhMuc('all')} colors={colors} />
            <NutDanhMuc ten="Thịt, Cá" icon="🥩" dangChon={danhMuc === 'thitca'} onClick={() => setDanhMuc('thitca')} colors={colors} />
            <NutDanhMuc ten="Rau Củ" icon="🥦" dangChon={danhMuc === 'raucu'} onClick={() => setDanhMuc('raucu')} colors={colors} />
            <NutDanhMuc ten="Đồ Uống" icon="🍺" dangChon={danhMuc === 'douong'} onClick={() => setDanhMuc('douong')} colors={colors} />
        </Container>
      </div>

      <Container style={{ marginTop: '25px', marginBottom: '40px' }}>
         <Routes>
            <Route path="/" element={<Home themVaoGio={themVaoGio} danhMuc={danhMuc} tuKhoa={tuKhoa} colors={colors} />} />
            <Route path="/product/:id" element={<ProductDetail themVaoGio={themVaoGio} colors={colors} />} />
            <Route path="/cart" element={<Cart gioHang={gioHang} chinhSuaSoLuong={chinhSuaSoLuong} xoaSanPham={xoaSanPham} xoaHetGioHang={xoaHetGioHang} colors={colors} />} />
         </Routes>
      </Container>
      
      <footer style={{ textAlign: 'center', padding: '30px 10px', backgroundColor: colors.primaryGreen, color: 'white', marginTop: 'auto', borderTop: `5px solid ${colors.accentYellow}` }}>
        <h5 style={{fontWeight: '900', color: colors.accentYellow, fontSize: '20px', marginBottom: '10px'}}>THỰC PHẨM MAI VÀNG</h5>
        <p style={{ margin: '5px 0', opacity: 0.9 }}>Địa chỉ: Chợ Bình Trưng, Quận 2, TP.HCM</p>
        <p style={{ margin: 0, opacity: 0.9 }}>© 2024 - Cam kết tươi ngon mỗi ngày!</p>
      </footer>
    </div>
  )
}

// Nút danh mục: Khi chọn sẽ có màu Vàng + Chữ Đen (Rất nổi)
function NutDanhMuc({ ten, icon, dangChon, onClick, colors }) {
    return (
        <button 
            onClick={onClick}
            style={{ 
                padding: '8px 16px', 
                borderRadius: '20px', 
                border: dangChon ? `2px solid ${colors.accentYellow}` : '1px solid #ddd', 
                cursor: 'pointer',
                backgroundColor: dangChon ? colors.accentYellow : 'white', // Nền Vàng khi chọn
                color: dangChon ? '#000' : '#555', // Chữ Đen khi chọn (cho dễ đọc)
                fontWeight: '700',
                display: 'flex', alignItems: 'center', gap: '6px',
                fontSize: '14px',
                transition: 'all 0.2s',
                boxShadow: dangChon ? '0 2px 5px rgba(255, 193, 7, 0.4)' : 'none'
            }}
        >
            <span>{icon}</span> {ten}
        </button>
    )
}

export default App