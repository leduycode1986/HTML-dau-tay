import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom'; // Thêm Link, useLocation
import { db } from './firebase'; 
import { collection, onSnapshot, doc, deleteDoc, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { Badge, Button, Form, Container, Navbar, Nav } from 'react-bootstrap'; // Import Bootstrap UI

import Home from './Home';
import ProductDetail from './ProductDetail';
import Cart from './Cart';
import Admin from './Admin';

function App() {
  const navigate = useNavigate();
  const location = useLocation(); // Để kiểm tra đang ở trang nào
  const [dsSanPham, setDsSanPham] = useState([]);
  const [dsDanhMuc, setDsDanhMuc] = useState([]);
  const [dsDonHang, setDsDonHang] = useState([]);
  const [gioHang, setGioHang] = useState(() => JSON.parse(localStorage.getItem('cart') || '[]'));
  const [tuKhoa, setTuKhoa] = useState(''); // State tìm kiếm

  // 1. KẾT NỐI FIREBASE
  useEffect(() => {
    const unsubSP = onSnapshot(collection(db, "sanPham"), (sn) => setDsSanPham(sn.docs.map(d => ({id: d.id, ...d.data()}))));
    const unsubDM = onSnapshot(collection(db, "danhMuc"), (sn) => setDsDanhMuc(sn.docs.map(d => ({id: d.id, ...d.data()}))));
    const unsubDH = onSnapshot(collection(db, "donHang"), (sn) => setDsDonHang(sn.docs.map(d => ({id: d.id, ...d.data()}))));
    return () => { unsubSP(); unsubDM(); unsubDH(); };
  }, []);

  // 2. LƯU GIỎ HÀNG
  useEffect(() => localStorage.setItem('cart', JSON.stringify(gioHang)), [gioHang]);

  const themVaoGio = (sp) => {
    const check = gioHang.find(i => i.id === sp.id);
    if (check) setGioHang(gioHang.map(i => i.id === sp.id ? {...i, soLuong: i.soLuong + 1} : i));
    else setGioHang([...gioHang, {...sp, soLuong: 1}]);
    // alert("Đã thêm vào giỏ!"); // Bỏ alert cho đỡ phiền
  };

  const handleDatHang = async (khach) => {
    const tongTien = gioHang.reduce((t, s) => t + (s.giaBan || s.giaGoc) * s.soLuong, 0);
    await addDoc(collection(db, "donHang"), { khachHang: khach, gioHang, tongTien, trangThai: 'Mới đặt', ngayDat: serverTimestamp() });
    setGioHang([]); alert("Đặt hàng thành công!"); navigate('/');
  };

  // 3. LOGIC LỌC SẢN PHẨM THEO TỪ KHÓA
  const sanPhamHienThi = dsSanPham.filter(sp => 
    sp.ten.toLowerCase().includes(tuKhoa.toLowerCase())
  );

  // Không hiện Header ở trang Admin
  const isAdminPage = location.pathname.startsWith('/admin');

  return (
    <div className="app-container">
      {/* --- HEADER (TÌM KIẾM & GIỎ HÀNG) --- */}
      {!isAdminPage && (
        <Navbar bg="success" variant="dark" expand="lg" className="sticky-top shadow-sm py-3">
          <Container>
            <Navbar.Brand as={Link} to="/" className="fw-bold text-uppercase border p-2 rounded">MaiVang Shop</Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="me-auto ms-3 w-100 d-flex justify-content-between align-items-center">
                
                {/* Ô TÌM KIẾM */}
                <Form className="d-flex w-50">
                  <Form.Control
                    type="search"
                    placeholder="Bạn tìm gì hôm nay? (VD: Trà sữa...)"
                    className="me-2 rounded-pill border-0 shadow-sm"
                    value={tuKhoa}
                    onChange={(e) => setTuKhoa(e.target.value)}
                  />
                </Form>

                {/* NÚT GIỎ HÀNG */}
                <Link to="/cart" className="text-decoration-none position-relative text-white fw-bold">
                  <Button variant="light" className="rounded-pill fw-bold text-success">
                    🛒 Giỏ hàng
                    <Badge bg="danger" className="ms-2 rounded-circle">
                      {gioHang.reduce((acc, item) => acc + item.soLuong, 0)}
                    </Badge>
                  </Button>
                </Link>
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>
      )}

      {/* --- NỘI DUNG CHÍNH --- */}
      <Routes>
        <Route path="/" element={<Home dsSanPham={sanPhamHienThi} dsDanhMuc={dsDanhMuc} themVaoGio={themVaoGio} />} />
        <Route path="/product/:id" element={<ProductDetail dsSanPham={dsSanPham} themVaoGio={themVaoGio} />} />
        <Route path="/cart" element={<Cart gioHang={gioHang} handleDatHang={handleDatHang} 
          chinhSuaSoLuong={(id, k) => setGioHang(gioHang.map(i => i.id === id ? {...i, soLuong: k==='tang'?i.soLuong+1:Math.max(1,i.soLuong-1)} : i))} 
          xoaSanPham={(id) => setGioHang(gioHang.filter(i=>i.id!==id))} />} />
        
        {/* Route Admin giữ nguyên */}
        <Route path="/admin" element={<Admin dsSanPham={dsSanPham} dsDanhMuc={dsDanhMuc} dsDonHang={dsDonHang} 
          handleUpdateDS_SP={async (t, d) => t==='DELETE'?await deleteDoc(doc(db,"sanPham",d)):(t==='ADD'?await addDoc(collection(db,"sanPham"),d):await updateDoc(doc(db,"sanPham",d.id),d))}
          handleUpdateDS_DM={async (t, d) => t==='DELETE'?await deleteDoc(doc(db,"danhMuc",d)):(t==='ADD'?await addDoc(collection(db,"danhMuc"),d):await updateDoc(doc(db,"danhMuc",d.id),d))}
          handleUpdateStatusOrder={async (id, s) => await updateDoc(doc(db,"donHang",id),{trangThai:s})}
          handleDeleteOrder={async (id) => await deleteDoc(doc(db,"donHang",id))}
        />} />
      </Routes>
    </div>
  );
}

export default App;