import React from 'react'
import { Link } from 'react-router-dom'

function Cart(props) {
  const gioHang = props.gioHang; 

  // 1. Hàm phụ: Chuyển tiền từ chữ sang số để tính toán
  function chuyenDoiTien(chuoiTien) {
     return Number(chuoiTien.replace(/[^0-9]/g, ""));
  }

  // 2. Tính tổng tiền (Đây là đoạn code thay thế chữ "Đang tính toán...")
  const tongTien = gioHang.reduce((tong, sp) => {
     return tong + (chuyenDoiTien(sp.gia) * sp.soLuong);
  }, 0);

  // 3. Hàm phụ: Format lại số tiền cho đẹp
  function formatTien(soTien) {
     return soTien.toLocaleString('vi-VN') + ' VNĐ';
  }

  return (
    <div className="container" style={{ marginTop: '20px' }}>
      <h2 className="mb-4">🛒 Giỏ hàng của bạn</h2>

      {gioHang.length === 0 ? (
        <div className="text-center">
            <p className="fs-5">Giỏ hàng đang trống trơn...</p>
            <Link to="/" className="btn btn-primary">Quay lại mua sắm</Link>
        </div>
      ) : (
        <div>
            <table className="table table-bordered table-hover">
                <thead className="table-light">
                    <tr>
                        <th>Sản phẩm</th>
                        <th>Tên</th>
                        <th>Đơn giá</th>
                        <th>Số lượng</th>
                        <th>Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    {gioHang.map((sp, index) => (
                        <tr key={index} style={{verticalAlign: 'middle'}}>
                            <td>
                                <img src={sp.anh} alt={sp.ten} width="60" className="rounded" />
                            </td>
                            <td className="fw-bold">{sp.ten}</td>
                            <td>{sp.gia}</td>
                            <td>
                                {/* Nút giảm */}
                                <button 
                                  className="btn btn-sm btn-outline-secondary me-2"
                                  onClick={() => props.chinhSuaSoLuong(sp.id, 'giam')}
                                >-</button>
                                
                                <span className="fw-bold">{sp.soLuong}</span>

                                {/* Nút tăng */}
                                <button 
                                  className="btn btn-sm btn-outline-secondary ms-2"
                                  onClick={() => props.chinhSuaSoLuong(sp.id, 'tang')}
                                >+</button>
                            </td>
                            <td>
                                {/* Nút xóa */}
                                <button 
                                  className="btn btn-danger btn-sm"
                                  onClick={() => props.xoaSanPham(sp.id)}
                                >🗑 Xóa</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="text-end mt-4">
                {/* HIỂN THỊ TỔNG TIỀN ĐÃ TÍNH ĐƯỢC */}
                <h4>Tổng tiền: <span className="text-danger">{formatTien(tongTien)}</span></h4>
                <button className="btn btn-success btn-lg mt-2">Thanh toán ngay</button>
            </div>
        </div>
      )}
    </div>
  )
}

export default Cart