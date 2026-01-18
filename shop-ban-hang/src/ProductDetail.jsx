import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { products } from './products'

function ProductDetail({ themVaoGio, colors }) {
  const { id } = useParams();
  const sanPham = products.find(p => p.id === parseInt(id));

  if (!sanPham) return <h2>Không tìm thấy!</h2>

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div style={{marginBottom: '20px', fontSize: '14px'}}>
            <Link to="/" style={{textDecoration: 'none', color: colors.primaryGreen, fontWeight: 'bold'}}>⬅ Quay lại</Link> 
        </div>

        <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap', backgroundColor: 'white', padding: '30px', borderRadius: '15px', boxShadow: '0 5px 15px rgba(0,0,0,0.05)' }}>
            <div style={{ flex: '1 1 350px' }}>
                <img src={sanPham.anh} alt={sanPham.ten} style={{ width: '100%', borderRadius: '10px' }} />
            </div>

            <div style={{ flex: '1 1 400px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <h1 style={{ color: '#333', marginBottom: '10px', fontWeight: '700' }}>{sanPham.ten}</h1>
                <p style={{ fontSize: '30px', color: colors.priceText, fontWeight: '900', margin: '0 0 20px 0' }}>{sanPham.gia}</p>
                
                <div style={{ backgroundColor: '#fff8e1', padding: '15px', borderRadius: '8px', marginBottom: '25px', border: `1px solid ${colors.accentYellow}` }}>
                    <p style={{margin: '5px 0'}}>🌼 <strong>Tươi ngon:</strong> Cam kết hàng mới.</p>
                    <p style={{margin: '5px 0'}}>⚡ <strong>Giao nhanh:</strong> Trong 2H nội thành.</p>
                </div>

                {/* Nút THÊM VÀO GIỎ màu Vàng */}
                <button 
                    onClick={() => { themVaoGio(sanPham); alert("Đã thêm!"); }}
                    style={{ 
                        padding: '15px', backgroundColor: colors.accentYellow, color: 'black', 
                        border: 'none', borderRadius: '8px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer',
                        boxShadow: '0 4px 0 #e0a800'
                    }}
                >
                    🛒 THÊM VÀO GIỎ NGAY
                </button>
            </div>
        </div>
    </div>
  )
}
export default ProductDetail