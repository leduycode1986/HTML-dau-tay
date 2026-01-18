import React from 'react'
import { Link } from 'react-router-dom'

// Nhận thêm prop dsDanhMuc để biết quan hệ cha con
function Home({ dsSanPham, dsDanhMuc, themVaoGio, danhMuc, tuKhoa, colors }) {

  // LOGIC LỌC THÔNG MINH
  let sanPhamHienThi = dsSanPham.filter(sp => {
      // 1. Kiểm tra từ khóa
      const dungTuKhoa = sp.ten.toLowerCase().includes(tuKhoa.toLowerCase());
      
      // 2. Kiểm tra danh mục (Cha bao gồm cả Con)
      let dungDanhMuc = false;
      if (danhMuc === 'all') {
          dungDanhMuc = true;
      } else {
          // Lấy danh sách ID của danh mục hiện tại và các con của nó
          const danhMucCon = dsDanhMuc.filter(dm => dm.parent === danhMuc).map(dm => dm.id);
          const danhMucChapNhan = [danhMuc, ...danhMucCon];
          
          dungDanhMuc = danhMucChapNhan.includes(sp.phanLoai);
      }

      return dungDanhMuc && dungTuKhoa;
  });

  const isDefaultView = danhMuc === 'all' && tuKhoa === '';
  const dsKhuyenMai = dsSanPham.filter(sp => sp.isKhuyenMai);
  const dsBanChay = dsSanPham.filter(sp => sp.isBanChay);

  return (
    <div>
      {/* Banner cho danh mục đang chọn */}
      {!isDefaultView && (
          <h3 style={{color: colors.primaryGreen, borderBottom: '2px solid #ccc', paddingBottom: '10px', marginBottom: '20px'}}>
             {dsDanhMuc.find(dm => dm.id === danhMuc)?.ten || 'Kết quả tìm kiếm'}
          </h3>
      )}

      {isDefaultView && (
          <>
            {dsKhuyenMai.length > 0 && <ProductSection title="🔥 KHUYẾN MÃI SỐC" products={dsKhuyenMai} themVaoGio={themVaoGio} colors={colors} />}
            {dsBanChay.length > 0 && <ProductSection title="💎 SẢN PHẨM BÁN CHẠY" products={dsBanChay} themVaoGio={themVaoGio} colors={colors} />}
            <h4 style={{marginTop: '40px', color: '#555'}}>Tất cả sản phẩm</h4>
          </>
      )}

      <div style={{ width: '100%', display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
        {sanPhamHienThi.map((sanPham) => (
            <ProductCard key={sanPham.id} sanPham={sanPham} themVaoGio={themVaoGio} colors={colors} />
        ))}
        {sanPhamHienThi.length === 0 && <p style={{width: '100%', textAlign: 'center', color: '#777'}}>Không có sản phẩm nào!</p>}
      </div>
    </div>
  )
}

// (Giữ nguyên phần ProductSection và ProductCard bên dưới giống cũ)
function ProductSection({ title, products, themVaoGio, colors }) {
    return (
        <div style={{ marginBottom: '30px' }}>
            <h5 style={{ background: colors.primaryGreen, color: 'white', padding: '10px', display: 'inline-block', borderRadius: '5px' }}>{title}</h5>
            <div style={{ display: 'flex', gap: '15px', overflowX: 'auto', padding: '10px 0' }}>
                {products.map(sp => <div key={sp.id} style={{minWidth: '220px'}}><ProductCard sanPham={sp} themVaoGio={themVaoGio} colors={colors} /></div>)}
            </div>
        </div>
    )
}

function ProductCard({ sanPham, themVaoGio, colors }) {
    return (
        <div style={{ border: '1px solid #eee', borderRadius: '10px', padding: '15px', width: '230px', background: 'white', position: 'relative' }}>
            {sanPham.isKhuyenMai && <span style={{position: 'absolute', top: '10px', right: '10px', background: 'red', color: 'white', fontSize: '10px', padding: '2px 5px', borderRadius: '3px'}}>Giảm</span>}
            <Link to={`/product/${sanPham.id}`} style={{textDecoration: 'none', color: 'inherit'}}>
                <img src={sanPham.anh} style={{width: '100%', height: '150px', objectFit: 'cover', borderRadius: '5px'}} />
                <h6 style={{margin: '10px 0', height: '40px', overflow: 'hidden'}}>{sanPham.ten}</h6>
                <p style={{color: '#d35400', fontWeight: 'bold'}}>{sanPham.gia}</p>
            </Link>
            <button onClick={() => {themVaoGio(sanPham); alert("Đã thêm!")}} style={{width: '100%', background: colors.accentYellow, border: 'none', padding: '8px', borderRadius: '5px', fontWeight: 'bold'}}>MUA NGAY</button>
        </div>
    )
}

export default Home