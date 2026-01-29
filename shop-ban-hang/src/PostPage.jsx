import React from 'react';
import { Container, Breadcrumb } from 'react-bootstrap';
import { Link } from 'react-router-dom';

function PostPage({ title, content }) {
  return (
    <div style={{background: '#fff', minHeight: '100vh', paddingBottom: '50px'}}>
      {/* Header nhẹ nhàng */}
      <div className="bg-light py-3 mb-4 border-bottom">
        <Container>
          <Breadcrumb className="m-0 small">
            <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/" }}>Trang chủ</Breadcrumb.Item>
            <Breadcrumb.Item active>{title}</Breadcrumb.Item>
          </Breadcrumb>
        </Container>
      </div>

      <Container>
        <div className="row justify-content-center">
          <div className="col-lg-10">
            <h1 className="fw-bold text-success mb-4 border-bottom pb-3">{title}</h1>
            
            {content ? (
              <div className="post-content" dangerouslySetInnerHTML={{ __html: content }}></div>
            ) : (
              <div className="text-center py-5 text-muted">
                <i className="fa-regular fa-file-lines fs-1 mb-3"></i>
                <p>Nội dung đang được cập nhật...</p>
                <Link to="/" className="btn btn-outline-success rounded-pill px-4">Về trang chủ</Link>
              </div>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
}

export default PostPage;