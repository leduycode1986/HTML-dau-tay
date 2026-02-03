import React, { useState, useEffect, useRef } from 'react';
import { Row, Col, Container, Alert, Button, Modal, Spinner } from 'react-bootstrap';
import Product from './Product';
import { Link, useParams, useLocation } from 'react-router-dom';
import { db } from './firebase';
import { collection, query, where, limit, getDocs } from 'firebase/firestore'; // Bỏ orderBy, startAfter
import { toSlug } from './utils';
import Slider from "react-slick"; 
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";

const ProductSlider = ({ title, products, icon, themVaoGio, setQuickViewSP }) => {
  const scrollRef = useRef(null);
  const scroll = (d) => { if(scrollRef.current) scrollRef.current.scrollLeft += d==='left'?-300:300; };
  
  const validProducts = products?.filter(p => p.id && p.ten) || [];
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
       <div className="d-flex gap-3 overflow-auto pb-2" ref={scrollRef} style={{scrollBehavior:'smooth', scrollbarWidth:'none'}}>
         {validProducts.map(sp => (
             <div key={sp.id} style={{minWidth: '180px', maxWidth: '180px', flex: '0 0 auto'}}>
               <Product sp={sp} themVaoGio={themVaoGio} openQuickView={()=>setQuickViewSP(sp)} />
             </div>
         ))}
       </div>
    </div> 
  );
};

function Home({ dsDanhMuc, themVaoGio, shopConfig, banners }) {
  const { slug } = useParams();
  const location = useLocation();
  
  // State chứa TOÀN BỘ sản phẩm đã tải và lọc sạch
  const [allProducts, setAllProducts] = useState([]); 
  // State chứa sản phẩm ĐANG HIỂN THỊ (Cắt ra từ allProducts)
  const [displayProducts, setDisplayProducts] = useState([]); 

  const [flashSales, setFlashSales] = useState([]); 
  const [bestSellers, setBestSellers] = useState([]); 
  const [newArrivals, setNewArrivals] = useState([]); 
  const [loading, setLoading] = useState(false);
  
  // Số lượng đang hiển thị
  const [visibleCount, setVisibleCount] = useState(12); 
  
  const [quickViewSP, setQuickViewSP] = useState(null);
  const [timeLeft, setTimeLeft] = useState({ d:0, h:0, m:0, s:0 });

  const queryParams = new URLSearchParams(location.search);
  const searchQuery = queryParams.get('search');
  
  // Tải tối đa 100 sản phẩm một lần (Đủ cho shop nhỏ)
  const FETCH_LIMIT = 100;

  useEffect(() => {
    if(!shopConfig?.flashSaleEnd) return;
    const check = () => {
      const dist = new Date(shopConfig.flashSaleEnd).getTime() - new Date().getTime();
      if (dist > 0) setTimeLeft({ d:Math.floor(dist/(1000*60*60*24)), h:Math.floor((dist%(1000*60*60*24))/(1000*60*60)), m:Math.floor((dist%(1000*60*60))/(1000*60)), s:Math.floor((dist%(1000*60))/1000) });
    };
    check(); const t = setInterval(check, 1000); return () => clearInterval(t);
  }, [shopConfig]);

  // --- HÀM TẢI DỮ LIỆU (CHẠY 1 LẦN) ---
  const fetchAllProducts = async () => {
    setLoading(true);
    try {
      const productRef = collection(db, "sanPham");
      const isHomepage = !slug && !searchQuery;

      // 1. Load Sliders (Chỉ trang chủ)
      if (isHomepage) {
          const pFlash = getDocs(query(productRef, where("isFlashSale", "==", true), limit(10)));
          const pBest = getDocs(query(productRef, where("isBanChay", "==", true), limit(10)));
          // Load mới về: Tải thường rồi sort client cho an toàn
          const pNew = getDocs(query(productRef, where("isMoi", "==", true), limit(10)));
          
          const [snFlash, snBest, snNew] = await Promise.all([pFlash, pBest, pNew]);
          
          const cleanData = (sn) => sn.docs.map(d=>({id:d.id, ...d.data()}))
                                           .filter(p => p.ten && (p.giaBan || p.giaGoc))
                                           .sort((a,b) => (b.ngayTao?.seconds||0) - (a.ngayTao?.seconds||0));

          setFlashSales(cleanData(snFlash));
          setBestSellers(cleanData(snBest));
          setNewArrivals(cleanData(snNew));
      }

      // 2. Load Danh sách chính
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

      // [CHIẾN THUẬT MỚI]: Tải tất cả (Limit 100), KHÔNG SẮP XẾP SERVER
      const qGrid = query(productRef, ...constraints, limit(FETCH_LIMIT));
      const snapshot = await getDocs(qGrid);
      
      // Xử lý dữ liệu tại máy
      const rawDocs = snapshot.docs;
      const validDocs = rawDocs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(p => p.id && p.ten && (p.giaBan !== undefined || p.giaGoc !== undefined)); // Lọc rác

      // Sắp xếp Mới -> Cũ (Xử lý được cả sản phẩm cũ không có ngày tạo)
      validDocs.sort((a,b) => (b.ngayTao?.seconds || 0) - (a.ngayTao?.seconds || 0));

      // Lọc tìm kiếm
      let finalProds = validDocs;
      if (searchQuery) {
          finalProds = finalProds.filter(p => p.ten.toLowerCase().includes(searchQuery.toLowerCase()));
      }

      setAllProducts(finalProds);
      // Reset về trang đầu
      setVisibleCount(12);

    } catch (err) { console.error(err); }
    setLoading(false);
  };

  // Cập nhật danh sách hiển thị khi visibleCount thay đổi
  useEffect(() => {
     setDisplayProducts(allProducts.slice(0, visibleCount));
  }, [visibleCount, allProducts]);

  // Reset khi đổi trang
  useEffect(() => {
    setAllProducts([]); 
    setFlashSales([]); setBestSellers([]); setNewArrivals([]);
    setVisibleCount(12);
    fetchAllProducts(); 
  }, [slug, searchQuery, dsDanhMuc]);

  const sliderSettings = { dots: true, infinite: true, speed: 500, slidesToShow: 1, slidesToScroll: 1, autoplay: true };
  const isFlashSaleActive = shopConfig?.flashSaleEnd && new Date(shopConfig.flashSaleEnd) > new Date();

  return (
    <Container fluid className="p-0">
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
            <div className="bg-white p-3 rounded shadow-sm mt-3">
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
              {/* Nút Xem thêm chỉ hiện nếu còn hàng chưa hiển thị hết */}
              {allProducts.length > visibleCount && (
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
      <Modal show={!!quickViewSP} onHide={()=>setQuickViewSP(null)} size="lg" centered dialogClassName="quick-view-modal"><Modal.Body className="p-0 position-relative"><div className="btn-close-quickview" onClick={()=>setQuickViewSP(null)} title="Đóng"><i className="fa-solid fa-xmark"></i></div>{quickViewSP && (<Row className="g-0"><Col md={6}><div className="qv-img-box"><img src={quickViewSP.anh} className="qv-img" alt={quickViewSP.ten} /></div></Col><Col md={6}><div className="qv-info-box"><h4 className="qv-title">{quickViewSP.ten}</h4><div className="qv-price">{parseInt(quickViewSP.giaBan).toLocaleString()} ¥ {quickViewSP.phanTramGiam > 0 && <span className="ms-3 text-muted text-decoration-line-through fs-6">{parseInt(quickViewSP.giaGoc).toLocaleString()} ¥</span>}</div><div className="mb-3"><span className="fw-bold">Đơn vị:</span> <span className="tag-donvi">{quickViewSP.donVi}</span><span className="mx-2">|</span><span className="fw-bold">Tình trạng:</span> <span className={quickViewSP.soLuong > 0 ? "text-success fw-bold" : "text-danger"}>{quickViewSP.soLuong > 0 ? "Còn hàng" : "Hết hàng"}</span></div><div className="qv-desc"><div dangerouslySetInnerHTML={{__html: quickViewSP.moTa}}></div></div><Button variant="success" size="lg" className="w-100 fw-bold rounded-pill shadow-sm mt-auto" onClick={()=>{themVaoGio(quickViewSP); setQuickViewSP(null)}} disabled={quickViewSP.soLuong <= 0}><i className="fa-solid fa-cart-plus me-2"></i> THÊM VÀO GIỎ NGAY</Button></div></Col></Row>)}</Modal.Body></Modal>
    </Container>
  );
}
export default Home;