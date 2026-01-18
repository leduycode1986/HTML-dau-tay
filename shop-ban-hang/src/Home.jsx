import React from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { Badge, Row, Col, Card, Button } from 'react-bootstrap';
import SEO from './SEO';

function Home({ dsSanPham, dsDanhMuc, themVaoGio }) {
  const { id } = useParams(); // Lấy mã danh mục từ đường link (URL)
  const [searchParams] = useSearchParams();
  const tuKhoa = searchParams.get('search') || '';

  // --- LOGIC LỌC SẢN PHẨM QUAN TRỌNG ---
  let list = dsSanPham.filter(sp => {
      // 1. Lọc theo từ khóa tìm kiếm (nếu có)
      const matchKey = sp.ten.toLowerCase().includes(tuKhoa.toLowerCase());
      if (!matchKey) return false;

      // 2. Nếu ở trang chủ (Tất cả sản phẩm) -> Hiện tất cả
      if (!id || id === 'all') return true;

      // 3. Tìm danh mục đang chọn dựa trên ID hoặc CustomID
      const currentDM = dsDanhMuc.find(d => d.id === id || d.customId === id);
      if (!currentDM) return false;

      // 4. LẤY TẤT CẢ MÃ DANH MỤC CON (Để bấm cha hiện luôn cả con)
      const danhMucLienQuan = [
          currentDM.customId || currentDM.id, // Chính nó
          ...dsDanhMuc
            .filter(d => d.parent === (currentDM.customId || currentDM.id))
            .map(d => d.customId || d.id) // Các con của nó
      ];
      
      // Sản phẩm hợp lệ nếu phân loại của nó nằm trong danh sách liên quan này
      return danhMucLienQuan.includes(sp.phanLoai);
  });

  // Xác định tiêu đề hiển thị
  const currentCategory = dsDanhMuc.find(d => d.id === id || d.customId === id);
  const tenHienThi = id ? currentCategory?.ten : (tuKhoa ? `Kết quả: "${tuKhoa}"` : 'Tất cả sản phẩm');

  return (
    <div className="p-0">
      <SEO title={tenHienThi} />
      
      <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-2">
          <h4 className="text-success fw-bold text-uppercase m-0">{tenHienThi}</h4>
          <span className="text-muted small">Tìm thấy {list.length} sản phẩm</span>
      </div>

      {list.length === 0 ? (
          <div className="text-center p-5 bg-white rounded shadow-sm border">
              <i className="fa-solid fa-face-frown fs-1 text-muted mb-3"></i>
              <p className="text-muted">Mục này chưa có sản phẩm nào. Bạn hãy thử chọn mục khác nhé!</p>
              <Link to="/" className="btn btn-success btn-sm rounded-pill px-4">Xem tất cả sản phẩm</Link>
          </div>
      ) : (
          /* Sử dụng Row g-3 để các sản phẩm khít nhau và tràn màn hình đẹp hơn */
          <Row className="g-3 m-0"> 
            {list.map(sp => (
                <Col xs={6} md={4} lg={3} xl={2} key={sp.id}>
                    <Card className="product-card shadow-sm h-100 border-0">
                        {sp.isMoi && <Badge bg="success" className="position-absolute top-0 start-0 m-2 shadow-sm">Mới</Badge>}
                        {sp.isKhuyenMai && <Badge bg="danger" className="position-absolute top-0 end-0 m-2 shadow-sm">Giảm giá</Badge>}
                        
                        <Link to={`/product/${sp.id}`} className="text-decoration-none text-dark">
                            <div className="product-img-container">
                                <Card.Img 
                                    variant="top" 
                                    src={sp.anh || "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg"} 
                                    className="product-img"
                                    onError={e => e.target.src="https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg"} 
                                />
                            </div>
                            <Card.Body className="p-2">
                                <Card.Title className="fs-6 fw-bold text-truncate" title={sp.ten}>{sp.ten}</Card.Title>
                                <div className="d-flex justify-content-between align-items-end">
                                    <div className="text-danger fw-bold">{sp.giaBan?.toLocaleString()} ¥</div>
                                    <small className="text-muted" style={{fontSize:'11px'}}>/{sp.donVi || 'Cái'}</small>
                                </div>
                            </Card.Body>
                        </Link>
                        <Card.Footer className="p-2 bg-white border-0">
                            <Button variant="outline-success" size="sm" className="w-100 fw-bold rounded-pill" onClick={()=>themVaoGio(sp)}>+ Giỏ hàng</Button>
                        </Card.Footer>
                    </Card>
                </Col>
            ))}
          </Row>
      )}
    </div>
  )
}
export default Home;