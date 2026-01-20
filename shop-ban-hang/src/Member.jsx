import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Tab, Tabs, Table, Badge, Button, Form } from 'react-bootstrap';
import { auth, db } from './firebase';
import { doc, getDoc, collection, query, where, getDocs, updateDoc } from 'firebase/firestore';
import { updateProfile, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth'; // Import thêm
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

function Member() {
  const [userData, setUserData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State đổi mật khẩu: thêm oldPass
  const [passForm, setPassForm] = useState({ oldPass: '', newPass: '', confirmPass: '' });
  
  const [infoForm, setInfoForm] = useState({ ten: '', sdt: '', diachi: '' });

  const navigate = useNavigate();
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) { navigate('/auth'); return; }

    const fetchData = async () => {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setUserData(data);
        setInfoForm({ ten: data.ten || '', sdt: data.sdt || '', diachi: data.diachi || '' });
      }

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
    try {
      await updateDoc(doc(db, "users", user.uid), {
        ten: infoForm.ten, sdt: infoForm.sdt, diachi: infoForm.diachi
      });
      await updateProfile(user, { displayName: infoForm.ten });
      setUserData({ ...userData, ...infoForm });
      toast.success("Cập nhật thông tin thành công!");
    } catch (error) { toast.error("Lỗi: " + error.message); }
  };

  // --- LOGIC ĐỔI MẬT KHẨU (ĐÃ FIX) ---
  const handleChangePass = async () => {
    const { oldPass, newPass, confirmPass } = passForm;

    // 1. Kiểm tra đầu vào
    if (!oldPass || !newPass || !confirmPass) return toast.warning("Vui lòng nhập đầy đủ thông tin!");
    if (newPass !== confirmPass) return toast.error("Mật khẩu mới không khớp!");
    if (newPass.length < 6) return toast.error("Mật khẩu mới phải từ 6 ký tự trở lên!");
    if (oldPass === newPass) return toast.error("Mật khẩu mới không được trùng mật khẩu cũ!");

    try {
      // 2. Xác thực lại người dùng bằng mật khẩu cũ (Bắt buộc)
      const credential = EmailAuthProvider.credential(user.email, oldPass);
      await reauthenticateWithCredential(user, credential);

      // 3. Nếu xác thực OK thì mới đổi pass
      await updatePassword(user, newPass);
      
      toast.success("Đổi mật khẩu thành công! Vui lòng đăng nhập lại.");
      setPassForm({ oldPass: '', newPass: '', confirmPass: '' });
      // Có thể logout luôn để an toàn: await auth.signOut(); navigate('/auth');
    } catch (error) {
      if(error.code === 'auth/wrong-password') toast.error("Mật khẩu cũ không chính xác!");
      else toast.error("Lỗi: " + error.message);
    }
  };

  if (loading) return <div className="text-center p-5">Đang tải thông tin...</div>;

  return (
    <Container className="py-5">
      <Row>
        <Col md={4} className="mb-4">
          <Card className="border-0 shadow-sm text-center p-4">
            <div className="mb-3">
              <div className="rounded-circle bg-success text-white d-flex align-items-center justify-content-center mx-auto" style={{width:'80px', height:'80px', fontSize:'30px'}}>
                {userData?.ten?.charAt(0).toUpperCase() || 'U'}
              </div>
            </div>
            <h5 className="fw-bold">{userData?.ten}</h5>
            <p className="text-muted small">{user.email}</p>
            {userData?.sdt && <p className="mb-1"><i className="fa-solid fa-phone me-2 text-success"></i>{userData.sdt}</p>}
            <div className="bg-warning bg-opacity-25 p-3 rounded mt-2">
              <div className="small text-muted text-uppercase fw-bold">Điểm tích lũy</div>
              <div className="display-6 fw-bold text-warning">💎 {userData?.diemTichLuy || 0}</div>
            </div>
          </Card>
        </Col>

        <Col md={8}>
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <Tabs defaultActiveKey="info" className="mb-4">
                
                <Tab eventKey="info" title="📝 THÔNG TIN CÁ NHÂN">
                  <Form>
                    <Form.Group className="mb-3"><Form.Label>Họ và tên</Form.Label><Form.Control type="text" value={infoForm.ten} onChange={e => setInfoForm({...infoForm, ten: e.target.value})} /></Form.Group>
                    <Form.Group className="mb-3"><Form.Label>Số điện thoại</Form.Label><Form.Control type="text" value={infoForm.sdt} onChange={e => setInfoForm({...infoForm, sdt: e.target.value})} placeholder="Thêm số điện thoại" /></Form.Group>
                    <Form.Group className="mb-3"><Form.Label>Địa chỉ mặc định</Form.Label><Form.Control as="textarea" rows={2} value={infoForm.diachi} onChange={e => setInfoForm({...infoForm, diachi: e.target.value})} placeholder="Địa chỉ giao hàng" /></Form.Group>
                    <Button variant="success" onClick={handleUpdateInfo}>Lưu thay đổi</Button>
                  </Form>
                </Tab>

                <Tab eventKey="orders" title={`📦 LỊCH SỬ MUA HÀNG`}>
                  {orders.length === 0 ? (<p className="text-center text-muted py-4">Bạn chưa có đơn hàng nào.</p>) : (
                    <div className="table-responsive">
                      <Table hover className="align-middle">
                        <thead className="bg-light"><tr><th>Mã đơn</th><th>Ngày đặt</th><th>Tổng tiền</th><th>Trạng thái</th></tr></thead>
                        <tbody>{orders.map(order => (<tr key={order.id}><td><small>#{order.id.slice(0, 8)}...</small></td><td>{order.ngayDat?.toDate ? order.ngayDat.toDate().toLocaleDateString('vi-VN') : 'Mới'}</td><td className="text-danger fw-bold">{order.tongTien?.toLocaleString()} ¥</td><td><Badge bg={order.trangThai === 'Hoàn thành' ? 'success' : 'warning'}>{order.trangThai}</Badge></td></tr>))}</tbody>
                      </Table>
                    </div>
                  )}
                </Tab>

                {/* TAB ĐỔI MẬT KHẨU (ĐÃ CẬP NHẬT) */}
                <Tab eventKey="account" title="🔒 ĐỔI MẬT KHẨU">
                  <Form>
                    <Alert variant="warning" className="small p-2">
                      <i className="fa-solid fa-shield-halved me-1"></i> Để bảo mật, vui lòng nhập mật khẩu cũ trước khi thay đổi.
                    </Alert>
                    
                    {/* Ô NHẬP MẬT KHẨU CŨ */}
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-bold">Mật khẩu cũ (*)</Form.Label>
                      <Form.Control type="password" value={passForm.oldPass} onChange={e => setPassForm({...passForm, oldPass: e.target.value})} placeholder="Nhập mật khẩu hiện tại" />
                    </Form.Group>

                    <div className="border-top pt-3 mt-3">
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-bold">Mật khẩu mới (*)</Form.Label>
                        <Form.Control type="password" value={passForm.newPass} onChange={e => setPassForm({...passForm, newPass: e.target.value})} placeholder="Ít nhất 6 ký tự" />
                        <Form.Text className="text-muted small">Nên dùng chữ hoa, chữ thường và số.</Form.Text>
                      </Form.Group>
                      
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-bold">Nhập lại mật khẩu mới (*)</Form.Label>
                        <Form.Control type="password" value={passForm.confirmPass} onChange={e => setPassForm({...passForm, confirmPass: e.target.value})} />
                      </Form.Group>
                    </div>

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