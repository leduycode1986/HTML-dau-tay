import React from 'react';
import { useParams } from 'react-router-dom';
import { Button, Badge, Card } from 'react-bootstrap';
import SEO from './SEO';

function ProductDetail({ dsSanPham, themVaoGio }) {
  const { id } = useParams();
  const sp = dsSanPham.find(p => p.id === id);

  if (!sp) return <div className="p-5 text-center"><h5>Sản phẩm không tồn tại</h5></div>;

  return (
    <div className="p-2">
      <SEO title={sp.ten} description={sp.ten} />
      
      <Card className="detail-container shadow-sm border-0">
        <div className="detail-row" style={{ display: 'flex', flexWrap: 'wrap', width: '100%' }}>
          
          {/* CỘT HÌNH ẢNH */}
          <div className="detail-image-box">
            <img 
              src={sp.anh || "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg"} 
              alt={sp.ten} 
            />
          </div>

          {/* CỘT THÔNG TIN */}
          <div className="detail-info-box">
            <div className="d-flex gap-2 mb-3">
              {sp.isMoi && <Badge bg="success">MỚI</Badge>}
              <span className="text-muted small">Mã SP: #{sp.id.substring(0, 6).toUpperCase()}</span>
            </div>

            <h1 className="fw-bold text-success mb-3">{sp.ten}</h1>

            <div className="bg-light p-3 rounded-3 mb-4">
              <span className="h2 fw-bold text-danger mb-0">{sp.giaBan?.toLocaleString()} ¥</span>
              <span className="text-muted ms-2">/ {sp.donVi || 'Cái'}</span>
            </div>

            <div className="product-description mb-4">
              <h6 className="fw-bold border-bottom pb-2 mb-3 text-uppercase">Mô tả sản phẩm</h6>
              <div 
                className="lh-lg text-secondary" 
                dangerouslySetInnerHTML={{ __html: sp.moTa || 'Đang cập nhật nội dung...' }} 
              />
            </div>

            <Button 
              variant="success" 
              size="lg" 
              className="w-100 py-3 fw-bold shadow-sm"
              onClick={() => themVaoGio(sp)}
            >
              THÊM VÀO GIỎ HÀNG
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default ProductDetail;