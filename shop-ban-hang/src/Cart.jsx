import React, { useState } from 'react'

function Cart({ gioHang, chinhSuaSoLuong, xoaSanPham, xoaHetGioHang, colors }) { 
  // Tính tổng tiền
  const tongTien = gioHang.reduce((total, item) => {
    const giaTien = parseInt(item.gia.replace(/\./g, '').replace(' VNĐ', '')); 
    return total + (giaTien * item.soLuong);
  }, 0);

  // Thêm các trường thông tin mới: Email, Ghi chú, Phương thức thanh toán
  const [thongTin, setThongTin] = useState({ 
      hoten: '', 
      sdt: '', 
      email: '', 
      diachi: '', 
      ghichu: '',
      phuongThuc: 'cod' // Mặc định là COD (Thanh toán khi nhận hàng)
  });

  function xuLyThanhToan() {
      // Kiểm tra dữ liệu bắt buộc
      if (!thongTin.hoten || !thongTin.sdt || !thongTin.diachi) { 
          alert("Vui lòng điền đầy đủ: Họ tên, SĐT và Địa chỉ nhận hàng! 📝"); 
          return; 
      }
      
      const kieuThanhToan = thongTin.phuongThuc === 'cod' ? 'Thanh toán khi nhận hàng' : 'Chuyển khoản ngân hàng';
      
      alert(
          `🎉 ĐẶT HÀNG THÀNH CÔNG!\n` +
          `--------------------------------\n` +
          `👤 Khách hàng: ${thongTin.hoten}\n` +
          `📞 SĐT: ${thongTin.sdt}\n` +
          `💰 Tổng tiền: ${tongTien.toLocaleString()} VNĐ\n` +
          `💳 Hình thức: ${kieuThanhToan}\n` +
          `📝 Ghi chú: ${thongTin.ghichu || 'Không có'}\n` +
          `--------------------------------\n` +
          `Cảm ơn bạn đã tin tưởng Thực phẩm Mai Vàng!`
      );
      xoaHetGioHang();
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '50px' }}>
      
      {/* 1. TIÊU ĐỀ TRANG */}
      <h2 style={{
          textAlign: 'center', margin: '30px 0', 
          color: colors.primaryGreen, fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px',
          borderBottom: `3px solid ${colors.accentYellow}`, display: 'inline-block', paddingBottom: '5px',
          position: 'relative', left: '50%', transform: 'translateX(-50%)'
      }}>
        🛒 Giỏ hàng & Thanh toán
      </h2>
      
      {gioHang.length === 0 ? (
        <div style={{textAlign: 'center', marginTop: '40px', backgroundColor: 'white', padding: '50px', borderRadius: '15px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)'}}>
           <span style={{fontSize: '60px', display: 'block', marginBottom: '20px'}}>🥬🧐</span>
           <h3 style={{color: '#555', marginBottom: '15px'}}>Giỏ hàng đang trống!</h3>
           <p style={{color: '#777'}}>Hãy quay lại trang chủ để chọn thêm thực phẩm tươi ngon nhé.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          
          {/* 2. DANH SÁCH SẢN PHẨM (Nằm trên cùng) */}
          <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '15px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
            <h4 style={{ color: colors.primaryGreen, borderBottom: '1px solid #eee', paddingBottom: '15px', marginBottom: '20px' }}>
                1. Danh sách sản phẩm ({gioHang.length})
            </h4>

            {gioHang.map((item, index) => (
                <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: index === gioHang.length - 1 ? 'none' : '1px dashed #eee', padding: '20px 0' }}>
                    <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                        <div style={{width: '70px', height: '70px', border: '1px solid #eee', borderRadius: '8px', overflow: 'hidden'}}>
                            <img src={item.anh} alt={item.ten} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <div>
                            <h5 style={{margin: '0 0 5px 0', fontSize: '16px', fontWeight: 'bold', color: '#333'}}>{item.ten}</h5>
                            <small style={{ color: colors.priceText, fontWeight: 'bold', fontSize: '15px' }}>{item.gia}</small>
                        </div>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div style={{display: 'flex', alignItems: 'center', border: '1px solid #ddd', borderRadius: '20px', padding: '0 5px'}}>
                            <button onClick={() => chinhSuaSoLuong(item.id, 'giam')} style={{width: '30px', height: '30px', borderRadius: '50%', border: 'none', background: 'transparent', color: '#333', cursor: 'pointer', fontWeight: 'bold'}}>-</button>
                            <span style={{fontWeight: 'bold', fontSize: '15px', minWidth: '20px', textAlign: 'center'}}>{item.soLuong}</span>
                            <button onClick={() => chinhSuaSoLuong(item.id, 'tang')} style={{width: '30px', height: '30px', borderRadius: '50%', border: 'none', background: 'transparent', color: '#333', cursor: 'pointer', fontWeight: 'bold'}}>+</button>
                        </div>
                        <button onClick={() => xoaSanPham(item.id)} style={{ color: '#dc3545', border: 'none', background: 'none', cursor: 'pointer', fontSize: '18px' }} title="Xóa món này">🗑️</button>
                    </div>
                </div>
            ))}
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginTop: '20px', paddingTop: '20px', borderTop: '2px solid #f5f5f5' }}>
                <span style={{ fontSize: '18px', color: '#555', marginRight: '15px' }}>Tổng thanh toán:</span>
                <span style={{ color: colors.priceText, fontSize: '28px', fontWeight: '900' }}>{tongTien.toLocaleString()} VNĐ</span>
            </div>
          </div>

          {/* 3. FORM THÔNG TIN (Nằm dưới cùng) */}
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '15px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', borderTop: `5px solid ${colors.primaryGreen}` }}>
            <h4 style={{ color: colors.primaryGreen, marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span>📋</span> 2. Thông tin giao hàng
            </h4>
            
            {/* Hàng 1: Họ tên + SĐT */}
            <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '250px' }}>
                    <label style={{fontWeight: 'bold', fontSize: '14px', color: '#555', marginBottom: '5px', display: 'block'}}>Họ và tên *</label>
                    <input 
                        type="text" placeholder="Ví dụ: Nguyễn Văn A"
                        style={inputStyle}
                        value={thongTin.hoten}
                        onChange={(e) => setThongTin({ ...thongTin, hoten: e.target.value })} 
                    />
                </div>
                <div style={{ flex: 1, minWidth: '250px' }}>
                    <label style={{fontWeight: 'bold', fontSize: '14px', color: '#555', marginBottom: '5px', display: 'block'}}>Số điện thoại *</label>
                    <input 
                        type="text" placeholder="Ví dụ: 0909 123 456"
                        style={inputStyle}
                        value={thongTin.sdt}
                        onChange={(e) => setThongTin({ ...thongTin, sdt: e.target.value })} 
                    />
                </div>
            </div>

            {/* Hàng 2: Email (Tùy chọn) */}
            <div style={{ marginBottom: '20px' }}>
                <label style={{fontWeight: 'bold', fontSize: '14px', color: '#555', marginBottom: '5px', display: 'block'}}>Email (để nhận hóa đơn)</label>
                <input 
                    type="email" placeholder="Ví dụ: email@gmail.com"
                    style={inputStyle}
                    value={thongTin.email}
                    onChange={(e) => setThongTin({ ...thongTin, email: e.target.value })} 
                />
            </div>

            {/* Hàng 3: Địa chỉ chi tiết */}
            <div style={{ marginBottom: '20px' }}>
                <label style={{fontWeight: 'bold', fontSize: '14px', color: '#555', marginBottom: '5px', display: 'block'}}>Địa chỉ nhận hàng *</label>
                <textarea 
                    rows="2" placeholder="Số nhà, tên đường, phường/xã, quận/huyện..."
                    style={{...inputStyle, resize: 'none'}}
                    value={thongTin.diachi}
                    onChange={(e) => setThongTin({ ...thongTin, diachi: e.target.value })} 
                ></textarea>
            </div>

            {/* Hàng 4: Ghi chú */}
            <div style={{ marginBottom: '20px' }}>
                <label style={{fontWeight: 'bold', fontSize: '14px', color: '#555', marginBottom: '5px', display: 'block'}}>Ghi chú cho đơn hàng</label>
                <textarea 
                    rows="2" placeholder="Ví dụ: Giao hàng giờ hành chính, gọi trước khi giao..."
                    style={{...inputStyle, resize: 'none'}}
                    value={thongTin.ghichu}
                    onChange={(e) => setThongTin({ ...thongTin, ghichu: e.target.value })} 
                ></textarea>
            </div>

            {/* Hàng 5: Phương thức thanh toán */}
            <div style={{ marginBottom: '30px' }}>
                <label style={{fontWeight: 'bold', fontSize: '14px', color: '#555', marginBottom: '10px', display: 'block'}}>Phương thức thanh toán</label>
                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                    
                    {/* Lựa chọn 1: COD */}
                    <label style={{ 
                        flex: 1, padding: '15px', border: thongTin.phuongThuc === 'cod' ? `2px solid ${colors.primaryGreen}` : '1px solid #ddd', 
                        borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px',
                        backgroundColor: thongTin.phuongThuc === 'cod' ? '#e8f5e9' : 'white'
                    }}>
                        <input 
                            type="radio" name="payment" value="cod"
                            checked={thongTin.phuongThuc === 'cod'}
                            onChange={() => setThongTin({...thongTin, phuongThuc: 'cod'})}
                        />
                        <span style={{fontWeight: '600'}}>💵 Thanh toán khi nhận hàng (COD)</span>
                    </label>

                    {/* Lựa chọn 2: Chuyển khoản */}
                    <label style={{ 
                        flex: 1, padding: '15px', border: thongTin.phuongThuc === 'banking' ? `2px solid ${colors.primaryGreen}` : '1px solid #ddd', 
                        borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px',
                        backgroundColor: thongTin.phuongThuc === 'banking' ? '#e8f5e9' : 'white'
                    }}>
                        <input 
                            type="radio" name="payment" value="banking"
                            checked={thongTin.phuongThuc === 'banking'}
                            onChange={() => setThongTin({...thongTin, phuongThuc: 'banking'})}
                        />
                        <span style={{fontWeight: '600'}}>🏦 Chuyển khoản ngân hàng</span>
                    </label>

                </div>
            </div>

            {/* NÚT ĐẶT HÀNG TO & ĐẸP */}
            <button 
                onClick={xuLyThanhToan}
                style={{ 
                    width: '100%', 
                    background: `linear-gradient(45deg, ${colors.accentYellow}, #ffca2c)`, 
                    color: '#000', 
                    padding: '18px', 
                    fontSize: '20px', 
                    border: 'none', 
                    borderRadius: '10px', 
                    cursor: 'pointer', 
                    fontWeight: '900', 
                    textTransform: 'uppercase', 
                    boxShadow: '0 5px 15px rgba(255, 193, 7, 0.4)',
                    transition: 'transform 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
                XÁC NHẬN ĐẶT HÀNG ({tongTien.toLocaleString()} VNĐ)
            </button>
            <p style={{textAlign: 'center', marginTop: '15px', color: '#777', fontSize: '14px'}}>
                Cam kết bảo mật thông tin khách hàng 100%
            </p>
          </div>

        </div>
      )}
    </div>
  )
}

// Style chung cho các ô nhập liệu (Input)
const inputStyle = {
    width: '100%', 
    padding: '12px 15px', 
    borderRadius: '8px', 
    border: '1px solid #ccc', 
    outline: 'none', 
    fontSize: '15px',
    backgroundColor: '#f9f9f9',
    transition: 'border 0.3s'
};

export default Cart