import React from 'react';
import { useParams } from 'react-router-dom';
import { Container, Row, Col, Button, Badge } from 'react-bootstrap';
import { Helmet } from "react-helmet";

function ProductDetail({ dsSanPham, themVaoGio, colors }) {
  const { id } = useParams();
  const sp = dsSanPham.find(p => p.id === id);

  if (!sp) return <div className="text-center mt-5">Không tìm thấy sản phẩm</div>;

  return (
    <Container className="bg-white p-4 rounded shadow-sm mt-3">
      <Helmet><title>{sp.ten} | Chi tiết</title></Helmet>
      <Row>
        <Col md={5}><img src={sp.anh} className="w-100 rounded border" /></Col>
        <Col md={7}>
           <h2 className="text-success fw-bold">{sp.ten}</h2>
           <div className="mb-3">{sp.isMoi && <Badge bg="success" className="me-2">Sản phẩm mới</Badge>}<Badge bg={sp.soLuong>0?'info':'secondary'}>{sp.soLuong>0?'Còn hàng':'Hết hàng'}</Badge></div>
           <div className="bg-light p-3 rounded mb-3">
               <h3 className="text-danger fw-bold m-0">{sp.giaBan?.toLocaleString()} ¥ <small className="text-muted fs-6 fw-normal">/ {sp.donVi}</small></h3>
               {sp.isKhuyenMai && <div className="text-decoration-line-through text-muted">{sp.giaGoc?.toLocaleString()} ¥</div>}
           </div>
           <div dangerouslySetInnerHTML={{__html: sp.moTa}} className="mb-4 text-secondary" />
           <Button variant="warning" size="lg" className="w-100 fw-bold" onClick={()=>themVaoGio(sp)}>THÊM VÀO GIỎ HÀNG</Button>
        </Col>
      </Row>
    </Container>
  );
}
export default ProductDetail;