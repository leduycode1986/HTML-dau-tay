import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Tab, Nav, Table, Badge, Modal, Alert, Spinner } from 'react-bootstrap';
import { auth, db } from './firebase';
import { onAuthStateChanged, updateProfile, updatePassword } from 'firebase/auth';
import { doc, getDoc, updateDoc, collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

function Member({ themVaoGio }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null); // Dữ liệu từ Firestore (điểm, sđt...)
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State cho form đổi thông tin
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  
  // State cho form đổi mật khẩu
  const [passData, setPassData] = useState({ newPass: '', confirmPass: '' });
  
  // State xem chi tiết đơn hàng
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // 1. Kiểm tra đăng nhập và lấy dữ liệu
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        navigate('/auth'); // Chưa đăng nhập thì đá về trang login
        return;
      }
      setUser(currentUser);
      setName(currentUser.displayName || '');

      // Lấy thêm thông tin từ Firestore (SĐT, Địa chỉ, Điểm)
      try {
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists()) {
           const data = userDoc.data();
           setUserData(data);
           setPhone(data.sdt || '');
           setAddress(data.diaChi || '');
        }

        // Lấy danh sách đơn hàng của user
        const q = query(collection(db, "donHang"), where("userId", "==", currentUser.uid)); // orderBy cần index, tạm thời sort client
        const orderSnap = await getDocs(q);
        const orderList = orderSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        
        // Sắp xếp đơn mới nhất lên đầu
        orderList.sort((a,b) => (b.ngayDat?.seconds || 0) - (a.ngayDat?.seconds || 0));
        setOrders(orderList);

      } catch (err) {
        console.error("Lỗi tải dữ liệu thành viên:", err);
      } finally {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  // 2. Cập nhật thông tin cá nhân
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      // Cập nhật Auth
      await updateProfile(user, { displayName: name });
      
      // Cập nhật Firestore
      await updateDoc(doc(db, "users", user.uid), {
        ten: name,
        sdt: phone,
        diaChi: address
      });
      toast.success("Cập nhật thông tin thành công!");
    } catch (error) {
      toast.error("Lỗi: " + error.message);
    }
  };

  // 3. Đổi mật khẩu
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passData.newPass.length < 6) return toast.warning("Mật khẩu phải trên 6 ký tự");
    if (passData.newPass !== passData.confirmPass) return toast.warning("Mật khẩu nhập lại không khớp");

    try {
      await updatePassword(user, passData.newPass);
      toast.success("Đổi mật khẩu thành công!");
      setPassData({ newPass: '', confirmPass: '' });
    } catch (error) {
      toast.error("Lỗi: " + error.message + " (Bạn cần đăng nhập lại để thực hiện)");
    }
  };

  // Helper màu trạng thái
  const getStatusBadge = (status) => {
      if(status === 'Hoàn thành') return 'success';
      if(status === 'Đã hủy') return 'danger';
      if(status === 'Đang giao') return 'info';
      return 'warning';
  }

  if (loading) return <div className="text-center py-5"><Spinner animation="border" variant="success" /></div>;

  return (
    <Container className="py-5">
      <Row>
        {/* --- CỘT TRÁI: SIDEBAR THÔNG TIN --- */}
        <Col lg={4} className="mb-4">
          <Card className="member-sidebar-card p-4 text-center">
             <div className="member-avatar-box">
                {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
             </div>
             <h5 className="fw-bold m-0">{user.displayName || 'Thành viên'}</h5>
             <p className="text-muted small">{user.email}</p>
             
             <div className="mt-2">
                <span className="member-rank-badge">
                   <i className="fa-solid fa-crown me-1"></i> {userData?.diemTichLuy > 1000 ? 'KHÁCH VIP' : 'THÀNH VIÊN'}
                </span>
             </div>
             
             <div className="mt-4 border-top pt-3 d-flex justify-content-between px-3">
                <div className="text-center">
                    <h5 className="fw-bold text-success m-0">{orders.length}</h5>
                    <small className="text-muted">Đơn hàng</small>
                </div>
                <div className="text-center border-start ps-3">
                    <h5 className="fw-bold text-warning m-0">{userData?.diemTichLuy || 0}</h5>
                    <small className="text-muted">Điểm tích lũy</small>
                </div>
             </div>
          </Card>
        </Col>

        {/* --- CỘT PHẢI: TAB CHỨC NĂNG --- */}
        <Col lg={8}>
          <Card className="member-content-card p-3">
            <Tab.Container defaultActiveKey="history">
              <Nav variant="pills" className="custom-tabs mb-4 justify-content-center bg-light p-1 rounded-pill" style={{width:'fit-content', margin:'0 auto'}}>
                <Nav.Item><Nav.Link eventKey="history"><i className="fa-solid fa-clock-rotate-left me-2"></i> Lịch sử đơn hàng</Nav.Link></Nav.Item>
                <Nav.Item><Nav.Link eventKey="profile"><i className="fa-solid fa-user-pen me-2"></i> Thông tin cá nhân</Nav.Link></Nav.Item>
                <Nav.Item><Nav.Link eventKey="password"><i className="fa-solid fa-key me-2"></i> Đổi mật khẩu</Nav.Link></Nav.Item>
              </Nav>

              <Tab.Content>
                {/* 1. LỊCH SỬ ĐƠN HÀNG */}
                <Tab.Pane eventKey="history">
                  {orders.length === 0 ? (
                    <div className="text-center py-5">
                        <div className="fs-1 text-muted mb-3"><i className="fa-solid fa-box-open"></i></div>
                        <p>Bạn chưa có đơn hàng nào.</p>
                        <Button variant="success" onClick={()=>navigate('/')}>Mua sắm ngay</Button>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <Table hover className="order-table align-middle">
                        <thead><tr><th>Mã đơn</th><th>Ngày đặt</th><th>Tổng tiền</th><th>Trạng thái</th><th>Chi tiết</th></tr></thead>
                        <tbody>
                          {orders.map(od => (
                            <tr key={od.id}>
                              <td className="fw-bold text-primary">#{od.maDonHang || od.id.slice(0,6)}</td>
                              <td>{od.ngayDat?.toDate ? od.ngayDat.toDate().toLocaleDateString('vi-VN') : ''}</td>
                              <td className="fw-bold">{od.tongTien?.toLocaleString()} ¥</td>
                              <td><Badge bg={getStatusBadge(od.trangThai)}>{od.trangThai}</Badge></td>
                              <td>
                                <Button size="sm" variant="outline-primary" className="btn-reorder" onClick={()=>{setSelectedOrder(od); setShowModal(true)}}>Xem</Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  )}
                </Tab.Pane>

                {/* 2. CẬP NHẬT THÔNG TIN */}
                <Tab.Pane eventKey="profile">
                  <Form onSubmit={handleUpdateProfile} className="px-md-4 py-2">
                    <Form.Group className="mb-3">
                        <Form.Label className="fw-bold">Họ và tên</Form.Label>
                        <Form.Control value={name} onChange={e=>setName(e.target.value)} required />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label className="fw-bold">Số điện thoại</Form.Label>
                        <Form.Control value={phone} onChange={e=>setPhone(e.target.value)} placeholder="Cập nhật SĐT để giao hàng..." />
                    </Form.Group>
                    <Form.Group className="mb-4">
                        <Form.Label className="fw-bold">Địa chỉ giao hàng mặc định</Form.Label>
                        <Form.Control as="textarea" rows={2} value={address} onChange={e=>setAddress(e.target.value)} placeholder="Nhập địa chỉ..." />
                    </Form.Group>
                    <div className="text-end">
                        <Button type="submit" variant="success" className="px-4 fw-bold">LƯU THAY ĐỔI</Button>
                    </div>
                  </Form>
                </Tab.Pane>
                
                {/* 3. ĐỔI MẬT KHẨU */}
                <Tab.Pane eventKey="password">
                   <Form onSubmit={handleChangePassword} className="px-md-5 py-3">
                      <Alert variant="info" className="small"><i className="fa-solid fa-circle-info me-2"></i> Lưu ý: Nếu bạn đăng nhập bằng Google/Facebook, bạn không cần đổi mật khẩu tại đây.</Alert>
                      <Form.Group className="mb-3">
                          <Form.Label className="fw-bold">Mật khẩu mới</Form.Label>
                          <Form.Control type="password" value={passData.newPass} onChange={e=>setPassData({...passData, newPass:e.target.value})} />
                      </Form.Group>
                      <Form.Group className="mb-4">
                          <Form.Label className="fw-bold">Xác nhận mật khẩu</Form.Label>
                          <Form.Control type="password" value={passData.confirmPass} onChange={e=>setPassData({...passData, confirmPass:e.target.value})} />
                      </Form.Group>
                      <Button type="submit" variant="warning" className="w-100 fw-bold text-white">XÁC NHẬN ĐỔI</Button>
                   </Form>
                </Tab.Pane>
              </Tab.Content>
            </Tab.Container>
          </Card>
        </Col>
      </Row>

      {/* MODAL CHI TIẾT ĐƠN HÀNG */}
      <Modal show={showModal} onHide={()=>setShowModal(false)} size="lg" centered>
        <Modal.Header closeButton className="bg-success text-white"><Modal.Title>Chi tiết đơn hàng</Modal.Title></Modal.Header>
        <Modal.Body>
           {selectedOrder && (
             <div>
                <p><strong>Mã đơn:</strong> <span className="text-primary fw-bold">#{selectedOrder.maDonHang || selectedOrder.id}</span></p>
                <p><strong>Ngày đặt:</strong> {selectedOrder.ngayDat?.toDate?.().toLocaleString('vi-VN')}</p>
                <p><strong>Trạng thái:</strong> <Badge bg={getStatusBadge(selectedOrder.trangThai)}>{selectedOrder.trangThai}</Badge></p>
                <div className="table-responsive mt-3">
                   <Table bordered size="sm">
                      <thead className="bg-light"><tr><th>Sản phẩm</th><th>Đơn giá</th><th>SL</th><th>Thành tiền</th></tr></thead>
                      <tbody>
                         {selectedOrder.gioHang?.map((sp,i)=>(
                            <tr key={i}>
                               <td>{sp.ten}</td>
                               <td>{sp.giaBan?.toLocaleString()}</td>
                               <td>{sp.soLuong}</td>
                               <td>{(sp.giaBan*sp.soLuong).toLocaleString()}</td>
                            </tr>
                         ))}
                      </tbody>
                      <tfoot>
                         <tr>
                            <td colSpan="3" className="text-end fw-bold">Tổng cộng:</td>
                            <td className="fw-bold text-danger">{selectedOrder.tongTien?.toLocaleString()} ¥</td>
                         </tr>
                      </tfoot>
                   </Table>
                </div>
             </div>
           )}
        </Modal.Body>
        <Modal.Footer>
           <Button variant="secondary" onClick={()=>setShowModal(false)}>Đóng</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default Member;