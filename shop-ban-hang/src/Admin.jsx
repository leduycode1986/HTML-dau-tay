import React, { useState, useEffect } from 'react';
import { Table, Button, Form, Modal, Badge, Tab, Tabs, Row, Col, Container } from 'react-bootstrap';
import ReactQuill from 'react-quill';
import SEO from './SEO';

function Admin({ dsSanPham, handleUpdateDS_SP, dsDanhMuc, handleUpdateDS_DM, dsDonHang, handleUpdateStatusOrder, handleDeleteOrder }) {
  // Logic đăng nhập và state (giữ nguyên từ bản trước)
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  // ... (copy lại phần State và Handle từ bản trước)

  if (!isLoggedIn) return (
    <div className="admin-login-bg">
      <div className="login-card shadow">
         <h3 className="text-success fw-bold">ADMIN LOGIN</h3>
         {/* Form đăng nhập */}
      </div>
    </div>
  );

  return (
    <Container fluid className="p-0">
      <SEO title="Quản Trị" />
      <div className="admin-header d-flex justify-content-between">
          <h4 className="m-0 fw-bold">QUẢN TRỊ HỆ THỐNG</h4>
          <Button variant="danger" size="sm">Thoát</Button>
      </div>
      <div className="p-3">
        <Tabs defaultActiveKey="products" className="bg-white p-2 rounded shadow-sm">
          <Tab eventKey="products" title="Sản phẩm">
            <Button variant="primary" className="my-3 fw-bold">+ Thêm Sản Phẩm</Button>
            <Table hover className="align-middle">
              <thead><tr><th>Ảnh</th><th>Tên sản phẩm</th><th>Giá</th><th>Thao tác</th></tr></thead>
              <tbody>{dsSanPham.map(sp => (
                <tr key={sp.id}>
                  <td><img src={sp.anh} className="admin-table-img border" /></td>
                  <td>
                    <div className="fw-bold text-success">{sp.ten}</div>
                    {/* 👇 LỌC SẠCH MÔ TẢ 👇 */}
                    <div className="text-muted small text-truncate" style={{maxWidth:'300px'}}>
                      {sp.moTa ? sp.moTa.replace(/<[^>]*>?/gm, '') : ''}
                    </div>
                  </td>
                  <td className="text-danger fw-bold">{sp.giaBan?.toLocaleString()} ¥</td>
                  <td><Button size="sm" variant="warning" className="me-2">Sửa</Button><Button size="sm" variant="danger">Xóa</Button></td>
                </tr>
              ))}</tbody>
            </Table>
          </Tab>
          {/* Các tab Orders, Menu tương tự */}
        </Tabs>
      </div>
    </Container>
  );
}
export default Admin;