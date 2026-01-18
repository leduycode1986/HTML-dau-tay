import React, { useEffect, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { Badge, Row, Col, Card, Button } from 'react-bootstrap';

function Home({ dsSanPham, dsDanhMuc, themVaoGio }) {
  const { id } = useParams(); // Lấy ID danh mục từ URL
  const [searchParams] = useSearchParams();
  const tuKhoa = searchParams.get('search') || '';

  // Logic lọc sản phẩm CỰC KỲ QUAN TRỌNG
  let list = dsSanPham.filter(sp => {
      // 1. Lọc theo từ khóa tìm kiếm
      const matchKey = sp.ten.toLowerCase().includes(tuKhoa.toLowerCase());
      if (!matchKey) return false;

      // 2. Nếu ở trang chủ (không có ID) -> Lấy hết
      if (!id) return true;

      // 3. Nếu có ID -> Kiểm tra xem ID đó là Cha hay Con
      // Tìm danh mục hiện tại
      const currentDM = dsDanhMuc.find(d => d.id === id || d.customId === id);
      if (!currentDM) return false;

      // Nếu là danh mục CHA: Lấy sản phẩm của nó + sản phẩm của các con nó
      const childIDs = dsDanhMuc.filter(d => d.parent === (currentDM.customId || currentDM.id)).map(d => d.customId || d.id);
      
      // Kiểm tra: SP thuộc danh mục này HOẶC SP thuộc danh mục con của nó
      return sp.phanLoai === (currentDM.customId || currentDM.id) || childIDs.includes(sp.phanLoai);
  });

  const tenDanhMuc = id 
    ? dsDanhMuc.find(d => d.id === id || d.customId === id)?.ten 
    : (tuKhoa ? `Tìm kiếm: "${tuKhoa}"` : 'Tất cả sản phẩm');

  return (
    <div>
      <h4 className="text-success fw-bold text-uppercase mb-3 pb-2 border-bottom">{tenDanhMuc}</h4>
      
      {list.length === 0 ? (
          <div className="text-center p-5 text-muted bg-white rounded shadow-sm">
              <i className="fa-solid fa-box-open fs-1 mb-3"></i>
              <p>Chưa có sản phẩm nào trong mục này.</p>
              <Link to="/" className="btn btn-primary btn-sm">Xem tất cả sản phẩm</Link>
          </div>
      ) : (
          <Row className="g-3"> 
            {list.map(sp => (
                <Col xs={6} md={4} lg={3} xl={2} key={sp.id}>
                    <Card className="product-card shadow-sm h-100">
                        {sp.isMoi && <Badge bg="success" className="position-absolute top-0 start-0 m-2">Mới</Badge>}
                        {sp.isKhuyenMai && <Badge bg="danger" className="position-absolute top-0 end-0 m-2">-{sp.phanTramGiam}%</Badge>}
                        <Link to={`/product/${sp.id}`} className="text-decoration-none text-dark">
                            <div className="product-img-container"><Card.Img variant="top" src={sp.anh || "https://via.placeholder.com/300"} className="product-img" onError={e => e.target.src="https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg"} /></div>
                            <Card.Body className="p-2">
                                <Card.Title className="fs-6 fw-bold text-truncate">{sp.ten}</Card.Title>
                                <div className="d-flex justify-content-between align-items-end">
                                    <div><div className="text-danger fw-bold">{sp.giaBan?.toLocaleString()} ¥</div>{sp.isKhuyenMai && <small className="text-decoration-line-through text-muted" style={{fontSize:'11px'}}>{sp.giaGoc?.toLocaleString()} ¥</small>}</div>
                                </div>
                            </Card.Body>
                        </Link>
                        <Card.Footer className="p-2 bg-white border-0"><Button variant="outline-success" size="sm" className="w-100 fw-bold" onClick={()=>themVaoGio(sp)}>+ Giỏ hàng</Button></Card.Footer>
                    </Card>
                </Col>
            ))}
          </Row>
      )}
    </div>
  )
}
export default Home