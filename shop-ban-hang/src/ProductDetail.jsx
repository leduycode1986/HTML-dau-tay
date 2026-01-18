import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Badge from 'react-bootstrap/Badge';

// --- NHẬP HELMET ĐỂ SEO ---
import { Helmet } from "react-helmet";

function ProductDetail({ dsSanPham, themVaoGio, colors }) {
  const { id } = useParams();
  const [sanPham, setSanPham] = useState(null);

  useEffect(() => {
    const sp = dsSanPham.find(p => p.id === id);
    setSanPham(sp);
  }, [id, dsSanPham]);

  if (!sanPham) return <Container style={{marginTop: '50px', textAlign: 'center'}}>Đang tải...</Container>;

  // Tạo mô tả ngắn cho SEO (lấy 150 ký tự đầu, bỏ thẻ HTML)
  const metaDescription = sanPham.moTa ? sanPham.moTa.replace(/<[^>]+>/g, '').substring(0, 160) + "..." : "Sản phẩm chất lượng từ Mai Vang Shop";

  return (
    <Container style={{ marginTop: '30px', background: 'white', padding: '30px', borderRadius: '15px' }}>
      
      {/* --- CẤU HÌNH SEO CHO TRANG NÀY --- */}
      <Helmet>
        <title>{sanPham.ten} | Mai Vang Shop</title>
        <meta name="description" content={metaDescription} />
        <meta property="og:title" content={sanPham.ten} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:image" content={sanPham.anh} />
      </Helmet>

      <Row>
        <Col md={5}>
          <div style={{position: 'relative'}}>
              <img src={sanPham.anh} alt={sanPham.ten} style={{ width: '100%', borderRadius: '10px', objectFit: 'cover' }} />
              {sanPham.isKhuyenMai && <div style={{position: 'absolute', top: '10px', right: '10px', background: 'red', color: 'white', padding: '5px 10px', borderRadius: '5px'}}>-{sanPham.phanTramGiam}%</div>}
          </div>
        </Col>
        
        <Col md={7}>
          <h1 style={{color: colors.primaryGreen, fontWeight: 'bold', fontSize: '28px'}}>{sanPham.ten}</h1>
          
          <div style={{margin: '10px 0'}}>
              {sanPham.isMoi && <Badge bg="success" className="me-2">Sản phẩm mới</Badge>}
              <Badge bg={sanPham.soLuong > 0 ? "info" : "secondary"}>{sanPham.soLuong > 0 ? "Còn hàng" : "Hết hàng"}</Badge>
          </div>

          <div style={{background: '#fafafa', padding: '20px', borderRadius: '10px', margin: '20px 0'}}>
              <div style={{color: '#d0021b', fontWeight: 'bold', fontSize: '32px'}}>
                  {sanPham.giaBan?.toLocaleString('ja-JP')} ¥ 
                  <span style={{fontSize: '16px', color: '#555', fontWeight: 'normal'}}> / {sanPham.donVi}</span>
              </div>
              {sanPham.isKhuyenMai && <div style={{textDecoration: 'line-through', color: '#999'}}>Giá gốc: {sanPham.giaGoc?.toLocaleString('ja-JP')} ¥</div>}
          </div>
          
          <h5 style={{fontWeight: 'bold', borderBottom: '2px solid #eee', paddingBottom: '10px', marginTop: '30px'}}>CHI TIẾT SẢN PHẨM</h5>
          
          {/* --- HIỂN THỊ NỘI DUNG HTML TỪ ADMIN --- */}
          <div 
            style={{color: '#333', lineHeight: '1.8', fontSize: '16px'}}
            dangerouslySetInnerHTML={{ __html: sanPham.moTa || "<p>Đang cập nhật...</p>" }} 
          />
          
          <div style={{marginTop: '30px'}}>
              <Button variant="warning" size="lg" disabled={sanPham.soLuong <= 0} onClick={() => themVaoGio(sanPham)} style={{width: '100%', padding: '15px', fontWeight: 'bold'}}>
                  🛒 THÊM VÀO GIỎ
              </Button>
          </div>
        </Col>
      </Row>
    </Container>
  );
}
export default ProductDetail;