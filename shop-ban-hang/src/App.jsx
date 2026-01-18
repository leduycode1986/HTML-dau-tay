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

  // CRUD & Cart logic giữ nguyên
  const handleUpdateDS_SP = async (action, item) => { if(action==='ADD') await addDoc(collection(db,"products"), item); if(action==='UPDATE') { const {id,...data}=item; await updateDoc(doc(db,"products",id), data); } if(action==='DELETE') await deleteDoc(doc(db,"products",item)); fetchData(); };
  const handleUpdateDS_DM = async (action, item) => { if(action==='ADD') await addDoc(collection(db,"categories"), item); if(action==='UPDATE') { const {id,...data}=item; await updateDoc(doc(db,"categories",id), data); } if(action==='DELETE') await deleteDoc(doc(db,"categories",item)); fetchData(); };
  const handleDatHang = async (khach, gio, tong) => { await addDoc(collection(db,"orders"), { khachHang: khach, gioHang: gio, tongTien: tong, ngayDat: Timestamp.now(), trangThai: 'Mới đặt' }); setGioHang([]); fetchData(); alert("Đã đặt hàng!"); navigate('/'); };
  const handleUpdateStatusOrder = async (id, st) => { await updateDoc(doc(db,"orders",id), {trangThai:st}); fetchData(); };
  const handleDeleteOrder = async (id) => { await deleteDoc(doc(db,"orders",id)); fetchData(); };
  function themVaoGio(sp) { setGioHang(prev => { const exist = prev.find(i=>i.id===sp.id); return exist ? prev.map(i=>i.id===sp.id?{...i, soLuong: i.soLuong+1}:i) : [...prev, {...sp, soLuong:1}]; }); }
  function chinhSuaSoLuong(id, type) { setGioHang(prev => prev.map(i=> i.id===id ? {...i, soLuong: type==='tang'?i.soLuong+1 : Math.max(1, i.soLuong-1)} : i)); }
  function xoaSanPham(id) { setGioHang(prev => prev.filter(i=>i.id!==id)); }

  if (location.pathname === '/admin') return <Routes><Route path="/admin" element={<Admin dsSanPham={dsSanPham} handleUpdateDS_SP={handleUpdateDS_SP} dsDanhMuc={dsDanhMuc} handleUpdateDS_DM={handleUpdateDS_DM} dsDonHang={dsDonHang} handleUpdateStatusOrder={handleUpdateStatusOrder} handleDeleteOrder={handleDeleteOrder} />} /></Routes>;

  return (
    <div style={{minHeight:'100vh'}}>
      {/* NAVBAR TRÀN MÀN HÌNH */}
      <Navbar bg="success" variant="dark" expand="lg" sticky="top" className="py-2 shadow-sm">
        <Container fluid> 
          <Navbar.Brand as={Link} to="/" onClick={()=>setDanhMucHienTai('all')} className="d-flex align-items-center gap-2">
            <div style={{background:'white', color:'#198754', padding:'5px 10px', borderRadius:'50%', fontWeight:'bold'}}>MV</div>
            MAIVANG SHOP
          </Navbar.Brand>
          <Navbar.Toggle />
          <Navbar.Collapse>
            <Nav className="me-auto ms-3"><Link to="/" className="nav-link text-white fw-bold">Trang Chủ</Link></Nav>
            <Form className="d-flex w-50 mx-auto"><Form.Control placeholder="🔍 Tìm kiếm sản phẩm..." className="border-0 rounded-pill px-3" value={tuKhoa} onChange={e=>setTuKhoa(e.target.value)} /></Form>
            <Nav className="ms-auto gap-3 align-items-center">
                <Link to="/cart" className="text-white text-decoration-none position-relative fw-bold">
                    <i className="fa-solid fa-cart-shopping fs-5"></i> Giỏ hàng 
                    <Badge bg="warning" text="dark" pill className="position-absolute top-0 start-100 translate-middle">{gioHang.reduce((t,s)=>t+s.soLuong,0)}</Badge>
                </Link>
                <Link to="/admin" className="btn btn-outline-light btn-sm rounded-pill px-3 fw-bold">Quản trị</Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* BODY TRÀN MÀN HÌNH (Container fluid) */}
      <Container fluid className="my-3">
        <Row>
            {/* DANH MỤC BÊN TRÁI */}
            <Col lg={2} className="d-none d-lg-block">
                <div className="bg-success text-white p-3 rounded-top fw-bold text-uppercase text-center">DANH MỤC</div>
                <div className="bg-white border rounded-bottom shadow-sm">
                    <div className={`p-3 border-bottom ${danhMucHienTai==='all'?'bg-light text-success fw-bold':''}`} onClick={()=>setDanhMucHienTai('all')} style={{cursor:'pointer'}}>🏠 Tất cả sản phẩm</div>
                    {dsDanhMuc.filter(d=>!d.parent).map(dm => (
                        <div key={dm.id}>
                            <div className={`p-3 border-bottom ${danhMucHienTai===(dm.customId||dm.id)?'bg-light text-success fw-bold':''}`} onClick={()=>setDanhMucHienTai(dm.customId||dm.id)} style={{cursor:'pointer'}}>
                                <span className="me-2">{dm.icon}</span>{dm.ten}
                            </div>
                        </div>
                    ))}
                </div>
            </Col>
            {/* NỘI DUNG BÊN PHẢI */}
            <Col lg={10}>
                 <Routes>
                    <Route path="/" element={<Home dsSanPham={dsSanPham} dsDanhMuc={dsDanhMuc} themVaoGio={themVaoGio} danhMuc={danhMucHienTai} tuKhoa={tuKhoa} />} />
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