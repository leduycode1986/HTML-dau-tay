import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom'
import Home from './Home'
import Cart from './Cart'
import ProductDetail from './ProductDetail'
import Admin from './Admin'
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Badge from 'react-bootstrap/Badge';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { useState, useEffect } from 'react';
import { db } from './firebase'; 
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, Timestamp, query, orderBy } from 'firebase/firestore';

const colors = { primaryGreen: '#008848', accentYellow: '#ffc107', bgLight: '#f0fdf4', textDark: '#333', menuActiveBg: '#e6f7eb' };

function App() {
  const [dsSanPham, setDsSanPham] = useState([]);
  const [dsDanhMuc, setDsDanhMuc] = useState([]);
  const [dsDonHang, setDsDonHang] = useState([]);
  const [gioHang, setGioHang] = useState(() => JSON.parse(localStorage.getItem('gioHangCuaDuy') || '[]'));

  useEffect(() => { localStorage.setItem('gioHangCuaDuy', JSON.stringify(gioHang)); }, [gioHang]);

  // --- FETCH DATA ---
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

  // --- CRUD FUNCTIONS ---
  const handleUpdateDS_SP = async (action, item) => {
     if(action==='ADD') await addDoc(collection(db,"products"), item);
     if(action==='UPDATE') { const {id,...data}=item; await updateDoc(doc(db,"products",id), data); }
     if(action==='DELETE') await deleteDoc(doc(db,"products",item));
     fetchData();
  };
  const handleUpdateDS_DM = async (action, item) => {
     if(action==='ADD') await addDoc(collection(db,"categories"), item);
     if(action==='UPDATE') { const {id,...data}=item; await updateDoc(doc(db,"categories",id), data); }
     if(action==='DELETE') await deleteDoc(doc(db,"categories",item));
     fetchData();
  };
  const handleDatHang = async (khachHang, gioHang, tongTien) => {
     await addDoc(collection(db,"orders"), { khachHang, gioHang, tongTien, ngayDat: Timestamp.now(), trangThai: 'Mới đặt' });
     setGioHang([]); fetchData(); alert("Đặt hàng thành công!"); navigate('/');
  };
  const handleUpdateStatusOrder = async (id, st) => { await updateDoc(doc(db,"orders",id), {trangThai:st}); fetchData(); };
  const handleDeleteOrder = async (id) => { await deleteDoc(doc(db,"orders",id)); fetchData(); };

  // --- CART ---
  function themVaoGio(sp) {
    setGioHang(prev => {
        const exist = prev.find(i=>i.id===sp.id);
        return exist ? prev.map(i=>i.id===sp.id?{...i, soLuong: i.soLuong+1}:i) : [...prev, {...sp, soLuong:1}];
    });
  }
  function chinhSuaSoLuong(id, type) {
      setGioHang(prev => prev.map(i=> i.id===id ? {...i, soLuong: type==='tang'?i.soLuong+1 : Math.max(1, i.soLuong-1)} : i));
  }
  function xoaSanPham(id) { setGioHang(prev => prev.filter(i=>i.id!==id)); }

  const [danhMucHienTai, setDanhMucHienTai] = useState('all'); 
  const [tuKhoa, setTuKhoa] = useState('');
  const [menuDangMo, setMenuDangMo] = useState(null);
  const navigate = useNavigate();
  const location = useLocation(); 

  if (location.pathname === '/admin') return <Routes><Route path="/admin" element={<Admin dsSanPham={dsSanPham} handleUpdateDS_SP={handleUpdateDS_SP} dsDanhMuc={dsDanhMuc} handleUpdateDS_DM={handleUpdateDS_DM} dsDonHang={dsDonHang} handleUpdateStatusOrder={handleUpdateStatusOrder} handleDeleteOrder={handleDeleteOrder} />} /></Routes>;

  const danhMucGoc = dsDanhMuc.filter(dm => !dm.parent);

  return (
    <div style={{ backgroundColor: colors.bgLight, minHeight: '100vh', fontFamily: 'Segoe UI, sans-serif' }}>
      <Navbar style={{ backgroundColor: colors.primaryGreen }} variant="dark" expand="lg" sticky="top">
        <Container fluid>
          <Navbar.Brand as={Link} to="/" onClick={()=>{setDanhMucHienTai('all');setTuKhoa('')}} style={{fontWeight:'bold'}}>MAIVANG SHOP</Navbar.Brand>
          <Navbar.Toggle />
          <Navbar.Collapse>
            <Form className="d-flex mx-auto w-50"><Form.Control placeholder="🔍 Tìm sản phẩm..." value={tuKhoa} onChange={e=>{setTuKhoa(e.target.value); navigate('/')}} /></Form>
            <Nav className="ms-auto gap-3">
                <Link to="/admin" className="text-white text-decoration-none fw-bold pt-2">Admin</Link>
                <Link to="/cart" className="text-white position-relative pt-1"><span style={{fontSize:'24px'}}>🛒</span><Badge bg="warning" text="dark" style={{position:'absolute',top:0,right:-10}}>{gioHang.reduce((t,s)=>t+s.soLuong,0)}</Badge></Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container fluid className="mt-3">
        <Row>
            <Col md={3} lg={2} className="d-none d-md-block">
                <div className="bg-white rounded p-2 shadow-sm">
                    <div className="p-2 fw-bold text-success border-bottom mb-2">DANH MỤC</div>
                    <div style={{cursor:'pointer', padding:'8px', background: danhMucHienTai==='all'?colors.menuActiveBg:'white', color: danhMucHienTai==='all'?colors.primaryGreen:'black', borderRadius:'5px'}} onClick={()=>{setDanhMucHienTai('all'); navigate('/')}}>🏠 Tất cả</div>
                    {danhMucGoc.map(cha => {
                        const con = dsDanhMuc.filter(c=>c.parent===(cha.customId||cha.id));
                        return (
                            <div key={cha.id}>
                                <div className="d-flex justify-content-between align-items-center p-2 mt-1" style={{cursor:'pointer', borderRadius:'5px', background: danhMucHienTai===(cha.customId||cha.id)?colors.menuActiveBg:'white'}} 
                                     onClick={()=>{setDanhMucHienTai(cha.customId||cha.id); navigate('/'); if(con.length) setMenuDangMo(menuDangMo===cha.id?null:cha.id)}}>
                                     <span>{cha.icon} {cha.ten}</span> {con.length>0 && <small>▼</small>}
                                </div>
                                {menuDangMo===cha.id && con.map(c=>(
                                    <div key={c.id} className="ms-3 p-2 text-muted" style={{cursor:'pointer', fontSize:'14px', fontWeight: danhMucHienTai===(c.customId||c.id)?'bold':'normal'}} onClick={()=>{setDanhMucHienTai(c.customId||c.id); navigate('/')}}>• {c.ten}</div>
                                ))}
                            </div>
                        )
                    })}
                </div>
            </Col>
            <Col md={9} lg={10}>
                 <Routes>
                    <Route path="/" element={<Home dsSanPham={dsSanPham} dsDanhMuc={dsDanhMuc} themVaoGio={themVaoGio} danhMuc={danhMucHienTai} tuKhoa={tuKhoa} colors={colors} />} />
                    <Route path="/product/:id" element={<ProductDetail dsSanPham={dsSanPham} themVaoGio={themVaoGio} colors={colors} />} />
                    <Route path="/cart" element={<Cart gioHang={gioHang} chinhSuaSoLuong={chinhSuaSoLuong} xoaSanPham={xoaSanPham} xoaHet={(()=>setGioHang([]))} colors={colors} handleDatHang={handleDatHang} />} />
                 </Routes>
            </Col>
        </Row>
      </Container>
    </div>
  )
}
export default App