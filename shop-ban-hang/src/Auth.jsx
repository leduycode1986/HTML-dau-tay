import React, { useState } from 'react';
import { Form, Button, Container, Alert } from 'react-bootstrap';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { useNavigate } from 'react-router-dom';
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
        // Đăng ký
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        // Tạo dữ liệu user trong Firestore để tích điểm
        await setDoc(doc(db, "users", userCred.user.uid), {
          email: email,
          ten: name,
          diemTichLuy: 0,
          role: 'member'
        });
        toast.success("Đăng ký thành công! Chào mừng bạn.");
      } else {
        // Đăng nhập
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
      <Form onSubmit={handleAuth}>
        {isRegister && (
          <Form.Group className="mb-3">
            <Form.Label>Họ và tên</Form.Label>
            <Form.Control type="text" required onChange={(e) => setName(e.target.value)} />
          </Form.Group>
        )}
        <Form.Group className="mb-3">
          <Form.Label>Email</Form.Label>
          <Form.Control type="email" required onChange={(e) => setEmail(e.target.value)} />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Mật khẩu</Form.Label>
          <Form.Control type="password" required onChange={(e) => setPassword(e.target.value)} />
        </Form.Group>
        <Button variant="success" type="submit" className="w-100 fw-bold py-2">
          {isRegister ? 'ĐĂNG KÝ NGAY' : 'ĐĂNG NHẬP'}
        </Button>
      </Form>
      <div className="text-center mt-3">
        <span className="text-muted">{isRegister ? 'Đã có tài khoản? ' : 'Chưa có tài khoản? '}</span>
        <span className="text-primary fw-bold" style={{cursor:'pointer'}} onClick={() => setIsRegister(!isRegister)}>
          {isRegister ? 'Đăng nhập' : 'Đăng ký'}
        </span>
      </div>
    </Container>
  );
}

export default Auth;