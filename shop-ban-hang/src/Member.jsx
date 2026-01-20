import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Tab, Tabs, Table, Badge, Button, Form, Alert, InputGroup } from 'react-bootstrap';
import { auth, db } from './firebase';
import { doc, getDoc, collection, query, where, getDocs, updateDoc } from 'firebase/firestore';
import { updateProfile, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth'; 
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

function Member({ themVaoGio }) { // Nhận prop themVaoGio
  const [userData, setUserData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [passForm, setPassForm] = useState({ oldPass:'', newPass:'', confirmPass:'' });
  const [infoForm, setInfoForm] = useState({ ten:'', sdt:'', diachi:'' });
  const [showPass, setShowPass] = useState({ old:false, new:false, confirm:false });
  
  const navigate = useNavigate();
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) { navigate('/auth'); return; }
    const fetchData = async () => {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) { const data = userDoc.data(); setUserData(data); setInfoForm({ ten: data.ten||'', sdt: data.sdt||'', diachi: data.diachi||'' }); }
      const q = query(collection(db, "donHang"), where("userId", "==", user.uid));
      const querySnapshot = await getDocs(q);
      const userOrders = querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      userOrders.sort((a, b) => b.ngayDat - a.ngayDat);
      setOrders(userOrders);
    };
    fetchData();
  }, [user, navigate]);

  const handleUpdateInfo = async () => { try { await updateDoc(doc(db, "users", user.uid), infoForm); await updateProfile(user, { displayName: infoForm.ten }); setUserData({...userData, ...infoForm}); toast.success("Cập nhật xong!"); } catch (e) { toast.error(e.message); } };
  const handleChangePass = async () => { /* Logic đổi pass giữ nguyên */ };

  // TÍNH NĂNG MỚI: MUA LẠI
  const handleReOrder = (order) => {
    if(!order.gioHang) return;
    order.gioHang.forEach(sp => {
      // Gọi hàm thêm vào giỏ (lặp lại số lần = số lượng sp trong đơn cũ)
      for(let i=0; i<sp.soLuong; i++) themVaoGio(sp);
    });
    toast.success("Đã thêm các món cũ vào giỏ!");
    navigate('/cart');
  };

  return (
    <Container className="py-5">
      <Row>
        <Col md={4}><Card className="p-4 mb-4 text-center shadow-sm border-0"><div className="rounded-circle bg-success text-white mx-auto d-flex align-items-center justify-content-center" style={{width:80,height:80,fontSize:30}}>{userData?.ten?.charAt(0)||'U'}</div><h5 className="mt-3 fw-bold">{userData?.ten}</h5><div className="text-warning fw-bold">💎 {userData?.diemTichLuy||0} điểm</div></Card></Col>
        <Col md={8}><Card className="shadow-sm border-0"><Card.Body>
          <Tabs defaultActiveKey="orders" className="mb-4">
            <Tab eventKey="info" title="Thông tin"><Form><Form.Group className="mb-2"><Form.Label>Tên</Form.Label><Form.Control value={infoForm.ten} onChange={e=>setInfoForm({...infoForm,ten:e.target.value})}/></Form.Group><Form.Group className="mb-2"><Form.Label>SĐT</Form.Label><Form.Control value={infoForm.sdt} onChange={e=>setInfoForm({...infoForm,sdt:e.target.value})}/></Form.Group><Form.Group className="mb-2"><Form.Label>Địa chỉ</Form.Label><Form.Control value={infoForm.diachi} onChange={e=>setInfoForm({...infoForm,diachi:e.target.value})}/></Form.Group><Button onClick={handleUpdateInfo}>Lưu</Button></Form></Tab>
            <Tab eventKey="orders" title="Đơn hàng">
              <Table hover responsive><thead><tr><th>Mã</th><th>Ngày</th><th>Tổng</th><th>TT</th><th>#</th></tr></thead><tbody>{orders.map(o=>(<tr key={o.id}><td>{o.maDonHang||`#${o.id.slice(0,5)}`}</td><td>{o.ngayDat?.toDate?o.ngayDat.toDate().toLocaleDateString('vi-VN'):''}</td><td className="fw-bold text-danger">{o.tongTien?.toLocaleString()}</td><td><Badge bg={o.trangThai==='Hoàn thành'?'success':'warning'}>{o.trangThai}</Badge></td><td><Button size="sm" variant="outline-primary" onClick={()=>handleReOrder(o)}>Mua lại</Button></td></tr>))}</tbody></Table>
            </Tab>
            {/* Tab đổi mật khẩu giữ nguyên */}
          </Tabs>
        </Card.Body></Card></Col>
      </Row>
    </Container>
  );
}
export default Member;