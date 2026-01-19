import React, { useState } from 'react';
import { Form, Button, Container } from 'react-bootstrap';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { useNavigate, Link } from 'react-router-dom'; // Thêm Link
import { toast } from 'react-toastify';

function Auth() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const navigate = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault();
    try {
      if (isRegister) {
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, "users", userCred.user.uid), {
          email: email,
          ten: name,
          diemTichLuy: 0,
          role: 'member'
        });
        toast.success("Đăng ký thành công! Chào mừng bạn.");
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
      
      {/* Thông báo giải thích cho khách */}
      <div className="alert alert-info small text-center mb-4">
        Đăng nhập để tích điểm và xem lịch sử đơn hàng.<br/>
        (Vui lòng dùng Email để đăng ký)
      </div>

      <Form onSubmit={handleAuth}>
        {isRegister && (
          <Form.Group className="mb-3">
            <Form.Label>Họ và tên</Form.Label>
            <Form.Control type="text" required onChange={(e) => setName(e.target.value)} />
          </Form.Group>
        )}
        <Form.Group className="mb-3">
          <Form.Label>Email</Form.Label>
          <Form.Control type="email" placeholder="VD: khachhang@gmail.com" required onChange={(e) => setEmail(e.target.value)} />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Mật khẩu</Form.Label>
          <Form.Control type="password" required onChange={(e) => setPassword(e.target.value)} />
        </Form.Group>
        <Button variant="success" type="submit" className="w-100 fw-bold py-2">
          {isRegister ? 'ĐĂNG KÝ NGAY' : 'ĐĂNG NHẬP'}
        </Button>
      </Form>
      <div className="text-center mt-3 mb-4">
        <span className="text-muted">{isRegister ? 'Đã có tài khoản? ' : 'Chưa có tài khoản? '}</span>
        <span className="text-primary fw-bold" style={{cursor:'pointer'}} onClick={() => setIsRegister(!isRegister)}>
          {isRegister ? 'Đăng nhập' : 'Đăng ký'}
        </span>
      </div>
      
      {/* NÚT CHUYỂN SANG TRANG ADMIN */}
      <div className="border-top pt-3 text-center">
        <p className="small text-muted mb-2">Bạn là chủ cửa hàng?</p>
        <Link to="/admin">
          <Button variant="outline-dark" size="sm" className="fw-bold">
            <i className="fa-solid fa-user-shield me-2"></i> Vào trang Quản Trị (Admin)
          </Button>
        </Link>
      </div>
    </Container>
  );
}

export default Auth;