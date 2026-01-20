import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Tab, Tabs, Table, Badge, Button, Form, Alert, InputGroup } from 'react-bootstrap';
import { auth, db } from './firebase';
import { doc, getDoc, collection, query, where, getDocs, updateDoc } from 'firebase/firestore';
import { updateProfile, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth'; 
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

function Member() {
  const [userData, setUserData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [passForm, setPassForm] = useState({ oldPass: '', newPass: '', confirmPass: '' });
  const [infoForm, setInfoForm] = useState({ ten: '', sdt: '', diachi: '' });
  
  // State ẩn hiện mật khẩu
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const navigate = useNavigate();
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) { navigate('/auth'); return; }
    const fetchData = async () => {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) { const data = userDoc.data(); setUserData(data); setInfoForm({ ten: data.ten || '', sdt: data.sdt || '', diachi: data.diachi || '' }); }
      const q = query(collection(db, "donHang"), where("userId", "==", user.uid));
      const querySnapshot = await getDocs(q);
      const userOrders = querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      userOrders.sort((a, b) => b.ngayDat - a.ngayDat);
      setOrders(userOrders);
      setLoading(false);
    };
    fetchData();
  }, [user, navigate]);

  const handleUpdateInfo = async () => {
    try { await updateDoc(doc(db, "users", user.uid), { ten: infoForm.ten, sdt: infoForm.sdt, diachi: infoForm.diachi }); await updateProfile(user, { displayName: infoForm.ten }); setUserData({ ...userData, ...infoForm }); toast.success("Cập nhật thành công!"); } catch (error) { toast.error("Lỗi: " + error.message); }
  };

  const handleChangePass = async () => {
    const { oldPass, newPass, confirmPass } = passForm;
    if (!oldPass || !newPass || !confirmPass) return toast.warning("Vui lòng nhập đầy đủ!");
    if (newPass !== confirmPass) return toast.error("Mật khẩu mới không khớp!");
    if (newPass.length < 6) return toast.error("Mật khẩu phải từ 6 ký tự!");
    try {
      const credential = EmailAuthProvider.credential(user.email, oldPass);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPass);
      toast.success("Đổi mật khẩu thành công!");
      setPassForm({ oldPass: '', newPass: '', confirmPass: '' });
    } catch (error) { toast.error("Mật khẩu cũ không đúng hoặc lỗi hệ thống!"); }
  };

  if (loading) return <div className="text-center p-5">Loading...</div>;

  return (
    <Container className="py-5">
      <Row>
        <Col md={4} className="mb-4">
          <Card className="border-0 shadow-sm text-center p-4">
            <div className="mb-3"><div className="rounded-circle bg-success text-white d-flex align-items-center justify-content-center mx-auto" style={{width:'80px', height:'80px', fontSize:'30px'}}>{userData?.ten?.charAt(0).toUpperCase() || 'U'}</div></div><h5 className="fw-bold">{userData?.ten}</h5><p className="text-muted small">{user.email}</p>{userData?.sdt && <p className="mb-1"><i className="fa-solid fa-phone me-2 text-success"></i>{userData.sdt}</p>}<div className="bg-warning bg-opacity-25 p-3 rounded mt-2"><div className="small text-muted text-uppercase fw-bold">Điểm tích lũy</div><div className="display-6 fw-bold text-warning">💎 {userData?.diemTichLuy || 0}</div></div>
          </Card>
        </Col>
        <Col md={8}>
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <Tabs defaultActiveKey="orders" className="mb-4">
                <Tab eventKey="info" title="📝 THÔNG TIN">
                  <Form>
                    <Form.Group className="mb-3"><Form.Label>Họ tên</Form.Label><Form.Control type="text" value={infoForm.ten} onChange={e => setInfoForm({...infoForm, ten: e.target.value})} /></Form.Group><Form.Group className="mb-3"><Form.Label>SĐT</Form.Label><Form.Control type="text" value={infoForm.sdt} onChange={e => setInfoForm({...infoForm, sdt: e.target.value})} /></Form.Group><Form.Group className="mb-3"><Form.Label>Địa chỉ</Form.Label><Form.Control as="textarea" rows={2} value={infoForm.diachi} onChange={e => setInfoForm({...infoForm, diachi: e.target.value})} /></Form.Group><Button variant="success" onClick={handleUpdateInfo}>Lưu thay đổi</Button>
                  </Form>
                </Tab>
                <Tab eventKey="orders" title={`📦 ĐƠN HÀNG`}>
                  {orders.length === 0 ? (<p className="text-center text-muted py-4">Chưa có đơn hàng nào.</p>) : (
                    <div className="table-responsive">
                      <Table hover className="align-middle">
                        <thead className="bg-light"><tr><th>Mã đơn</th><th>Ngày đặt</th><th>Tổng tiền</th><th>Trạng thái</th></tr></thead>
                        <tbody>{orders.map(order => (
                          <tr key={order.id}>
                            {/* Ưu tiên hiện maDonHang mới, nếu đơn cũ không có thì fallback về ID cắt ngắn */}
                            <td><span className="fw-bold text-primary">{order.maDonHang || `#${order.id.slice(0, 8).toUpperCase()}`}</span></td>
                            <td>{order.ngayDat?.toDate ? order.ngayDat.toDate().toLocaleDateString('vi-VN') : 'Mới'}</td>
                            <td className="text-danger fw-bold">{order.tongTien?.toLocaleString()} ¥</td>
                            <td><Badge bg={order.trangThai === 'Hoàn thành' ? 'success' : 'warning'}>{order.trangThai}</Badge></td>
                          </tr>
                        ))}</tbody>
                      </Table>
                    </div>
                  )}
                </Tab>
                <Tab eventKey="account" title="🔒 ĐỔI MẬT KHẨU">
                  <Form>
                    <Alert variant="warning" className="small p-2"><i className="fa-solid fa-shield-halved me-1"></i> Bắt buộc nhập mật khẩu cũ.</Alert>
                    
                    {/* --- Ô MẬT KHẨU CŨ (ĐÃ THÊM) --- */}
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-bold">Mật khẩu cũ (*)</Form.Label>
                      <InputGroup>
                        <Form.Control type={showOld?"text":"password"} value={passForm.oldPass} onChange={e=>setPassForm({...passForm,oldPass:e.target.value})} placeholder="Mật khẩu hiện tại" />
                        <Button variant="outline-secondary" onClick={()=>setShowOld(!showOld)}><i className={showOld?"fa-solid fa-eye-slash":"fa-solid fa-eye"}></i></Button>
                      </InputGroup>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label className="fw-bold">Mật khẩu mới (*)</Form.Label>
                      <InputGroup>
                        <Form.Control type={showNew?"text":"password"} value={passForm.newPass} onChange={e=>setPassForm({...passForm,newPass:e.target.value})} placeholder="Mật khẩu mới" />
                        <Button variant="outline-secondary" onClick={()=>setShowNew(!showNew)}><i className={showNew?"fa-solid fa-eye-slash":"fa-solid fa-eye"}></i></Button>
                      </InputGroup>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label className="fw-bold">Xác nhận mật khẩu (*)</Form.Label>
                      <InputGroup>
                        <Form.Control type={showConfirm?"text":"password"} value={passForm.confirmPass} onChange={e=>setPassForm({...passForm,confirmPass:e.target.value})} placeholder="Nhập lại mật khẩu mới" />
                        <Button variant="outline-secondary" onClick={()=>setShowConfirm(!showConfirm)}><i className={showConfirm?"fa-solid fa-eye-slash":"fa-solid fa-eye"}></i></Button>
                      </InputGroup>
                    </Form.Group>

                    <Button variant="danger" onClick={handleChangePass}>Cập nhật mật khẩu</Button>
                  </Form>
                </Tab>
              </Tabs>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
export default Member;