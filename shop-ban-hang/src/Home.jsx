import React, { useState, useEffect, useRef } from 'react';
import { Row, Col, Container, Alert, Button, Modal, Spinner } from 'react-bootstrap';
import Product from './Product';
import { Link, useParams, useLocation } from 'react-router-dom';
import { db } from './firebase';
import { collection, query, where, orderBy, limit, getDocs, startAfter } from 'firebase/firestore';
import { toSlug } from './utils';

// Slider hiển thị danh sách ngang
const ProductSlider = ({ title, products, icon, themVaoGio, setQuickViewSP }) => {
  const scrollRef = useRef(null);
  const scroll = (d) => { if(scrollRef.current) scrollRef.current.scrollLeft += d==='left'?-300:300; };
  
  if (!products || products.length === 0) return null;
  
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
  const [flashSales, setFlashSales] = useState([]); 
  const [bestSellers, setBestSellers] = useState([]); 
  const [newArrivals, setNewArrivals] = useState([]); 
  
  const [loading, setLoading] = useState(false);
  const [lastDoc, setLastDoc] = useState(null); 
  const [hasMore, setHasMore] = useState(true);
  const [quickViewSP, setQuickViewSP] = useState(null);

  const queryParams = new URLSearchParams(location.search);
  const searchQuery = queryParams.get('search');

  // --- LOGIC TẢI DỮ LIỆU ---
  const fetchProducts = async (isLoadMore = false) => {
    setLoading(true);
    try {
      const productRef = collection(db, "sanPham");
      const isHomepage = !slug && !searchQuery;

      // 1. TẢI SLIDER (Chỉ chạy ở trang chủ lần đầu)
      if (isHomepage && !isLoadMore) {
          const qFlash = query(productRef, where("isFlashSale", "==", true), limit(10));
          getDocs(qFlash).then(sn => setFlashSales(sn.docs.map(d=>({id:d.id, ...d.data()}))));

          const qBest = query(productRef, where("isBanChay", "==", true), limit(10));
          getDocs(qBest).then(sn => setBestSellers(sn.docs.map(d=>({id:d.id, ...d.data()}))));

          // Thử sắp xếp, nếu lỗi thì fallback
          try {
             const qNew = query(productRef, where("isMoi", "==", true), orderBy("ngayTao", "desc"), limit(10));
             const snNew = await getDocs(qNew);
             setNewArrivals(snNew.docs.map(d=>({id:d.id, ...d.data()})));
          } catch {
             const qNewBackup = query(productRef, where("isMoi", "==", true), limit(10));
             getDocs(qNewBackup).then(sn => setNewArrivals(sn.docs.map(d=>({id:d.id, ...d.data()}))));
          }
      }

      // 2. TẢI DANH SÁCH CHÍNH (GRID)
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

      // --- LOGIC QUAN TRỌNG: FALLBACK NẾU DỮ LIỆU CŨ THIẾU NGÀY TẠO ---
      try {
          let qGrid;
          // Nếu có search thì không sort server được
          if(searchQuery) {
             qGrid = query(productRef, ...constraints); 
          } else {
             if (isLoadMore && lastDoc) {
                qGrid = query(productRef, ...constraints, orderBy("ngayTao", "desc"), startAfter(lastDoc), limit(12));
             } else {
                qGrid = query(productRef, ...constraints, orderBy("ngayTao", "desc"), limit(12));
             }
          }
          
          const snapshot = await getDocs(qGrid);

          // NẾU KẾT QUẢ RỖNG (Do data cũ không có ngày tạo) -> Chuyển sang tải thường
          if (snapshot.empty && !isLoadMore && !searchQuery && !slug) {
             throw new Error("EMPTY_DUE_TO_MISSING_FIELD"); 
          }

          handleSnapshot(snapshot, isLoadMore);

      } catch (err) {
          // Fallback: Tải không cần sắp xếp để hiện sản phẩm cũ
          let qGridSafe;
          if (isLoadMore && lastDoc) {
             qGridSafe = query(productRef, ...constraints, startAfter(lastDoc), limit(12));
          } else {
             qGridSafe = query(productRef, ...constraints, limit(12));
          }
          const snapshotSafe = await getDocs(qGridSafe);
          handleSnapshot(snapshotSafe, isLoadMore);
      }

    } catch (err) {
      console.error("Lỗi Home:", err);
    }
    setLoading(false);
  };

  const handleSnapshot = (snapshot, isLoadMore) => {
      const newProds = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      
      let finalProds = newProds;
      // Search Client-side
      if (searchQuery) {
         finalProds = newProds.filter(p => p.ten.toLowerCase().includes(searchQuery.toLowerCase()));
      }

      // Sắp xếp Client-side (Đưa mới lên đầu)
      finalProds.sort((a,b) => {
          const tA = a.ngayTao?.seconds || 0;
          const tB = b.ngayTao?.seconds || 0;
          return tB - tA;
      });

      if (snapshot.docs.length > 0) setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
      setHasMore(snapshot.docs.length >= 12); 

      if (isLoadMore) setProducts(prev => [...prev, ...finalProds]);
      else setProducts(finalProds);
  }

  useEffect(() => {
    setProducts([]);
    setFlashSales([]); 
    setBestSellers([]);
    setNewArrivals([]);
    setLastDoc(null);
    setHasMore(true);
    fetchProducts(false); 
  }, [slug, searchQuery, dsDanhMuc]);

  return (
    <Container fluid className="p-0">
      <Row className="g-0"><Col xs={12} className="p-3">
        
        {/* SLIDER */}
        {!slug && !searchQuery && (
          <>
            <ProductSlider title="⚡ SẢN PHẨM FLASH SALE" icon="⚡" products={flashSales} themVaoGio={themVaoGio} setQuickViewSP={setQuickViewSP} />
            <ProductSlider title="🔥 SẢN PHẨM BÁN CHẠY" icon="🔥" products={bestSellers} themVaoGio={themVaoGio} setQuickViewSP={setQuickViewSP} />
            <ProductSlider title="✨ SẢN PHẨM MỚI VỀ" icon="✨" products={newArrivals} themVaoGio={themVaoGio} setQuickViewSP={setQuickViewSP} />
          </>
        )}

        {/* GRID SẢN PHẨM */}
        <div className="bg-white p-3 rounded shadow-sm mt-3">
          <div className="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2">
            <h5 className="fw-bold text-success m-0">
              <i className="fa-solid fa-list me-2"></i> 
              {searchQuery ? `Tìm kiếm: "${searchQuery}"` :
                slug === 'san-pham-moi' ? '✨ SẢN PHẨM MỚI' : 
                slug === 'san-pham-ban-chay' ? '🔥 SẢN PHẨM BÁN CHẠY' :
                slug === 'khuyen-mai-soc' ? '⚡ KHUYẾN MÃI SỐC' :
                slug ? 'DANH SÁCH SẢN PHẨM' : 'GỢI Ý CHO BẠN'} 
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

          {hasMore && products.length > 0 && (
            <div className="text-center mt-4">
              <Button variant="outline-success" className="rounded-pill px-5 fw-bold" onClick={() => fetchProducts(true)} disabled={loading}>
                {loading ? <Spinner as="span" animation="border" size="sm" /> : <>Xem thêm <i className="fa-solid fa-chevron-down ms-1"></i></>}
              </Button>
            </div>
          )}
        </div>

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
                  <div className="qv-price">
                    {parseInt(quickViewSP.giaBan).toLocaleString()} ¥
                    {quickViewSP.phanTramGiam > 0 && <span className="ms-3 text-muted text-decoration-line-through fs-6">{parseInt(quickViewSP.giaGoc).toLocaleString()} ¥</span>}
                  </div>
                  <div className="mb-3">
                    <span className="fw-bold">Đơn vị:</span> <span className="tag-donvi">{quickViewSP.donVi}</span>
                    <span className="mx-2">|</span>
                    <span className="fw-bold">Tình trạng:</span> <span className={quickViewSP.soLuong > 0 ? "text-success fw-bold" : "text-danger"}>{quickViewSP.soLuong > 0 ? "Còn hàng" : "Hết hàng"}</span>
                  </div>
                  <div className="qv-desc"><div dangerouslySetInnerHTML={{__html: quickViewSP.moTa}}></div></div>
                  <Button variant="success" size="lg" className="w-100 fw-bold rounded-pill shadow-sm mt-auto" onClick={()=>{themVaoGio(quickViewSP); setQuickViewSP(null)}} disabled={quickViewSP.soLuong <= 0}>
                    <i className="fa-solid fa-cart-plus me-2"></i> THÊM VÀO GIỎ NGAY
                  </Button>
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