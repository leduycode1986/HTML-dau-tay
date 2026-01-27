import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Tab, Tabs, Table, Badge, Button, Form } from 'react-bootstrap';
import { auth, db } from './firebase';
import { doc, getDoc, collection, query, where, getDocs, updateDoc } from 'firebase/firestore';
import { updateProfile, onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

function Member({ themVaoGio }) {
  const [userData, setUserData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [infoForm, setInfoForm] = useState({ ten:'', sdt:'', diachi:'' });
  const [loading, setLoading] = useState(true);
  
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // 1. Lấy thông tin user
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) { 
            const data = userDoc.data(); 
            setUserData(data); 
            setInfoForm({ ten: data.ten||'', sdt: data.sdt||'', diachi: data.diachi||'' }); 
          }

          // 2. Lấy lịch sử đơn hàng
          const q = query(collection(db, "donHang"), where("userId", "==", user.uid));
          const querySnapshot = await getDocs(q);
          const userOrders = querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
          userOrders.sort((a, b) => b.ngayDat - a.ngayDat);
          setOrders(userOrders);
        } catch (error) {
          console.error("Lỗi tải dữ liệu:", error);
        } finally {
          setLoading(false);
        }
      } else {
        navigate('/auth');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleUpdateInfo = async () => { 
    if(!auth.currentUser) return;
    try { 
      await updateDoc(doc(db, "users", auth.currentUser.uid), infoForm); 
      await updateProfile(auth.currentUser, { displayName: infoForm.ten }); 
      setUserData({...userData, ...infoForm}); 
      toast.success("Cập nhật thông tin thành công!"); 
    } catch (e) { 
      toast.error("Lỗi: " + e.message); 
    } 
  };

  const handleReOrder = (order) => {
    if(!order.gioHang) return;
    order.gioHang.forEach(sp => {
      for(let i=0; i<sp.soLuong; i++) themVaoGio(sp);
    });
    toast.success("Đã thêm đơn hàng cũ vào giỏ!");
    navigate('/cart');
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Hoàn thành': return 'success';
      case 'Đang giao': return 'primary';
      case 'Hủy': return 'danger';
      default: return 'warning';
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f4f6f9' }}>
        <div className="text-center">
           <div className="spinner-border text-success" role="status"></div>
           <p className="mt-2 text-muted fw-bold">Đang tải dữ liệu thành viên...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#f4f6f9', minHeight: '80vh', padding: '40px 0' }}>
      <Container>
        <Row className="g-4">
          {/* CỘT TRÁI: THÔNG TIN CÁ NHÂN */}
          <Col md={4} lg={3}>
            <Card className="member-sidebar-card text-center p-4">
              <div className="member-avatar-box">
                {userData?.ten?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <h5 className="fw-bold mb-1">{userData?.ten || 'Thành viên mới'}</h5>
              <div className="text-muted small mb-2">{userData?.email || auth.currentUser?.email}</div>
              
              <div>
                <span className="member-rank-badge">
                  <i className="fa-regular fa-gem me-1"></i> 
                  {userData?.diemTichLuy ? `${userData.diemTichLuy} Điểm` : '0 Điểm'}
                </span>
              </div>
              
              <hr className="my-3 opacity-25" />
              <div className="text-start small text-secondary">
                 <p className="mb-2"><i className="fa-solid fa-phone me-2"></i> {userData?.sdt || 'Chưa cập nhật'}</p>
                 <p className="mb-0"><i className="fa-solid fa-location-dot me-2"></i> {userData?.diachi || 'Chưa cập nhật'}</p>
              </div>
            </Card>
          </Col>

          {/* CỘT PHẢI: NỘI DUNG CHÍNH (TABS) */}
          <Col md={8} lg={9}>
            <Card className="member-content-card">
              <Card.Body className="p-4">
                <Tabs defaultActiveKey="orders" className="custom-tabs mb-4" variant="pills">
                  
                  {/* TAB 1: LỊCH SỬ ĐƠN HÀNG */}
                  <Tab eventKey="orders" title={<span><i className="fa-solid fa-clock-rotate-left me-2"></i> Lịch sử đơn hàng</span>}>
                    {orders.length > 0 ? (
                      <Table hover responsive className="order-table mb-0">
                        <thead>
                          <tr>
                            <th>Mã Đơn</th>
                            <th>Ngày đặt</th>
                            <th>Tổng tiền</th>
                            <th>Trạng thái</th>
                            <th className="text-end">Hành động</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orders.map(o => (
                            <tr key={o.id}>
                              <td>
                                <span className="fw-bold text-dark">#{o.id.slice(0,6).toUpperCase()}</span>
                              </td>
                              <td>
                                {/* --- ĐÃ SỬA LỖI Ở ĐÂY --- */}
                                {o.ngayDat?.toDate ? o.ngayDat.toDate().toLocaleDateString('vi-VN') : '---'}
                                <div className="small text-muted">
                                  {o.ngayDat?.toDate ? o.ngayDat.toDate().toLocaleTimeString('vi-VN') : ''}
                                </div>
                                {/* ------------------------ */}
                              </td>
                              <td className="fw-bold text-danger">
                                {o.tongTien?.toLocaleString()}₫
                              </td>
                              <td>
                                <Badge bg={getStatusBadge(o.trangThai)} pill className="px-3 py-2">
                                  {o.trangThai}
                                </Badge>
                              </td>
                              <td className="text-end">
                                <Button size="sm" className="btn-reorder" onClick={() => handleReOrder(o)}>
                                  <i className="fa-solid fa-cart-plus me-1"></i> Mua lại
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    ) : (
                      <div className="text-center py-5">
                        <img src="https://cdn-icons-png.flaticon.com/512/2038/2038854.png" width="80" className="mb-3 opacity-50" alt="Empty" />
                        <p className="text-muted">Bạn chưa có đơn hàng nào.</p>
                        <Button variant="success" onClick={()=>navigate('/')}>Mua sắm ngay</Button>
                      </div>
                    )}
                  </Tab>

                  {/* TAB 2: CẬP NHẬT THÔNG TIN */}
                  <Tab eventKey="info" title={<span><i className="fa-solid fa-user-pen me-2"></i> Cập nhật thông tin</span>}>
                    <Form className="row g-3 mt-1">
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label className="fw-bold text-secondary small">Họ và tên</Form.Label>
                          <Form.Control type="text" className="auth-input" value={infoForm.ten} onChange={e=>setInfoForm({...infoForm,ten:e.target.value})} />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label className="fw-bold text-secondary small">Số điện thoại</Form.Label>
                          <Form.Control type="text" className="auth-input" value={infoForm.sdt} onChange={e=>setInfoForm({...infoForm,sdt:e.target.value})} />
                        </Form.Group>
                      </Col>
                      <Col md={12}>
                        <Form.Group>
                          <Form.Label className="fw-bold text-secondary small">Địa chỉ nhận hàng</Form.Label>
                          <Form.Control type="text" className="auth-input" value={infoForm.diachi} onChange={e=>setInfoForm({...infoForm,diachi:e.target.value})} />
                        </Form.Group>
                      </Col>
                      <Col md={12}>
                        <Button variant="success" onClick={handleUpdateInfo} className="fw-bold px-4 mt-2">
                          <i className="fa-solid fa-floppy-disk me-2"></i> Lưu thay đổi
                        </Button>
                      </Col>
                    </Form>
                  </Tab>

                </Tabs>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
export default Member;