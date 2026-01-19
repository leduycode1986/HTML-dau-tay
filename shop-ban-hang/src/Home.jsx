import React, { useState, useRef } from 'react';
import { Row, Col, Container, Alert, Button } from 'react-bootstrap';
import Product from './Product';
import { Link, useParams } from 'react-router-dom';

function Home({ dsSanPham, dsDanhMuc, themVaoGio }) {
  const { id: categoryId } = useParams();
  const [openMenuId, setOpenMenuId] = useState(null);
  
  // State cho mục "Tất cả sản phẩm" (Load more)
  const [visibleCount, setVisibleCount] = useState(12); // Mặc định hiện 12 sản phẩm

  // 1. Component Thanh Trượt (Slider) nội bộ
  const ProductSlider = ({ title, products, icon, emptyMsg }) => {
    const scrollRef = useRef(null);

    const scroll = (direction) => {
      if (scrollRef.current) {
        const { current } = scrollRef;
        const scrollAmount = 300; // Khoảng cách mỗi lần bấm
        current.scrollLeft += direction === 'left' ? -scrollAmount : scrollAmount;
      }
    };

    if (products.length === 0) return null; // Không có sản phẩm thì ẩn luôn section đó cho gọn

    return (
      <div className="mb-5">
        <div className="slider-header">
          <div className="section-title d-flex align-items-center mb-0 border-0">
            <span className="me-2 fs-4">{icon}</span> {title}
          </div>
          <div className="d-flex gap-2">
            <button className="slider-nav-btn" onClick={() => scroll('left')}><i className="fa-solid fa-chevron-left"></i></button>
            <button className="slider-nav-btn" onClick={() => scroll('right')}><i className="fa-solid fa-chevron-right"></i></button>
          </div>
        </div>
        
        {/* Khung chứa trượt ngang */}
        <div className="product-slider-wrapper">
          <div className="product-scroll-container" ref={scrollRef}>
            {products.map(sp => (
              <div key={sp.id} className="slider-item">
                <Product sp={sp} themVaoGio={themVaoGio} />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Lọc sản phẩm theo danh mục (nếu có)
  const filteredProducts = categoryId 
    ? dsSanPham.filter(sp => {
        if (sp.phanLoai === categoryId) return true;
        const childCats = dsDanhMuc.filter(d => d.parent === categoryId).map(c => c.id);
        return childCats.includes(sp.phanLoai);
      }) 
    : dsSanPham; // Nếu ở trang chủ thì lấy hết để hiện "Tất cả sp"

  return (
    <Container fluid className="p-0">
      <Row className="g-0">
        
        {/* --- CỘT MENU TRÁI (GIỮ NGUYÊN TÍNH NĂNG CŨ) --- */}
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
                    <Link to={`/category/${parent.id}`} className="text-decoration-none text-inherit flex-grow-1 d-flex align-items-center" style={{fontSize: '0.95rem'}}>
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

        {/* --- CỘT NỘI DUNG CHÍNH --- */}
        <Col xs={12} md={9} lg={10} className="p-3 p-md-4" style={{background: '#f4f6f9'}}>
          
          {/* TRƯỜNG HỢP 1: TRANG CHỦ (HIỆN SLIDER + TẤT CẢ SP) */}
          {!categoryId && (
            <>
              {/* 1. SẢN PHẨM KHUYẾN MÃI (SLIDER) */}
              <ProductSlider 
                title="SẢN PHẨM KHUYẾN MÃI" 
                icon="⚡" 
                products={dsSanPham.filter(sp => sp.isKhuyenMai)} 
              />

              {/* 2. SẢN PHẨM BÁN CHẠY (SLIDER) */}
              <ProductSlider 
                title="SẢN PHẨM BÁN CHẠY" 
                icon="🔥" 
                products={dsSanPham.filter(sp => sp.isBanChay)} 
              />

              {/* 3. SẢN PHẨM MỚI (SLIDER) */}
              <ProductSlider 
                title="SẢN PHẨM MỚI" 
                icon="✨" 
                products={dsSanPham.filter(sp => sp.isMoi)} 
              />

              {/* 4. TẤT CẢ SẢN PHẨM (LƯỚI CÓ LOAD MORE) */}
              <div className="mt-5 pt-3 border-top">
                <h4 className="fw-bold text-uppercase mb-4 text-success"><i className="fa-solid fa-border-all me-2"></i> TẤT CẢ SẢN PHẨM</h4>
                
                {dsSanPham.length === 0 ? (
                  <Alert variant="info" className="text-center">Đang cập nhật sản phẩm...</Alert>
                ) : (
                  <>
                    <Row className="g-2 g-md-3 row-cols-2 row-cols-md-3 row-cols-lg-4 row-cols-xl-5"> {/* 5 cột trên màn hình lớn */}
                      {dsSanPham.slice(0, visibleCount).map(sp => (
                        <Col key={sp.id}>
                          <Product sp={sp} themVaoGio={themVaoGio} />
                        </Col>
                      ))}
                    </Row>
                    
                    {/* Nút Xem Thêm */}
                    {visibleCount < dsSanPham.length && (
                      <div className="text-center mt-4">
                        <Button 
                          variant="outline-success" 
                          className="rounded-pill px-5 fw-bold shadow-sm"
                          onClick={() => setVisibleCount(visibleCount + 12)}
                        >
                          Xem thêm sản phẩm <i className="fa-solid fa-arrow-down ms-2"></i>
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </>
          )}

          {/* TRƯỜNG HỢP 2: TRANG DANH MỤC (GIỮ NGUYÊN) */}
          {categoryId && (
            <div>
              <h4 className="fw-bold text-success mb-4 text-uppercase border-bottom pb-2">
                {dsDanhMuc.find(d=>d.id===categoryId)?.ten || 'Danh sách sản phẩm'}
              </h4>
              {filteredProducts.length === 0 ? (
                <Alert variant="warning" className="text-center">📭 Chưa có sản phẩm nào trong mục này!</Alert>
              ) : (
                <Row className="g-2 g-md-3 row-cols-2 row-cols-md-3 row-cols-lg-4 row-cols-xl-5">
                  {filteredProducts.map(sp => <Col key={sp.id}><Product sp={sp} themVaoGio={themVaoGio}/></Col>)}
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