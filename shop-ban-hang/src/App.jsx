import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { db } from './firebase'; 
import { collection, onSnapshot, doc, deleteDoc, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { Badge, Button, Form, Container, Navbar, Nav } from 'react-bootstrap';

import Home from './Home';
import ProductDetail from './ProductDetail';
import Cart from './Cart';
import Admin from './Admin';

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // State lưu dữ liệu lấy từ Firebase
  const [dsSanPham, setDsSanPham] = useState([]);
  const [dsDanhMuc, setDsDanhMuc] = useState([]);
  const [dsDonHang, setDsDonHang] = useState([]);
  const [gioHang, setGioHang] = useState(() => JSON.parse(localStorage.getItem('cart') || '[]'));
  
  // State cho ô tìm kiếm
  const [tuKhoa, setTuKhoa] = useState('');

  // 1. KẾT NỐI REALTIME FIREBASE (Lấy dữ liệu bạn đã nhập)
  useEffect(() => {
    // Lấy danh sách Sản Phẩm
    const unsubSP = onSnapshot(collection(db, "sanPham"), (snapshot) => {
      const data = snapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
      setDsSanPham(data);
    });
    
    // Lấy danh sách Danh Mục (Menu)
    const unsubDM = onSnapshot(collection(db, "danhMuc"), (snapshot) => {
      const data = snapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
      // Sắp xếp theo thứ tự (VD: 18.1, 18.2)
      data.sort((a, b) => parseFloat(a.order || 0) - parseFloat(b.order || 0));
      setDsDanhMuc(data);
    });

    // Lấy Đơn Hàng
    const unsubDH = onSnapshot(collection(db, "donHang"), (snapshot) => {
      setDsDonHang(snapshot.docs.map(doc => ({id: doc.id, ...doc.data()})));
    });

    return () => { unsubSP(); unsubDM(); unsubDH(); };
  }, []);

  // 2. Tự động lưu giỏ hàng
  useEffect(() => localStorage.setItem('cart', JSON.stringify(gioHang)), [gioHang]);

  // Logic Giỏ hàng
  const themVaoGio = (sp) => {
    const check = gioHang.find(i => i.id === sp.id);
    if (check) setGioHang(gioHang.map(i => i.id === sp.id ? {...i, soLuong: i.soLuong + 1} : i));
    else setGioHang([...gioHang, {...sp, soLuong: 1}]);
  };

  const xoaKhoiGio = (id) => setGioHang(gioHang.filter(i => i.id !== id));
  
  const chinhSuaSoLuong = (id, kieu) => {
    setGioHang(gioHang.map(i => i.id === id ? {...i, soLuong: kieu === 'tang' ? i.soLuong + 1 : Math.max(1, i.soLuong - 1)} : i));
  };

  const handleDatHang = async (khach) => {
    const tongTien = gioHang.reduce((t, s) => t + (s.giaBan || s.giaGoc) * s.soLuong, 0);
    await addDoc(collection(db, "donHang"), { khachHang: khach, gioHang, tongTien, trangThai: 'Mới đặt', ngayDat: serverTimestamp() });
    setGioHang([]); alert("Đặt hàng thành công!"); navigate('/');
  };

  // Logic Tìm kiếm sản phẩm
  const sanPhamHienThi = dsSanPham.filter(sp => 
    sp.ten?.toLowerCase().includes(tuKhoa.toLowerCase())
  );

  // Ẩn Header nếu ở trang Admin
  const isAdminPage = location.pathname.startsWith('/admin');

  return (
    <div className="app-container">
      {/* --- HEADER: LOGO, TÌM KIẾM, GIỎ HÀNG --- */}
      {!isAdminPage && (
        <Navbar bg="success" variant="dark" expand="lg" className="sticky-top shadow-sm py-2">
          <Container>
            <Navbar.Brand as={Link} to="/" className="fw-bold text-uppercase border p-2 rounded bg-white text-success">
              🦁 MAIVANG SHOP
            </Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="w-100 d-flex justify-content-between align-items-center ms-3">
                
                {/* Ô TÌM KIẾM */}
                <Form className="d-flex w-100 mx-lg-4 my-2 my-lg-0">
                  <Form.Control
                    type="search"
                    placeholder="🔍 Bạn muốn tìm món gì..."
                    className="rounded-pill border-0 shadow-sm px-3"
                    value={tuKhoa}
                    onChange={(e) => setTuKhoa(e.target.value)}
                  />
                </Form>

                {/* NÚT GIỎ HÀNG */}
                <Link to="/cart" className="text-decoration-none">
                  <Button variant="light" className="rounded-pill fw-bold text-success position-relative shadow-sm d-flex align-items-center gap-2">
                    <span>🛒 Giỏ hàng</span>
                    <Badge bg="danger" pill>
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
        <Route path="/cart" element={<Cart gioHang={gioHang} handleDatHang={handleDatHang} chinhSuaSoLuong={chinhSuaSoLuong} xoaSanPham={xoaKhoiGio} />} />
        
        {/* Route Admin (Giữ nguyên logic cập nhật Firebase) */}
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