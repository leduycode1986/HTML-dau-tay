import React, { useState, useEffect, useRef } from 'react';
import { Row, Col, Container, Alert, Button, Modal } from 'react-bootstrap';
import Product from './Product';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { toSlug } from './App';

// (Component Slider - Không cần thay đổi)
const ProductSlider = ({ title, products, icon, themVaoGio, setQuickViewSP }) => {
  const scrollRef = useRef(null);
  const scroll = (d) => { if(scrollRef.current) scrollRef.current.scrollLeft += d==='left'?-300:300; };
  if (!products || products.length === 0) return null;
  return ( 
    <div className="mb-4" data-aos="fade-up">
       {title && <div className="slider-header"><div className="section-title d-flex align-items-center mb-0 border-0"><span className="me-2 fs-4">{icon}</span> {title}</div><div className="d-flex gap-2"><button className="slider-nav-btn" onClick={() => scroll('left')}><i className="fa-solid fa-chevron-left"></i></button><button className="slider-nav-btn" onClick={() => scroll('right')}><i className="fa-solid fa-chevron-right"></i></button></div></div>}
       <div className="product-slider-wrapper"><div className="product-scroll-container" ref={scrollRef}>{products.map(sp => (<div key={sp.id} className="slider-item position-relative product-card-hover-trigger"><Product sp={sp} themVaoGio={themVaoGio} openQuickView={()=>setQuickViewSP(sp)} /></div>))}</div></div>
    </div> 
  );
};

function Home({ dsSanPham, dsDanhMuc, themVaoGio, shopConfig }) {
  const { id: categoryId } = useParams();
  const navigate = useNavigate();
  const [openMenuId, setOpenMenuId] = useState(null);
  const [sortType, setSortType] = useState('default');
  const [minPrice, setMinPrice] = useState(''); const [maxPrice, setMaxPrice] = useState('');
  const [visibleCount, setVisibleCount] = useState(12);
  const [timeLeft, setTimeLeft] = useState({ h: 0, m: 0, s: 0 });
  const [quickViewSP, setQuickViewSP] = useState(null);
  const [recentProducts, setRecentProducts] = useState([]);
  const [showPopupAds, setShowPopupAds] = useState(false);

  useEffect(() => {
    if(!shopConfig?.flashSaleEnd) return;
    const now = new Date().getTime(); const distance = new Date(shopConfig.flashSaleEnd).getTime() - now;
    if (distance > 0 && !sessionStorage.getItem('seenPopup')) { setShowPopupAds(true); sessionStorage.setItem('seenPopup', 'true'); }
    const interval = setInterval(() => {
      const nowTick = new Date().getTime(); const distTick = new Date(shopConfig.flashSaleEnd).getTime() - nowTick;
      if (distTick < 0) { clearInterval(interval); setTimeLeft({ h:0, m:0, s:0 }); setShowPopupAds(false); }
      else { setTimeLeft({ h: Math.floor((distTick%(1000*60*60*24))/(1000*60*60)), m: Math.floor((distTick%(1000*60*60))/(1000*60)), s: Math.floor((distTick%(1000*60))/1000) }); }
    }, 1000);
    return () => clearInterval(interval);
  }, [shopConfig]);

  useEffect(() => { const recentIds = JSON.parse(localStorage.getItem('recent') || '[]'); if(recentIds.length > 0 && dsSanPham.length > 0) setRecentProducts(recentIds.map(id => dsSanPham.find(p => p.id === id)).filter(Boolean)); }, [dsSanPham]);
  
  let finalProducts = categoryId ? dsSanPham.filter(sp => (sp.phanLoai === categoryId || dsDanhMuc.filter(d => d.parent === categoryId).map(c => c.id).includes(sp.phanLoai))) : dsSanPham;
  if (minPrice || maxPrice) { finalProducts = finalProducts.filter(sp => { const g = sp.giaBan||0; const min = minPrice?parseInt(minPrice):0; const max = maxPrice?parseInt(maxPrice):Infinity; return g>=min && g<=max; }); }
  if (sortType === 'price-asc') finalProducts.sort((a, b) => (a.giaBan||0) - (b.giaBan||0));
  if (sortType === 'price-desc') finalProducts.sort((a, b) => (b.giaBan||0) - (a.giaBan||0));
  if (sortType === 'name-az') finalProducts.sort((a, b) => a.ten.localeCompare(b.ten));

  return (
    <Container fluid className="p-0">
      <Row className="g-0">
        <Col xs={12} md={3} lg={2} className="sidebar-main shadow-sm bg-white"><div className="bg-success text-white p-3 fw-bold text-center text-uppercase"><i className="fa-solid fa-bars me-2"></i> DANH MỤC</div><div className="category-list p-2">{dsDanhMuc.filter(d => !d.parent).map(parent => {const hasChild = dsDanhMuc.some(c => c.parent === parent.id);const isOpen = openMenuId === parent.id;const linkParent = `/danh-muc/${toSlug(parent.ten)}/${parent.id}`;return (<div key={parent.id} className="mb-1 border-bottom"><div className={`d-flex align-items-center justify-content-between p-2 rounded ${categoryId === parent.id ? 'bg-light fw-bold text-success' : 'text-dark'}`}><Link to={linkParent} className="text-decoration-none text-inherit flex-grow-1 d-flex align-items-center" style={{fontSize: '0.95rem'}}><span className="me-2 fs-5">{parent.icon || '📦'}</span> {parent.ten}</Link>{hasChild && <span onClick={(e) => {e.preventDefault(); setOpenMenuId(isOpen ? null : parent.id);}} style={{cursor: 'pointer', padding: '0 10px', color:'#888', fontWeight:'bold'}}>{isOpen ? '▲' : '▼'}</span>}</div>{hasChild && isOpen && <div className="ms-4 ps-2 pb-2 submenu-container">{dsDanhMuc.filter(c => c.parent === parent.id).map(child => (<Link key={child.id} to={`/danh-muc/${toSlug(child.ten)}/${child.id}`} className="d-block py-1 text-decoration-none text-secondary small hover-green">↳ {child.ten}</Link>))}</div>}</div>);})}</div></Col>
        <Col xs={12} md={9} lg={10} className="p-3 p-md-4" style={{background: '#f4f6f9'}}>
          {!categoryId && (
            <>
              {/* KHÔNG CÒN BANNER VÀ FLASH SALE Ở ĐÂY NỮA (ĐÃ CHUYỂN RA APP VÀ TRANG RIÊNG) */}
              <ProductSlider title="SẢN PHẨM BÁN CHẠY" icon="🔥" products={dsSanPham.filter(sp => sp.isBanChay)} themVaoGio={themVaoGio} setQuickViewSP={setQuickViewSP} />
              <ProductSlider title="SẢN PHẨM MỚI" icon="✨" products={dsSanPham.filter(sp => sp.isMoi)} themVaoGio={themVaoGio} setQuickViewSP={setQuickViewSP} />
              {recentProducts.length > 0 && (<div className="mt-5 border-top pt-4"><h5 className="text-secondary mb-3"><i className="fa-solid fa-clock-rotate-left me-2"></i> Sản phẩm bạn vừa xem</h5><Row className="g-2 g-md-3 row-cols-2 row-cols-md-4 row-cols-lg-6">{recentProducts.slice(0, 6).map(sp => <Col key={sp.id}><Product sp={sp} themVaoGio={themVaoGio} openQuickView={()=>setQuickViewSP(sp)} /></Col>)}</Row></div>)}
            </>
          )}
          <div className="mt-4 pt-3 border-top"><h4 className="fw-bold text-uppercase mb-3 text-success"><i className="fa-solid fa-border-all me-2"></i> {categoryId ? 'DANH SÁCH SẢN PHẨM' : 'TẤT CẢ SẢN PHẨM'}</h4><div className="filter-toolbar"><div className="d-flex align-items-center gap-2"><span className="fw-bold text-muted small text-uppercase">Khoảng giá:</span><div className="price-input-group"><input type="number" className="price-input" placeholder="Từ (¥)" value={minPrice} onChange={e => setMinPrice(e.target.value)} /><span className="text-muted">-</span><input type="number" className="price-input" placeholder="Đến (¥)" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} /></div></div><div className="d-flex align-items-center gap-2 ms-md-auto"><span className="fw-bold text-muted small text-uppercase">Sắp xếp:</span><select className="sort-select" value={sortType} onChange={e=>setSortType(e.target.value)}><option value="default">Mặc định</option><option value="price-asc">Giá: Thấp đến Cao</option><option value="price-desc">Giá: Cao đến Thấp</option><option value="name-az">Tên: A đến Z</option></select></div></div>{finalProducts.length === 0 ? (<Alert variant="info" className="text-center">Không tìm thấy sản phẩm phù hợp.</Alert>) : (<><Row className="g-2 g-md-3 row-cols-2 row-cols-md-3 row-cols-lg-4 row-cols-xl-5" data-aos="fade-up">{finalProducts.slice(0, visibleCount).map(sp => <Col key={sp.id}><Product sp={sp} themVaoGio={themVaoGio} openQuickView={()=>setQuickViewSP(sp)} /></Col>)}</Row>{visibleCount < finalProducts.length && (<div className="text-center mt-4"><Button variant="outline-success" className="rounded-pill px-5 fw-bold shadow-sm" onClick={() => setVisibleCount(visibleCount + 12)}>Xem thêm <i className="fa-solid fa-arrow-down ms-2"></i></Button></div>)}</>)}</div>
        </Col>
      </Row>

      <Modal show={!!quickViewSP} onHide={() => setQuickViewSP(null)} size="lg" centered><Modal.Body className="p-0">{quickViewSP && (<Row className="g-0"><Col md={5}><img src={quickViewSP.anh} className="w-100 h-100 object-fit-cover" alt="" style={{minHeight: '300px'}} /></Col><Col md={7} className="p-4 d-flex flex-column justify-content-center"><h3 className="fw-bold text-success mb-2">{quickViewSP.ten}</h3><div className="mb-3"><span className="h4 text-danger fw-bold me-3">{quickViewSP.giaBan?.toLocaleString()} ¥</span>{quickViewSP.phanTramGiam > 0 && <span className="text-muted text-decoration-line-through">{quickViewSP.giaGoc?.toLocaleString()} ¥</span>}</div><div className="mb-4 text-muted small" dangerouslySetInnerHTML={{__html: quickViewSP.moTa?.substring(0, 150) + '...'}}></div><div className="d-flex gap-2"><Button variant="success" className="flex-grow-1 fw-bold rounded-pill" onClick={()=>{themVaoGio(quickViewSP); setQuickViewSP(null)}}>THÊM VÀO GIỎ</Button><Button variant="outline-secondary" onClick={()=>setQuickViewSP(null)}>Đóng</Button></div><Link to={`/san-pham/${toSlug(quickViewSP.ten)}/${quickViewSP.id}`} className="mt-3 text-center small text-primary">Xem chi tiết đầy đủ</Link></Col></Row>)}</Modal.Body></Modal>

      {/* POPUP SĂN DEAL (LIÊN KẾT ĐẾN TRANG FLASH SALE) */}
      <Modal show={showPopupAds} onHide={()=>setShowPopupAds(false)} size="md" centered className="ads-modal">
        <Modal.Header closeButton style={{border: 'none', paddingBottom: 0}} />
        <Modal.Body className="text-center pt-0 pb-4 px-4">
          <div className="mb-3 display-1 text-warning"><i className="fa-solid fa-bolt fa-shake"></i></div>
          <h4 className="fw-bold text-danger mb-2">FLASH SALE ĐANG DIỄN RA!</h4>
          <p className="text-muted mb-4">Săn ngay kẻo lỡ - Giá cực sốc</p>
          <div className="countdown-box justify-content-center mb-4 gap-2"><div className="countdown-item bg-danger text-white fs-4 p-2">{String(timeLeft.h).padStart(2,'0')}</div> : <div className="countdown-item bg-danger text-white fs-4 p-2">{String(timeLeft.m).padStart(2,'0')}</div> : <div className="countdown-item bg-danger text-white fs-4 p-2">{String(timeLeft.s).padStart(2,'0')}</div></div>
          {/* CHUYỂN HƯỚNG SANG TRANG FLASH SALE */}
          <Button variant="success" size="lg" className="w-100 rounded-pill fw-bold shadow" onClick={()=>{setShowPopupAds(false); navigate('/flash-sale')}}>SĂN DEAL NGAY</Button>
        </Modal.Body>
      </Modal>
    </Container>
  );
}
export default Home;