import React, { useState } from 'react';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import Badge from 'react-bootstrap/Badge';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';

function Admin({ dsSanPham, setDsSanPham, dsDanhMuc, setDsDanhMuc }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState('');

  // --- PHẦN XỬ LÝ SẢN PHẨM ---
  const [showModalSP, setShowModalSP] = useState(false);
  const [editingSP, setEditingSP] = useState(null);
  const [formDataSP, setFormDataSP] = useState({
      ten: '', gia: '', anh: '', phanLoai: 'thitca', 
      isKhuyenMai: false, isBanChay: false, isMoi: false
  });

  // Hàm lưu sản phẩm (Thêm mới hoặc Cập nhật)
  function handleSaveSP() {
      if (editingSP) {
          // Sửa
          setDsSanPham(dsSanPham.map(sp => sp.id === editingSP.id ? { ...formDataSP, id: editingSP.id } : sp));
      } else {
          // Thêm mới
          const newId = dsSanPham.length > 0 ? Math.max(...dsSanPham.map(s => s.id)) + 1 : 1;
          setDsSanPham([...dsSanPham, { ...formDataSP, id: newId }]);
      }
      setShowModalSP(false);
      setEditingSP(null);
      resetFormSP();
  }

  function handleEditSP(sp) {
      setEditingSP(sp);
      setFormDataSP(sp);
      setShowModalSP(true);
  }

  function handleDeleteSP(id) {
      if (window.confirm("Bạn chắc chắn muốn xóa sản phẩm này?")) {
          setDsSanPham(dsSanPham.filter(sp => sp.id !== id));
      }
  }

  function resetFormSP() {
      setFormDataSP({ ten: '', gia: '', anh: '', phanLoai: 'thitca', isKhuyenMai: false, isBanChay: false, isMoi: false });
  }

  // --- PHẦN XỬ LÝ DANH MỤC ---
  const [showModalDM, setShowModalDM] = useState(false);
  const [formDataDM, setFormDataDM] = useState({ id: '', ten: '', icon: '' });

  function handleSaveDM() {
      // Kiểm tra trùng ID
      if (dsDanhMuc.some(dm => dm.id === formDataDM.id)) {
          alert("Mã danh mục này đã tồn tại!");
          return;
      }
      setDsDanhMuc([...dsDanhMuc, formDataDM]);
      setShowModalDM(false);
      setFormDataDM({ id: '', ten: '', icon: '' });
  }

  function handleDeleteDM(id) {
      if (id === 'all') { alert("Không thể xóa danh mục gốc!"); return; }
      if (window.confirm("Xóa danh mục này sẽ ảnh hưởng đến việc lọc sản phẩm. Bạn chắc chứ?")) {
          setDsDanhMuc(dsDanhMuc.filter(dm => dm.id !== id));
      }
  }

  // --- MÀN HÌNH ĐĂNG NHẬP ---
  if (!isLoggedIn) {
      return (
          <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f2f5' }}>
              <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '10px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', width: '400px', textAlign: 'center' }}>
                  <h3 style={{ marginBottom: '20px', color: '#008848' }}>🔒 Đăng nhập Admin</h3>
                  <input 
                    type="password" 
                    placeholder="Nhập mật khẩu (admin123)" 
                    style={{ width: '100%', padding: '10px', marginBottom: '15px', borderRadius: '5px', border: '1px solid #ccc' }}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                  <Button variant="success" style={{ width: '100%' }} onClick={() => password === 'admin123' ? setIsLoggedIn(true) : alert("Sai mật khẩu!")}>
                      Đăng Nhập
                  </Button>
                  <Button variant="link" style={{ marginTop: '10px' }} href="/">Về trang chủ</Button>
              </div>
          </div>
      )
  }

  // --- GIAO DIỆN QUẢN LÝ CHÍNH ---
  return (
    <div style={{ padding: '20px', backgroundColor: '#fff', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>
          <h2 style={{ color: '#008848' }}>⚙️ Trang Quản Trị Hệ Thống</h2>
          <Button variant="outline-danger" href="/">⬅ Thoát về Trang chủ</Button>
      </div>

      <Tabs defaultActiveKey="products" id="admin-tabs" className="mb-3">
        
        {/* TAB 1: QUẢN LÝ SẢN PHẨM */}
        <Tab eventKey="products" title="📦 Quản lý Sản phẩm">
            <Button variant="primary" className="mb-3" onClick={() => { setEditingSP(null); resetFormSP(); setShowModalSP(true); }}>
                + Thêm sản phẩm mới
            </Button>

            <Table striped bordered hover responsive>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Hình ảnh</th>
                        <th>Tên sản phẩm</th>
                        <th>Giá</th>
                        <th>Danh mục</th>
                        <th>Trạng thái (Tags)</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {dsSanPham.map(sp => (
                        <tr key={sp.id}>
                            <td>{sp.id}</td>
                            <td><img src={sp.anh} alt="" style={{width: '50px', height: '50px', objectFit: 'cover'}} /></td>
                            <td style={{fontWeight: 'bold'}}>{sp.ten}</td>
                            <td style={{color: '#d63031'}}>{sp.gia}</td>
                            <td>{dsDanhMuc.find(dm => dm.id === sp.phanLoai)?.ten || sp.phanLoai}</td>
                            <td>
                                {sp.isKhuyenMai && <Badge bg="danger" className="me-1">Giảm giá</Badge>}
                                {sp.isBanChay && <Badge bg="warning" text="dark" className="me-1">Bán chạy</Badge>}
                                {sp.isMoi && <Badge bg="success">Mới</Badge>}
                            </td>
                            <td>
                                <Button size="sm" variant="warning" className="me-2" onClick={() => handleEditSP(sp)}>Sửa</Button>
                                <Button size="sm" variant="danger" onClick={() => handleDeleteSP(sp.id)}>Xóa</Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </Tab>

        {/* TAB 2: QUẢN LÝ MENU DANH MỤC */}
        <Tab eventKey="categories" title="📂 Quản lý Menu">
             <div style={{ maxWidth: '600px' }}>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                    <input placeholder="Mã (vd: dokho)" className="form-control" value={formDataDM.id} onChange={e => setFormDataDM({...formDataDM, id: e.target.value})} />
                    <input placeholder="Tên (vd: Đồ Khô)" className="form-control" value={formDataDM.ten} onChange={e => setFormDataDM({...formDataDM, ten: e.target.value})} />
                    <input placeholder="Icon (vd: 🍪)" className="form-control" style={{width: '100px'}} value={formDataDM.icon} onChange={e => setFormDataDM({...formDataDM, icon: e.target.value})} />
                    <Button onClick={handleSaveDM}>Thêm</Button>
                </div>
                
                <Table bordered>
                    <thead><tr><th>Mã</th><th>Tên hiển thị</th><th>Icon</th><th>Xóa</th></tr></thead>
                    <tbody>
                        {dsDanhMuc.map(dm => (
                            <tr key={dm.id}>
                                <td>{dm.id}</td>
                                <td>{dm.ten}</td>
                                <td>{dm.icon}</td>
                                <td>{dm.id !== 'all' && <Button size="sm" variant="danger" onClick={() => handleDeleteDM(dm.id)}>X</Button>}</td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
             </div>
        </Tab>
      </Tabs>

      {/* MODAL THÊM/SỬA SẢN PHẨM */}
      <Modal show={showModalSP} onHide={() => setShowModalSP(false)} size="lg">
        <Modal.Header closeButton><Modal.Title>{editingSP ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm mới'}</Modal.Title></Modal.Header>
        <Modal.Body>
            <Form>
                <Form.Group className="mb-3"><Form.Label>Tên sản phẩm</Form.Label><Form.Control value={formDataSP.ten} onChange={e => setFormDataSP({...formDataSP, ten: e.target.value})} /></Form.Group>
                <div className="d-flex gap-3">
                    <Form.Group className="mb-3 flex-fill"><Form.Label>Giá tiền</Form.Label><Form.Control value={formDataSP.gia} onChange={e => setFormDataSP({...formDataSP, gia: e.target.value})} /></Form.Group>
                    <Form.Group className="mb-3 flex-fill"><Form.Label>Phân loại</Form.Label>
                        <Form.Select value={formDataSP.phanLoai} onChange={e => setFormDataSP({...formDataSP, phanLoai: e.target.value})}>
                            {dsDanhMuc.map(dm => <option key={dm.id} value={dm.id}>{dm.ten}</option>)}
                        </Form.Select>
                    </Form.Group>
                </div>
                <Form.Group className="mb-3"><Form.Label>Link ảnh</Form.Label><Form.Control value={formDataSP.anh} onChange={e => setFormDataSP({...formDataSP, anh: e.target.value})} /></Form.Group>
                
                <Form.Label>Gắn thẻ (Tags):</Form.Label>
                <div className="d-flex gap-3">
                    <Form.Check type="checkbox" label="🔥 Khuyến mãi sốc" checked={formDataSP.isKhuyenMai} onChange={e => setFormDataSP({...formDataSP, isKhuyenMai: e.target.checked})} />
                    <Form.Check type="checkbox" label="💎 Bán chạy nhất" checked={formDataSP.isBanChay} onChange={e => setFormDataSP({...formDataSP, isBanChay: e.target.checked})} />
                    <Form.Check type="checkbox" label="🆕 Hàng mới về" checked={formDataSP.isMoi} onChange={e => setFormDataSP({...formDataSP, isMoi: e.target.checked})} />
                </div>
            </Form>
        </Modal.Body>
        <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModalSP(false)}>Hủy</Button>
            <Button variant="primary" onClick={handleSaveSP}>Lưu thông tin</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default Admin;