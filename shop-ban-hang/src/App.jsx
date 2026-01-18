import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom'
import Home from './Home'
import Cart from './Cart'
import ProductDetail from './ProductDetail'
import Admin from './Admin'
import { Container, Nav, Navbar, Badge, Form, Row, Col, Collapse } from 'react-bootstrap';
import { useState, useEffect } from 'react';
import { db } from './firebase'; 
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, Timestamp, query, orderBy } from 'firebase/firestore';
import SEO from './SEO';

function App() {
  const [dsSanPham, setDsSanPham] = useState([]);
  const [dsDanhMuc, setDsDanhMuc] = useState([]);
  const [dsDonHang, setDsDonHang] = useState([]);
  const [gioHang, setGioHang] = useState(() => JSON.parse(localStorage.getItem('gioHangCuaDuy') || '[]'));
  const [tuKhoa, setTuKhoa] = useState('');
  
  // State quản lý menu xổ xuống
  const [menuMoRong, setMenuMoRong] = useState({}); 

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

  // CRUD & Cart logic
  const handleUpdateDS_SP = async (action, item) => { if(action==='ADD') await addDoc(collection(db,"products"), item); if(action==='UPDATE') { const {id,...data}=item; await updateDoc(doc(db,"products",id), data); } if(action==='DELETE') await deleteDoc(doc(db,"products",item)); fetchData(); };
  const handleUpdateDS_DM = async (action, item) => { if(action==='ADD') await addDoc(collection(db,"categories"), item); if(action==='UPDATE') { const {id,...data}=item; await updateDoc(doc(db,"categories",id), data); } if(action==='DELETE') await deleteDoc(doc(db,"categories",item)); fetchData(); };
  const handleDatHang = async (khach, gio, tong) => { await addDoc(collection(db,"orders"), { khachHang: khach, gioHang: gio, tongTien: tong, ngayDat: Timestamp.now(), trangThai: 'Mới đặt' }); setGioHang([]); fetchData(); alert("Đã đặt hàng!"); navigate('/'); };
  const handleUpdateStatusOrder = async (id, st) => { await updateDoc(doc(db,"orders",id), {trangThai:st}); fetchData(); };
  const handleDeleteOrder = async (id) => { await deleteDoc(doc(db,"orders",id)); fetchData(); };
  function themVaoGio(sp) { setGioHang(prev => { const exist = prev.find(i=>i.id===sp.id); return exist ? prev.map(i=>i.id===sp.id?{...i, soLuong: i.soLuong+1}:i) : [...prev, {...sp, soLuong:1}]; }); }
  function chinhSuaSoLuong(id, type) { setGioHang(prev => prev.map(i=> i.id===id ? {...i, soLuong: type==='tang'?i.soLuong+1 : Math.max(1, i.soLuong-1)} : i)); }
  function xoaSanPham(id) { setGioHang(prev => prev.filter(i=>i.id!==id)); }

  // Hàm toggle menu con
  const toggleMenu = (id) => {
    setMenuMoRong(prev => ({ ...prev, [id]: !prev[id] }));
  };

  if (location.pathname === '/admin') return <><SEO title="Quản Trị" /><Routes><Route path="/admin" element={<Admin dsSanPham={dsSanPham} handleUpdateDS_SP={handleUpdateDS_SP} dsDanhMuc={dsDanhMuc} handleUpdateDS_DM={handleUpdateDS_DM} dsDonHang={dsDonHang} handleUpdateStatusOrder={handleUpdateStatusOrder} handleDeleteOrder={handleDeleteOrder} />} /></Routes></>;

  return (
    <div style={{minHeight:'100vh'}}>
      <SEO title="Trang Chủ" />
      <Navbar expand="lg" sticky="top" className="navbar-custom navbar-dark">
        <Container fluid> 
          <Navbar.Brand as={Link} to="/" className="d-flex align-items-center gap-2">
            <div className="brand-circle">MV</div><span className="fw-bold fs-4">MAIVANG SHOP</span>
          </Navbar.Brand>
          <Navbar.Toggle />
          <Navbar.Collapse>
            <Nav className="me-auto ms-4"><Link to="/" className="nav-link text-white fw-bold">TRANG CHỦ</Link></Nav>
            <Form className="d-flex w-50 mx-auto" onSubmit={(e)=>{e.preventDefault(); navigate(`/?search=${tuKhoa}`)}}><Form.Control placeholder="Tìm kiếm..." className="search-input" value={tuKhoa} onChange={e=>setTuKhoa(e.target.value)} /></Form>
            <Nav className="ms-auto gap-3 align-items-center">
                <Link to="/cart" className="text-white text-decoration-none position-relative fw-bold"><i className="fa-solid fa-cart-shopping me-2"></i>Giỏ hàng <Badge bg="warning" text="dark" pill className="position-absolute top-0 start-100 translate-middle">{gioHang.reduce((t,s)=>t+s.soLuong,0)}</Badge></Link>
                <Link to="/admin" className="btn btn-outline-light rounded-pill px-4 fw-bold">Admin</Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container fluid className="p-0">
        <Row className="g-0">
            {/* SIDEBAR */}
            <Col lg={2} className="d-none d-lg-block sidebar-container">
                <div className="sidebar-header">DANH MỤC</div>
                <div className="list-group list-group-flush">
                    <Link to="/" className={`category-item list-group-item list-group-item-action ${location.pathname === '/' ? 'active' : ''}`}>
                       <i className="fa-solid fa-house me-2"></i> Tất cả sản phẩm
                    </Link>
                    
                    {/* Render Danh Mục Cha */}
                    {dsDanhMuc.filter(d=>!d.parent).map(parent => {
                        const hasChild = dsDanhMuc.some(c => c.parent === (parent.customId || parent.id));
                        const isOpen = menuMoRong[parent.id];
                        
                        return (
                            <div key={parent.id}>
                                <div className={`category-item list-group-item list-group-item-action d-flex justify-content-between align-items-center ${location.pathname.includes(parent.id) ? 'active' : ''}`}>
                                    {/* Link để lọc sản phẩm cha */}
                                    <Link to={`/danh-muc/${parent.customId || parent.id}`} className="text-decoration-none text-dark w-100" style={{color: 'inherit'}}>
                                        <span className="me-2">{parent.icon}</span> {parent.ten}
                                    </Link>
                                    
                                    {/* Mũi tên để xổ xuống */}
                                    {hasChild && (
                                        <span onClick={(e) => {e.preventDefault(); toggleMenu(parent.id)}} style={{cursor:'pointer', padding:'0 5px'}}>
                                            <i className={`fa-solid fa-chevron-${isOpen ? 'up' : 'down'} small`}></i>
                                        </span>
                                    )}
                                </div>

                                {/* Menu Con */}
                                <Collapse in={isOpen}>
                                    <div className="bg-light ps-4">
                                        {dsDanhMuc.filter(c => c.parent === (parent.customId || parent.id)).map(child => (
                                            <Link key={child.id} to={`/danh-muc/${child.customId || child.id}`} 
                                                  className={`list-group-item list-group-item-action small border-0 bg-transparent ${location.pathname.includes(child.id) ? 'text-success fw-bold' : ''}`}>
                                                • {child.ten}
                                            </Link>
                                        ))}
                                    </div>
                                </Collapse>
                            </div>
                        )
                    })}
                </div>
            </Col>

            {/* CONTENT */}
            <Col lg={10} className="bg-light p-4">
                 <Routes>
                    <Route path="/" element={<Home dsSanPham={dsSanPham} dsDanhMuc={dsDanhMuc} themVaoGio={themVaoGio} />} />
                    {/* 👇 Route động cho danh mục */}
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