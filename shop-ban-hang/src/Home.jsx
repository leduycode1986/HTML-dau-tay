import React, { useState } from 'react';
import { Row, Col, Container, Alert } from 'react-bootstrap';
import { Link, useParams } from 'react-router-dom';
import Product from './Product';

function Home({ dsSanPham, dsDanhMuc, themVaoGio }) {
  const { id: categoryId } = useParams();
  const [openMenuId, setOpenMenuId] = useState(null);

  // Logic lọc sản phẩm theo danh mục (Click vào danh mục cha thì hiện cả con)
  const filteredProducts = categoryId 
    ? dsSanPham.filter(sp => {
        if (sp.phanLoai === categoryId) return true;
        // Kiểm tra xem danh mục hiện tại có phải là cha của sp này ko
        const childCats = dsDanhMuc.filter(d => d.parent === categoryId).map(c => c.id);
        return childCats.includes(sp.phanLoai);
      }) 
    : dsSanPham;

  // Lấy thông tin danh mục hiện tại để hiển thị Menu Ngang
  const currentCategory = dsDanhMuc.find(d => d.id === categoryId);
  const childCategories = categoryId ? dsDanhMuc.filter(d => d.parent === categoryId) : [];

  // Component Sidebar
  const Sidebar = () => (
    <Col md={3} lg={2} className="sidebar-main bg-white d-none d-md-block" style={{minHeight:'100vh'}}>
      <div className="bg-success text-white p-3 fw-bold text-uppercase"><i className="fa-solid fa-bars me-2"></i> DANH MỤC</div>
      {dsDanhMuc.filter(d => !d.parent).map(parent => {
        const hasChild = dsDanhMuc.some(c => c.parent === parent.id);
        return (
          <div key={parent.id} className="category-item">
            <div className={`category-link ${categoryId === parent.id ? 'active' : ''}`}>
              <Link to={`/category/${parent.id}`} style={{flex:1}}>{parent.icon} {parent.ten}</Link>
              {hasChild && <span className="dropdown-toggle-btn" onClick={(e) => { e.preventDefault(); setOpenMenuId(openMenuId === parent.id ? null : parent.id); }}>{openMenuId === parent.id ? '▲' : '▼'}</span>}
            </div>
            {hasChild && (
              <ul className={`submenu ${openMenuId === parent.id ? 'open' : ''}`}>
                {dsDanhMuc.filter(c => c.parent === parent.id).map(child => (
                  <li key={child.id}><Link to={`/category/${child.id}`}>{child.ten}</Link></li>
                ))}
              </ul>
            )}
          </div>
        )
      })}
    </Col>
  );

  return (
    <Container fluid className="p-0">
      <Row className="g-0">
        <Sidebar />
        <Col md={9} lg={10} className="p-4" style={{background: '#f4f6f9'}}>
          
          {/* TRƯỜNG HỢP 1: ĐANG Ở TRANG CHỦ (KHÔNG CÓ ID) -> HIỆN THEO SECTION */}
          {!categoryId && (
            <>
              {/* SẢN PHẨM MỚI */}
              <div className="section-title">✨ SẢN PHẨM MỚI</div>
              <Row className="g-3 mb-5">
                {dsSanPham.filter(sp => sp.isMoi).slice(0, 4).map(sp => <Col key={sp.id} xs={6} md={3}><Product sp={sp} themVaoGio={themVaoGio}/></Col>)}
              </Row>

              {/* SẢN PHẨM HOT */}
              <div className="section-title">🔥 BÁN CHẠY NHẤT</div>
              <Row className="g-3 mb-5">
                {dsSanPham.filter(sp => sp.isBanChay).slice(0, 4).map(sp => <Col key={sp.id} xs={6} md={3}><Product sp={sp} themVaoGio={themVaoGio}/></Col>)}
              </Row>

              {/* SẢN PHẨM KHUYẾN MÃI */}
              <div className="section-title">⚡ KHUYẾN MÃI SỐC</div>
              <Row className="g-3 mb-5">
                {dsSanPham.filter(sp => sp.isKhuyenMai).slice(0, 4).map(sp => <Col key={sp.id} xs={6} md={3}><Product sp={sp} themVaoGio={themVaoGio}/></Col>)}
              </Row>
            </>
          )}

          {/* TRƯỜNG HỢP 2: ĐANG Ở TRONG DANH MỤC */}
          {categoryId && (
            <>
              <h3 className="fw-bold mb-3 text-uppercase text-success">{currentCategory?.ten}</h3>
              {/* MENU NGANG CHO DANH MỤC CON */}
              {childCategories.length > 0 && (
                <div className="horizontal-submenu">
                  {childCategories.map(child => (
                    <Link key={child.id} to={`/category/${child.id}`} className="sub-pill">{child.ten}</Link>
                  ))}
                </div>
              )}

              {/* LƯỚI SẢN PHẨM */}
              {filteredProducts.length === 0 ? (
                <Alert variant="warning" className="text-center">📭 Chưa có sản phẩm nào trong mục này!</Alert>
              ) : (
                <Row className="g-3">
                  {filteredProducts.map(sp => <Col key={sp.id} xs={6} md={4} lg={3}><Product sp={sp} themVaoGio={themVaoGio}/></Col>)}
                </Row>
              )}
            </>
          )}
        </Col>
      </Row>
    </Container>
  );
}

export default Home;