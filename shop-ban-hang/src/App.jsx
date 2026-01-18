import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom'
import Home from './Home'
import Cart from './Cart'
import ProductDetail from './ProductDetail'
import Admin from './Admin'
import { Container, Nav, Navbar, Badge, Form, Row, Col } from 'react-bootstrap';
import { useState, useEffect } from 'react';
import { db } from './firebase'; 
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, Timestamp, query, orderBy } from 'firebase/firestore';

function App() {
  const [dsSanPham, setDsSanPham] = useState([]);
  const [dsDanhMuc, setDsDanhMuc] = useState([]);
  const [dsDonHang, setDsDonHang] = useState([]);
  const [gioHang, setGioHang] = useState(() => JSON.parse(localStorage.getItem('gioHangCuaDuy') || '[]'));
  const [tuKhoa, setTuKhoa] = useState('');
  const [danhMucHienTai, setDanhMucHienTai] = useState('all');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => { localStorage.setItem('gioHangCuaDuy', JSON.stringify(gioHang)); }, [gioHang]);

  const fetchData = async () => {
    try {
        const spDocs = await getDocs(collection(db, "products"));
        setDsSanPham(spDocs.docs.map(d => ({...d.data(), id: d.id})));
        const dmDocs = await getDocs(collection(db, "categories"));
        setDsDanhMuc(dmDocs.docs.map(d => ({...d.data(), id: d.id})).sort((a,b)=>(a.order||0)-(b.order||0)));
        const dhDocs = await getDocs(query(collection(db, "orders"), orderBy("ngayDat", "desc")));
        setDsDonHang(dhDocs.docs.map(d => ({...d.data(), id: d.id})));
    } catch(e) { console.error(e); }
  };
  useEffect(() => { fetchData(); }, []);

  // CRUD Functions (Giữ nguyên logic cũ để không lỗi)
  const handleUpdateDS_SP = async (action, item) => { if(action==='ADD') await addDoc(collection(db,"products"), item); if(action==='UPDATE') { const {id,...data}=item; await updateDoc(doc(db,"products",id), data); } if(action==='DELETE') await deleteDoc(doc(db,"products",item)); fetchData(); };
  const handleUpdateDS_DM = async (action, item) => { if(action==='ADD') await addDoc(collection(db,"categories"), item); if(action==='UPDATE') { const {id,...data}=item; await updateDoc(doc(db,"categories",id), data); } if(action==='DELETE') await deleteDoc(doc(db,"categories",item)); fetchData(); };
  const handleDatHang = async (khach, gio, tong) => { await addDoc(collection(db,"orders"), { khachHang: khach, gioHang: gio, tongTien: tong, ngayDat: Timestamp.now(), trangThai: 'Mới đặt' }); setGioHang([]); fetchData(); alert("Đã đặt hàng!"); navigate('/'); };
  const handleUpdateStatusOrder = async (id, st) => { await updateDoc(doc(db,"orders",id), {trangThai:st}); fetchData(); };
  const handleDeleteOrder = async (id) => { await deleteDoc(doc(db,"orders",id)); fetchData(); };

  // Cart Functions
  function themVaoGio(sp) { setGioHang(prev => { const exist = prev.find(i=>i.id===sp.id); return exist ? prev.map(i=>i.id===sp.id?{...i, soLuong: i.soLuong+1}:i) : [...prev, {...sp, soLuong:1}]; }); }
  function chinhSuaSoLuong(id, type) { setGioHang(prev => prev.map(i=> i.id===id ? {...i, soLuong: type==='tang'?i.soLuong+1 : Math.max(1, i.soLuong-1)} : i)); }
  function xoaSanPham(id) { setGioHang(prev => prev.filter(i=>i.id!==id)); }

  // ADMIN ROUTE
  if (location.pathname === '/admin') return <Routes><Route path="/admin" element={<Admin dsSanPham={dsSanPham} handleUpdateDS_SP={handleUpdateDS_SP} dsDanhMuc={dsDanhMuc} handleUpdateDS_DM={handleUpdateDS_DM} dsDonHang={dsDonHang} handleUpdateStatusOrder={handleUpdateStatusOrder} handleDeleteOrder={handleDeleteOrder} />} /></Routes>;

  return (
    <div style={{minHeight:'100vh', background:'#f4f6f9'}}>
      <Navbar bg="success" variant="dark" expand="lg" sticky="top" className="shadow-sm py-3">
        <Container>
          <Navbar.Brand as={Link} to="/" className="fw-bold fs-4" onClick={()=>setDanhMucHienTai('all')}>MAIVANG SHOP 🍓</Navbar.Brand>
          <Navbar.Toggle />
          <Navbar.Collapse>
            <Nav className="me-auto ms-3"><Link to="/" className="nav-link text-white fw-bold">Trang Chủ</Link></Nav>
            <Form className="d-flex mx-3 w-50"><Form.Control placeholder="Tìm kiếm sản phẩm..." className="rounded-pill" value={tuKhoa} onChange={e=>setTuKhoa(e.target.value)} /></Form>
            <Nav className="ms-auto align-items-center gap-3">
                <Link to="/cart" className="btn btn-light rounded-pill position-relative fw-bold text-success">
                    🛒 Giỏ hàng <Badge bg="danger" pill className="position-absolute top-0 start-100 translate-middle">{gioHang.reduce((t,s)=>t+s.soLuong,0)}</Badge>
                </Link>
                <Link to="/admin" className="text-white text-decoration-none small opacity-75">Admin Login</Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* CONTAINER THƯỜNG (KHÔNG FLUID) ĐỂ WEB GỌN ĐẸP */}
      <Container className="my-4">
        <Row>
            <Col lg={3} className="d-none d-lg-block">
                <div className="bg-white p-3 rounded shadow-sm">
                    <h5 className="fw-bold text-success border-bottom pb-2 mb-3">DANH MỤC</h5>
                    <div className={`p-2 rounded mb-1 cursor-pointer ${danhMucHienTai==='all'?'bg-success text-white':'text-dark hover-bg-light'}`} onClick={()=>setDanhMucHienTai('all')} style={{cursor:'pointer'}}>🏠 Tất cả sản phẩm</div>
                    {dsDanhMuc.filter(d=>!d.parent).map(dm => (
                        <div key={dm.id}>
                            <div className={`p-2 rounded mt-1 fw-bold ${danhMucHienTai===(dm.customId||dm.id)?'text-success bg-light':''}`} onClick={()=>setDanhMucHienTai(dm.customId||dm.id)} style={{cursor:'pointer'}}>{dm.icon} {dm.ten}</div>
                            {dsDanhMuc.filter(c=>c.parent===(dm.customId||dm.id)).map(sub => (
                                <div key={sub.id} className="ps-4 py-1 small text-secondary" onClick={()=>setDanhMucHienTai(sub.customId||sub.id)} style={{cursor:'pointer'}}>• {sub.ten}</div>
                            ))}
                        </div>
                    ))}
                </div>
            </Col>
            <Col lg={9}>
                 <Routes>
                    <Route path="/" element={<Home dsSanPham={dsSanPham} dsDanhMuc={dsDanhMuc} themVaoGio={themVaoGio} danhMuc={danhMucHienTai} tuKhoa={tuKhoa} />} />
                    <Route path="/product/:id" element={<ProductDetail dsSanPham={dsSanPham} themVaoGio={themVaoGio} />} />
                    <Route path="/cart" element={<Cart gioHang={gioHang} chinhSuaSoLuong={chinhSuaSoLuong} xoaSanPham={xoaSanPham} handleDatHang={handleDatHang} />} />
                 </Routes>
            </Col>
        </Row>
      </Container>
      <footer className="bg-white text-center py-3 mt-auto border-top text-secondary small">© 2026 MaiVang Shop - Thực phẩm sạch cho mọi nhà</footer>
    </div>
  )
}
export default App