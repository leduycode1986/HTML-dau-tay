import React, { useState, useEffect } from 'react';
import { Table, Button, Form, Modal, Badge, Tab, Tabs, Row, Col, Container, InputGroup } from 'react-bootstrap';
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
    try { const s = JSON.parse(localStorage.getItem('adminConfig') || '{}'); return { user: s.user||'admin', pass: s.pass||'123' }; } catch { return { user: 'admin', pass: '123' }; }
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
  const [formDataSP, setFormDataSP] = useState({ ten:'', giaGoc:'', phanTramGiam:0, giaBan:'', donVi:'Cái', soLuong:100, moTa:'', anh:'', phanLoai:'', isMoi:false, isKhuyenMai:false, isBanChay:false, isFlashSale:false });
  const [formDM, setFormDM] = useState({ ten:'', icon:'', parent:'', order:'' });
  const [formBanner, setFormBanner] = useState({ img:'', link:'' });
  const [formCoupon, setFormCoupon] = useState({ code:'', giamGia:0 });
  const [formShip, setFormShip] = useState({ khuVuc:'', phi:0 });
  const [userPoint, setUserPoint] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState(null);

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

  const handleLogin = (e) => { e.preventDefault(); if(loginInput.user===adminConfig.user && loginInput.pass===adminConfig.pass) { localStorage.setItem('adminConfig', JSON.stringify(adminConfig)); setIsLoggedIn(true); } else alert(`Sai mật khẩu!`); };
  const luuCauHinh = async () => { await setDoc(doc(db, "cauHinh", "thongTinChung"), shopConfig); alert("Đã lưu cấu hình!"); };
  const handleUpload = (e, type) => { const f = e.target.files[0]; if(!f) return; const r = new FileReader(); r.onloadend=()=>{ if(type==='LOGO') setShopConfig({...shopConfig,logo:r.result}); if(type==='PRODUCT') setFormDataSP({...formDataSP,anh:r.result}); if(type==='BANNER') setFormBanner({...formBanner,img:r.result}); if(type==='QR') setShopConfig(p => ({...p, bankInfo: {...p.bankInfo, qrImage: r.result}})); }; r.readAsDataURL(f); };
  const add = async (col, d) => await addDoc(collection(db, col), d); const del = async (col, id) => confirm('Xóa?') && await deleteDoc(doc(db, col, id));
  useEffect(() => { const g = parseInt(formDataSP.giaGoc)||0, p = parseInt(formDataSP.phanTramGiam)||0; setFormDataSP(prev => ({...prev, giaBan: g > 0 ? Math.floor(g*(1-p/100)) : ''})); }, [formDataSP.giaGoc, formDataSP.phanTramGiam]);

  // GIAO DIỆN LOGIN (CHUẨN NHƯ ẢNH CŨ)
  if (!isLoggedIn) return (
    <div className="admin-login-wrapper">
      <div className="admin-login-card">
        <h3 className="admin-login-title text-success fw-bold text-center mb-4">QUẢN TRỊ SHOP</h3>
        <Form onSubmit={handleLogin}>
          <Form.Group className="mb-3">
            <Form.Label>Tài khoản</Form.Label>
            <Form.Control className="p-3 bg-light" value={loginInput.user} onChange={e=>setLoginInput({...loginInput, user:e.target.value})}/>
          </Form.Group>
          <Form.Group className="mb-4">
            <Form.Label>Mật khẩu</Form.Label>
            <InputGroup>
              <Form.Control className="p-3 bg-light" type={showPass?"text":"password"} value={loginInput.pass} onChange={e=>setLoginInput({...loginInput, pass:e.target.value})}/>
              <Button variant="outline-secondary" onClick={()=>setShowPass(!showPass)}><i className={showPass?"fa-solid fa-eye-slash":"fa-solid fa-eye"}></i></Button>
            </InputGroup>
          </Form.Group>
          <Button type="submit" variant="success" className="w-100 py-3 fw-bold rounded-pill text-uppercase">Đăng nhập</Button>
        </Form>
      </div>
    </div>
  );

  return (
    <div style={{background: '#f8f9fa', minHeight:'100vh'}}>
      {/* HEADER XANH LÁ CHUẨN */}
      <div className="bg-success text-white p-3 d-flex justify-content-between align-items-center shadow-sm">
        <h4 className="m-0 fw-bold text-uppercase">QUẢN TRỊ VIÊN</h4>
        <div className="d-flex align-items-center gap-3">
          {shopConfig.sdt && <span className="d-none d-md-block"><i className="fa-solid fa-phone me-1"></i> {shopConfig.sdt}</span>}
          <Link to="/"><Button variant="danger" size="sm" className="fw-bold">Thoát</Button></Link>
        </div>
      </div>

      <Container fluid className="p-3">
        <Tabs defaultActiveKey="config" className="bg-white p-2 rounded border shadow-sm mb-3">
          
          <Tab eventKey="config" title="⚙️ CẤU HÌNH">
            <div className="bg-white p-4 border rounded">
              <Row>
                <Col md={4} className="text-center border-end">
                  <Form.Label className="fw-bold mb-2">Logo Shop</Form.Label>
                  <div className="border p-2 mb-3 d-flex align-items-center justify-content-center mx-auto" style={{height:150, width:150, borderRadius:8}}><img src={shopConfig.logo} style={{maxHeight:'100%', maxWidth:'100%'}}/></div>
                  <Form.Control type="file" size="sm" onChange={e=>handleUpload(e,'LOGO')}/>
                </Col>
                <Col md={8}>
                  <Row className="g-3">
                    {/* CẤU HÌNH CHUNG */}
                    <Col md={12}><Form.Group><Form.Label className="fw-bold">Thông báo Header</Form.Label><Form.Control value={shopConfig.topBarText} onChange={e=>setShopConfig({...shopConfig, topBarText:e.target.value})}/></Form.Group></Col>
                    <Col md={6}><Form.Group><Form.Label className="fw-bold">Tên Shop</Form.Label><Form.Control value={shopConfig.tenShop} onChange={e=>setShopConfig({...shopConfig, tenShop:e.target.value})}/></Form.Group></Col>
                    <Col md={6}><Form.Group><Form.Label className="fw-bold">Giờ mở cửa</Form.Label><Form.Control value={shopConfig.openingHours} onChange={e=>setShopConfig({...shopConfig, openingHours:e.target.value})} placeholder="VD: 8h - 22h"/></Form.Group></Col>
                    <Col md={6}><Form.Group><Form.Label className="fw-bold">Hotline</Form.Label><Form.Control value={shopConfig.sdt} onChange={e=>setShopConfig({...shopConfig, sdt:e.target.value})}/></Form.Group></Col>
                    <Col md={6}><Form.Group><Form.Label className="fw-bold">Zalo</Form.Label><Form.Control value={shopConfig.zalo} onChange={e=>setShopConfig({...shopConfig, zalo:e.target.value})}/></Form.Group></Col>
                    <Col md={12}><Form.Group><Form.Label className="fw-bold">Giới thiệu Footer</Form.Label><Form.Control as="textarea" rows={2} value={shopConfig.gioiThieu} onChange={e=>setShopConfig({...shopConfig, gioiThieu:e.target.value})}/></Form.Group></Col>
                    
                    {/* CẤU HÌNH BANK & QR (ĐÃ FIX LỖI THẺ ĐÓNG) */}
                    <Col md={12} className="mt-3"><h6 className="text-primary fw-bold border-bottom pb-2">THANH TOÁN (VIETQR)</h6></Col>
                    <Col md={6}><Form.Group><Form.Label className="fw-bold">Tên Ngân hàng</Form.Label><Form.Control value={shopConfig.bankInfo?.bankName} onChange={e=>setShopConfig({...shopConfig, bankInfo:{...shopConfig.bankInfo, bankName:e.target.value}})}/></Form.Group></Col>
                    <Col md={6}><Form.Group><Form.Label className="fw-bold">Chi nhánh</Form.Label><Form.Control value={shopConfig.bankInfo?.bankBranch} onChange={e=>setShopConfig({...shopConfig, bankInfo:{...shopConfig.bankInfo, bankBranch:e.target.value}})}/></Form.Group></Col>
                    <Col md={6}><Form.Group><Form.Label className="fw-bold">Số Tài Khoản</Form.Label><Form.Control value={shopConfig.bankInfo?.accountNum} onChange={e=>setShopConfig({...shopConfig, bankInfo:{...shopConfig.bankInfo, accountNum:e.target.value}})}/></Form.Group></Col>
                    <Col md={6}><Form.Group><Form.Label className="fw-bold">Chủ Tài Khoản</Form.Label><Form.Control value={shopConfig.bankInfo?.accountName} onChange={e=>setShopConfig({...shopConfig, bankInfo:{...shopConfig.bankInfo, accountName:e.target.value}})}/></Form.Group></Col>
                    <Col md={12}><Form.Group><Form.Label className="fw-bold">Ảnh QR Code</Form.Label><div className="d-flex gap-2"><div style={{width:50,height:50,border:'1px solid #ddd'}}><img src={shopConfig.bankInfo?.qrImage} style={{width:'100%',height:'100%'}}/></div><Form.Control type="file" size="sm" onChange={e=>handleUpload(e,'QR')}/></div></Form.Group></Col>

                    <Col md={6} className="mt-3"><Form.Group><Form.Label className="fw-bold text-danger">Kết thúc Flash Sale</Form.Label><Form.Control type="datetime-local" value={shopConfig.flashSaleEnd} onChange={e=>setShopConfig({...shopConfig, flashSaleEnd:e.target.value})}/></Form.Group></Col>
                    <Col md={6} className="mt-3"><Form.Group><Form.Label className="fw-bold">Tỷ lệ điểm (¥/1 điểm)</Form.Label><Form.Control type="number" value={shopConfig.tyLeDiem} onChange={e=>setShopConfig({...shopConfig, tyLeDiem:e.target.value})}/></Form.Group></Col>

                    <Col md={12} className="mt-4"><Button variant="success" className="w-100 fw-bold py-2" onClick={luuCauHinh}>LƯU CẤU HÌNH</Button></Col>
                  </Row>
                </Col>
              </Row>
            </div>
          </Tab>
          
          <Tab eventKey="products" title="📦 SẢN PHẨM">
            <Button variant="primary" className="mb-2 fw-bold" onClick={()=>{setEditData({...editData, sp:null}); setFormDataSP({ ten:'', giaGoc:'', phanTramGiam:0, giaBan:'', donVi:'Cái', soLuong:100, moTa:'', anh:'', phanLoai:'', isMoi:false, isKhuyenMai:false, isBanChay:false, isFlashSale:false }); setModal({...modal, sp:true})}}>+ THÊM MỚI</Button>
            <div className="table-responsive">
              <Table hover bordered className="align-middle bg-white">
                <thead className="bg-light"><tr><th>Ảnh</th><th>Tên</th><th>Đơn vị</th><th>Kho</th><th>Giá bán</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
                <tbody>{dsSanPham.map(sp=><tr key={sp.id}>
                  <td><img src={sp.anh||NO_IMAGE} width="50" height="50" style={{objectFit:'cover', borderRadius:4}}/></td>
                  <td className="fw-bold">{sp.ten}</td>
                  <td>{sp.donVi}</td>
                  <td className={sp.soLuong<10?'text-danger fw-bold':''}>{sp.soLuong}</td>
                  <td className="text-danger fw-bold">{sp.giaBan?.toLocaleString()}¥</td>
                  <td>{sp.isFlashSale && <Badge bg="warning" text="dark" className="me-1">⚡</Badge>}{sp.isMoi && <Badge bg="success" className="me-1">New</Badge>}</td>
                  <td>
                    <Button size="sm" variant="warning" className="me-1" onClick={()=>{setEditData({...editData, sp}); setFormDataSP(sp); setModal({...modal, sp:true})}}>✏️</Button>
                    <Button size="sm" variant="danger" onClick={()=>{if(confirm('Xóa?')) handleUpdateDS_SP('DELETE',sp.id)}}>🗑️</Button>
                  </td>
                </tr>)}</tbody>
              </Table>
            </div>
          </Tab>

          <Tab eventKey="orders" title={`📋 ĐƠN HÀNG (${dsDonHang.length})`}><div className="table-responsive"><Table hover bordered className="align-middle bg-white"><thead className="bg-light"><tr><th>Mã</th><th>Ngày</th><th>Khách</th><th>Tổng</th><th>TT</th><th>Xử lý</th></tr></thead><tbody>{dsDonHang.sort((a,b)=>b.ngayDat-a.ngayDat).map(dh=><tr key={dh.id}><td><span className="text-primary fw-bold">{dh.maDonHang||`#${dh.id.slice(0,5)}`}</span></td><td>{dh.ngayDat?.toDate?dh.ngayDat.toDate().toLocaleDateString('vi-VN'):''}</td><td><div className="fw-bold">{dh.khachHang?.ten}</div><small>{dh.khachHang?.sdt}</small></td><td className="text-danger fw-bold">{dh.tongTien?.toLocaleString()}¥</td><td><Badge bg={dh.trangThai==='Hoàn thành'?'success':'warning'}>{dh.trangThai}</Badge></td><td><Button size="sm" variant="info" className="me-1 text-white" onClick={()=>{setSelectedOrder(dh);setModal({...modal, order:true})}}>Xem</Button><Button size="sm" variant="success" className="me-1" onClick={()=>handleUpdateStatusOrder(dh.id,'Hoàn thành')}>✔</Button><Button size="sm" variant="danger" onClick={()=>handleDeleteOrder(dh.id)}>✘</Button></td></tr>)}</tbody></Table></div></Tab>
          <Tab eventKey="menu" title="📂 DANH MỤC"><Button size="sm" className="mb-2 fw-bold" onClick={()=>{setEditData({...editData, dm:null}); setFormDM({ten:'', icon:'', parent:'', order:''}); setModal({...modal, dm:true})}}>+ DANH MỤC</Button><Table bordered size="sm" hover><thead className="bg-light"><tr><th>TT</th><th>Tên</th><th>Icon</th><th>Thao tác</th></tr></thead><tbody>{dsDanhMuc.sort((a,b)=>a.order-b.order).map(d=><tr key={d.id}><td>{d.order}</td><td>{d.parent?'↳ ':''}{d.ten}</td><td>{d.icon}</td><td><Button size="sm" variant="warning" className="me-1" onClick={()=>{setEditData({...editData, dm:d}); setFormDM(d); setModal({...modal, dm:true})}}>✏️</Button><Button size="sm" variant="danger" onClick={()=>handleUpdateDS_DM('DELETE',d.id)}>🗑️</Button></td></tr>)}</tbody></Table></Tab>
          <Tab eventKey="banner" title="🖼️ BANNER"><div className="bg-white p-3"><div className="d-flex gap-2 mb-3"><Form.Control type="file" onChange={e=>handleUpload(e,'BANNER')}/><Form.Control placeholder="Link..." value={formBanner.link} onChange={e=>setFormBanner({...formBanner,link:e.target.value})}/><Button onClick={()=>{add('banners', formBanner); setFormBanner({img:'', link:''})}}>Thêm</Button></div><div className="d-flex flex-wrap gap-2">{dsBanner.map(b=><div key={b.id} className="position-relative" style={{width:200}}><img src={b.img} className="w-100 rounded"/><Button size="sm" variant="danger" className="position-absolute top-0 end-0" onClick={()=>del('banners', b.id)}>X</Button></div>)}</div></div></Tab>
          <Tab eventKey="marketing" title="🎟️ SHIP & COUPON"><Row><Col md={6} className="border-end p-3"><h6 className="fw-bold text-success">MÃ GIẢM GIÁ</h6><div className="d-flex gap-1 mb-2"><Form.Control placeholder="Mã" value={formCoupon.code} onChange={e=>setFormCoupon({...formCoupon,code:e.target.value.toUpperCase()})}/><Form.Control type="number" placeholder="Giảm (¥)" value={formCoupon.giamGia} onChange={e=>setFormCoupon({...formCoupon,giamGia:e.target.value})}/><Button size="sm" onClick={()=>{add('coupons',formCoupon); setFormCoupon({code:'',giamGia:0})}}>Thêm</Button></div><Table size="sm"><tbody>{dsCoupon.map(c=><tr key={c.id}><td>{c.code}</td><td>{parseInt(c.giamGia).toLocaleString()}¥</td><td><Button size="sm" variant="danger" onClick={()=>del('coupons',c.id)}>X</Button></td></tr>)}</tbody></Table></Col><Col md={6} className="p-3"><h6 className="fw-bold text-primary">PHÍ SHIP</h6><div className="d-flex gap-1 mb-2"><Form.Control placeholder="Khu vực" value={formShip.khuVuc} onChange={e=>setFormShip({...formShip,khuVuc:e.target.value})}/><Form.Control type="number" placeholder="Phí (¥)" value={formShip.phi} onChange={e=>setFormShip({...formShip,phi:e.target.value})}/><Button size="sm" onClick={()=>{add('shipping',formShip); setFormShip({khuVuc:'',phi:0})}}>Thêm</Button></div><Table size="sm"><tbody>{dsShip.map(s=><tr key={s.id}><td>{s.khuVuc}</td><td>{parseInt(s.phi).toLocaleString()}¥</td><td><Button size="sm" variant="danger" onClick={()=>del('shipping',s.id)}>X</Button></td></tr>)}</tbody></Table></Col></Row></Tab>
          <Tab eventKey="users" title="👥 USER & REVIEW"><Row><Col md={7}><div className="table-responsive"><Table size="sm"><thead><tr><th>Tên</th><th>Email</th><th>Điểm</th><th>Sửa</th></tr></thead><tbody>{dsUser.map(u=><tr key={u.id}><td>{u.ten}</td><td>{u.email}</td><td>{u.diemTichLuy}</td><td><Button size="sm" onClick={()=>{setEditData({...editData, user:u}); setUserPoint(u.diemTichLuy); setModal({...modal, user:true})}}>Sửa</Button></td></tr>)}</tbody></Table></div></Col><Col md={5}><div style={{maxHeight:400,overflowY:'auto'}}>{dsReview.map(r=><div key={r.id} className="border p-2 mb-2 bg-light rounded"><div className="d-flex justify-content-between"><strong>{r.userName}</strong><small>{r.ngay?.toDate().toLocaleDateString()}</small></div><div className="text-warning">{'⭐'.repeat(r.rating)}</div><p className="mb-1 bg-white p-1 border">{r.comment}</p><Button size="sm" variant="danger" onClick={()=>delReview(r.id)}>Xóa</Button></div>)}</div></Col></Row></Tab>
        </Tabs>
      </Container>

      {/* MODAL SP (FIX ĐÓNG THẺ) */}
      <Modal show={modal.sp} onHide={()=>setModal({...modal,sp:false})} size="lg" centered><Modal.Header closeButton><Modal.Title>{editData.sp?'Cập nhật':'Thêm mới'}</Modal.Title></Modal.Header><Modal.Body><Form><Row><Col md={8}><Form.Group className="mb-2"><Form.Label>Tên sản phẩm</Form.Label><Form.Control value={formDataSP.ten} onChange={e=>setFormDataSP({...formDataSP,ten:e.target.value})}/></Form.Group><Form.Group className="mb-2"><Form.Label>Danh mục</Form.Label><Form.Select value={formDataSP.phanLoai} onChange={e=>setFormDataSP({...formDataSP,phanLoai:e.target.value})}><option value="">-- Chọn --</option>{dsDanhMuc.map(d=><option key={d.id} value={d.id}>{d.parent?'-- ':''}{d.ten}</option>)}</Form.Select></Form.Group><Row><Col><Form.Group className="mb-2"><Form.Label>Đơn vị</Form.Label><Form.Control value={formDataSP.donVi} onChange={e=>setFormDataSP({...formDataSP,donVi:e.target.value})}/></Form.Group></Col><Col><Form.Group className="mb-2"><Form.Label>Kho</Form.Label><Form.Control type="number" value={formDataSP.soLuong} onChange={e=>setFormDataSP({...formDataSP,soLuong:e.target.value})}/></Form.Group></Col></Row><Row><Col><Form.Group className="mb-2"><Form.Label>Giá Gốc</Form.Label><Form.Control type="number" value={formDataSP.giaGoc} onChange={e=>setFormDataSP({...formDataSP,giaGoc:e.target.value})}/></Form.Group></Col><Col><Form.Group className="mb-2"><Form.Label>% Giảm</Form.Label><Form.Control type="number" value={formDataSP.phanTramGiam} onChange={e=>setFormDataSP({...formDataSP,phanTramGiam:e.target.value})}/></Form.Group></Col></Row><Form.Group className="mb-2"><Form.Label className="fw-bold text-danger">Giá Bán</Form.Label><Form.Control className="bg-light fw-bold text-danger" readOnly value={formDataSP.giaBan}/></Form.Group></Col><Col md={4}><Form.Group><Form.Label>Hình ảnh</Form.Label><Form.Control type="file" onChange={e=>handleUpload(e,'PRODUCT')}/></Form.Group><img src={formDataSP.anh||NO_IMAGE} className="w-100 mt-2 border rounded"/></Col></Row><Form.Group className="mt-2"><Form.Label>Mô tả</Form.Label><ReactQuill theme="snow" value={formDataSP.moTa} onChange={v=>setFormDataSP({...formDataSP,moTa:v})}/></Form.Group></Form></Modal.Body><Modal.Footer><Button variant="secondary" onClick={()=>setModal({...modal,sp:false})}>Hủy</Button><Button onClick={()=>{handleUpdateDS_SP(editData.sp?'UPDATE':'ADD', formDataSP); setModal({...modal,sp:false})}}>Lưu</Button></Modal.Footer></Modal>
      <Modal show={modal.dm} onHide={()=>setModal({...modal,dm:false})} centered><Modal.Header closeButton><Modal.Title>Danh mục</Modal.Title></Modal.Header><Modal.Body><Form.Group className="mb-2"><Form.Label>Tên</Form.Label><Form.Control value={formDM.ten} onChange={e=>setFormDM({...formDM,ten:e.target.value})}/></Form.Group><Form.Group className="mb-2"><Form.Label>Thứ tự</Form.Label><Form.Control type="number" value={formDM.order} onChange={e=>setFormDM({...formDM,order:e.target.value})}/></Form.Group><Form.Group className="mb-2"><Form.Label>Icon</Form.Label><Form.Select value={formDM.icon} onChange={e=>setFormDM({...formDM,icon:e.target.value})}><option>-- Chọn --</option>{ICON_LIST.map(i=><option key={i} value={i}>{i}</option>)}</Form.Select></Form.Group><Form.Group><Form.Label>Cha</Form.Label><Form.Select value={formDM.parent} onChange={e=>setFormDM({...formDM,parent:e.target.value})}><option value="">Gốc</option>{dsDanhMuc.filter(d=>!d.parent).map(d=><option key={d.id} value={d.customId||d.id}>{d.ten}</option>)}</Form.Select></Form.Group></Modal.Body><Modal.Footer><Button variant="secondary" onClick={()=>setModal({...modal,dm:false})}>Hủy</Button><Button onClick={()=>{handleUpdateDS_DM(editData.dm?'UPDATE':'ADD', formDM); setModal({...modal,dm:false})}}>Lưu</Button></Modal.Footer></Modal>
      <Modal show={modal.order} onHide={()=>setModal({...modal,order:false})} size="lg" centered><Modal.Header closeButton><Modal.Title>Chi tiết đơn hàng</Modal.Title></Modal.Header><Modal.Body>{selectedOrder && (<div className="p-2"><p><strong>Mã:</strong> {selectedOrder.maDonHang}</p><p><strong>Khách:</strong> {selectedOrder.khachHang?.ten}</p><Table bordered><thead><tr><th>SP</th><th>SL</th><th>Giá</th></tr></thead><tbody>{selectedOrder.gioHang?.map((i,x)=><tr key={x}><td>{i.ten}</td><td>{i.soLuong}</td><td>{i.giaBan}</td></tr>)}</tbody></Table><h4 className="text-end text-danger">{selectedOrder.tongTien?.toLocaleString()}¥</h4></div>)}</Modal.Body><Modal.Footer><Button variant="secondary" onClick={()=>setModal({...modal,order:false})}>Đóng</Button></Modal.Footer></Modal>
      <Modal show={modal.user} onHide={()=>setModal({...modal,user:false})} centered><Modal.Header closeButton><Modal.Title>Sửa điểm</Modal.Title></Modal.Header><Modal.Body><Form.Group><Form.Label>Điểm tích lũy</Form.Label><Form.Control type="number" value={userPoint} onChange={e=>setUserPoint(e.target.value)}/></Form.Group></Modal.Body><Modal.Footer><Button variant="secondary" onClick={()=>setModal({...modal,user:false})}>Hủy</Button><Button onClick={async()=>{await updateDoc(doc(db,"users",editData.user.id),{diemTichLuy:parseInt(userPoint)}); setModal({...modal,user:false})}}>Lưu</Button></Modal.Footer></Modal>
    </div>
  );
}
export default Admin;