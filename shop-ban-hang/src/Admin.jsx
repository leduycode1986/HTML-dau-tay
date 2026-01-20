import React, { useState, useEffect } from 'react';
import { Table, Button, Form, Modal, Badge, Tab, Tabs, Row, Col, Container, Card, InputGroup, Alert } from 'react-bootstrap';
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

  // --- CẤU HÌNH LOGIN ---
  const [adminConfig] = useState(() => {
    try {
      const s = JSON.parse(localStorage.getItem('adminConfig') || '{}');
      return { user: s.user || s.username || 'admin', pass: s.pass || s.password || '123' };
    } catch { return { user: 'admin', pass: '123' }; }
  });

  // --- CẤU HÌNH SHOP ---
  const [shopConfig, setShopConfig] = useState({ 
    tenShop:'', slogan:'', logo:'', diaChi:'', sdt:'', zalo:'', linkFacebook:'', copyright:'', tyLeDiem:1000, gioiThieu:'', flashSaleEnd:'', topBarText:'', openingHours:'',
    bankInfo: { bankName: '', accountNum: '', accountName: '', bankBranch: '', qrImage: '' } 
  });
  
  // --- STATES DỮ LIỆU ---
  const [dsBanner, setDsBanner] = useState([]);
  const [dsCoupon, setDsCoupon] = useState([]);
  const [dsShip, setDsShip] = useState([]); 
  const [dsUser, setDsUser] = useState([]); 
  const [dsReview, setDsReview] = useState([]); 

  // --- MODAL & FORM ---
  const [modal, setModal] = useState({ sp: false, dm: false, order: false, user: false });
  const [editData, setEditData] = useState({ sp: null, dm: null, user: null, order: null });
  const [formDataSP, setFormDataSP] = useState({ ten:'', giaGoc:'', phanTramGiam:0, giaBan:'', donVi:'Cái', moTa:'', anh:'', phanLoai:'', isMoi:false, isKhuyenMai:false, isBanChay:false, isFlashSale:false });
  const [formDM, setFormDM] = useState({ ten:'', icon:'', parent:'', order:'' });
  const [formBanner, setFormBanner] = useState({ img:'', link:'' });
  const [formCoupon, setFormCoupon] = useState({ code:'', giamGia:0 });
  const [formShip, setFormShip] = useState({ khuVuc:'', phi:0 });
  const [userPoint, setUserPoint] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // --- THỐNG KÊ ---
  const thongKe = (() => {
    const today = new Date().toLocaleDateString('vi-VN'), m = new Date().getMonth()+1, y = new Date().getFullYear();
    let dNgay=0, dThang=0, dNam=0;
    dsDonHang.forEach(dh => {
      if(!dh.ngayDat?.toDate) return;
      const d = dh.ngayDat.toDate();
      if(d.toLocaleDateString('vi-VN')===today) dNgay+=dh.tongTien;
      if(d.getMonth()+1===m && d.getFullYear()===y) dThang+=dh.tongTien;
      if(d.getFullYear()===y) dNam+=dh.tongTien;
    });
    return { dNgay, dThang, dNam, tongDon: dsDonHang.length };
  })();

  // --- LOAD DATA ---
  useEffect(() => {
    if (isLoggedIn) {
      const unsubs = [
        onSnapshot(doc(db, "cauHinh", "thongTinChung"), d => d.exists() && setShopConfig(prev=>({...prev, ...d.data()}))),
        onSnapshot(collection(db, "banners"), s => setDsBanner(s.docs.map(d=>({id:d.id,...d.data()})))),
        onSnapshot(collection(db, "coupons"), s => setDsCoupon(s.docs.map(d=>({id:d.id,...d.data()})))),
        onSnapshot(collection(db, "shipping"), s => setDsShip(s.docs.map(d=>({id:d.id,...d.data()})))),
        onSnapshot(collection(db, "users"), s => setDsUser(s.docs.map(d=>({id:d.id,...d.data()})))),
        onSnapshot(collection(db, "reviews"), s => setDsReview(s.docs.map(d=>({id:d.id,...d.data()}))))
      ];
      return () => unsubs.forEach(u => u());
    }
  }, [isLoggedIn]);

  // --- HANDLERS ---
  const handleLogin = (e) => { e.preventDefault(); if(loginInput.user===adminConfig.user && loginInput.pass===adminConfig.pass) { localStorage.setItem('adminConfig', JSON.stringify(adminConfig)); setIsLoggedIn(true); } else alert(`Sai mật khẩu!`); };
  const luuCauHinh = async () => { await setDoc(doc(db, "cauHinh", "thongTinChung"), shopConfig); alert("Đã lưu cấu hình!"); };
  const handleUpload = (e, type) => { const f = e.target.files[0]; if(!f) return; const r = new FileReader(); r.onloadend=()=>{ if(type==='LOGO') setShopConfig({...shopConfig,logo:r.result}); if(type==='PRODUCT') setFormDataSP({...formDataSP,anh:r.result}); if(type==='BANNER') setFormBanner({...formBanner,img:r.result}); if(type==='QR') setShopConfig(p => ({...p, bankInfo: {...p.bankInfo, qrImage: r.result}})); }; r.readAsDataURL(f); };
  const add = async (col, d) => await addDoc(collection(db, col), d);
  const del = async (col, id) => confirm('Xóa?') && await deleteDoc(doc(db, col, id));
  
  // Màu sắc trạng thái đơn hàng
  const getStatusColor = (status) => {
    if(status === 'Mới đặt') return 'warning';
    if(status === 'Đang xác nhận') return 'info';
    if(status === 'Đang giao') return 'primary';
    if(status === 'Hoàn thành') return 'success';
    return 'danger'; // Đã hủy
  };

  useEffect(() => { const g = parseInt(formDataSP.giaGoc)||0, p = parseInt(formDataSP.phanTramGiam)||0; setFormDataSP(prev => ({...prev, giaBan: g > 0 ? Math.floor(g*(1-p/100)) : ''})); }, [formDataSP.giaGoc, formDataSP.phanTramGiam]);

  if (!isLoggedIn) return (<div className="admin-login-wrapper"><div className="admin-login-card shadow"><h3 className="text-center text-success fw-bold mb-4">QUẢN TRỊ SHOP</h3><Form onSubmit={handleLogin}><Form.Group className="mb-3"><Form.Label className="fw-bold">Tài khoản</Form.Label><Form.Control className="p-3" value={loginInput.user} onChange={e=>setLoginInput({...loginInput, user:e.target.value})}/></Form.Group><Form.Group className="mb-4"><Form.Label className="fw-bold">Mật khẩu</Form.Label><InputGroup><Form.Control className="p-3" type={showPass?"text":"password"} value={loginInput.pass} onChange={e=>setLoginInput({...loginInput, pass:e.target.value})}/><Button variant="outline-secondary" onClick={()=>setShowPass(!showPass)}><i className={showPass?"fa-solid fa-eye-slash":"fa-solid fa-eye"}></i></Button></InputGroup></Form.Group><Button type="submit" variant="success" className="w-100 py-3 fw-bold rounded-pill">ĐĂNG NHẬP</Button></Form></div></div>);

  return (
    <div className="admin-main-container">
      <div className="admin-navbar"><h4>QUẢN TRỊ VIÊN</h4><Link to="/"><Button variant="danger" size="sm">Thoát</Button></Link></div>
      <Container fluid className="p-3">
        {/* THỐNG KÊ */}
        <Row className="mb-4 g-2">
          <Col xs={6} md={3}><div className="stats-box bg-primary text-white p-3 rounded"><h5>Hôm nay</h5><h3>{thongKe.dNgay.toLocaleString()} ¥</h3></div></Col>
          <Col xs={6} md={3}><div className="stats-box bg-success text-white p-3 rounded"><h5>Tháng này</h5><h3>{thongKe.dThang.toLocaleString()} ¥</h3></div></Col>
          <Col xs={6} md={3}><div className="stats-box bg-warning text-dark p-3 rounded"><h5>Cả năm</h5><h3>{thongKe.dNam.toLocaleString()} ¥</h3></div></Col>
          <Col xs={6} md={3}><div className="stats-box bg-info text-white p-3 rounded"><h5>Tổng đơn</h5><h3>{thongKe.tongDon} đơn</h3></div></Col>
        </Row>

        <Tabs defaultActiveKey="orders" className="bg-white p-2 rounded border shadow-sm mb-3">
          
          {/* --- TAB ĐƠN HÀNG (QUAN TRỌNG NHẤT) --- */}
          <Tab eventKey="orders" title={`📋 QUẢN LÝ ĐƠN HÀNG (${dsDonHang.length})`}>
            <div className="table-responsive mt-2">
              <Table hover bordered className="align-middle bg-white">
                <thead className="bg-light">
                  <tr>
                    <th>Mã đơn</th>
                    <th>Ngày đặt</th>
                    <th>Khách hàng</th>
                    <th>Tổng tiền</th>
                    <th>Thanh toán</th>
                    <th>Trạng thái (Click chọn)</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {dsDonHang.sort((a,b) => b.ngayDat - a.ngayDat).map(dh => (
                    <tr key={dh.id}>
                      <td className="fw-bold text-primary">{dh.maDonHang || `#${dh.id.slice(0,6)}`}</td>
                      <td>{dh.ngayDat?.toDate ? dh.ngayDat.toDate().toLocaleString('vi-VN') : 'Mới'}</td>
                      <td>
                        <div className="fw-bold">{dh.khachHang?.ten}</div>
                        <div className="small text-muted">{dh.khachHang?.sdt}</div>
                      </td>
                      <td className="text-danger fw-bold">{dh.tongTien?.toLocaleString()} ¥</td>
                      
                      {/* CỘT HÌNH THỨC THANH TOÁN */}
                      <td>
                        <Badge bg={dh.hinhThucThanhToan === 'cod' ? 'secondary' : (dh.hinhThucThanhToan === 'bank' ? 'info' : 'warning')} text="dark">
                          {dh.hinhThucThanhToan === 'cod' ? 'Tiền mặt (COD)' : (dh.hinhThucThanhToan === 'bank' ? 'Chuyển khoản' : 'QR Code')}
                        </Badge>
                      </td>

                      {/* CỘT TRẠNG THÁI (DROPDOWN CHỌN NHANH) */}
                      <td style={{width: '180px'}}>
                        <Form.Select 
                          size="sm" 
                          className={`fw-bold text-white bg-${getStatusColor(dh.trangThai)}`}
                          value={dh.trangThai} 
                          onChange={(e) => handleUpdateStatusOrder(dh.id, e.target.value)}
                        >
                          <option value="Mới đặt" className="bg-white text-dark">Mới đặt</option>
                          <option value="Đang xác nhận" className="bg-white text-dark">Đang xác nhận</option>
                          <option value="Đang giao" className="bg-white text-dark">Đang giao</option>
                          <option value="Hoàn thành" className="bg-white text-dark">Hoàn thành</option>
                          <option value="Đã hủy" className="bg-white text-dark">Đã hủy</option>
                        </Form.Select>
                      </td>

                      <td>
                        <Button size="sm" variant="outline-info" className="me-1" onClick={()=>{setSelectedOrder(dh);setModal({...modal, order:true})}}><i className="fa-solid fa-eye"></i></Button>
                        <Button size="sm" variant="outline-danger" onClick={()=>handleDeleteOrder(dh.id)}><i className="fa-solid fa-trash"></i></Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </Tab>

          {/* --- TAB SẢN PHẨM --- */}
          <Tab eventKey="products" title="📦 SẢN PHẨM">
            <Button size="sm" variant="success" className="mb-2 fw-bold" onClick={()=>{setEditData({...editData, sp:null}); setFormDataSP({ ten: '', giaGoc: '', phanTramGiam: 0, giaBan: '', donVi: 'Cái', moTa: '', anh: '', phanLoai: '', isMoi: false, isKhuyenMai: false, isBanChay: false, isFlashSale: false }); setModal({...modal, sp:true})}}>+ THÊM MỚI</Button>
            <div className="table-responsive"><Table hover bordered size="sm" className="align-middle"><thead className="bg-light"><tr><th>Ảnh</th><th>Tên</th><th>Giá</th><th>Trạng thái</th><th>Thao tác</th></tr></thead><tbody>{dsSanPham.map(sp=><tr key={sp.id}><td><img src={sp.anh||NO_IMAGE} width="40"/></td><td className="fw-bold">{sp.ten}</td><td className="text-danger fw-bold">{sp.giaBan?.toLocaleString()}¥</td><td>{sp.isFlashSale && <Badge bg="warning" text="dark" className="me-1">⚡</Badge>}{sp.isMoi && <Badge bg="success" className="me-1">New</Badge>}</td><td><Button size="sm" variant="warning" className="me-1" onClick={()=>{setEditData({...editData, sp}); setFormDataSP(sp); setModal({...modal, sp:true})}}>✏️</Button><Button size="sm" variant="danger" onClick={()=>{if(confirm('Xóa?')) handleUpdateDS_SP('DELETE',sp.id)}}>🗑️</Button></td></tr>)}</tbody></Table></div>
          </Tab>

          {/* --- TAB CẤU HÌNH --- */}
          <Tab eventKey="config" title="⚙️ CẤU HÌNH">
            <div className="bg-white p-4">
              <Row>
                <Col md={4} className="text-center"><Form.Label className="fw-bold">Logo Shop</Form.Label><div className="border p-2 mb-2 d-flex align-items-center justify-content-center" style={{height:100}}><img src={shopConfig.logo} style={{maxHeight:'100%'}}/></div><Form.Control type="file" size="sm" onChange={e=>handleUpload(e,'LOGO')}/></Col>
                <Col md={8}>
                  <Row className="g-2">
                    <Col md={12}><Form.Label className="fw-bold">Thông báo Header</Form.Label><Form.Control value={shopConfig.topBarText} onChange={e=>setShopConfig({...shopConfig, topBarText:e.target.value})}/></Col>
                    <Col md={6}><Form.Label className="fw-bold">Tên Shop</Form.Label><Form.Control value={shopConfig.tenShop} onChange={e=>setShopConfig({...shopConfig, tenShop:e.target.value})}/></Col>
                    <Col md={6}><Form.Label className="fw-bold">Slogan</Form.Label><Form.Control value={shopConfig.slogan} onChange={e=>setShopConfig({...shopConfig, slogan:e.target.value})}/></Col>
                    
                    {/* CẤU HÌNH NGÂN HÀNG & QR */}
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

                    <Col md={6}><Form.Label className="fw-bold text-danger">Kết thúc Flash Sale</Form.Label><Form.Control type="datetime-local" value={shopConfig.flashSaleEnd} onChange={e=>setShopConfig({...shopConfig, flashSaleEnd:e.target.value})}/></Col>
                    <Col md={6}><Form.Label className="fw-bold">Giờ mở cửa</Form.Label><Form.Control value={shopConfig.openingHours} onChange={e=>setShopConfig({...shopConfig, openingHours:e.target.value})}/></Col>
                    <Col md={12}><Button variant="success" className="w-100 fw-bold mt-3" onClick={luuCauHinh}>LƯU CẤU HÌNH</Button></Col>
                  </Row>
                </Col>
              </Row>
            </div>
          </Tab>
          
          <Tab eventKey="menu" title="📂 DANH MỤC"><Button size="sm" className="mb-2 fw-bold" onClick={()=>{setEditData({...editData, dm:null}); setFormDM({ten:'', icon:'', parent:'', order:''}); setModal({...modal, dm:true})}}>+ DANH MỤC</Button><Table bordered size="sm" hover><thead className="bg-light"><tr><th>TT</th><th>Tên</th><th>Icon</th><th>Thao tác</th></tr></thead><tbody>{dsDanhMuc.sort((a,b)=>a.order-b.order).map(d=><tr key={d.id}><td>{d.order}</td><td>{d.parent?'↳ ':''}{d.ten}</td><td>{d.icon}</td><td><Button size="sm" variant="warning" className="me-1" onClick={()=>{setEditData({...editData, dm:d}); setFormDM(d); setModal({...modal, dm:true})}}>✏️</Button><Button size="sm" variant="danger" onClick={()=>handleUpdateDS_DM('DELETE',d.id)}>🗑️</Button></td></tr>)}</tbody></Table></Tab>
          
          <Tab eventKey="banner" title="🖼️ BANNER"><div className="bg-white p-3"><div className="d-flex gap-2 mb-3"><Form.Group className="flex-grow-1"><Form.Label className="fw-bold">Chọn ảnh</Form.Label><Form.Control type="file" onChange={e=>handleUpload(e,'BANNER')}/></Form.Group><Form.Group className="flex-grow-1"><Form.Label className="fw-bold">Link</Form.Label><Form.Control placeholder="/san-pham/..." value={formBanner.link} onChange={e=>setFormBanner({...formBanner,link:e.target.value})}/></Form.Group><Button onClick={()=>{add('banners', formBanner); setFormBanner({img:'', link:''})}} className="align-self-end">Thêm</Button></div><div className="d-flex flex-wrap gap-2">{dsBanner.map(b=><div key={b.id} className="position-relative" style={{width:200}}><img src={b.img} className="w-100 rounded"/><Button size="sm" variant="danger" className="position-absolute top-0 end-0" onClick={()=>del('banners', b.id)}>X</Button></div>)}</div></div></Tab>
          
          <Tab eventKey="marketing" title="🎟️ SHIP & COUPON"><Row><Col md={6} className="border-end p-3"><h6 className="fw-bold text-success mb-3">MÃ GIẢM GIÁ</h6><div className="d-flex gap-2 mb-2 align-items-end"><Form.Group><Form.Label className="small fw-bold">Mã Code</Form.Label><Form.Control value={formCoupon.code} onChange={e=>setFormCoupon({...formCoupon,code:e.target.value.toUpperCase()})}/></Form.Group><Form.Group><Form.Label className="small fw-bold">Giảm (¥)</Form.Label><Form.Control type="number" value={formCoupon.giamGia} onChange={e=>setFormCoupon({...formCoupon,giamGia:e.target.value})}/></Form.Group><Button size="sm" onClick={()=>{add('coupons',formCoupon); setFormCoupon({code:'',giamGia:0})}}>Thêm</Button></div><Table size="sm"><tbody>{dsCoupon.map(c=><tr key={c.id}><td>{c.code}</td><td>{parseInt(c.giamGia).toLocaleString()}¥</td><td><Button size="sm" variant="danger" onClick={()=>del('coupons',c.id)}>X</Button></td></tr>)}</tbody></Table></Col><Col md={6} className="p-3"><h6 className="fw-bold text-primary mb-3">PHÍ SHIP (KHU VỰC)</h6><div className="d-flex gap-2 mb-2 align-items-end"><Form.Group><Form.Label className="small fw-bold">Khu vực</Form.Label><Form.Control value={formShip.khuVuc} onChange={e=>setFormShip({...formShip,khuVuc:e.target.value})}/></Form.Group><Form.Group><Form.Label className="small fw-bold">Phí (¥)</Form.Label><Form.Control type="number" value={formShip.phi} onChange={e=>setFormShip({...formShip,phi:e.target.value})}/></Form.Group><Button size="sm" onClick={()=>{add('shipping',formShip); setFormShip({khuVuc:'',phi:0})}}>Thêm</Button></div><Table size="sm"><tbody>{dsShip.map(s=><tr key={s.id}><td>{s.khuVuc}</td><td>{parseInt(s.phi).toLocaleString()}¥</td><td><Button size="sm" variant="danger" onClick={()=>del('shipping',s.id)}>X</Button></td></tr>)}</tbody></Table></Col></Row></Tab>
          
          <Tab eventKey="users" title="👥 USER & REVIEW"><Row><Col md={7}><h6 className="fw-bold text-primary mb-3">DANH SÁCH THÀNH VIÊN</h6><div className="table-responsive"><Table size="sm" hover><thead><tr><th>Tên</th><th>Email</th><th>Điểm</th><th>Sửa</th></tr></thead><tbody>{dsUser.map(u=><tr key={u.id}><td>{u.ten}</td><td>{u.email}</td><td className="text-warning fw-bold">{u.diemTichLuy}</td><td><Button size="sm" onClick={()=>{setEditData({...editData, user:u}); setUserPoint(u.diemTichLuy); setModal({...modal, user:true})}}>Sửa</Button></td></tr>)}</tbody></Table></div></Col><Col md={5}><h6 className="fw-bold text-warning mb-3">BÌNH LUẬN MỚI</h6><div style={{maxHeight:400,overflowY:'auto'}}>{dsReview.map(r=><div key={r.id} className="border p-2 mb-2 bg-light rounded"><div className="d-flex justify-content-between"><strong>{r.userName}</strong><small>{r.ngay?.toDate().toLocaleDateString()}</small></div><div className="text-warning">{'⭐'.repeat(r.rating)}</div><p className="mb-1 bg-white p-1 border">{r.comment}</p><Button size="sm" variant="danger" onClick={()=>delReview(r.id)}>Xóa</Button></div>)}</div></Col></Row></Tab>
        </Tabs>
      </Container>

      {/* MODAL SP */}
      <Modal show={modal.sp} onHide={()=>setModal({...modal,sp:false})} size="lg" centered><Modal.Header closeButton><Modal.Title>{editData.sp?'Cập nhật':'Thêm mới'}</Modal.Title></Modal.Header><Modal.Body><Form><Row><Col md={8}><Form.Group className="mb-2"><Form.Label className="fw-bold">Tên sản phẩm</Form.Label><Form.Control value={formDataSP.ten} onChange={e=>setFormDataSP({...formDataSP,ten:e.target.value})}/></Form.Group><Form.Group className="mb-2"><Form.Label className="fw-bold">Danh mục</Form.Label><Form.Select value={formDataSP.phanLoai} onChange={e=>setFormDataSP({...formDataSP,phanLoai:e.target.value})}><option value="">-- Chọn --</option>{dsDanhMuc.map(d=><option key={d.id} value={d.id}>{d.parent?'-- ':''}{d.ten}</option>)}</Form.Select></Form.Group><Row><Col><Form.Group className="mb-2"><Form.Label className="fw-bold">Giá Gốc</Form.Label><Form.Control type="number" value={formDataSP.giaGoc} onChange={e=>setFormDataSP({...formDataSP,giaGoc:e.target.value})}/></Form.Group></Col><Col><Form.Group className="mb-2"><Form.Label className="fw-bold">% Giảm</Form.Label><Form.Control type="number" value={formDataSP.phanTramGiam} onChange={e=>setFormDataSP({...formDataSP,phanTramGiam:e.target.value})}/></Form.Group></Col></Row><Form.Group className="mb-2"><Form.Label className="fw-bold text-danger">Giá Bán</Form.Label><Form.Control className="bg-light fw-bold text-danger" readOnly value={formDataSP.giaBan}/></Form.Group><div className="d-flex flex-wrap gap-3 border p-2 rounded mt-2"><Form.Check type="switch" label="⚡ FLASH SALE" className="fw-bold text-warning" checked={formDataSP.isFlashSale} onChange={e=>setFormDataSP({...formDataSP,isFlashSale:e.target.checked})}/><Form.Check type="switch" label="New" checked={formDataSP.isMoi} onChange={e=>setFormDataSP({...formDataSP,isMoi:e.target.checked})}/><Form.Check type="switch" label="Hot" checked={formDataSP.isBanChay} onChange={e=>setFormDataSP({...formDataSP,isBanChay:e.target.checked})}/><Form.Check type="switch" label="Sale" checked={formDataSP.isKhuyenMai} onChange={e=>setFormDataSP({...formDataSP,isKhuyenMai:e.target.checked})}/></div></Col><Col md={4}><Form.Group><Form.Label className="fw-bold">Hình ảnh</Form.Label><Form.Control type="file" onChange={e=>handleUpload(e,'PRODUCT')}/></Form.Group><img src={formDataSP.anh||NO_IMAGE} className="w-100 mt-2 border rounded"/></Col></Row><Form.Group className="mt-2"><Form.Label className="fw-bold">Mô tả</Form.Label><ReactQuill theme="snow" value={formDataSP.moTa} onChange={v=>setFormDataSP({...formDataSP,moTa:v})}/></Form.Group></Form></Modal.Body><Modal.Footer><Button variant="secondary" onClick={()=>setModal({...modal,sp:false})}>Hủy</Button><Button onClick={()=>{handleUpdateDS_SP(editData.sp?'UPDATE':'ADD', formDataSP); setModal({...modal,sp:false})}}>Lưu</Button></Modal.Footer></Modal>
      <Modal show={modal.dm} onHide={()=>setModal({...modal,dm:false})} centered><Modal.Header closeButton><Modal.Title>Danh mục</Modal.Title></Modal.Header><Modal.Body><Form.Group className="mb-2"><Form.Label>Tên</Form.Label><Form.Control value={formDM.ten} onChange={e=>setFormDM({...formDM,ten:e.target.value})}/></Form.Group><Form.Group className="mb-2"><Form.Label>Thứ tự</Form.Label><Form.Control type="number" value={formDM.order} onChange={e=>setFormDM({...formDM,order:e.target.value})}/></Form.Group><Form.Group className="mb-2"><Form.Label>Icon</Form.Label><Form.Select value={formDM.icon} onChange={e=>setFormDM({...formDM,icon:e.target.value})}><option>-- Chọn --</option>{ICON_LIST.map(i=><option key={i} value={i}>{i}</option>)}</Form.Select></Form.Group><Form.Group><Form.Label>Cha</Form.Label><Form.Select value={formDM.parent} onChange={e=>setFormDM({...formDM,parent:e.target.value})}><option value="">Gốc</option>{dsDanhMuc.filter(d=>!d.parent).map(d=><option key={d.id} value={d.customId||d.id}>{d.ten}</option>)}</Form.Select></Form.Group></Modal.Body><Modal.Footer><Button variant="secondary" onClick={()=>setModal({...modal,dm:false})}>Hủy</Button><Button onClick={()=>{handleUpdateDS_DM(editData.dm?'UPDATE':'ADD', formDM); setModal({...modal,dm:false})}}>Lưu</Button></Modal.Footer></Modal>
      <Modal show={modal.order} onHide={()=>setModal({...modal,order:false})} size="lg" centered><Modal.Header closeButton><Modal.Title>Chi tiết đơn hàng</Modal.Title></Modal.Header><Modal.Body>{selectedOrder && (<div className="p-2"><p><strong>Mã:</strong> <span className="text-primary fw-bold">{selectedOrder.maDonHang || selectedOrder.id}</span></p><p><strong>Khách:</strong> {selectedOrder.khachHang?.ten} - {selectedOrder.khachHang?.sdt}</p><p><strong>ĐC:</strong> {selectedOrder.khachHang?.diachi}</p><div className="mb-2"><strong>Thanh toán:</strong> <Badge bg="info">{selectedOrder.hinhThucThanhToan || 'cod'}</Badge></div><Table bordered><thead><tr><th>SP</th><th>SL</th><th>Giá</th></tr></thead><tbody>{selectedOrder.gioHang?.map((i,x)=><tr key={x}><td>{i.ten}</td><td>{i.soLuong}</td><td>{i.giaBan}¥</td></tr>)}</tbody></Table><h4 className="text-end text-danger">{selectedOrder.tongTien?.toLocaleString()}¥</h4></div>)}</Modal.Body><Modal.Footer><Button variant="secondary" onClick={()=>setModal({...modal,order:false})}>Đóng</Button></Modal.Footer></Modal>
      <Modal show={modal.user} onHide={()=>setModal({...modal,user:false})} centered><Modal.Header closeButton><Modal.Title>Sửa điểm</Modal.Title></Modal.Header><Modal.Body><Form.Group><Form.Label>Điểm tích lũy</Form.Label><Form.Control type="number" value={userPoint} onChange={e=>setUserPoint(e.target.value)}/></Form.Group></Modal.Body><Modal.Footer><Button variant="secondary" onClick={()=>setModal({...modal,user:false})}>Hủy</Button><Button onClick={async()=>{await updateDoc(doc(db,"users",editData.user.id),{diemTichLuy:parseInt(userPoint)}); setModal({...modal,user:false})}}>Lưu</Button></Modal.Footer></Modal>
    </div>
  );
}
export default Admin;