import React, { useState, useEffect, useRef } from 'react';
import { Row, Col, Container, Alert, Button, Modal, Spinner } from 'react-bootstrap';
import Product from './Product';
import { Link, useParams, useLocation } from 'react-router-dom';
import { db } from './firebase';
import { collection, query, where, limit, getDocs } from 'firebase/firestore'; 
import { toSlug } from './utils';
import Slider from "react-slick"; 
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";

// --- COMPONENT SLIDER SẢN PHẨM ---
const ProductSlider = ({ title, products, icon, themVaoGio, setQuickViewSP }) => {
  const scrollRef = useRef(null);
  const scroll = (d) => { if(scrollRef.current) scrollRef.current.scrollLeft += d==='left'?-300:300; };
  
  // [FIX 1]: Nới lỏng điều kiện lọc, chỉ cần có ID là hiện (tránh mất sản phẩm)
  const validProducts = products?.filter(p => p.id) || [];
  if (validProducts.length === 0) return null;
  
  return ( 
    <div className="mb-4 bg-white p-3 rounded shadow-sm">
       {title && <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
          <h5 className="fw-bold text-success m-0"><span className="me-2">{icon}</span> {title}</h5>
          <div className="d-flex gap-2">
            <button className="btn btn-sm btn-light border" onClick={()=>scroll('left')}><i className="fa-solid fa-chevron-left"></i></button>
            <button className="btn btn-sm btn-light border" onClick={()=>scroll('right')}><i className="fa-solid fa-chevron-right"></i></button>
          </div>
       </div>}
       
       {/* [CSS]: Dùng class từ style.css thay vì inline style */}
       <div className="product-slider-scroll" ref={scrollRef}>
         {validProducts.map(sp => (
             <div key={sp.id} className="slider-product-item">
               <Product sp={sp} themVaoGio={themVaoGio} openQuickView={()=>setQuickViewSP(sp)} />
             </div>
         ))}
       </div>
    </div> 
  );
};

// --- COMPONENT CHÍNH ---
function Home({ dsDanhMuc, themVaoGio, shopConfig, banners }) {
  const { slug } = useParams();
  const location = useLocation();
  
  const [allProducts, setAllProducts] = useState([]); 
  const [displayProducts, setDisplayProducts] = useState([]); 
  const [flashSales, setFlashSales] = useState([]); 
  const [bestSellers, setBestSellers] = useState([]); 
  const [newArrivals, setNewArrivals] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [visibleCount, setVisibleCount] = useState(12);
  const [quickViewSP, setQuickViewSP] = useState(null);
  const [timeLeft, setTimeLeft] = useState({ d:0, h:0, m:0, s:0 });

  const queryParams = new URLSearchParams(location.search);
  const searchQuery = queryParams.get('search');
  
  // Tải tối đa 100 sản phẩm một lần để xử lý tại Client (Tránh lỗi phân trang Server)
  const FETCH_LIMIT = 100;

  useEffect(() => {
    if(!shopConfig?.flashSaleEnd) return;
    const check = () => {
      const dist = new Date(shopConfig.flashSaleEnd).getTime() - new Date().getTime();
      if (dist > 0) setTimeLeft({ d:Math.floor(dist/(1000*60*60*24)), h:Math.floor((dist%(1000*60*60*24))/(1000*60*60)), m:Math.floor((dist%(1000*60*60))/(1000*60)), s:Math.floor((dist%(1000*60))/1000) });
    };
    check(); const t = setInterval(check, 1000); return () => clearInterval(t);
  }, [shopConfig]);

  const fetchAllProducts = async () => {
    setLoading(true);
    try {
      const productRef = collection(db, "sanPham");
      const isHomepage = !slug && !searchQuery;

      // 1. Tải dữ liệu cho các Slider
      if (isHomepage) {
          const pFlash = getDocs(query(productRef, where("isFlashSale", "==", true), limit(10)));
          const pBest = getDocs(query(productRef, where("isBanChay", "==", true), limit(10)));
          const pNew = getDocs(query(productRef, where("isMoi", "==", true), limit(10)));
          
          const [snFlash, snBest, snNew] = await Promise.all([pFlash, pBest, pNew]);
          
          // Helper: Chuẩn hóa dữ liệu, nếu thiếu giá thì gán bằng 0 để không bị lỗi render
          const sanitize = (sn) => sn.docs.map(d => {
              const data = d.data();
              return { id: d.id, ...data, giaBan: data.giaBan || 0, giaGoc: data.giaGoc || 0 };
          });

          setFlashSales(sanitize(snFlash));
          setBestSellers(sanitize(snBest));
          setNewArrivals(sanitize(snNew));
      }

      // 2. Tải dữ liệu chính (Danh sách lưới)
      let constraints = [];
      if (slug === 'khuyen-mai-soc') constraints.push(where("phanTramGiam", ">", 0));
      else if (slug === 'san-pham-moi') constraints.push(where("isMoi", "==", true));
      else if (slug === 'san-pham-ban-chay') constraints.push(where("isBanChay", "==", true));
      else if (slug) {
        const danhMuc = dsDanhMuc.find(d => (d.slug === slug) || (toSlug(d.ten) === slug));
        if (danhMuc) {
           const subCats = dsDanhMuc.filter(d => d.parent === danhMuc.id).map(d => d.id);
           constraints.push(where("phanLoai", "in", [danhMuc.id, ...subCats].slice(0, 10)));
        }
      }

      // Tải về tất cả (không sort server để tránh mất sản phẩm cũ không có ngày tạo)
      const qGrid = query(productRef, ...constraints, limit(FETCH_LIMIT));
      const snapshot = await getDocs(qGrid);
      
      const rawDocs = snapshot.docs;
      
      // [FIX 2 - QUAN TRỌNG]: Lọc nhưng không bỏ sản phẩm thiếu giá/tên, chỉ chuẩn hóa chúng
      const validDocs = rawDocs.map(d => {
          const data = d.data();
          return { 
              id: d.id, 
              ...data,
              ten: data.ten || "Sản phẩm chưa đặt tên", // Fallback tên
              giaBan: data.giaBan || 0,               // Fallback giá
              giaGoc: data.giaGoc || 0
          };
      });

      // Sắp xếp Client-side (Mới nhất lên đầu)
      validDocs.sort((a,b) => (b.ngayTao?.seconds || 0) - (a.ngayTao?.seconds || 0));

      let finalProds = validDocs;
      if (searchQuery) {
          finalProds = finalProds.filter(p => p.ten.toLowerCase().includes(searchQuery.toLowerCase()));
      }

      setAllProducts(finalProds);
      setVisibleCount(12); 

    } catch (err) { console.error(err); }
    setLoading(false);
  };

  useEffect(() => {
     setDisplayProducts(allProducts.slice(0, visibleCount));
  }, [visibleCount, allProducts]);

  useEffect(() => {
    setAllProducts([]); 
    setFlashSales([]); setBestSellers([]); setNewArrivals([]);
    setVisibleCount(12);
    fetchAllProducts(); 
  }, [slug, searchQuery, dsDanhMuc]);

  const sliderSettings = { dots: true, infinite: true, speed: 500, slidesToShow: 1, slidesToScroll: 1, autoplay: true };
  const isFlashSaleActive = shopConfig?.flashSaleEnd && new Date(shopConfig.flashSaleEnd) > new Date();

  return (
    // [CSS]: Sử dụng class home-container để đẩy footer xuống
    <Container fluid className="p-0 home-container">
      <Row className="g-0"><Col xs={12} className="p-3">
        {!slug && !searchQuery && banners && banners.length > 0 && (
            <div className="mb-4">
                <Row className="g-3">
                    <Col lg={isFlashSaleActive ? 8 : 12} md={12}>
                        <div className="banner-slider-box"><Slider {...sliderSettings}>{banners.map(b => (<Link key={b.id} to={b.link || '#'}><img src={b.img} className="banner-img-fixed" alt="Banner" /></Link>))}</Slider></div>
                    </Col>
                    {isFlashSaleActive && (
                        <Col lg={4} className="d-none d-lg-block">
                            <div className="flash-sale-side-box"><i className="fa-solid fa-bolt flash-bg-icon"></i><h3 className="flash-side-title"><i className="fa-solid fa-bolt fa-shake me-2 text-warning"></i>FLASH SALE</h3><p className="small text-white-50 mb-3">Kết thúc sau</p><div className="d-flex gap-2 mb-3">{[{ val: timeLeft.d, label: 'Ngày' }, { val: timeLeft.h, label: 'Giờ' }, { val: timeLeft.m, label: 'Phút' }, { val: timeLeft.s, label: 'Giây' }].map((item, idx) => (<div key={idx} className="text-center"><div className="countdown-box-sm">{String(item.val).padStart(2,'0')}</div><div className="countdown-label-sm">{item.label}</div></div>))}</div><Button variant="light" size="sm" className="rounded-pill fw-bold text-danger px-4 shadow-sm" as={Link} to="/flash-sale">XEM NGAY</Button></div>
                        </Col>
                    )}
                </Row>
            </div>
        )}
        
        {loading && allProducts.length === 0 ? <div className="text-center py-5"><Spinner animation="border" variant="success" /><p className="mt-2 text-muted">Đang tải...</p></div> : (
          <>
            {!slug && !searchQuery && (
              <><ProductSlider title="⚡ SẢN PHẨM FLASH SALE" icon="⚡" products={flashSales} themVaoGio={themVaoGio} setQuickViewSP={setQuickViewSP} /><ProductSlider title="🔥 SẢN PHẨM BÁN CHẠY" icon="🔥" products={bestSellers} themVaoGio={themVaoGio} setQuickViewSP={setQuickViewSP} /><ProductSlider title="✨ SẢN PHẨM MỚI VỀ" icon="✨" products={newArrivals} themVaoGio={themVaoGio} setQuickViewSP={setQuickViewSP} /></>
            )}
            
            {/* [CSS]: Sử dụng class main-product-grid */}
            <div className="bg-white p-3 rounded shadow-sm mt-3 main-product-grid"> 
              <div className="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2"><h5 className="fw-bold text-success m-0"><i className="fa-solid fa-list me-2"></i> {searchQuery ? `Tìm kiếm: "${searchQuery}"` : slug === 'san-pham-moi' ? '✨ SẢN PHẨM MỚI' : slug === 'san-pham-ban-chay' ? '🔥 SẢN PHẨM BÁN CHẠY' : slug === 'khuyen-mai-soc' ? '⚡ KHUYẾN MÃI SỐC' : slug ? 'DANH SÁCH SẢN PHẨM' : 'GỢI Ý CHO BẠN'} </h5></div>
              
              {displayProducts.length === 0 ? <Alert variant="warning" className="text-center">Không tìm thấy sản phẩm nào.</Alert> : (
                <Row className="g-3 row-cols-2 row-cols-md-3 row-cols-lg-4 row-cols-xl-5">
                  {displayProducts.map(sp => (
                     <Col key={sp.id} className="d-flex align-items-stretch">
                        <Product sp={sp} themVaoGio={themVaoGio} openQuickView={()=>setQuickViewSP(sp)} />
                     </Col>
                  ))}
                </Row>
              )}
              
              {/* Nút Xem thêm */}
              {allProducts.length > displayProducts.length && (
                  <div className="text-center mt-4">
                      <Button variant="outline-success" className="rounded-pill px-5 fw-bold" onClick={() => setVisibleCount(prev => prev + 12)}>
                          Xem thêm <i className="fa-solid fa-chevron-down ms-1"></i>
                      </Button>
                  </div>
              )}
            </div>
          </>
        )}
      </Col></Row>
      
      {/* MODAL XEM NHANH */}
      <Modal show={!!quickViewSP} onHide={()=>setQuickViewSP(null)} size="lg" centered dialogClassName="quick-view-modal">
        <Modal.Body className="p-0 position-relative">
          <div className="btn-close-quickview" onClick={()=>setQuickViewSP(null)} title="Đóng"><i className="fa-solid fa-xmark"></i></div>
          {quickViewSP && (
            <Row className="g-0">
              <Col md={6}><div className="qv-img-box"><img src={quickViewSP.anh} className="qv-img" alt={quickViewSP.ten} /></div></Col>
              <Col md={6}>
                <div className="qv-info-box">
                  <h4 className="qv-title">{quickViewSP.ten}</h4>
                  <div className="qv-price">{parseInt(quickViewSP.giaBan || 0).toLocaleString()} ¥ {quickViewSP.phanTramGiam > 0 && <span className="ms-3 text-muted text-decoration-line-through fs-6">{parseInt(quickViewSP.giaGoc || 0).toLocaleString()} ¥</span>}</div>
                  <div className="mb-3"><span className="fw-bold">Đơn vị:</span> <span className="tag-donvi">{quickViewSP.donVi}</span><span className="mx-2">|</span><span className="fw-bold">Tình trạng:</span> <span className={quickViewSP.soLuong > 0 ? "text-success fw-bold" : "text-danger"}>{quickViewSP.soLuong > 0 ? "Còn hàng" : "Hết hàng"}</span></div>
                  <div className="qv-desc"><div dangerouslySetInnerHTML={{__html: quickViewSP.moTa}}></div></div>
                  <Button variant="success" size="lg" className="w-100 fw-bold rounded-pill shadow-sm mt-auto" onClick={()=>{themVaoGio(quickViewSP); setQuickViewSP(null)}} disabled={quickViewSP.soLuong <= 0}><i className="fa-solid fa-cart-plus me-2"></i> THÊM VÀO GIỎ NGAY</Button>
                </div>
              </Col>
            </Row>
          )}
        </Modal.Body>
      </Modal>
    </Container>
  );
}
export default Home;