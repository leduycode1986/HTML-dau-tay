import React from 'react'

// 1. Nhận đủ 3 công cụ từ App gửi sang
function Cart({ gioHang, chinhSuaSoLuong, xoaSanPham }) { 

  // 2. Tính tổng tiền (Có nhân với số lượng)
  const tongTien = gioHang.reduce((total, item) => {
    // Chuyển đổi giá từ chuỗi "20.000.000 VNĐ" thành số 20000000
    const giaTien = parseInt(item.gia.replace(/\./g, '').replace(' VNĐ', '')); 
    return total + (giaTien * item.soLuong);
  }, 0);

  return (
    <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
      <h1 style={{textAlign: 'center', marginBottom: '30px'}}>🛒 Giỏ hàng của bạn</h1>
      
      {gioHang.length === 0 ? (
        <div style={{textAlign: 'center', marginTop: '50px'}}>
           <h3>Giỏ hàng đang trống trơn! 😭</h3>
           <p>Hãy quay lại trang chủ để sắm đồ nhé.</p>
        </div>
      ) : (
        <div>
          {/* Danh sách sản phẩm */}
          {gioHang.map((item, index) => (
            <div key={index} style={{ 
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                borderBottom: '1px solid #eee', padding: '20px 0' 
              }}>
              
              {/* Cột 1: Ảnh và Tên */}
              <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flex: 2 }}>
                <img src={item.anh} alt={item.ten} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '10px' }} />
                <div>
                  <h4 style={{margin: 0}}>{item.ten}</h4>
                  <p style={{ color: 'red', margin: '5px 0' }}>{item.gia}</p>
                </div>
              </div>

              {/* Cột 2: Bộ điều chỉnh số lượng (+ -) */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, justifyContent: 'center' }}>
                <button 
                  onClick={() => chinhSuaSoLuong(item.id, 'giam')}
                  style={{ width: '30px', height: '30px', cursor: 'pointer' }}
                >-</button>
                
                <span style={{ fontWeight: 'bold', fontSize: '18px' }}>{item.soLuong}</span>
                
                <button 
                  onClick={() => chinhSuaSoLuong(item.id, 'tang')}
                  style={{ width: '30px', height: '30px', cursor: 'pointer' }}
                >+</button>
              </div>

              {/* Cột 3: Nút Xóa */}
              <div style={{ flex: 1, textAlign: 'right' }}>
                <button 
                  onClick={() => {
                      if(window.confirm("Bạn có chắc muốn xóa món này không?")) {
                          xoaSanPham(item.id)
                      }
                  }}
                  style={{ background: '#ff4d4f', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer' }}>
                  Xóa
                </button>
              </div>
            </div>
          ))}

          {/* Tổng tiền và nút Thanh toán */}
          <div style={{ marginTop: '30px', textAlign: 'right', borderTop: '2px solid #333', paddingTop: '20px' }}>
            <h2>Tổng thanh toán: <span style={{ color: '#d63031' }}>{tongTien.toLocaleString()} VNĐ</span></h2>
            <button style={{ 
              background: '#00b894', color: 'white', padding: '15px 40px', 
              fontSize: '20px', border: 'none', borderRadius: '8px', marginTop: '15px', cursor: 'pointer', fontWeight: 'bold'
            }} onClick={() => alert("Chức năng thanh toán đang bảo trì (Hết tiền)!")}>
              Tiến hành Thanh Toán
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Cart