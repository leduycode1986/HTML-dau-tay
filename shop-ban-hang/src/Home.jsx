import React, { useState, useEffect, useRef } from 'react';
import { Row, Col, Container, Alert, Button, Modal } from 'react-bootstrap';
import Product from './Product'; // Import component hiển thị thẻ sản phẩm
import { Link, useParams, useNavigate } from 'react-router-dom';
import { toSlug } from './App';

// --- COMPONENT SLIDER RIÊNG (Tránh giật lag) ---
const ProductSlider = ({ title, products, icon, themVaoGio, setQuickViewSP }) => {
  const scrollRef = useRef(null);
  const scroll = (d) => { if(scrollRef.current) scrollRef.current.scrollLeft += d==='left'?-300:300; };
  
  if (!products || products.length === 0) return null;

  return ( 
    <div className="mb-5" data-aos="fade-up">
       {title && (
         <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
           <h4 className="fw-bold text-uppercase m-0 text-success">
             <span className="me-2">{icon}</span> {title}
           </h4>
           <div className="d-flex gap-2">
             <button className="btn btn-outline-secondary rounded-circle" style={{width:40, height:40}} onClick={() => scroll('left')}><i className="fa-solid fa-chevron-left"></i></button>
             <button className="btn btn-outline-secondary rounded-circle" style={{width:40, height:40}} onClick={() => scroll('right')}><i className="fa-solid fa-chevron-right"></i></button>
           </div>
         </div>
       )}
       <div className="product-slider-wrapper position-relative">
         <div className="product-scroll-container d-flex gap-3 overflow-auto pb-3" ref={scrollRef} style={{scrollBehavior:'smooth', scrollbarWidth:'none'}}>
           {products.map(sp => (
             <div key={sp.id} style={{minWidth: 240, flex: '0 0 auto'}}>
               <Product sp={sp} themVaoGio={themVaoGio} openQuickView={()=>setQuickViewSP(sp)} />
             </div>
           ))}
         </div>
       </div>
    </div> 
  );
};

function Home({ dsSanPham, dsDanhMuc, themVaoGio, shopConfig }) {
  const { id: categoryId } = useParams();
  const navigate = useNavigate();
  
  // State lọc & Sắp xếp
  const [sortType, setSortType] = useState('default');
  const [minPrice, setMinPrice] = useState(''); 
  const [maxPrice, setMaxPrice] = useState('');
  const [visibleCount, setVisibleCount] = useState(12);

  // State Popup Flash Sale
  const [timeLeft, setTimeLeft] = useState({ d:0, h: 0, m: 0, s: 0 });
  const [showPopupAds, setShowPopupAds] = useState(false);
  
  // State Quick View
  const [quickViewSP, setQuickViewSP] = useState(null);
  
  // State Sản phẩm vừa xem
  const [recentProducts, setRecentProducts] = useState([]);

  // --- LOGIC POPUP FLASH SALE ---
  useEffect(() => {
    if(!shopConfig?.flashSaleEnd) return;
    
    const checkTime = () => {
      const end = new Date(shopConfig.flashSaleEnd).getTime();
      const now = new Date().getTime();
      const distance = end - now;

      if (distance > 0) {
        // Chỉ hiện popup nếu chưa tắt lần nào trong phiên này
        if (!sessionStorage.getItem('seenPopup')) {
          setShowPopupAds(true);
          sessionStorage.setItem('seenPopup', 'true');
        }
        
        // Tính toán giờ
        setTimeLeft({
          d: Math.floor(distance / (1000 * 60 * 60 * 24)),
          h: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          m: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          s: Math.floor((distance % (1000 * 60)) / 1000)
        });
      } else {
        setShowPopupAds(false); // Hết giờ tự tắt
      }
    };

    checkTime(); // Chạy ngay lần đầu
    const interval = setInterval(checkTime, 1000); // Cập nhật mỗi giây
    return () => clearInterval(interval);
  }, [shopConfig]);

  // --- LOGIC SẢN PHẨM VỪA XEM ---
  useEffect(() => {
    const recentIds = JSON.parse(localStorage.getItem('recent') || '[]');
    if(recentIds.length > 0 && dsSanPham.length > 0) {
      // Map ID sang object sản phẩm thực tế (để lấy dữ liệu mới nhất từ DB)
      const found = recentIds.map(id => dsSanPham.find(p => p.id === id)).filter(Boolean);
      setRecentProducts(found);
    }
  }, [dsSanPham]);
  
  // --- LOGIC LỌC SẢN PHẨM ---
  let finalProducts = categoryId 
    ? dsSanPham.filter(sp => (sp.phanLoai === categoryId || dsDanhMuc.filter(d => d.parent === categoryId).map(c => c.id).includes(sp.phanLoai))) 
    : dsSanPham;

  // Lọc theo giá
  if (minPrice || maxPrice) { 
    finalProducts = finalProducts.filter(sp => { 
      const g = sp.giaBan || 0; 
      const min = minPrice ? parseInt(minPrice) : 0; 
      const max = maxPrice ? parseInt(maxPrice) : Infinity; 
      return g >= min && g <= max; 
    }); 
  }

  // Sắp xếp
  if (sortType === 'price-asc') finalProducts.sort((a, b) => (a.giaBan||0) - (b.giaBan||0));
  if (sortType === 'price-desc') finalProducts.sort((a, b) => (b.giaBan||0) - (a.giaBan||0));
  if (sortType === 'name-az') finalProducts.sort((a, b) => a.ten.localeCompare(b.ten));

  return (
    <Container fluid className="p-0">
      <Row className="g-0">
        {/* Cột chính hiển thị sản phẩm (Full width nếu không có sidebar ở đây, sidebar đã ở App.jsx) */}
        <Col xs={12} className="p-3 p-md-4">
          {!categoryId && (
            <>
              {/* SLIDER BÁN CHẠY */}
              <ProductSlider 
                title="SẢN PHẨM BÁN CHẠY" 
                icon="🔥" 
                products={dsSanPham.filter(sp => sp.isBanChay)} 
                themVaoGio={themVaoGio} 
                setQuickViewSP={setQuickViewSP} 
              />
              
              {/* SLIDER SẢN PHẨM MỚI */}
              <ProductSlider 
                title="SẢN PHẨM MỚI" 
                icon="✨" 
                products={dsSanPham.filter(sp => sp.isMoi)} 
                themVaoGio={themVaoGio} 
                setQuickViewSP={setQuickViewSP} 
              />
            </>
          )}

          {/* DANH SÁCH SẢN PHẨM CHÍNH */}
          <div className="mt-4 pt-3 border-top" id="main-product-list">
            <h4 className="fw-bold text-uppercase mb-3 text-success">
              <i className="fa-solid fa-border-all me-2"></i> 
              {categoryId ? 'DANH SÁCH SẢN PHẨM' : 'TẤT CẢ SẢN PHẨM'}
            </h4>
            
            {/* Bộ lọc Toolbar */}
            <div className="filter-toolbar mb-4 p-3 bg-white rounded shadow-sm d-flex flex-wrap gap-3 align-items-center">
              <div className="d-flex align-items-center gap-2">
                <span className="fw-bold text-muted small text-uppercase">Khoảng giá:</span>
                <div className="d-flex align-items-center gap-1">
                  <input type="number" className="form-control form-control-sm" style={{width: 100}} placeholder="Từ" value={minPrice} onChange={e => setMinPrice(e.target.value)} />
                  <span>-</span>
                  <input type="number" className="form-control form-control-sm" style={{width: 100}} placeholder="Đến" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} />
                </div>
              </div>
              <div className="ms-md-auto d-flex align-items-center gap-2">
                <span className="fw-bold text-muted small text-uppercase">Sắp xếp:</span>
                <select className="form-select form-select-sm" style={{width: 180}} value={sortType} onChange={e=>setSortType(e.target.value)}>
                  <option value="default">Mặc định</option>
                  <option value="price-asc">Giá: Thấp đến Cao</option>
                  <option value="price-desc">Giá: Cao đến Thấp</option>
                  <option value="name-az">Tên: A đến Z</option>
                </select>
              </div>
            </div>

            {/* Grid Sản phẩm */}
            {finalProducts.length === 0 ? (
              <Alert variant="info" className="text-center">Không tìm thấy sản phẩm phù hợp.</Alert>
            ) : (
              <>
                <Row className="g-3 row-cols-2 row-cols-md-3 row-cols-lg-4 row-cols-xl-5">
                  {finalProducts.slice(0, visibleCount).map(sp => (
                    <Col key={sp.id}>
                      {/* QUAN TRỌNG: Component Product đã xử lý hiển thị kho */}
                      <Product sp={sp} themVaoGio={themVaoGio} openQuickView={()=>setQuickViewSP(sp)} />
                    </Col>
                  ))}
                </Row>
                
                {/* Nút Xem thêm */}
                {visibleCount < finalProducts.length && (
                  <div className="text-center mt-5">
                    <Button variant="outline-success" className="rounded-pill px-5 fw-bold shadow-sm" onClick={() => setVisibleCount(visibleCount + 12)}>
                      Xem thêm {finalProducts.length - visibleCount} sản phẩm <i className="fa-solid fa-arrow-down ms-2"></i>
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </Col>
      </Row>

      {/* MODAL QUICK VIEW */}
      <Modal show={!!quickViewSP} onHide={() => setQuickViewSP(null)} size="lg" centered>
        <Modal.Body className="p-0">
          {quickViewSP && (
            <Row className="g-0">
              <Col md={5}><img src={quickViewSP.anh} className="w-100 h-100 object-fit-cover" alt="" style={{minHeight: '300px'}} /></Col>
              <Col md={7} className="p-4 d-flex flex-column justify-content-center">
                <h3 className="fw-bold text-success mb-2">{quickViewSP.ten}</h3>
                <div className="mb-3">
                  <span className="h4 text-danger fw-bold me-3">{quickViewSP.giaBan?.toLocaleString()} ¥</span>
                  {quickViewSP.phanTramGiam > 0 && <span className="text-muted text-decoration-line-through">{quickViewSP.giaGoc?.toLocaleString()} ¥</span>}
                </div>
                
                {/* Hiển thị Tình trạng kho trong Quick View */}
                <div className="mb-3">
                  <strong>Tình trạng: </strong> 
                  {quickViewSP.soLuong > 0 ? (
                    <span className="text-success fw-bold">Còn hàng ({quickViewSP.soLuong} {quickViewSP.donVi})</span>
                  ) : (
                    <span className="text-danger fw-bold">Hết hàng</span>
                  )}
                </div>

                <div className="mb-4 text-muted small" dangerouslySetInnerHTML={{__html: quickViewSP.moTa?.substring(0, 150) + '...'}}></div>
                
                <div className="d-flex gap-2">
                  <Button 
                    variant="success" 
                    className="flex-grow-1 fw-bold rounded-pill" 
                    onClick={()=>{themVaoGio(quickViewSP); setQuickViewSP(null)}}
                    disabled={quickViewSP.soLuong <= 0} // Khóa nút nếu hết hàng
                  >
                    {quickViewSP.soLuong > 0 ? 'THÊM VÀO GIỎ' : 'HẾT HÀNG'}
                  </Button>
                  <Button variant="outline-secondary" onClick={()=>setQuickViewSP(null)}>Đóng</Button>
                </div>
                <Link to={`/san-pham/${toSlug(quickViewSP.ten)}/${quickViewSP.id}`} className="mt-3 text-center small text-primary">Xem chi tiết đầy đủ</Link>
              </Col>
            </Row>
          )}
        </Modal.Body>
      </Modal>

      {/* POPUP FLASH SALE (GIAO DIỆN ĐẸP + NGÀY GIỜ) */}
      <Modal show={showPopupAds} onHide={()=>setShowPopupAds(false)} centered contentClassName="flash-popup-content">
        <Modal.Body className="p-4 text-center text-white position-relative" style={{zIndex: 2}}>
          <div className="flash-badge mb-3">🔥 FLASH SALE ĐANG DIỄN RA 🔥</div>
          <h3 className="fw-bold text-dark mb-2">GIẢM GIÁ SỐC</h3>
          <p className="text-dark mb-4">Kết thúc: <strong>{new Date(shopConfig.flashSaleEnd).toLocaleString('vi-VN')}</strong></p>
          
          <div className="d-flex justify-content-center gap-3 mb-4 popup-timer">
            <div className="text-center"><div className="time-box bg-dark text-white p-2 rounded fw-bold fs-4">{String(timeLeft.d).padStart(2,'0')}</div><small className="text-dark fw-bold">Ngày</small></div>
            <div className="text-center"><div className="time-box bg-dark text-white p-2 rounded fw-bold fs-4">{String(timeLeft.h).padStart(2,'0')}</div><small className="text-dark fw-bold">Giờ</small></div>
            <div className="text-center"><div className="time-box bg-dark text-white p-2 rounded fw-bold fs-4">{String(timeLeft.m).padStart(2,'0')}</div><small className="text-dark fw-bold">Phút</small></div>
            <div className="text-center"><div className="time-box bg-danger text-white p-2 rounded fw-bold fs-4">{String(timeLeft.s).padStart(2,'0')}</div><small className="text-dark fw-bold">Giây</small></div>
          </div>

          <Button variant="danger" size="lg" className="w-100 rounded-pill fw-bold shadow pulse-anim" onClick={()=>{setShowPopupAds(false); navigate('/flash-sale')}}>
            SĂN DEAL NGAY
          </Button>
          <div className="mt-3 text-dark small cursor-pointer text-decoration-underline" onClick={()=>setShowPopupAds(false)}>Đóng lại</div>
        </Modal.Body>
      </Modal>
    </Container>
  );
}
export default Home;