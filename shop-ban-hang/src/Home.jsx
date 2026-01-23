import React, { useState, useEffect, useRef } from 'react';
import { Row, Col, Container, Alert, Button, Modal } from 'react-bootstrap';
import Product from './Product';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { toSlug } from './App';

// --- SLIDER COMPONENT ---
const ProductSlider = ({ title, products, icon, themVaoGio, setQuickViewSP }) => {
  const scrollRef = useRef(null);
  const scroll = (d) => { if(scrollRef.current) scrollRef.current.scrollLeft += d==='left'?-300:300; };
  if (!products || products.length === 0) return null;
  return ( 
    <div className="mb-4 bg-white p-3 rounded shadow-sm">
       {title && <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom"><h5 className="fw-bold text-success m-0"><span className="me-2">{icon}</span> {title}</h5><div className="d-flex gap-2"><button className="btn btn-sm btn-light border" onClick={()=>scroll('left')}>&lt;</button><button className="btn btn-sm btn-light border" onClick={()=>scroll('right')}>&gt;</button></div></div>}
       <div className="d-flex gap-3 overflow-auto pb-2" ref={scrollRef} style={{scrollBehavior:'smooth', scrollbarWidth:'none'}}>
         {products.map(sp => (<div key={sp.id} style={{minWidth: '180px', maxWidth: '180px', flex: '0 0 auto'}}><Product sp={sp} themVaoGio={themVaoGio} openQuickView={()=>setQuickViewSP(sp)} /></div>))}
       </div>
    </div> 
  );
};

// --- MAIN HOME COMPONENT ---
function Home({ dsSanPham = [], dsDanhMuc = [], themVaoGio, shopConfig }) {
  // 1. LẤY SLUG TỪ URL (THAY VÌ ID CŨ)
  const { slug } = useParams(); 
  const navigate = useNavigate();
  
  const [sortType, setSortType] = useState('default');
  const [minPrice, setMinPrice] = useState(''); const [maxPrice, setMaxPrice] = useState('');
  const [visibleCount, setVisibleCount] = useState(12);
  const [timeLeft, setTimeLeft] = useState({ d:0, h:0, m:0, s:0 });
  const [showPopupAds, setShowPopupAds] = useState(false);
  const [quickViewSP, setQuickViewSP] = useState(null);

  // Logic Popup Flash Sale
  useEffect(() => {
    if(!shopConfig?.flashSaleEnd) return;
    const check = () => {
      const dist = new Date(shopConfig.flashSaleEnd).getTime() - new Date().getTime();
      if (dist > 0) {
        if (!sessionStorage.getItem('seenPopup')) { setShowPopupAds(true); sessionStorage.setItem('seenPopup', 'true'); }
        setTimeLeft({ d:Math.floor(dist/(1000*60*60*24)), h:Math.floor((dist%(1000*60*60*24))/(1000*60*60)), m:Math.floor((dist%(1000*60*60))/(1000*60)), s:Math.floor((dist%(1000*60))/1000) });
      } else setShowPopupAds(false);
    };
    check(); const t = setInterval(check, 1000); return () => clearInterval(t);
  }, [shopConfig]);

  // Đảm bảo dữ liệu an toàn
  const safeDS = Array.isArray(dsSanPham) ? dsSanPham : [];
  const safeDM = Array.isArray(dsDanhMuc) ? dsDanhMuc : [];

  // =========================================================
  // 2. LOGIC LỌC MỚI THEO SLUG (CHÈN VÀO ĐÂY)
  // =========================================================
  let finalProducts = safeDS; // Mặc định lấy tất cả

  if (slug) {
    // Tìm danh mục dựa trên slug (so sánh slug hoặc toSlug tên)
    const danhMucHienTai = safeDM.find(d => (d.slug === slug) || (toSlug(d.ten) === slug));
    
    if (danhMucHienTai) {
      const idDM = danhMucHienTai.id;
      // Lọc sản phẩm thuộc danh mục đó hoặc con của nó
      finalProducts = safeDS.filter(sp => 
        sp.phanLoai === idDM || 
        safeDM.filter(d => d.parent === idDM).map(c => c.id).includes(sp.phanLoai)
      );
    }
  }
  // =========================================================

  // Logic lọc giá và sắp xếp (áp dụng lên finalProducts)
  if (minPrice || maxPrice) finalProducts = finalProducts.filter(sp => { const g = sp.giaBan||0; return g>=(minPrice||0) && g<=(maxPrice||Infinity); });
  if (sortType === 'price-asc') finalProducts.sort((a, b) => (a.giaBan||0) - (b.giaBan||0));
  if (sortType === 'price-desc') finalProducts.sort((a, b) => (b.giaBan||0) - (a.giaBan||0));

  return (
    <Container fluid className="p-0">
      <Row className="g-0"><Col xs={12} className="p-3">
        {!slug && (
          <>
            <ProductSlider title="SẢN PHẨM BÁN CHẠY" icon="🔥" products={safeDS.filter(sp => sp.isBanChay)} themVaoGio={themVaoGio} setQuickViewSP={setQuickViewSP} />
            <ProductSlider title="SẢN PHẨM MỚI" icon="✨" products={safeDS.filter(sp => sp.isMoi)} themVaoGio={themVaoGio} setQuickViewSP={setQuickViewSP} />
          </>
        )}
        <div className="bg-white p-3 rounded shadow-sm">
          <div className="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2">
            <h5 className="fw-bold text-success m-0"><i className="fa-solid fa-list me-2"></i> {slug ? 'DANH SÁCH' : 'TẤT CẢ SẢN PHẨM'}</h5>
            <select className="form-select form-select-sm w-auto" value={sortType} onChange={e=>setSortType(e.target.value)}><option value="default">Mặc định</option><option value="price-asc">Giá tăng dần</option><option value="price-desc">Giá giảm dần</option></select>
          </div>
          {finalProducts.length === 0 ? <Alert variant="warning" className="text-center">Không tìm thấy sản phẩm.</Alert> : (
            <Row className="g-3 row-cols-2 row-cols-md-3 row-cols-lg-4 row-cols-xl-5">
              {finalProducts.slice(0, visibleCount).map(sp => (<Col key={sp.id}><Product sp={sp} themVaoGio={themVaoGio} openQuickView={()=>setQuickViewSP(sp)} /></Col>))}
            </Row>
          )}
          {visibleCount < finalProducts.length && <div className="text-center mt-4"><Button variant="outline-success" onClick={() => setVisibleCount(v => v + 10)}>Xem thêm</Button></div>}
        </div>
      </Col></Row>
      <Modal show={!!quickViewSP} onHide={()=>setQuickViewSP(null)} size="lg" centered><Modal.Body className="p-0">{quickViewSP && (<Row className="g-0"><Col md={6}><img src={quickViewSP.anh} className="w-100 h-100 object-fit-cover" /></Col><Col md={6} className="p-4 d-flex flex-column justify-content-center"><h4 className="fw-bold text-success">{quickViewSP.ten}</h4><div className="mb-2 text-danger fw-bold fs-4">{quickViewSP.giaBan?.toLocaleString()} ¥</div><div className="mb-3 text-muted" dangerouslySetInnerHTML={{__html: quickViewSP.moTa}}></div><Button variant="success" onClick={()=>{themVaoGio(quickViewSP); setQuickViewSP(null)}}>Thêm vào giỏ</Button></Col></Row>)}</Modal.Body></Modal>
      <Modal show={showPopupAds} onHide={()=>setShowPopupAds(false)} centered contentClassName="flash-popup-content"><div className="flash-popup-body"><div className="flash-header-bg"><h3 className="fw-bold m-0">🔥 FLASH SALE</h3></div><div className="p-4"><p className="mb-3 fw-bold text-secondary">Kết thúc sau:</p><div className="d-flex justify-content-center gap-2 mb-4"><div className="time-box">{String(timeLeft.d).padStart(2,'0')}</div>:<div className="time-box">{String(timeLeft.h).padStart(2,'0')}</div>:<div className="time-box">{String(timeLeft.m).padStart(2,'0')}</div>:<div className="time-box bg-danger">{String(timeLeft.s).padStart(2,'0')}</div></div><Button variant="danger" className="w-100 rounded-pill fw-bold shadow" onClick={()=>{setShowPopupAds(false); navigate('/flash-sale')}}>XEM NGAY</Button><div className="mt-3 text-muted small cursor-pointer text-decoration-underline" onClick={()=>setShowPopupAds(false)}>Đóng lại</div></div></div></Modal>
    </Container>
  );
}
export default Home;