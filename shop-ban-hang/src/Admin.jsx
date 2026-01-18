import React, { useState } from 'react';
import { Table, Button, Form, Modal, Badge, Tab, Tabs, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const NO_IMAGE = "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg";
const ICON_LIST = ['🏠', '🥩', '🥦', '🍎', '🥛', '🥤', '🍞', '🥫', '🧼', '🧸', '📦'];

function Admin({ dsSanPham, handleUpdateDS_SP, dsDanhMuc, handleUpdateDS_DM, dsDonHang, handleUpdateStatusOrder, handleDeleteOrder }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);

  // State Quản lý Menu
  const [showModalDM, setShowModalDM] = useState(false);
  const [editingDM, setEditingDM] = useState(null);
  const [formDataDM, setFormDataDM] = useState({ ten: '', icon: '', parent: '', order: 0 });

  // Sắp xếp Menu theo Thứ tự (Số nhỏ hiện trước)
  const sortedDanhMuc = (() => {
    const s = (a, b) => (parseInt(a.order) || 0) - (parseInt(b.order) || 0);
    const roots = dsDanhMuc.filter(d => !d.parent).sort(s);
    const children = dsDanhMuc.filter(d => d.parent).sort(s);
    let res = [];
    roots.forEach(root => {
      res.push(root);
      res.push(...children.filter(c => c.parent === (root.customId || root.id)));
    });
    return res;
  })();

  const handleSaveDM = () => {
    if (!formDataDM.ten) return alert("Vui lòng nhập tên danh mục!");
    if (editingDM) {
      handleUpdateDS_DM('UPDATE', { ...formDataDM, id: editingDM.id });
    } else {
      handleUpdateDS_DM('ADD', { ...formDataDM, order: dsDanhMuc.length });
    }
    setShowModalDM(false);
    setFormDataDM({ ten: '', icon: '', parent: '', order: 0 });
  };

  if (!isLoggedIn) return (
    <div className="admin-login-wrapper" style={{height:'100vh', display:'flex', justifyContent:'center', alignItems:'center', background:'#198754'}}>
      <div className="bg-white p-5 rounded-4 shadow" style={{width:'100%', maxWidth:'400px'}}>
        <h3 className="text-center text-success fw-bold mb-4">ADMIN LOGIN</h3>
        <Form onSubmit={(e) => {e.preventDefault(); setIsLoggedIn(true)}}>
          <Form.Control className="mb-3 p-3" placeholder="Username" />
          <Form.Control className="mb-4 p-3" type="password" placeholder="Password" />
          <Button variant="success" type="submit" className="w-100 py-3 fw-bold rounded-pill">ĐĂNG NHẬP</Button>
        </Form>
      </div>
    </div>
  );

  return (
    <div className="admin-main-container">
      <div className="admin-navbar">
        <h4 className="m-0 fw-bold text-uppercase">MAIVANG SHOP - QUẢN TRỊ</h4>
        <div className="d-flex gap-2">
          <Button variant="outline-light" size="sm">ĐỔI MẬT KHẨU</Button>
          <Link to="/"><Button variant="danger" size="sm">THOÁT</Button></Link>
        </div>
      </div>

      <div className="p-4">
        <Tabs defaultActiveKey="menu" className="mb-4 bg-white p-2 rounded shadow-sm">
          {/* TAB SẢN PHẨM & ĐƠN HÀNG (GIỮ NGUYÊN) */}
          <Tab eventKey="products" title="📦 SẢN PHẨM">
             {/* Nội dung quản lý sản phẩm */}
          </Tab>

          {/* TAB DANH MỤC (ĐÃ NÂNG CẤP KHOA HỌC) */}
          <Tab eventKey="menu" title="📂 QUẢN LÝ MENU">
            <div className="bg-white p-4 rounded-4 shadow-sm border">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="fw-bold m-0 text-success">CẤU TRÚC DANH MỤC</h5>
                <Button variant="success" onClick={() => {setEditingDM(null); setShowModalDM(true)}}>+ THÊM MENU MỚI</Button>
              </div>

              <Table hover responsive className="align-middle">
                <thead className="table-light">
                  <tr>
                    <th width="120" className="text-center">Thứ tự</th>
                    <th>Tên danh mục</th>
                    <th className="text-center">Biểu tượng</th>
                    <th className="text-end">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedDanhMuc.map(dm => (
                    <tr key={dm.id} className="category-row-item">
                      <td className="text-center">
                        <Form.Control 
                          type="number" 
                          className="menu-order-input mx-auto"
                          defaultValue={dm.order || 0}
                          onBlur={(e) => handleUpdateDS_DM('UPDATE', { ...dm, order: e.target.value })}
                        />
                      </td>
                      <td>
                        {dm.parent ? <span className="ms-4 text-muted">↳</span> : <Badge bg="success" className="me-2">Gốc</Badge>}
                        <span className="fw-bold">{dm.ten}</span>
                      </td>
                      <td className="text-center fs-4">{dm.icon}</td>
                      <td className="text-end">
                        <Button variant="outline-warning" size="sm" className="me-2" onClick={() => {setEditingDM(dm); setFormDataDM(dm); setShowModalDM(true)}}>Sửa</Button>
                        <Button variant="outline-danger" size="sm" onClick={() => handleUpdateDS_DM('DELETE', dm.id)}>Xóa</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </Tab>
        </Tabs>
      </div>

      {/* MODAL THÊM/SỬA MENU */}
      <Modal show={showModalDM} onHide={() => setShowModalDM(false)} centered>
        <Modal.Header closeButton><Modal.Title className="fw-bold text-success">{editingDM ? 'SỬA MENU' : 'THÊM MENU MỚI'}</Modal.Title></Modal.Header>
        <Modal.Body className="p-4">
          <Form.Group className="mb-3">
            <Form.Label className="fw-bold small">TÊN DANH MỤC</Form.Label>
            <Form.Control value={formDataDM.ten} onChange={e => setFormDataDM({...formDataDM, ten: e.target.value})} />
          </Form.Group>
          <Row className="mb-3">
            <Col>
              <Form.Label className="fw-bold small">BIỂU TƯỢNG</Form.Label>
              <Form.Select value={formDataDM.icon} onChange={e => setFormDataDM({...formDataDM, icon: e.target.value})}>
                <option value="">Chọn Icon</option>
                {ICON_LIST.map(i => <option key={i} value={i}>{i}</option>)}
              </Form.Select>
            </Col>
            <Col>
              <Form.Label className="fw-bold small">THỨ TỰ HIỆN</Form.Label>
              <Form.Control type="number" value={formDataDM.order} onChange={e => setFormDataDM({...formDataDM, order: e.target.value})} />
            </Col>
          </Row>
          {!editingDM && (
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold small">DANH MỤC CHA (NẾU CÓ)</Form.Label>
              <Form.Select value={formDataDM.parent} onChange={e => setFormDataDM({...formDataDM, parent: e.target.value})}>
                <option value="">Làm danh mục gốc</option>
                {dsDanhMuc.filter(d => !d.parent).map(d => <option key={d.id} value={d.customId || d.id}>{d.ten}</option>)}
              </Form.Select>
            </Form.Group>
          )}
          <Button variant="success" className="w-100 py-3 fw-bold mt-2 rounded-pill shadow-sm" onClick={handleSaveDM}>LƯU THÔNG TIN</Button>
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default Admin;