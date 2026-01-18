import React from 'react'
import { useParams } from 'react-router-dom'
import { products } from './products' // Nhập kho hàng từ database.js

function ProductDetail({ themVaoGio }) {  // <-- Thêm chữ này vào giữa 2 ngoặc tròn
  const { id } = useParams();
 
  // --- BƯỚC 2: TRA CỨU SẢN PHẨM ---
  // Tìm xem món nào trong kho có id trùng với id trên link
  const sanPham = products.find(item => item.id == id);
  // Nếu khách gõ link bậy bạ (ví dụ /product/999) thì báo lỗi
  if (!sanPham) {
    return <h2 style={{textAlign: 'center', marginTop: '50px'}}>❌ Không tìm thấy sản phẩm này!</h2>
  }

  // --- BƯỚC 3: HIỂN THỊ RA MÀN HÌNH ---
  return (
    <div style={{ padding: '50px', display: 'flex', justifyContent: 'center', gap: '50px', flexWrap: 'wrap' }}>
      {/* Cột Trái: Ảnh sản phẩm to đẹp */}
      <div>
        <img 
          src={sanPham.anh} 
          alt={sanPham.ten} 
          style={{ width: '400px', height: 'auto', borderRadius: '20px', boxShadow: '0 0 15px rgba(0,0,0,0.2)' }} 
        />
      </div>

      {/* Cột Phải: Thông tin chi tiết */}
      <div style={{ maxWidth: '500px' }}>
        <h1 style={{ fontSize: '30px', marginBottom: '10px' }}>{sanPham.ten}</h1>
        <h2 style={{ color: 'red', fontSize: '35px', fontWeight: 'bold' }}>{sanPham.gia}</h2>
        
        <p style={{ fontSize: '18px', color: '#555', lineHeight: '1.6', marginTop: '20px' }}>
          Mô tả: Đây là sản phẩm <b>{sanPham.ten}</b> chính hãng, bảo hành 12 tháng. 
          Thiết kế hiện đại, hiệu năng mạnh mẽ, phù hợp cho mọi nhu cầu sử dụng của bạn.
        </p>

        <button 
          onClick={() => {
            themVaoGio(sanPham); // 1. Gọi hàm thêm vào giỏ
            alert("Đã thêm " + sanPham.ten + " vào giỏ hàng!"); // 2. Báo thông báo cho sướng tay
       }}  
          style={{backgroundColor: '#ff4d4f', color: 'white', padding: '15px 40px', 
          fontSize: '20px', border: 'none', borderRadius: '8px', marginTop: '30px', cursor: 'pointer' 
        }}>
          🛒 Đặt Mua Ngay
        </button>
      </div>  
    </div>
  )
}

export default ProductDetail