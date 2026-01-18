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

// --- NHẬP FIREBASE ---
import { db } from './firebase'; 
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';

const colors = { primaryGreen: '#008848', accentYellow: '#ffc107', bgLight: '#f0fdf4', textDark: '#333', menuActiveBg: '#e6f7eb' };

function App() {
  
  // 1. DỮ LIỆU SẢN PHẨM (LẤY TỪ FIREBASE)
  const [dsSanPham, setDsSanPham] = useState([]);
  const sanPhamCollection = collection(db, "products"); // Tên bảng trên Firebase

  // Hàm tải sản phẩm từ Cloud về
  const fetchSanPham = async () => {
    const data = await getDocs(sanPhamCollection);
    setDsSanPham(data.docs.map((doc) => ({ ...doc.data(), id: doc.id }))); // ID giờ là chuỗi ký tự dài do Firebase tạo
  };

  // 2. DỮ LIỆU DANH MỤC (LẤY TỪ FIREBASE)
  const [dsDanhMuc, setDsDanhMuc] = useState([]);
  const danhMucCollection = collection(db, "categories");

  const fetchDanhMuc = async () => {
    const data = await getDocs(danhMucCollection);
    const list = data.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
    
    // Nếu chưa có danh mục nào (lần đầu chạy), tạo danh mục mẫu
    if (list.length === 0) {
        setDsDanhMuc([
            { id: 'all', ten: 'Tất cả', icon: '🏠', parent: null },
            { id: 'thitca', ten: 'Thịt, Cá', icon: '🥩', parent: null }
        ]);
    } else {
        setDsDanhMuc(list);
    }
  };

  // CHẠY 1 LẦN KHI VÀO WEB ĐỂ LẤY DỮ LIỆU
  useEffect(() => {
    fetchSanPham();
    fetchDanhMuc();
  }, []);

  // --- HÀM XỬ LÝ DATABASE (CRUD) ---
  
  // Xử lý Sản Phẩm (Thêm/Sửa/Xóa trên Firebase)
  const handleUpdateDS_SP = async (action, item) => {
      if (action === 'ADD') {
          await addDoc(sanPhamCollection, item);
      } else if (action === 'UPDATE') {
          const spDoc = doc(db, "products", item.id);
          // Loại bỏ id khỏi object trước khi update để tránh lỗi
          const { id, ...dataToUpdate } = item; 
          await updateDoc(spDoc, dataToUpdate);
      } else if (action === 'DELETE') {
          const spDoc = doc(db, "products", item); // item ở đây là ID
          await deleteDoc(spDoc);
      }
      fetchSanPham(); // Tải lại danh sách mới nhất
  };

  // Xử lý Danh Mục
  const handleUpdateDS_DM = async (action, item) => {
      if (action === 'ADD') {
          // Lưu ý: Firebase tự tạo ID ngẫu nhiên, nhưng ta muốn dùng ID ngắn gọn (vd: thitheo)
          // Nên ta sẽ dùng addDoc nhưng lưu field customId
          await addDoc(danhMucCollection, item);
      } else if (action === 'UPDATE') {
           const dmDoc = doc(db, "categories", item.id); // item.id này là ID của Firebase
           const { id, ...data } = item;
           await updateDoc(dmDoc, data);
      } else if (action === 'DELETE') {
           const dmDoc = doc(db, "categories", item);
           await deleteDoc(dmDoc);
      }
      fetchDanhMuc();
  };


  const [danhMucHienTai, setDanhMucHienTai] = useState('all'); 
  const [tuKhoa, setTuKhoa] = useState('');
  const navigate = useNavigate();
  const location = useLocation(); 

  // 3. GIỎ HÀNG (VẪN GIỮ LOCALSTORAGE VÌ LÀ RIÊNG TƯ)
  const [gioHang, setGioHang] = useState(() => {
      const duLieuCu = localStorage.getItem('gioHangCuaDuy');
      return duLieuCu ? JSON.parse(duLieuCu) : [];
  });
  useEffect(() => { localStorage.setItem('gioHangCuaDuy', JSON.stringify(gioHang)); }, [gioHang]);

  function themVaoGio(sp) {
    const tonTai = gioHang.find(i => i.id === sp.id);
    setGioHang(tonTai ? gioHang.map(i => i.id === sp.id ? { ...i, soLuong: i.soLuong + 1 } : i) : [...gioHang, { ...sp, soLuong: 1 }]);
  }
  function chinhSuaSoLuong(id, loai) {
     setGioHang(gioHang.map(sp => sp.id === id ? { ...sp, soLuong: Math.max(1, loai === 'tang' ? sp.soLuong + 1 : sp.soLuong - 1) } : sp));
  }
  function xoaSanPham(id) { setGioHang(gioHang.filter(sp => sp.id !== id)); }
  function xoaHetGioHang() { setGioHang([]); }

  // --- TRUYỀN HÀM XỬ LÝ DB VÀO ADMIN ---
  if (location.pathname === '/admin') {
      return (
        <Routes>
            <Route path="/admin" element={
                <Admin 
                    dsSanPham={dsSanPham} 
                    handleUpdateDS_SP={handleUpdateDS_SP} // Truyền hàm xử lý Firebase
                    dsDanhMuc={dsDanhMuc} 
                    handleUpdateDS_DM={handleUpdateDS_DM} // Truyền hàm xử lý Firebase
                />
            } />
        </Routes>
      );
  }

  // Lọc lấy danh sách Cha và Con cho Sidebar
  // Lưu ý: Trên Firebase ta không lưu id là 'thitca' mà là ID ngẫu nhiên, nên ta cần trường 'code' hoặc dùng chính ID đó
  const danhMucGoc = dsDanhMuc.filter(dm => !dm.parent);

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
            {/* SIDEBAR MENU */}
            <Col md={3} lg={2} className="d-none d-md-block">
                <div style={{ backgroundColor: 'white', borderRadius: '10px', overflow: 'hidden', position: 'sticky', top: '90px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                    <h5 style={{ backgroundColor: colors.primaryGreen, color: 'white', padding: '15px', margin: 0, textAlign: 'center' }}>DANH MỤC</h5>
                    <div style={{ padding: '10px' }}>
                        <button onClick={() => { setDanhMucHienTai('all'); navigate('/'); }} style={{width: '100%', textAlign: 'left', padding: '10px', border: 'none', background: danhMucHienTai === 'all' ? colors.menuActiveBg : 'transparent', fontWeight: 'bold'}}>🏠 Tất cả</button>
                        
                        {danhMucGoc.map(cha => {
                            if (cha.id === 'all') return null; // Bỏ qua nút All ở đây
                            const conCuaCha = dsDanhMuc.filter(dm => dm.parent === cha.customId || dm.parent === cha.id); // Hỗ trợ cả 2 kiểu ID
                            
                            return (
                                <div key={cha.id} style={{marginBottom: '5px'}}>
                                    <button onClick={() => { setDanhMucHienTai(cha.customId || cha.id); navigate('/'); window.scrollTo(0,0); }}
                                        style={{
                                            width: '100%', textAlign: 'left', padding: '10px', border: 'none', borderRadius: '5px',
                                            backgroundColor: danhMucHienTai === (cha.customId || cha.id) ? colors.menuActiveBg : 'transparent',
                                            color: danhMucHienTai === (cha.customId || cha.id) ? colors.primaryGreen : '#333',
                                            fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px'
                                        }}>
                                        <span>{cha.icon}</span> {cha.ten}
                                    </button>
                                    {conCuaCha.length > 0 && (
                                        <div style={{marginLeft: '20px', borderLeft: '2px solid #eee', paddingLeft: '5px'}}>
                                            {conCuaCha.map(con => (
                                                <button key={con.id} onClick={() => { setDanhMucHienTai(con.customId || con.id); navigate('/'); window.scrollTo(0,0); }}
                                                    style={{
                                                        width: '100%', textAlign: 'left', padding: '8px', border: 'none', borderRadius: '5px', marginTop: '2px',
                                                        backgroundColor: danhMucHienTai === (con.customId || con.id) ? colors.menuActiveBg : 'transparent',
                                                        color: danhMucHienTai === (con.customId || con.id) ? colors.primaryGreen : '#555', fontSize: '14px'
                                                    }}>
                                                    • {con.ten}
                                                </button>
                                            ))}
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
                    <button onClick={() => setDanhMucHienTai('all')} style={{padding: '6px 12px', borderRadius: '20px', border: '1px solid #ddd', background: danhMucHienTai === 'all' ? colors.accentYellow : 'white'}}>Tất cả</button>
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
                    <Route path="/cart" element={<Cart gioHang={gioHang} chinhSuaSoLuong={chinhSuaSoLuong} xoaSanPham={xoaSanPham} xoaHetGioHang={xoaHetGioHang} colors={colors} />} />
                 </Routes>
            </Col>
        </Row>
      </Container>
      <footer style={{ textAlign: 'center', padding: '30px', backgroundColor: colors.primaryGreen, color: 'white', marginTop: '50px' }}><p>© 2024 Thực phẩm MaiVang</p></footer>
    </div>
  )
}
export default App