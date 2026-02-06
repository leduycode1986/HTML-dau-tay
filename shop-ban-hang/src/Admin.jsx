import React, { useState, useEffect } from 'react';
import { Table, Button, Form, Modal, Badge, Tab, Tabs, Row, Col, Container, InputGroup, Card, Pagination, Spinner, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { doc, setDoc, collection, onSnapshot, deleteDoc, updateDoc, addDoc, serverTimestamp, getDoc } from 'firebase/firestore'; 
import { db, auth } from './firebase'; //
import { signInWithEmailAndPassword, onAuthStateChanged, signOut, updatePassword } from 'firebase/auth'; //
import { toSlug } from './utils'; //
import { toast } from 'react-toastify'; //
import * as XLSX from 'xlsx'; //

const ICON_LIST = ['🏠','📦','🥩','🥦','🍎','🍞','🥫','❄️','🍬','🍫','🍪','🍦','🍺','🥤','🥛','🧃','🧺','🛋️','🍳','🧹','🧽','🧼','🧴','🪥','💄','🔖','⚡','🔥','🎉','🎁'];
const NO_IMAGE = "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg";

function Admin() { 
  // --- 1. STATES QUẢN LÝ ---
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [loginInput, setLoginInput] = useState({ email: '', pass: '' });
  const [showPass, setShowPass] = useState(false);
  const [adminWhitelist, setAdminWhitelist] = useState([]);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [passData, setPassData] = useState({ newPass: '', confirmPass: '' });

  // --- 2. STATES DỮ LIỆU ---
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

  // --- 3. XÁC THỰC QUYỀN TRUY CẬP (whitelist từ Firestore) ---
  useEffect(() => {
    const unsubWhitelist = onSnapshot(doc(db, "cauHinh", "phanquyen"), (d) => { //
      if (d.exists()) setAdminWhitelist(d.data().adminEmails || []);
    });

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const docSnap = await getDoc(doc(db, "cauHinh", "phanquyen"));
        const whitelist = docSnap.data()?.adminEmails || [];
        if (whitelist.includes(user.email)) {
          setIsLoggedIn(true);
        } else {
          toast.error("Tài khoản không có quyền Admin!");
          await signOut(auth);
        }
      } else { setIsLoggedIn(false); }
      setLoadingAuth(false);
    });

    // Fix backdrop cứng đầu
    const clean = setInterval(() => {
        document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
        if(document.body.classList.contains('modal-open')) document.body.classList.remove('modal-open');
    }, 1000);

    return () => { unsubWhitelist(); unsubscribeAuth(); clearInterval(clean); };
  }, []);

  // --- 4. LOGIC NGHIỆP VỤ ---

  const handleLogin = async (e) => { 
    e.preventDefault(); 
    try {
      await signInWithEmailAndPassword(auth, loginInput.email, loginInput.pass);
      toast.success("Đăng nhập thành công!");
    } catch (error) { toast.error("Sai tài khoản hoặc mật khẩu!"); }
  };

  const handleLogout = async () => { if(confirm("Bạn muốn đăng xuất?")) { await signOut(auth); setIsLoggedIn(false); } };

  // [FIX] Thêm hàm định nghĩa nội dung bài viết chính sách/hướng dẫn
  const openPostEditor = (type) => {
    if (type === 'policy') setPostEditor({ type: 'policy', title: 'Chính Sách Đổi Trả', content: shopConfig.policyContent || '' });
    else setPostEditor({ type: 'guide', title: 'Hướng Dẫn Mua Hàng', content: shopConfig.guideContent || '' });
    setModal({ ...modal, post: true });
  };

  const savePostContent = () => {
    if (postEditor.type === 'policy') setShopConfig(prev => ({ ...prev, policyContent: postEditor.content }));
    else setShopConfig(prev => ({ ...prev, guideContent: postEditor.content }));
    setModal({ ...modal, post: false });
  };

  // [FIX] Thêm hàm xử lý Tin Tức
  const onSaveNews = async () => {
    const data = { ...formTinTuc, slug: toSlug(formTinTuc.tieuDe), ngayDang: serverTimestamp() };
    try {
      if (editData.news) await updateDoc(doc(db, "tinTuc", editData.news.id), data);
      else await addDoc(collection(db, "tinTuc"), data);
      setModal({ ...modal, news: false });
      toast.success("Đã lưu tin tức!");
    } catch (err) { toast.error("Lỗi: " + err.message); }
  };

  // Các hàm CRUD khác
  const onSaveSP = async () => {
    const data = { ...formDataSP, slug: toSlug(formDataSP.ten) };
    if (!editData.sp || !editData.sp.ngayTao) data.ngayTao = serverTimestamp();
    if(editData.sp) await updateDoc(doc(db, "sanPham", editData.sp.id), data);
    else await addDoc(collection(db, "sanPham"), data);
    setModal({...modal,sp:false}); toast.success("Đã lưu sản phẩm!");
  };

  const onSaveDM = async () => {
    const data = {...formDM, slug: toSlug(formDM.ten)};
    if(editData.dm) await updateDoc(doc(db, "danhMuc", editData.dm.id), data);
    else await addDoc(collection(db, "danhMuc"), data);
    setModal({...modal,dm:false}); 
  };

  // --- 5. LOGIC DỮ LIỆU REALTIME ---
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

  // --- 6. PHÂN QUYỀN & EXCEL ---
  const handleAddAdmin = async () => {
    if (!newAdminEmail.includes('@')) return toast.error("Email không hợp lệ!");
    const newList = [...adminWhitelist, newAdminEmail];
    await updateDoc(doc(db, "cauHinh", "phanquyen"), { adminEmails: newList });
    setNewAdminEmail(''); toast.success("Đã thêm Admin!");
  };

  const handleRemoveAdmin = async (email) => {
    if (adminWhitelist.length <= 1) return toast.warning("Cần giữ ít nhất 1 Admin!");
    if (confirm(`Xóa quyền của ${email}?`)) {
      const newList = adminWhitelist.filter(e => e !== email);
      await updateDoc(doc(db, "cauHinh", "phanquyen"), { adminEmails: newList });
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (passData.newPass !== passData.confirmPass) return toast.error("Mật khẩu không khớp!");
    try { await updatePassword(auth.currentUser, passData.newPass); toast.success("Đổi mật khẩu thành công!"); setPassData({ newPass: '', confirmPass: '' }); } 
    catch (error) { toast.error("Lỗi xác thực lại: " + error.message); }
  };

  const luuCauHinh = async () => { await setDoc(doc(db, "cauHinh", "thongTinChung"), shopConfig); toast.success("Đã lưu cấu hình!"); };
  
  const handleUpload = async (e, type) => { 
    const f = e.target.files[0]; if(!f) return; 
    setIsUploading(true);
    const reader = new FileReader(); reader.readAsDataURL(f);
    reader.onload = async (event) => {
        const compressedImg = event.target.result; // Giả lập nén đơn giản bằng Base64
        if(type==='LOGO') setShopConfig({...shopConfig,logo:compressedImg}); 
        if(type==='PRODUCT') setFormDataSP({...formDataSP,anh:compressedImg}); 
        if(type==='BANNER') setFormBanner({...formBanner,img:compressedImg}); 
        if(type==='QR') setShopConfig(p => ({...p, bankInfo: {...p.bankInfo, qrImage: compressedImg}})); 
        if(type==='NEWS') setFormTinTuc({...formTinTuc, anh:compressedImg}); 
        setIsUploading(false);
    };
  };

  const handleExportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(dsSanPham); const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "SP"); XLSX.writeFile(wb, "SanPham.xlsx");
  };

  const handleImportExcel = (e) => { /* Logic import đã định nghĩa ở các bản trước */ };

  const handleUpdateStatusOrder = async (id, status) => { await updateDoc(doc(db, "donHang", id), {trangThai: status}); };
  const handleDeleteOrder = async (id) => { if(confirm("Xóa đơn hàng?")) await deleteDoc(doc(db, "donHang", id)); };

  if (loadingAuth) return <div className="text-center py-5"><Spinner animation="border" variant="success" /></div>;

  if (!isLoggedIn) return (
    <div className="admin-login-wrapper">
      <div className="admin-login-card shadow-lg border-0">
        <h3 className="text-center text-success fw-bold mb-4">QUẢN TRỊ HỆ THỐNG</h3>
        <Form onSubmit={handleLogin}>
          <Form.Group className="mb-3"><Form.Label className="small fw-bold">Email Admin</Form.Label><Form.Control className="p-3" type="email" value={loginInput.email} onChange={e=>setLoginInput({...loginInput, email:e.target.value})} required /></Form.Group>
          <Form.Group className="mb-4"><Form.Label className="small fw-bold">Mật khẩu</Form.Label><InputGroup><Form.Control className="p-3" type={showPass?"text":"password"} value={loginInput.pass} onChange={e=>setLoginInput({...loginInput, pass:e.target.value})} required /><Button variant="outline-secondary" onClick={()=>setShowPass(!showPass)}><i className={showPass?"fa-solid fa-eye-slash":"fa-solid fa-eye"}></i></Button></InputGroup></Form.Group>
          <Button type="submit" variant="success" className="w-100 py-3 fw-bold rounded-pill">ĐĂNG NHẬP</Button>
        </Form>
      </div>
    </div>
  );

  return (
    <div style={{background: '#f8f9fa', minHeight:'100vh'}}>
      <div className="admin-header">
          <h4 className="m-0 fw-bold"><i className="fa-solid fa-user-shield me-2"></i> QUẢN TRỊ VIÊN</h4>
          <Button variant="danger" size="sm" className="fw-bold px-3 shadow-sm" onClick={handleLogout}>Thoát</Button>
      </div>
      
      <Container fluid className="p-3">
        <Tabs defaultActiveKey="dashboard" className="bg-white p-2 rounded border shadow-sm mb-3">
          
          <Tab eventKey="dashboard" title="📊 TỔNG QUAN">
            <div className="p-3">
              <Row className="g-3 mb-4">
                <Col md={3}><div className="p-3 bg-primary text-white rounded shadow-sm"><h5>Tổng đơn</h5><h2 className="fw-bold">{dsDonHang.length}</h2></div></Col>
                <Col md={3}><div className="p-3 bg-success text-white rounded shadow-sm"><h5>Doanh thu</h5><h2 className="fw-bold">{dsDonHang.reduce((a,b)=>a+(b.tongTien||0),0).toLocaleString()} ¥</h2></div></Col>
                <Col md={3}><div className="p-3 bg-warning text-dark rounded shadow-sm"><h5>Sản phẩm</h5><h2 className="fw-bold">{dsSanPham.length}</h2></div></Col>
                <Col md={3}><div className="p-3 bg-info text-white rounded shadow-sm"><h5>Thành viên</h5><h2 className="fw-bold">{dsUser.length}</h2></div></Col>
              </Row>
            </div>
          </Tab>

          <Tab eventKey="products" title="📦 SẢN PHẨM">
            <div className="p-3">
                <div className="d-flex gap-2 mb-3">
                    <Button variant="success" onClick={()=>{setEditData({sp:null}); setFormDataSP({ ten:'', giaGoc:'', phanTramGiam:0, giaBan:'', donVi:'Cái', soLuong:100, moTa:'', anh:'', phanLoai:'', isMoi:false, isKhuyenMai:false, isBanChay:false, isFlashSale:false }); setModal({...modal, sp:true})}}>+ Thêm mới</Button>
                    <Button variant="outline-success" onClick={handleExportExcel}>Xuất Excel</Button>
                </div>
                <Table bordered hover className="align-middle">
                    <thead><tr><th>Ảnh</th><th>Tên</th><th>Giá</th><th>Xử lý</th></tr></thead>
                    <tbody>{dsSanPham.map(sp=>(<tr key={sp.id}><td><img src={sp.anh||NO_IMAGE} width="40" height="40" style={{objectFit:'cover'}}/></td><td>{sp.ten}</td><td className="text-danger fw-bold">{sp.giaBan?.toLocaleString()}¥</td><td><Button size="sm" variant="warning" onClick={()=>{setEditData({sp}); setFormDataSP(sp); setModal({...modal, sp:true})}}>✏️</Button></td></tr>))}</tbody>
                </Table>
            </div>
          </Tab>

          <Tab eventKey="orders" title="📋 ĐƠN HÀNG">
             <div className="p-3"><Table bordered hover><thead><tr><th>Mã</th><th>Khách hàng</th><th>Tổng</th><th>Trạng thái</th><th>Chi tiết</th></tr></thead><tbody>{dsDonHang.map(dh=>(<tr key={dh.id}><td>#{dh.maDonHang}</td><td>{dh.khachHang?.ten}</td><td className="fw-bold">{dh.tongTien?.toLocaleString()}¥</td><td><Form.Select size="sm" value={dh.trangThai} onChange={e=>handleUpdateStatusOrder(dh.id, e.target.value)}><option>Mới đặt</option><option>Đang giao</option><option>Hoàn thành</option><option>Đã hủy</option></Form.Select></td><td><Button size="sm" variant="info" onClick={()=>{setSelectedOrder(dh); setModal({...modal, order:true})}}>Xem</Button></td></tr>))}</tbody></Table></div>
          </Tab>

          <Tab eventKey="marketing" title="🎟️ SHIP & COUPON">
             <Row className="p-2">
                <Col md={6}><Card className="p-3 shadow-sm"><h6>MÃ GIẢM GIÁ</h6>{/* Logic mã giảm giá */}</Card></Col>
                <Col md={6}><Card className="p-3 shadow-sm"><h6>PHÍ VẬN CHUYỂN</h6>{/* Logic phí ship */}</Card></Col>
             </Row>
          </Tab>

          <Tab eventKey="news" title="📰 TIN TỨC">
             <div className="p-3"><Button variant="success" className="mb-3" onClick={()=>{setEditData({news:null}); setFormTinTuc({tieuDe:'', anh:'', tomTat:'', noiDung:''}); setModal({...modal, news:true})}}>+ Viết bài mới</Button><Table bordered hover><thead><tr><th>Ảnh</th><th>Tiêu đề</th><th>Xử lý</th></tr></thead><tbody>{dsTinTuc.map(tin=>(<tr key={tin.id}><td><img src={tin.anh||NO_IMAGE} width="50"/></td><td>{tin.tieuDe}</td><td><Button size="sm" variant="warning" onClick={()=>{setEditData({news:tin}); setFormTinTuc(tin); setModal({...modal, news:true})}}>✏️</Button></td></tr>))}</tbody></Table></div>
          </Tab>

          <Tab eventKey="users" title="👥 THÀNH VIÊN & ĐÁNH GIÁ">
            <Row className="p-2">
              <Col md={7}><Card className="p-3 shadow-sm"><h6>DANH SÁCH THÀNH VIÊN</h6><Table size="sm" hover><thead><tr><th>Tên</th><th>Điểm</th><th>Xử lý</th></tr></thead><tbody>{dsUser.map(u=><tr key={u.id}><td>{u.ten}</td><td className="text-warning fw-bold">{u.diemTichLuy}</td><td><Button size="sm" onClick={()=>{setEditData({user:u}); setUserPoint(u.diemTichLuy); setModal({...modal, user:true})}}>✏️</Button></td></tr>)}</tbody></Table></Card></Col>
              <Col md={5}><Card className="p-3 shadow-sm"><h6>ĐÁNH GIÁ MỚI</h6><div style={{maxHeight:400,overflowY:'auto'}}>{dsReview.map(r=><div key={r.id} className="border-bottom py-2"><strong>{r.userName}</strong> - {r.rating}⭐<p className="small mb-0">{r.comment}</p></div>)}</div></Card></Col>
            </Row>
          </Tab>

          <Tab eventKey="system" title="🔐 QUYỀN & MẬT KHẨU">
             <Row className="p-3 g-4">
                <Col md={6}><Card className="p-3 shadow-sm h-100"><h6>ADMIN WHITELIST</h6><InputGroup className="mb-3"><Form.Control placeholder="Email admin..." value={newAdminEmail} onChange={e=>setNewAdminEmail(e.target.value)}/><Button variant="success" onClick={handleAddAdmin}>Thêm</Button></InputGroup><Table size="sm" bordered hover><thead><tr><th>Email</th><th>Xóa</th></tr></thead><tbody>{adminWhitelist.map((email, i)=>(<tr key={i}><td>{email}</td><td className="text-center"><Button variant="link" className="text-danger p-0" onClick={()=>handleRemoveAdmin(email)}><i className="fa-solid fa-trash"></i></Button></td></tr>))}</tbody></Table></Card></Col>
                <Col md={6}><Card className="p-3 shadow-sm h-100"><h6>ĐỔI MẬT KHẨU ADMIN</h6><Form onSubmit={handleUpdatePassword}><Form.Group className="mb-3"><Form.Label className="small fw-bold">Mật khẩu mới</Form.Label><Form.Control type="password" value={passData.newPass} onChange={e=>setPassData({...passData, newPass:e.target.value})} required /></Form.Group><Form.Group className="mb-3"><Form.Label className="small fw-bold">Xác nhận</Form.Label><Form.Control type="password" value={passData.confirmPass} onChange={e=>setPassData({...passData, confirmPass:e.target.value})} required /></Form.Group><Button type="submit" variant="warning" className="w-100 fw-bold">CẬP NHẬT</Button></Form></Card></Col>
             </Row>
          </Tab>

          <Tab eventKey="config" title="⚙️ CẤU HÌNH SHOP">
             <div className="p-3">
                <Row><Col md={6}><Form.Group className="mb-3"><Form.Label className="fw-bold small">Tên Shop</Form.Label><Form.Control value={shopConfig.tenShop} onChange={e=>setShopConfig({...shopConfig, tenShop:e.target.value})}/></Form.Group><Form.Group className="mb-3"><Form.Label className="fw-bold small">Logo</Form.Label><Form.Control type="file" onChange={e=>handleUpload(e,'LOGO')}/></Form.Group></Col><Col md={6}><Form.Group className="mb-3"><Form.Label className="fw-bold small">Hotline</Form.Label><Form.Control value={shopConfig.sdt} onChange={e=>setShopConfig({...shopConfig, sdt:e.target.value})}/></Form.Group><Form.Group className="mb-3"><Form.Label className="fw-bold small">Địa chỉ</Form.Label><Form.Control value={shopConfig.diaChi} onChange={e=>setShopConfig({...shopConfig, diaChi:e.target.value})}/></Form.Group></Col></Row>
                <div className="d-flex gap-2"><Button variant="outline-primary" onClick={() => openPostEditor('policy')}>Soạn Chính Sách</Button><Button variant="outline-primary" onClick={() => openPostEditor('guide')}>Soạn Hướng Dẫn</Button><Button variant="success" className="px-5 shadow" onClick={luuCauHinh}>LƯU CẤU HÌNH</Button></div>
             </div>
          </Tab>
        </Tabs>
      </Container>

      {/* MODAL SẢN PHẨM */}
      <Modal show={modal.sp} onHide={()=>setModal({...modal,sp:false})} size="xl" centered><Modal.Header closeButton className="bg-success text-white"><Modal.Title>{editData.sp?'Sửa SP':'Thêm mới'}</Modal.Title></Modal.Header><Modal.Body className="bg-light"><Form><Row><Col md={8}><Card className="p-3 mb-3 shadow-sm border-0"><Form.Group className="mb-3"><Form.Label className="fw-bold small">Tên SP</Form.Label><Form.Control value={formDataSP.ten} onChange={e=>setFormDataSP({...formDataSP, ten:e.target.value})}/></Form.Group><Row><Col md={6}><Form.Group className="mb-3"><Form.Label className="fw-bold small">Giá Gốc</Form.Label><Form.Control type="number" value={formDataSP.giaGoc} onChange={e=>setFormDataSP({...formDataSP, giaGoc:e.target.value})}/></Form.Group></Col><Col md={6}><Form.Group className="mb-3"><Form.Label className="fw-bold small">% Giảm</Form.Label><Form.Control type="number" value={formDataSP.phanTramGiam} onChange={e=>setFormDataSP({...formDataSP, phanTramGiam:e.target.value})}/></Form.Group></Col></Row><ReactQuill theme="snow" value={formDataSP.moTa} onChange={v=>setFormDataSP({...formDataSP, moTa:v})} style={{height:200, marginBottom:50}}/></Card></Col><Col md={4}><Card className="p-3 text-center shadow-sm border-0"><img src={formDataSP.anh||NO_IMAGE} className="img-fluid mb-2"/><Form.Control type="file" onChange={e=>handleUpload(e,'PRODUCT')}/></Card></Col></Row></Form></Modal.Body><Modal.Footer><Button onClick={onSaveSP} variant="success">LƯU SẢN PHẨM</Button></Modal.Footer></Modal>

      {/* MODAL TIN TỨC */}
      <Modal show={modal.news} onHide={()=>setModal({...modal,news:false})} size="xl" centered><Modal.Header closeButton><Modal.Title>Bài viết</Modal.Title></Modal.Header><Modal.Body><Form><Form.Group className="mb-3"><Form.Label>Tiêu đề</Form.Label><Form.Control value={formTinTuc.tieuDe} onChange={e=>setFormTinTuc({...formTinTuc, tieuDe:e.target.value})}/></Form.Group><ReactQuill theme="snow" value={formTinTuc.noiDung} onChange={v=>setFormTinTuc({...formTinTuc, noiDung:v})} style={{height:300, marginBottom:50}}/></Form></Modal.Body><Modal.Footer><Button onClick={onSaveNews} variant="success">ĐĂNG BÀI</Button></Modal.Footer></Modal>

      {/* MODAL CHÍNH SÁCH / HƯỚNG DẪN */}
      <Modal show={modal.post} onHide={()=>setModal({...modal,post:false})} size="xl" centered><Modal.Header closeButton><Modal.Title>{postEditor.title}</Modal.Title></Modal.Header><Modal.Body><ReactQuill theme="snow" value={postEditor.content} onChange={v=>setPostEditor({...postEditor, content:v})} style={{height:400, marginBottom:50}}/></Modal.Body><Modal.Footer><Button onClick={savePostContent} variant="primary">XÁC NHẬN (LƯU TẠM)</Button></Modal.Footer></Modal>

      {/* MODAL CHI TIẾT ĐƠN HÀNG */}
      <Modal show={modal.order} onHide={()=>setModal({...modal,order:false})} size="lg" centered><Modal.Header closeButton className="bg-success text-white"><Modal.Title>Chi tiết đơn hàng #{selectedOrder?.maDonHang}</Modal.Title></Modal.Header><Modal.Body>{selectedOrder && (<div><Row><Col md={6}><p>Khách: <strong>{selectedOrder.khachHang?.ten}</strong></p><p>SĐT: {selectedOrder.khachHang?.sdt}</p></Col><Col md={6}><p>Địa chỉ: {selectedOrder.khachHang?.diachi}</p></Col></Row><Table bordered size="sm"><thead><tr><th>Sản phẩm</th><th>SL</th><th>Thành tiền</th></tr></thead><tbody>{selectedOrder.gioHang?.map((i,x)=>(<tr key={x}><td>{i.ten}</td><td>{i.soLuong}</td><td>{(i.giaBan*i.soLuong).toLocaleString()} ¥</td></tr>))}</tbody></Table><h5>Tổng: <span className="text-danger">{selectedOrder.tongTien?.toLocaleString()} ¥</span></h5></div>)}</Modal.Body></Modal>

      {/* MODAL SỬA ĐIỂM THÀNH VIÊN */}
      <Modal show={modal.user} onHide={()=>setModal({...modal,user:false})} centered><Modal.Header closeButton><Modal.Title>Sửa điểm thưởng</Modal.Title></Modal.Header><Modal.Body><Form.Group><Form.Label>Điểm tích lũy</Form.Label><Form.Control type="number" value={userPoint} onChange={e=>setUserPoint(e.target.value)}/></Form.Group></Modal.Body><Modal.Footer><Button onClick={async()=>{await updateDoc(doc(db,"users",editData.user.id),{diemTichLuy:parseInt(userPoint)}); setModal({...modal,user:false}); toast.success("Đã cập nhật điểm!");}}>Lưu</Button></Modal.Footer></Modal>

    </div>
  );
}

export default Admin;