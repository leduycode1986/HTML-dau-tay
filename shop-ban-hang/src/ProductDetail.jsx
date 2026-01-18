import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Badge from 'react-bootstrap/Badge';

function ProductDetail({ dsSanPham, themVaoGio, colors }) {
  const { id } = useParams();
  const [sanPham, setSanPham] = useState(null);

  useEffect(() => {
    const sp = dsSanPham.find(p => p.id === id);
    setSanPham(sp);
  }, [id, dsSanPham]);

  if (!sanPham) return <Container style={{marginTop: '50px', textAlign: 'center'}}>Đang tải sản phẩm...</Container>;

  return (
    <Container style={{ marginTop: '30px', background: 'white', padding: '30px', borderRadius: '15px', boxShadow: '0 5px 15px rgba(0,0,0,0.05)' }}>
      <Row>
        <Col md={5}>
          <div style={{position: 'relative'}}>
              <img src={sanPham.anh} alt={sanPham.ten} style={{ width: '100%', borderRadius: '10px', objectFit: 'cover', border: '1px solid #eee' }} />
              {sanPham.isKhuyenMai && <div style={{position: 'absolute', top: '10px', right: '10px', background: 'red', color: 'white', padding: '5px 10px', borderRadius: '5px', fontWeight: 'bold'}}>-{sanPham.phanTramGiam}%</div>}
          </div>
        </Col>
        
        <Col md={7}>
          <h2 style={{color: colors.primaryGreen, fontWeight: 'bold'}}>{sanPham.ten}</h2>
          
          <div style={{margin: '10px 0'}}>
              {sanPham.isMoi && <Badge bg="success" className="me-2">Sản phẩm mới</Badge>}
              {sanPham.isBanChay && <Badge bg="warning" text="dark" className="me-2">Bán chạy nhất</Badge>}
              <Badge bg={sanPham.soLuong > 0 ? "info" : "secondary"}>{sanPham.soLuong > 0 ? `Còn hàng (${sanPham.soLuong})` : "Hết hàng"}</Badge>
          </div>

          <div style={{background: '#fafafa', padding: '20px', borderRadius: '10px', margin: '20px 0'}}>
              {sanPham.isKhuyenMai ? (
                  <>
                    <div style={{textDecoration: 'line-through', color: '#999', fontSize: '16px'}}>Giá gốc: {sanPham.giaGoc?.toLocaleString('ja-JP')} ¥</div>
                    <div style={{color: '#d0021b', fontWeight: 'bold', fontSize: '32px'}}>{sanPham.giaBan?.toLocaleString('ja-JP')} ¥ <span style={{fontSize: '16px', color: '#555', fontWeight: 'normal'}}>/ {sanPham.donVi}</span></div>
                    <div style={{color: 'red', fontStyle: 'italic', fontSize: '14px'}}>(Tiết kiệm được: {(sanPham.giaGoc - sanPham.giaBan).toLocaleString('ja-JP')} ¥)</div>
                  </>
              ) : (
                  <div style={{color: '#d0021b', fontWeight: 'bold', fontSize: '32px'}}>{sanPham.giaBan?.toLocaleString('ja-JP')} ¥ <span style={{fontSize: '16px', color: '#555', fontWeight: 'normal'}}>/ {sanPham.donVi}</span></div>
              )}
          </div>
          
          <h5 style={{fontWeight: 'bold', borderBottom: '1px solid #eee', paddingBottom: '10px'}}>Mô tả sản phẩm:</h5>
          <p style={{whiteSpace: 'pre-line', color: '#555', lineHeight: '1.6'}}>{sanPham.moTa || "Đang cập nhật nội dung..."}</p>
          
          <div style={{marginTop: '30px'}}>
              <Button variant="warning" size="lg" disabled={sanPham.soLuong <= 0} onClick={() => {themVaoGio(sanPham); alert("Đã thêm!")}} style={{fontWeight: 'bold', width: '100%', padding: '15px'}}>
                  {sanPham.soLuong > 0 ? "🛒 THÊM VÀO GIỎ NGAY" : "❌ TẠM HẾT HÀNG"}
              </Button>
          </div>
        </Col>
      </Row>
    </Container>
  );
}
export default ProductDetail;