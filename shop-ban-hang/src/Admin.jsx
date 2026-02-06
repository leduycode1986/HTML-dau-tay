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
  // --- 1. STATES QUẢN LÝ QUYỀN HẠN ---
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [loginInput, setLoginInput] = useState({ email: '', pass: '' });
  const [showPass, setShowPass] = useState(false);
  const [adminWhitelist, setAdminWhitelist] = useState([]);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [passData, setPassData] = useState({ newPass: '', confirmPass: '' });

  // --- 2. STATES DỮ LIỆU (KHÔI PHỤC 100% TỪ BẢN GỐC CỦA BẠN) ---
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

  // --- 3. XÁC THỰC FIREBASE & WHITELIST ---
  useEffect(() => {
    const unsubWhitelist = onSnapshot(doc(db, "cauHinh", "phanquyen"), (d) => {
      if (d.exists()) setAdminWhitelist(d.data().adminEmails || []);
    });

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const docSnap = await getDoc(doc(db, "cauHinh", "phanquyen"));
        const whitelist = docSnap.data()?.adminEmails || [];
        if (whitelist.includes(user.email)) {
          setIsLoggedIn(true);
        } else {
          toast.error("Bạn không có quyền quản trị!");
          await signOut(auth);
        }
      } else { setIsLoggedIn(false); }
      setLoadingAuth(false);
    });
    return () => { unsubWhitelist(); unsubscribeAuth(); };
  }, []);

  // --- 4. TẢI DỮ LIỆU REALTIME ---
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

  // --- 5. CÁC HÀM XỬ LÝ LOGIC ---
  const handleLogin = async (e) => { 
    e.preventDefault(); 
    try { await signInWithEmailAndPassword(auth, loginInput.email, loginInput.pass); toast.success("Chào Admin!"); } 
    catch (error) { toast.error("Sai tài khoản hoặc mật khẩu!"); }
  };

  const handleLogout = async () => { if(confirm("Đăng xuất?")) { await signOut(auth); setIsLoggedIn(false); } };

  const luuCauHinh = async () => { await setDoc(doc(db, "cauHinh", "thongTinChung"), shopConfig); toast.success("Đã lưu cấu hình!"); };
  
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
  
  const onSaveSP = async () => { 
    const data = { ...formDataSP, slug: toSlug(formDataSP.ten) };
    if (!editData.sp || !editData.sp.ngayTao) data.ngayTao = serverTimestamp();
    if(editData.sp) await updateDoc(doc(db, "sanPham", editData.sp.id), data);
    else await addDoc(collection(db, "sanPham"), data);
    setModal({...modal,sp:false}); toast.success("Đã lưu SP!");
  };

  const onSaveDM = async () => { 
    const data = {...formDM, slug: toSlug(formDM.ten)};
    if(editData.dm) await updateDoc(doc(db, "danhMuc", editData.dm.id), data);
    else await addDoc(collection(db, "danhMuc"), data);
    setModal({...modal,dm:false}); 
  };

  const onSaveNews = async () => {
    const data = { ...formTinTuc, slug: toSlug(formTinTuc.tieuDe), ngayDang: serverTimestamp() };
    if (editData.news) await updateDoc(doc(db, "tinTuc", editData.news.id), data);
    else await addDoc(collection(db, "tinTuc"), data);
    setModal({...modal, news: false}); toast.success("Đã đăng bài!");
  };

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

  const handleUpdateStatusOrder = async (id, status) => { await updateDoc(doc(db, "donHang", id), {trangThai: status}); };
  const handleDeleteOrder = async (id) => { if(confirm("Xóa đơn hàng?")) await deleteDoc(doc(db, "donHang", id)); };

  const handleExportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(dsSanPham); const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "SP"); XLSX.writeFile(wb, "DanhSachSP.xlsx");
  };

  const handleImportExcel = (e) => {
    const file = e.target.files[0]; if(!file) return;
    const reader = new FileReader(); reader.readAsBinaryString(file);
    reader.onload = async (evt) => {
        const wb = XLSX.read(evt.target.result, {type:'binary'});
        const ws = wb.Sheets[wb.SheetNames[0]]; const data = XLSX.utils.sheet_to_json(ws);
        if(!confirm(`Cập nhật ${data.length} SP?`)) return;
        const ups = data.map(row => {
            const id = row["ID"] || row["ID (Không sửa)"]; if(!id) return null;
            return updateDoc(doc(db, "sanPham", id), { giaGoc: row["Giá gốc"], soLuong: row["Kho"], ten: row["Tên sản phẩm"] });
        });
        await Promise.all(ups.filter(x=>x)); toast.success("Đã xong!");
    };
  };

  const handleAddAdmin = async () => {
    if (!newAdminEmail.includes('@')) return toast.error("Email sai!");
    await updateDoc(doc(db, "cauHinh", "phanquyen"), { adminEmails: [...adminWhitelist, newAdminEmail] });
    setNewAdminEmail(''); toast.success("Đã thêm!");
  };

  const handleRemoveAdmin = async (email) => {
    if (adminWhitelist.length <= 1) return toast.warning("Phải giữ lại 1 admin!");
    if (confirm(`Xóa ${email}?`)) await updateDoc(doc(db, "cauHinh", "phanquyen"), { adminEmails: adminWhitelist.filter(e => e !== email) });
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault(); if (passData.newPass !== passData.confirmPass) return toast.error("Không khớp!");
    try { await updatePassword(auth.currentUser, passData.newPass); toast.success("Xong!"); } catch (e) { toast.error(e.message); }
  };

  const currentProducts = dsSanPham.filter(sp => {
    if (filterCategory && sp.phanLoai !== filterCategory) return false;
    if (filterStatus === 'stock_out' && sp.soLuong > 0) return false;
    return true;
  }).slice((currentPage-1)*itemsPerPage, currentPage*itemsPerPage);

  // --- 6. GIAO DIỆN ---
  if (loadingAuth) return <div className="text-center py-5"><Spinner animation="border" variant="success" /></div>;

  if (!isLoggedIn) return (
    <div className="admin-login-wrapper">
      <div className="admin-login-card shadow-lg border-0">
        <h3 className="text-center text-success fw-bold mb-4">QUẢN TRỊ VIÊN</h3>
        <Form onSubmit={handleLogin}>
          <Form.Group className="mb-3"><Form.Label className="small fw-bold">Email</Form.Label><Form.Control className="p-3" type="email" value={loginInput.email} onChange={e=>setLoginInput({...loginInput, email:e.target.value})} required /></Form.Group>
          <Form.Group className="mb-4"><Form.Label className="small fw-bold">Mật khẩu</Form.Label><InputGroup><Form.Control className="p-3" type={showPass?"text":"password"} value={loginInput.pass} onChange={e=>setLoginInput({...loginInput, pass:e.target.value})} required /><Button variant="outline-secondary" onClick={()=>setShowPass(!showPass)}><i className={showPass?"fa-solid fa-eye-slash":"fa-solid fa-eye"}></i></Button></InputGroup></Form.Group>
          <Button type="submit" variant="success" className="w-100 py-3 fw-bold rounded-pill shadow">ĐĂNG NHẬP</Button>
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
              <Row>
                <Col md={6}>
                  <Card className="shadow-sm border-0"><Card.Header className="bg-white fw-bold text-danger">⚠️ SẮP HẾT HÀNG</Card.Header><Card.Body><Table size="sm" hover><thead><tr><th>Tên</th><th>Kho</th></tr></thead><tbody>{dsSanPham.filter(sp=>sp.soLuong<=5).map(sp=>(<tr key={sp.id}><td>{sp.ten}</td><td className="text-danger fw-bold">{sp.soLuong}</td></tr>))}</tbody></Table></Card.Body></Card>
                </Col>
                <Col md={6}>
                  <Card className="shadow-sm border-0"><Card.Header className="bg-white fw-bold text-primary">📦 ĐƠN MỚI NHẤT</Card.Header><Card.Body>{dsDonHang.sort((a,b)=>b.ngayDat-a.ngayDat).slice(0,5).map(dh=>(<div key={dh.id} className="d-flex justify-content-between border-bottom py-2"><span>{dh.khachHang?.ten}</span><span className="text-success fw-bold">{dh.tongTien?.toLocaleString()} ¥</span></div>))}</Card.Body></Card>
                </Col>
              </Row>
            </div>
          </Tab>

          <Tab eventKey="products" title="📦 SẢN PHẨM">
            <div className="p-3">
                <div className="d-flex justify-content-between mb-3">
                    <div className="d-flex gap-2">
                        <Button variant="success" onClick={()=>{setEditData({sp:null}); setFormDataSP({ ten:'', giaGoc:'', phanTramGiam:0, giaBan:'', donVi:'Cái', soLuong:100, moTa:'', anh:'', phanLoai:'', isMoi:false, isKhuyenMai:false, isBanChay:false, isFlashSale:false }); setModal({...modal, sp:true})}}>+ Thêm mới</Button>
                        <Button variant="outline-success" onClick={handleExportExcel}>Xuất Excel</Button>
                        <div className="position-relative"><Button variant="outline-primary">Nhập Excel</Button><input type="file" accept=".xlsx" onChange={handleImportExcel} style={{position:'absolute', top:0, left:0, opacity:0, width:'100%'}}/></div>
                    </div>
                    <div className="d-flex gap-2">
                        <Form.Select size="sm" value={filterCategory} onChange={e=>setFilterCategory(e.target.value)}><option value="">Tất cả danh mục</option>{dsDanhMuc.map(d=><option key={d.id} value={d.id}>{d.ten}</option>)}</Form.Select>
                        <Form.Select size="sm" value={sortPrice} onChange={e=>setSortPrice(e.target.value)}><option value="newest">Mới nhất</option><option value="asc">Giá tăng</option><option value="desc">Giá giảm</option></Form.Select>
                    </div>
                </div>
                <Table bordered hover className="align-middle text-center">
                    <thead className="bg-light"><tr><th>Ảnh</th><th>Tên</th><th>Kho</th><th>Giá</th><th>Xử lý</th></tr></thead>
                    <tbody>{currentProducts.map(sp=>(<tr key={sp.id}><td><img src={sp.anh||NO_IMAGE} width="40" height="40" style={{objectFit:'cover'}}/></td><td className="text-start">{sp.ten}</td><td>{sp.soLuong}</td><td className="text-danger fw-bold">{sp.giaBan?.toLocaleString()}¥</td><td><Button size="sm" variant="warning" onClick={()=>{setEditData({sp}); setFormDataSP(sp); setModal({...modal, sp:true})}}>Sửa</Button><Button size="sm" variant="danger" className="ms-1" onClick={()=>del('sanPham',sp.id)}>Xóa</Button></td></tr>))}</tbody>
                </Table>
                <Pagination className="justify-content-center">{[...Array(Math.ceil(dsSanPham.length/itemsPerPage))].map((_, i) => (<Pagination.Item key={i+1} active={i+1 === currentPage} onClick={() => setCurrentPage(i+1)}>{i+1}</Pagination.Item>))}</Pagination>
            </div>
          </Tab>

          <Tab eventKey="orders" title="📋 ĐƠN HÀNG">
             <div className="p-3"><Table bordered hover><thead><tr><th>Mã</th><th>Khách hàng</th><th>Tổng</th><th>Trạng thái</th><th>Xử lý</th></tr></thead><tbody>{dsDonHang.map(dh=>(<tr key={dh.id}><td>#{dh.maDonHang}</td><td>{dh.khachHang?.ten}</td><td className="fw-bold">{dh.tongTien?.toLocaleString()}¥</td><td><Form.Select size="sm" value={dh.trangThai} onChange={e=>handleUpdateStatusOrder(dh.id, e.target.value)}><option>Mới đặt</option><option>Đang giao</option><option>Hoàn thành</option><option>Đã hủy</option></Form.Select></td><td><Button size="sm" variant="info" onClick={()=>{setSelectedOrder(dh); setModal({...modal, order:true})}}>Xem</Button></td></tr>))}</tbody></Table></div>
          </Tab>

          <Tab eventKey="marketing" title="🎟️ SHIP & COUPON">
             <Row className="p-3 g-3">
                <Col md={6}><div className="bg-white p-3 shadow-sm rounded border"><h6>MÃ GIẢM GIÁ</h6>
                    <div className="d-flex gap-1 mb-2"><Form.Control placeholder="Mã" value={formCoupon.code} onChange={e=>setFormCoupon({...formCoupon,code:e.target.value.toUpperCase()})}/><Form.Control type="number" placeholder="¥" value={formCoupon.giamGia} onChange={e=>setFormCoupon({...formCoupon,giamGia:e.target.value})}/><Button size="sm" onClick={()=>{add('coupons',formCoupon); setFormCoupon({code:'',giamGia:0})}}>Thêm</Button></div>
                    <Table size="sm"><tbody>{dsCoupon.map(c=><tr key={c.id}><td>{c.code}</td><td>{c.giamGia}¥</td><td><Button size="sm" variant="danger" onClick={()=>del('coupons',c.id)}>x</Button></td></tr>)}</tbody></Table>
                </div></Col>
                <Col md={6}><div className="bg-white p-3 shadow-sm rounded border"><h6>PHÍ VẬN CHUYỂN</h6>
                    <div className="d-flex gap-1 mb-2"><Form.Control placeholder="Khu vực" value={formShip.khuVuc} onChange={e=>setFormShip({...formShip,khuVuc:e.target.value})}/><Form.Control type="number" placeholder="¥" value={formShip.phi} onChange={e=>setFormShip({...formShip,phi:e.target.value})}/><Button size="sm" onClick={()=>{add('shipping',formShip); setFormShip({khuVuc:'',phi:0})}}>Thêm</Button></div>
                    <Table size="sm"><tbody>{dsShip.map(s=><tr key={s.id}><td>{s.khuVuc}</td><td>{s.phi}¥</td><td><Button size="sm" variant="danger" onClick={()=>del('shipping',s.id)}>x</Button></td></tr>)}</tbody></Table>
                </div></Col>
             </Row>
          </Tab>

          <Tab eventKey="news" title="📰 TIN TỨC">
             <div className="p-3"><Button variant="success" className="mb-3" onClick={()=>{setEditData({news:null}); setFormTinTuc({tieuDe:'', anh:'', tomTat:'', noiDung:''}); setModal({...modal, news:true})}}>+ Viết bài mới</Button><Table bordered hover><thead><tr><th>Ảnh</th><th>Tiêu đề</th><th>Xử lý</th></tr></thead><tbody>{dsTinTuc.map(tin=>(<tr key={tin.id}><td><img src={tin.anh} width="50" style={{objectFit:'cover'}}/></td><td>{tin.tieuDe}</td><td><Button size="sm" variant="warning" onClick={()=>{setEditData({news:tin}); setFormTinTuc(tin); setModal({...modal, news:true})}}>Sửa</Button><Button size="sm" variant="danger" className="ms-1" onClick={()=>del('tinTuc', tin.id)}>Xóa</Button></td></tr>))}</tbody></Table></div>
          </Tab>

          <Tab eventKey="users" title="👥 THÀNH VIÊN & ĐÁNH GIÁ">
            <Row className="p-3 g-3">
              <Col md={7}><Card className="shadow-sm border-0"><h6>DANH SÁCH THÀNH VIÊN</h6><Table size="sm" hover><thead><tr><th>Tên</th><th>Điểm</th><th>Xử lý</th></tr></thead><tbody>{dsUser.map(u=><tr key={u.id}><td>{u.ten}</td><td className="text-warning fw-bold">{u.diemTichLuy}</td><td><Button size="sm" onClick={()=>{setEditData({user:u}); setUserPoint(u.diemTichLuy); setModal({...modal, user:true})}}>✏️</Button></td></tr>)}</tbody></Table></Card></Col>
              <Col md={5}><Card className="shadow-sm border-0"><h6>ĐÁNH GIÁ MỚI</h6><div style={{maxHeight:400,overflowY:'auto'}}>{dsReview.map(r=><div key={r.id} className="border-bottom py-2"><strong>{r.userName}</strong> - {r.rating}⭐<p className="small mb-0">{r.comment}</p><Button size="sm" variant="link" className="text-danger p-0" onClick={()=>del('reviews', r.id)}>Xóa</Button></div>)}</div></Card></Col>
            </Row>
          </Tab>

          <Tab eventKey="system" title="🔐 QUYỀN & MẬT KHẨU">
             <Row className="p-3 g-4">
                <Col md={6}><Card className="p-3 shadow-sm h-100"><h6>ADMIN WHITELIST</h6><InputGroup className="mb-3"><Form.Control placeholder="Email admin mới..." value={newAdminEmail} onChange={e=>setNewAdminEmail(e.target.value)}/><Button variant="success" onClick={handleAddAdmin}>Thêm</Button></InputGroup><Table size="sm" bordered hover><thead><tr><th>Email</th><th>Xử lý</th></tr></thead><tbody>{adminWhitelist.map((email, i)=>(<tr key={i}><td>{email}</td><td className="text-center"><Button variant="link" className="text-danger p-0" onClick={()=>handleRemoveAdmin(email)}><i className="fa-solid fa-trash-can"></i></Button></td></tr>))}</tbody></Table></Card></Col>
                <Col md={6}><Card className="p-3 shadow-sm h-100"><h6>ĐỔI MẬT KHẨU ADMIN</h6><Form onSubmit={handleUpdatePassword}><Form.Group className="mb-3"><Form.Label className="small fw-bold">Mật khẩu mới</Form.Label><Form.Control type="password" value={passData.newPass} onChange={e=>setPassData({...passData, newPass:e.target.value})} required /></Form.Group><Form.Group className="mb-3"><Form.Label className="small fw-bold">Xác nhận mật khẩu</Form.Label><Form.Control type="password" value={passData.confirmPass} onChange={e=>setPassData({...passData, confirmPass:e.target.value})} required /></Form.Group><Button type="submit" variant="warning" className="w-100 fw-bold">CẬP NHẬT NGAY</Button></Form></Card></Col>
             </Row>
          </Tab>

          <Tab eventKey="config" title="⚙️ CẤU HÌNH SHOP">
             <div className="p-4">
                <Row><Col md={6}><h6 className="text-success fw-bold">THÔNG TIN CHUNG</h6><Form.Group className="mb-3"><Form.Label>Tên Shop</Form.Label><Form.Control value={shopConfig.tenShop} onChange={e=>setShopConfig({...shopConfig, tenShop:e.target.value})}/></Form.Group><Form.Group className="mb-3"><Form.Label>Logo</Form.Label><Form.Control type="file" onChange={e=>handleUpload(e,'LOGO')}/></Form.Group><Form.Group className="mb-3"><Form.Label>Hotline</Form.Label><Form.Control value={shopConfig.sdt} onChange={e=>setShopConfig({...shopConfig, sdt:e.target.value})}/></Form.Group><Form.Group className="mb-3"><Form.Label>Fax</Form.Label><Form.Control value={shopConfig.fax} onChange={e=>setShopConfig({...shopConfig, fax:e.target.value})}/></Form.Group></Col>
                <Col md={6}><h6 className="text-primary fw-bold">THANH TOÁN & LIÊN KẾT</h6><Form.Group className="mb-3"><Form.Label>Ngân hàng</Form.Label><Form.Control value={shopConfig.bankInfo?.bankName} onChange={e=>setShopConfig({...shopConfig, bankInfo:{...shopConfig.bankInfo, bankName:e.target.value}})}/></Form.Group><Form.Group className="mb-3"><Form.Label>QR Thanh toán</Form.Label><Form.Control type="file" onChange={e=>handleUpload(e,'QR')}/></Form.Group><Form.Group className="mb-3"><Form.Label>Zalo</Form.Label><Form.Control value={shopConfig.zalo} onChange={e=>setShopConfig({...shopConfig, zalo:e.target.value})}/></Form.Group></Col></Row>
                <hr/><div className="d-flex gap-2"><Button variant="outline-primary" onClick={() => openPostEditor('policy')}>Soạn Chính Sách</Button><Button variant="outline-primary" onClick={() => openPostEditor('guide')}>Soạn Hướng Dẫn</Button><Button variant="success" className="px-5 shadow" onClick={luuCauHinh}>LƯU CẤU HÌNH</Button></div>
             </div>
          </Tab>
        </Tabs>
      </Container>

      {/* --- MODALS (KHÔI PHỤC TOÀN BỘ) --- */}
      <Modal show={modal.sp} onHide={()=>setModal({...modal,sp:false})} size="xl" centered><Modal.Header closeButton className="bg-success text-white"><Modal.Title>{editData.sp?'Cập nhật SP':'Thêm SP'}</Modal.Title></Modal.Header><Modal.Body className="bg-light"><Form><Row><Col md={8}><Card className="p-3 mb-3 shadow-sm border-0"><Form.Group className="mb-3"><Form.Label className="fw-bold small">Tên sản phẩm</Form.Label><Form.Control value={formDataSP.ten} onChange={e=>setFormDataSP({...formDataSP, ten:e.target.value})}/></Form.Group><Row><Col md={6}><Form.Group className="mb-3"><Form.Label className="fw-bold small">Giá Gốc</Form.Label><Form.Control type="number" value={formDataSP.giaGoc} onChange={e=>setFormDataSP({...formDataSP, giaGoc:e.target.value})}/></Form.Group></Col><Col md={6}><Form.Group className="mb-3"><Form.Label className="fw-bold small">% Giảm</Form.Label><Form.Control type="number" value={formDataSP.phanTramGiam} onChange={e=>setFormDataSP({...formDataSP, phanTramGiam:e.target.value})}/></Form.Group></Col></Row><ReactQuill theme="snow" value={formDataSP.moTa} onChange={v=>setFormDataSP({...formDataSP, moTa:v})} style={{height:200, marginBottom:50}}/></Card></Col><Col md={4}><Card className="p-3 text-center shadow-sm border-0"><img src={formDataSP.anh||NO_IMAGE} className="img-fluid rounded mb-2"/><Form.Control type="file" onChange={e=>handleUpload(e,'PRODUCT')}/></Card></Col></Row></Form></Modal.Body><Modal.Footer><Button onClick={onSaveSP} variant="success">LƯU SẢN PHẨM</Button></Modal.Footer></Modal>

      <Modal show={modal.order} onHide={()=>setModal({...modal,order:false})} size="lg" centered><Modal.Header closeButton className="bg-success text-white"><Modal.Title>Chi tiết đơn hàng #{selectedOrder?.maDonHang}</Modal.Title></Modal.Header><Modal.Body>{selectedOrder && (<div><Row><Col md={6}><p>Khách: <strong>{selectedOrder.khachHang?.ten}</strong></p><p>SĐT: {selectedOrder.khachHang?.sdt}</p></Col><Col md={6}><p>Địa chỉ: {selectedOrder.khachHang?.diachi}</p></Col></Row><Table bordered size="sm"><thead><tr><th>Sản phẩm</th><th>SL</th><th>Giá</th></tr></thead><tbody>{selectedOrder.gioHang?.map((i,x)=>(<tr key={x}><td>{i.ten}</td><td>{i.soLuong}</td><td>{i.giaBan?.toLocaleString()} ¥</td></tr>))}</tbody></Table><h5>Tổng tiền: <span className="text-danger">{selectedOrder.tongTien?.toLocaleString()} ¥</span></h5></div>)}</Modal.Body></Modal>

      <Modal show={modal.news} onHide={()=>setModal({...modal,news:false})} size="xl" centered><Modal.Header closeButton><Modal.Title>Viết bài</Modal.Title></Modal.Header><Modal.Body><Form><Form.Group className="mb-3"><Form.Label>Tiêu đề</Form.Label><Form.Control value={formTinTuc.tieuDe} onChange={e=>setFormTinTuc({...formTinTuc, tieuDe:e.target.value})}/></Form.Group><ReactQuill theme="snow" value={formTinTuc.noiDung} onChange={v=>setFormTinTuc({...formTinTuc, noiDung:v})} style={{height:300, marginBottom:50}}/></Form></Modal.Body><Modal.Footer><Button onClick={onSaveNews} variant="success">ĐĂNG BÀI</Button></Modal.Footer></Modal>

      <Modal show={modal.post} onHide={()=>setModal({...modal,post:false})} size="xl" centered><Modal.Header closeButton><Modal.Title>{postEditor.title}</Modal.Title></Modal.Header><Modal.Body><ReactQuill theme="snow" value={postEditor.content} onChange={v=>setPostEditor({...postEditor, content:v})} style={{height:400, marginBottom:50}}/></Modal.Body><Modal.Footer><Button onClick={savePostContent} variant="primary">Xác nhận</Button></Modal.Footer></Modal>

      <Modal show={modal.user} onHide={()=>setModal({...modal,user:false})} centered><Modal.Header closeButton><Modal.Title>Sửa điểm</Modal.Title></Modal.Header><Modal.Body><Form.Group><Form.Label>Điểm tích lũy</Form.Label><Form.Control type="number" value={userPoint} onChange={e=>setUserPoint(e.target.value)}/></Form.Group></Modal.Body><Modal.Footer><Button onClick={async()=>{await updateDoc(doc(db,"users",editData.user.id),{diemTichLuy:parseInt(userPoint)}); setModal({...modal,user:false}); toast.success("Đã cập nhật!");}}>Lưu</Button></Modal.Footer></Modal>
    </div>
  );
}

export default Admin;