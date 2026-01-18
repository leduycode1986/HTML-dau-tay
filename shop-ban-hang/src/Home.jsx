import React from 'react'
import { Link } from 'react-router-dom'

// Nhận dsSanPham từ props thay vì import file
function Home({ dsSanPham, themVaoGio, danhMuc, tuKhoa, colors }) {

  // Lọc sản phẩm cơ bản
  let sanPhamHienThi = dsSanPham.filter(sp => {
      const dungDanhMuc = danhMuc === 'all' || sp.phanLoai === danhMuc;
      const dungTuKhoa = sp.ten.toLowerCase().includes(tuKhoa.toLowerCase());
      return dungDanhMuc && dungTuKhoa;
  });

  // Tách các nhóm đặc biệt (Nếu đang ở trang Tất cả và không tìm kiếm)
  const isDefaultView = danhMuc === 'all' && tuKhoa === '';
  const dsKhuyenMai = dsSanPham.filter(sp => sp.isKhuyenMai);
  const dsBanChay = dsSanPham.filter(sp => sp.isBanChay);
  const dsMoi = dsSanPham.filter(sp => sp.isMoi);

  return (
    <div>
      {/* 1. HIỂN THỊ THEO NHÓM ĐẶC BIỆT (Admin cài đặt) */}
      {isDefaultView && (
          <>
            {dsKhuyenMai.length > 0 && <ProductSection title="🔥 KHUYẾN MÃI SỐC" products={dsKhuyenMai} themVaoGio={themVaoGio} colors={colors} />}
            {dsBanChay.length > 0 && <ProductSection title="💎 SẢN PHẨM BÁN CHẠY" products={dsBanChay} themVaoGio={themVaoGio} colors={colors} />}
            {dsMoi.length > 0 && <ProductSection title="🆕 HÀNG MỚI VỀ" products={dsMoi} themVaoGio={themVaoGio} colors={colors} />}
            
            <h3 style={{color: colors.primaryGreen, marginTop: '40px', borderBottom: '2px solid #ccc', paddingBottom: '10px'}}>📦 TẤT CẢ SẢN PHẨM</h3>
          </>
      )}

      {/* 2. DANH SÁCH SẢN PHẨM THÔNG THƯỜNG (Hoặc kết quả tìm kiếm) */}
      <div style={{ width: '100%', display: 'flex', flexWrap: 'wrap', gap: '20px', marginTop: '20px' }}>
        {sanPhamHienThi.map((sanPham) => (
            <ProductCard key={sanPham.id} sanPham={sanPham} themVaoGio={themVaoGio} colors={colors} />
        ))}
        {sanPhamHienThi.length === 0 && <p style={{width: '100%', textAlign: 'center', color: '#777'}}>Không tìm thấy sản phẩm nào!</p>}
      </div>
    </div>
  )
}

// Component con: Mục sản phẩm (Section)
function ProductSection({ title, products, themVaoGio, colors }) {
    return (
        <div style={{ marginBottom: '40px' }}>
            <h3 style={{ 
                color: 'white', backgroundColor: colors.primaryGreen, padding: '10px 20px', 
                borderRadius: '5px 20px 0 0', display: 'inline-block', marginBottom: '15px', fontWeight: 'bold' 
            }}>{title}</h3>
            <div style={{ display: 'flex', gap: '20px', overflowX: 'auto', paddingBottom: '10px' }}>
                {products.map(sp => (
                     <div key={sp.id} style={{minWidth: '240px'}}>
                        <ProductCard sanPham={sp} themVaoGio={themVaoGio} colors={colors} />
                     </div>
                ))}
            </div>
        </div>
    )
}

// Component con: Thẻ sản phẩm (Card)
function ProductCard({ sanPham, themVaoGio, colors }) {
    return (
        <div style={{ 
              borderRadius: '10px', padding: '15px', width: '240px', 
              backgroundColor: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: '1px solid #eee', position: 'relative'
            }}>
            
            {/* Tag nhỏ trên góc ảnh */}
            {sanPham.isKhuyenMai && <span style={{position: 'absolute', top: '10px', right: '10px', background: 'red', color: 'white', padding: '2px 8px', borderRadius: '10px', fontSize: '12px', fontWeight: 'bold'}}>Giảm giá</span>}

            <Link to={`/product/${sanPham.id}`} style={{textDecoration: 'none', color: 'inherit'}}>
                <div style={{overflow: 'hidden', borderRadius: '8px', height: '170px', marginBottom: '10px'}}>
                        <img src={sanPham.anh} alt={sanPham.ten} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <h3 style={{ fontSize: '16px', margin: '0 0 5px', minHeight: '40px', lineHeight: '1.3', color: '#333', fontWeight: '600' }}>{sanPham.ten}</h3>
                <p style={{ color: '#ff8f00', fontWeight: 'bold', fontSize: '18px', margin: 0 }}>{sanPham.gia}</p>
            </Link>
            
            <button 
                onClick={() => { themVaoGio(sanPham); alert(`Đã thêm ${sanPham.ten}!`); }}
                style={{ 
                    width: '100%', backgroundColor: colors.accentYellow, color: 'black', border: 'none', 
                    padding: '10px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', marginTop: '12px',
                    boxShadow: '0 3px 0 #e0a800'
                }}
            >
                CHỌN MUA
            </button>
        </div>
    )
}

export default Home