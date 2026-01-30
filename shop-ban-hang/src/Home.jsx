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
  const [products, setProducts] = useState([]); // Danh sách Grid chính
  const [flashSales, setFlashSales] = useState([]); // Slider Flash Sale
  const [bestSellers, setBestSellers] = useState([]); // Slider Bán chạy
  const [newArrivals, setNewArrivals] = useState([]); // Slider Mới về
  
  const [loading, setLoading] = useState(false);
  const [lastDoc, setLastDoc] = useState(null); // Để phân trang (Load More)
  const [hasMore, setHasMore] = useState(true);
  
  const [quickViewSP, setQuickViewSP] = useState(null);

  // Lấy params tìm kiếm từ URL (?search=...)
  const queryParams = new URLSearchParams(location.search);
  const searchQuery = queryParams.get('search');

  // --- LOGIC TẢI DỮ LIỆU CHÍNH (SERVER-SIDE PAGINATION) ---
  const fetchProducts = async (isLoadMore = false) => {
    setLoading(true);
    try {
      const productRef = collection(db, "sanPham");
      const isHomepage = !slug && !searchQuery;

      // 1. NẾU LÀ TRANG CHỦ & LẦN ĐẦU TẢI -> TẢI CÁC SLIDER RIÊNG BIỆT
      if (isHomepage && !isLoadMore) {
          // A. Slider Flash Sale (Ưu tiên) - Lọc sp có isFlashSale = true
          const qFlash = query(productRef, where("isFlashSale", "==", true), limit(10));
          const snFlash = await getDocs(qFlash);
          setFlashSales(snFlash.docs.map(d=>({id:d.id, ...d.data()})));

          // B. Slider Bán chạy
          const qBest = query(productRef, where("isBanChay", "==", true), limit(10));
          const snBest = await getDocs(qBest);
          setBestSellers(snBest.docs.map(d=>({id:d.id, ...d.data()})));

          // C. Slider Mới - Sắp xếp theo ngày tạo mới nhất
          const qNew = query(productRef, where("isMoi", "==", true), orderBy("ngayTao", "desc"), limit(10));
          const snNew = await getDocs(qNew);
          setNewArrivals(snNew.docs.map(d=>({id:d.id, ...d.data()})));
      }

      // 2. TẢI DANH SÁCH LƯỚI (GRID) BÊN DƯỚI
      let constraints = [];

      // Logic lọc theo điều kiện
      if (slug === 'khuyen-mai-soc') constraints.push(where("phanTramGiam", ">", 0));
      else if (slug === 'san-pham-moi') constraints.push(where("isMoi", "==", true));
      else if (slug === 'san-pham-ban-chay') constraints.push(where("isBanChay", "==", true));
      else if (slug) {
        // Tìm ID danh mục
        const danhMuc = dsDanhMuc.find(d => (d.slug === slug) || (toSlug(d.ten) === slug));
        if (danhMuc) {
           const subCats = dsDanhMuc.filter(d => d.parent === danhMuc.id).map(d => d.id);
           constraints.push(where("phanLoai", "in", [danhMuc.id, ...subCats].slice(0, 10)));
        }
      }

      // [QUAN TRỌNG]: Sắp xếp MỚI NHẤT -> CŨ NHẤT cho danh sách Grid
      // Lưu ý: Cần tạo Index trong Firebase nếu có lỗi (xem Console log)
      // Nếu không muốn dùng orderBy (sợ lỗi index), có thể bỏ dòng này, nhưng SP sẽ ko sắp xếp.
      constraints.push(orderBy("ngayTao", "desc")); 

      // Logic Phân trang (Load More)
      let qGrid;
      if (isLoadMore && lastDoc) {
        qGrid = query(productRef, ...constraints, startAfter(lastDoc), limit(12));
      } else {
        qGrid = query(productRef, ...constraints, limit(12));
      }

      const snapshot = await getDocs(qGrid);
      const newProds = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));

      // Lọc Search Client-side (Nếu có search)
      let finalProds = newProds;
      if (searchQuery) {
         finalProds = newProds.filter(p => p.ten.toLowerCase().includes(searchQuery.toLowerCase()));
      }

      // Cập nhật State cho Grid
      if (snapshot.docs.length > 0) {
          setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
      }
      // Nếu tải về ít hơn limit (12) thì coi như hết hàng
      setHasMore(snapshot.docs.length === 12); 

      if (isLoadMore) {
        setProducts(prev => [...prev, ...finalProds]);
      } else {
        setProducts(finalProds);
      }

    } catch (err) {
      console.error("Lỗi tải dữ liệu:", err);
    }
    setLoading(false);
  };

  // Reset và tải lại khi đổi trang (Slug/Search thay đổi)
  useEffect(() => {
    setProducts([]);
    setFlashSales([]); 
    setBestSellers([]);
    setNewArrivals([]);
    setLastDoc(null);
    setHasMore(true);
    fetchProducts(false); // False = Tải mới từ đầu
  }, [slug, searchQuery, dsDanhMuc]);

  return (
    <Container fluid className="p-0">
      <Row className="g-0"><Col xs={12} className="p-3">
        
        {/* KHỐI 1: SLIDER (CHỈ HIỆN Ở TRANG CHỦ) */}
        {!slug && !searchQuery && (
          <>
            <ProductSlider title="⚡ SẢN PHẨM FLASH SALE" icon="⚡" products={flashSales} themVaoGio={themVaoGio} setQuickViewSP={setQuickViewSP} />
            <ProductSlider title="🔥 SẢN PHẨM BÁN CHẠY" icon="🔥" products={bestSellers} themVaoGio={themVaoGio} setQuickViewSP={setQuickViewSP} />
            <ProductSlider title="✨ SẢN PHẨM MỚI VỀ" icon="✨" products={newArrivals} themVaoGio={themVaoGio} setQuickViewSP={setQuickViewSP} />
          </>
        )}

        {/* KHỐI 2: GRID DANH SÁCH SẢN PHẨM (LUÔN HIỆN) */}
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

          {/* Nút Xem thêm (Load More) */}
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
          <div className="btn-close-quickview" onClick={()=>setQuickViewSP(null)} title="Đóng">
            <i className="fa-solid fa-xmark"></i>
          </div>
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