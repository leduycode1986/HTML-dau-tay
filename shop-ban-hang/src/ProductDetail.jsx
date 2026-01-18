import React, { useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'

// Nhận dsSanPham từ App truyền xuống để dữ liệu luôn mới nhất
function ProductDetail({ dsSanPham, themVaoGio, colors }) {
  const { id } = useParams();
  
  // Tìm sản phẩm trong danh sách (lưu ý chuyển id sang số)
  const sanPham = dsSanPham.find(p => p.id === parseInt(id));

  // Khi chuyển trang, tự động cuộn lên đầu
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (!sanPham) {
    return (
        <div style={{textAlign: 'center', padding: '50px'}}>
            <h2>😢 Không tìm thấy sản phẩm này!</h2>
            <Link to="/" style={{color: colors.primaryGreen}}>Quay về trang chủ</Link>
        </div>
    )
  }

  // Lọc các sản phẩm liên quan (Cùng loại nhưng khác ID hiện tại)
  const sanPhamLienQuan = dsSanPham
    .filter(sp => sp.phanLoai === sanPham.phanLoai && sp.id !== sanPham.id)
    .slice(0, 4); // Chỉ lấy tối đa 4 món

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', paddingBottom: '50px' }}>
        
        {/* 1. ĐƯỜNG DẪN (Breadcrumb) */}
        <div style={{ margin: '20px 0', fontSize: '14px', color: '#666' }}>
            <Link to="/" style={{textDecoration: 'none', color: colors.primaryGreen, fontWeight: 'bold'}}>Trang chủ</Link> 
            {' / '} 
            <span style={{textTransform: 'capitalize'}}>{sanPham.phanLoai === 'thitca' ? 'Thịt Cá' : sanPham.phanLoai}</span>
            {' / '}
            <span style={{color: '#333'}}>{sanPham.ten}</span>
        </div>

        {/* 2. KHUNG THÔNG TIN CHI TIẾT */}
        <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap', backgroundColor: 'white', padding: '30px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
            
            {/* CỘT TRÁI: ẢNH SẢN PHẨM */}
            <div style={{ flex: '1 1 400px', position: 'relative' }}>
                <div style={{ border: '1px solid #eee', borderRadius: '12px', overflow: 'hidden', padding: '10px' }}>
                    <img 
                        src={sanPham.anh} 
                        alt={sanPham.ten} 
                        style={{ width: '100%', height: 'auto', objectFit: 'contain', display: 'block' }} 
                    />
                </div>
                {/* Hiển thị nhãn dán nếu có */}
                <div style={{position: 'absolute', top: '20px', left: '20px', display: 'flex', flexDirection: 'column', gap: '5px'}}>
                    {sanPham.isKhuyenMai && <span style={{background: '#dc3545', color: 'white', padding: '5px 10px', borderRadius: '5px', fontWeight: 'bold', fontSize: '12px'}}>🔥 Giảm sốc</span>}
                    {sanPham.isBanChay && <span style={{background: '#ffc107', color: 'black', padding: '5px 10px', borderRadius: '5px', fontWeight: 'bold', fontSize: '12px'}}>💎 Bán chạy</span>}
                    {sanPham.isMoi && <span style={{background: '#198754', color: 'white', padding: '5px 10px', borderRadius: '5px', fontWeight: 'bold', fontSize: '12px'}}>🆕 Mới về</span>}
                </div>
            </div>

            {/* CỘT PHẢI: THÔNG TIN & MUA HÀNG */}
            <div style={{ flex: '1 1 400px' }}>
                <h1 style={{ color: '#333', marginBottom: '15px', fontWeight: '800', fontSize: '28px' }}>{sanPham.ten}</h1>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                    <span style={{ fontSize: '32px', color: '#ff8f00', fontWeight: '900' }}>{sanPham.gia}</span>
                    <span style={{ backgroundColor: '#e8f5e9', color: colors.primaryGreen, padding: '5px 10px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold' }}>Còn hàng</span>
                </div>
                
                {/* Box Chính sách chất lượng */}
                <div style={{ backgroundColor: '#fffbf0', border: `1px dashed ${colors.accentYellow}`, padding: '20px', borderRadius: '10px', marginBottom: '30px' }}>
                    <h5 style={{fontWeight: 'bold', fontSize: '16px', marginBottom: '10px'}}>✅ Tại sao chọn Mai Vàng?</h5>
                    <ul style={{ margin: 0, paddingLeft: '20px', color: '#555', lineHeight: '1.8' }}>
                        <li>Nguồn gốc xuất xứ rõ ràng, an toàn vệ sinh.</li>
                        <li>Đổi trả miễn phí trong 24h nếu không hài lòng.</li>
                        <li>Giao hàng siêu tốc 2H (Nội thành TP.HCM).</li>
                        <li>Tích điểm thành viên cho mọi đơn hàng.</li>
                    </ul>
                </div>

                {/* NÚT MUA HÀNG TO - NỔI BẬT */}
                <button 
                    onClick={() => {
                        themVaoGio(sanPham);
                        alert(`Đã thêm ${sanPham.ten} vào giỏ! 🛒`);
                    }}
                    style={{ 
                        width: '100%',
                        padding: '18px', 
                        backgroundColor: colors.accentYellow, 
                        color: 'black', 
                        border: 'none', 
                        borderRadius: '8px', 
                        fontSize: '20px', 
                        fontWeight: 'bold', 
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '12px',
                        boxShadow: '0 4px 0 #d39e00',
                        transition: 'transform 0.1s'
                    }}
                    onMouseDown={e => {e.currentTarget.style.transform = 'translateY(4px)'; e.currentTarget.style.boxShadow = 'none'}}
                    onMouseUp={e => {e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 0 #d39e00'}}
                >
                    <span style={{ fontSize: '1.2em' }}>🛒</span> THÊM VÀO GIỎ NGAY
                </button>
                <p style={{textAlign: 'center', marginTop: '10px', fontSize: '13px', color: '#777'}}>Gọi đặt mua: 1800.1234 (7:30 - 22:00)</p>
            </div>
        </div>

        {/* 3. SẢN PHẨM LIÊN QUAN */}
        {sanPhamLienQuan.length > 0 && (
            <div style={{ marginTop: '50px' }}>
                <h3 style={{ 
                    borderLeft: `5px solid ${colors.primaryGreen}`, 
                    paddingLeft: '15px', 
                    marginBottom: '25px', 
                    color: colors.primaryGreen, 
                    fontWeight: 'bold' 
                }}>
                    SẢN PHẨM CÙNG LOẠI
                </h3>
                
                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                    {sanPhamLienQuan.map(sp => (
                        <div key={sp.id} style={{ 
                            width: '230px', backgroundColor: 'white', padding: '15px', borderRadius: '10px', 
                            border: '1px solid #eee', boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
                        }}>
                             <Link to={`/product/${sp.id}`} style={{textDecoration: 'none', color: 'inherit'}}>
                                <div style={{height: '150px', overflow: 'hidden', borderRadius: '5px', marginBottom: '10px'}}>
                                    <img src={sp.anh} alt={sp.ten} style={{width: '100%', height: '100%', objectFit: 'cover'}}/>
                                </div>
                                <h4 style={{fontSize: '15px', margin: '0 0 5px', height: '40px', overflow: 'hidden'}}>{sp.ten}</h4>
                                <p style={{color: '#ff8f00', fontWeight: 'bold'}}>{sp.gia}</p>
                             </Link>
                             <button 
                                onClick={() => themVaoGio(sp)}
                                style={{width: '100%', padding: '8px', background: colors.primaryGreen, color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold'}}
                             >Chọn Mua</button>
                        </div>
                    ))}
                </div>
            </div>
        )}
    </div>
  )
}

export default ProductDetail