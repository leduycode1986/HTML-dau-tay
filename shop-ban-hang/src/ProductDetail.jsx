import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { products } from './products'

function ProductDetail({ themVaoGio, colors }) {
  const { id } = useParams();
  const sanPham = products.find(p => p.id === parseInt(id));

  if (!sanPham) {
    return <h2 style={{textAlign: 'center', marginTop: '50px', color: colors.textDark}}>Không tìm thấy sản phẩm! 🍎</h2>
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        {/* Đường dẫn (Breadcrumb) màu Xanh Chủ Đạo */}
        <div style={{marginBottom: '20px', color: '#666', fontSize: '14px'}}>
            <Link to="/" style={{textDecoration: 'none', color: colors.primaryGreen, fontWeight: '600'}}>Trang chủ</Link> 
            {' > '} 
            <span style={{color: colors.textDark}}>{sanPham.ten}</span>
        </div>

        <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap', backgroundColor: 'white', padding: '30px', borderRadius: '15px', boxShadow: '0 5px 15px rgba(0,0,0,0.05)' }}>
            
            {/* Ảnh sản phẩm */}
            <div style={{ flex: '1 1 400px' }}>
                <img 
                    src={sanPham.anh} 
                    alt={sanPham.ten} 
                    style={{ width: '100%', borderRadius: '12px', border: `1px solid ${colors.bgLight}` }} 
                />
            </div>

            {/* Thông tin */}
            <div style={{ flex: '1 1 400px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <h1 style={{ color: colors.textDark, marginBottom: '15px', fontWeight: '700' }}>{sanPham.ten}</h1>
                {/* Giá tiền màu Xanh Chủ Đạo */}
                <p style={{ fontSize: '32px', color: colors.primaryGreen, fontWeight: '800', margin: '0 0 25px 0' }}>
                    {sanPham.gia}
                </p>
                
                <div style={{ lineHeight: '1.8', color: '#555', marginBottom: '30px', backgroundColor: colors.bgLight, padding: '20px', borderRadius: '10px' }}>
                    <p style={{margin: '5px 0'}}>✅ <strong>Tươi ngon:</strong> Nhập mới mỗi ngày.</p>
                    <p style={{margin: '5px 0'}}>✅ <strong>An toàn:</strong> Nguồn gốc xuất xứ rõ ràng.</p>
                    <p style={{margin: '5px 0'}}>✅ <strong>Giao nhanh:</strong> Nhận hàng trong 2H.</p>
                </div>

                <button 
                    onClick={() => {
                        themVaoGio(sanPham);
                        alert(`Đã thêm ${sanPham.ten} vào giỏ! 🛒`);
                    }}
                    // Nút Thêm vào giỏ màu Xanh Chủ Đạo
                    style={{ 
                        padding: '18px 30px', 
                        backgroundColor: colors.primaryGreen, 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '8px', 
                        fontSize: '18px', 
                        fontWeight: 'bold', 
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '12px',
                        boxShadow: '0 4px 6px rgba(0, 166, 81, 0.3)',
                        transition: 'background-color 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#008f45'} // Màu xanh đậm hơn khi hover
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = colors.primaryGreen}
                >
                    <span style={{ fontSize: '1.3em' }}>🛒</span> THÊM VÀO GIỎ NGAY
                </button>
            </div>
        </div>
    </div>
  )
}

export default ProductDetail