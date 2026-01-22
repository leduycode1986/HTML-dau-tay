import React, { useState, useEffect, useRef } from 'react';
import { Row, Col, Container, Button, Modal } from 'react-bootstrap';
import Product from './Product';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { toSlug } from './App';

const ProductSlider = ({ title, products, icon, themVaoGio, setQuickViewSP }) => { /* ...Giữ nguyên logic slider... */ return (
  <div className="mb-5">
    {title && <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom"><h4 className="fw-bold text-uppercase m-0 text-success"><span className="me-2">{icon}</span> {title}</h4></div>}
    <div className="d-flex gap-3 overflow-auto pb-3" style={{scrollBehavior:'smooth', scrollbarWidth:'none'}}>{products.map(sp=><div key={sp.id} style={{minWidth:220}}><Product sp={sp} themVaoGio={themVaoGio} openQuickView={()=>setQuickViewSP(sp)}/></div>)}</div>
  </div>
)};

function Home({ dsSanPham, dsDanhMuc, themVaoGio, shopConfig }) {
  const { id: categoryId } = useParams();
  const navigate = useNavigate();
  const [sortType, setSortType] = useState('default');
  const [minPrice, setMinPrice] = useState(''); const [maxPrice, setMaxPrice] = useState('');
  const [visibleCount, setVisibleCount] = useState(12);
  const [timeLeft, setTimeLeft] = useState({ d:0, h:0, m:0, s:0 });
  const [showPopupAds, setShowPopupAds] = useState(false);
  const [quickViewSP, setQuickViewSP] = useState(null);

  useEffect(() => {
    if(!shopConfig?.flashSaleEnd) return;
    const end = new Date(shopConfig.flashSaleEnd).getTime();
    const check = () => {
      const now = new Date().getTime(); const dist = end - now;
      if(dist > 0) {
        if(!sessionStorage.getItem('seenPopup')) { setShowPopupAds(true); sessionStorage.setItem('seenPopup','true'); }
        setTimeLeft({ d: Math.floor(dist/(1000*60*60*24)), h: Math.floor((dist%(1000*60*60*24))/(1000*60*60)), m: Math.floor((dist%(1000*60*60))/(1000*60)), s: Math.floor((dist%(1000*60))/1000) });
      } else setShowPopupAds(false);
    };
    check(); const t = setInterval(check, 1000); return ()=>clearInterval(t);
  }, [shopConfig]);

  let finalProducts = categoryId ? dsSanPham.filter(sp => (sp.phanLoai === categoryId || dsDanhMuc.filter(d => d.parent === categoryId).map(c => c.id).includes(sp.phanLoai))) : dsSanPham;
  if (minPrice || maxPrice) finalProducts = finalProducts.filter(sp => { const g = sp.giaBan||0; return g>=(minPrice||0) && g<=(maxPrice||Infinity); });
  if (sortType === 'price-asc') finalProducts.sort((a,b)=>a.giaBan-b.giaBan);
  if (sortType === 'price-desc') finalProducts.sort((a,b)=>b.giaBan-a.giaBan);

  return (
    <div>
      {!categoryId && (
        <>
          <ProductSlider title="SẢN PHẨM BÁN CHẠY" icon="🔥" products={dsSanPham.filter(sp => sp.isBanChay)} themVaoGio={themVaoGio} setQuickViewSP={setQuickViewSP} />
          <ProductSlider title="SẢN PHẨM MỚI" icon="✨" products={dsSanPham.filter(sp => sp.isMoi)} themVaoGio={themVaoGio} setQuickViewSP={setQuickViewSP} />
        </>
      )}

      <div className="mt-3">
        <h4 className="fw-bold text-uppercase mb-3 text-success border-bottom pb-2">{categoryId ? 'DANH SÁCH SẢN PHẨM' : 'TẤT CẢ SẢN PHẨM'}</h4>
        <div className="bg-white p-3 rounded shadow-sm mb-4 d-flex flex-wrap gap-3 align-items-center">
          <div className="d-flex align-items-center gap-2"><span className="fw-bold small text-muted">KHOẢNG GIÁ:</span><input type="number" placeholder="Từ" className="form-control form-control-sm" style={{width:100}} value={minPrice} onChange={e=>setMinPrice(e.target.value)} /> - <input type="number" placeholder="Đến" className="form-control form-control-sm" style={{width:100}} value={maxPrice} onChange={e=>setMaxPrice(e.target.value)} /></div>
          <div className="ms-auto d-flex align-items-center gap-2"><span className="fw-bold small text-muted">SẮP XẾP:</span><select className="form-select form-select-sm" style={{width:150}} value={sortType} onChange={e=>setSortType(e.target.value)}><option value="default">Mặc định</option><option value="price-asc">Giá tăng dần</option><option value="price-desc">Giá giảm dần</option></select></div>
        </div>
        <Row className="g-3 row-cols-2 row-cols-md-3 row-cols-lg-4">
          {finalProducts.slice(0, visibleCount).map(sp => <Col key={sp.id}><Product sp={sp} themVaoGio={themVaoGio} openQuickView={()=>setQuickViewSP(sp)} /></Col>)}
        </Row>
        {visibleCount < finalProducts.length && <div className="text-center mt-4"><Button variant="outline-success" className="rounded-pill px-5 fw-bold" onClick={()=>setVisibleCount(v=>v+12)}>Xem thêm</Button></div>}
      </div>

      <Modal show={!!quickViewSP} onHide={()=>setQuickViewSP(null)} size="lg" centered><Modal.Body className="p-0">{quickViewSP && (<Row className="g-0"><Col md={6}><img src={quickViewSP.anh} className="w-100 h-100 object-fit-cover" /></Col><Col md={6} className="p-4 d-flex flex-column justify-content-center"><h4 className="fw-bold text-success">{quickViewSP.ten}</h4><div className="mb-3 text-danger fw-bold fs-4">{quickViewSP.giaBan?.toLocaleString()} ¥</div><div className="mb-3 text-muted" dangerouslySetInnerHTML={{__html: quickViewSP.moTa}}></div><Button variant="success" className="w-100 rounded-pill" onClick={()=>{themVaoGio(quickViewSP); setQuickViewSP(null)}}>Thêm vào giỏ</Button></Col></Row>)}</Modal.Body></Modal>

      <Modal show={showPopupAds} onHide={()=>setShowPopupAds(false)} centered contentClassName="flash-popup-content">
        <div className="flash-popup-body">
          <div className="flash-header-img">
            <h3 className="fw-bold m-0"><i className="fa-solid fa-bolt"></i> FLASH SALE</h3>
            <p className="m-0 small">Săn deal giá sốc ngay hôm nay!</p>
          </div>
          <div className="p-4">
            <p className="mb-3 text-muted">Chương trình kết thúc sau:</p>
            <div className="d-flex justify-content-center mb-4">
              <div className="time-box">{String(timeLeft.d).padStart(2,'0')}</div><span className="align-self-center mx-1 fw-bold">:</span>
              <div className="time-box">{String(timeLeft.h).padStart(2,'0')}</div><span className="align-self-center mx-1 fw-bold">:</span>
              <div className="time-box">{String(timeLeft.m).padStart(2,'0')}</div><span className="align-self-center mx-1 fw-bold">:</span>
              <div className="time-box bg-danger">{String(timeLeft.s).padStart(2,'0')}</div>
            </div>
            <Button variant="danger" size="lg" className="w-100 rounded-pill fw-bold shadow" onClick={()=>{setShowPopupAds(false); navigate('/flash-sale')}}>XEM NGAY</Button>
            <div className="mt-3 text-muted small cursor-pointer" onClick={()=>setShowPopupAds(false)}>Bỏ qua</div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
export default Home;