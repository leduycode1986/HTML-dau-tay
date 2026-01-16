import './App.css'
import { useState } from 'react'

// 👇 1. QUAN TRỌNG: Nhập khẩu thẻ Link
import { Link } from 'react-router-dom' 

function SanPham(props) {
  const [daThich, setDaThich] = useState(false);

  function xuLyThich() {
    setDaThich(!daThich);
  }

  return (
    <div className="card">
      
      {/* 👇 2. Bọc cái ẢNH bằng thẻ Link */}
      {/* Khi bấm vào ảnh -> Nó sẽ bay tới đường dẫn /product/kèm-theo-id */}
      <Link to={`/product/${props.id}`}>
        <img 
            src={props.anh} 
            alt="Sản phẩm" 
            width="200" height="200" 
            style={{ objectFit: 'cover', cursor: 'pointer' }} 
        />
      </Link>
      
      {/* 👇 3. Bọc cái TÊN bằng thẻ Link (để bấm vào tên cũng chuyển trang luôn) */}
      <Link to={`/product/${props.id}`} style={{textDecoration: 'none', color: 'black'}}>
         <h3>{props.ten}</h3>
      </Link>

      <p>Giá: {props.gia}</p>
      
      <div style={{display: 'flex', justifyContent: 'center', gap: '10px'}}>
        <button onClick={props.muaHang}>Thêm vào giỏ</button>
        <button 
          onClick={xuLyThich} 
          style={{ backgroundColor: daThich ? 'pink' : 'white' }}
        >
          {daThich ? '❤️' : '🤍'} 
        </button>
      </div>
    </div>
  )
}

export default SanPham