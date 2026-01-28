import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Col, Button, Badge } from 'react-bootstrap';
import { toSlug } from './utils';

function ProductDetail({ dsSanPham, themVaoGio }) {
  const { slug } = useParams();
  const [sanPham, setSanPham] = useState(null);

  useEffect(() => {
    if (dsSanPham.length > 0) {
      const found = dsSanPham.find(sp => 
        (sp.slug === slug) || (toSlug(sp.ten) === slug) || (sp.id === slug)
      );
      setSanPham(found);
      if (found) {
        const recent = JSON.parse(localStorage.getItem('recent') || '[]');
        const newRecent = [found.id, ...recent.filter(id => id !== found.id)].slice(0, 10);
        localStorage.setItem('recent', JSON.stringify(newRecent));
      }
    }
  }, [slug, dsSanPham]);

  if (!sanPham) return (
    <Container className="py-5 text-center">
      <div className="spinner-border text-success" role="status"></div>
      <p className="mt-3 text-muted">Đang tìm sản phẩm...</p>
    </Container>
  );

  return (
    <Container className="py-5">
      {/* 1. NÚT QUAY LẠI (LÀM ĐẸP HƠN) */}
      <Link to="/" className="btn-back-home mb-4">
        <i className="fa-solid fa-chevron-left"></i> Quay lại trang chủ
      </Link>

      <Row className="g-5 align-items-start">
        <Col lg={5} md={6}>
          <div className="detail-img-box">
            <img src={sanPham.anh} alt={sanPham.ten} />
          </div>
        </Col>

        <Col lg={7} md={6}>
          <h1 className="detail-title">{sanPham.ten}</h1>

          {/* 2. GIÁ TIỀN (Chỉ hiện giá, bỏ đơn vị ở đây) */}
          <div className="mb-3 pb-2 border-bottom">
             <div className="detail-price">
               {sanPham.giaBan?.toLocaleString()} ¥
               {sanPham.phanTramGiam > 0 && (
                 <span className="text-muted fs-5 text-decoration-line-through fw-normal ms-2">
                   {sanPham.giaGoc?.toLocaleString()} ¥
                 </span>
               )}
             </div>
          </div>

          {/* 3. HIỂN THỊ SỐ LƯỢNG + ĐƠN VỊ (Theo ý bạn: "Số lượng: 10 Ly") */}
          <div className="d-flex flex-column gap-2 mb-4">
             {/* Dòng trạng thái */}
             <div className="d-flex align-items-center gap-2">
                <span className="fw-bold text-dark" style={{minWidth:'80px'}}>Tình trạng:</span>
                <Badge bg={sanPham.soLuong > 0 ? "success" : "secondary"} className="px-3 py-1">
                  {sanPham.soLuong > 0 ? "Còn hàng" : "Tạm hết hàng"}
                </Badge>
             </div>

             {/* Dòng Số lượng + Đơn vị */}
             <div className="d-flex align-items-center gap-2">
                <span className="fw-bold text-dark" style={{minWidth:'80px'}}>Số lượng:</span>
                <span className="text-danger fw-bold fs-5">{sanPham.soLuong}</span>
                {/* Đơn vị hiển thị ngay sau số lượng */}
                <span className="tag-donvi" style={{margin:0}}>{sanPham.donVi}</span>
             </div>
          </div>

          <div className="mb-3 fw-bold text-success"><i className="fa-solid fa-circle-info me-2"></i>Mô tả chi tiết:</div>
          <div className="detail-desc-box">
             <div dangerouslySetInnerHTML={{__html: sanPham.moTa || 'Đang cập nhật nội dung...'}}></div>
          </div>

          <div className="d-grid gap-2">
            <Button 
              className="btn-add-cart-lg"
              onClick={() => sanPham.soLuong > 0 && themVaoGio(sanPham)} 
              disabled={sanPham.soLuong <= 0}
            >
              <i className="fa-solid fa-cart-plus me-2"></i> 
              {sanPham.soLuong > 0 ? "THÊM VÀO GIỎ NGAY" : "HẾT HÀNG"}
            </Button>            
            
          </div>
        </Col>
      </Row>
    </Container>
  );
}
export default ProductDetail;