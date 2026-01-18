import React from 'react';
import { useParams } from 'react-router-dom';
import { Row, Col, Button, Badge, Card } from 'react-bootstrap';
import SEO from './SEO';

function ProductDetail({ dsSanPham, themVaoGio }) {
  const { id } = useParams();
  const sp = dsSanPham.find(p => p.id === id);

  if (!sp) return <div className="text-center p-5">Sản phẩm không tồn tại</div>;

  return (
    <div className="p-2">
      <SEO title={sp.ten} />
      <Card className="border-0 shadow-sm detail-container">
        <div className="detail-row" style={{ display: 'flex', width: '100%' }}>
          {/* CỘT TRÁI CHỨA ẢNH */}
          <div className="detail-image-box">
            <img 
              src={sp.anh || "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg"} 
              alt={sp.ten} 
            />
          </div>

          {/* CỘT PHẢI CHỨA THÔNG TIN */}
          <div className="detail-info-box">
            <div className="mb-2">
               {sp.isMoi && <Badge bg="success" className="me-2">MỚI</Badge>}
               {sp.isKhuyenMai && <Badge bg="danger">GIẢM {sp.phanTramGiam}%</Badge>}
            </div>
            <h2 className="fw-bold text-success">{sp.ten}</h2>
            <div className="h3 text-danger fw-bold my-4">
               {sp.giaBan?.toLocaleString()} ¥ 
               <span className="text-muted fs-6 fw-normal"> / {sp.donVi}</span>
            </div>
            <hr />
            <h6 className="fw-bold">Mô tả sản phẩm:</h6>
            <div dangerouslySetInnerHTML={{ __html: sp.moTa }} className="lh-lg text-secondary" />
            <Button variant="success" size="lg" className="w-100 mt-4 fw-bold" onClick={() => themVaoGio(sp)}>
               THÊM VÀO GIỎ HÀNG
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
export default ProductDetail;