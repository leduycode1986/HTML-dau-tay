import React from 'react';
import { useParams } from 'react-router-dom';
import { Container, Row, Col, Button, Badge, Card } from 'react-bootstrap';
import SEO from './SEO'; // 👇 Dùng cái này thay cho Helmet

function ProductDetail({ dsSanPham, themVaoGio }) {
  const { id } = useParams();
  const sp = dsSanPham.find(p => p.id === id);

  if (!sp) return <div className="text-center mt-5"><h5>Sản phẩm không tồn tại</h5></div>;

  return (
    <div className="p-3">
      {/* 👇 SEO tự chế, không lo lỗi build */}
      <SEO title={sp.ten} description={`Mua ${sp.ten} giá tốt nhất tại MaiVang Shop`} />

      <Card className="border-0 shadow-sm overflow-hidden">
        <Row className="g-0">
            {/* Cột ảnh bên trái */}
            <Col md={5} className="bg-light d-flex align-items-center justify-content-center">
                <img 
                    src={sp.anh || "https://via.placeholder.com/500"} 
                    alt={sp.ten}
                    style={{maxWidth:'100%', maxHeight:'500px', objectFit:'contain'}} 
                    onError={e => e.target.src="https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg"}
                />
            </Col>

            {/* Cột thông tin bên phải */}
            <Col md={7}>
                <Card.Body className="p-4 p-lg-5">
                    <div className="mb-3">
                        {sp.isMoi && <Badge bg="success" className="me-2 px-3 py-2">SẢN PHẨM MỚI</Badge>}
                        {sp.isKhuyenMai && <Badge bg="danger" className="px-3 py-2">GIẢM {sp.phanTramGiam}%</Badge>}
                    </div>

                    <h2 className="fw-bold text-success mb-3">{sp.ten}</h2>
                    <div className="text-muted mb-4">Mã SP: <span className="fw-bold text-dark">#{sp.id.substring(0,6).toUpperCase()}</span></div>

                    <div className="d-flex align-items-center gap-3 mb-4 bg-light p-3 rounded">
                        <div className="text-danger fw-bold display-6">{sp.giaBan?.toLocaleString()} ¥</div>
                        {sp.isKhuyenMai && <div className="text-muted text-decoration-line-through fs-5">{sp.giaGoc?.toLocaleString()} ¥</div>}
                        <span className="text-secondary">/ {sp.donVi}</span>
                    </div>

                    <div className="mb-4">
                        <h5 className="fw-bold border-bottom pb-2">Mô tả sản phẩm</h5>
                        <div className="text-secondary" dangerouslySetInnerHTML={{__html: sp.moTa}} />
                    </div>

                    <div className="d-grid gap-2">
                         <Button variant="success" size="lg" className="fw-bold py-3 text-uppercase shadow-sm" onClick={()=>themVaoGio(sp)}>
                             <i className="fa-solid fa-cart-plus me-2"></i> Thêm vào giỏ hàng
                         </Button>
                    </div>
                </Card.Body>
            </Col>
        </Row>
      </Card>
    </div>
  );
}
export default ProductDetail;