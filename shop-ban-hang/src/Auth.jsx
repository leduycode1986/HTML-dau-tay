import React, { useState } from 'react';
import { Form, Button, Container } from 'react-bootstrap';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';

function Auth() {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '', confirmPassword: '', name: '' });
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleAuth = async (e) => {
    e.preventDefault();
    const { email, password, confirmPassword, name } = formData;

    try {
      if (isRegister) {
        // Kiểm tra mật khẩu nhập lại
        if (password !== confirmPassword) {
          return toast.error("Mật khẩu nhập lại không khớp!");
        }
        if (password.length < 6) {
          return toast.error("Mật khẩu phải có ít nhất 6 ký tự!");
        }

        // Tạo tài khoản
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        
        // Cập nhật tên hiển thị ngay lập tức
        await updateProfile(userCred.user, { displayName: name });

        // Lưu thông tin vào Firestore
        await setDoc(doc(db, "users", userCred.user.uid), {
          email: email,
          ten: name,
          diemTichLuy: 0,
          role: 'member',
          ngayTao: new Date().toISOString()
        });
        toast.success("Đăng ký thành công! Chào mừng " + name);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        toast.success("Đăng nhập thành công!");
      }
      navigate('/');
    } catch (error) {
      toast.error("Lỗi: " + error.message);
    }
  };

  return (
    <Container className="auth-container">
      <h3 className="text-center fw-bold text-success mb-4">{isRegister ? 'ĐĂNG KÝ THÀNH VIÊN' : 'ĐĂNG NHẬP'}</h3>
      
      {/* Thông báo hướng dẫn */}
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
        </Form.Group>
        
        {/* Ô NHẬP LẠI MẬT KHẨU */}
        {isRegister && (
          <Form.Group className="mb-3">
            <Form.Label>Nhập lại mật khẩu (*)</Form.Label>
            <Form.Control type="password" name="confirmPassword" required onChange={handleChange} placeholder="Xác nhận mật khẩu" />
          </Form.Group>
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
    </Container>
  );
}
export default Auth;