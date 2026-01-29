import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Breadcrumb } from 'react-bootstrap';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';
import { toSlug } from './utils';

function NewsDetail() {
  const { slug } = useParams();
  const [baiViet, setBaiViet] = useState(null);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "tinTuc"), sn => {
      const found = sn.docs.find(d => {
        const data = d.data();
        return (data.slug === slug) || (toSlug(data.tieuDe) === slug);
      });
      if (found) setBaiViet({ id: found.id, ...found.data() });
    });
    return () => unsub();
  }, [slug]);

  if (!baiViet) return <Container className="py-5 text-center">Đang tải bài viết...</Container>;

  return (
    <div style={{background:'#fff', minHeight:'100vh', paddingBottom:'50px'}}>
      <div className="bg-light py-3 mb-4 border-bottom">
        <Container>
          <Breadcrumb className="m-0 small">
            <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/" }}>Trang chủ</Breadcrumb.Item>
            <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/tin-tuc" }}>Góc ẩm thực</Breadcrumb.Item>
            <Breadcrumb.Item active>{baiViet.tieuDe}</Breadcrumb.Item>
          </Breadcrumb>
        </Container>
      </div>

      <Container>
        <div className="row justify-content-center">
          <div className="col-lg-9">
            <h1 className="fw-bold text-success mb-3">{baiViet.tieuDe}</h1>
            <div className="text-muted small mb-4 border-bottom pb-3">
              <i className="fa-regular fa-clock me-1"></i> Đăng ngày: {new Date(baiViet.ngayDang?.seconds * 1000).toLocaleDateString('vi-VN')}
              <span className="mx-2">|</span>
              <i className="fa-solid fa-user-pen me-1"></i> Tác giả: Admin
            </div>
            
            <div className="fw-bold fst-italic text-secondary mb-4 p-3 bg-light rounded border-start border-4 border-success">
              {baiViet.tomTat}
            </div>

            <div className="post-content" dangerouslySetInnerHTML={{ __html: baiViet.noiDung }}></div>
            
            <div className="mt-5 pt-4 border-top">
                <Link to="/tin-tuc" className="btn btn-outline-secondary rounded-pill px-4"><i className="fa-solid fa-arrow-left me-2"></i> Quay lại danh sách</Link>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
export default NewsDetail;