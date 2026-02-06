import React, { useState, useEffect } from 'react';
import { Table, Button, Form, Modal, Badge, Tab, Tabs, Row, Col, Container, InputGroup, Card, Pagination, Spinner, Alert, Nav } from 'react-bootstrap';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { doc, setDoc, collection, onSnapshot, deleteDoc, updateDoc, addDoc, serverTimestamp, getDoc } from 'firebase/firestore'; 
import { adminAuth as auth, adminDb as db } from './firebase'; 
import { signInWithEmailAndPassword, onAuthStateChanged, signOut, updatePassword } from 'firebase/auth';
import { toSlug } from './utils';
import { toast } from 'react-toastify';
import * as XLSX from 'xlsx';

const ICON_LIST = ['🏠','📦','🥩','🥦','🍎','🍞','🥫','❄️','🍬','🍫','🍪','🍦','🍺','🥤','🥛','🧃','🧺','🛋️','🍳','🧹','🧽','🧼','🧴','🪥','💄','🔖','⚡','🔥','🎉','🎁'];
const NO_IMAGE = "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg";

function Admin() { 
  // --- A. STATE QUẢN LÝ ĐĂNG NHẬP & QUYỀN ---
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [loginInput, setLoginInput] = useState({ email: '', pass: '' });
  const [showPass, setShowPass] = useState(false);
  const [adminWhitelist, setAdminWhitelist] = useState([]);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  
  // [MỚI] State hiển thị mật khẩu khi đổi pass
  const [passData, setPassData] = useState({ newPass: '', confirmPass: '' });
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  // --- B. STATE DỮ LIỆU ---
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
  const [postEditor, setPostEditor] = useState({ type: '', title: '', content: '' }); // (Có thể không dùng nữa vì đã đưa vào Settings)
  const [editData, setEditData] = useState({ sp: null, dm: null, user: null, order: null, news: null });
  
  const [formDataSP, setFormDataSP] = useState({ ten:'', giaGoc:'', phanTramGiam:0, giaBan:'', donVi:'Cái', soLuong:100, moTa:'', anh:'', phanLoai:'', isMoi:false, isKhuyenMai:false, isBanChay:false, isFlashSale:false });
  const [formDM, setFormDM] = useState({ ten:'', icon:'', parent:'', order:'' });
  const [formBanner, setFormBanner] = useState({ img:'', link:'' });
  const [formCoupon, setFormCoupon] = useState({ code:'', giamGia:0 });
  const [formShip, setFormShip] = useState({ khuVuc:'', phi:0 });
  const [formTinTuc, setFormTinTuc] = useState({ tieuDe: '', anh: '', tomTat: '', noiDung: '' });
  const [userPoint, setUserPoint] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  // --- STATE PHÂN TRANG & LỌC ---
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [sortPrice, setSortPrice] = useState('newest'); 
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(30);

  // State phân trang cho Bài viết
  const [currentNewsPage, setCurrentNewsPage] = useState(1);
  const [newsPerPage] = useState(10); 

  // --- 1. LOGIC AUTH ---
  useEffect(() => {
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
      toast.success("Đăng nhập thành công!");
    } catch (error) { toast.error("Thông tin không đúng!"); }
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

  // --- 3. HÀM XỬ LÝ ---
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
  
  // [MỚI] Hàm thêm Banner
  const handleAddBanner = async () => {
    if(!formBanner.img) return toast.warning("Chưa có ảnh banner!");
    await addDoc(collection(db, "banners"), formBanner);
    setFormBanner({ img:'', link:'' });
    toast.success("Đã thêm banner!");
  };

  useEffect(() => { const g = parseInt(formDataSP.giaGoc)||0; const p = parseInt(formDataSP.phanTramGiam)||0; setFormDataSP(prev => ({...prev, giaBan: g > 0 ? Math.floor(g*(1-p/100)) : 0})); }, [formDataSP.giaGoc, formDataSP.phanTramGiam]);
  
  const onSaveSP = async () => { 
    if (!formDataSP.ten.trim()) return toast.warning("Vui lòng nhập tên SP!");
    const data = { ...formDataSP, slug: toSlug(formDataSP.ten) };
    if (!editData.sp || !editData.sp.ngayTao) data.ngayTao = serverTimestamp();
    try { if(editData.sp) await updateDoc(doc(db, "sanPham", editData.sp.id), data); else await addDoc(collection(db, "sanPham"), data); setModal({...modal,sp:false}); toast.success("Lưu thành công!"); } catch(err) { toast.error("Lỗi: " + err.message); }
  };

  const onSaveDM = async () => { const data = {...formDM, slug: toSlug(formDM.ten)}; if(editData.dm) await updateDoc(doc(db, "danhMuc", editData.dm.id), data); else await addDoc(collection(db, "danhMuc"), data); setModal({...modal,dm:false}); };
  const handleUpdateStatusOrder = async (id, status) => { await updateDoc(doc(db, "donHang", id), {trangThai: status}); };
  const handleDeleteOrder = async (id) => { if(confirm("Xóa đơn hàng?")) await deleteDoc(doc(db, "donHang", id)); };
  
  const onSaveNews = async () => { const data = { ...formTinTuc, slug: toSlug(formTinTuc.tieuDe), ngayDang: serverTimestamp() }; if (editData.news) await updateDoc(doc(db, "tinTuc", editData.news.id), data); else await addDoc(collection(db, "tinTuc"), data); setModal({...modal, news: false}); toast.success("Đã đăng bài!"); };

  // XUẤT EXCEL (ĐÃ NÂNG CẤP: LỌC THEO DANH MỤC)
  const handleExportExcel = () => {
    // 1. Xác định danh sách cần xuất
    let listToExport = dsSanPham;

    // 2. Nếu đang chọn danh mục ở bộ lọc, thì chỉ xuất danh mục đó
    if (filterCategory) {
      // Lấy danh sách ID của danh mục hiện tại và các danh mục con của nó
      const subCats = dsDanhMuc.filter(d => d.parent === filterCategory).map(d => d.id);
      const validCats = [filterCategory, ...subCats];
      
      // Lọc sản phẩm
      listToExport = dsSanPham.filter(sp => validCats.includes(sp.phanLoai));
    }

    // 3. Kiểm tra nếu không có dữ liệu
    if (listToExport.length === 0) {
      return toast.warning("Không có sản phẩm nào để xuất!");
    }

    // 4. Tạo dữ liệu Excel (Giữ nguyên cấu trúc cũ)
    const dataExport = listToExport.map(sp => ({
      "ID (Không sửa)": sp.id, 
      "Tên sản phẩm": sp.ten, 
      "Giá gốc": sp.giaGoc, 
      "% Giảm": sp.phanTramGiam, 
      "Kho": sp.soLuong, 
      "Đơn vị": sp.donVi, 
      "Mô tả": sp.moTa, 
      "Danh mục ID": sp.phanLoai 
    }));

    const ws = XLSX.utils.json_to_sheet(dataExport);
    ws['!cols'] = [{wch: 25}, {wch: 40}, {wch: 15}, {wch: 10}, {wch: 10}, {wch: 10}, {wch: 30}, {wch: 20}];
    const wb = XLSX.utils.book_new();
    
    // Đặt tên file theo danh mục cho dễ nhớ
    const catName = filterCategory ? dsDanhMuc.find(d => d.id === filterCategory)?.ten : "Tat_Ca";
    XLSX.utils.book_append_sheet(wb, ws, "DanhSachSP");
    XLSX.writeFile(wb, `San_Pham_${toSlug(catName)}.xlsx`);
    
    toast.success(`Đã xuất ${listToExport.length} sản phẩm thuộc mục: ${catName}`);
  };

  const handleImportExcel = (e) => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader(); reader.readAsBinaryString(file);
    reader.onload = async (evt) => {
      try {
        const wb = XLSX.read(evt.target.result, { type: 'binary' }); const ws = wb.Sheets[wb.SheetNames[0]]; const data = XLSX.utils.sheet_to_json(ws);
        if (data.length === 0) return toast.warning("File Excel rỗng!");
        if (!confirm(`Tìm thấy ${data.length} dòng dữ liệu. Xử lý?`)) return;
        let countUpdate = 0; let countAdd = 0;
        const promises = data.map(async (row) => {
          const id = row["ID (Không sửa)"];
          const productData = {
            ten: row["Tên sản phẩm"] || "Sản phẩm mới", giaGoc: parseInt(row["Giá gốc"]) || 0, phanTramGiam: parseInt(row["% Giảm"]) || 0, soLuong: parseInt(row["Kho"]) || 0, donVi: row["Đơn vị"] || "Cái", moTa: row["Mô tả"] || "", phanLoai: row["Danh mục ID"] || "",
            giaBan: (parseInt(row["Giá gốc"])||0) * (1 - (parseInt(row["% Giảm"])||0)/100), slug: toSlug(row["Tên sản phẩm"] || "san-pham-moi")
          };
          if (id) { countUpdate++; return updateDoc(doc(db, "sanPham", id), productData); } 
          else { countAdd++; return addDoc(collection(db, "sanPham"), {...productData, anh: NO_IMAGE, isMoi: true, isKhuyenMai: false, isBanChay: false, isFlashSale: false, ngayTao: serverTimestamp()}); }
        });
        await Promise.all(promises); toast.success(`Xong! Cập nhật ${countUpdate}, Thêm mới ${countAdd}.`); e.target.value = null;
      } catch (error) { toast.error("Lỗi file Excel!"); }
    };
  };

  const handleAddAdmin = async () => { if (!newAdminEmail.includes('@')) return toast.error("Email sai!"); await updateDoc(doc(db, "cauHinh", "phanquyen"), { adminEmails: [...adminWhitelist, newAdminEmail] }); setNewAdminEmail(''); toast.success("Đã thêm!"); };
  const handleRemoveAdmin = async (email) => { if (adminWhitelist.length <= 1) return toast.warning("Giữ lại 1 admin!"); if (confirm(`Xóa ${email}?`)) await updateDoc(doc(db, "cauHinh", "phanquyen"), { adminEmails: adminWhitelist.filter(e => e !== email) }); };
  const handleUpdatePassword = async (e) => { e.preventDefault(); if (passData.newPass !== passData.confirmPass) return toast.error("Không khớp!"); try { await updatePassword(auth.currentUser, passData.newPass); toast.success("Xong!"); } catch (e) { toast.error(e.message); } };

  // --- LOGIC PHÂN TRANG SP ---
  const filteredProducts = dsSanPham.filter(sp => {
        if (filterCategory) { const subCats = dsDanhMuc.filter(d => d.parent === filterCategory).map(d => d.id); if (![filterCategory, ...subCats].includes(sp.phanLoai)) return false; }
        return true;
    }).filter(sp => {
        if (!filterStatus) return true;
        if (filterStatus === 'new') return sp.isMoi; if (filterStatus === 'best') return sp.isBanChay; if (filterStatus === 'flash') return sp.isFlashSale; if (filterStatus === 'discount') return sp.phanTramGiam > 0; if (filterStatus === 'stock_out') return sp.soLuong <= 0;
        return true;
    }).sort((a, b) => {
      if (sortPrice === 'newest') return (b.ngayTao?.seconds || 0) - (a.ngayTao?.seconds || 0);
      if (sortPrice === 'asc') return (a.giaBan - b.giaBan); if (sortPrice === 'desc') return (b.giaBan - a.giaBan);
      return 0;
    });

  const indexOfLastItem = currentPage * itemsPerPage; const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // --- LOGIC PHÂN TRANG BÀI VIẾT (TIN TỨC) ---
  const indexOfLastNews = currentNewsPage * newsPerPage;
  const indexOfFirstNews = indexOfLastNews - newsPerPage;
  const sortedNews = [...dsTinTuc].sort((a, b) => (b.ngayDang?.seconds || 0) - (a.ngayDang?.seconds || 0));
  const currentNews = sortedNews.slice(indexOfFirstNews, indexOfLastNews);
  const totalNewsPages = Math.ceil(dsTinTuc.length / newsPerPage);
  const paginateNews = (num) => setCurrentNewsPage(num);

  const totalRevenue = dsDonHang.reduce((acc, order) => acc + (order.tongTien || 0), 0);
  const lowStockProducts = dsSanPham.filter(sp => sp.soLuong <= 5).sort((a,b)=>a.soLuong-b.soLuong);
  
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
                <Col md={7}> {/* Tăng độ rộng lên md={7} hoặc md={8} để bảng thoáng hơn */}
                  <div className="bg-white p-3 rounded shadow-sm border h-100">
                    <div className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-3">
                      <h6 className="fw-bold text-danger m-0">
                        <i className="fa-solid fa-triangle-exclamation me-2"></i>CẢNH BÁO KHO ({lowStockProducts.length})
                      </h6>
                      <Button variant="outline-danger" size="sm" onClick={() => setFilterStatus('stock_out')}>
                        Xem tất cả
                      </Button>
                    </div>
                    
                    <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
                      <Table hover responsive className="align-middle mb-0">
                        <thead className="bg-light text-secondary small">
                          <tr>
                            <th>Sản phẩm</th>
                            <th>Danh mục</th>
                            <th className="text-center">Tồn kho</th>
                            <th>Trạng thái</th>
                          </tr>
                        </thead>
                        <tbody>
                          {lowStockProducts.length > 0 ? (
                            lowStockProducts.map(sp => {
                              // Logic tìm tên danh mục từ ID
                              const catName = dsDanhMuc.find(d => d.id === sp.phanLoai)?.ten || 'Khác';
                              
                              return (
                                <tr key={sp.id}>
                                  <td>
                                    <div className="d-flex align-items-center">
                                      <img 
                                        src={sp.anh || NO_IMAGE} 
                                        alt="" 
                                        width="40" height="40" 
                                        className="rounded border me-2" 
                                        style={{ objectFit: 'cover' }}
                                      />
                                      <div>
                                        <div className="fw-bold small text-dark">{sp.ten}</div>
                                        <small className="text-muted">{sp.donVi}</small>
                                      </div>
                                    </div>
                                  </td>
                                  <td>
                                    <Badge bg="light" text="dark" className="border fw-normal">
                                      {catName}
                                    </Badge>
                                  </td>
                                  <td className="text-center">
                                    <span className={`fw-bold ${sp.soLuong === 0 ? 'text-danger fs-5' : 'text-warning'}`}>
                                      {sp.soLuong}
                                    </span>
                                  </td>
                                  <td>
                                    {sp.soLuong === 0 ? (
                                      <Badge bg="danger">Hết hàng</Badge>
                                    ) : (
                                      <Badge bg="warning" text="dark">Sắp hết</Badge>
                                    )}
                                  </td>
                                </tr>
                              );
                            })
                          ) : (
                            <tr>
                              <td colSpan="4" className="text-center py-4 text-muted">
                                <i className="fa-regular fa-circle-check fs-1 text-success mb-2"></i>
                                <p className="m-0">Kho hàng đang ổn định!</p>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </Table>
                    </div>
                  </div>
                </Col>
                <Col md={6}><div className="bg-white p-3 rounded shadow-sm border h-100"><h6 className="fw-bold text-primary border-bottom pb-2">📦 ĐƠN MỚI NHẤT</h6><div style={{maxHeight:'300px', overflowY:'auto'}}>{dsDonHang.sort((a,b)=>b.ngayDat-a.ngayDat).slice(0,5).map(dh => (<div key={dh.id} className="d-flex justify-content-between border-bottom py-2"><div><strong>{dh.maDonHang}</strong> - {dh.khachHang?.ten}</div><div className="text-success fw-bold">{dh.tongTien?.toLocaleString()} ¥</div></div>))}</div></div></Col>
              </Row>
            </div>
          </Tab>
        
          <Tab eventKey="products_cats" title="📦 SẢN PHẨM & DANH MỤC">
            <div className="p-3">
              <Tabs defaultActiveKey="tab_sanpham" id="sub-tabs-admin" className="mb-3 custom-sub-tabs" fill variant="pills">
                <Tab eventKey="tab_sanpham" title={<span className="fw-bold"><i className="fa-solid fa-box me-2"></i> QUẢN LÝ SẢN PHẨM</span>}>
                  <div className="bg-white p-3 rounded shadow-sm mb-4 border">
                    <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                      <div className="d-flex gap-2">
                        <Button variant="success" className="fw-bold shadow-sm" onClick={() => { setEditData({ ...editData, sp: null }); setFormDataSP({ ten: '', giaGoc: '', phanTramGiam: 0, giaBan: '', donVi: 'Cái', soLuong: 100, moTa: '', anh: '', phanLoai: '', isMoi: false, isKhuyenMai: false, isBanChay: false, isFlashSale: false }); setModal({ ...modal, sp: true }) }}>
                          <i className="fa-solid fa-plus me-1"></i> THÊM SP
                        </Button>
                        <Button variant="outline-success" onClick={handleExportExcel} title="Xuất Excel"><i className="fa-solid fa-file-excel me-1"></i> Xuất Excel</Button>
                        <div className="position-relative">
                          <Button variant="outline-primary" title="Nhập Excel"><i className="fa-solid fa-file-import me-1"></i> Nhập Excel</Button>
                          <input type="file" accept=".xlsx, .xls" onChange={handleImportExcel} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }} />
                        </div>
                      </div>
                      <div className="d-flex gap-2">
                        <Form.Select size="sm" style={{ width: 180 }} value={filterCategory} onChange={e => setFilterCategory(e.target.value)}><option value="">-- Tất cả danh mục --</option>{dsDanhMuc.map(d => <option key={d.id} value={d.id}>{d.ten}</option>)}</Form.Select>
                        <Form.Select size="sm" style={{width:160}} value={filterStatus} onChange={e=>setFilterStatus(e.target.value)}><option value="">-- Trạng thái --</option><option value="new">Mới</option><option value="best">Bán chạy</option><option value="flash">Sale</option><option value="stock_out">Hết hàng</option></Form.Select>
                        <Form.Select size="sm" style={{width:150}} value={sortPrice} onChange={e=>setSortPrice(e.target.value)}><option value="newest">Mới nhất</option><option value="asc">Giá tăng</option><option value="desc">Giá giảm</option></Form.Select>
                      </div>
                    </div>
                    <div className="table-responsive mb-3">
                      <Table hover bordered className="align-middle">
                          <thead className="bg-light"><tr><th>Ảnh</th><th>Tên</th><th>Đơn vị</th><th>Kho</th><th>Giá bán</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
                          <tbody>{currentProducts.map(sp=>(<tr key={sp.id}><td><img src={sp.anh||NO_IMAGE} width="50" height="50" style={{objectFit:'cover', borderRadius:4}}/></td><td className="fw-bold">{sp.ten}</td><td>{sp.donVi}</td><td className={sp.soLuong<10?'text-danger fw-bold':''}>{sp.soLuong}</td><td className="text-danger fw-bold">{sp.giaBan?.toLocaleString()}¥</td><td>{sp.isFlashSale && <Badge bg="warning" text="dark" className="me-1">Sale</Badge>}{sp.isMoi && <Badge bg="success">New</Badge>}</td><td><Button size="sm" variant="warning" className="me-1" onClick={()=>{setEditData({...editData, sp}); setFormDataSP(sp); setModal({...modal, sp:true})}}>✏️</Button><Button size="sm" variant="danger" onClick={async()=>{if(confirm('Xóa?')) await deleteDoc(doc(db,"sanPham",sp.id))}}>🗑️</Button></td></tr>))}</tbody>
                        </Table>
                    </div>
                    <Pagination className="justify-content-center m-0"><Pagination.Prev onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1} />{[...Array(totalPages)].map((_, i) => (<Pagination.Item key={i+1} active={i+1 === currentPage} onClick={() => paginate(i+1)}>{i+1}</Pagination.Item>))}<Pagination.Next onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages} /></Pagination>
                  </div>
                </Tab>
                <Tab eventKey="tab_danhmuc" title={<span className="fw-bold"><i className="fa-solid fa-folder me-2"></i> QUẢN LÝ DANH MỤC</span>}>
                  <div className="bg-white p-3 rounded shadow-sm border">
                      <Button variant="primary" className="mb-3 fw-bold shadow-sm" onClick={()=>{setEditData({...editData, dm:null}); setFormDM({ten:'', icon:'', parent:'', order:''}); setModal({...modal, dm:true})}}>+ DANH MỤC MỚI</Button>
                      <div className="table-responsive">
                          <Table hover bordered className="align-middle">
                              <thead className="bg-light"><tr><th>STT</th><th>Tên danh mục</th><th>Icon</th><th>Cấp độ</th><th>Thao tác</th></tr></thead>
                              <tbody>{dsDanhMuc.map(d=>(<tr key={d.id} className={d.parent ? 'bg-light' : 'fw-bold'}><td style={{width: '80px'}}>{d.order}</td><td>{d.parent ? <span className="text-secondary ms-4"><i className="fa-solid fa-turn-up fa-rotate-90 me-2"></i>{d.ten}</span> : <span className="text-success">{d.ten}</span>}</td><td className="fs-5">{d.icon}</td><td>{d.parent ? <Badge bg="secondary">Con</Badge> : <Badge bg="primary">Gốc</Badge>}</td><td style={{width: '120px'}}><Button size="sm" variant="warning" className="me-1" onClick={()=>{setEditData({...editData, dm:d}); setFormDM(d); setModal({...modal, dm:true})}}>✏️</Button><Button size="sm" variant="danger" onClick={async()=>{if(confirm('Xóa?')) await deleteDoc(doc(db,"danhMuc",d.id))}}>🗑️</Button></td></tr>))}</tbody>
                          </Table>
                      </div>
                  </div>
                </Tab>
              </Tabs>
            </div>
          </Tab>

          <Tab eventKey="orders" title="📋 ĐƠN HÀNG">
            <div className="table-responsive bg-white rounded shadow-sm p-3">
              <Table hover bordered className="align-middle">
                <thead className="bg-light text-uppercase small"><tr><th>Mã</th><th>Ngày</th><th>Khách</th><th>Tổng</th><th>Trạng thái</th><th>Xử lý</th></tr></thead>
                <tbody>{dsDonHang.sort((a,b)=>b.ngayDat-a.ngayDat).map(dh=><tr key={dh.id}><td className="fw-bold text-primary">{dh.maDonHang||`#${dh.id.slice(0,5)}`}</td><td>{dh.ngayDat?.toDate?dh.ngayDat.toDate().toLocaleDateString('vi-VN'):''}</td><td><div>{dh.khachHang?.ten}</div><small className="text-muted">{dh.khachHang?.sdt}</small></td><td className="text-danger fw-bold">{dh.tongTien?.toLocaleString()}¥</td><td><select className="form-select form-select-sm" value={dh.trangThai} onChange={(e)=>handleUpdateStatusOrder(dh.id,e.target.value)} style={{width:130, fontWeight:'bold', color: dh.trangThai==='Hoàn thành'?'green':'orange'}}><option>Mới đặt</option><option>Đang giao</option><option>Hoàn thành</option><option>Đã hủy</option></select></td><td><Button size="sm" variant="info" className="me-1 text-white" onClick={()=>{setSelectedOrder(dh);setModal({...modal, order:true})}}>Xem</Button><Button size="sm" variant="danger" onClick={()=>handleDeleteOrder(dh.id)}>Xóa</Button></td></tr>)}</tbody>
              </Table>
            </div>
          </Tab>

          <Tab eventKey="marketing" title="📣 MARKETING & BÀI VIẾT">
            <div className="p-3">
              <Tabs defaultActiveKey="articles" id="marketing-tabs" className="mb-3 custom-sub-tabs" fill variant="pills">
                <Tab eventKey="articles" title={<span className="fw-bold"><i className="fa-solid fa-newspaper me-2"></i> QUẢN LÝ BÀI VIẾT</span>}>
                  <div className="bg-white p-3 rounded shadow-sm border">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <Button variant="info" className="fw-bold text-white shadow-sm" onClick={()=>{setEditData({...editData, news:null}); setFormTinTuc({ tieuDe: '', anh: '', tomTat: '', noiDung: '' }); setModal({...modal, news:true})}}>+ VIẾT BÀI MỚI</Button>
                      <span className="text-muted small">Tổng: {dsTinTuc.length} bài viết</span>
                    </div>

                    <Table hover bordered className="align-middle">
                      <thead className="bg-light"><tr><th>Ảnh</th><th>Tiêu đề</th><th>Tóm tắt</th><th>Ngày đăng</th><th>Thao tác</th></tr></thead>
                      <tbody>
                        {currentNews.length > 0 ? currentNews.map(tin => (
                          <tr key={tin.id}>
                            <td style={{width:'80px'}}><img src={tin.anh || NO_IMAGE} width="80" height="50" style={{objectFit:'cover', borderRadius:'4px'}}/></td>
                            <td className="fw-bold" style={{maxWidth:'250px'}}>{tin.tieuDe}</td>
                            <td style={{maxWidth:'300px'}} className="text-muted small text-truncate">{tin.tomTat}</td>
                            <td style={{width:'100px'}}>{tin.ngayDang ? new Date(tin.ngayDang.seconds * 1000).toLocaleDateString('vi-VN') : ''}</td>
                            <td style={{width:'100px'}}><Button size="sm" variant="warning" className="me-1" onClick={()=>{setEditData({...editData, news:tin}); setFormTinTuc(tin); setModal({...modal, news:true})}}>✏️</Button><Button size="sm" variant="danger" onClick={()=>del('tinTuc', tin.id)}>🗑️</Button></td>
                          </tr>
                        )) : <tr><td colSpan="5" className="text-center py-4 text-muted">Chưa có bài viết nào</td></tr>}
                      </tbody>
                    </Table>
                    {dsTinTuc.length > newsPerPage && (
                      <Pagination className="justify-content-center mt-3">
                        <Pagination.Prev onClick={() => paginateNews(currentNewsPage - 1)} disabled={currentNewsPage === 1} />
                        {[...Array(totalNewsPages)].map((_, i) => (
                          <Pagination.Item key={i+1} active={i+1 === currentNewsPage} onClick={() => paginateNews(i+1)}>{i+1}</Pagination.Item>
                        ))}
                        <Pagination.Next onClick={() => paginateNews(currentNewsPage + 1)} disabled={currentNewsPage === totalNewsPages} />
                      </Pagination>
                    )}
                  </div>
                </Tab>
                <Tab eventKey="promotions" title={<span className="fw-bold"><i className="fa-solid fa-tags me-2"></i> KHUYẾN MÃI & SHIP</span>}>
                  <Row>
                    <Col md={6} className="mb-4 mb-md-0">
                      <div className="bg-white p-3 shadow-sm rounded h-100 border">
                        <h6 className="fw-bold text-success border-bottom pb-2 mb-3"><i className="fa-solid fa-ticket me-2"></i> MÃ GIẢM GIÁ (COUPON)</h6>
                        <div className="d-flex gap-2 mb-3">
                          <Form.Control placeholder="Nhập mã (VD: TET2025)" value={formCoupon.code} onChange={e=>setFormCoupon({...formCoupon,code:e.target.value.toUpperCase()})}/>
                          <Form.Control type="number" placeholder="Giảm (¥)" style={{width:'100px'}} value={formCoupon.giamGia} onChange={e=>setFormCoupon({...formCoupon,giamGia:e.target.value})}/>
                          <Button variant="success" size="sm" onClick={()=>{if(!formCoupon.code) return toast.warning("Nhập mã!"); add('coupons',formCoupon); setFormCoupon({code:'',giamGia:0})}}>Thêm</Button>
                        </div>
                        <Table size="sm" hover>
                          <thead className="bg-light"><tr><th>Mã Code</th><th>Giảm giá</th><th>Xóa</th></tr></thead>
                          <tbody>{dsCoupon.map(c=><tr key={c.id}><td className="fw-bold text-primary">{c.code}</td><td className="fw-bold text-danger">{parseInt(c.giamGia).toLocaleString()}¥</td><td><Button size="sm" variant="outline-danger" style={{border:'none'}} onClick={()=>del('coupons',c.id)}><i className="fa-solid fa-trash"></i></Button></td></tr>)}</tbody>
                        </Table>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="bg-white p-3 shadow-sm rounded h-100 border">
                        <h6 className="fw-bold text-primary border-bottom pb-2 mb-3"><i className="fa-solid fa-truck-fast me-2"></i> PHÍ VẬN CHUYỂN</h6>
                        <div className="d-flex gap-2 mb-3">
                          <Form.Control placeholder="Khu vực (VD: Tokyo)" value={formShip.khuVuc} onChange={e=>setFormShip({...formShip,khuVuc:e.target.value})}/>
                          <Form.Control type="number" placeholder="Phí (¥)" style={{width:'100px'}} value={formShip.phi} onChange={e=>setFormShip({...formShip,phi:e.target.value})}/>
                          <Button variant="primary" size="sm" onClick={()=>{if(!formShip.khuVuc) return toast.warning("Nhập khu vực!"); add('shipping',formShip); setFormShip({khuVuc:'',phi:0})}}>Thêm</Button>
                        </div>
                        <Table size="sm" hover>
                          <thead className="bg-light"><tr><th>Khu vực</th><th>Phí Ship</th><th>Xóa</th></tr></thead>
                          <tbody>{dsShip.map(s=><tr key={s.id}><td className="fw-bold">{s.khuVuc}</td><td>{parseInt(s.phi).toLocaleString()}¥</td><td><Button size="sm" variant="outline-danger" style={{border:'none'}} onClick={()=>del('shipping',s.id)}><i className="fa-solid fa-trash"></i></Button></td></tr>)}</tbody>
                        </Table>
                      </div>
                    </Col>
                  </Row>
                </Tab>
              </Tabs>
            </div>
          </Tab>

          {/* TAB SYSTEM: CẤU HÌNH SHOP - TÁCH BIỆT THANH TOÁN */}
          <Tab eventKey="system" title="⚙️ HỆ THỐNG & CẤU HÌNH">
            <div className="p-3">
              <Tab.Container defaultActiveKey="general_info">
                <Row>
                  {/* --- CỘT TRÁI: MENU CÀI ĐẶT --- */}
                  <Col md={3} className="mb-4">
                    <Card className="shadow-sm border-0">
                      <Card.Header className="bg-success text-white fw-bold">
                        <i className="fa-solid fa-gears me-2"></i> CÀI ĐẶT
                      </Card.Header>
                      <Card.Body className="p-0">
                        <Nav variant="pills" className="flex-column admin-setting-nav">
                          <Nav.Item>
                            <Nav.Link eventKey="general_info" className="rounded-0 border-bottom py-3">
                              <i className="fa-solid fa-shop me-2"></i> Thông tin cửa hàng
                            </Nav.Link>
                          </Nav.Item>
                          <Nav.Item>
                            <Nav.Link eventKey="payment_info" className="rounded-0 border-bottom py-3">
                              <i className="fa-solid fa-credit-card me-2"></i> Ngân hàng & QR
                            </Nav.Link>
                          </Nav.Item>
                          {/* [MỚI] THÊM MỤC QUẢN LÝ BANNER */}
                          <Nav.Item>
                            <Nav.Link eventKey="banner_manage" className="rounded-0 border-bottom py-3">
                              <i className="fa-regular fa-images me-2"></i> Quản lý Banner
                            </Nav.Link>
                          </Nav.Item>
                           {/* [MỚI] HƯỚNG DẪN MUA HÀNG */}
                           <Nav.Item>
                            <Nav.Link eventKey="guide_manage" className="rounded-0 border-bottom py-3">
                              <i className="fa-solid fa-book-open me-2"></i> Hướng dẫn mua hàng
                            </Nav.Link>
                          </Nav.Item>
                           {/* [MỚI] CHÍNH SÁCH ĐỔI TRẢ */}
                           <Nav.Item>
                            <Nav.Link eventKey="policy_manage" className="rounded-0 border-bottom py-3">
                              <i className="fa-solid fa-shield-halved me-2"></i> Chính sách đổi trả
                            </Nav.Link>
                          </Nav.Item>

                          <Nav.Item>
                            <Nav.Link eventKey="admin_manage" className="rounded-0 border-bottom py-3">
                              <i className="fa-solid fa-users-gear me-2"></i> Phân quyền Admin
                            </Nav.Link>
                          </Nav.Item>
                          <Nav.Item>
                            <Nav.Link eventKey="my_account" className="rounded-0 py-3">
                              <i className="fa-solid fa-user-lock me-2"></i> Tài khoản của tôi
                            </Nav.Link>
                          </Nav.Item>
                        </Nav>
                      </Card.Body>
                    </Card>
                  </Col>

                  {/* --- CỘT PHẢI: NỘI DUNG CHI TIẾT --- */}
                  <Col md={9}>
                    <Tab.Content>
                      
                      {/* 1. THÔNG TIN CỬA HÀNG */}
                      <Tab.Pane eventKey="general_info">
                        <div className="bg-white p-4 rounded shadow-sm border">
                          <h6 className="text-success fw-bold border-bottom pb-2 mb-3">THÔNG TIN CHUNG</h6>
                          <Row className="g-3">
                            <Col md={8}>
                              <Row className="g-3">
                                <Col md={6}><Form.Group><Form.Label className="fw-bold small">Tên Shop</Form.Label><Form.Control value={shopConfig.tenShop} onChange={e=>setShopConfig({...shopConfig, tenShop:e.target.value})}/></Form.Group></Col>
                                <Col md={6}><Form.Group><Form.Label className="fw-bold small">Hotline</Form.Label><Form.Control value={shopConfig.sdt} onChange={e=>setShopConfig({...shopConfig, sdt:e.target.value})}/></Form.Group></Col>
                                <Col md={12}><Form.Group><Form.Label className="fw-bold small">Slogan</Form.Label><Form.Control value={shopConfig.slogan} onChange={e=>setShopConfig({...shopConfig, slogan:e.target.value})}/></Form.Group></Col>
                                <Col md={12}><Form.Group><Form.Label className="fw-bold small">Thông báo chạy (Header)</Form.Label><Form.Control value={shopConfig.topBarText} onChange={e=>setShopConfig({...shopConfig, topBarText:e.target.value})}/></Form.Group></Col>
                                <Col md={6}><Form.Group><Form.Label className="fw-bold small">Giờ mở cửa</Form.Label><Form.Control value={shopConfig.openingHours} onChange={e=>setShopConfig({...shopConfig, openingHours:e.target.value})}/></Form.Group></Col>
                                <Col md={6}><Form.Group><Form.Label className="fw-bold small">Địa chỉ</Form.Label><Form.Control value={shopConfig.diaChi} onChange={e=>setShopConfig({...shopConfig, diaChi:e.target.value})}/></Form.Group></Col>
                              </Row>
                            </Col>
                            <Col md={4} className="text-center">
                              <Form.Label className="fw-bold small d-block">Logo Shop</Form.Label>
                              <div className="border rounded p-2 mb-2 d-flex align-items-center justify-content-center" style={{height:'150px', background:'#f8f9fa'}}>
                                <img src={shopConfig.logo || NO_IMAGE} style={{maxHeight:'100%', maxWidth:'100%'}} />
                              </div>
                              <Form.Control type="file" size="sm" onChange={e=>handleUpload(e,'LOGO')}/>
                            </Col>
                          </Row>
                          <div className="mt-4 text-end">
                             <Button variant="success" className="fw-bold px-4" onClick={luuCauHinh}>LƯU THÔNG TIN</Button>
                          </div>
                        </div>
                      </Tab.Pane>

                      {/* 2. NGÂN HÀNG & QR */}
                      <Tab.Pane eventKey="payment_info">
                        <div className="bg-white p-4 rounded shadow-sm border">
                          <h6 className="text-primary fw-bold border-bottom pb-2 mb-3">THÔNG TIN CHUYỂN KHOẢN</h6>
                          <Row className="g-3">
                            <Col md={6}>
                              <Form.Group className="mb-3"><Form.Label className="fw-bold small">Tên Ngân hàng</Form.Label><Form.Control value={shopConfig.bankInfo?.bankName} onChange={e=>setShopConfig({...shopConfig, bankInfo:{...shopConfig.bankInfo, bankName:e.target.value}})}/></Form.Group>
                              <Form.Group className="mb-3"><Form.Label className="fw-bold small">Số Tài Khoản</Form.Label><Form.Control value={shopConfig.bankInfo?.accountNum} onChange={e=>setShopConfig({...shopConfig, bankInfo:{...shopConfig.bankInfo, accountNum:e.target.value}})}/></Form.Group>
                              <Form.Group className="mb-3"><Form.Label className="fw-bold small">Chủ Tài Khoản</Form.Label><Form.Control value={shopConfig.bankInfo?.accountName} onChange={e=>setShopConfig({...shopConfig, bankInfo:{...shopConfig.bankInfo, accountName:e.target.value}})}/></Form.Group>
                            </Col>
                            <Col md={6} className="text-center">
                              <Form.Label className="fw-bold small">Ảnh mã QR</Form.Label>
                              <div className="border rounded p-2 mb-2 d-flex align-items-center justify-content-center" style={{height:'200px', background:'#f8f9fa'}}>
                                {shopConfig.bankInfo?.qrImage ? <img src={shopConfig.bankInfo.qrImage} style={{maxHeight:'100%'}} /> : <span className="text-muted small">Chưa có QR</span>}
                              </div>
                              <Form.Control type="file" size="sm" onChange={e=>handleUpload(e,'QR')}/>
                            </Col>
                          </Row>
                          <div className="mt-4 text-end">
                             <Button variant="success" className="fw-bold px-4" onClick={luuCauHinh}>LƯU NGÂN HÀNG</Button>
                          </div>
                        </div>
                      </Tab.Pane>

                      {/* [MỚI] 3. QUẢN LÝ BANNER */}
                      <Tab.Pane eventKey="banner_manage">
                        <div className="bg-white p-4 rounded shadow-sm border">
                          <h6 className="text-warning fw-bold border-bottom pb-2 mb-3">QUẢN LÝ BANNER SLIDER</h6>
                          <div className="mb-4 p-3 bg-light rounded border">
                            <h6 className="small fw-bold text-muted">Thêm Banner Mới</h6>
                            <Row className="g-3 align-items-end">
                              <Col md={4}>
                                <Form.Label className="small">Ảnh Banner</Form.Label>
                                <Form.Control type="file" size="sm" onChange={e=>handleUpload(e,'BANNER')}/>
                              </Col>
                              <Col md={5}>
                                <Form.Label className="small">Link liên kết (Tùy chọn)</Form.Label>
                                <Form.Control size="sm" placeholder="VD: /khuyen-mai" value={formBanner.link} onChange={e=>setFormBanner({...formBanner, link:e.target.value})}/>
                              </Col>
                              <Col md={3}>
                                <Button variant="warning" size="sm" className="w-100 fw-bold text-white" onClick={handleAddBanner} disabled={isUploading}>
                                  {isUploading ? 'Đang tải...' : '+ THÊM BANNER'}
                                </Button>
                              </Col>
                            </Row>
                            {formBanner.img && <div className="mt-2"><img src={formBanner.img} height="60" className="rounded border"/></div>}
                          </div>

                          <Table hover bordered className="align-middle text-center">
                             <thead className="bg-light"><tr><th>Hình ảnh</th><th>Link dẫn</th><th>Thao tác</th></tr></thead>
                             <tbody>
                               {dsBanner.map(b => (
                                 <tr key={b.id}>
                                   <td><img src={b.img} style={{height:'60px', objectFit:'cover', borderRadius:'4px'}} /></td>
                                   <td className="text-start small text-muted">{b.link || 'Không có link'}</td>
                                   <td><Button variant="outline-danger" size="sm" onClick={()=>del('banners', b.id)}><i className="fa-solid fa-trash"></i></Button></td>
                                 </tr>
                               ))}
                               {dsBanner.length === 0 && <tr><td colSpan="3" className="text-muted py-3">Chưa có banner nào</td></tr>}
                             </tbody>
                          </Table>
                        </div>
                      </Tab.Pane>
                      
                      {/* [MỚI] 4. HƯỚNG DẪN MUA HÀNG */}
                      <Tab.Pane eventKey="guide_manage">
                        <div className="bg-white p-4 rounded shadow-sm border">
                          <h6 className="text-info fw-bold border-bottom pb-2 mb-3">BIÊN TẬP: HƯỚNG DẪN MUA HÀNG</h6>
                          <ReactQuill theme="snow" value={shopConfig.guideContent} onChange={v=>setShopConfig({...shopConfig, guideContent:v})} style={{height:'350px', marginBottom:'50px'}}/>
                          <div className="text-end mt-4">
                             <Button variant="success" className="fw-bold px-4" onClick={luuCauHinh}>LƯU NỘI DUNG</Button>
                          </div>
                        </div>
                      </Tab.Pane>

                      {/* [MỚI] 5. CHÍNH SÁCH ĐỔI TRẢ */}
                      <Tab.Pane eventKey="policy_manage">
                        <div className="bg-white p-4 rounded shadow-sm border">
                          <h6 className="text-info fw-bold border-bottom pb-2 mb-3">BIÊN TẬP: CHÍNH SÁCH ĐỔI TRẢ</h6>
                          <ReactQuill theme="snow" value={shopConfig.policyContent} onChange={v=>setShopConfig({...shopConfig, policyContent:v})} style={{height:'350px', marginBottom:'50px'}}/>
                          <div className="text-end mt-4">
                             <Button variant="success" className="fw-bold px-4" onClick={luuCauHinh}>LƯU NỘI DUNG</Button>
                          </div>
                        </div>
                      </Tab.Pane>


                      {/* 6. PHÂN QUYỀN ADMIN */}
                      <Tab.Pane eventKey="admin_manage">
                        <div className="bg-white p-4 rounded shadow-sm border">
                          <div className="d-flex justify-content-between align-items-center mb-3">
                            <h6 className="text-danger fw-bold m-0">DANH SÁCH QUẢN TRỊ VIÊN</h6>
                          </div>
                          <InputGroup className="mb-4">
                            <Form.Control placeholder="Nhập email nhân viên muốn cấp quyền..." value={newAdminEmail} onChange={e=>setNewAdminEmail(e.target.value)}/>
                            <Button variant="danger" onClick={handleAddAdmin}>+ Cấp quyền</Button>
                          </InputGroup>
                          <Table hover responsive bordered className="align-middle">
                            <thead className="bg-light"><tr><th>Email Admin</th><th>Quyền hạn</th><th>Thao tác</th></tr></thead>
                            <tbody>
                              {adminWhitelist.map((email, i)=>(
                                <tr key={i}>
                                  <td className="fw-bold text-dark">{email}</td>
                                  <td><Badge bg="success">Toàn quyền</Badge></td>
                                  <td className="text-center">
                                     {email !== auth.currentUser?.email && (
                                       <Button size="sm" variant="outline-danger" onClick={()=>handleRemoveAdmin(email)} title="Xóa quyền"><i className="fa-solid fa-trash"></i></Button>
                                     )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </Table>
                          <Alert variant="info" className="small mt-3">
                            <i className="fa-solid fa-circle-info me-2"></i> 
                            Người có trong danh sách này có thể đăng nhập vào trang Admin. Hiện tại đang cấp quyền "Toàn quyền" (Full Access).
                          </Alert>
                        </div>
                      </Tab.Pane>

                      {/* 7. TÀI KHOẢN CỦA TÔI ([ĐÃ SỬA]: THÊM CON MẮT ĐỔI PASS) */}
                      <Tab.Pane eventKey="my_account">
                        <div className="bg-white p-4 rounded shadow-sm border" style={{maxWidth:'600px'}}>
                          <h6 className="text-dark fw-bold border-bottom pb-2 mb-4">ĐỔI MẬT KHẨU CÁ NHÂN</h6>
                          <Form onSubmit={handleUpdatePassword}>
                            <Form.Group className="mb-3">
                              <Form.Label className="fw-bold small">Email đăng nhập</Form.Label>
                              <Form.Control type="email" value={auth.currentUser?.email || ''} disabled className="bg-light" />
                            </Form.Group>
                            <Form.Group className="mb-3">
                              <Form.Label className="fw-bold small">Mật khẩu mới <span className="text-danger">*</span></Form.Label>
                              <InputGroup>
                                <Form.Control type={showNewPass ? "text" : "password"} value={passData.newPass} onChange={e=>setPassData({...passData, newPass:e.target.value})} placeholder="Nhập mật khẩu mới..." required />
                                <Button variant="outline-secondary" onClick={()=>setShowNewPass(!showNewPass)}>
                                    <i className={showNewPass ? "fa-solid fa-eye-slash" : "fa-solid fa-eye"}></i>
                                </Button>
                              </InputGroup>
                            </Form.Group>
                            <Form.Group className="mb-4">
                              <Form.Label className="fw-bold small">Xác nhận mật khẩu <span className="text-danger">*</span></Form.Label>
                              <InputGroup>
                                <Form.Control type={showConfirmPass ? "text" : "password"} value={passData.confirmPass} onChange={e=>setPassData({...passData, confirmPass:e.target.value})} placeholder="Nhập lại mật khẩu..." required />
                                <Button variant="outline-secondary" onClick={()=>setShowConfirmPass(!showConfirmPass)}>
                                    <i className={showConfirmPass ? "fa-solid fa-eye-slash" : "fa-solid fa-eye"}></i>
                                </Button>
                              </InputGroup>
                            </Form.Group>
                            <Button type="submit" variant="warning" className="w-100 fw-bold text-white shadow-sm">
                              <i className="fa-solid fa-key me-2"></i> CẬP NHẬT MẬT KHẨU
                            </Button>
                          </Form>
                        </div>
                      </Tab.Pane>

                    </Tab.Content>
                  </Col>
                </Row>
              </Tab.Container>
            </div>
          </Tab>

        </Tabs>
      </Container>

      {/* --- CÁC MODAL (GIỮ NGUYÊN) --- */}
      <Modal show={modal.order} onHide={()=>setModal({...modal,order:false})} size="lg" centered><Modal.Header closeButton className="bg-success text-white"><Modal.Title>Chi tiết đơn hàng #{selectedOrder?.maDonHang}</Modal.Title></Modal.Header><Modal.Body>{selectedOrder && (<div className="p-2" id="invoice-print"><Row className="mb-3"><Col md={6}><p><strong>Khách:</strong> {selectedOrder.khachHang?.ten}</p><p><strong>SĐT:</strong> {selectedOrder.khachHang?.sdt}</p></Col><Col md={6}><p><strong>Ngày:</strong> {selectedOrder.ngayDat?.toDate?.().toLocaleString()}</p><p><strong>TT:</strong> <Badge bg="info">{selectedOrder.hinhThucThanhToan}</Badge></p></Col></Row><Table bordered><thead><tr><th>SP</th><th>SL</th><th>Giá</th><th>Thành tiền</th></tr></thead><tbody>{selectedOrder.gioHang?.map((i,x)=><tr key={x}><td>{i.ten}</td><td>{i.soLuong}</td><td>{i.giaBan?.toLocaleString()}</td><td>{(i.giaBan*i.soLuong).toLocaleString()}</td></tr>)}</tbody></Table><div className="text-end"><h5>Tổng: <span className="text-danger fw-bold">{selectedOrder.tongTien?.toLocaleString()} ¥</span></h5></div></div>)}</Modal.Body><Modal.Footer><Button variant="secondary" onClick={()=>setModal({...modal,order:false})}>Đóng</Button><Button variant="primary" onClick={()=>window.print()}>In</Button></Modal.Footer></Modal>

      <Modal show={modal.sp} onHide={()=>setModal({...modal,sp:false})} size="xl" centered><Modal.Header closeButton className="bg-success text-white"><Modal.Title>{editData.sp?'Sửa SP':'Thêm SP'}</Modal.Title></Modal.Header><Modal.Body className="bg-light"><Form><Row><Col md={8}><Card className="shadow-sm border-0 mb-3"><Card.Body><h6 className="fw-bold text-success border-bottom pb-2 mb-3">THÔNG TIN</h6><Row><Col md={12}><Form.Group className="mb-3"><Form.Label className="fw-bold">Tên SP</Form.Label><Form.Control size="lg" value={formDataSP.ten} onChange={e=>setFormDataSP({...formDataSP,ten:e.target.value})}/></Form.Group></Col><Col md={6}><Form.Group className="mb-3"><Form.Label className="fw-bold">Danh mục</Form.Label><Form.Select value={formDataSP.phanLoai} onChange={e=>setFormDataSP({...formDataSP,phanLoai:e.target.value})}><option value="">-- Chọn --</option>{dsDanhMuc.map(d=><option key={d.id} value={d.id}>{d.parent?'-- ':''}{d.ten}</option>)}</Form.Select></Form.Group></Col><Col md={6}><Form.Group className="mb-3"><Form.Label className="fw-bold">Đơn vị</Form.Label><Form.Control value={formDataSP.donVi} onChange={e=>setFormDataSP({...formDataSP,donVi:e.target.value})}/></Form.Group></Col></Row></Card.Body></Card><Card className="shadow-sm border-0 mb-3"><Card.Body><h6 className="fw-bold text-primary border-bottom pb-2 mb-3">GIÁ & KHO</h6><Row><Col md={4}><Form.Group className="mb-3"><Form.Label className="fw-bold">Giá Gốc</Form.Label><Form.Control type="number" value={formDataSP.giaGoc} onChange={e => setFormDataSP({ ...formDataSP, giaGoc: parseInt(e.target.value) || 0 })} /></Form.Group></Col><Col md={4}><Form.Group className="mb-3"><Form.Label className="fw-bold">% Giảm</Form.Label><Form.Control type="number" value={formDataSP.phanTramGiam} onChange={e => setFormDataSP({ ...formDataSP, phanTramGiam: parseInt(e.target.value) || 0 })} /></Form.Group></Col><Col md={4}><Form.Group className="mb-3"><Form.Label className="fw-bold text-danger">Giá Bán</Form.Label><Form.Control className="bg-light fw-bold text-danger" readOnly value={formDataSP.giaBan?.toLocaleString()} /></Form.Group></Col><Col md={12}><Form.Group><Form.Label className="fw-bold">Kho</Form.Label><Form.Control type="number" value={formDataSP.soLuong} onChange={e => setFormDataSP({ ...formDataSP, soLuong: parseInt(e.target.value) || 0 })}/></Form.Group></Col></Row></Card.Body></Card><Card className="shadow-sm border-0"><Card.Body><Form.Group><Form.Label className="fw-bold">Mô tả</Form.Label><ReactQuill theme="snow" value={formDataSP.moTa} onChange={v=>setFormDataSP({...formDataSP,moTa:v})} style={{height:'200px', marginBottom:'50px'}}/></Form.Group></Card.Body></Card></Col><Col md={4}><Card className="shadow-sm border-0 mb-3"><Card.Body className="text-center"><h6 className="fw-bold text-secondary border-bottom pb-2 mb-3">ẢNH</h6><div className="border rounded p-2 mb-3 bg-white" style={{minHeight:'200px', display:'flex', alignItems:'center', justifyContent:'center'}}><img src={formDataSP.anh||NO_IMAGE} className="img-fluid" style={{maxHeight:'250px'}}/></div><Form.Control type="file" onChange={e=>handleUpload(e,'PRODUCT')} /></Card.Body></Card><Card className="shadow-sm border-0"><Card.Body><h6 className="fw-bold text-warning border-bottom pb-2 mb-3">TÙY CHỌN</h6><Form.Check type="switch" label="Mới (New)" checked={formDataSP.isMoi} onChange={e=>setFormDataSP({...formDataSP, isMoi:e.target.checked})}/><Form.Check type="switch" label="Bán Chạy" checked={formDataSP.isBanChay} onChange={e=>setFormDataSP({...formDataSP, isBanChay:e.target.checked})}/><Form.Check type="switch" label="Flash Sale" checked={formDataSP.isFlashSale} onChange={e=>setFormDataSP({...formDataSP, isFlashSale:e.target.checked})}/></Card.Body></Card></Col></Row></Form></Modal.Body><Modal.Footer><Button variant="secondary" onClick={()=>setModal({...modal,sp:false})}>Hủy</Button><Button variant="success" onClick={onSaveSP}>Lưu</Button></Modal.Footer></Modal>
      
      <Modal show={modal.dm} onHide={()=>setModal({...modal,dm:false})} centered><Modal.Header closeButton className="bg-primary text-white"><Modal.Title className="fw-bold">QUẢN LÝ DANH MỤC</Modal.Title></Modal.Header><Modal.Body className="p-4 bg-light"><Form><Form.Group className="mb-3"><Form.Label className="fw-bold">Tên Danh Mục</Form.Label><InputGroup><InputGroup.Text className="bg-white"><i className="fa-solid fa-tag text-primary"></i></InputGroup.Text><Form.Control size="lg" placeholder="Nhập tên..." value={formDM.ten} onChange={e=>setFormDM({...formDM,ten:e.target.value})}/></InputGroup></Form.Group><Row><Col md={6}><Form.Group className="mb-3"><Form.Label className="fw-bold">Thứ tự</Form.Label><Form.Control type="number" value={formDM.order} onChange={e=>setFormDM({...formDM,order:e.target.value})}/></Form.Group></Col><Col md={6}><Form.Group className="mb-3"><Form.Label className="fw-bold">Icon</Form.Label><Form.Select value={formDM.icon} onChange={e=>setFormDM({...formDM,icon:e.target.value})}><option>-- Chọn --</option>{ICON_LIST.map(i=><option key={i} value={i}>{i}</option>)}</Form.Select></Form.Group></Col></Row><Form.Group><Form.Label className="fw-bold">Danh mục cha</Form.Label><Form.Select size="lg" value={formDM.parent} onChange={e=>setFormDM({...formDM,parent:e.target.value})}><option value="">-- Là danh mục gốc --</option>{dsDanhMuc.filter(d=>!d.parent).map(d=><option key={d.id} value={d.customId||d.id}>{d.ten}</option>)}</Form.Select></Form.Group></Form></Modal.Body><Modal.Footer><Button variant="secondary" onClick={()=>setModal({...modal,dm:false})}>Hủy</Button><Button variant="primary" className="px-4 fw-bold" onClick={onSaveDM}>Lưu Danh Mục</Button></Modal.Footer></Modal>

      <Modal show={modal.user} onHide={()=>setModal({...modal,user:false})} centered><Modal.Header closeButton><Modal.Title>Sửa điểm</Modal.Title></Modal.Header><Modal.Body><Form.Group><Form.Label>Điểm tích lũy</Form.Label><Form.Control type="number" value={userPoint} onChange={e=>setUserPoint(e.target.value)}/></Form.Group></Modal.Body><Modal.Footer><Button variant="secondary" onClick={()=>setModal({...modal,user:false})}>Hủy</Button><Button onClick={async()=>{await updateDoc(doc(db,"users",editData.user.id),{diemTichLuy:parseInt(userPoint)}); setModal({...modal,user:false})}}>Lưu</Button></Modal.Footer></Modal>
      <Modal show={modal.news} onHide={()=>setModal({...modal,news:false})} size="xl" centered><Modal.Header closeButton className="bg-success text-white"><Modal.Title>{editData.news?'Cập nhật':'Viết bài'}</Modal.Title></Modal.Header><Modal.Body className="bg-light"><Form><Row><Col md={8}><Form.Group className="mb-3"><Form.Label className="fw-bold">Tiêu đề</Form.Label><Form.Control size="lg" value={formTinTuc.tieuDe} onChange={e=>setFormTinTuc({...formTinTuc, tieuDe:e.target.value})}/></Form.Group><Form.Group className="mb-3"><Form.Label className="fw-bold">Tóm tắt</Form.Label><Form.Control as="textarea" rows={3} value={formTinTuc.tomTat} onChange={e=>setFormTinTuc({...formTinTuc, tomTat:e.target.value})}/></Form.Group><Form.Group><Form.Label className="fw-bold">Nội dung</Form.Label><ReactQuill theme="snow" value={formTinTuc.noiDung} onChange={val=>setFormTinTuc({...formTinTuc, noiDung:val})} style={{height:'300px', marginBottom:'50px'}}/></Form.Group></Col><Col md={4}><Card className="shadow-sm border-0 mb-3"><Card.Body className="text-center"><h6 className="fw-bold text-secondary border-bottom pb-2 mb-3">ẢNH</h6><div className="border rounded p-2 mb-3 bg-white" style={{minHeight:'200px', display:'flex', alignItems:'center', justifyContent:'center'}}><img src={formTinTuc.anh||NO_IMAGE} className="img-fluid" style={{maxHeight:'250px'}}/></div><Form.Control type="file" onChange={e=>handleUpload(e,'NEWS')} /></Card.Body></Card></Col></Row></Form></Modal.Body><Modal.Footer><Button variant="secondary" onClick={()=>setModal({...modal,news:false})}>Hủy</Button><Button variant="success" onClick={onSaveNews}>Đăng</Button></Modal.Footer></Modal>
    </div>
  );
}
export default Admin;