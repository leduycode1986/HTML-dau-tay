import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { products } from './products' // Lấy hàng từ kho tổng

function Home({ themVaoGio }) {
  // 1. Biến nhớ xem đang chọn loại nào (Mặc định là 'all' - Tất cả)
  const [phanLoai, setPhanLoai] = useState('all');

  // 2. Bộ lọc thông minh
  // Nếu chọn 'all' thì lấy hết, ngược lại thì lọc ra những món trùng loại
  const sanPhamHienThi = phanLoai === 'all' 
    ? products 
    : products.filter(sp => sp.phanLoai === phanLoai);

  return (
    <div style={{ padding: '20px' }}>
      
      {/* KHU VỰC TÌM KIẾM (Để tạm đây cho đẹp) */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
        <input 
          type="text" 
          placeholder="Bạn muốn tìm gì? (Ví dụ: iPhone)" 
          style={{ padding: '10px', width: '300px', borderRadius: '5px', border: '1px solid #ccc' }} 
        />
      </div>

      {/* --- BỘ LỌC SẢN PHẨM (MỚI) --- */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '30px' }}>
        <button 
            onClick={() => setPhanLoai('all')}
            style={{ 
                padding: '10px 20px', borderRadius: '20px', border: 'none', cursor: 'pointer',
                backgroundColor: phanLoai === 'all' ? '#ff4d4f' : '#eee', // Đổi màu nếu đang chọn
                color: phanLoai === 'all' ? 'white' : 'black',
                fontWeight: 'bold'
            }}>
            Tất Cả
        </button>

        <button 
            onClick={() => setPhanLoai('dientu')}
            style={{ 
                padding: '10px 20px', borderRadius: '20px', border: 'none', cursor: 'pointer',
                backgroundColor: phanLoai === 'dientu' ? '#ff4d4f' : '#eee',
                color: phanLoai === 'dientu' ? 'white' : 'black',
                fontWeight: 'bold'
            }}>
            💻 Đồ Điện Tử
        </button>

        <button 
            onClick={() => setPhanLoai('thoitrang')}
            style={{ 
                padding: '10px 20px', borderRadius: '20px', border: 'none', cursor: 'pointer',
                backgroundColor: phanLoai === 'thoitrang' ? '#ff4d4f' : '#eee',
                color: phanLoai === 'thoitrang' ? 'white' : 'black',
                fontWeight: 'bold'
            }}>
            👕 Thời Trang
        </button>

        <button 
            onClick={() => setPhanLoai('phukien')}
            style={{ 
                padding: '10px 20px', borderRadius: '20px', border: 'none', cursor: 'pointer',
                backgroundColor: phanLoai === 'phukien' ? '#ff4d4f' : '#eee',
                color: phanLoai === 'phukien' ? 'white' : 'black',
                fontWeight: 'bold'
            }}>
            🎧 Phụ Kiện
        </button>
      </div>

      {/* DANH SÁCH SẢN PHẨM (Đã được lọc) */}
      <div style={{ width: '100%', display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-start', gap: '20px' }}>
        {sanPhamHienThi.map((sanPham) => (
          <div key={sanPham.id} style={{ 
              border: '1px solid #ddd', borderRadius: '10px', padding: '15px', width: '250px', 
              boxShadow: '0 4px 8px rgba(0,0,0,0.1)', backgroundColor: 'white' 
            }}>
            
            <Link to={`/product/${sanPham.id}`}>
               <img 
                  src={sanPham.anh} 
                  alt={sanPham.ten} 
                  style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px' }} 
               />
            </Link>

            <h3 style={{ fontSize: '18px', margin: '10px 0' }}>{sanPham.ten}</h3>
            <p style={{ color: '#555' }}>Giá: {sanPham.gia}</p>
            
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button 
                  onClick={() => {
                      themVaoGio(sanPham);
                      alert("Đã thêm vào giỏ!");
                  }}
                  style={{ backgroundColor: '#f5f5f5', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
                  Mua Hàng
              </button>
              
              <span style={{ fontSize: '20px', cursor: 'pointer' }}>♡</span>
            </div>
          </div>
        ))}

        {/* Thông báo nếu không có hàng nào */}
        {sanPhamHienThi.length === 0 && (
            <p style={{width: '100%', textAlign: 'center', fontSize: '18px', color: 'gray'}}>
                Chưa có sản phẩm nào thuộc mục này!
            </p>
        )}
      </div>
    </div>
  )
}

export default Home