import React, { useState } from 'react' // Nhập thêm useState để lưu tên khách

function Cart({ gioHang, chinhSuaSoLuong, xoaSanPham, xoaHetGioHang }) { 
  const tongTien = gioHang.reduce((total, item) => {
    const giaTien = parseInt(item.gia.replace(/\./g, '').replace(' VNĐ', '')); 
    return total + (giaTien * item.soLuong);
  }, 0);

  // Lưu thông tin khách hàng nhập vào
  const [thongTin, setThongTin] = useState({ hoten: '', sdt: '', diachi: '' });

  function xuLyThanhToan() {
      if (thongTin.hoten === '' || thongTin.sdt === '' || thongTin.diachi === '') {
          alert("Vui lòng điền đầy đủ thông tin giao hàng!");
          return;
      }
      // Chốt đơn!
      alert(`Cảm ơn anh/chị ${thongTin.hoten} đã đặt hàng!\nTổng tiền: ${tongTien.toLocaleString()} VNĐ\nChúng tôi sẽ ship tới: ${thongTin.diachi}`);
      xoaHetGioHang(); // Xóa sạch giỏ
  }

  return (
    <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
      <h1 style={{textAlign: 'center', marginBottom: '30px'}}>🛒 Giỏ hàng của bạn</h1>
      
      {gioHang.length === 0 ? (
        <div style={{textAlign: 'center', marginTop: '50px'}}>
           <h3>Giỏ hàng đang trống! 😭</h3>
           <p>Bạn đã mua hết tiền hoặc chưa chọn gì cả.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
          
          {/* CỘT TRÁI: DANH SÁCH HÀNG (Chiếm 60%) */}
          <div style={{ flex: 2, minWidth: '300px' }}>
            {gioHang.map((item, index) => (
                <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', padding: '15px 0' }}>
                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                        <img src={item.anh} alt={item.ten} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '5px' }} />
                        <div>
                            <h5 style={{margin: 0}}>{item.ten}</h5>
                            <small style={{ color: 'red' }}>{item.gia}</small>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <button onClick={() => chinhSuaSoLuong(item.id, 'giam')}>-</button>
                        <span>{item.soLuong}</span>
                        <button onClick={() => chinhSuaSoLuong(item.id, 'tang')}>+</button>
                        <button onClick={() => xoaSanPham(item.id)} style={{ marginLeft: '10px', color: 'red', border: 'none', background: 'none', cursor: 'pointer' }}>X</button>
                    </div>
                </div>
            ))}
            <h3 style={{ textAlign: 'right', marginTop: '20px', color: '#d63031' }}>Tổng: {tongTien.toLocaleString()} VNĐ</h3>
          </div>

          {/* CỘT PHẢI: FORM ĐIỀN THÔNG TIN (Chiếm 40%) */}
          <div style={{ flex: 1, border: '1px solid #ddd', padding: '20px', borderRadius: '10px', height: 'fit-content', backgroundColor: '#f9f9f9' }}>
            <h3 style={{marginTop: 0}}>🚚 Thông tin giao hàng</h3>
            
            <div style={{ marginBottom: '15px' }}>
                <label>Họ và tên:</label>
                <input 
                    type="text" 
                    style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                    value={thongTin.hoten}
                    onChange={(e) => setThongTin({ ...thongTin, hoten: e.target.value })} 
                />
            </div>
            
            <div style={{ marginBottom: '15px' }}>
                <label>Số điện thoại:</label>
                <input 
                    type="text" 
                    style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                    value={thongTin.sdt}
                    onChange={(e) => setThongTin({ ...thongTin, sdt: e.target.value })} 
                />
            </div>

            <div style={{ marginBottom: '20px' }}>
                <label>Địa chỉ nhận hàng:</label>
                <textarea 
                    rows="3"
                    style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                    value={thongTin.diachi}
                    onChange={(e) => setThongTin({ ...thongTin, diachi: e.target.value })} 
                ></textarea>
            </div>

            <button 
                onClick={xuLyThanhToan}
                style={{ width: '100%', background: '#ff4d4f', color: 'white', padding: '15px', fontSize: '18px', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
                ĐẶT HÀNG NGAY
            </button>
          </div>

        </div>
      )}
    </div>
  )
}
export default Cart