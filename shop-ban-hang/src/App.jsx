import { Routes, Route, Link } from 'react-router-dom'
import Home from './Home'
import Cart from './Cart'
import ProductDetail from './ProductDetail'
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Badge from 'react-bootstrap/Badge';
import { useState, useEffect } from 'react';

function App() {
  // --- 1. KHỞI TẠO GIỎ HÀNG THÔNG MINH ---
  // Kiểm tra xem trong kho (LocalStorage) có đồ cũ không, nếu có thì lôi ra dùng
  const [gioHang, setGioHang] = useState(() => {
      const duLieuCu = localStorage.getItem('gioHangCuaDuy');
      return duLieuCu ? JSON.parse(duLieuCu) : [];
  });

  // --- 2. TỰ ĐỘNG LƯU ---
  // Cứ mỗi khi giỏ hàng thay đổi (thêm, xóa, sửa), máy tự lưu vào kho ngay
  useEffect(() => {
      localStorage.setItem('gioHangCuaDuy', JSON.stringify(gioHang));
  }, [gioHang]);

  // --- 3. CÁC HÀM XỬ LÝ (LOGIC) ---
  
  // Hàm A: Thêm vào giỏ
  function themVaoGio(sanPhamCanMua) {
    const sanPhamDaCo = gioHang.find(sp => sp.id === sanPhamCanMua.id);
    if (sanPhamDaCo) {
      // Nếu đã có thì tăng số lượng lên 1
      setGioHang(gioHang.map(sp => 
        sp.id === sanPhamCanMua.id ? { ...sp, soLuong: sp.soLuong + 1 } : sp
      ));
    } else {
      // Nếu chưa có thì thêm mới vào
      setGioHang([...gioHang, { ...sanPhamCanMua, soLuong: 1 }]);
    }
  }

  // Hàm B: Tăng giảm số lượng (+ -)
  function chinhSuaSoLuong(idSanPham, loai) {
     setGioHang(gioHang.map(sp => {
        if (sp.id === idSanPham) {
           const soLuongMoi = loai === 'tang' ? sp.soLuong + 1 : sp.soLuong - 1;
           // Math.max(1, ...) để đảm bảo số lượng không bao giờ nhỏ hơn 1
           return { ...sp, soLuong: Math.max(1, soLuongMoi) }; 
        }
        return sp;
     }));
  }

  // Hàm C: Xóa 1 món
  function xoaSanPham(idSanPham) {
     setGioHang(gioHang.filter(sp => sp.id !== idSanPham));
  }

  // Hàm D: Xóa sạch giỏ hàng (Dùng khi thanh toán xong)
  function xoaHetGioHang() {
      setGioHang([]);
  }

  // --- 4. GIAO DIỆN CHÍNH ---
  return (
    <>
      {/* MENU ĐIỀU HƯỚNG (NAVBAR) */}
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
                  {/* Tính tổng số lượng hàng đang có để hiện lên huy hiệu đỏ */}
                  {gioHang.reduce((tong, sp) => tong + sp.soLuong, 0)}
                </Badge>
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* NỘI DUNG CHÍNH (CÁC TRANG) */}
      <Container style={{ marginTop: '20px' }}>
         <Routes>
            {/* Trang chủ: Cần hàm thêm vào giỏ */}
            <Route path="/" element={<Home themVaoGio={themVaoGio} />} />
            
            {/* Trang chi tiết: Cũng cần hàm thêm vào giỏ */}
            <Route path="/product/:id" element={<ProductDetail themVaoGio={themVaoGio} />} />
            
            {/* Trang giỏ hàng: Cần 4 món bảo bối (Danh sách, Tăng/Giảm, Xóa 1, Xóa hết) */}
            <Route 
                path="/cart" 
                element={
                    <Cart 
                        gioHang={gioHang} 
                        chinhSuaSoLuong={chinhSuaSoLuong} 
                        xoaSanPham={xoaSanPham}
                        xoaHetGioHang={xoaHetGioHang} 
                    />
                } 
            />
         </Routes>
      </Container>
    </>
  )
}

export default App