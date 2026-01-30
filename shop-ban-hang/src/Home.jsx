import React, { useState, useEffect } from 'react';
import { Row, Col, Container, Alert, Button, Modal, Spinner } from 'react-bootstrap';
import Product from './Product';
import { Link, useParams, useLocation } from 'react-router-dom';
import { db } from './firebase';
import { collection, query, where, orderBy, limit, getDocs, startAfter } from 'firebase/firestore';
import { toSlug } from './utils';

// Slider hiển thị danh sách ngang
const ProductSlider = ({ title, products, icon, themVaoGio, setQuickViewSP }) => {
  if (!products || products.length === 0) return null;
  return ( 
    <div className="mb-4 bg-white p-3 rounded shadow-sm">
       {title && <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom"><h5 className="fw-bold text-success m-0"><span className="me-2">{icon}</span> {title}</h5></div>}
       <div className="d-flex gap-3 overflow-auto pb-2" style={{scrollBehavior:'smooth', scrollbarWidth:'thin'}}>
         {products.map(sp => (<div key={sp.id} style={{minWidth: '180px', maxWidth: '180px', flex: '0 0 auto'}}><Product sp={sp} themVaoGio={themVaoGio} openQuickView={()=>setQuickViewSP(sp)} /></div>))}
       </div>
    </div> 
  );
};

function Home({ dsDanhMuc, themVaoGio, shopConfig }) {
  const { slug } = useParams();
  const location = useLocation();
  
  // State dữ liệu
  const [products, setProducts] = useState([]);
  const [bestSellers, setBestSellers] = useState([]); // Cho trang chủ
  const [newArrivals, setNewArrivals] = useState([]); // Cho trang chủ
  const [loading, setLoading] = useState(false);
  const [lastDoc, setLastDoc] = useState(null); // Để load more
  const [hasMore, setHasMore] = useState(true);
  
  const [quickViewSP, setQuickViewSP] = useState(null);
  const [showPopupAds, setShowPopupAds] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ d:0, h:0, m:0, s:0 });

  // Lấy params tìm kiếm từ URL (?search=...)
  const queryParams = new URLSearchParams(location.search);
  const searchQuery = queryParams.get('search');

  // Flash Sale Timer & Popup
  useEffect(() => {
    if(!shopConfig?.flashSaleEnd) return;
    const check = () => {
      const dist = new Date(shopConfig.flashSaleEnd).getTime() - new Date().getTime();
      if (dist > 0) {
        if (!sessionStorage.getItem('seenPopup') && !slug && !searchQuery) { setShowPopupAds(true); sessionStorage.setItem('seenPopup', 'true'); }
        setTimeLeft({ d:Math.floor(dist/(1000*60*60*24)), h:Math.floor((dist%(1000*60*60*24))/(1000*60*60)), m:Math.floor((dist%(1000*60*60))/(1000*60)), s:Math.floor((dist%(1000*60))/1000) });
      } else setShowPopupAds(false);
    };
    check(); const t = setInterval(check, 1000); return () => clearInterval(t);
  }, [shopConfig, slug, searchQuery]);

  // --- LOGIC TẢI DỮ LIỆU ---
  const fetchProducts = async (isLoadMore = false) => {
    setLoading(true);
    try {
      let q;
      const productRef = collection(db, "sanPham");
      
      // 1. Nếu là Trang chủ (Không slug, không search)
      if (!slug && !searchQuery) {
        if (!isLoadMore) {
            // Tải 10 SP Mới
            const qNew = query(productRef, orderBy("ngayTao", "desc"), limit(10)); // Giả sử có field ngayTao, nếu ko có thì bỏ orderBy
            const snNew = await getDocs(qNew);
            setNewArrivals(snNew.docs.map(d=>({id:d.id, ...d.data()})));

            // Tải 10 SP Bán Chạy
            const qBest = query(productRef, where("isBanChay", "==", true), limit(10));
            const snBest = await getDocs(qBest);
            setBestSellers(snBest.docs.map(d=>({id:d.id, ...d.data()})));
        }
        setLoading(false);
        return;
      }

      // 2. Xây dựng Query cho Danh mục / Search / Filter đặc biệt
      let constraints = [];
      
      if (searchQuery) {
        // Firebase không hỗ trợ Full-text search tốt. Đây là giải pháp tạm: tải về rồi lọc (hoặc dùng thư viện thứ 3)
        // Ở đây ta tải nhiều hơn chút rồi lọc client (chấp nhận được với scale nhỏ)
        // Hoặc tìm chính xác theo tên (case-sensitive)
        // constraints.push(where("ten", ">=", searchQuery), where("ten", "<=", searchQuery + '\uf8ff')); 
      }
      else if (slug === 'khuyen-mai-soc') constraints.push(where("phanTramGiam", ">", 0));
      else if (slug === 'san-pham-moi') constraints.push(where("isMoi", "==", true));
      else if (slug === 'san-pham-ban-chay') constraints.push(where("isBanChay", "==", true));
      else {
        // Tìm ID danh mục dựa vào Slug
        const danhMuc = dsDanhMuc.find(d => (d.slug === slug) || (toSlug(d.ten) === slug));
        if (danhMuc) {
           // Tìm cả danh mục con
           const subCats = dsDanhMuc.filter(d => d.parent === danhMuc.id).map(d => d.id);
           constraints.push(where("phanLoai", "in", [danhMuc.id, ...subCats].slice(0, 10))); // Firebase giới hạn 'in' tối đa 10
        }
      }

      // Thêm giới hạn và phân trang
      if (isLoadMore && lastDoc) {
        q = query(productRef, ...constraints, startAfter(lastDoc), limit(12));
      } else {
        q = query(productRef, ...constraints, limit(12));
      }

      const snapshot = await getDocs(q);
      
      const newProds = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      
      // Lọc Search Client-side (Nếu có search)
      let finalProds = newProds;
      if (searchQuery) {
         // Lưu ý: Đây là cách tạm thời. Khi SP > 1000, cần giải pháp Search Engine riêng (Algolia/Elastic)
         finalProds = newProds.filter(p => p.ten.toLowerCase().includes(searchQuery.toLowerCase()));
      }

      setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
      setHasMore(snapshot.docs.length === 12); // Nếu tải đủ 12 thì khả năng còn nữa

      if (isLoadMore) {
        setProducts(prev => [...prev, ...finalProds]);
      } else {
        setProducts(finalProds);
      }

    } catch (err) {
      console.error("Lỗi tải sản phẩm:", err);
    }
    setLoading(false);
  };

  // Reset khi đổi trang (Slug thay đổi)
  useEffect(() => {
    setProducts([]);
    setLastDoc(null);
    setHasMore(true);
    fetchProducts(false);
  }, [slug, searchQuery, dsDanhMuc]);

  return (
    <Container fluid className="p-0">
      <Row className="g-0"><Col xs={12} className="p-3">
        
        {/* TRANG CHỦ: HIỆN 2 SLIDER */}
        {!slug && !searchQuery ? (
          <>
            <ProductSlider title="SẢN PHẨM BÁN CHẠY" icon="🔥" products={bestSellers} themVaoGio={themVaoGio} setQuickViewSP={setQuickViewSP} />
            <ProductSlider title="SẢN PHẨM MỚI" icon="✨" products={newArrivals} themVaoGio={themVaoGio} setQuickViewSP={setQuickViewSP} />
            <div className="text-center mt-3"><Alert variant="info">Chọn danh mục bên trái để xem thêm hàng ngàn sản phẩm khác!</Alert></div>
          </>
        ) : (
          /* TRANG DANH MỤC / SEARCH: HIỆN GRID */
          <div className="bg-white p-3 rounded shadow-sm">
            <div className="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2">
              <h5 className="fw-bold text-success m-0">
                <i className="fa-solid fa-list me-2"></i> 
                {searchQuery ? `Tìm kiếm: "${searchQuery}"` :
                 slug === 'san-pham-moi' ? '✨ SẢN PHẨM MỚI' : 
                 slug === 'san-pham-ban-chay' ? '🔥 SẢN PHẨM BÁN CHẠY' :
                 slug === 'khuyen-mai-soc' ? '⚡ KHUYẾN MÃI SỐC' :
                 'DANH SÁCH SẢN PHẨM'}
              </h5>
            </div>
            
            {products.length === 0 && !loading ? (
                <Alert variant="warning" className="text-center">Không tìm thấy sản phẩm nào.</Alert> 
            ) : (
              <Row className="g-3 row-cols-2 row-cols-md-3 row-cols-lg-4 row-cols-xl-5">
                {products.map(sp => (
                  <Col key={sp.id} className="d-flex align-items-stretch">
                    <Product sp={sp} themVaoGio={themVaoGio} openQuickView={()=>setQuickViewSP(sp)} />
                  </Col>
                ))}
              </Row>
            )}

            {/* Nút Xem thêm (Load More) */}
            {hasMore && (
              <div className="text-center mt-4">
                <Button variant="outline-success" className="rounded-pill px-5 fw-bold" onClick={() => fetchProducts(true)} disabled={loading}>
                  {loading ? <Spinner as="span" animation="border" size="sm" /> : <>Xem thêm <i className="fa-solid fa-chevron-down ms-1"></i></>}
                </Button>
              </div>
            )}
          </div>
        )}
      </Col></Row>

      {/* MODAL QUICK VIEW */}
      <Modal show={!!quickViewSP} onHide={()=>setQuickViewSP(null)} size="lg" centered dialogClassName="quick-view-modal">
        <Modal.Body className="p-0 position-relative">
          <div className="btn-close-quickview" onClick={()=>setQuickViewSP(null)} title="Đóng"><i className="fa-solid fa-xmark"></i></div>
          {quickViewSP && (
            <Row className="g-0">
              <Col md={6}><div className="qv-img-box"><img src={quickViewSP.anh} className="qv-img" alt={quickViewSP.ten} /></div></Col>
              <Col md={6}>
                <div className="qv-info-box">
                  <h4 className="qv-title">{quickViewSP.ten}</h4>
                  <div className="qv-price">{quickViewSP.giaBan?.toLocaleString()} ¥</div>
                  <div className="qv-desc"><div dangerouslySetInnerHTML={{__html: quickViewSP.moTa}}></div></div>
                  <Button variant="success" size="lg" className="w-100 fw-bold rounded-pill shadow-sm mt-auto" onClick={()=>{themVaoGio(quickViewSP); setQuickViewSP(null)}} disabled={quickViewSP.soLuong <= 0}>THÊM VÀO GIỎ NGAY</Button>
                </div>
              </Col>
            </Row>
          )}
        </Modal.Body>
      </Modal>

      {/* POPUP FLASH SALE */}
      <Modal show={showPopupAds} onHide={()=>setShowPopupAds(false)} centered contentClassName="flash-popup-content"><div className="flash-popup-body"><div className="flash-header-bg"><h3 className="fw-bold m-0">🔥 FLASH SALE</h3></div><div className="p-4"><p className="mb-3 fw-bold text-secondary">Kết thúc sau:</p><div className="d-flex justify-content-center gap-2 mb-4"><div className="time-box">{String(timeLeft.d).padStart(2,'0')}</div>:<div className="time-box">{String(timeLeft.h).padStart(2,'0')}</div>:<div className="time-box">{String(timeLeft.m).padStart(2,'0')}</div>:<div className="time-box bg-danger">{String(timeLeft.s).padStart(2,'0')}</div></div><Button variant="danger" className="w-100 rounded-pill fw-bold shadow" onClick={()=>{setShowPopupAds(false); setShowPopupAds(false)}}>XEM NGAY</Button><div className="mt-3 text-muted small cursor-pointer text-decoration-underline" onClick={()=>setShowPopupAds(false)}>Đóng lại</div></div></div></Modal>
    </Container>
  );
}
export default Home;