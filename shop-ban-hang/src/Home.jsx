import React from 'react'
import { Link } from 'react-router-dom'
import { Badge, Row, Col, Card, Button } from 'react-bootstrap';

function Home({ dsSanPham, dsDanhMuc, themVaoGio, danhMuc, tuKhoa }) {
  let list = dsSanPham.filter(sp => {
      const matchKey = sp.ten.toLowerCase().includes(tuKhoa.toLowerCase());
      if(danhMuc==='all') return matchKey;
      const subs = dsDanhMuc.filter(d=>d.parent===danhMuc || d.parent===(dsDanhMuc.find(x=>x.id===danhMuc)?.customId)).map(d=>d.id);
      return matchKey && [danhMuc, ...subs].includes(sp.phanLoai);
  });
  const tenDanhMuc = danhMuc === 'all' ? 'Tất cả sản phẩm' : dsDanhMuc.find(d => d.id === danhMuc || d.customId === danhMuc)?.ten;

  return (
    <div>
      <h4 className="text-success fw-bold text-uppercase mb-3 pb-2 border-bottom">{tenDanhMuc}</h4>
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
    </div>
  )
}
export default Home