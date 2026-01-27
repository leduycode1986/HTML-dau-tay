import React from 'react';
import { Container, Navbar, Nav, Form, Button, Dropdown } from 'react-bootstrap';
import { Link } from 'react-router-dom';

// Đổi tên function thành TopBar
function TopBar({ shopConfig, tuKhoa, setTuKhoa, gioHang, currentUser, handleLogout }) {
  // Style ép cứng
  const logoStyle = { height: '80px', width: 'auto', objectFit: 'contain' };
  const shopNameStyle = { fontSize: '2rem', fontWeight: '900', color: '#198754', textTransform: 'uppercase', margin: 0, lineHeight: 1 };
  const hotlineStyle = { fontSize: '2rem', fontWeight: '900', color: '#d32f2f', lineHeight: 1 };

  return (
    <>
      <div className="top-bar-notification" style={{background: '#b71c1c', color: 'white', padding: '8px 0', fontSize: '13px', fontWeight: 'bold', textAlign:'center'}}>
        <span>{shopConfig.topBarText}</span>
        {shopConfig.openingHours && <span className="ms-3"><i className="fa-regular fa-clock"></i> Mở cửa: {shopConfig.openingHours}</span>}
      </div>
      
      <Navbar bg="white" expand="lg" className="sticky-top shadow-sm py-3" style={{zIndex: 100, borderBottom:'3px solid #198754'}}>
        <Container>
          <Navbar.Brand as={Link} to="/" className="me-4 text-decoration-none d-flex align-items-center gap-3">
            {shopConfig.logo ? <img src={shopConfig.logo} alt="Logo" style={logoStyle} /> : <span className="fs-1">🦁</span>}
            <div className="d-flex flex-column justify-content-center">
              <h1 style={shopNameStyle}>{shopConfig.tenShop}</h1>
              <span style={{ fontSize: '0.9rem', color: '#d63384', fontWeight: '700', letterSpacing: '1px' }}>{shopConfig.slogan}</span>
            </div>
          </Navbar.Brand>

          <Navbar.Toggle />
          <Navbar.Collapse>
            <Form className="d-flex flex-grow-1 mx-lg-4 my-2 my-lg-0" onSubmit={e=>e.preventDefault()}>
              <div className="input-group">
                <Form.Control type="search" placeholder="Bạn tìm gì...?" value={tuKhoa} onChange={e=>setTuKhoa(e.target.value)} className="border-end-0 bg-light p-2" />
                <Button variant="light" className="border border-start-0 bg-light"><i className="fa-solid fa-magnifying-glass"></i></Button>
              </div>
            </Form>
            
            <Nav className="align-items-center gap-3">
              <div className="d-none d-lg-flex flex-column align-items-end pe-3" style={{borderRight:'2px solid #eee'}}>
                <span className="text-muted small fw-bold text-uppercase">Tổng đài hỗ trợ</span>
                <span style={hotlineStyle}>{shopConfig.sdt}</span>
              </div>

              <Link to="/tra-cuu" className="btn btn-outline-secondary rounded-pill fw-bold">Tra đơn</Link>
              <Link to="/cart" className="btn btn-success rounded-pill position-relative fw-bold px-3">
                Giỏ <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">{gioHang.reduce((a,b)=>a+b.soLuong,0)}</span>
              </Link>
              
              {currentUser ? (
                <Dropdown align="end">
                  <Dropdown.Toggle variant="light" className="border-0 fw-bold"><i className="fa-solid fa-circle-user fs-4 text-secondary"></i></Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item as={Link} to="/member">Tài khoản</Dropdown.Item>
                    <Dropdown.Item onClick={handleLogout} className="text-danger">Đăng xuất</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              ) : <Link to="/auth" className="fw-bold text-dark ms-2">Đăng nhập</Link>}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </>
  );
}
export default TopBar; // Xuất tên mới