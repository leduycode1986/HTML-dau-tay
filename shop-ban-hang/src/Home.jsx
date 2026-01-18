import React, { useState } from 'react';
import { Row, Col, Container, Alert } from 'react-bootstrap';
import Product from './Product';
import { Link, useParams } from 'react-router-dom';

function Home({ dsSanPham, dsDanhMuc, themVaoGio }) {
  const { id: categoryId } = useParams();
  const [openMenuId, setOpenMenuId] = useState(null);

  // Lọc sản phẩm theo danh mục (nếu có chọn danh mục)
  const filteredProducts = categoryId 
    ? dsSanPham.filter(sp => {
        if (sp.phanLoai === categoryId) return true;
        const childCats = dsDanhMuc.filter(d => d.parent === categoryId).map(c => c.id);
        return childCats.includes(sp.phanLoai);
      }) 
    : [];

  // Hàm render danh sách sản phẩm theo từng mục
  const renderProductSection = (title, products, emptyMsg, icon) => (
    <div className="mb-5">
      <div className="section-title d-flex align-items-center mb-3">
        <span className="me-2 fs-4">{icon}</span> {title}
      </div>
      {products.length === 0 ? (
        <Alert variant="light" className="text-center text-muted border-0 shadow-sm py-4">
          {emptyMsg}
        </Alert>
      ) : (
        <Row className="g-2 g-md-3">
          {products.map(sp => (
            <Col key={sp.id} xs={6} sm={4} lg={3} xl={3}>
              <Product sp={sp} themVaoGio={themVaoGio} />
            </Col>
          ))}
        </Row>
      )}
    </div>
  );

  return (
    <Container fluid className="p-0">
      <Row className="g-0">
        
        {/* CỘT MENU TRÁI */}
        <Col xs={12} md={3} lg={2} className="sidebar-main shadow-sm bg-white" style={{minHeight: '100vh'}}>
          <div className="bg-success text-white p-3 fw-bold text-center text-uppercase">
            <i className="fa-solid fa-bars me-2"></i> DANH MỤC
          </div>
          <div className="category-list p-2">
            {dsDanhMuc.filter(d => !d.parent).map(parent => {
              const hasChild = dsDanhMuc.some(c => c.parent === parent.id);
              const isOpen = openMenuId === parent.id;
              return (
                <div key={parent.id} className="mb-1 border-bottom">
                  <div className={`d-flex align-items-center justify-content-between p-2 rounded ${categoryId === parent.id ? 'bg-light fw-bold text-success' : 'text-dark'}`}>
                    <Link to={`/category/${parent.id}`} className="text-decoration-none text-inherit flex-grow-1 d-flex align-items-center">
                      <span className="me-2 fs-5">{parent.icon || '📦'}</span> {parent.ten}
                    </Link>
                    {hasChild && <span onClick={(e) => {e.preventDefault(); setOpenMenuId(isOpen ? null : parent.id);}} style={{cursor: 'pointer', padding: '0 10px', color:'#888', fontWeight:'bold'}}>{isOpen ? '▲' : '▼'}</span>}
                  </div>
                  {hasChild && isOpen && <div className="ms-4 ps-2 pb-2 submenu-container">{dsDanhMuc.filter(c => c.parent === parent.id).map(child => (<Link key={child.id} to={`/category/${child.id}`} className="d-block py-1 text-decoration-none text-secondary small hover-green">↳ {child.ten}</Link>))}</div>}
                </div>
              );
            })}
          </div>
        </Col>

        {/* CỘT NỘI DUNG CHÍNH */}
        <Col xs={12} md={9} lg={10} className="p-3 p-md-4" style={{background: '#f4f6f9'}}>
          
          {/* TRƯỜNG HỢP 1: TRANG CHỦ (HIỆN 3 MỤC) */}
          {!categoryId && (
            <>
              {/* Mục 1: Khuyến Mãi */}
              {renderProductSection(
                "SẢN PHẨM KHUYẾN MÃI", 
                dsSanPham.filter(sp => sp.isKhuyenMai).slice(0, 8), 
                "Chưa có sản phẩm khuyến mãi nào.", 
                "⚡"
              )}

              {/* Mục 2: Bán Chạy */}
              {renderProductSection(
                "SẢN PHẨM BÁN CHẠY", 
                dsSanPham.filter(sp => sp.isBanChay).slice(0, 8), 
                "Chưa có sản phẩm bán chạy.", 
                "🔥"
              )}

              {/* Mục 3: Mới */}
              {renderProductSection(
                "SẢN PHẨM MỚI", 
                dsSanPham.filter(sp => sp.isMoi).slice(0, 8), 
                "Chưa có sản phẩm mới.", 
                "✨"
              )}
            </>
          )}

          {/* TRƯỜNG HỢP 2: TRANG DANH MỤC */}
          {categoryId && (
            <div>
              <h4 className="fw-bold text-success mb-4 text-uppercase border-bottom pb-2">
                {dsDanhMuc.find(d=>d.id===categoryId)?.ten || 'Danh sách sản phẩm'}
              </h4>
              {filteredProducts.length === 0 ? (
                <Alert variant="warning" className="text-center">📭 Chưa có sản phẩm nào trong mục này!</Alert>
              ) : (
                <Row className="g-2 g-md-3">
                  {filteredProducts.map(sp => <Col key={sp.id} xs={6} sm={4} lg={3} xl={3}><Product sp={sp} themVaoGio={themVaoGio}/></Col>)}
                </Row>
              )}
            </div>
          )}
        </Col>
      </Row>
    </Container>
  );
}
export default Home;