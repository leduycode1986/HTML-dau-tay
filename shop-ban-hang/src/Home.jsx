import React from 'react' // Bỏ useState vì không cần nữa
import { Link } from 'react-router-dom'
import { products } from './products'

// Nhận thêm prop 'danhMuc' từ App truyền xuống
function Home({ themVaoGio, danhMuc }) {

  // Lọc hàng dựa trên lệnh của App
  const sanPhamHienThi = danhMuc === 'all' 
    ? products 
    : products.filter(sp => sp.phanLoai === danhMuc);

  // Đặt tên tiêu đề cho đẹp
  const tenTieuDe = {
      'all': 'Tất cả sản phẩm',
      'dientu': 'Đồ Điện Tử Công Nghệ',
      'thoitrang': 'Thời Trang Nam Nữ',
      'phukien': 'Phụ Kiện Máy Tính'
  }

  return (
    <div style={{ padding: '20px' }}>
      
      {/* Tiêu đề thay đổi theo danh mục */}
      <h2 style={{ textAlign: 'center', marginBottom: '30px', color: '#333' }}>
          {tenTieuDe[danhMuc]}
      </h2>

      {/* DANH SÁCH SẢN PHẨM */}
      <div style={{ width: '100%', display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-start', gap: '20px' }}>
        {sanPhamHienThi.map((sanPham) => (
          <div key={sanPham.id} style={{ 
              border: '1px solid #ddd', borderRadius: '10px', padding: '15px', width: '250px', 
              boxShadow: '0 4px 8px rgba(0,0,0,0.1)', backgroundColor: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
            }}>
            
            <div>
                <Link to={`/product/${sanPham.id}`}>
                <img 
                    src={sanPham.anh} 
                    alt={sanPham.ten} 
                    style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px' }} 
                />
                </Link>

                <h3 style={{ fontSize: '18px', margin: '10px 0' }}>{sanPham.ten}</h3>
                <p style={{ color: '#d63031', fontWeight: 'bold' }}>{sanPham.gia}</p>
            </div>
            
            <button 
                onClick={() => {
                    themVaoGio(sanPham);
                    alert("Đã thêm vào giỏ!");
                }}
                style={{ width: '100%', backgroundColor: '#ff4d4f', color: 'white', border: 'none', padding: '10px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', marginTop: '10px' }}>
                CHỌN MUA
            </button>
          </div>
        ))}

        {sanPhamHienThi.length === 0 && (
            <p style={{width: '100%', textAlign: 'center', fontSize: '18px', color: 'gray'}}>
                Mục này đang tạm hết hàng! 😅
            </p>
        )}
      </div>
    </div>
  )
}

export default Home