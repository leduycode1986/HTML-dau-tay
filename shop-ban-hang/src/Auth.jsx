import React, { useState } from 'react';
import { Form, Button, Container, Modal } from 'react-bootstrap';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, sendPasswordResetEmail } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';

function Auth() {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '', confirmPassword: '', name: '' });
  
  // State cho quên mật khẩu
  const [showForgot, setShowForgot] = useState(false);
  const [emailForgot, setEmailForgot] = useState('');

  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleAuth = async (e) => {
    e.preventDefault();
    const { email, password, confirmPassword, name } = formData;

    try {
      if (isRegister) {
        // Validate mật khẩu
        if (password.length < 6) return toast.error("Mật khẩu quá ngắn! Phải từ 6 ký tự trở lên.");
        if (password !== confirmPassword) return toast.error("Mật khẩu nhập lại không khớp!");

        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCred.user, { displayName: name });
        await setDoc(doc(db, "users", userCred.user.uid), {
          email: email, ten: name, diemTichLuy: 0, role: 'member', ngayTao: new Date().toISOString()
        });
        toast.success("Đăng ký thành công! Chào mừng " + name);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        toast.success("Đăng nhập thành công!");
      }
      navigate('/');
    } catch (error) {
      if(error.code === 'auth/wrong-password') toast.error("Sai mật khẩu!");
      else if(error.code === 'auth/user-not-found') toast.error("Email này chưa đăng ký!");
      else if(error.code === 'auth/email-already-in-use') toast.error("Email này đã được sử dụng!");
      else toast.error("Lỗi: " + error.message);
    }
  };

  // Xử lý quên mật khẩu
  const handleForgotPassword = async () => {
    if (!emailForgot) return toast.warning("Vui lòng nhập Email để lấy lại mật khẩu!");
    try {
      await sendPasswordResetEmail(auth, emailForgot);
      toast.success("Đã gửi email khôi phục! Hãy kiểm tra hộp thư của bạn.");
      setShowForgot(false);
    } catch (error) {
      toast.error("Lỗi: " + error.message);
    }
  };

  return (
    <Container className="auth-container">
      <h3 className="text-center fw-bold text-success mb-4">{isRegister ? 'ĐĂNG KÝ THÀNH VIÊN' : 'ĐĂNG NHẬP'}</h3>
      <div className="alert alert-info small text-center mb-4">
        {isRegister ? 'Tạo tài khoản để tích điểm & nhận ưu đãi.' : 'Đăng nhập để xem lịch sử đơn hàng.'}
      </div>

      <Form onSubmit={handleAuth}>
        {isRegister && (
          <Form.Group className="mb-3">
            <Form.Label>Họ và tên hiển thị (*)</Form.Label>
            <Form.Control type="text" name="name" required onChange={handleChange} placeholder="VD: Nguyễn Văn A" />
          </Form.Group>
        )}
        <Form.Group className="mb-3">
          <Form.Label>Email (*)</Form.Label>
          <Form.Control type="email" name="email" placeholder="VD: khachhang@gmail.com" required onChange={handleChange} />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Mật khẩu (*)</Form.Label>
          <Form.Control type="password" name="password" required onChange={handleChange} placeholder="Ít nhất 6 ký tự" />
          {/* Nhắc nhở mật khẩu */}
          {isRegister && <Form.Text className="text-muted small"><i className="fa-solid fa-circle-info me-1"></i> Mật khẩu nên có cả chữ và số để bảo mật hơn.</Form.Text>}
        </Form.Group>
        
        {isRegister && (
          <Form.Group className="mb-3">
            <Form.Label>Nhập lại mật khẩu (*)</Form.Label>
            <Form.Control type="password" name="confirmPassword" required onChange={handleChange} placeholder="Xác nhận mật khẩu" />
          </Form.Group>
        )}

        {/* Link Quên mật khẩu */}
        {!isRegister && (
          <div className="text-end mb-3">
            <span className="text-primary small" style={{cursor:'pointer', textDecoration:'underline'}} onClick={()=>setShowForgot(true)}>Quên mật khẩu?</span>
          </div>
        )}

        <Button variant="success" type="submit" className="w-100 fw-bold py-2 mt-2">
          {isRegister ? 'ĐĂNG KÝ NGAY' : 'ĐĂNG NHẬP'}
        </Button>
      </Form>

      <div className="text-center mt-3 mb-4">
        <span className="text-muted">{isRegister ? 'Đã có tài khoản? ' : 'Chưa có tài khoản? '}</span>
        <span className="text-primary fw-bold" style={{cursor:'pointer'}} onClick={() => setIsRegister(!isRegister)}>
          {isRegister ? 'Đăng nhập' : 'Đăng ký'}
        </span>
      </div>
      
      <div className="border-top pt-3 text-center">
        <p className="small text-muted mb-2">Bạn là chủ cửa hàng?</p>
        <Link to="/admin"><Button variant="outline-dark" size="sm" className="fw-bold"><i className="fa-solid fa-user-shield me-2"></i> Vào trang Admin</Button></Link>
      </div>

      {/* MODAL QUÊN MẬT KHẨU */}
      <Modal show={showForgot} onHide={()=>setShowForgot(false)} centered>
        <Modal.Header closeButton><Modal.Title className="fw-bold text-primary">LẤY LẠI MẬT KHẨU</Modal.Title></Modal.Header>
        <Modal.Body>
          <p className="text-muted">Nhập email bạn đã đăng ký, hệ thống sẽ gửi link đặt lại mật khẩu cho bạn.</p>
          <Form.Group>
            <Form.Control type="email" placeholder="Nhập email của bạn..." value={emailForgot} onChange={e=>setEmailForgot(e.target.value)} />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={()=>setShowForgot(false)}>Hủy</Button>
          <Button variant="primary" onClick={handleForgotPassword}>Gửi yêu cầu</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}
export default Auth;