import React, { useState, useEffect } from 'react';
import { Table, Button, Form, Modal, Badge, Tab, Tabs, Row, Col, Container, Card, InputGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { doc, setDoc, collection, onSnapshot, deleteDoc, updateDoc, addDoc } from 'firebase/firestore'; 
import { db } from './firebase'; 

const ICON_LIST = ['🏠','📦','🥩','🥦','🍎','🍞','🥫','❄️','🍬','🍫','🍪','🍦','🍺','🥤','🥛','🧃','🧺','🛋️','🍳','🧹','🧽','🧼','🧴','🪥','💄','🔖','⚡','🔥','🎉','🎁'];
const NO_IMAGE = "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg";

function Admin({ dsSanPham = [], handleUpdateDS_SP, dsDanhMuc = [], handleUpdateDS_DM, dsDonHang = [], handleUpdateStatusOrder, handleDeleteOrder }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginInput, setLoginInput] = useState({ user: '', pass: '' });
  const [showPass, setShowPass] = useState(false);

  const [adminConfig] = useState(() => {
    try { const s = JSON.parse(localStorage.getItem('adminConfig') || '{}'); return { user: s.user||s.username||'admin', pass: s.pass||s.password||'123' }; } catch { return { user: 'admin', pass: '123' }; }
  });

  const [shopConfig, setShopConfig] = useState({ 
    tenShop:'', slogan:'', logo:'', diaChi:'', sdt:'', zalo:'', linkFacebook:'', copyright:'', tyLeDiem:1000, gioiThieu:'', flashSaleEnd:'', topBarText:'', openingHours:'',
    bankInfo: { bankName: '', accountNum: '', accountName: '', bankBranch: '', qrImage: '' } 
  });
  
  const [dsBanner, setDsBanner] = useState([]);
  const [dsCoupon, setDsCoupon] = useState([]);
  const [dsShip, setDsShip] = useState([]); 
  const [dsUser, setDsUser] = useState([]); 
  const [dsReview, setDsReview] = useState([]); 

  const [modal, setModal] = useState({ sp: false, dm: false, order: false, user: false });
  const [editData, setEditData] = useState({ sp: null, dm: null, user: null, order: null });
  const [formDataSP, setFormDataSP] = useState({});
  const [formDM, setFormDM] = useState({});
  const [formBanner, setFormBanner] = useState({ img:'', link:'' });
  const [formCoupon, setFormCoupon] = useState({ code:'', giamGia:0 });
  const [formShip, setFormShip] = useState({ khuVuc:'', phi:0 });
  const [userPoint, setUserPoint] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // ... (Giữ nguyên phần Thống kê & useEffect & Helper functions như cũ) ...
  // ĐỂ TIẾT KIỆM KHÔNG GIAN VÀ TRÁNH NHẦM LẪN, TÔI CHỈ PASTE PHẦN RENDER GIAO DIỆN QUAN TRỌNG

  // (Phần logic JS ở trên giữ nguyên như các bản trước)
  const thongKe = (() => { const today = new Date().toLocaleDateString('vi-VN'), m = new Date().getMonth()+1, y = new Date().getFullYear(); let dNgay=0, dThang=0, dNam=0; dsDonHang.forEach(dh => { if(!dh.ngayDat?.toDate) return; const d = dh.ngayDat.toDate(); if(d.toLocaleDateString('vi-VN')===today) dNgay+=dh.tongTien; if(d.getMonth()+1===m && d.getFullYear()===y) dThang+=dh.tongTien; if(d.getFullYear()===y) dNam+=dh.tongTien; }); return { dNgay, dThang, dNam, tongDon: dsDonHang.length }; })();
  useEffect(() => { if(isLoggedIn) { const unsubs = [ onSnapshot(doc(db, "cauHinh", "thongTinChung"), d => d.exists() && setShopConfig(prev=>({...prev, ...d.data()}))), onSnapshot(collection(db, "banners"), s => setDsBanner(s.docs.map(d=>({id:d.id,...d.data()})))), onSnapshot(collection(db, "coupons"), s => setDsCoupon(s.docs.map(d=>({id:d.id,...d.data()})))), onSnapshot(collection(db, "shipping"), s => setDsShip(s.docs.map(d=>({id:d.id,...d.data()})))), onSnapshot(collection(db, "users"), s => setDsUser(s.docs.map(d=>({id:d.id,...d.data()})))), onSnapshot(collection(db, "reviews"), s => setDsReview(s.docs.map(d=>({id:d.id,...d.data()})))) ]; return () => unsubs.forEach(u => u()); } }, [isLoggedIn]);
  const handleLogin = (e) => { e.preventDefault(); if(loginInput.user===adminConfig.user && loginInput.pass===adminConfig.pass) { localStorage.setItem('adminConfig', JSON.stringify(adminConfig)); setIsLoggedIn(true); } else alert(`Sai mật khẩu!`); };
  const luuCauHinh = async () => { await setDoc(doc(db, "cauHinh", "thongTinChung"), shopConfig); alert("Đã lưu cấu hình!"); };
  const handleUpload = (e, type) => { const f = e.target.files[0]; if(!f) return; const r = new FileReader(); r.onloadend=()=>{ 
    if(type==='LOGO') setShopConfig({...shopConfig,logo:r.result}); 
    if(type==='PRODUCT') setFormDataSP({...formDataSP,anh:r.result}); 
    if(type==='BANNER') setFormBanner({...formBanner,img:r.result});
    if(type==='QR') setShopConfig(p => ({...p, bankInfo: {...p.bankInfo, qrImage: r.result}})); // Xử lý upload QR
  }; r.readAsDataURL(f); };
  const add = async (col, d) => await addDoc(collection(db, col), d); const del = async (col, id) => confirm('Xóa?') && await deleteDoc(doc(db, col, id)); useEffect(() => { const g = parseInt(formDataSP.giaGoc)||0, p = parseInt(formDataSP.phanTramGiam)||0; setFormDataSP(prev => ({...prev, giaBan: g > 0 ? Math.floor(g*(1-p/100)) : ''})); }, [formDataSP.giaGoc, formDataSP.phanTramGiam]);

  if (!isLoggedIn) return (<div className="admin-login-wrapper"><div className="admin-login-card shadow"><h3 className="text-center text-success fw-bold mb-4">QUẢN TRỊ SHOP</h3><Form onSubmit={handleLogin}><Form.Group className="mb-3"><Form.Label>Tài khoản</Form.Label><Form.Control className="p-3" value={loginInput.user} onChange={e=>setLoginInput({...loginInput, user:e.target.value})}/></Form.Group><Form.Group className="mb-4"><Form.Label>Mật khẩu</Form.Label><InputGroup><Form.Control className="p-3" type={showPass?"text":"password"} value={loginInput.pass} onChange={e=>setLoginInput({...loginInput, pass:e.target.value})}/><Button variant="outline-secondary" onClick={()=>setShowPass(!showPass)}><i className={showPass?"fa-solid fa-eye-slash":"fa-solid fa-eye"}></i></Button></InputGroup></Form.Group><Button type="submit" variant="success" className="w-100 py-3 fw-bold rounded-pill">ĐĂNG NHẬP</Button></Form></div></div>);

  return (
    <div className="admin-main-container">
      <div className="admin-navbar"><h4>QUẢN TRỊ VIÊN</h4><Link to="/"><Button variant="danger" size="sm">Thoát</Button></Link></div>
      <Container fluid className="p-3">
        <Tabs defaultActiveKey="config" className="bg-white p-2 rounded border shadow-sm mb-3">
          <Tab eventKey="config" title="⚙️ CẤU HÌNH">
            <div className="bg-white p-4">
              <Row>
                <Col md={4} className="text-center"><Form.Label className="fw-bold">Logo</Form.Label><div className="border p-2 mb-2 d-flex align-items-center justify-content-center" style={{height:100}}><img src={shopConfig.logo} style={{maxHeight:'100%'}}/></div><Form.Control type="file" size="sm" onChange={e=>handleUpload(e,'LOGO')}/></Col>
                <Col md={8}>
                  <Row className="g-2">
                    <Col md={12}><Form.Label className="fw-bold">Thông báo Header</Form.Label><Form.Control value={shopConfig.topBarText} onChange={e=>setShopConfig({...shopConfig, topBarText:e.target.value})}/></Col>
                    <Col md={6}><Form.Label className="fw-bold">Tên Shop</Form.Label><Form.Control value={shopConfig.tenShop} onChange={e=>setShopConfig({...shopConfig, tenShop:e.target.value})}/></Col>
                    <Col md={6}><Form.Label className="fw-bold">Giờ mở cửa</Form.Label><Form.Control value={shopConfig.openingHours} onChange={e=>setShopConfig({...shopConfig, openingHours:e.target.value})}/></Col>
                    
                    {/* CẤU HÌNH NGÂN HÀNG */}
                    <Col md={12} className="p-3 bg-light border rounded mt-2">
                      <h6 className="fw-bold text-primary">CẤU HÌNH THANH TOÁN (BANK & QR)</h6>
                      <Row className="g-2">
                        <Col md={6}><Form.Label className="small fw-bold">Tên Ngân Hàng</Form.Label><Form.Control placeholder="VD: Vietcombank" value={shopConfig.bankInfo?.bankName} onChange={e=>setShopConfig({...shopConfig, bankInfo:{...shopConfig.bankInfo, bankName:e.target.value}})}/></Col>
                        <Col md={6}><Form.Label className="small fw-bold">Chi nhánh</Form.Label><Form.Control value={shopConfig.bankInfo?.bankBranch} onChange={e=>setShopConfig({...shopConfig, bankInfo:{...shopConfig.bankInfo, bankBranch:e.target.value}})}/></Col>
                        <Col md={6}><Form.Label className="small fw-bold">Số Tài Khoản</Form.Label><Form.Control value={shopConfig.bankInfo?.accountNum} onChange={e=>setShopConfig({...shopConfig, bankInfo:{...shopConfig.bankInfo, accountNum:e.target.value}})}/></Col>
                        <Col md={6}><Form.Label className="small fw-bold">Chủ Tài Khoản</Form.Label><Form.Control value={shopConfig.bankInfo?.accountName} onChange={e=>setShopConfig({...shopConfig, bankInfo:{...shopConfig.bankInfo, accountName:e.target.value}})}/></Col>
                        <Col md={12}><Form.Label className="small fw-bold text-success">Ảnh QR Code</Form.Label><div className="d-flex align-items-center gap-2"><div style={{width:60,height:60,border:'1px solid #ddd'}}><img src={shopConfig.bankInfo?.qrImage} style={{width:'100%',height:'100%'}}/></div><Form.Control type="file" onChange={e=>handleUpload(e,'QR')}/></div></Col>
                      </Row>
                    </Col>

                    <Col md={12}><Button variant="success" className="w-100 fw-bold mt-3" onClick={luuCauHinh}>LƯU CẤU HÌNH</Button></Col>
                  </Row>
                </Col>
              </Row>
            </div>
          </Tab>
          
          {/* CÁC TAB KHÁC (BANNER, SẢN PHẨM...) GIỮ NGUYÊN CODE CŨ CỦA BẠN HOẶC COPY TỪ BẢN ADMIN TRƯỚC ĐÓ */}
          {/* Để đảm bảo không lỗi, tôi khuyên bạn giữ nguyên phần dưới của Admin cũ nếu nó đang chạy tốt, hoặc copy lại phần Tabs Products/Orders từ câu trả lời trước */}
          <Tab eventKey="products" title="📦 SẢN PHẨM"><Button size="sm" className="mb-2 fw-bold" onClick={()=>{setEditData({...editData, sp:null}); setFormDataSP({ ten:'', giaGoc:'', phanTramGiam:0, giaBan:'', donVi:'Cái', moTa:'', anh:'', phanLoai:'', isMoi:false, isKhuyenMai:false, isBanChay:false, isFlashSale:false }); setModal({...modal, sp:true})}}>+ THÊM MỚI</Button><div className="table-responsive"><Table hover bordered size="sm" className="align-middle"><thead className="bg-light"><tr><th>Ảnh</th><th>Tên</th><th>Giá</th><th>Trạng thái</th><th>Thao tác</th></tr></thead><tbody>{dsSanPham.map(sp=><tr key={sp.id}><td><img src={sp.anh||NO_IMAGE} width="40"/></td><td className="fw-bold">{sp.ten}</td><td className="text-danger fw-bold">{sp.giaBan?.toLocaleString()}¥</td><td>{sp.isFlashSale && <Badge bg="warning" text="dark" className="me-1">⚡</Badge>}{sp.isMoi && <Badge bg="success" className="me-1">New</Badge>}</td><td><Button size="sm" variant="warning" className="me-1" onClick={()=>{setEditData({...editData, sp}); setFormDataSP(sp); setModal({...modal, sp:true})}}>✏️</Button><Button size="sm" variant="danger" onClick={()=>{if(confirm('Xóa?')) handleUpdateDS_SP('DELETE',sp.id)}}>🗑️</Button></td></tr>)}</tbody></Table></div></Tab>
          <Tab eventKey="menu" title="📂 DANH MỤC"><Button size="sm" className="mb-2 fw-bold" onClick={()=>{setEditData({...editData, dm:null}); setFormDM({ten:'', icon:'', parent:'', order:''}); setModal({...modal, dm:true})}}>+ DANH MỤC</Button><Table bordered size="sm" hover><thead className="bg-light"><tr><th>TT</th><th>Tên</th><th>Icon</th><th>Thao tác</th></tr></thead><tbody>{dsDanhMuc.sort((a,b)=>a.order-b.order).map(d=><tr key={d.id}><td>{d.order}</td><td>{d.parent?'↳ ':''}{d.ten}</td><td>{d.icon}</td><td><Button size="sm" variant="warning" className="me-1" onClick={()=>{setEditData({...editData, dm:d}); setFormDM(d); setModal({...modal, dm:true})}}>✏️</Button><Button size="sm" variant="danger" onClick={()=>handleUpdateDS_DM('DELETE',d.id)}>🗑️</Button></td></tr>)}</tbody></Table></Tab>
          <Tab eventKey="orders" title={`📋 ĐƠN HÀNG (${dsDonHang.length})`}><div className="table-responsive"><Table hover bordered size="sm" className="align-middle"><thead className="bg-light"><tr><th>Mã</th><th>Ngày</th><th>Khách</th><th>Tổng</th><th>TT</th><th>Xử lý</th></tr></thead><tbody>{dsDonHang.sort((a,b)=>b.ngayDat-a.ngayDat).map(dh=><tr key={dh.id}><td><span className="text-primary fw-bold">{dh.maDonHang||`#${dh.id.slice(0,5)}`}</span></td><td>{dh.ngayDat?.toDate?dh.ngayDat.toDate().toLocaleDateString('vi-VN'):''}</td><td><div className="fw-bold">{dh.khachHang?.ten}</div><small>{dh.khachHang?.sdt}</small></td><td className="text-danger fw-bold">{dh.tongTien?.toLocaleString()}¥</td><td><Badge bg={dh.trangThai==='Hoàn thành'?'success':'warning'}>{dh.trangThai}</Badge></td><td><Button size="sm" variant="info" className="me-1 text-white" onClick={()=>{setSelectedOrder(dh);setModal({...modal, order:true})}}>Xem</Button><Button size="sm" variant="success" className="me-1" onClick={()=>handleUpdateStatusOrder(dh.id,'Hoàn thành')}>✔</Button><Button size="sm" variant="danger" onClick={()=>handleDeleteOrder(dh.id)}>✘</Button></td></tr>)}</tbody></Table></div></Tab>
          {/* (Giữ nguyên tab Banner, Ship, User...) */}
        </Tabs>
      </Container>
      {/* (Giữ nguyên các Modal ở cuối file) */}
      <Modal show={modal.sp} onHide={()=>setModal({...modal,sp:false})} size="lg" centered><Modal.Header closeButton><Modal.Title>{editData.sp?'Cập nhật':'Thêm mới'}</Modal.Title></Modal.Header><Modal.Body><Form><Row><Col md={8}><Form.Group className="mb-2"><Form.Label>Tên SP</Form.Label><Form.Control value={formDataSP.ten} onChange={e=>setFormDataSP({...formDataSP,ten:e.target.value})}/></Form.Group><Form.Group className="mb-2"><Form.Label>Danh mục</Form.Label><Form.Select value={formDataSP.phanLoai} onChange={e=>setFormDataSP({...formDataSP,phanLoai:e.target.value})}><option value="">-- Chọn --</option>{dsDanhMuc.map(d=><option key={d.id} value={d.id}>{d.parent?'-- ':''}{d.ten}</option>)}</Form.Select></Form.Group><Row><Col><Form.Group className="mb-2"><Form.Label>Giá Gốc</Form.Label><Form.Control type="number" value={formDataSP.giaGoc} onChange={e=>setFormDataSP({...formDataSP,giaGoc:e.target.value})}/></Form.Group></Col><Col><Form.Group className="mb-2"><Form.Label>% Giảm</Form.Label><Form.Control type="number" value={formDataSP.phanTramGiam} onChange={e=>setFormDataSP({...formDataSP,phanTramGiam:e.target.value})}/></Form.Group></Col></Row><Form.Group className="mb-2"><Form.Label className="text-danger fw-bold">Giá Bán</Form.Label><Form.Control readOnly value={formDataSP.giaBan} className="bg-light fw-bold text-danger"/></Form.Group><div className="d-flex flex-wrap gap-3 border p-2 rounded"><Form.Check type="switch" label="⚡ Flash Sale" checked={formDataSP.isFlashSale} onChange={e=>setFormDataSP({...formDataSP,isFlashSale:e.target.checked})}/><Form.Check type="switch" label="Mới" checked={formDataSP.isMoi} onChange={e=>setFormDataSP({...formDataSP,isMoi:e.target.checked})}/></div></Col><Col md={4}><Form.Group><Form.Label>Ảnh</Form.Label><Form.Control type="file" onChange={e=>handleUpload(e,'PRODUCT')}/></Form.Group><img src={formDataSP.anh||NO_IMAGE} className="w-100 mt-2 border"/></Col></Row><Form.Group className="mt-2"><Form.Label>Mô tả</Form.Label><ReactQuill theme="snow" value={formDataSP.moTa} onChange={v=>setFormDataSP({...formDataSP,moTa:v})}/></Form.Group></Form></Modal.Body><Modal.Footer><Button onClick={()=>{handleUpdateDS_SP(editData.sp?'UPDATE':'ADD', formDataSP); setModal({...modal,sp:false})}}>Lưu</Button></Modal.Footer></Modal>
      <Modal show={modal.order} onHide={()=>setModal({...modal,order:false})} size="lg" centered><Modal.Header closeButton><Modal.Title>Chi tiết đơn</Modal.Title></Modal.Header><Modal.Body>{selectedOrder && (<div className="p-2"><p><strong>Mã:</strong> {selectedOrder.maDonHang}</p><p><strong>Khách:</strong> {selectedOrder.khachHang?.ten} - {selectedOrder.khachHang?.sdt}</p><p><strong>Địa chỉ:</strong> {selectedOrder.khachHang?.diachi}</p><p><strong>Thanh toán:</strong> <Badge bg="info">{selectedOrder.hinhThucThanhToan==='cod'?'COD':(selectedOrder.hinhThucThanhToan==='bank'?'Chuyển khoản':'QR Code')}</Badge></p><Table bordered><thead><tr><th>SP</th><th>SL</th><th>Giá</th></tr></thead><tbody>{selectedOrder.gioHang?.map((i,x)=><tr key={x}><td>{i.ten}</td><td>{i.soLuong}</td><td>{i.giaBan}</td></tr>)}</tbody></Table><h4 className="text-end text-danger">{selectedOrder.tongTien?.toLocaleString()}¥</h4></div>)}</Modal.Body></Modal>
    </div>
  );
}
export default Admin;