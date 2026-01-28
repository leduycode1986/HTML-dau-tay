import React from 'react'; // Chỉ cần import React là đủ
import { Container, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import Product from './Product';

function FlashSale({ dsSanPham, themVaoGio, shopConfig }) {
  // --- SỬA LỖI TUYỆT ĐỐI: Dùng React.useState và React.useEffect ---
  const [timeLeft, setTimeLeft] = React.useState({ d:0, h:0, m:0, s:0 });
  
  React.useEffect(() => {
    if(!shopConfig?.flashSaleEnd) return;
    const end = new Date(shopConfig.flashSaleEnd).getTime();
    
    const timer = setInterval(() => {
      const now = new Date().getTime(); 
      const dist = end - now;
      
      if (dist < 0) { 
        clearInterval(timer); 
        setTimeLeft({ d:0, h:0, m:0, s:0 }); 
      } else { 
        setTimeLeft({ 
          d: Math.floor(dist/(1000*60*60*24)), 
          h: Math.floor((dist%(1000*60*60*24))/(1000*60*60)), 
          m: Math.floor((dist%(1000*60*60))/(1000*60)), 
          s: Math.floor((dist%(1000*60))/1000) 
        }); 
      }
    }, 1000);
    
    return () => clearInterval(timer);
  }, [shopConfig]);
  // ---------------------------------------------------------------

  // Lọc sản phẩm có đánh dấu là Flash Sale
  const flashProducts = dsSanPham.filter(sp => sp.isFlashSale);

  return (
    <div style={{minHeight:'100vh', background:'#f8f9fa'}}>
     <Container className="py-5">
        {/* Tiêu đề trang */}
        <div className="mb-4 pb-2 border-bottom d-flex align-items-center justify-content-between">
           <h2 className="fw-bold text-danger m-0"><i className="fa-solid fa-bolt me-2"></i> KHUYẾN MÃI SỐC</h2>
           <Link to="/"><Button variant="outline-secondary" size="sm">Quay lại</Button></Link>
        </div>

        {flashProducts.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <div className="fs-1 mb-3"><i className="fa-regular fa-clock"></i></div>
            <h3>Chưa có sản phẩm khuyến mãi nào.</h3>
            <p>Vui lòng quay lại sau nhé!</p>
            <Link to="/"><Button variant="outline-danger" className="mt-3 rounded-pill fw-bold px-4">Quay lại trang chủ</Button></Link>
          </div>
        ) : (
          <Row className="g-4 row-cols-2 row-cols-md-4 row-cols-lg-5">
            {flashProducts.map(sp => (
              <Col key={sp.id}>
                {/* Truyền hàm rỗng cho openQuickView để tránh lỗi nếu chưa có tính năng này */}
                <Product sp={sp} themVaoGio={themVaoGio} openQuickView={()=>{}} />
              </Col>
            ))}
          </Row>
        )}
      </Container>
    </div>
  );
}
export default FlashSale;