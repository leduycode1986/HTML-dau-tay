import React from 'react'
import { useParams } from 'react-router-dom' // 1. Cái móc để lấy ID từ trên thanh địa chỉ

function ProductDetail() {
  // 2. Lấy cái đuôi phía sau đường dẫn (ví dụ: /product/1 thì lấy số 1)
  const { id } = useParams(); 

  return (
    <div style={{ padding: '50px', textAlign: 'center' }}>
      <h1>🔍 Chi tiết sản phẩm</h1>
      <h3>Bạn đang xem sản phẩm có ID là: <span style={{color: 'red'}}>{id}</span></h3>
      
      {/* Tạm thời hiển thị vậy đã, tí nữa mình sẽ lôi dữ liệu thật ra sau */}
    </div>
  )
}

export default ProductDetail