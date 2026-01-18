import React from 'react'
import { Link } from 'react-router-dom'
import { Badge } from 'react-bootstrap';
import { Helmet } from "react-helmet";

function Home({ dsSanPham, dsDanhMuc, themVaoGio, danhMuc, tuKhoa, colors }) {
  let list = dsSanPham.filter(sp => {
      const matchKey = sp.ten.toLowerCase().includes(tuKhoa.toLowerCase());
      if(danhMuc==='all') return matchKey;
      const subs = dsDanhMuc.filter(d=>d.parent===danhMuc || d.parent===(dsDanhMuc.find(x=>x.id===danhMuc)?.customId)).map(d=>d.id);
      return matchKey && [danhMuc, ...subs].includes(sp.phanLoai);
  });

  return (
    <div>
      <Helmet><title>MaiVang Shop - Thực phẩm sạch</title></Helmet>
      <h4 className="border-bottom pb-2 mb-3 text-success">{danhMuc==='all'?'Tất cả sản phẩm':dsDanhMuc.find(d=>d.id===danhMuc)?.ten}</h4>
      <div className="d-flex flex-wrap gap-3">
        {list.map(sp => (
            <div key={sp.id} className="border rounded bg-white position-relative shadow-sm" style={{width:'220px', padding:'10px'}}>
                {sp.isMoi && <Badge bg="success" className="position-absolute top-0 start-0 m-2">New</Badge>}
                {sp.isKhuyenMai && <Badge bg="danger" className="position-absolute top-0 end-0 m-2">-{sp.phanTramGiam}%</Badge>}
                <Link to={`/product/${sp.id}`} className="text-decoration-none text-dark">
                    <img src={sp.anh} style={{width:'100%', height:'150px', objectFit:'cover', borderRadius:'5px'}} />
                    <h6 className="mt-2 text-truncate">{sp.ten}</h6>
                    <div className="text-danger fw-bold fs-5">{sp.giaBan?.toLocaleString()} ¥</div>
                    {sp.isKhuyenMai && <small className="text-muted text-decoration-line-through">{sp.giaGoc?.toLocaleString()} ¥</small>}
                </Link>
                <button onClick={()=>themVaoGio(sp)} className="btn btn-outline-success w-100 mt-2 btn-sm fw-bold">Thêm vào giỏ</button>
            </div>
        ))}
      </div>
    </div>
  )
}
export default Home