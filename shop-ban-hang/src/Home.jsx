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
      <h2 style={{ textAlign: 'center', marginBottom: '30px', color: colors.primaryGreen, textTransform: 'uppercase', fontWeight: '800', borderBottom: `2px dashed ${colors.accentYellow}`, display: 'inline-block', paddingBottom: '5px', left: '50%', position: 'relative', transform: 'translateX(-50%)' }}>
          {tuKhoa ? `🔍 Kết quả: "${tuKhoa}"` : tenTieuDe[danhMuc]}
      </h2>

      <div style={{ width: '100%', display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-start', gap: '20px' }}>
        {sanPhamHienThi.map((sanPham) => (
          <div key={sanPham.id} style={{ 
              borderRadius: '10px', padding: '15px', width: '240px', 
              backgroundColor: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '1px solid #eee', transition: 'transform 0.2s'
            }}
            onMouseOver={e => e.currentTarget.style.transform = 'translateY(-5px)'}
            onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
            
            <Link to={`/product/${sanPham.id}`} style={{textDecoration: 'none', color: 'inherit'}}>
                <div style={{overflow: 'hidden', borderRadius: '8px', height: '170px', marginBottom: '10px'}}>
                        <img src={sanPham.anh} alt={sanPham.ten} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <h3 style={{ fontSize: '16px', margin: '0 0 5px', minHeight: '40px', lineHeight: '1.3', color: '#333', fontWeight: '600' }}>{sanPham.ten}</h3>
                
                {/* GIÁ TIỀN: Màu Cam Vàng đậm đà */}
                <p style={{ color: colors.priceText, fontWeight: 'bold', fontSize: '18px', margin: 0 }}>{sanPham.gia}</p>
            </Link>
            
            {/* NÚT MUA: Nền Vàng rực, Chữ Đen -> Rất nổi bật */}
            <button 
                onClick={() => {
                    themVaoGio(sanPham);
                    alert(`Đã thêm ${sanPham.ten} vào giỏ! 🌼`);
                }}
                style={{ 
                    width: '100%', 
                    backgroundColor: colors.accentYellow, // VÀNG
                    color: 'black', // ĐEN
                    border: 'none', 
                    padding: '10px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', marginTop: '12px',
                    boxShadow: '0 3px 0 #e0a800', // Hiệu ứng nút nổi 3D
                    transition: 'all 0.1s'
                }}
                onMouseDown={e => { e.currentTarget.style.transform = 'translateY(3px)'; e.currentTarget.style.boxShadow = 'none'; }}
                onMouseUp={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 3px 0 #e0a800'; }}
            >
                CHỌN MUA
            </button>
          </div>
        ))}
        {/* ... (Phần thông báo trống giữ nguyên) ... */}
      </div>
    </div>
  )
}
export default Home