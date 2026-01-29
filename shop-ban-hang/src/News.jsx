import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';
import { toSlug } from './utils';

function News() {
  const [dsTinTuc, setDsTinTuc] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "tinTuc"), sn => {
      const data = sn.docs.map(d => ({ id: d.id, ...d.data() }));
      // Sắp xếp bài mới nhất lên đầu
      setDsTinTuc(data.sort((a,b) => b.ngayDang?.seconds - a.ngayDang?.seconds));
    });
    return () => unsub();
  }, []);

  return (
    <div style={{minHeight:'100vh', background:'#f8f9fa', paddingBottom:'50px'}}>
      <div className="bg-success py-4 mb-4 text-white text-center">
        <h2 className="fw-bold m-0"><i className="fa-solid fa-utensils me-2"></i> GÓC ẨM THỰC</h2>
        <p className="m-0 mt-1 opacity-75">Chia sẻ bí quyết nấu ăn ngon mỗi ngày</p>
      </div>

      <Container>
        {dsTinTuc.length === 0 ? (
          <div className="text-center py-5 text-muted">Chưa có bài viết nào.</div>
        ) : (
          <Row className="g-4">
            {dsTinTuc.map(tin => (
              <Col md={4} key={tin.id}>
                <Card className="h-100 shadow-sm border-0 product-card">
                  <div className="overflow-hidden" style={{height:'200px'}}>
                    <Link to={`/tin-tuc/${tin.slug || toSlug(tin.tieuDe)}`}>
                      <Card.Img variant="top" src={tin.anh} className="w-100 h-100 object-fit-cover group-hover-zoom" />
                    </Link>
                  </div>
                  <Card.Body className="d-flex flex-column">
                    <div className="small text-muted mb-2"><i className="fa-regular fa-calendar me-1"></i> {new Date(tin.ngayDang?.seconds * 1000).toLocaleDateString('vi-VN')}</div>
                    <Link to={`/tin-tuc/${tin.slug || toSlug(tin.tieuDe)}`} className="text-decoration-none text-dark">
                      <Card.Title className="fw-bold" style={{display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden'}}>{tin.tieuDe}</Card.Title>
                    </Link>
                    <Card.Text className="text-secondary small flex-grow-1" style={{display:'-webkit-box', WebkitLineClamp:3, WebkitBoxOrient:'vertical', overflow:'hidden'}}>
                      {tin.tomTat}
                    </Card.Text>
                    <Link to={`/tin-tuc/${tin.slug || toSlug(tin.tieuDe)}`}>
                      <Button variant="outline-success" size="sm" className="w-100 mt-3 fw-bold">XEM CHI TIẾT</Button>
                    </Link>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Container>
    </div>
  );
}
export default News;