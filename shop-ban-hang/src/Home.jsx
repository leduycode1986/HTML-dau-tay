import React, { useState } from 'react';
import { Row, Col, Container, Alert } from 'react-bootstrap';
import Product from './Product';
import { Link, useParams } from 'react-router-dom';

function Home({ dsSanPham, dsDanhMuc, themVaoGio }) {
  const { id: categoryId } = useParams();
  
  // State để quản lý việc mở menu con
  const [openMenuId, setOpenMenuId] = useState(null);

  // Logic lọc sản phẩm (Hỗ trợ click danh mục cha hiện sản phẩm con)
  const filteredProducts = categoryId 
    ? dsSanPham.filter(sp => {
        if (sp.phanLoai === categoryId) return true;
        const childCats = dsDanhMuc.filter(d => d.parent === categoryId).map(c => c.id);
        return childCats.includes(sp.phanLoai);
      }) 
    : dsSanPham;

  return (
    <Container fluid className="p-0">
      <Row className="g-0">
        
        {/* CỘT MENU BÊN TRÁI */}
        <Col xs={12} md={3} lg={2} className="sidebar-main shadow-sm bg-white" style={{minHeight: '100vh'}}>
          <div className="bg-success text-white p-3 fw-bold text-center text-uppercase">
            <i className="fa-solid fa-bars me-2"></i> DANH MỤC
          </div>
          
          <div className="category-list p-2">
            {/* Chỉ render danh mục GỐC (không có parent) */}
            {dsDanhMuc.filter(d => !d.parent).map(parent => {
              // Kiểm tra xem danh mục này có con không
              const hasChild = dsDanhMuc.some(c => c.parent === parent.id);
              const isOpen = openMenuId === parent.id;

              return (
                <div key={parent.id} className="mb-1">
                  {/* Link Danh Mục Cha */}
                  <div className={`d-flex align-items-center justify-content-between p-2 rounded ${categoryId === parent.id ? 'bg-light fw-bold text-success' : 'text-dark'}`}>
                    <Link to={`/category/${parent.id}`} className="text-decoration-none text-inherit flex-grow-1 d-flex align-items-center">
                      <span className="me-2 fs-5">{parent.icon || '📦'}</span> 
                      {parent.ten}
                    </Link>
                    
                    {/* NÚT XỔ XUỐNG (Nếu có con) */}
                    {hasChild && (
                      <span 
                        onClick={(e) => {
                          e.preventDefault(); // Chặn click vào link
                          setOpenMenuId(isOpen ? null : parent.id); // Toggle mở/đóng
                        }} 
                        style={{cursor: 'pointer', padding: '0 10px', color: '#888'}}
                      >
                        {isOpen ? '▲' : '▼'}
                      </span>
                    )}
                  </div>

                  {/* Danh sách con (Chỉ hiện khi isOpen = true) */}
                  {hasChild && isOpen && (
                    <div className="ms-4 border-start ps-2 mt-1 submenu-container">
                      {dsDanhMuc.filter(c => c.parent === parent.id).map(child => (
                        <Link key={child.id} to={`/category/${child.id}`} className="d-block py-1 text-decoration-none text-secondary small hover-green">
                          ↳ {child.ten}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Col>

        {/* CỘT SẢN PHẨM BÊN PHẢI */}
        <Col xs={12} md={9} lg={10} className="p-3 p-md-4" style={{background: '#f4f6f9'}}>
          {filteredProducts.length === 0 ? (
            <Alert variant="warning" className="text-center mt-3 shadow-sm border-0">
              <h5>Không tìm thấy sản phẩm nào!</h5>
              <p>Thử chọn danh mục khác hoặc quay lại trang chủ nhé.</p>
            </Alert>
          ) : (
            <Row className="g-2 g-md-3">
              {filteredProducts.map(sp => (
                <Col key={sp.id} xs={6} sm={4} lg={3} xl={3}>
                  <Product sp={sp} themVaoGio={themVaoGio} />
                </Col>
              ))}
            </Row>
          )}
        </Col>
      </Row>
    </Container>
  );
}

export default Home;