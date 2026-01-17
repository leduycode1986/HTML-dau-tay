import { Routes, Route, Link } from 'react-router-dom'
import Home from './Home'
import Cart from './Cart'
import ProductDetail from './ProductDetail'
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Badge from 'react-bootstrap/Badge';
import { useState, useEffect } from 'react'; // <-- 1. Nhập thêm useEffect

function App() {
  // 2. KHỞI TẠO THÔNG MINH:
  // Thay vì để rỗng [], máy sẽ tìm xem trong kho 'gioHangCuaDuy' có gì không
  const [gioHang, setGioHang] = useState(() => {
      const duLieuCu = localStorage.getItem('gioHangCuaDuy');
      return duLieuCu ? JSON.parse(duLieuCu) : [];
  });

  // 3. TỰ ĐỘNG LƯU:
  // Cứ mỗi khi gioHang thay đổi (thêm, xóa, sửa), máy sẽ lưu ngay vào kho
  useEffect(() => {
      localStorage.setItem('gioHangCuaDuy', JSON.stringify(gioHang));
  }, [gioHang]);

  // --- CÁC HÀM CŨ (Giữ nguyên không đổi) ---
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

  return (
    <>
      <Navbar bg="dark" data-bs-theme="dark" expand="lg" sticky="top">
        <Container>
          <Navbar.Brand as={Link} to="/">Shop của Duy</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link as={Link} to="/">Trang chủ</Nav.Link>
            </Nav>

            <Nav className="ms-auto">
              <Nav.Link as={Link} to="/cart" className="d-flex align-items-center gap-2">
                <span style={{fontSize: '20px'}}>🛒</span> 
                <Badge bg="danger" pill>
                  {gioHang.reduce((tong, sp) => tong + sp.soLuong, 0)}
                </Badge>
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container style={{ marginTop: '20px' }}>
         <Routes>
            <Route path="/" element={<Home themVaoGio={themVaoGio} />} />
            <Route path="/product/:id" element={<ProductDetail themVaoGio={themVaoGio} />} />
            <Route 
                path="/cart" 
                element={
                    <Cart 
                        gioHang={gioHang} 
                        chinhSuaSoLuong={chinhSuaSoLuong} 
                        xoaSanPham={xoaSanPham} 
                    />
                } 
            />
         </Routes>
      </Container>
    </>
  )
}

export default App