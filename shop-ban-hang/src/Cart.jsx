import React, { useState } from 'react'

function Cart({ gioHang, chinhSuaSoLuong, xoaSanPham, xoaHetGioHang, colors }) { 
  const tongTien = gioHang.reduce((total, item) => {
    const giaTien = parseInt(item.gia.replace(/\./g, '').replace(' VNĐ', '')); 
    return total + (giaTien * item.soLuong);
  }, 0);

  const [thongTin, setThongTin] = useState({ hoten: '', sdt: '', diachi: '' });

  function xuLyThanhToan() {
      if (thongTin.hoten === '' || thongTin.sdt === '' || thongTin.diachi === '') {
          alert("Vui lòng điền đầy đủ thông tin giao hàng! 📝");
          return;
      }
      alert(`🎉 Cảm ơn anh/chị ${thongTin.hoten} đã đặt hàng tại MaiVang!\n💰 Tổng tiền: ${tongTien.toLocaleString()} VNĐ\n🚚 Đơn hàng sẽ được giao tới: ${thongTin.diachi}`);
      xoaHetGioHang();
  }

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      <h2 style={{textAlign: 'center', marginBottom: '35px', color: colors.primaryGreen, textTransform: 'uppercase', fontWeight: '800', letterSpacing: '1px'}}>
        🛒 Giỏ hàng của bạn
      </h2>
      
      {gioHang.length === 0 ? (
        <div style={{textAlign: 'center', marginTop: '40px', backgroundColor: 'white', padding: '50px', borderRadius: '15px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)'}}>
           <span style={{fontSize: '60px', display: 'block', marginBottom: '20px'}}>🥬🛒</span>
           <h3 style={{color: colors.textDark, marginBottom: '15px'}}>Giỏ hàng đang trống!</h3>
           <p style={{color: '#777'}}>Hãy quay lại trang chủ để chọn thêm thực phẩm tươi ngon nhé.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
          
          {/* DANH SÁCH HÀNG */}
          <div style={{ flex: '2 1 500px', backgroundColor: 'white', padding: '25px', borderRadius: '15px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
            {gioHang.map((item, index) => (
                <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: index === gioHang.length - 1 ? 'none' : '1px solid #eee', padding: '20px 0' }}>
                    <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                        <img src={item.anh} alt={item.ten} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', border: `1px solid ${colors.bgLight}` }} />
                        <div>
                            <h5 style={{margin: '0 0 8px 0', fontSize: '17px', fontWeight: '600', color: colors.textDark}}>{item.ten}</h5>
                            <small style={{ color: colors.primaryGreen, fontWeight: 'bold', fontSize: '16px' }}>{item.gia}</small>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {/* Nút tăng giảm số lượng viền xanh */}
                        <button onClick={() => chinhSuaSoLuong(item.id, 'giam')} style={{width: '32px', height: '32px', borderRadius: '50%', border: `2px solid ${colors.primaryGreen}`, background: 'white', color: colors.primaryGreen, cursor: 'pointer', fontWeight: 'bold', fontSize: '16px'}}>-</button>
                        <span style={{fontWeight: 'bold', fontSize: '16px', minWidth: '25px', textAlign: 'center'}}>{item.soLuong}</span>
                        <button onClick={() => chinhSuaSoLuong(item.id, 'tang')} style={{width: '32px', height: '32px', borderRadius: '50%', border: `2px solid ${colors.primaryGreen}`, background: 'white', color: colors.primaryGreen, cursor: 'pointer', fontWeight: 'bold', fontSize: '16px'}}>+</button>
                        
                        {/* Nút xóa màu đỏ */}
                        <button onClick={() => xoaSanPham(item.id)} style={{ marginLeft: '20px', color: '#dc3545', border: 'none', background: 'none', cursor: 'pointer', fontSize: '20px' }} title="Xóa sản phẩm">🗑️</button>
                    </div>
                </div>
            ))}
            
            <div style={{ textAlign: 'right', marginTop: '25px', paddingTop: '20px', borderTop: '2px dashed #eee' }}>
                <span style={{ fontSize: '18px', color: colors.textDark }}>Tổng cộng: </span>
                {/* Tổng tiền màu Vàng Điểm Nhấn */}
                <span style={{ color: colors.accentGold, fontSize: '32px', fontWeight: '900', marginLeft: '10px' }}>{tongTien.toLocaleString()} VNĐ</span>
            </div>
          </div>

          {/* FORM THÔNG TIN */}
          {/* Nền form màu Xanh Nhạt */}
          <div style={{ flex: '1 1 350px', padding: '30px', borderRadius: '15px', backgroundColor: colors.bgLight, border: `2px solid ${colors.primaryGreen}30` }}>
            <h4 style={{marginTop: 0, color: colors.primaryGreen, marginBottom: '25px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '10px'}}>
                <span>🚚</span> Thông tin giao hàng
            </h4>
            
            <div style={{ marginBottom: '20px' }}>
                <input 
                    type="text" placeholder="Họ và tên người nhận *"
                    style={{ width: '100%', padding: '14px', borderRadius: '8px', border: '1px solid #ccc', outline: 'none', transition: 'border 0.2s' }}
                    onFocus={(e) => e.target.style.border = `2px solid ${colors.primaryGreen}`}
                    onBlur={(e) => e.target.style.border = '1px solid #ccc'}
                    value={thongTin.hoten}
                    onChange={(e) => setThongTin({ ...thongTin, hoten: e.target.value })} 
                />
            </div>
            
            <div style={{ marginBottom: '20px' }}>
                <input 
                    type="text" placeholder="Số điện thoại liên hệ *"
                    style={{ width: '100%', padding: '14px', borderRadius: '8px', border: '1px solid #ccc', outline: 'none', transition: 'border 0.2s' }}
                    onFocus={(e) => e.target.style.border = `2px solid ${colors.primaryGreen}`}
                    onBlur={(e) => e.target.style.border = '1px solid #ccc'}
                    value={thongTin.sdt}
                    onChange={(e) => setThongTin({ ...thongTin, sdt: e.target.value })} 
                />
            </div>

            <div style={{ marginBottom: '30px' }}>
                <textarea 
                    rows="3" placeholder="Địa chỉ nhận hàng chi tiết *"
                    style={{ width: '100%', padding: '14px', borderRadius: '8px', border: '1px solid #ccc', outline: 'none', transition: 'border 0.2s', resize: 'none' }}
                    onFocus={(e) => e.target.style.border = `2px solid ${colors.primaryGreen}`}
                    onBlur={(e) => e.target.style.border = '1px solid #ccc'}
                    value={thongTin.diachi}
                    onChange={(e) => setThongTin({ ...thongTin, diachi: e.target.value })} 
                ></textarea>
            </div>

            <button 
                onClick={xuLyThanhToan}
                // Nút Đặt hàng màu Xanh Chủ Đạo
                style={{ width: '100%', background: colors.primaryGreen, color: 'white', padding: '16px', fontSize: '18px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', textTransform: 'uppercase', boxShadow: '0 4px 10px rgba(0, 166, 81, 0.3)', transition: 'background-color 0.2s' }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#008f45'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = colors.primaryGreen}
            >
                ĐẶT HÀNG NGAY
            </button>
          </div>

        </div>
      )}
    </div>
  )
}
export default Cart