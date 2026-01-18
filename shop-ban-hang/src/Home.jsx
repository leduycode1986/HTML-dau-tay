import React from 'react'
import { Link } from 'react-router-dom'
import Badge from 'react-bootstrap/Badge';
import { Helmet } from "react-helmet"; // Nhập Helmet

function Home({ dsSanPham, dsDanhMuc, themVaoGio, danhMuc, tuKhoa, colors }) {
  // Logic lọc giữ nguyên...
  let sanPhamHienThi = dsSanPham.filter(sp => {
      /* Logic cũ giữ nguyên */
      const dungTuKhoa = sp.ten.toLowerCase().includes(tuKhoa.toLowerCase());
      let dungDanhMuc = danhMuc === 'all';
      if (!dungDanhMuc) {
          const danhMucCon = dsDanhMuc.filter(dm => dm.parent === danhMuc || dm.parent === (dsDanhMuc.find(d => d.id === danhMuc)?.customId)).map(dm => dm.id);
          const customIds = dsDanhMuc.filter(dm => dm.parent === danhMuc).map(dm => dm.customId);
          const danhMucChapNhan = [danhMuc, ...danhMucCon, ...customIds];
          dungDanhMuc = danhMucChapNhan.includes(sp.phanLoai);
      }
      return dungDanhMuc && dungTuKhoa;
  });

  return (
    <div>
      {/* --- SEO TRANG CHỦ --- */}
      <Helmet>
        <title>Thực phẩm sạch Mai Vang | Chuyên cung cấp thực phẩm tươi ngon</title>
        <meta name="description" content="Mai Vang Shop - Cửa hàng thực phẩm sạch, thịt cá tươi sống, rau củ quả an toàn vệ sinh thực phẩm. Giao hàng nhanh chóng tại Nhật Bản." />
      </Helmet>

      <h3 style={{color: colors.primaryGreen, borderBottom: '2px solid #ccc', paddingBottom: '10px', marginBottom: '20px'}}>
         {danhMuc === 'all' && !tuKhoa ? 'Tất cả sản phẩm' : (dsDanhMuc.find(dm => (dm.customId || dm.id) === danhMuc)?.ten || 'Kết quả tìm kiếm')}
      </h3>
      
      <div style={{ width: '100%', display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
        {sanPhamHienThi.map((sanPham) => <ProductCard key={sanPham.id} sanPham={sanPham} themVaoGio={themVaoGio} colors={colors} />)}
        {sanPhamHienThi.length === 0 && <p style={{width: '100%', textAlign: 'center', color: '#777'}}>Không có sản phẩm nào!</p>}
      </div>
    </div>
  )
}

function ProductCard({ sanPham, themVaoGio, colors }) {
    // ... Code ProductCard cũ giữ nguyên ...
    return (
        <div style={{ border: '1px solid #eee', borderRadius: '12px', padding: '10px', width: '220px', background: 'white', position: 'relative', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
            {/* Tem Mới/Hot */}
            <div style={{position: 'absolute', top: '10px', left: '10px', display: 'flex', flexDirection: 'column', gap: '3px', zIndex: 1}}>
                {sanPham.isMoi && <Badge bg="success">Mới</Badge>}
                {sanPham.isBanChay && <Badge bg="warning" text="dark">Hot</Badge>}
            </div>
            {/* Tem Giảm giá */}
            {sanPham.isKhuyenMai && sanPham.phanTramGiam > 0 && (
                <div style={{position: 'absolute', top: '0', right: '0', background: 'red', color: 'white', fontWeight: 'bold', padding: '5px 8px', borderBottomLeftRadius: '10px', borderTopRightRadius: '10px'}}>-{sanPham.phanTramGiam}%</div>
            )}
            <Link to={`/product/${sanPham.id}`} style={{textDecoration: 'none', color: 'inherit'}}>
                <img src={sanPham.anh} style={{width: '100%', height: '150px', objectFit: 'cover', borderRadius: '8px'}} />
                <h6 style={{margin: '10px 0 5px 0', height: '40px', overflow: 'hidden'}}>{sanPham.ten}</h6>
                <div style={{color: '#d0021b', fontWeight: 'bold', fontSize: '16px'}}>{sanPham.giaBan?.toLocaleString('ja-JP')} ¥ <span style={{color: '#333', fontSize: '12px', fontWeight: 'normal'}}>/ {sanPham.donVi}</span></div>
            </Link>
            <button onClick={() => themVaoGio(sanPham)} style={{width: '100%', border: `1px solid ${colors.primaryGreen}`, color: colors.primaryGreen, padding: '6px', borderRadius: '20px', fontWeight: 'bold', marginTop: '10px', background: 'white'}}>+ Chọn Mua</button>
        </div>
    )
}
export default Home