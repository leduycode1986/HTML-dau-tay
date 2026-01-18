import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom'
import Home from './Home'
import Cart from './Cart'
import ProductDetail from './ProductDetail'
import Admin from './Admin'
import { Container, Nav, Navbar, Badge, Form, Row, Col } from 'react-bootstrap';
import { useState, useEffect } from 'react';
import { db } from './firebase'; 
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, Timestamp, query, orderBy } from 'firebase/firestore';
import SEO from './SEO';

function App() {
  const [dsSanPham, setDsSanPham] = useState([]);
  const [dsDanhMuc, setDsDanhMuc] = useState([]);
  const [dsDonHang, setDsDonHang] = useState([]);
  const [gioHang, setGioHang] = useState(() => JSON.parse(localStorage.getItem('gioHangCuaDuy') || '[]'));
  const [tuKhoa, setTuKhoa] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => { localStorage.setItem('gioHangCuaDuy', JSON.stringify(gioHang)); }, [gioHang]);

  // Cập nhật dữ liệu Real-time từ Firebase
  useEffect(() => {
    const unsubSP = onSnapshot(collection(db, "products"), (s) => setDsSanPham(s.docs.map(d => ({...d.data(), id: d.id}))));
    const unsubDM = onSnapshot(collection(db, "categories"), (s) => setDsDanhMuc(s.docs.map(d => ({...d.data(), id: d.id})).sort((a,b)=>(a.order||0)-(b.order||0))));
    const unsubDH = onSnapshot(query(collection(db, "orders"), orderBy("ngayDat", "desc")), (s) => setDsDonHang(s.docs.map(d => ({...d.data(), id: d.id}))));
    return () => { unsubSP(); unsubDM(); unsubDH(); };
  }, []);

  // Các hàm CRUD giữ nguyên logic ban đầu
  const handleUpdateDS_SP = async (action, item) => {
     if(action==='ADD') await addDoc(collection(db,"products"), item);
     if(action==='UPDATE') { const {id,...data}=item; await updateDoc(doc(db,"products",id), data); }
     if(action==='DELETE') await deleteDoc(doc(db,"products",item));
  };
  const handleUpdateDS_DM = async (action, item) => {
     if(action==='ADD') await addDoc(collection(db,"categories"), item);
     if(action==='UPDATE') { const {id,...data}=item; await updateDoc(doc(db,"categories",id), data); }
     if(action==='DELETE') await deleteDoc(doc(db,"categories",item));
  };
  const handleDatHang = async (khach, gio, tong) => {
     await addDoc(collection(db,"orders"), { khachHang: khach, gioHang: gio, tongTien: tong, ngayDat: Timestamp.now(), trangThai: 'Mới đặt' });
     setGioHang([]); alert("Đặt hàng thành công!"); navigate('/');
  };
  const handleUpdateStatusOrder = async (id, st) => { await updateDoc(doc(db,"orders",id), {trangThai:st}); };
  const handleDeleteOrder = async (id) => { await deleteDoc(doc(db,"orders",id)); };

  // Cart logic
  function themVaoGio(sp) { setGioHang(prev => { const exist = prev.find(i=>i.id===sp.id); return exist ? prev.map(i=>i.id===sp.id?{...i, soLuong: i.soLuong+1}:i) : [...prev, {...sp, soLuong:1}]; }); }
  function chinhSuaSoLuong(id, type) { setGioHang(prev => prev.map(i=> i.id===id ? {...i, soLuong: type==='tang'?i.soLuong+1 : Math.max(1, i.soLuong-1)} : i)); }
  function xoaSanPham(id) { setGioHang(prev => prev.filter(i=>i.id!==id)); }

  if (location.pathname === '/admin') return <><SEO title="Quản Trị" /><Routes><Route path="/admin" element={<Admin dsSanPham={dsSanPham} handleUpdateDS_SP={handleUpdateDS_SP} dsDanhMuc={dsDanhMuc} handleUpdateDS_DM={handleUpdateDS_DM} dsDonHang={dsDonHang} handleUpdateStatusOrder={handleUpdateStatusOrder} handleDeleteOrder={handleDeleteOrder} />} /></Routes></>;

  return (
    <div style={{minHeight:'100vh'}}>
      <SEO title="Trang Chủ" />
      {/* Navbar dùng class navbar-custom từ style.css */}
      <Navbar expand="lg" sticky="top" className="navbar-custom navbar-dark">
        <Container fluid> 
          <Navbar.Brand as={Link} to="/" className="d-flex align-items-center gap-2">
            <div className="brand-circle">MV</div><span className="fw-bold fs-4 text-white">MAIVANG SHOP</span>
          </Navbar.Brand>
          <Navbar.Toggle />
          <Navbar.Collapse>
            <Nav className="me-auto ms-4"><Link to="/" className="nav-link text-white fw-bold fs-5">TRANG CHỦ</Link></Nav>
            <Form className="d-flex w-50 mx-auto" onSubmit={(e)=>{e.preventDefault(); navigate(`/?search=${tuKhoa}`)}}>
                <Form.Control placeholder="🔍 Tìm kiếm sản phẩm..." className="border-0 rounded-pill px-4 py-2" value={tuKhoa} onChange={e=>setTuKhoa(e.target.value)} />
            </Form>
            <Nav className="ms-auto gap-4 align-items-center">
                <Link to="/cart" className="text-white text-decoration-none position-relative fw-bold fs-5">
                    <i className="fa-solid fa-cart-shopping me-2"></i>Giỏ hàng 
                    <Badge bg="warning" text="dark" pill className="position-absolute top-0 start-100 translate-middle">{gioHang.reduce((t,s)=>t+s.soLuong,0)}</Badge>
                </Link>
                <Link to="/admin" className="btn btn-outline-light rounded-pill px-4 fw-bold">Admin</Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container fluid className="p-0">
        <Row className="g-0">
            {/* Sidebar dùng class sidebar-main từ style.css */}
            <Col lg={2} className="d-none d-lg-block sidebar-main border-end">
                <div className="sidebar-header">DANH MỤC</div>
                <div className="p-0">
                    <Link to="/" className={`category-link ${location.pathname === '/' ? 'active' : ''}`}>🏠 Tất cả sản phẩm</Link>
                    {dsDanhMuc.filter(d=>!d.parent).map(dm => (
                        <Link key={dm.id} to={`/danh-muc/${dm.customId || dm.id}`} className={`category-link ${location.pathname.includes(dm.id) ? 'active' : ''}`}>
                            <span className="me-2">{dm.icon}</span>{dm.ten}
                        </Link>
                    ))}
                </div>
            </Col>
            {/* Nội dung chính */}
            <Col lg={10} className="p-4 bg-light">
                 <Routes>
                    <Route path="/" element={<Home dsSanPham={dsSanPham} dsDanhMuc={dsDanhMuc} themVaoGio={themVaoGio} />} />
                    <Route path="/danh-muc/:id" element={<Home dsSanPham={dsSanPham} dsDanhMuc={dsDanhMuc} themVaoGio={themVaoGio} />} />
                    <Route path="/product/:id" element={<ProductDetail dsSanPham={dsSanPham} themVaoGio={themVaoGio} />} />
                    <Route path="/cart" element={<Cart gioHang={gioHang} chinhSuaSoLuong={chinhSuaSoLuong} xoaSanPham={xoaSanPham} handleDatHang={handleDatHang} />} />
                 </Routes>
            </Col>
        </Row>
      </Container>
    </div>
  )
}
export default App