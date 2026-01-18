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

// Nhập Firebase
import { db } from './firebase'; 
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, Timestamp, query, orderBy } from 'firebase/firestore';

const colors = { primaryGreen: '#008848', accentYellow: '#ffc107', bgLight: '#f0fdf4', textDark: '#333', menuActiveBg: '#e6f7eb' };

function App() {
  
  // --- QUẢN LÝ DỮ LIỆU ---
  const [dsSanPham, setDsSanPham] = useState([]);
  const sanPhamCollection = collection(db, "products");

  const [dsDanhMuc, setDsDanhMuc] = useState([]);
  const danhMucCollection = collection(db, "categories");

  const [dsDonHang, setDsDonHang] = useState([]);
  const donHangCollection = collection(db, "orders");

  const fetchSanPham = async () => {
    try {
        const data = await getDocs(sanPhamCollection);
        setDsSanPham(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
    } catch (err) { console.error("Lỗi tải SP:", err); }
  };

  const fetchDanhMuc = async () => {
    try {
        const data = await getDocs(danhMucCollection);
        const list = data.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
        if (list.length === 0) {
            setDsDanhMuc([
                { id: 'all', ten: 'Tất cả', icon: '🏠', parent: null },
                { id: 'thitca', ten: 'Thịt, Cá', icon: '🥩', parent: null }
            ]);
        } else {
            setDsDanhMuc(list);
        }
    } catch (err) { console.error("Lỗi tải DM:", err); }
  };

  const fetchDonHang = async () => {
    try {
        const q = query(donHangCollection, orderBy("ngayDat", "desc"));
        const data = await getDocs(q);
        setDsDonHang(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
    } catch (err) { console.error("Lỗi tải đơn:", err); }
  };

  useEffect(() => { fetchSanPham(); fetchDanhMuc(); fetchDonHang(); }, []);


  // --- XỬ LÝ DATABASE (OPTIMISTIC UPDATE) ---
  const handleUpdateDS_SP = async (action, item) => {
      try {
          if (action === 'ADD') {
              const docRef = await addDoc(sanPhamCollection, item);
              setDsSanPham(prev => [...prev, { ...item, id: docRef.id }]);
          } else if (action === 'UPDATE') {
              const { id, ...data } = item;
              await updateDoc(doc(db, "products", id), data);
              setDsSanPham(prev => prev.map(sp => sp.id === id ? { ...sp, ...data } : sp));
          } else if (action === 'DELETE') {
              await deleteDoc(doc(db, "products", item));
              setDsSanPham(prev => prev.filter(sp => sp.id !== item));
          }
      } catch (e) { alert("Lỗi xử lý SP: " + e.message); }
  };

  const handleUpdateDS_DM = async (action, item) => {
      try {
          if (action === 'ADD') {
              const docRef = await addDoc(danhMucCollection, item);
              setDsDanhMuc(prev => [...prev, { ...item, id: docRef.id }]);
          } else if (action === 'UPDATE') {
               const { id, ...data } = item;
               const cleanData = { ...data, parent: data.parent === "" ? null : data.parent };
               await updateDoc(doc(db, "categories", id), cleanData);
               setDsDanhMuc(prev => prev.map(dm => dm.id === id ? { ...item, ...cleanData } : dm));
          } else if (action === 'DELETE') {
               await deleteDoc(doc(db, "categories", item));
               setDsDanhMuc(prev => prev.filter(dm => dm.id !== item));
          }
      } catch (e) { alert("Lỗi xử lý DM: " + e.message); }
  };

  const handleDatHang = async (khachHang, gioHang, tongTien) => {
      try {
          const donHangMoi = {
              khachHang, gioHang, tongTien, ngayDat: Timestamp.now(), trangThai: 'Mới đặt'
          };
          await addDoc(donHangCollection, donHangMoi);
          alert("🎉 Đặt hàng thành công!");
          setGioHang([]);
          fetchDonHang();
          navigate('/');
      } catch (e) { alert("Lỗi đặt hàng: " + e.message); }
  };

  const handleUpdateStatusOrder = async (orderId, newStatus) => {
      try {
          await updateDoc(doc(db, "orders", orderId), { trangThai: newStatus });
          setDsDonHang(prev => prev.map(dh => dh.id === orderId ? { ...dh, trangThai: newStatus } : dh));
      } catch(e) { alert("Lỗi cập nhật đơn: " + e.message); }
  };
  
  const handleDeleteOrder = async (orderId) => {
      if(window.confirm("Xóa đơn này?")) {
        try {
            await deleteDoc(doc(db, "orders", orderId));
            setDsDonHang(prev => prev.filter(dh => dh.id !== orderId));
        } catch(e) { alert("Lỗi xóa đơn: " + e.message); }
      }
  };


  // --- STATE GIAO DIỆN ---
  const [gioHang, setGioHang] = useState(() => {
      const saved = localStorage.getItem('gioHangCuaDuy');
      return saved ? JSON.parse(saved) : [];
  });
  useEffect(() => { localStorage.setItem('gioHangCuaDuy', JSON.stringify(gioHang)); }, [gioHang]);

  function themVaoGio(sp) {
    const tonTai = gioHang.find(i => i.id === sp.id);
    setGioHang(tonTai ? gioHang.map(i => i.id === sp.id ? { ...i, soLuong: i.soLuong + 1 } : i) : [...gioHang, { ...sp, soLuong: 1 }]);
  }
  function chinhSuaSoLuong(id, loai) { setGioHang(gioHang.map(sp => sp.id === id ? { ...sp, soLuong: Math.max(1, loai === 'tang' ? sp.soLuong + 1 : sp.soLuong - 1) } : sp)); }
  function xoaSanPham(id) { setGioHang(gioHang.filter(sp => sp.id !== id)); }
  function xoaHetGioHang() { setGioHang([]); }

  const [danhMucHienTai, setDanhMucHienTai] = useState('all'); 
  const [tuKhoa, setTuKhoa] = useState('');
  
  // STATE MỚI: QUẢN LÝ MENU NÀO ĐANG XỔ XUỐNG
  const [menuDangMo, setMenuDangMo] = useState(null);

  const navigate = useNavigate();
  const location = useLocation(); 

  // --- RENDER ---
  if (location.pathname === '/admin') {
      return <Routes><Route path="/admin" element={<Admin dsSanPham={dsSanPham} handleUpdateDS_SP={handleUpdateDS_SP} dsDanhMuc={dsDanhMuc} handleUpdateDS_DM={handleUpdateDS_DM} dsDonHang={dsDonHang} handleUpdateStatusOrder={handleUpdateStatusOrder} handleDeleteOrder={handleDeleteOrder} />} /></Routes>;
  }

  const danhMucGoc = dsDanhMuc.filter(dm => !dm.parent);

  // HÀM TOGGLE MENU (BẤM VÀO THÌ XỔ, BẤM LẠI THÌ ĐÓNG)
  const toggleMenu = (id) => {
      if (menuDangMo === id) setMenuDangMo(null);
      else setMenuDangMo(id);
  };

  return (
    <div style={{ backgroundColor: colors.bgLight, minHeight: '100vh', fontFamily: 'Segoe UI, sans-serif' }}>
      <Navbar style={{ backgroundColor: colors.primaryGreen, borderBottom: `4px solid ${colors.accentYellow}` }} variant="dark" expand="lg" sticky="top">
        <Container fluid>
          <Navbar.Brand as={Link} to="/" onClick={() => { setDanhMucHienTai('all'); setTuKhoa('') }} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ backgroundColor: 'white', borderRadius: '50%', padding: '2px', width: '45px', height: '45px', border: `2px solid ${colors.accentYellow}` }}><img src="/img/logo.jpg" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'contain' }} /></div>
            <div style={{ lineHeight: '1' }}><span style={{ color: '#fff', fontSize: '12px' }}>Thực phẩm sạch</span><br/><span style={{ color: colors.accentYellow, fontWeight: '900', fontSize: '20px' }}>MAIVANG</span></div>
          </Navbar.Brand>
          <Navbar.Toggle />
          <Navbar.Collapse>
            <div className="mx-auto my-2 w-100" style={{ maxWidth: '600px' }}>
                <Form className="d-flex"><Form.Control type="search" placeholder="🔍 Tìm kiếm..." className="me-2 rounded-pill" value={tuKhoa} onChange={(e) => { setTuKhoa(e.target.value); navigate('/'); }} /></Form>
            </div>
            <Nav className="ms-auto align-items-center gap-3">
                <Link to="/admin" style={{color: 'rgba(255,255,255,0.8)', textDecoration: 'none', fontWeight: 'bold'}}>🔧 Admin</Link>
                <Nav.Link as={Link} to="/cart" className="text-white position-relative">
                    <span style={{fontSize: '24px'}}>🛒</span> 
                    <Badge bg="warning" text="dark" style={{ position: 'absolute', top: '-5px', right: '-10px', borderRadius: '50%' }}>{gioHang.reduce((t, sp) => t + sp.soLuong, 0)}</Badge>
                </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container fluid style={{ marginTop: '20px' }}>
        <Row>
            {/* SIDEBAR MENU (ACCORDION STYLE) */}
            <Col md={3} lg={2} className="d-none d-md-block">
                <div style={{ backgroundColor: 'white', borderRadius: '10px', overflow: 'hidden', position: 'sticky', top: '90px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                    <h5 style={{ backgroundColor: colors.primaryGreen, color: 'white', padding: '15px', margin: 0, textAlign: 'center' }}>DANH MỤC</h5>
                    <div style={{ padding: '10px' }}>
                        
                        {/* Nút Tất Cả */}
                        <button onClick={() => { setDanhMucHienTai('all'); navigate('/'); }} 
                            style={{
                                width: '100%', textAlign: 'left', padding: '12px', border: 'none', borderRadius: '8px', marginBottom: '5px',
                                background: danhMucHienTai === 'all' ? colors.menuActiveBg : 'transparent', fontWeight: 'bold', color: danhMucHienTai === 'all' ? colors.primaryGreen : '#333'
                            }}>
                            🏠 Tất cả
                        </button>
                        
                        {danhMucGoc.map(cha => {
                            if (cha.id === 'all') return null;
                            const conCuaCha = dsDanhMuc.filter(dm => dm.parent === (cha.customId || cha.id));
                            const isExpanded = menuDangMo === (cha.customId || cha.id);
                            const isActiveCha = danhMucHienTai === (cha.customId || cha.id);
                            
                            return (
                                <div key={cha.id} style={{marginBottom: '5px'}}>
                                    {/* MENU CHA */}
                                    <button 
                                        onClick={() => { 
                                            // 1. Chuyển danh mục
                                            setDanhMucHienTai(cha.customId || cha.id); 
                                            navigate('/'); 
                                            // 2. Nếu có con thì bật tắt xổ xuống
                                            if (conCuaCha.length > 0) toggleMenu(cha.customId || cha.id);
                                        }}
                                        style={{
                                            width: '100%', textAlign: 'left', padding: '12px', border: 'none', borderRadius: '8px',
                                            backgroundColor: isActiveCha ? colors.menuActiveBg : 'transparent',
                                            color: isActiveCha ? colors.primaryGreen : '#333',
                                            fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                            fontSize: '16px', transition: 'all 0.2s'
                                        }}>
                                        <div style={{display: 'flex', gap: '10px', alignItems: 'center'}}>
                                            <span>{cha.icon}</span> {cha.ten}
                                        </div>
                                        {/* Mũi tên chỉ xuống nếu có con */}
                                        {conCuaCha.length > 0 && (
                                            <span style={{fontSize: '12px', color: '#888'}}>
                                                {isExpanded ? '▼' : '▶'}
                                            </span>
                                        )}
                                    </button>

                                    {/* MENU CON (Chỉ hiện khi isExpanded = true) */}
                                    {conCuaCha.length > 0 && isExpanded && (
                                        <div style={{marginLeft: '15px', paddingLeft: '10px', borderLeft: `2px solid ${colors.bgLight}`, marginTop: '5px'}}>
                                            {conCuaCha.map(con => {
                                                const isActiveCon = danhMucHienTai === (con.customId || con.id);
                                                return (
                                                    <button key={con.id} 
                                                        onClick={(e) => { 
                                                            e.stopPropagation(); // Tránh kích hoạt lại cha
                                                            setDanhMucHienTai(con.customId || con.id); 
                                                            navigate('/'); window.scrollTo(0,0); 
                                                        }}
                                                        style={{
                                                            width: '100%', textAlign: 'left', padding: '10px', border: 'none', borderRadius: '5px', marginTop: '2px',
                                                            // SỬA GIAO DIỆN CON TẠI ĐÂY:
                                                            backgroundColor: isActiveCon ? '#e8f5e9' : 'transparent',
                                                            color: isActiveCon ? colors.primaryGreen : '#444', // Đậm hơn (#444)
                                                            fontSize: '15px', // To hơn (15px)
                                                            fontWeight: isActiveCon ? 'bold' : '500', // Đậm vừa
                                                            display: 'flex', alignItems: 'center', gap: '8px'
                                                        }}>
                                                        <span style={{fontSize: '6px', color: '#ccc'}}>●</span> {con.ten}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>
            </Col>

            <Col md={9} lg={10}>
                 {/* Menu Mobile */}
                 <div className="d-md-none d-flex gap-2 overflow-auto pb-2 mb-3">
                    <button onClick={() => setDanhMucHienTai('all')} style={{padding: '6px 12px', borderRadius: '20px', border: '1px solid #ddd', background: danhMucHienTai === 'all' ? colors.accentYellow : 'white'}}>All</button>
                    {dsDanhMuc.map(dm => (
                         <button key={dm.id} onClick={() => setDanhMucHienTai(dm.customId || dm.id)} style={{
                             padding: '6px 12px', borderRadius: '20px', whiteSpace: 'nowrap',
                             border: danhMucHienTai === (dm.customId || dm.id) ? `1px solid ${colors.accentYellow}` : '1px solid #ddd',
                             background: danhMucHienTai === (dm.customId || dm.id) ? colors.accentYellow : 'white', fontWeight: 'bold'
                         }}>{dm.ten}</button>
                    ))}
                 </div>

                 <Routes>
                    <Route path="/" element={<Home dsSanPham={dsSanPham} dsDanhMuc={dsDanhMuc} themVaoGio={themVaoGio} danhMuc={danhMucHienTai} tuKhoa={tuKhoa} colors={colors} />} />
                    <Route path="/product/:id" element={<ProductDetail dsSanPham={dsSanPham} themVaoGio={themVaoGio} colors={colors} />} />
                    <Route path="/cart" element={<Cart gioHang={gioHang} chinhSuaSoLuong={chinhSuaSoLuong} xoaSanPham={xoaSanPham} xoaHetGioHang={xoaHetGioHang} colors={colors} handleDatHang={handleDatHang} />} />
                 </Routes>
            </Col>
        </Row>
      </Container>
      <footer style={{ textAlign: 'center', padding: '30px', backgroundColor: colors.primaryGreen, color: 'white', marginTop: '50px' }}><p>© 2024 Thực phẩm MaiVang</p></footer>
    </div>
  )
}
export default App