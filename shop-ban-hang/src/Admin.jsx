import React, { useState, useEffect } from 'react';
import { Table, Button, Form, Modal, Badge, Tab, Tabs, Row, Col, Container, InputGroup, Card, Pagination, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { doc, setDoc, collection, onSnapshot, deleteDoc, updateDoc, addDoc, serverTimestamp, getDoc } from 'firebase/firestore'; 
// [QUAN TRỌNG] Dùng adminAuth và adminDb
import { adminAuth as auth, adminDb as db } from './firebase'; 
import { signInWithEmailAndPassword, onAuthStateChanged, signOut, updatePassword } from 'firebase/auth';
import { toSlug } from './utils';
import { toast } from 'react-toastify';
import * as XLSX from 'xlsx';

const ICON_LIST = ['🏠','📦','🥩','🥦','🍎','🍞','🥫','❄️','🍬','🍫','🍪','🍦','🍺','🥤','🥛','🧃','🧺','🛋️','🍳','🧹','🧽','🧼','🧴','🪥','💄','🔖','⚡','🔥','🎉','🎁'];
const NO_IMAGE = "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg";

function Admin() { 
  // --- A. STATE QUẢN LÝ ĐĂNG NHẬP & QUYỀN (MỚI) ---
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [loginInput, setLoginInput] = useState({ email: '', pass: '' });
  const [showPass, setShowPass] = useState(false);
  
  // State quản lý quyền
  const [adminWhitelist, setAdminWhitelist] = useState([]);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [passData, setPassData] = useState({ newPass: '', confirmPass: '' });

  // --- B. STATE DỮ LIỆU CŨ (GIỮ NGUYÊN) ---
  const [isUploading, setIsUploading] = useState(false);
  const [dsSanPham, setDsSanPham] = useState([]);
  const [dsDonHang, setDsDonHang] = useState([]);
  const [dsDanhMuc, setDsDanhMuc] = useState([]);
  const [dsBanner, setDsBanner] = useState([]);
  const [dsCoupon, setDsCoupon] = useState([]);
  const [dsShip, setDsShip] = useState([]); 
  const [dsUser, setDsUser] = useState([]); 
  const [dsReview, setDsReview] = useState([]); 
  const [dsTinTuc, setDsTinTuc] = useState([]); 

  const [shopConfig, setShopConfig] = useState({ 
    tenShop:'', slogan:'', logo:'', topBarText:'', copyright:'',
    diaChi:'', sdt:'', fax:'', email:'', openingHours:'',
    linkFacebook:'', zalo:'', 
    linkPolicy:'/chinh-sach', policyContent:'',
    linkGuide:'/huong-dan', guideContent:'',
    flashSaleEnd:'', tyLeDiem: 1000,                            
    bankInfo: { bankName: '', accountNum: '', accountName: '', bankBranch: '', qrImage: '' } 
  });

  const [modal, setModal] = useState({ sp: false, dm: false, order: false, user: false, post: false, news: false });
  const [postEditor, setPostEditor] = useState({ type: '', title: '', content: '' });
  const [editData, setEditData] = useState({ sp: null, dm: null, user: null, order: null, news: null });
  
  const [formDataSP, setFormDataSP] = useState({ ten:'', giaGoc:'', phanTramGiam:0, giaBan:'', donVi:'Cái', soLuong:100, moTa:'', anh:'', phanLoai:'', isMoi:false, isKhuyenMai:false, isBanChay:false, isFlashSale:false });
  const [formDM, setFormDM] = useState({ ten:'', icon:'', parent:'', order:'' });
  const [formBanner, setFormBanner] = useState({ img:'', link:'' });
  const [formCoupon, setFormCoupon] = useState({ code:'', giamGia:0 });
  const [formShip, setFormShip] = useState({ khuVuc:'', phi:0 });
  const [formTinTuc, setFormTinTuc] = useState({ tieuDe: '', anh: '', tomTat: '', noiDung: '' });
  const [userPoint, setUserPoint] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [sortPrice, setSortPrice] = useState('newest'); 
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(30);

  // --- 1. LOGIC AUTH (ĐÃ XÓA ĐOẠN CODE GÂY LỖI REMOVECHILD) ---
  useEffect(() => {
    // Chỉ lấy whitelist và check auth, KHÔNG can thiệp vào DOM nữa
    const unsubWhitelist = onSnapshot(doc(db, "cauHinh", "phanquyen"), (d) => {
      if (d.exists()) setAdminWhitelist(d.data().adminEmails || []);
    });

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const docSnap = await getDoc(doc(db, "cauHinh", "phanquyen"));
        const whitelist = docSnap.data()?.adminEmails || [];
        if (whitelist.length === 0 || whitelist.includes(user.email)) {
          setIsLoggedIn(true);
        } else {
          toast.error("Không có quyền Admin!");
          await signOut(auth);
          setIsLoggedIn(false);
        }
      } else {
        setIsLoggedIn(false);
      }
      setLoadingAuth(false);
    });

    return () => { unsubWhitelist(); unsubscribeAuth(); };
  }, []);

  const handleLogin = async (e) => { 
    e.preventDefault(); 
    try {
      await signInWithEmailAndPassword(auth, loginInput.email, loginInput.pass);
      toast.success("Chào mừng Admin!");
    } catch (error) { toast.error("Sai thông tin đăng nhập!"); }
  };

  const handleLogout = async () => { if(confirm("Đăng xuất Admin?")) { await signOut(auth); setIsLoggedIn(false); } };

  // --- 2. TẢI DỮ LIỆU ---
  useEffect(() => {
    if (isLoggedIn) {
      const unsubs = [
        onSnapshot(doc(db, "cauHinh", "thongTinChung"), d => d.exists() && setShopConfig(prev=>({...prev, ...d.data()}))),
        onSnapshot(collection(db, "banners"), s => setDsBanner(s.docs.map(d=>({id:d.id,...d.data()})))),
        onSnapshot(collection(db, "coupons"), s => setDsCoupon(s.docs.map(d=>({id:d.id,...d.data()})))),
        onSnapshot(collection(db, "shipping"), s => setDsShip(s.docs.map(d=>({id:d.id,...d.data()})))),
        onSnapshot(collection(db, "users"), s => setDsUser(s.docs.map(d=>({id:d.id,...d.data()})))),
        onSnapshot(collection(db, "reviews"), s => setDsReview(s.docs.map(d=>({id:d.id,...d.data()})))),
        onSnapshot(collection(db, "tinTuc"), s => setDsTinTuc(s.docs.map(d=>({id:d.id,...d.data()})))),
        onSnapshot(collection(db, "sanPham"), s => setDsSanPham(s.docs.map(d=>({id:d.id,...d.data()})))),
        onSnapshot(collection(db, "donHang"), s => setDsDonHang(s.docs.map(d=>({id:d.id,...d.data()})))),
        onSnapshot(collection(db, "danhMuc"), s => setDsDanhMuc(s.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>a.order-b.order))),
      ];
      return () => unsubs.forEach(u => u());
    }
  }, [isLoggedIn]);

  // --- 3. HÀM XỬ LÝ (GIỮ NGUYÊN) ---
  const luuCauHinh = async () => { await setDoc(doc(db, "cauHinh", "thongTinChung"), shopConfig); toast.success("Đã lưu cấu hình!"); };
  
  const compressImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader(); reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image(); img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas'); const MAX_WIDTH = 800; const scaleSize = MAX_WIDTH / img.width; canvas.width = MAX_WIDTH; canvas.height = img.height * scaleSize; const ctx = canvas.getContext('2d'); ctx.drawImage(img, 0, 0, canvas.width, canvas.height); resolve(canvas.toDataURL('image/jpeg', 0.7));
        };
      };
    });
  };

  const handleUpload = async (e, type) => { 
    const f = e.target.files[0]; if(!f) return; setIsUploading(true); 
    const compressedImg = await compressImage(f); setIsUploading(false); 
    if(type==='LOGO') setShopConfig({...shopConfig,logo:compressedImg}); 
    if(type==='PRODUCT') setFormDataSP({...formDataSP,anh:compressedImg}); 
    if(type==='BANNER') setFormBanner({...formBanner,img:compressedImg}); 
    if(type==='QR') setShopConfig(p => ({...p, bankInfo: {...p.bankInfo, qrImage: compressedImg}})); 
    if(type==='NEWS') setFormTinTuc({...formTinTuc, anh:compressedImg}); 
  };
  
  const add = async (col, d) => await addDoc(collection(db, col), d); const del = async (col, id) => confirm('Xóa?') && await deleteDoc(doc(db, col, id));
  
  useEffect(() => { const g = parseInt(formDataSP.giaGoc)||0; const p = parseInt(formDataSP.phanTramGiam)||0; setFormDataSP(prev => ({...prev, giaBan: g > 0 ? Math.floor(g*(1-p/100)) : 0})); }, [formDataSP.giaGoc, formDataSP.phanTramGiam]);
  
  const validateSP = () => { if (!formDataSP.ten.trim()) { toast.warning("Vui lòng nhập tên SP!"); return false; } return true; }

  const onSaveSP = async () => { 
    if (!validateSP()) return;
    const data = { ...formDataSP, slug: toSlug(formDataSP.ten) };
    if (!editData.sp || !editData.sp.ngayTao) data.ngayTao = serverTimestamp();
    try { if(editData.sp) await updateDoc(doc(db, "sanPham", editData.sp.id), data); else await addDoc(collection(db, "sanPham"), data); setModal({...modal,sp:false}); toast.success("Lưu thành công!"); } catch(err) { toast.error("Lỗi: " + err.message); }
  };

  const onSaveDM = async () => { const data = {...formDM, slug: toSlug(formDM.ten)}; if(editData.dm) await updateDoc(doc(db, "danhMuc", editData.dm.id), data); else await addDoc(collection(db, "danhMuc"), data); setModal({...modal,dm:false}); };
  const handleUpdateStatusOrder = async (id, status) => { await updateDoc(doc(db, "donHang", id), {trangThai: status}); };
  const handleDeleteOrder = async (id) => { if(confirm("Xóa đơn hàng?")) await deleteDoc(doc(db, "donHang", id)); };
  const openPostEditor = (type) => { if (type === 'policy') setPostEditor({ type: 'policy', title: 'Chính Sách Đổi Trả', content: shopConfig.policyContent || '' }); else setPostEditor({ type: 'guide', title: 'Hướng Dẫn Mua Hàng', content: shopConfig.guideContent || '' }); setModal({...modal, post: true}); };
  const savePostContent = () => { if (postEditor.type === 'policy') setShopConfig(prev => ({ ...prev, policyContent: postEditor.content })); else setShopConfig(prev => ({ ...prev, guideContent: postEditor.content })); setModal({...modal, post: false}); };
  const onSaveNews = async () => { const data = { ...formTinTuc, slug: toSlug(formTinTuc.tieuDe), ngayDang: serverTimestamp() }; if (editData.news) await updateDoc(doc(db, "tinTuc", editData.news.id), data); else await addDoc(collection(db, "tinTuc"), data); setModal({...modal, news: false}); toast.success("Đã đăng bài!"); };

  const handleExportExcel = () => { const ws = XLSX.utils.json_to_sheet(dsSanPham); const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, "SP"); XLSX.writeFile(wb, "DanhSachSP.xlsx"); };
  const handleImportExcel = (e) => { 
      const file = e.target.files[0]; if (!file) return; const reader = new FileReader(); reader.readAsBinaryString(file);
      reader.onload = async (evt) => {
          const wb = XLSX.read(evt.target.result, {type:'binary'}); const ws = wb.Sheets[wb.SheetNames[0]]; const data = XLSX.utils.sheet_to_json(ws);
          if(!confirm(`Cập nhật ${data.length} SP?`)) return;
          const ups = data.map(row => { const id = row["ID"] || row["ID (Không sửa)"]; if(!id) return null; return updateDoc(doc(db, "sanPham", id), { giaGoc: row["Giá gốc"], soLuong: row["Kho"], ten: row["Tên sản phẩm"] }); });
          await Promise.all(ups.filter(x=>x)); toast.success("Xong!");
      };
  };

  const handleAddAdmin = async () => { if (!newAdminEmail.includes('@')) return toast.error("Email sai!"); await updateDoc(doc(db, "cauHinh", "phanquyen"), { adminEmails: [...adminWhitelist, newAdminEmail] }); setNewAdminEmail(''); toast.success("Đã thêm!"); };
  const handleRemoveAdmin = async (email) => { if (adminWhitelist.length <= 1) return toast.warning("Giữ lại 1 admin!"); if (confirm(`Xóa ${email}?`)) await updateDoc(doc(db, "cauHinh", "phanquyen"), { adminEmails: adminWhitelist.filter(e => e !== email) }); };
  const handleUpdatePassword = async (e) => { e.preventDefault(); if (passData.newPass !== passData.confirmPass) return toast.error("Không khớp!"); try { await updatePassword(auth.currentUser, passData.newPass); toast.success("Xong!"); } catch (e) { toast.error(e.message); } };

  // --- LOGIC HIỂN THỊ ---
  const filteredProducts = dsSanPham
    .filter(sp => {
        if (filterCategory) {
            const subCats = dsDanhMuc.filter(d => d.parent === filterCategory).map(d => d.id);
            const validCats = [filterCategory, ...subCats];
            if (!validCats.includes(sp.phanLoai)) return false; 
        }
        return true;
    })
    .filter(sp => {
        if (!filterStatus) return true;
        if (filterStatus === 'new') return sp.isMoi;
        if (filterStatus === 'best') return sp.isBanChay;
        if (filterStatus === 'flash') return sp.isFlashSale;
        if (filterStatus === 'discount') return sp.phanTramGiam > 0;
        if (filterStatus === 'stock_out') return sp.soLuong <= 0;
        return true;
    })
    .sort((a, b) => {
      if (sortPrice === 'newest') return (b.ngayTao?.seconds || 0) - (a.ngayTao?.seconds || 0);
      if (sortPrice === 'asc') return (a.giaBan - b.giaBan);
      if (sortPrice === 'desc') return (b.giaBan - a.giaBan);
      return 0;
    });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const totalRevenue = dsDonHang.reduce((acc, order) => acc + (order.tongTien || 0), 0);
  const lowStockProducts = dsSanPham.filter(sp => sp.soLuong <= 5).sort((a,b)=>a.soLuong-b.soLuong);
  const ImageSize = ({ src }) => { const [s, setS] = useState({ w: 0, h: 0 }); const i = new Image(); i.src = src; i.onload = () => setS({ w: i.width, h: i.height }); return <span className="small text-muted d-block mt-1">{s.w} x {s.h} px</span>; };

  // --- GIAO DIỆN ---
  if (loadingAuth) return <div className="text-center py-5"><Spinner animation="border" variant="success" /></div>;

  if (!isLoggedIn) return (
    <div className="admin-login-wrapper">
      <div className="admin-login-card shadow-lg border-0">
        <h3 className="text-center text-success fw-bold mb-4">QUẢN TRỊ SHOP</h3>
        <Form onSubmit={handleLogin}>
          <Form.Group className="mb-3"><Form.Label className="fw-bold">Email Admin</Form.Label><Form.Control className="p-3" type="email" value={loginInput.email} onChange={e=>setLoginInput({...loginInput, email:e.target.value})} placeholder="admin@maivang.com" /></Form.Group>
          <Form.Group className="mb-4"><Form.Label className="fw-bold">Mật khẩu</Form.Label><InputGroup><Form.Control className="p-3" type={showPass?"text":"password"} value={loginInput.pass} onChange={e=>setLoginInput({...loginInput, pass:e.target.value})} placeholder="******" /><Button variant="outline-secondary" onClick={()=>setShowPass(!showPass)}><i className={showPass?"fa-solid fa-eye-slash":"fa-solid fa-eye"}></i></Button></InputGroup></Form.Group>
          <Button type="submit" variant="success" className="w-100 py-3 fw-bold rounded-pill">ĐĂNG NHẬP</Button>
        </Form>
      </div>
    </div>
  );

  return (
    <div style={{background: '#f8f9fa', minHeight:'100vh'}}>
      <div className="admin-header"><h4 className="m-0 fw-bold text-uppercase">QUẢN TRỊ VIÊN</h4><div className="d-flex align-items-center gap-2"><span className="text-white-50 small d-none d-md-block">Xin chào, {auth.currentUser?.email}</span><Button variant="danger" size="sm" className="fw-bold px-3" onClick={handleLogout}>Thoát</Button></div></div>
      <Container fluid className="p-3">
        <Tabs defaultActiveKey="dashboard" className="bg-white p-2 rounded border shadow-sm mb-3">
          
          <Tab eventKey="dashboard" title="📊 TỔNG QUAN">
            <div className="p-3">
              <Row className="g-3 mb-4"><Col md={3}><div className="p-3 bg-primary text-white rounded shadow-sm"><h5>Tổng đơn</h5><h2 className="fw-bold">{dsDonHang.length}</h2></div></Col><Col md={3}><div className="p-3 bg-success text-white rounded shadow-sm"><h5>Doanh thu</h5><h2 className="fw-bold">{totalRevenue.toLocaleString()} ¥</h2></div></Col><Col md={3}><div className="p-3 bg-warning text-dark rounded shadow-sm"><h5>Sản phẩm</h5><h2 className="fw-bold">{dsSanPham.length}</h2></div></Col><Col md={3}><div className="p-3 bg-info text-white rounded shadow-sm"><h5>Thành viên</h5><h2 className="fw-bold">{dsUser.length}</h2></div></Col></Row>
              <Row>
                <Col md={6}><div className="bg-white p-3 rounded shadow-sm border h-100"><h6 className="fw-bold text-danger border-bottom pb-2">⚠️ SẮP HẾT HÀNG (Kho &lt;= 5)</h6><div style={{maxHeight:'300px', overflowY:'auto'}}><Table size="sm" hover><thead><tr><th>Tên</th><th>Kho</th></tr></thead><tbody>{lowStockProducts.map(sp => (<tr key={sp.id}><td>{sp.ten}</td><td className="text-danger fw-bold">{sp.soLuong}</td></tr>))}</tbody></Table></div></div></Col>
                <Col md={6}><div className="bg-white p-3 rounded shadow-sm border h-100"><h6 className="fw-bold text-primary border-bottom pb-2">📦 ĐƠN MỚI NHẤT</h6><div style={{maxHeight:'300px', overflowY:'auto'}}>{dsDonHang.sort((a,b)=>b.ngayDat-a.ngayDat).slice(0,5).map(dh => (<div key={dh.id} className="d-flex justify-content-between border-bottom py-2"><div><strong>{dh.maDonHang}</strong> - {dh.khachHang?.ten}</div><div className="text-success fw-bold">{dh.tongTien?.toLocaleString()} ¥</div></div>))}</div></div></Col>
              </Row>
            </div>
          </Tab>

          <Tab eventKey="products" title="📦 SẢN PHẨM">
            <div className="bg-white p-3 rounded shadow-sm">
              <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                  <div className="d-flex gap-2">
                      <Button variant="success" className="fw-bold" onClick={()=>{setEditData({...editData, sp:null}); setFormDataSP({ ten:'', giaGoc:'', phanTramGiam:0, giaBan:'', donVi:'Cái', soLuong:100, moTa:'', anh:'', phanLoai:'', isMoi:false, isKhuyenMai:false, isBanChay:false, isFlashSale:false }); setModal({...modal, sp:true})}}>+ THÊM MỚI</Button>
                      <Button variant="outline-success" onClick={handleExportExcel}><i className="fa-solid fa-file-excel me-2"></i> Xuất Excel</Button>
                      <div className="position-relative"><Button variant="outline-primary"><i className="fa-solid fa-file-import me-2"></i> Nhập giá & Kho</Button><input type="file" accept=".xlsx, .xls" onChange={handleImportExcel} style={{position:'absolute', top:0, left:0, width:'100%', height:'100%', opacity:0, cursor:'pointer'}} /></div>
                  </div>
                  <div className="d-flex gap-2">
                    <Form.Select size="sm" style={{width:180}} value={filterCategory} onChange={e=>setFilterCategory(e.target.value)}><option value="">-- Tất cả danh mục --</option>{dsDanhMuc.map(d => <option key={d.id} value={d.id}>{d.ten}</option>)}</Form.Select>
                    <Form.Select size="sm" style={{width:160}} value={filterStatus} onChange={e=>setFilterStatus(e.target.value)}><option value="">-- Tình trạng --</option><option value="new">✨ Mới</option><option value="best">🔥 Bán chạy</option><option value="flash">⚡ Flash Sale</option><option value="discount">🏷️ Giảm giá</option><option value="stock_out">🚫 Hết hàng</option></Form.Select>
                    <Form.Select size="sm" style={{width:150}} value={sortPrice} onChange={e=>setSortPrice(e.target.value)}><option value="newest">✨ Mới nhất</option><option value="asc">Giá thấp đến cao</option><option value="desc">Giá cao đến thấp</option></Form.Select>
                  </div>
              </div>
              <div className="table-responsive mb-3">
                <Table hover bordered className="align-middle">
                  <thead className="bg-light"><tr><th>Ảnh</th><th>Tên</th><th>Đơn vị</th><th>Kho</th><th>Giá bán</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
                  <tbody>{currentProducts.map(sp=>(<tr key={sp.id}>
                    <td><img src={sp.anh||NO_IMAGE} width="50" height="50" style={{objectFit:'cover', borderRadius:4}}/></td>
                    <td className="fw-bold">{sp.ten}</td>
                    <td>{sp.donVi}</td>
                    <td className={sp.soLuong<10?'text-danger fw-bold':''}>{sp.soLuong}</td>
                    <td className="text-danger fw-bold">{sp.giaBan?.toLocaleString()}¥</td>
                    <td>
                      {sp.isFlashSale && <Badge bg="warning" text="dark" className="me-1">⚡ Sale</Badge>}
                      {sp.phanTramGiam > 0 && <Badge bg="danger" className="me-1">-{sp.phanTramGiam}%</Badge>}
                      {sp.isMoi && <Badge bg="success" className="me-1">New</Badge>}
                      {sp.isBanChay && <Badge bg="info" className="me-1">🔥 Hot</Badge>}
                    </td>
                    <td><Button size="sm" variant="warning" className="me-1" onClick={()=>{setEditData({...editData, sp}); setFormDataSP(sp); setModal({...modal, sp:true})}}>Sửa</Button><Button size="sm" variant="danger" onClick={async()=>{if(confirm('Xóa?')) await deleteDoc(doc(db,"sanPham",sp.id))}}>Xóa</Button></td>
                  </tr>))}</tbody>
                </Table>
              </div>
              <div className="d-flex justify-content-between align-items-center border-top pt-3"><div className="d-flex align-items-center gap-2"><span className="text-muted small">Hiển thị:</span><Form.Select size="sm" value={itemsPerPage} onChange={(e) => { setItemsPerPage(parseInt(e.target.value)); setCurrentPage(1); }} style={{width: '70px'}}><option value="10">10</option><option value="30">30</option><option value="50">50</option><option value="100">100</option></Form.Select><span className="text-muted small">dòng / trang</span></div><Pagination className="m-0"><Pagination.Prev onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} />{[...Array(totalPages)].map((_, i) => (<Pagination.Item key={i+1} active={i+1 === currentPage} onClick={() => paginate(i+1)}>{i+1}</Pagination.Item>))}<Pagination.Next onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages} /></Pagination></div>
            </div>
          </Tab>

          {/* TAB 5: ĐƠN HÀNG */}
          <Tab eventKey="orders" title={`📋 ĐƠN HÀNG (${dsDonHang.length})`}>
            <div className="table-responsive bg-white rounded shadow-sm p-3">
              <Table hover bordered className="align-middle">
                <thead className="bg-light text-uppercase small"><tr><th>Mã</th><th>Ngày</th><th>Khách</th><th>Thanh toán</th><th>Tổng</th><th>Trạng thái</th><th>Xử lý</th></tr></thead>
                <tbody>{dsDonHang.sort((a,b)=>b.ngayDat-a.ngayDat).map(dh=><tr key={dh.id}><td className="fw-bold text-primary">{dh.maDonHang||`#${dh.id.slice(0,5)}`}</td><td>{dh.ngayDat?.toDate?dh.ngayDat.toDate().toLocaleDateString('vi-VN'):''}</td><td><div>{dh.khachHang?.ten}</div><small className="text-muted">{dh.khachHang?.sdt}</small></td><td><Badge bg="info">{dh.hinhThucThanhToan==='cod'?'COD':(dh.hinhThucThanhToan==='bank'?'Chuyển khoản':'QR Code')}</Badge></td><td className="text-danger fw-bold">{dh.tongTien?.toLocaleString()}¥</td><td><select className="form-select form-select-sm" value={dh.trangThai} onChange={(e)=>handleUpdateStatusOrder(dh.id,e.target.value)} style={{width:130, fontWeight:'bold', color: dh.trangThai==='Hoàn thành'?'green':'orange'}}><option>Mới đặt</option><option>Đang giao</option><option>Hoàn thành</option><option>Đã hủy</option></select></td><td><Button size="sm" variant="info" className="me-1 text-white" onClick={()=>{setSelectedOrder(dh);setModal({...modal, order:true})}}>Xem</Button><Button size="sm" variant="danger" onClick={()=>handleDeleteOrder(dh.id)}>Xóa</Button></td></tr>)}</tbody>
              </Table>
            </div>
          </Tab>

          {/* TAB 6: SHIP & COUPON */}
          <Tab eventKey="marketing" title="🎟️ SHIP & COUPON">
            <Row>
              <Col md={6}>
                <div className="bg-white p-3 shadow-sm rounded h-100"><h6 className="fw-bold text-success border-bottom pb-2">MÃ GIẢM GIÁ</h6><div className="d-flex gap-1 mb-2"><Form.Control placeholder="Mã" value={formCoupon.code} onChange={e=>setFormCoupon({...formCoupon,code:e.target.value.toUpperCase()})}/><Form.Control type="number" placeholder="Giảm (¥)" value={formCoupon.giamGia} onChange={e=>setFormCoupon({...formCoupon,giamGia:e.target.value})}/><Button size="sm" onClick={()=>{add('coupons',formCoupon); setFormCoupon({code:'',giamGia:0})}}>Thêm</Button></div><Table size="sm"><tbody>{dsCoupon.map(c=><tr key={c.id}><td>{c.code}</td><td>{parseInt(c.giamGia).toLocaleString()}¥</td><td><Button size="sm" variant="danger" onClick={()=>del('coupons',c.id)}>X</Button></td></tr>)}</tbody></Table></div>
              </Col>
              <Col md={6}>
                <div className="bg-white p-3 shadow-sm rounded h-100"><h6 className="fw-bold text-primary border-bottom pb-2">PHÍ SHIP</h6><div className="d-flex gap-1 mb-2"><Form.Control placeholder="Khu vực" value={formShip.khuVuc} onChange={e=>setFormShip({...formShip,khuVuc:e.target.value})}/><Form.Control type="number" placeholder="Phí (¥)" value={formShip.phi} onChange={e=>setFormShip({...formShip,phi:e.target.value})}/><Button size="sm" onClick={()=>{add('shipping',formShip); setFormShip({khuVuc:'',phi:0})}}>Thêm</Button></div><Table size="sm"><tbody>{dsShip.map(s=><tr key={s.id}><td>{s.khuVuc}</td><td>{parseInt(s.phi).toLocaleString()}¥</td><td><Button size="sm" variant="danger" onClick={()=>del('shipping',s.id)}>X</Button></td></tr>)}</tbody></Table></div>
              </Col>
            </Row>
          </Tab>
          
          {/* TAB 7: TIN TỨC */}
          <Tab eventKey="news" title="📰 TIN TỨC">
            <div className="bg-white p-3 rounded shadow-sm">
              <Button variant="success" className="mb-3 fw-bold" onClick={()=>{setEditData({...editData, news:null}); setFormTinTuc({ tieuDe: '', anh: '', tomTat: '', noiDung: '' }); setModal({...modal, news:true})}}>+ VIẾT BÀI MỚI</Button>
              <Table hover bordered><thead><tr><th>Ảnh</th><th>Tiêu đề</th><th>Tóm tắt</th><th>Ngày đăng</th><th>Thao tác</th></tr></thead><tbody>{dsTinTuc.map(tin => (<tr key={tin.id}><td><img src={tin.anh || NO_IMAGE} width="60" height="40" style={{objectFit:'cover'}}/></td><td className="fw-bold">{tin.tieuDe}</td><td style={{maxWidth:'300px'}} className="text-truncate">{tin.tomTat}</td><td>{tin.ngayDang ? new Date(tin.ngayDang.seconds * 1000).toLocaleDateString('vi-VN') : ''}</td><td><Button size="sm" variant="warning" className="me-1" onClick={()=>{setEditData({...editData, news:tin}); setFormTinTuc(tin); setModal({...modal, news:true})}}>Sửa</Button><Button size="sm" variant="danger" onClick={()=>del('tinTuc', tin.id)}>Xóa</Button></td></tr>))}</tbody></Table>
            </div>
          </Tab>

          {/* TAB 8: THÀNH VIÊN & ĐÁNH GIÁ */}
          <Tab eventKey="users" title="👥 THÀNH VIÊN & ĐÁNH GIÁ">
            <Row>
              <Col md={7}><div className="bg-white p-3 rounded shadow-sm h-100"><h6 className="fw-bold text-primary border-bottom pb-2">DANH SÁCH THÀNH VIÊN</h6><div className="table-responsive"><Table size="sm" hover><thead><tr><th>Tên</th><th>Email</th><th>Điểm</th><th>Thao tác</th></tr></thead><tbody>{dsUser.map(u=><tr key={u.id}><td>{u.ten}</td><td>{u.email}</td><td className="text-warning fw-bold">{u.diemTichLuy}</td><td><Button size="sm" onClick={()=>{setEditData({...editData, user:u}); setUserPoint(u.diemTichLuy); setModal({...modal, user:true})}}>Sửa</Button></td></tr>)}</tbody></Table></div></div></Col>
              <Col md={5}><div className="bg-white p-3 rounded shadow-sm h-100"><h6 className="fw-bold text-warning border-bottom pb-2">ĐÁNH GIÁ MỚI</h6><div style={{maxHeight:400,overflowY:'auto'}}>{dsReview.map(r=><div key={r.id} className="border-bottom py-2"><div className="d-flex justify-content-between"><strong>{r.userName}</strong><small className="text-muted">{r.ngay?.toDate().toLocaleDateString()}</small></div><div className="text-warning small">{'⭐'.repeat(r.rating)}</div><p className="mb-1 small text-secondary">{r.comment}</p><Button size="sm" variant="outline-danger" style={{fontSize:10}} onClick={()=>del('reviews', r.id)}>Xóa</Button></div>)}</div></div></Col>
            </Row>
          </Tab>

          {/* TAB 9: QUYỀN & MẬT KHẨU (TÍNH NĂNG MỚI) */}
          <Tab eventKey="system" title="🔐 QUYỀN & MẬT KHẨU">
             <Row className="p-3 g-4">
                <Col md={6}>
                  <Card className="p-3 shadow-sm h-100"><h6 className="fw-bold text-primary border-bottom pb-2">QUẢN LÝ QUYỀN ADMIN</h6><InputGroup className="mb-3"><Form.Control placeholder="Nhập email admin mới..." value={newAdminEmail} onChange={e=>setNewAdminEmail(e.target.value)}/><Button variant="success" onClick={handleAddAdmin}>+ Cấp quyền</Button></InputGroup><Table size="sm" bordered hover><thead className="bg-light"><tr><th>Email Admin</th><th>Xử lý</th></tr></thead><tbody>{adminWhitelist.map((email, i)=>(<tr key={i}><td>{email}</td><td className="text-center"><Button variant="link" className="text-danger p-0" onClick={()=>handleRemoveAdmin(email)}><i className="fa-solid fa-trash-can"></i></Button></td></tr>))}</tbody></Table></Card>
                </Col>
                <Col md={6}>
                  <Card className="p-3 shadow-sm h-100"><h6 className="fw-bold text-warning border-bottom pb-2">ĐỔI MẬT KHẨU</h6><Form onSubmit={handleUpdatePassword}><Form.Group className="mb-3"><Form.Label className="small fw-bold">Mật khẩu mới</Form.Label><Form.Control type="password" value={passData.newPass} onChange={e=>setPassData({...passData, newPass:e.target.value})} required /></Form.Group><Form.Group className="mb-3"><Form.Label className="small fw-bold">Xác nhận mật khẩu</Form.Label><Form.Control type="password" value={passData.confirmPass} onChange={e=>setPassData({...passData, confirmPass:e.target.value})} required /></Form.Group><Button type="submit" variant="warning" className="w-100 fw-bold">CẬP NHẬT NGAY</Button></Form></Card>
                </Col>
             </Row>
          </Tab>

          {/* TAB 2: CẤU HÌNH & BANNER (GIỮ NGUYÊN 100%) */}
          <Tab eventKey="config" title="⚙️ CẤU HÌNH & BANNER">
            <div className="bg-white p-4 border rounded shadow-sm">
              <Row>
                <Col md={6} className="border-end">
                  <h6 className="text-success fw-bold border-bottom pb-2 mb-3"><i className="fa-solid fa-shop me-2"></i> THÔNG TIN CỬA HÀNG</h6>
                  <Form.Group className="mb-3 text-center">
                    <div className="border p-2 mb-2 d-flex align-items-center justify-content-center mx-auto bg-light" style={{height:120, width:120, borderRadius:'50%'}}>{shopConfig.logo ? <img src={shopConfig.logo} style={{maxHeight:'100%', maxWidth:'100%', borderRadius:'50%'}}/> : <span className="text-muted">Logo</span>}</div>
                    <Form.Label className="btn btn-sm btn-outline-primary" style={{cursor:'pointer'}}>Chọn Logo {isUploading && <Spinner size="sm" animation="border" />} <Form.Control type="file" hidden onChange={e=>handleUpload(e,'LOGO')}/></Form.Label>
                  </Form.Group>
                  <Row className="g-3">
                    <Col md={6}><Form.Group><Form.Label className="fw-bold">Tên Shop</Form.Label><Form.Control value={shopConfig.tenShop} onChange={e=>setShopConfig({...shopConfig, tenShop:e.target.value})}/></Form.Group></Col>
                    <Col md={6}><Form.Group><Form.Label className="fw-bold">Slogan</Form.Label><Form.Control value={shopConfig.slogan} onChange={e=>setShopConfig({...shopConfig, slogan:e.target.value})}/></Form.Group></Col>
                    <Col md={12}><Form.Group><Form.Label className="fw-bold">Thông báo Header</Form.Label><Form.Control as="textarea" rows={2} value={shopConfig.topBarText} onChange={e=>setShopConfig({...shopConfig, topBarText:e.target.value})}/></Form.Group></Col>
                    <Col md={12}><Form.Group><Form.Label className="fw-bold">Địa chỉ</Form.Label><Form.Control value={shopConfig.diaChi} onChange={e=>setShopConfig({...shopConfig, diaChi:e.target.value})}/></Form.Group></Col>
                    <Col md={6}><Form.Group><Form.Label className="fw-bold">Hotline</Form.Label><Form.Control value={shopConfig.sdt} onChange={e=>setShopConfig({...shopConfig, sdt:e.target.value})}/></Form.Group></Col>
                    <Col md={6}><Form.Group><Form.Label className="fw-bold">Email</Form.Label><Form.Control value={shopConfig.email} onChange={e=>setShopConfig({...shopConfig, email:e.target.value})}/></Form.Group></Col>
                    <Col md={6}><Form.Group><Form.Label className="fw-bold">Giờ mở cửa</Form.Label><Form.Control value={shopConfig.openingHours} onChange={e=>setShopConfig({...shopConfig, openingHours:e.target.value})}/></Form.Group></Col>
                    <Col md={6}><Form.Group><Form.Label className="fw-bold">Copyright Footer</Form.Label><Form.Control value={shopConfig.copyright} onChange={e=>setShopConfig({...shopConfig, copyright:e.target.value})}/></Form.Group></Col>
                  </Row>
                  <h6 className="text-warning fw-bold border-bottom pb-2 mt-4 mb-3"><i className="fa-solid fa-credit-card me-2"></i> THANH TOÁN (QR)</h6>
                  <Row className="g-3">
                    <Col md={8}>
                        <Form.Group className="mb-2"><Form.Label className="fw-bold">Ngân hàng</Form.Label><Form.Control size="sm" value={shopConfig.bankInfo?.bankName} onChange={e=>setShopConfig({...shopConfig, bankInfo:{...shopConfig.bankInfo, bankName:e.target.value}})}/></Form.Group>
                        <Form.Group className="mb-2"><Form.Label className="fw-bold">Số TK</Form.Label><Form.Control size="sm" value={shopConfig.bankInfo?.accountNum} onChange={e=>setShopConfig({...shopConfig, bankInfo:{...shopConfig.bankInfo, accountNum:e.target.value}})}/></Form.Group>
                        <Form.Group><Form.Label className="fw-bold">Chủ TK</Form.Label><Form.Control size="sm" value={shopConfig.bankInfo?.accountName} onChange={e=>setShopConfig({...shopConfig, bankInfo:{...shopConfig.bankInfo, accountName:e.target.value}})}/></Form.Group>
                    </Col>
                    <Col md={4} className="text-center"><div className="border rounded p-1 mb-2 bg-light"><img src={shopConfig.bankInfo?.qrImage} style={{width:'100%', maxHeight:'150px', objectFit:'contain'}} alt="QR Code" /></div><Form.Control type="file" size="sm" onChange={e=>handleUpload(e,'QR')}/></Col>
                  </Row>
                </Col>
                <Col md={6}>
                  <h6 className="text-primary fw-bold border-bottom pb-2 mb-3"><i className="fa-solid fa-images me-2"></i> QUẢN LÝ BANNER SLIDE</h6>
                  <div className="bg-light p-3 rounded mb-4">
                    <div className="d-flex gap-2 mb-3 align-items-center">
                        <div className="flex-grow-1"><Form.Control type="file" size="sm" onChange={e=>handleUpload(e,'BANNER')}/><Form.Text className="text-muted">Kích thước chuẩn: <strong>1200 x 400 px</strong></Form.Text></div>
                        <Form.Control size="sm" placeholder="Link..." value={formBanner.link} onChange={e=>setFormBanner({...formBanner,link:e.target.value})}/><Button size="sm" onClick={()=>{add('banners', formBanner); setFormBanner({img:'', link:''})}}>Thêm</Button>
                    </div>
                    <div className="d-flex flex-wrap gap-3" style={{maxHeight:'250px', overflowY:'auto'}}>{dsBanner.map(b=> (<div key={b.id} className="position-relative border rounded p-1 bg-white shadow-sm" style={{width:'100%'}}><img src={b.img} className="w-100 rounded" /><Button size="sm" variant="danger" className="position-absolute top-0 end-0 rounded-circle" style={{transform:'translate(30%,-30%)', padding:'2px 8px'}} onClick={()=>del('banners', b.id)}>x</Button></div>))}</div>
                  </div>
                  <h6 className="text-info fw-bold border-bottom pb-2 mb-3"><i className="fa-solid fa-link me-2"></i> LIÊN KẾT & BÀI VIẾT</h6>
                  <Row className="g-3 mb-4">
                    <Col md={6}><Form.Group><Form.Label className="fw-bold">Facebook</Form.Label><Form.Control size="sm" value={shopConfig.linkFacebook} onChange={e=>setShopConfig({...shopConfig, linkFacebook:e.target.value})}/></Form.Group></Col>
                    <Col md={6}><Form.Group><Form.Label className="fw-bold">Zalo OA</Form.Label><Form.Control size="sm" value={shopConfig.zalo} onChange={e=>setShopConfig({...shopConfig, zalo:e.target.value})}/></Form.Group></Col>
                    <Col md={12}><Form.Label className="fw-bold">Chính Sách Đổi Trả</Form.Label><InputGroup size="sm"><Form.Control value={shopConfig.linkPolicy} placeholder="/chinh-sach" onChange={e=>setShopConfig({...shopConfig, linkPolicy:e.target.value})}/><Button variant="outline-primary" onClick={() => openPostEditor('policy')}><i className="fa-solid fa-pen"></i> Soạn bài</Button></InputGroup></Col>
                    <Col md={12}><Form.Label className="fw-bold">Hướng Dẫn Mua Hàng</Form.Label><InputGroup size="sm"><Form.Control value={shopConfig.linkGuide} placeholder="/huong-dan" onChange={e=>setShopConfig({...shopConfig, linkGuide:e.target.value})}/><Button variant="outline-primary" onClick={() => openPostEditor('guide')}><i className="fa-solid fa-pen"></i> Soạn bài</Button></InputGroup></Col>
                  </Row>
                  <h6 className="text-danger fw-bold border-bottom pb-2 mb-3"><i className="fa-solid fa-bolt me-2"></i> FLASH SALE & ĐIỂM</h6>
                  <Row className="g-3">
                    <Col md={6}><Form.Group><Form.Label className="fw-bold">Kết thúc Flash Sale</Form.Label><Form.Control size="sm" type="datetime-local" value={shopConfig.flashSaleEnd} onChange={e=>setShopConfig({...shopConfig, flashSaleEnd:e.target.value})}/></Form.Group></Col>
                    <Col md={6}><Form.Group><Form.Label className="fw-bold">Tỷ lệ điểm (Yên/1 điểm)</Form.Label><Form.Control size="sm" type="number" value={shopConfig.tyLeDiem} onChange={e=>setShopConfig({...shopConfig, tyLeDiem:e.target.value})}/></Form.Group></Col>
                  </Row>
                </Col>
              </Row>
              <div className="mt-4 pt-3 border-top text-end"><Button variant="success" size="lg" className="fw-bold px-5 shadow" onClick={luuCauHinh}><i className="fa-solid fa-floppy-disk me-2"></i> LƯU CẤU HÌNH</Button></div>
            </div>
          </Tab>

          {/* TAB 3: DANH MỤC (ĐÃ KHÔI PHỤC VỀ VỊ TRÍ CŨ) */}
          <Tab eventKey="menu" title="📂 DANH MỤC">
            <div className="bg-white p-3 rounded shadow-sm">
                <Button variant="success" className="mb-3 fw-bold" onClick={()=>{setEditData({...editData, dm:null}); setFormDM({ten:'', icon:'', parent:'', order:''}); setModal({...modal, dm:true})}}>+ DANH MỤC MỚI</Button>
                <div className="table-responsive">
                    <Table hover bordered className="align-middle">
                        <thead className="bg-light"><tr><th>STT</th><th>Tên danh mục</th><th>Icon</th><th>Cấp độ</th><th>Thao tác</th></tr></thead>
                        <tbody>
                            {dsDanhMuc.map(d=>(
                                <tr key={d.id} className={d.parent ? 'bg-light' : 'fw-bold'}>
                                    <td style={{width: '80px'}}>{d.order}</td>
                                    <td>
                                        {d.parent ? <span className="text-secondary ms-4"><i className="fa-solid fa-turn-up fa-rotate-90 me-2"></i>{d.ten}</span> : <span className="text-success">{d.ten}</span>}
                                    </td>
                                    <td className="fs-5">{d.icon}</td>
                                    <td>{d.parent ? <Badge bg="secondary">Danh mục con</Badge> : <Badge bg="primary">Danh mục gốc</Badge>}</td>
                                    <td style={{width: '120px'}}>
                                        <Button size="sm" variant="warning" className="me-1" onClick={()=>{setEditData({...editData, dm:d}); setFormDM(d); setModal({...modal, dm:true})}}>✏️</Button>
                                        <Button size="sm" variant="danger" onClick={async()=>{if(confirm('Xóa?')) await deleteDoc(doc(db,"danhMuc",d.id))}}>🗑️</Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
            </div>
          </Tab>

        </Tabs>
      </Container>

      {/* --- CÁC MODAL (GIỮ NGUYÊN 100%) --- */}
      <Modal show={modal.order} onHide={()=>setModal({...modal,order:false})} size="lg" centered>
        <Modal.Header closeButton className="bg-success text-white"><Modal.Title>Chi tiết đơn hàng #{selectedOrder?.maDonHang}</Modal.Title></Modal.Header>
        <Modal.Body>{selectedOrder && (<div className="p-2" id="invoice-print"><Row className="mb-3"><Col md={6}><p><strong>Khách hàng:</strong> {selectedOrder.khachHang?.ten}</p><p><strong>SĐT:</strong> {selectedOrder.khachHang?.sdt}</p></Col><Col md={6}><p><strong>Ngày đặt:</strong> {selectedOrder.ngayDat?.toDate?.().toLocaleString()}</p><p><strong>Thanh toán:</strong> <Badge bg="info">{selectedOrder.hinhThucThanhToan}</Badge></p></Col><Col md={12}><p><strong>Địa chỉ:</strong> {selectedOrder.khachHang?.diachi}, {selectedOrder.khachHang?.quanHuyen}</p><p className="fst-italic text-muted">Ghi chú: {selectedOrder.khachHang?.ghiChu || 'Không có'}</p></Col></Row><Table bordered><thead><tr><th>Sản phẩm</th><th>SL</th><th>Đơn giá</th><th>Thành tiền</th></tr></thead><tbody>{selectedOrder.gioHang?.map((i,x)=><tr key={x}><td>{i.ten}</td><td>{i.soLuong}</td><td>{i.giaBan?.toLocaleString()}</td><td>{(i.giaBan*i.soLuong).toLocaleString()}</td></tr>)}</tbody></Table><div className="text-end"><h5>Tổng tiền: <span className="text-danger fw-bold">{selectedOrder.tongTien?.toLocaleString()} ¥</span></h5></div></div>)}</Modal.Body>
        <Modal.Footer><Button variant="secondary" onClick={()=>setModal({...modal,order:false})}>Đóng</Button><Button variant="primary" onClick={()=>window.print()}><i className="fa-solid fa-print"></i> In hóa đơn</Button></Modal.Footer>
      </Modal>

      <Modal show={modal.sp} onHide={()=>setModal({...modal,sp:false})} size="xl" centered>
        <Modal.Header closeButton className="bg-success text-white"><Modal.Title>{editData.sp?'Cập nhật sản phẩm':'Thêm sản phẩm mới'}</Modal.Title></Modal.Header>
        <Modal.Body className="bg-light"><Form><Row><Col md={8}><Card className="shadow-sm border-0 mb-3"><Card.Body><h6 className="fw-bold text-success border-bottom pb-2 mb-3">📦 THÔNG TIN CHUNG</h6><Row><Col md={12}><Form.Group className="mb-3"><Form.Label className="fw-bold">Tên sản phẩm</Form.Label><Form.Control size="lg" value={formDataSP.ten} onChange={e=>setFormDataSP({...formDataSP,ten:e.target.value})} placeholder="Nhập tên sản phẩm..."/></Form.Group></Col><Col md={6}><Form.Group className="mb-3"><Form.Label className="fw-bold">Danh mục</Form.Label><Form.Select value={formDataSP.phanLoai} onChange={e=>setFormDataSP({...formDataSP,phanLoai:e.target.value})}><option value="">-- Chọn danh mục --</option>{dsDanhMuc.map(d=><option key={d.id} value={d.id}>{d.parent?'-- ':''}{d.ten}</option>)}</Form.Select></Form.Group></Col><Col md={6}><Form.Group className="mb-3"><Form.Label className="fw-bold">Đơn vị tính</Form.Label><Form.Control value={formDataSP.donVi} onChange={e=>setFormDataSP({...formDataSP,donVi:e.target.value})} placeholder="Ví dụ: Cái, Hộp, Kg..."/></Form.Group></Col></Row></Card.Body></Card><Card className="shadow-sm border-0 mb-3"><Card.Body><h6 className="fw-bold text-primary border-bottom pb-2 mb-3">💰 GIÁ CẢ & KHO HÀNG</h6><Row><Col md={4}><Form.Group className="mb-3"><Form.Label className="fw-bold">Giá Gốc (¥)</Form.Label><Form.Control type="number" value={formDataSP.giaGoc} onChange={e => setFormDataSP({ ...formDataSP, giaGoc: parseInt(e.target.value) || 0 })} /></Form.Group></Col><Col md={4}><Form.Group className="mb-3"><Form.Label className="fw-bold">% Giảm</Form.Label><Form.Control type="number" value={formDataSP.phanTramGiam} onChange={e => setFormDataSP({ ...formDataSP, phanTramGiam: parseInt(e.target.value) || 0 })} /></Form.Group></Col><Col md={4}><Form.Group className="mb-3"><Form.Label className="fw-bold text-danger">Giá Bán (Sau giảm)</Form.Label><Form.Control className="bg-light fw-bold text-danger" readOnly value={formDataSP.giaBan?.toLocaleString()} /></Form.Group></Col><Col md={12}><Form.Group><Form.Label className="fw-bold">Số lượng trong kho</Form.Label><Form.Control type="number" value={formDataSP.soLuong} onChange={e => setFormDataSP({ ...formDataSP, soLuong: parseInt(e.target.value) || 0 })}/></Form.Group></Col></Row></Card.Body></Card><Card className="shadow-sm border-0"><Card.Body><Form.Group><Form.Label className="fw-bold">Mô tả sản phẩm</Form.Label><ReactQuill theme="snow" value={formDataSP.moTa} onChange={v=>setFormDataSP({...formDataSP,moTa:v})} style={{height:'200px', marginBottom:'50px'}}/></Form.Group></Card.Body></Card></Col><Col md={4}><Card className="shadow-sm border-0 mb-3"><Card.Body className="text-center"><h6 className="fw-bold text-secondary border-bottom pb-2 mb-3">📷 ẢNH ĐẠI DIỆN</h6><div className="border rounded p-2 mb-3 bg-white" style={{minHeight:'200px', display:'flex', alignItems:'center', justifyContent:'center'}}><img src={formDataSP.anh||NO_IMAGE} className="img-fluid" style={{maxHeight:'250px'}}/></div><Form.Control type="file" onChange={e=>handleUpload(e,'PRODUCT')} /></Card.Body></Card><Card className="shadow-sm border-0"><Card.Body><h6 className="fw-bold text-warning border-bottom pb-2 mb-3">⚙️ TÙY CHỌN KHÁC</h6><Form.Check type="switch" id="isMoi" label="Sản phẩm Mới (New)" className="mb-2 fw-bold text-success" checked={formDataSP.isMoi} onChange={e=>setFormDataSP({...formDataSP, isMoi:e.target.checked})}/><Form.Check type="switch" id="isBanChay" label="Sản phẩm Bán Chạy" className="mb-2 fw-bold text-primary" checked={formDataSP.isBanChay} onChange={e=>setFormDataSP({...formDataSP, isBanChay:e.target.checked})}/><Form.Check type="switch" id="isFlashSale" label="⚡ Bật Flash Sale" className="mb-2 fw-bold text-warning" checked={formDataSP.isFlashSale} onChange={e=>setFormDataSP({...formDataSP, isFlashSale:e.target.checked})}/></Card.Body></Card></Col></Row></Form></Modal.Body><Modal.Footer><Button variant="secondary" onClick={()=>setModal({...modal,sp:false})}>Hủy bỏ</Button><Button variant="success" onClick={onSaveSP}>Lưu</Button></Modal.Footer></Modal>
      
      <Modal show={modal.dm} onHide={()=>setModal({...modal,dm:false})} centered>
        <Modal.Header closeButton className="bg-primary text-white"><Modal.Title className="fw-bold">QUẢN LÝ DANH MỤC</Modal.Title></Modal.Header>
        <Modal.Body className="p-4 bg-light"><Form><Form.Group className="mb-3"><Form.Label className="fw-bold">Tên Danh Mục</Form.Label><InputGroup><InputGroup.Text className="bg-white"><i className="fa-solid fa-tag text-primary"></i></InputGroup.Text><Form.Control size="lg" placeholder="Nhập tên..." value={formDM.ten} onChange={e=>setFormDM({...formDM,ten:e.target.value})}/></InputGroup></Form.Group><Row><Col md={6}><Form.Group className="mb-3"><Form.Label className="fw-bold">Thứ tự hiển thị</Form.Label><Form.Control type="number" value={formDM.order} onChange={e=>setFormDM({...formDM,order:e.target.value})}/></Form.Group></Col><Col md={6}><Form.Group className="mb-3"><Form.Label className="fw-bold">Icon (Emoji)</Form.Label><Form.Select value={formDM.icon} onChange={e=>setFormDM({...formDM,icon:e.target.value})}><option>-- Chọn --</option>{ICON_LIST.map(i=><option key={i} value={i}>{i}</option>)}</Form.Select></Form.Group></Col></Row><Form.Group><Form.Label className="fw-bold">Danh mục cha</Form.Label><Form.Select size="lg" value={formDM.parent} onChange={e=>setFormDM({...formDM,parent:e.target.value})}><option value="">-- Là danh mục gốc --</option>{dsDanhMuc.filter(d=>!d.parent).map(d=><option key={d.id} value={d.customId||d.id}>{d.ten}</option>)}</Form.Select></Form.Group></Form></Modal.Body>
        <Modal.Footer><Button variant="secondary" onClick={()=>setModal({...modal,dm:false})}>Hủy</Button><Button variant="primary" className="px-4 fw-bold" onClick={onSaveDM}>Lưu Danh Mục</Button></Modal.Footer></Modal>

      <Modal show={modal.user} onHide={()=>setModal({...modal,user:false})} centered><Modal.Header closeButton><Modal.Title>Sửa điểm thành viên</Modal.Title></Modal.Header><Modal.Body><Form.Group><Form.Label>Điểm tích lũy</Form.Label><Form.Control type="number" value={userPoint} onChange={e=>setUserPoint(e.target.value)}/></Form.Group></Modal.Body><Modal.Footer><Button variant="secondary" onClick={()=>setModal({...modal,user:false})}>Hủy</Button><Button onClick={async()=>{await updateDoc(doc(db,"users",editData.user.id),{diemTichLuy:parseInt(userPoint)}); setModal({...modal,user:false})}}>Lưu</Button></Modal.Footer></Modal>
      <Modal show={modal.post} onHide={()=>setModal({...modal,post:false})} size="xl" centered><Modal.Header closeButton className="bg-primary text-white"><Modal.Title className="fw-bold"><i className="fa-solid fa-pen-to-square me-2"></i> SOẠN THẢO: {postEditor.title}</Modal.Title></Modal.Header><Modal.Body><p className="text-muted fst-italic mb-3">Nội dung bạn soạn thảo dưới đây sẽ hiển thị tại trang <strong>{postEditor.type==='policy'?'Chính sách đổi trả':'Hướng dẫn mua hàng'}</strong>.</p><ReactQuill theme="snow" value={postEditor.content} onChange={(val) => setPostEditor(prev => ({ ...prev, content: val }))} style={{height: '400px', marginBottom: '50px'}}/></Modal.Body><Modal.Footer><Button variant="secondary" onClick={()=>setModal({...modal,post:false})}>Hủy</Button><Button variant="primary" className="fw-bold px-4" onClick={savePostContent}>XÁC NHẬN (Lưu tạm)</Button></Modal.Footer></Modal>
      <Modal show={modal.news} onHide={()=>setModal({...modal,news:false})} size="xl" centered><Modal.Header closeButton className="bg-success text-white"><Modal.Title>{editData.news?'Cập nhật bài viết':'Viết bài mới'}</Modal.Title></Modal.Header><Modal.Body className="bg-light"><Form><Row><Col md={8}><Form.Group className="mb-3"><Form.Label className="fw-bold">Tiêu đề bài viết</Form.Label><Form.Control size="lg" value={formTinTuc.tieuDe} onChange={e=>setFormTinTuc({...formTinTuc, tieuDe:e.target.value})}/></Form.Group><Form.Group className="mb-3"><Form.Label className="fw-bold">Tóm tắt ngắn (Sapo)</Form.Label><Form.Control as="textarea" rows={3} value={formTinTuc.tomTat} onChange={e=>setFormTinTuc({...formTinTuc, tomTat:e.target.value})}/></Form.Group><Form.Group><Form.Label className="fw-bold">Nội dung chi tiết</Form.Label><ReactQuill theme="snow" value={formTinTuc.noiDung} onChange={val=>setFormTinTuc({...formTinTuc, noiDung:val})} style={{height:'300px', marginBottom:'50px'}}/></Form.Group></Col><Col md={4}><Card className="shadow-sm border-0 mb-3"><Card.Body className="text-center"><h6 className="fw-bold text-secondary border-bottom pb-2 mb-3">📷 ẢNH ĐẠI DIỆN</h6><div className="border rounded p-2 mb-3 bg-white" style={{minHeight:'200px', display:'flex', alignItems:'center', justifyContent:'center'}}><img src={formTinTuc.anh||NO_IMAGE} className="img-fluid" style={{maxHeight:'250px'}}/></div><Form.Control type="file" onChange={e=>handleUpload(e,'NEWS')} /></Card.Body></Card></Col></Row></Form></Modal.Body><Modal.Footer><Button variant="secondary" onClick={()=>setModal({...modal,news:false})}>Hủy</Button><Button variant="success" onClick={onSaveNews}>Đăng bài</Button></Modal.Footer></Modal>
    </div>
  );
}
export default Admin;