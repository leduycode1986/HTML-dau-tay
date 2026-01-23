import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Col, Button, Badge } from 'react-bootstrap';
import { toSlug } from './App';

function ProductDetail({ dsSanPham, themVaoGio }) {
  const { slug } = useParams(); // Lấy slug từ URL
  const [sanPham, setSanPham] = useState(null);

  useEffect(() => {
    if (dsSanPham.length > 0) {
      // TÌM KIẾM THÔNG MINH:
      // 1. Tìm xem slug có khớp với trường 'slug' trong DB không?
      // 2. Nếu không, thử tạo slug từ tên sản phẩm và so sánh (để hỗ trợ sản phẩm cũ)
      // 3. Nếu vẫn không thấy, thử so sánh với ID (trường hợp URL dùng ID)
      const found = dsSanPham.find(sp => 
        (sp.slug === slug) || 
        (toSlug(sp.ten) === slug) || 
        (sp.id === slug)
      );
      setSanPham(found);

      // Lưu lịch sử xem
      if (found) {
        const recent = JSON.parse(localStorage.getItem('recent') || '[]');
        const newRecent = [found.id, ...recent.filter(id => id !== found.id)].slice(0, 10);
        localStorage.setItem('recent', JSON.stringify(newRecent));
      }
    }
  }, [slug, dsSanPham]);

  if (!sanPham) return <div className="text-center py-5"><h3>Đang tìm sản phẩm...</h3></div>;

  return (
    <Container className="py-5">
      <Row className="g-4">
        <Col md={6}>
          <div className="border rounded p-2 bg-white shadow-sm">
            <img src={sanPham.anh} alt={sanPham.ten} className="w-100 rounded" />
          </div>
        </Col>
        <Col md={6}>
          <h2 className="fw-bold text-success text-uppercase mb-3">{sanPham.ten}</h2>
          <div className="mb-3">
            <span className="h3 text-danger fw-bold me-3">{sanPham.giaBan?.toLocaleString()} ¥</span>
            {sanPham.phanTramGiam > 0 && <span className="text-muted text-decoration-line-through">{sanPham.giaGoc?.toLocaleString()} ¥</span>}
          </div>
          
          <div className="mb-4">
            <Badge bg={sanPham.soLuong > 0 ? "success" : "secondary"} className="me-2 p-2">
              {sanPham.soLuong > 0 ? "Còn hàng" : "Hết hàng"}
            </Badge>
            <span className="text-muted">Đơn vị: <strong>{sanPham.donVi}</strong></span>
          </div>

          <div className="p-3 bg-light rounded border mb-4">
            <div dangerouslySetInnerHTML={{__html: sanPham.moTa || 'Chưa có mô tả chi tiết.'}}></div>
          </div>

          <Button 
            variant={sanPham.soLuong > 0 ? "success" : "secondary"} 
            size="lg" 
            className="w-100 fw-bold rounded-pill shadow-sm"
            onClick={() => sanPham.soLuong > 0 && themVaoGio(sanPham)}
            disabled={sanPham.soLuong <= 0}
          >
            <i className="fa-solid fa-cart-plus me-2"></i> {sanPham.soLuong > 0 ? "THÊM VÀO GIỎ NGAY" : "TẠM HẾT HÀNG"}
          </Button>
        </Col>
      </Row>
    </Container>
  );
}
export default ProductDetail;