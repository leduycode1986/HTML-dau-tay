import React, { useState } from 'react'

function Cart({ gioHang, chinhSuaSoLuong, xoaSanPham, xoaHetGioHang, colors }) { 
  const tongTien = gioHang.reduce((total, item) => {
    const giaTien = parseInt(item.gia.replace(/\./g, '').replace(' VNĐ', '')); 
    return total + (giaTien * item.soLuong);
  }, 0);
  const [thongTin, setThongTin] = useState({ hoten: '', sdt: '', diachi: '' });

  function xuLyThanhToan() {
      if (!thongTin.hoten || !thongTin.sdt || !thongTin.diachi) { alert("Thiếu thông tin!"); return; }
      alert(`Đơn hàng của ${thongTin.hoten} trị giá ${tongTien.toLocaleString()} VNĐ đã được ghi nhận!`);
      xoaHetGioHang();
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <h2 style={{textAlign: 'center', marginBottom: '30px', color: colors.primaryGreen, fontWeight: '800'}}>GIỎ HÀNG CỦA BẠN</h2>
      
      {gioHang.length === 0 ? <p style={{textAlign: 'center'}}>Giỏ hàng trống trơn! 😅</p> : (
        <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
          
          <div style={{ flex: '2 1 500px', backgroundColor: 'white', padding: '20px', borderRadius: '10px' }}>
            {gioHang.map((item, index) => (
                <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', padding: '15px 0' }}>
                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                        <img src={item.anh} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '5px' }} />
                        <div><h5 style={{margin: 0, fontSize: '16px'}}>{item.ten}</h5><small style={{color: colors.priceText, fontWeight: 'bold'}}>{item.gia}</small></div>
                    </div>
                    <div>
                        <button onClick={() => chinhSuaSoLuong(item.id, 'giam')}>-</button> 
                        <span style={{margin: '0 10px'}}>{item.soLuong}</span> 
                        <button onClick={() => chinhSuaSoLuong(item.id, 'tang')}>+</button>
                        <button onClick={() => xoaSanPham(item.id)} style={{marginLeft: '10px', color: 'red', border: 'none', background: 'none'}}>🗑</button>
                    </div>
                </div>
            ))}
            <h3 style={{ textAlign: 'right', marginTop: '20px', color: colors.priceText }}>Tổng: {tongTien.toLocaleString()} VNĐ</h3>
          </div>

          <div style={{ flex: '1 1 300px', padding: '20px', backgroundColor: 'white', borderRadius: '10px', border: `2px solid ${colors.accentYellow}` }}>
            <h4 style={{marginTop: 0, color: colors.primaryGreen}}>Thông tin</h4>
            <input placeholder="Họ tên" style={{width: '100%', padding: '10px', marginBottom: '10px'}} value={thongTin.hoten} onChange={e => setThongTin({...thongTin, hoten: e.target.value})} />
            <input placeholder="Số điện thoại" style={{width: '100%', padding: '10px', marginBottom: '10px'}} value={thongTin.sdt} onChange={e => setThongTin({...thongTin, sdt: e.target.value})} />
            <textarea placeholder="Địa chỉ" style={{width: '100%', padding: '10px', marginBottom: '20px'}} value={thongTin.diachi} onChange={e => setThongTin({...thongTin, diachi: e.target.value})} />
            
            {/* NÚT THANH TOÁN MÀU VÀNG */}
            <button onClick={xuLyThanhToan} style={{ width: '100%', background: colors.accentYellow, color: 'black', padding: '15px', border: 'none', borderRadius: '5px', fontWeight: 'bold', boxShadow: '0 4px 0 #e0a800', cursor: 'pointer' }}>ĐẶT HÀNG NGAY</button>
          </div>
        </div>
      )}
    </div>
  )
}
export default Cart