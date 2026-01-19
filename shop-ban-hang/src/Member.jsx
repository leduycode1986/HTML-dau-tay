import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Tab, Tabs, Table, Badge, Button, Form } from 'react-bootstrap';
import { auth, db } from './firebase';
import { doc, getDoc, collection, query, where, getDocs, updateDoc } from 'firebase/firestore';
import { updateProfile, updatePassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

function Member() {
  const [userData, setUserData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [passForm, setPassForm] = useState({ newPass: '', confirmPass: '' });
  const navigate = useNavigate();
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) { navigate('/auth'); return; }

    const fetchData = async () => {
      // 1. Lấy thông tin user & điểm
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) setUserData(userDoc.data());

      // 2. Lấy danh sách đơn hàng của user này
      const q = query(collection(db, "donHang"), where("userId", "==", user.uid));
      const querySnapshot = await getDocs(q);
      const userOrders = querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      // Sắp xếp đơn mới nhất lên đầu
      userOrders.sort((a, b) => b.ngayDat - a.ngayDat);
      setOrders(userOrders);
      setLoading(false);
    };
    fetchData();
  }, [user, navigate]);

  const handleChangePass = async () => {
    if (passForm.newPass !== passForm.confirmPass) return toast.error("Mật khẩu không khớp!");
    if (passForm.newPass.length < 6) return toast.error("Mật khẩu quá ngắn!");
    try {
      await updatePassword(user, passForm.newPass);
      toast.success("Đổi mật khẩu thành công!");
      setPassForm({ newPass: '', confirmPass: '' });
    } catch (error) {
      toast.error("Lỗi: " + error.message); // Thường do chưa đăng nhập lại gần đây
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
            <div className="bg-warning bg-opacity-25 p-3 rounded mt-2">
              <div className="small text-muted text-uppercase fw-bold">Điểm tích lũy</div>
              <div className="display-6 fw-bold text-warning">💎 {userData?.diemTichLuy || 0}</div>
            </div>
          </Card>
        </Col>

        <Col md={8}>
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <Tabs defaultActiveKey="orders" className="mb-4">
                <Tab eventKey="orders" title={`📦 ĐƠN HÀNG CỦA TÔI (${orders.length})`}>
                  {orders.length === 0 ? (
                    <p className="text-center text-muted py-4">Bạn chưa có đơn hàng nào.</p>
                  ) : (
                    <div className="table-responsive">
                      <Table hover className="align-middle">
                        <thead className="bg-light"><tr><th>Mã đơn</th><th>Ngày đặt</th><th>Tổng tiền</th><th>Trạng thái</th></tr></thead>
                        <tbody>
                          {orders.map(order => (
                            <tr key={order.id}>
                              <td><small>#{order.id.slice(0, 8)}...</small></td>
                              <td>{order.ngayDat?.toDate ? order.ngayDat.toDate().toLocaleDateString('vi-VN') : 'Mới'}</td>
                              <td className="text-danger fw-bold">{order.tongTien?.toLocaleString()} ¥</td>
                              <td><Badge bg={order.trangThai === 'Hoàn thành' ? 'success' : 'warning'}>{order.trangThai}</Badge></td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  )}
                </Tab>

                <Tab eventKey="account" title="🔒 ĐỔI MẬT KHẨU">
                  <Form>
                    <Form.Group className="mb-3">
                      <Form.Label>Mật khẩu mới</Form.Label>
                      <Form.Control type="password" value={passForm.newPass} onChange={e => setPassForm({...passForm, newPass: e.target.value})} />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Nhập lại mật khẩu mới</Form.Label>
                      <Form.Control type="password" value={passForm.confirmPass} onChange={e => setPassForm({...passForm, confirmPass: e.target.value})} />
                    </Form.Group>
                    <Button variant="success" onClick={handleChangePass}>Cập nhật mật khẩu</Button>
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