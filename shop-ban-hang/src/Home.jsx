import React from 'react'
import { Link } from 'react-router-dom'
import Badge from 'react-bootstrap/Badge';

function Home({ dsSanPham, dsDanhMuc, themVaoGio, danhMuc, tuKhoa, colors }) {
  // Logic lọc (Giữ nguyên)
  let sanPhamHienThi = dsSanPham.filter(sp => {
      const dungTuKhoa = sp.ten.toLowerCase().includes(tuKhoa.toLowerCase());
      let dungDanhMuc = false;
      if (danhMuc === 'all') dungDanhMuc = true;
      else {
          const danhMucCon = dsDanhMuc.filter(dm => dm.parent === danhMuc || dm.parent === (dsDanhMuc.find(d => d.id === danhMuc)?.customId)).map(dm => dm.id);
          const customIds = dsDanhMuc.filter(dm => dm.parent === danhMuc).map(dm => dm.customId);
          const danhMucChapNhan = [danhMuc, ...danhMucCon, ...customIds];
          dungDanhMuc = danhMucChapNhan.includes(sp.phanLoai);
      }
      return dungDanhMuc && dungTuKhoa;
  });

  return (
    <div>
      <h3 style={{color: colors.primaryGreen, borderBottom: '2px solid #ccc', paddingBottom: '10px', marginBottom: '20px'}}>
         {danhMuc === 'all' && !tuKhoa ? 'Tất cả sản phẩm' : (dsDanhMuc.find(dm => (dm.customId || dm.id) === danhMuc)?.ten || 'Kết quả tìm kiếm')}
      </h3>
      
      <div style={{ width: '100%', display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
        {sanPhamHienThi.map((sanPham) => <ProductCard key={sanPham.id} sanPham={sanPham} themVaoGio={themVaoGio} colors={colors} />)}
        {sanPhamHienThi.length === 0 && <p style={{width: '100%', textAlign: 'center', color: '#777', padding: '50px'}}>Chưa có sản phẩm nào!</p>}
      </div>
    </div>
  )
}

function ProductCard({ sanPham, themVaoGio, colors }) {
    return (
        <div style={{ border: '1px solid #eee', borderRadius: '12px', padding: '10px', width: '220px', background: 'white', position: 'relative', boxShadow: '0 2px 5px rgba(0,0,0,0.05)', transition: '0.2s' }}>
            
            {/* TEM TRẠNG THÁI */}
            <div style={{position: 'absolute', top: '10px', left: '10px', display: 'flex', flexDirection: 'column', gap: '3px', zIndex: 1}}>
                {sanPham.isMoi && <Badge bg="success">Mới</Badge>}
                {sanPham.isBanChay && <Badge bg="warning" text="dark">Hot</Badge>}
            </div>
            
            {/* TEM GIẢM GIÁ */}
            {sanPham.isKhuyenMai && sanPham.phanTramGiam > 0 && (
                <div style={{position: 'absolute', top: '0', right: '0', background: 'red', color: 'white', fontWeight: 'bold', padding: '5px 8px', borderBottomLeftRadius: '10px', borderTopRightRadius: '10px'}}>
                    -{sanPham.phanTramGiam}%
                </div>
            )}

            <Link to={`/product/${sanPham.id}`} style={{textDecoration: 'none', color: 'inherit'}}>
                <div style={{width: '100%', height: '150px', overflow: 'hidden', borderRadius: '8px'}}>
                    <img src={sanPham.anh} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                </div>
                
                <h6 style={{margin: '10px 0 5px 0', height: '40px', overflow: 'hidden', lineHeight: '1.3', fontSize: '15px'}}>{sanPham.ten}</h6>
                
                {/* GIÁ TIỀN & ĐƠN VỊ */}
                <div style={{minHeight: '45px'}}>
                    {sanPham.isKhuyenMai && sanPham.giaGoc > sanPham.giaBan ? (
                        <>
                            <div style={{textDecoration: 'line-through', color: '#999', fontSize: '13px'}}>{sanPham.giaGoc?.toLocaleString('ja-JP')} ¥</div>
                            <div style={{color: '#d0021b', fontWeight: 'bold', fontSize: '16px'}}>{sanPham.giaBan?.toLocaleString('ja-JP')} ¥ <span style={{color: '#333', fontSize: '12px', fontWeight: 'normal'}}> / {sanPham.donVi}</span></div>
                        </>
                    ) : (
                        <>
                            <div style={{height: '19px'}}></div> {/* Spacer */}
                            <div style={{color: '#d0021b', fontWeight: 'bold', fontSize: '16px'}}>{sanPham.giaBan?.toLocaleString('ja-JP')} ¥ <span style={{color: '#333', fontSize: '12px', fontWeight: 'normal'}}> / {sanPham.donVi}</span></div>
                        </>
                    )}
                </div>
            </Link>
            
            <button onClick={() => {themVaoGio(sanPham); alert("Đã thêm!")}} style={{width: '100%', background: 'white', border: `1px solid ${colors.primaryGreen}`, color: colors.primaryGreen, padding: '6px', borderRadius: '20px', fontWeight: 'bold', marginTop: '10px', transition: '0.2s'}} onMouseOver={e => {e.target.style.background=colors.primaryGreen; e.target.style.color='white'}} onMouseOut={e => {e.target.style.background='white'; e.target.style.color=colors.primaryGreen}}>
                + Chọn Mua
            </button>
        </div>
    )
}
export default Home