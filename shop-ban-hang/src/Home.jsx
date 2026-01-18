import React from 'react'
import SanPham from './Product'
import { useState } from 'react'
import { products } from './products' // Giờ ta nhập kho hàng từ file database.js

// 1. NHẬN CÔNG CỤ TỪ SẾP (biến props)
function Home(props) {
  
  // (Đã xóa biến soLuong cũ đi vì không cần nữa)

  const [tuKhoa, setTuKhoa] = useState(""); 


  const danhSachLoc = products.filter((item) => 
    item.ten.toLowerCase().includes(tuKhoa.toLowerCase())
  );

  return (
    <div>
       {/* Giữ lại ô tìm kiếm */}
       <div style={{marginBottom: '20px', textAlign: 'center'}}>
          <input 
            type="text" 
            placeholder="Bạn muốn tìm gì? (Ví dụ: iPhone)" 
            style={{ padding: '10px', width: '300px', borderRadius: '5px', border: '1px solid #ccc' }}
            onChange={(e) => setTuKhoa(e.target.value)}
          />
       </div>
        <div style={{ width: '100%', display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-start', gap: '20px' }}>
        {danhSachLoc.map((item) => (
          <SanPham
            key={item.id}
            id={item.id}
            ten={item.ten}
            gia={item.gia}
            anh={item.anh}
            // 2. DÙNG CÔNG CỤ CỦA SẾP ĐƯA CHO (props.muaHang)
            muaHang={() => props.themVaoGio(item)}
          />
        ))}
      </div>
    </div>
  )
}

export default Home