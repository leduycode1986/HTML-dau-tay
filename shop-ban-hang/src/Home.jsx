import React, { useState, useEffect, useRef } from 'react';
import { Row, Col, Container, Alert, Button, Form } from 'react-bootstrap';
import Product from './Product';
import { Link, useParams } from 'react-router-dom';
import Slider from "react-slick"; 
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';
import { toSlug } from './App'; // Import toSlug

function Home({ dsSanPham, dsDanhMuc, themVaoGio }) {
  const { id: categoryId } = useParams();
  const [openMenuId, setOpenMenuId] = useState(null);
  const [banners, setBanners] = useState([]);
  
  const [sortType, setSortType] = useState('default');
  const [minPrice, setMinPrice] = useState(''); 
  const [maxPrice, setMaxPrice] = useState('');
  const [visibleCount, setVisibleCount] = useState(12);

  useEffect(() => { const unsub = onSnapshot(collection(db, "banners"), (sn) => setBanners(sn.docs.map(d => ({id: d.id, ...d.data()})))); return () => unsub(); }, []);
  const sliderSettings = { dots: true, infinite: true, speed: 500, slidesToShow: 1, slidesToScroll: 1, autoplay: true, autoplaySpeed: 3000, arrows: true };

  const ProductSlider = ({ title, products, icon }) => {
     const scrollRef = useRef(null);
     const scroll = (d) => { if(scrollRef.current) scrollRef.current.scrollLeft += d==='left'?-300:300; };
     if (products.length === 0) return null;
     return ( <div className="mb-5"><div className="slider-header"><div className="section-title d-flex align-items-center mb-0 border-0"><span className="me-2 fs-4">{icon}</span> {title}</div><div className="d-flex gap-2"><button className="slider-nav-btn" onClick={() => scroll('left')}><i className="fa-solid fa-chevron-left"></i></button><button className="slider-nav-btn" onClick={() => scroll('right')}><i className="fa-solid fa-chevron-right"></i></button></div></div><div className="product-slider-wrapper"><div className="product-scroll-container" ref={scrollRef}>{products.map(sp => (<div key={sp.id} className="slider-item"><Product sp={sp} themVaoGio={themVaoGio} /></div>))}</div></div></div> );
  };
  
  let finalProducts = categoryId ? dsSanPham.filter(sp => (sp.phanLoai === categoryId || dsDanhMuc.filter(d => d.parent === categoryId).map(c => c.id).includes(sp.phanLoai))) : dsSanPham;
  if (minPrice || maxPrice) { finalProducts = finalProducts.filter(sp => { const g = sp.giaBan||0; const min = minPrice?parseInt(minPrice):0; const max = maxPrice?parseInt(maxPrice):Infinity; return g>=min && g<=max; }); }
  if (sortType === 'price-asc') finalProducts.sort((a, b) => (a.giaBan||0) - (b.giaBan||0));
  if (sortType === 'price-desc') finalProducts.sort((a, b) => (b.giaBan||0) - (a.giaBan||0));
  if (sortType === 'name-az') finalProducts.sort((a, b) => a.ten.localeCompare(b.ten));

  return (
    <Container fluid className="p-0">
      <Row className="g-0">
        <Col xs={12} md={3} lg={2} className="sidebar-main shadow-sm bg-white">
           <div className="bg-success text-white p-3 fw-bold text-center text-uppercase"><i className="fa-solid fa-bars me-2"></i> DANH MỤC</div>
           <div className="category-list p-2">{dsDanhMuc.filter(d => !d.parent).map(parent => {const hasChild = dsDanhMuc.some(c => c.parent === parent.id);const isOpen = openMenuId === parent.id;
             const linkParent = `/danh-muc/${toSlug(parent.ten)}/${parent.id}`;
             return (<div key={parent.id} className="mb-1 border-bottom"><div className={`d-flex align-items-center justify-content-between p-2 rounded ${categoryId === parent.id ? 'bg-light fw-bold text-success' : 'text-dark'}`}><Link to={linkParent} className="text-decoration-none text-inherit flex-grow-1 d-flex align-items-center" style={{fontSize: '0.95rem'}}><span className="me-2 fs-5">{parent.icon || '📦'}</span> {parent.ten}</Link>{hasChild && <span onClick={(e) => {e.preventDefault(); setOpenMenuId(isOpen ? null : parent.id);}} style={{cursor: 'pointer', padding: '0 10px', color:'#888', fontWeight:'bold'}}>{isOpen ? '▲' : '▼'}</span>}</div>{hasChild && isOpen && <div className="ms-4 ps-2 pb-2 submenu-container">{dsDanhMuc.filter(c => c.parent === parent.id).map(child => (<Link key={child.id} to={`/danh-muc/${toSlug(child.ten)}/${child.id}`} className="d-block py-1 text-decoration-none text-secondary small hover-green">↳ {child.ten}</Link>))}</div>}</div>);})}</div>
        </Col>

        <Col xs={12} md={9} lg={10} className="p-3 p-md-4" style={{background: '#f4f6f9'}}>
          {!categoryId && (
            <>
              {banners.length > 0 && (<div className="banner-slider-container"><Slider {...sliderSettings}>{banners.map(b => (<div key={b.id}>{b.link ? (<Link to={b.link}><img src={b.img} alt="Banner" className="banner-img" /></Link>) : (<img src={b.img} alt="Banner" className="banner-img" />)}</div>))}</Slider></div>)}
              <ProductSlider title="SẢN PHẨM KHUYẾN MÃI" icon="⚡" products={dsSanPham.filter(sp => sp.isKhuyenMai)} />
              <ProductSlider title="SẢN PHẨM BÁN CHẠY" icon="🔥" products={dsSanPham.filter(sp => sp.isBanChay)} />
              <ProductSlider title="SẢN PHẨM MỚI" icon="✨" products={dsSanPham.filter(sp => sp.isMoi)} />
            </>
          )}
          <div className="mt-4 pt-3 border-top"><h4 className="fw-bold text-uppercase mb-3 text-success"><i className="fa-solid fa-border-all me-2"></i> {categoryId ? 'DANH SÁCH SẢN PHẨM' : 'TẤT CẢ SẢN PHẨM'}</h4><div className="filter-toolbar"><div className="d-flex align-items-center gap-2"><span className="fw-bold text-muted small text-uppercase">Khoảng giá:</span><div className="price-input-group"><input type="number" className="price-input" placeholder="Từ (¥)" value={minPrice} onChange={e => setMinPrice(e.target.value)} /><span className="text-muted">-</span><input type="number" className="price-input" placeholder="Đến (¥)" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} /></div></div><div className="d-flex align-items-center gap-2 ms-md-auto"><span className="fw-bold text-muted small text-uppercase">Sắp xếp:</span><select className="sort-select" value={sortType} onChange={e=>setSortType(e.target.value)}><option value="default">Mặc định</option><option value="price-asc">Giá: Thấp đến Cao</option><option value="price-desc">Giá: Cao đến Thấp</option><option value="name-az">Tên: A đến Z</option></select></div></div>{finalProducts.length === 0 ? (<Alert variant="info" className="text-center">Không tìm thấy sản phẩm phù hợp.</Alert>) : (<><Row className="g-2 g-md-3 row-cols-2 row-cols-md-3 row-cols-lg-4 row-cols-xl-5">{finalProducts.slice(0, visibleCount).map(sp => <Col key={sp.id}><Product sp={sp} themVaoGio={themVaoGio} /></Col>)}</Row>{visibleCount < finalProducts.length && (<div className="text-center mt-4"><Button variant="outline-success" className="rounded-pill px-5 fw-bold shadow-sm" onClick={() => setVisibleCount(visibleCount + 12)}>Xem thêm <i className="fa-solid fa-arrow-down ms-2"></i></Button></div>)}</>)}</div>
        </Col>
      </Row>
    </Container>
  );
}
export default Home;