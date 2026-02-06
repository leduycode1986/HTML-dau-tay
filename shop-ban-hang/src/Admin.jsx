import React, { useState, useEffect } from 'react';
import { Table, Button, Form, Modal, Badge, Tab, Tabs, Row, Col, Container, InputGroup, Card, Pagination, Spinner, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { doc, setDoc, collection, onSnapshot, deleteDoc, updateDoc, addDoc, serverTimestamp, getDoc } from 'firebase/firestore'; 
import { db, auth } from './firebase'; 
import { signInWithEmailAndPassword, onAuthStateChanged, signOut, updatePassword } from 'firebase/auth';
import { toSlug } from './utils';
import { toast } from 'react-toastify';
import * as XLSX from 'xlsx';

const ICON_LIST = ['🏠','📦','🥩','🥦','🍎','🍞','🥫','❄️','🍬','🍫','🍪','🍦','🍺','🥤','🥛','🧃','🧺','🛋️','🍳','🧹','🧽','🧼','🧴','🪥','💄','🔖','⚡','🔥','🎉','🎁'];
const NO_IMAGE = "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg";

function Admin() { 
  // --- A. STATES QUẢN LÝ QUYỀN HẠN (MỚI THÊM) ---
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [loginInput, setLoginInput] = useState({ email: '', pass: '' });
  const [showPass, setShowPass] = useState(false);
  const [adminWhitelist, setAdminWhitelist] = useState([]);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [passData, setPassData] = useState({ newPass: '', confirmPass: '' });

  // --- B. STATES DỮ LIỆU (GIỮ NGUYÊN 100% TỪ BẢN GỐC) ---
  const [dsSanPham, setDsSanPham] = useState([]);
  const [dsDonHang, setDsDonHang] = useState([]);
  const [dsDanhMuc, setDsDanhMuc] = useState([]);
  const [dsBanner, setDsBanner] = useState([]);
  const [dsCoupon, setDsCoupon] = useState([]);
  const [dsShip, setDsShip] = useState([]); 
  const [dsUser, setDsUser] = useState([]); 
  const [dsReview, setDsReview] = useState([]); 
  const [dsTinTuc, setDsTinTuc] = useState([]); 
  const [isUploading, setIsUploading] = useState(false);

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

  // --- C. LOGIC XỬ LÝ QUYỀN TRUY CẬP ---
  useEffect(() => {
    // 1. Lấy danh sách email admin từ Firestore (cauHinh/phanquyen)
    const unsubWhitelist = onSnapshot(doc(db, "cauHinh", "phanquyen"), (d) => {
      if (d.exists()) setAdminWhitelist(d.data().adminEmails || []);
    });

    // 2. Theo dõi trạng thái đăng nhập Firebase
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const docSnap = await getDoc(doc(db, "cauHinh", "phanquyen"));
        const whitelist = docSnap.data()?.adminEmails || [];
        if (whitelist.includes(user.email)) {
          setIsLoggedIn(true);
        } else {
          toast.error("Tài khoản này không có quyền quản trị!");
          await signOut(auth);
        }
      } else {
        setIsLoggedIn(false);
      }
      setLoadingAuth(false);
    });

    // 3. Tự động dọn dẹp lớp mờ nếu bị kẹt
    const clean = setInterval(() => {
        document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
        if(document.body.classList.contains('modal-open')) document.body.classList.remove('modal-open');
    }, 1000);

    return () => { unsubWhitelist(); unsubscribeAuth(); clearInterval(clean); };
  }, []);

  const handleLogin = async (e) => { 
    e.preventDefault(); 
    try {
      await signInWithEmailAndPassword(auth, loginInput.email, loginInput.pass);
      toast.success("Xác thực Admin thành công!");
    } catch (error) { toast.error("Email hoặc mật khẩu không đúng!"); }
  };

  const handleLogout = async () => { if(confirm("Đăng xuất khỏi hệ thống?")) { await signOut(auth); setIsLoggedIn(false); } };

  const handleAddAdmin = async () => {
    if (!newAdminEmail.includes('@')) return toast.error("Email không hợp lệ!");
    const newList = [...adminWhitelist, newAdminEmail];
    await updateDoc(doc(db, "cauHinh", "phanquyen"), { adminEmails: newList });
    setNewAdminEmail('');
    toast.success("Đã thêm quyền quản trị.");
  };

  const handleRemoveAdmin = async (email) => {
    if (adminWhitelist.length <= 1) return toast.warning("Phải giữ lại ít nhất 1 admin!");
    if (confirm(`Gỡ quyền của ${email}?`)) {
      const newList = adminWhitelist.filter(e => e !== email);
      await updateDoc(doc(db, "cauHinh", "phanquyen"), { adminEmails: newList });
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (passData.newPass !== passData.confirmPass) return toast.error("Mật khẩu không khớp!");
    try {
      await updatePassword(auth.currentUser, passData.newPass);
      toast.success("Đổi mật khẩu thành công!");
      setPassData({ newPass: '', confirmPass: '' });
    } catch (error) { toast.error("Lỗi: " + error.message + " (Hãy đăng nhập lại để thực hiện)"); }
  };

  // --- D. LOGIC DỮ LIỆU REALTIME (GIỮ NGUYÊN) ---
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

  // --- E. CÁC HÀM HELPER & XỬ LÝ (GIỮ NGUYÊN) ---
  const luuCauHinh = async () => { await setDoc(doc(db, "cauHinh", "thongTinChung"), shopConfig); alert("Đã lưu cấu hình!"); };
  const compressImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader(); reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image(); img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas'); const MAX_WIDTH = 800; 
          const scaleSize = MAX_WIDTH / img.width; canvas.width = MAX_WIDTH; canvas.height = img.height * scaleSize;
          const ctx = canvas.getContext('2d'); ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', 0.7));
        };
      };
    });
  };

  const handleUpload = async (e, type) => { 
    const f = e.target.files[0]; if(!f) return; 
    setIsUploading(true); const compressedImg = await compressImage(f); setIsUploading(false); 
    if(type==='LOGO') setShopConfig({...shopConfig,logo:compressedImg}); 
    if(type==='PRODUCT') setFormDataSP({...formDataSP,anh:compressedImg}); 
    if(type==='BANNER') setFormBanner({...formBanner,img:compressedImg}); 
    if(type==='QR') setShopConfig(p => ({...p, bankInfo: {...p.bankInfo, qrImage: compressedImg}})); 
    if(type==='NEWS') setFormTinTuc({...formTinTuc, anh:compressedImg}); 
  };
  
  const add = async (col, d) => await addDoc(collection(db, col), d); 
  const del = async (col, id) => confirm('Xóa?') && await deleteDoc(doc(db, col, id));
  
  useEffect(() => { 
    const g = parseInt(formDataSP.giaGoc)||0; const p = parseInt(formDataSP.phanTramGiam)||0; 
    setFormDataSP(prev => ({...prev, giaBan: g > 0 ? Math.floor(g*(1-p/100)) : 0})); 
  }, [formDataSP.giaGoc, formDataSP.phanTramGiam]);

  const onSaveSP = async () => { 
    const data = { ...formDataSP, slug: toSlug(formDataSP.ten) };
    if (!editData.sp || !editData.sp.ngayTao) data.ngayTao = serverTimestamp();
    if(editData.sp) await updateDoc(doc(db, "sanPham", editData.sp.id), data);
    else await addDoc(collection(db, "sanPham"), data);
    setModal({...modal,sp:false}); toast.success("Đã lưu!");
  };

  const onSaveDM = async () => { 
    const data = {...formDM, slug: toSlug(formDM.ten)};
    if(editData.dm) await updateDoc(doc(db, "danhMuc", editData.dm.id), data);
    else await addDoc(collection(db, "danhMuc"), data);
    setModal({...modal,dm:false}); 
  };

  const handleUpdateStatusOrder = async (id, status) => { await updateDoc(doc(db, "donHang", id), {trangThai: status}); };
  const handleDeleteOrder = async (id) => { if(confirm("Xóa đơn hàng?")) await deleteDoc(doc(db, "donHang", id)); };

  const handleExportExcel = () => {
    const dataToExport = dsSanPham.map(sp => ({ "ID (Không sửa)": sp.id, "Tên sản phẩm": sp.ten, "Giá gốc": sp.giaGoc, "Phần trăm giảm": sp.phanTramGiam, "Kho": sp.soLuong, "Đơn vị": sp.donVi, "Danh mục ID": sp.phanLoai }));
    const wb = XLSX.utils.book_new(); const ws = XLSX.utils.json_to_sheet(dataToExport);
    XLSX.utils.book_append_sheet(wb, ws, "DanhSachSanPham"); XLSX.writeFile(wb, "Danh_Sach_San_Pham.xlsx");
  };

  const handleImportExcel = (e) => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
        try {
            const bstr = evt.target.result; const wb = XLSX.read(bstr, { type: 'binary' });
            const ws = wb.Sheets[wb.SheetNames[0]]; const data = XLSX.utils.sheet_to_json(ws);
            if (!confirm(`Cập nhật ${data.length} sản phẩm?`)) return;
            const updates = data.map(async (row) => {
                const id = row["ID (Không sửa)"]; if (!id) return;
                const updateData = { giaGoc: parseInt(row["Giá gốc"]), phanTramGiam: parseInt(row["Phần trăm giảm"]), giaBan: Math.floor(parseInt(row["Giá gốc"]) * (1 - parseInt(row["Phần trăm giảm"])/100)), ten: row["Tên sản phẩm"], soLuong: parseInt(row["Kho"]) };
                await updateDoc(doc(db, "sanPham", id), updateData);
            });
            await Promise.all(updates); toast.success("Đã xong!");
        } catch (e) { toast.error("Lỗi file!"); }
    };
    reader.readAsBinaryString(file);
  };

  // --- F. GIAO DIỆN XÁC THỰC ---
  if (loadingAuth) return <div className="text-center py-5"><Spinner animation="border" variant="success" /></div>;

  if (!isLoggedIn) return (
    <div className="admin-login-wrapper">
      <div className="admin-login-card shadow-lg border-0">
        <h3 className="text-center text-success fw-bold mb-4">QUẢN TRỊ HỆ THỐNG</h3>
        <Form onSubmit={handleLogin}>
          <Form.Group className="mb-3"><Form.Label className="fw-bold small">Email Admin</Form.Label><Form.Control className="p-3" type="email" value={loginInput.email} onChange={e=>setLoginInput({...loginInput, email:e.target.value})} placeholder="admin@maivang.com" required /></Form.Group>
          <Form.Group className="mb-4"><Form.Label className="fw-bold small">Mật khẩu</Form.Label><InputGroup><Form.Control className="p-3" type={showPass?"text":"password"} value={loginInput.pass} onChange={e=>setLoginInput({...loginInput, pass:e.target.value})} required /><Button variant="outline-secondary" onClick={()=>setShowPass(!showPass)}><i className={showPass?"fa-solid fa-eye-slash":"fa-solid fa-eye"}></i></Button></InputGroup></Form.Group>
          <Button type="submit" variant="success" className="w-100 py-3 fw-bold rounded-pill">XÁC THỰC QUYỀN ADMIN</Button>
        </Form>
      </div>
    </div>
  );

  // --- G. GIAO DIỆN QUẢN TRỊ (GIỮ NGUYÊN CẤU TRÚC 100%) ---
  return (
    <div style={{background: '#f8f9fa', minHeight:'100vh'}}>
      <div className="admin-header">
          <h4 className="m-0 fw-bold text-uppercase"><i className="fa-solid fa-user-shield me-2"></i> QUẢN TRỊ VIÊN</h4>
          <Button variant="danger" size="sm" className="fw-bold px-3 shadow-sm" onClick={handleLogout}>Đăng xuất</Button>
      </div>
      
      <Container fluid className="p-3">
        <Tabs defaultActiveKey="dashboard" className="bg-white p-2 rounded border shadow-sm mb-3">
          
          {/* TAB 1: TỔNG QUAN */}
          <Tab eventKey="dashboard" title="📊 TỔNG QUAN">
            <div className="p-3">
              <Row className="g-3 mb-4">
                <Col md={3}><div className="p-3 bg-primary text-white rounded shadow-sm"><h5>Tổng đơn hàng</h5><h2 className="fw-bold">{dsDonHang.length}</h2></div></Col>
                <Col md={3}><div className="p-3 bg-success text-white rounded shadow-sm"><h5>Doanh thu</h5><h2 className="fw-bold">{dsDonHang.reduce((a,b)=>a+(b.tongTien||0),0).toLocaleString()} ¥</h2></div></Col>
                <Col md={3}><div className="p-3 bg-warning text-dark rounded shadow-sm"><h5>Sản phẩm</h5><h2 className="fw-bold">{dsSanPham.length}</h2></div></Col>
                <Col md={3}><div className="p-3 bg-info text-white rounded shadow-sm"><h5>Thành viên</h5><h2 className="fw-bold">{dsUser.length}</h2></div></Col>
              </Row>
              <Row>
                <Col md={6}>
                  <Card className="shadow-sm border-0"><Card.Header className="bg-white fw-bold text-danger">⚠️ SẮP HẾT HÀNG (Kho &lt;= 5)</Card.Header><Card.Body><Table size="sm" hover><thead><tr><th>Tên</th><th>Kho</th></tr></thead><tbody>{dsSanPham.filter(sp=>sp.soLuong<=5).map(sp=>(<tr key={sp.id}><td>{sp.ten}</td><td className="text-danger fw-bold">{sp.soLuong}</td></tr>))}</tbody></Table></Card.Body></Card>
                </Col>
                <Col md={6}>
                  <Card className="shadow-sm border-0"><Card.Header className="bg-white fw-bold text-primary">📦 ĐƠN MỚI NHẤT</Card.Header><Card.Body>{dsDonHang.sort((a,b)=>b.ngayDat-a.ngayDat).slice(0,5).map(dh=>(<div key={dh.id} className="d-flex justify-content-between border-bottom py-2"><span><strong>{dh.maDonHang}</strong> - {dh.khachHang?.ten}</span><span className="text-success fw-bold">{dh.tongTien?.toLocaleString()} ¥</span></div>))}</Card.Body></Card>
                </Col>
              </Row>
            </div>
          </Tab>

          {/* TAB 2: CẤU HÌNH & BANNER (GIỮ NGUYÊN TẤT CẢ TRƯỜNG) */}
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
                    <Col md={6}><Form.Group><Form.Label className="fw-bold">Fax</Form.Label><Form.Control value={shopConfig.fax} onChange={e=>setShopConfig({...shopConfig, fax:e.target.value})}/></Form.Group></Col>
                    <Col md={6}><Form.Group><Form.Label className="fw-bold">Giờ mở cửa</Form.Label><Form.Control value={shopConfig.openingHours} onChange={e=>setShopConfig({...shopConfig, openingHours:e.target.value})}/></Form.Group></Col>
                  </Row>
                  
                  <h6 className="text-warning fw-bold border-bottom pb-2 mt-4 mb-3"><i className="fa-solid fa-credit-card me-2"></i> THANH TOÁN (QR)</h6>
                  <Row className="g-3">
                    <Col md={8}>
                        <Form.Group className="mb-2"><Form.Label className="fw-bold small">Ngân hàng</Form.Label><Form.Control size="sm" value={shopConfig.bankInfo?.bankName} onChange={e=>setShopConfig({...shopConfig, bankInfo:{...shopConfig.bankInfo, bankName:e.target.value}})}/></Form.Group>
                        <Form.Group className="mb-2"><Form.Label className="fw-bold small">Số TK</Form.Label><Form.Control size="sm" value={shopConfig.bankInfo?.accountNum} onChange={e=>setShopConfig({...shopConfig, bankInfo:{...shopConfig.bankInfo, accountNum:e.target.value}})}/></Form.Group>
                        <Form.Group><Form.Label className="fw-bold small">Chủ TK</Form.Label><Form.Control size="sm" value={shopConfig.bankInfo?.accountName} onChange={e=>setShopConfig({...shopConfig, bankInfo:{...shopConfig.bankInfo, accountName:e.target.value}})}/></Form.Group>
                    </Col>
                    <Col md={4} className="text-center">
                        <div className="border rounded p-1 mb-2 bg-light"><img src={shopConfig.bankInfo?.qrImage} style={{width:'100%', maxHeight:'150px', objectFit:'contain'}}/></div>
                        <Form.Control type="file" size="sm" onChange={e=>handleUpload(e,'QR')}/>
                    </Col>
                  </Row>
                </Col>

                <Col md={6}>
                  <h6 className="text-primary fw-bold border-bottom pb-2 mb-3"><i className="fa-solid fa-images me-2"></i> BANNER SLIDE</h6>
                  <div className="bg-light p-3 rounded mb-4">
                    <div className="d-flex gap-2 mb-3">
                        <Form.Control type="file" size="sm" onChange={e=>handleUpload(e,'BANNER')}/>
                        <Form.Control size="sm" placeholder="Link..." value={formBanner.link} onChange={e=>setFormBanner({...formBanner,link:e.target.value})}/><Button size="sm" onClick={()=>{add('banners', formBanner); setFormBanner({img:'', link:''})}}>Thêm</Button>
                    </div>
                    <div className="d-flex flex-wrap gap-3" style={{maxHeight:'250px', overflowY:'auto'}}>
                        {dsBanner.map(b=> (
                        <div key={b.id} className="position-relative border rounded p-1 bg-white shadow-sm" style={{width:'100%'}}>
                            <img src={b.img} className="w-100 rounded" />
                            <Button size="sm" variant="danger" className="position-absolute top-0 end-0 rounded-circle" onClick={()=>del('banners', b.id)}>x</Button>
                        </div>
                        ))}
                    </div>
                  </div>
                  <h6 className="text-info fw-bold border-bottom pb-2 mb-3"><i className="fa-solid fa-link me-2"></i> LIÊN KẾT BÀI VIẾT</h6>
                  <Row className="g-3">
                    <Col md={6}><Form.Group><Form.Label className="fw-bold small">Facebook</Form.Label><Form.Control size="sm" value={shopConfig.linkFacebook} onChange={e=>setShopConfig({...shopConfig, linkFacebook:e.target.value})}/></Form.Group></Col>
                    <Col md={6}><Form.Group><Form.Label className="fw-bold small">Zalo OA</Form.Label><Form.Control size="sm" value={shopConfig.zalo} onChange={e=>setShopConfig({...shopConfig, zalo:e.target.value})}/></Form.Group></Col>
                    <Col md={12}><Form.Label className="fw-bold small">Chính Sách</Form.Label><InputGroup size="sm"><Form.Control value={shopConfig.linkPolicy}/><Button variant="outline-primary" onClick={() => openPostEditor('policy')}>Soạn bài</Button></InputGroup></Col>
                    <Col md={12}><Form.Label className="fw-bold small">Hướng Dẫn</Form.Label><InputGroup size="sm"><Form.Control value={shopConfig.linkGuide}/><Button variant="outline-primary" onClick={() => openPostEditor('guide')}>Soạn bài</Button></InputGroup></Col>
                  </Row>
                  <h6 className="text-danger fw-bold border-bottom pb-2 mt-4 mb-3">FLASH SALE & ĐIỂM</h6>
                  <Row className="g-3">
                    <Col md={6}><Form.Group><Form.Label className="fw-bold small">Kết thúc Sale</Form.Label><Form.Control size="sm" type="datetime-local" value={shopConfig.flashSaleEnd} onChange={e=>setShopConfig({...shopConfig, flashSaleEnd:e.target.value})}/></Form.Group></Col>
                    <Col md={6}><Form.Group><Form.Label className="fw-bold small">Tỷ lệ điểm</Form.Label><Form.Control size="sm" type="number" value={shopConfig.tyLeDiem} onChange={e=>setShopConfig({...shopConfig, tyLeDiem:e.target.value})}/></Form.Group></Col>
                  </Row>
                </Col>
              </Row>
              <div className="mt-4 pt-3 border-top text-end"><Button variant="success" size="lg" className="fw-bold px-5 shadow" onClick={luuCauHinh}>LƯU CẤU HÌNH</Button></div>
            </div>
          </Tab>

          {/* TAB 3: DANH MỤC */}
          <Tab eventKey="menu" title="📂 DANH MỤC">
            <div className="bg-white p-3 rounded shadow-sm">
                <Button variant="success" className="mb-3 fw-bold" onClick={()=>{setEditData({dm:null}); setFormDM({ten:'', icon:'', parent:'', order:''}); setModal({...modal, dm:true})}}>+ DANH MỤC MỚI</Button>
                <div className="table-responsive">
                    <Table hover bordered className="align-middle">
                        <thead className="bg-light"><tr><th>STT</th><th>Tên</th><th>Icon</th><th>Cấp độ</th><th>Thao tác</th></tr></thead>
                        <tbody>
                            {dsDanhMuc.map(d=>(<tr key={d.id} className={d.parent ? 'bg-light' : 'fw-bold'}>
                                <td>{d.order}</td><td>{d.parent ? <span className="ms-4">-- {d.ten}</span> : <span className="text-success">{d.ten}</span>}</td><td>{d.icon}</td>
                                <td>{d.parent ? <Badge bg="secondary">Con</Badge> : <Badge bg="primary">Gốc</Badge>}</td>
                                <td><Button size="sm" variant="warning" className="me-1" onClick={()=>{setEditData({dm:d}); setFormDM(d); setModal({...modal, dm:true})}}>✏️</Button><Button size="sm" variant="danger" onClick={()=>del('danhMuc',d.id)}>🗑️</Button></td>
                            </tr>))}
                        </tbody>
                    </Table>
                </div>
            </div>
          </Tab>
          
          {/* TAB 4: SẢN PHẨM (GIỮ NGUYÊN EXCEL & BỘ LỌC) */}
          <Tab eventKey="products" title="📦 SẢN PHẨM">
            <div className="bg-white p-3 rounded shadow-sm">
              <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                  <div className="d-flex gap-2">
                      <Button variant="success" className="fw-bold" onClick={()=>{setEditData({sp:null}); setFormDataSP({ ten:'', giaGoc:'', phanTramGiam:0, giaBan:'', donVi:'Cái', soLuong:100, moTa:'', anh:'', phanLoai:'', isMoi:false, isKhuyenMai:false, isBanChay:false, isFlashSale:false }); setModal({...modal, sp:true})}}>+ THÊM MỚI</Button>
                      <Button variant="outline-success" onClick={handleExportExcel}><i className="fa-solid fa-file-excel me-2"></i> Xuất Excel</Button>
                      <div className="position-relative"><Button variant="outline-primary">Nhập Giá & Kho</Button><input type="file" accept=".xlsx" onChange={handleImportExcel} style={{position:'absolute', top:0, left:0, width:'100%', height:'100%', opacity:0, cursor:'pointer'}} /></div>
                  </div>
                  <div className="d-flex gap-2">
                    <Form.Select size="sm" style={{width:180}} value={filterCategory} onChange={e=>setFilterCategory(e.target.value)}><option value="">Tất cả danh mục</option>{dsDanhMuc.map(d => <option key={d.id} value={d.id}>{d.ten}</option>)}</Form.Select>
                    <Form.Select size="sm" style={{width:150}} value={sortPrice} onChange={e=>setSortPrice(e.target.value)}><option value="newest">Mới nhất</option><option value="asc">Giá tăng dần</option><option value="desc">Giá giảm dần</option></Form.Select>
                  </div>
              </div>
              <div className="table-responsive">
                <Table hover bordered className="align-middle">
                  <thead className="bg-light"><tr><th>Ảnh</th><th>Tên</th><th>Kho</th><th>Giá bán</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
                  <tbody>{dsSanPham.slice((currentPage-1)*itemsPerPage, currentPage*itemsPerPage).map(sp=>(<tr key={sp.id}>
                    <td><img src={sp.anh||NO_IMAGE} width="40" height="40" style={{objectFit:'cover'}}/></td><td className="fw-bold small">{sp.ten}</td><td className={sp.soLuong<10?'text-danger fw-bold':''}>{sp.soLuong}</td><td className="text-danger fw-bold">{sp.giaBan?.toLocaleString()}¥</td>
                    <td>{sp.isFlashSale && <Badge bg="warning" text="dark" className="me-1">⚡Sale</Badge>}{sp.isMoi && <Badge bg="success">New</Badge>}</td>
                    <td><Button size="sm" variant="warning" className="me-1" onClick={()=>{setEditData({sp}); setFormDataSP(sp); setModal({...modal, sp:true})}}>✏️</Button><Button size="sm" variant="danger" onClick={()=>del('sanPham',sp.id)}>🗑️</Button></td>
                  </tr>))}</tbody>
                </Table>
              </div>
              <Pagination className="justify-content-center mt-3">{[...Array(Math.ceil(dsSanPham.length/itemsPerPage))].map((_, i) => (<Pagination.Item key={i+1} active={i+1 === currentPage} onClick={() => setCurrentPage(i+1)}>{i+1}</Pagination.Item>))}</Pagination>
            </div>
          </Tab>

          {/* TAB 5: ĐƠN HÀNG */}
          <Tab eventKey="orders" title={`📋 ĐƠN HÀNG (${dsDonHang.length})`}>
            <div className="bg-white p-3 rounded shadow-sm">
                <Table hover bordered className="align-middle text-center">
                    <thead className="bg-light small"><tr><th>Mã</th><th>Ngày</th><th>Khách</th><th>Thanh toán</th><th>Tổng</th><th>Trạng thái</th><th>Xử lý</th></tr></thead>
                    <tbody>{dsDonHang.sort((a,b)=>b.ngayDat-a.ngayDat).map(dh=><tr key={dh.id}>
                        <td className="fw-bold text-primary small">#{dh.maDonHang||dh.id.slice(0,5)}</td>
                        <td className="small">{dh.ngayDat?.toDate?.().toLocaleDateString('vi-VN')}</td>
                        <td className="text-start small"><strong>{dh.khachHang?.ten}</strong><br/>{dh.khachHang?.sdt}</td>
                        <td><Badge bg="info">{dh.hinhThucThanhToan}</Badge></td>
                        <td className="text-danger fw-bold">{dh.tongTien?.toLocaleString()}¥</td>
                        <td><Form.Select size="sm" value={dh.trangThai} onChange={(e)=>handleUpdateStatusOrder(dh.id,e.target.value)} style={{fontSize:12, fontWeight:'bold'}}><option>Mới đặt</option><option>Đang giao</option><option>Hoàn thành</option><option>Đã hủy</option></Form.Select></td>
                        <td><Button size="sm" variant="info" className="text-white me-1" onClick={()=>{setSelectedOrder(dh);setModal({...modal, order:true})}}><i className="fa-solid fa-eye"></i></Button><Button size="sm" variant="danger" onClick={()=>handleDeleteOrder(dh.id)}><i className="fa-solid fa-trash"></i></Button></td>
                    </tr>)}</tbody>
                </Table>
            </div>
          </Tab>

          {/* TAB 6: SHIP & COUPON (KHÔI PHỤC) */}
          <Tab eventKey="marketing" title="🎟️ SHIP & COUPON">
            <Row className="p-2">
              <Col md={6}><div className="bg-white p-3 shadow-sm rounded border"><h6>MÃ GIẢM GIÁ</h6>
                  <div className="d-flex gap-1 mb-2"><Form.Control placeholder="Mã" value={formCoupon.code} onChange={e=>setFormCoupon({...formCoupon,code:e.target.value.toUpperCase()})}/><Form.Control type="number" placeholder="Giảm(¥)" value={formCoupon.giamGia} onChange={e=>setFormCoupon({...formCoupon,giamGia:e.target.value})}/><Button size="sm" onClick={()=>{add('coupons',formCoupon); setFormCoupon({code:'',giamGia:0})}}>Thêm</Button></div>
                  <Table size="sm"><tbody>{dsCoupon.map(c=><tr key={c.id}><td>{c.code}</td><td>{c.giamGia}¥</td><td><Button size="sm" variant="danger" onClick={()=>del('coupons',c.id)}>x</Button></td></tr>)}</tbody></Table>
              </div></Col>
              <Col md={6}><div className="bg-white p-3 shadow-sm rounded border"><h6>PHÍ SHIP</h6>
                  <div className="d-flex gap-1 mb-2"><Form.Control placeholder="Khu vực" value={formShip.khuVuc} onChange={e=>setFormShip({...formShip,khuVuc:e.target.value})}/><Form.Control type="number" placeholder="Phí(¥)" value={formShip.phi} onChange={e=>setFormShip({...formShip,phi:e.target.value})}/><Button size="sm" onClick={()=>{add('shipping',formShip); setFormShip({khuVuc:'',phi:0})}}>Thêm</Button></div>
                  <Table size="sm"><tbody>{dsShip.map(s=><tr key={s.id}><td>{s.khuVuc}</td><td>{s.phi}¥</td><td><Button size="sm" variant="danger" onClick={()=>del('shipping',s.id)}>x</Button></td></tr>)}</tbody></Table>
              </div></Col>
            </Row>
          </Tab>

          {/* TAB 7: TIN TỨC */}
          <Tab eventKey="news" title="📰 TIN TỨC">
            <div className="bg-white p-3 rounded shadow-sm">
              <Button variant="success" className="mb-3 fw-bold" onClick={()=>{setEditData({news:null}); setFormTinTuc({ tieuDe: '', anh: '', tomTat: '', noiDung: '' }); setModal({...modal, news:true})}}>+ VIẾT BÀI MỚI</Button>
              <Table hover bordered><thead><tr><th>Ảnh</th><th>Tiêu đề</th><th>Xử lý</th></tr></thead>
                <tbody>{dsTinTuc.map(tin => (<tr key={tin.id}><td><img src={tin.anh} width="50"/></td><td>{tin.tieuDe}</td><td><Button size="sm" variant="warning" className="me-1" onClick={()=>{setEditData({news:tin}); setFormTinTuc(tin); setModal({...modal, news:true})}}>✏️</Button><Button size="sm" variant="danger" onClick={()=>del('tinTuc', tin.id)}>🗑️</Button></td></tr>))}</tbody>
              </Table>
            </div>
          </Tab>

          {/* TAB 8: THÀNH VIÊN & ĐÁNH GIÁ (KHÔI PHỤC) */}
          <Tab eventKey="users" title="👥 THÀNH VIÊN & ĐÁNH GIÁ">
            <Row className="p-2">
              <Col md={7}><Card className="shadow-sm"><h6>DANH SÁCH THÀNH VIÊN</h6><div className="table-responsive"><Table size="sm" hover><thead><tr><th>Tên</th><th>Điểm</th><th>Xử lý</th></tr></thead><tbody>{dsUser.map(u=><tr key={u.id}><td>{u.ten}</td><td className="text-warning fw-bold">{u.diemTichLuy}</td><td><Button size="sm" onClick={()=>{setEditData({user:u}); setUserPoint(u.diemTichLuy); setModal({...modal, user:true})}}>Sửa</Button></td></tr>)}</tbody></Table></div></Card></Col>
              <Col md={5}><Card className="shadow-sm"><h6>ĐÁNH GIÁ MỚI</h6><div style={{maxHeight:400,overflowY:'auto'}}>{dsReview.map(r=><div key={r.id} className="border-bottom py-2"><strong>{r.userName}</strong> - {r.rating}⭐<p className="mb-0 small">{r.comment}</p><Button size="sm" variant="link" className="text-danger p-0" style={{fontSize:10}} onClick={()=>del('reviews', r.id)}>Xóa</Button></div>)}</div></Card></Col>
            </Row>
          </Tab>

          {/* TAB 9: QUYỀN & HỆ THỐNG (MỚI THÊM) */}
          <Tab eventKey="system" title="🔐 QUYỀN & MẬT KHẨU">
            <Row className="p-3 g-4">
              <Col md={6}><Card className="shadow-sm border-0 h-100"><Card.Header className="bg-primary text-white fw-bold">ADMIN WHITELIST</Card.Header><Card.Body><InputGroup className="mb-3"><Form.Control placeholder="Thêm email admin..." value={newAdminEmail} onChange={e=>setNewAdminEmail(e.target.value)}/><Button variant="success" onClick={handleAddAdmin}>+ Cấp quyền</Button></InputGroup><Table size="sm" hover bordered><thead><tr><th>Email Admin</th><th>Xử lý</th></tr></thead><tbody>{adminWhitelist.map((email, i)=>(<tr key={i}><td>{email}</td><td className="text-center"><Button variant="link" className="text-danger p-0" onClick={()=>handleRemoveAdmin(email)}><i className="fa-solid fa-trash-can"></i></Button></td></tr>))}</tbody></Table></Card.Body></Card></Col>
              <Col md={6}><Card className="shadow-sm border-0 h-100"><Card.Header className="bg-warning fw-bold">ĐỔI MẬT KHẨU QUẢN TRỊ</Card.Header><Card.Body><Form onSubmit={handleUpdatePassword}><Form.Group className="mb-3"><Form.Label className="small fw-bold">Mật khẩu mới</Form.Label><Form.Control type="password" value={passData.newPass} onChange={e=>setPassData({...passData, newPass:e.target.value})} required /></Form.Group><Form.Group className="mb-3"><Form.Label className="small fw-bold">Xác nhận mật khẩu</Form.Label><Form.Control type="password" value={passData.confirmPass} onChange={e=>setPassData({...passData, confirmPass:e.target.value})} required /></Form.Group><Button type="submit" variant="warning" className="w-100 fw-bold">CẬP NHẬT NGAY</Button></Form></Card.Body></Card></Col>
            </Row>
          </Tab>

        </Tabs>
      </Container>

      {/* --- CÁC MODAL (GIỮ NGUYÊN 100% GIAO DIỆN CŨ) --- */}
      <Modal show={modal.sp} onHide={()=>setModal({...modal,sp:false})} size="xl" centered><Modal.Header closeButton className="bg-success text-white"><Modal.Title>{editData.sp?'Cập nhật sản phẩm':'Thêm mới'}</Modal.Title></Modal.Header><Modal.Body className="bg-light"><Form><Row><Col md={8}><Card className="p-3 mb-3 shadow-sm border-0"><Form.Group className="mb-3"><Form.Label className="fw-bold">Tên SP</Form.Label><Form.Control value={formDataSP.ten} onChange={e=>setFormDataSP({...formDataSP, ten:e.target.value})}/></Form.Group><Row><Col md={6}><Form.Group className="mb-3"><Form.Label className="fw-bold small">Danh mục</Form.Label><Form.Select value={formDataSP.phanLoai} onChange={e=>setFormDataSP({...formDataSP,phanLoai:e.target.value})}><option value="">-- Chọn danh mục --</option>{dsDanhMuc.map(d=><option key={d.id} value={d.id}>{d.ten}</option>)}</Form.Select></Form.Group></Col><Col md={6}><Form.Group className="mb-3"><Form.Label className="fw-bold small">Đơn vị</Form.Label><Form.Control value={formDataSP.donVi} onChange={e=>setFormDataSP({...formDataSP,donVi:e.target.value})}/></Form.Group></Col><Col md={6}><Form.Group className="mb-3"><Form.Label className="fw-bold small">Giá Gốc</Form.Label><Form.Control type="number" value={formDataSP.giaGoc} onChange={e=>setFormDataSP({...formDataSP, giaGoc:e.target.value})}/></Form.Group></Col><Col md={6}><Form.Group className="mb-3"><Form.Label className="fw-bold small">% Giảm</Form.Label><Form.Control type="number" value={formDataSP.phanTramGiam} onChange={e=>setFormDataSP({...formDataSP, phanTramGiam:e.target.value})}/></Form.Group></Col><Col md={12}><Form.Group><Form.Label className="fw-bold small">Kho</Form.Label><Form.Control type="number" value={formDataSP.soLuong} onChange={e=>setFormDataSP({...formDataSP, soLuong:e.target.value})}/></Form.Group></Col></Row><Form.Group className="mt-3"><Form.Label className="fw-bold small">Mô tả</Form.Label><ReactQuill theme="snow" value={formDataSP.moTa} onChange={v=>setFormDataSP({...formDataSP, moTa:v})} style={{height:200, marginBottom:50}}/></Form.Group></Card></Col><Col md={4}><Card className="p-3 text-center shadow-sm border-0"><Form.Label className="fw-bold small">Ảnh đại diện</Form.Label><div className="mb-2"><img src={formDataSP.anh||NO_IMAGE} className="img-fluid rounded border"/></div><Form.Control type="file" onChange={e=>handleUpload(e,'PRODUCT')}/></Card><Card className="p-3 mt-3 shadow-sm border-0"><Form.Check type="switch" label="Mới" checked={formDataSP.isMoi} onChange={e=>setFormDataSP({...formDataSP, isMoi:e.target.checked})}/><Form.Check type="switch" label="Bán chạy" checked={formDataSP.isBanChay} onChange={e=>setFormDataSP({...formDataSP, isBanChay:e.target.checked})}/><Form.Check type="switch" label="⚡ Flash Sale" checked={formDataSP.isFlashSale} onChange={e=>setFormDataSP({...formDataSP, isFlashSale:e.target.checked})}/></Card></Col></Row></Form></Modal.Body><Modal.Footer><Button onClick={onSaveSP} variant="success">LƯU SẢN PHẨM</Button></Modal.Footer></Modal>

      <Modal show={modal.order} onHide={()=>setModal({...modal,order:false})} size="lg" centered><Modal.Header closeButton className="bg-success text-white"><Modal.Title>Chi tiết đơn hàng #{selectedOrder?.maDonHang}</Modal.Title></Modal.Header><Modal.Body>{selectedOrder && (<div><Row><Col md={6}><p>Khách: <strong>{selectedOrder.khachHang?.ten}</strong></p><p>SĐT: {selectedOrder.khachHang?.sdt}</p></Col><Col md={6}><p>Địa chỉ: {selectedOrder.khachHang?.diachi}</p></Col></Row><Table bordered size="sm"><thead><tr><th>Sản phẩm</th><th>SL</th><th>Thành tiền</th></tr></thead><tbody>{selectedOrder.gioHang?.map((i,x)=>(<tr key={x}><td>{i.ten}</td><td>{i.soLuong}</td><td>{(i.giaBan*i.soLuong).toLocaleString()} ¥</td></tr>))}</tbody></Table><h5>Tổng tiền: <span className="text-danger">{selectedOrder.tongTien?.toLocaleString()} ¥</span></h5></div>)}</Modal.Body></Modal>

      <Modal show={modal.dm} onHide={()=>setModal({...modal,dm:false})} centered><Modal.Header closeButton><Modal.Title>Quản lý danh mục</Modal.Title></Modal.Header><Modal.Body><Form><Form.Group className="mb-3"><Form.Label>Tên</Form.Label><Form.Control value={formDM.ten} onChange={e=>setFormDM({...formDM, ten:e.target.value})}/></Form.Group><Row><Col md={6}><Form.Group><Form.Label>Icon</Form.Label><Form.Select value={formDM.icon} onChange={e=>setFormDM({...formDM, icon:e.target.value})}>{ICON_LIST.map(i=><option key={i} value={i}>{i}</option>)}</Form.Select></Form.Group></Col><Col md={6}><Form.Group><Form.Label>Thứ tự</Form.Label><Form.Control type="number" value={formDM.order} onChange={e=>setFormDM({...formDM, order:e.target.value})}/></Form.Group></Col></Row><Form.Group className="mt-3"><Form.Label>Danh mục cha</Form.Label><Form.Select value={formDM.parent} onChange={e=>setFormDM({...formDM, parent:e.target.value})}><option value="">-- Gốc --</option>{dsDanhMuc.filter(d=>!d.parent).map(d=><option key={d.id} value={d.id}>{d.ten}</option>)}</Form.Select></Form.Group></Form></Modal.Body><Modal.Footer><Button onClick={onSaveDM} variant="primary">Lưu</Button></Modal.Footer></Modal>

      <Modal show={modal.user} onHide={()=>setModal({...modal,user:false})} centered><Modal.Header closeButton><Modal.Title>Sửa điểm thưởng</Modal.Title></Modal.Header><Modal.Body><Form.Group><Form.Label>Điểm tích lũy</Form.Label><Form.Control type="number" value={userPoint} onChange={e=>setUserPoint(e.target.value)}/></Form.Group></Modal.Body><Modal.Footer><Button onClick={async()=>{await updateDoc(doc(db,"users",editData.user.id),{diemTichLuy:parseInt(userPoint)}); setModal({...modal,user:false})}}>Lưu</Button></Modal.Footer></Modal>

      <Modal show={modal.news} onHide={()=>setModal({...modal,news:false})} size="xl" centered><Modal.Header closeButton><Modal.Title>Bài viết</Modal.Title></Modal.Header><Modal.Body><Form><Form.Group className="mb-3"><Form.Label>Tiêu đề</Form.Label><Form.Control value={formTinTuc.tieuDe} onChange={e=>setFormTinTuc({...formTinTuc, tieuDe:e.target.value})}/></Form.Group><Row><Col md={8}><Form.Group><Form.Label>Tóm tắt</Form.Label><Form.Control as="textarea" rows={3} value={formTinTuc.tomTat} onChange={e=>setFormTinTuc({...formTinTuc, tomTat:e.target.value})}/></Form.Group><Form.Group className="mt-3"><Form.Label>Nội dung</Form.Label><ReactQuill theme="snow" value={formTinTuc.noiDung} onChange={v=>setFormTinTuc({...formTinTuc, noiDung:v})} style={{height:300, marginBottom:50}}/></Form.Group></Col><Col md={4}><Card className="p-3 text-center"><img src={formTinTuc.anh||NO_IMAGE} className="img-fluid mb-2"/><Form.Control type="file" onChange={e=>handleUpload(e,'NEWS')}/></Card></Col></Row></Form></Modal.Body><Modal.Footer><Button onClick={onSaveNews} variant="success">Đăng bài</Button></Modal.Footer></Modal>

      <Modal show={modal.post} onHide={()=>setModal({...modal,post:false})} size="xl" centered><Modal.Header closeButton><Modal.Title>{postEditor.title}</Modal.Title></Modal.Header><Modal.Body><ReactQuill theme="snow" value={postEditor.content} onChange={v=>setPostEditor({...postEditor, content:v})} style={{height:400, marginBottom:50}}/></Modal.Body><Modal.Footer><Button onClick={savePostContent} variant="primary">Xác nhận</Button></Modal.Footer></Modal>
    </div>
  );
}

export default Admin;