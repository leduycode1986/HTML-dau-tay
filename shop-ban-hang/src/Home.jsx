import React from 'react'
import SanPham from './Product'
import { useState } from 'react'

// 1. NHẬN CÔNG CỤ TỪ SẾP (biến props)
function Home(props) {
  
  // (Đã xóa biến soLuong cũ đi vì không cần nữa)

  const [tuKhoa, setTuKhoa] = useState(""); 

  const database = [
    {
      id: 1,
      ten: "Laptop Gaming",
      gia: "25.000.000 VNĐ",
      anh: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=500&q=60"
    },
    {
      id: 2,
      ten: "Điện thoại iPhone",
      gia: "30.000.000 VNĐ",
      anh: "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=500&q=60"
    },
    {
      id: 3,
      ten: "Áo thun Coder",
      gia: "150.000 VNĐ",
      anh: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=500&q=60"
    },
    {
      id: 4,
      ten: "Bàn phím cơ",
      gia: "500.000 VNĐ",
      anh: "https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=500&q=60"
    },
     {
      id: 5,
      ten: "Tai nghe Bluetooth",
      gia: "600.000 VNĐ",
      anh: "https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=500&q=60"
    }
  ];

  const danhSachLoc = database.filter((item) => 
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
      
      <div className="product-list d-flex flex-wrap justify-content-center">
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