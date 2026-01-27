import React, { useState, useEffect } from 'react';
import { Form, Button, Modal, InputGroup } from 'react-bootstrap';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, sendPasswordResetEmail } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore'; // Thêm getDoc
import { auth, db } from './firebase';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';

function Auth() {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '', confirmPassword: '', name: '' });
  const [showForgot, setShowForgot] = useState(false);
  const [emailForgot, setEmailForgot] = useState('');
  const [shopLogo, setShopLogo] = useState(''); // Biến chứa Logo thật
  
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const navigate = useNavigate();

  // --- LẤY LOGO TỪ CẤU HÌNH ---
  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const docRef = doc(db, "cauHinh", "thongTinChung");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setShopLogo(docSnap.data().logo);
        }
      } catch (error) {
        console.log("Không tải được logo:", error);
      }
    };
    fetchLogo();
  }, []);
  // -----------------------------

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleAuth = async (e) => {
    e.preventDefault();
    const { email, password, confirmPassword, name } = formData;
    try {
      if (isRegister) {
        if (password.length < 6) return toast.error("Mật khẩu quá ngắn! Phải từ 6 ký tự trở lên.");
        if (password !== confirmPassword) return toast.error("Mật khẩu nhập lại không khớp!");
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCred.user, { displayName: name });
        await setDoc(doc(db, "users", userCred.user.uid), { email: email, ten: name, diemTichLuy: 0, role: 'member', ngayTao: new Date().toISOString() });
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

  const handleForgotPassword = async () => {
    if (!emailForgot) return toast.warning("Vui lòng nhập Email!");
    try { await sendPasswordResetEmail(auth, emailForgot); toast.success("Đã gửi email khôi phục!"); setShowForgot(false); } catch (error) { toast.error("Lỗi: " + error.message); }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        {/* Header: Đã sửa để hiện Logo thật */}
        <div className="auth-header-bg">
          {shopLogo ? (
            <img src={shopLogo} alt="Logo Shop" className="auth-logo" />
          ) : (
            <div className="fs-1 mb-2">🦁</div> // Chỉ hiện sư tử khi chưa có logo
          )}
          
          <h3 className="auth-title">{isRegister ? 'ĐĂNG KÝ TÀI KHOẢN' : 'CHÀO MỪNG TRỞ LẠI'}</h3>
          <p className="auth-subtitle">
            {isRegister ? 'Tích điểm, nhận quà và theo dõi đơn hàng dễ dàng.' : 'Vui lòng đăng nhập để tiếp tục mua sắm.'}
          </p>
        </div>

        <div className="auth-form-body">
          <Form onSubmit={handleAuth}>
            {isRegister && (
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold small text-secondary">Họ và tên</Form.Label>
                <Form.Control type="text" name="name" className="auth-input" required onChange={handleChange} placeholder="Ví dụ: Nguyễn Văn A" />
              </Form.Group>
            )}
            
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold small text-secondary">Email đăng nhập</Form.Label>
              <Form.Control type="email" name="email" className="auth-input" placeholder="name@example.com" required onChange={handleChange} />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <div className="d-flex justify-content-between">
                <Form.Label className="fw-bold small text-secondary">Mật khẩu</Form.Label>
                {!isRegister && <span className="small text-danger" style={{cursor:'pointer', fontWeight:600}} onClick={()=>setShowForgot(true)}>Quên mật khẩu?</span>}
              </div>
              <InputGroup>
                <Form.Control type={showPass ? "text" : "password"} name="password" className="auth-input border-end-0" required onChange={handleChange} placeholder="******" />
                <Button variant="light" className="border border-start-0 bg-light" onClick={()=>setShowPass(!showPass)}><i className={showPass ? "fa-solid fa-eye-slash text-muted" : "fa-solid fa-eye text-muted"}></i></Button>
              </InputGroup>
            </Form.Group>
            
            {isRegister && (
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold small text-secondary">Nhập lại mật khẩu</Form.Label>
                <InputGroup>
                  <Form.Control type={showConfirmPass ? "text" : "password"} name="confirmPassword" className="auth-input border-end-0" required onChange={handleChange} placeholder="******" />
                  <Button variant="light" className="border border-start-0 bg-light" onClick={()=>setShowConfirmPass(!showConfirmPass)}><i className={showConfirmPass ? "fa-solid fa-eye-slash text-muted" : "fa-solid fa-eye text-muted"}></i></Button>
                </InputGroup>
              </Form.Group>
            )}

            <Button variant="success" type="submit" className="w-100 btn-auth-submit mt-3 shadow-sm">
              {isRegister ? 'ĐĂNG KÝ NGAY' : 'ĐĂNG NHẬP'}
            </Button>
          </Form>

          <div className="text-center mt-4 pt-3 border-top">
            <span className="text-muted small">{isRegister ? 'Bạn đã có tài khoản? ' : 'Bạn chưa có tài khoản? '}</span>
            <span className="text-success fw-bold ms-1" style={{cursor:'pointer', textDecoration:'underline'}} onClick={() => setIsRegister(!isRegister)}>
              {isRegister ? 'Đăng nhập ngay' : 'Đăng ký miễn phí'}
            </span>
          </div>
          
          <div className="text-center mt-3">
             <Link to="/admin" className="text-decoration-none small text-muted"><i className="fa-solid fa-user-shield me-1"></i> Trang quản trị</Link>
          </div>
        </div>
      </div>

      <Modal show={showForgot} onHide={()=>setShowForgot(false)} centered>
        <Modal.Header closeButton><Modal.Title className="fs-5 fw-bold">Khôi phục mật khẩu</Modal.Title></Modal.Header>
        <Modal.Body>
          <p className="small text-muted">Nhập email của bạn, hệ thống sẽ gửi link đặt lại mật khẩu.</p>
          <Form.Control type="email" placeholder="Nhập email..." value={emailForgot} onChange={e=>setEmailForgot(e.target.value)} className="auth-input" />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={()=>setShowForgot(false)}>Hủy</Button>
          <Button variant="success" onClick={handleForgotPassword}>Gửi yêu cầu</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
export default Auth;