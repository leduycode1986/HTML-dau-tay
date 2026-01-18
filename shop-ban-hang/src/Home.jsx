import React from 'react'
import { Link } from 'react-router-dom'
import { products } from './products'

function Home({ themVaoGio, danhMuc, tuKhoa, colors }) {

  const sanPhamHienThi = products.filter(sp => {
      const dungDanhMuc = danhMuc === 'all' || sp.phanLoai === danhMuc;
      const dungTuKhoa = sp.ten.toLowerCase().includes(tuKhoa.toLowerCase());
      return dungDanhMuc && dungTuKhoa;
  });

  const tenTieuDe = {
      'all': '🔥 Khuyến mãi sốc hôm nay',
      'thitca': '🥩 Thịt, Cá, Hải Sản Tươi Sống',
      'raucu': '🥦 Rau Củ, Trái Cây Miệt Vườn',
      'douong': '🍺 Bia, Nước Giải Khát Các Loại'
  }

  return (
    <div>
      
      {/* Tiêu đề trang chủ màu Xanh Chủ Đạo */}
      <h2 style={{ textAlign: 'center', marginBottom: '30px', color: colors.primaryGreen, textTransform: 'uppercase', fontWeight: '800', letterSpacing: '1px' }}>
          {tuKhoa ? `🔍 Kết quả tìm cho: "${tuKhoa}"` : tenTieuDe[danhMuc]}
      </h2>

      <div style={{ width: '100%', display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-start', gap: '20px' }}>
        {sanPhamHienThi.map((sanPham) => (
          <div key={sanPham.id} style={{ 
              border: 'none', borderRadius: '12px', padding: '15px', width: '240px', 
              backgroundColor: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)', transition: 'transform 0.2s'
            }}
            onMouseOver={e => e.currentTarget.style.transform = 'translateY(-5px)'}
            onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
            
            <div>
                <Link to={`/product/${sanPham.id}`} style={{textDecoration: 'none', color: 'inherit'}}>
                    <div style={{overflow: 'hidden', borderRadius: '10px', height: '180px', marginBottom: '15px'}}>
                         <img 
                            src={sanPham.anh} 
                            alt={sanPham.ten} 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                    </div>
                    <h3 style={{ fontSize: '17px', margin: '0 0 10px', minHeight: '44px', lineHeight: '1.3', color: colors.textDark, fontWeight: '600' }}>{sanPham.ten}</h3>
                    {/* Giá tiền màu Xanh Chủ Đạo */}
                    <p style={{ color: colors.primaryGreen, fontWeight: 'bold', fontSize: '20px', margin: 0 }}>{sanPham.gia}</p>
                </Link>
            </div>
            
            <button 
                onClick={() => {
                    themVaoGio(sanPham);
                    // Có thể thay alert bằng một thông báo đẹp hơn sau này
                    alert(`Đã thêm ${sanPham.ten} vào giỏ! 🛒`);
                }}
                // Nút Mua hàng: Viền xanh, chữ xanh, nền trắng. Hover thì ngược lại.
                style={{ 
                    width: '100%', backgroundColor: 'white', color: colors.primaryGreen, border: `2px solid ${colors.primaryGreen}`, 
                    padding: '10px', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', marginTop: '15px',
                    transition: 'all 0.2s'
                }}
                onMouseOver={(e) => { e.currentTarget.style.backgroundColor = colors.primaryGreen; e.currentTarget.style.color = 'white'; }}
                onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'white'; e.currentTarget.style.color = colors.primaryGreen; }}
            >
                CHỌN MUA
            </button>
          </div>
        ))}

        {sanPhamHienThi.length === 0 && (
            <div style={{width: '100%', textAlign: 'center', marginTop: '50px', color: '#777'}}>
                <span style={{fontSize: '50px', display: 'block', marginBottom: '20px'}}>🥦🧐</span>
                <h3>Không tìm thấy sản phẩm nào!</h3>
                <p>Bạn thử tìm với từ khóa khác hoặc chọn danh mục khác xem sao nhé.</p>
            </div>
        )}
      </div>
    </div>
  )
}

export default Home