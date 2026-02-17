import React from 'react';
import { Container, Table, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

function Compare({ compareList, removeFromCompare, themVaoGio }) {
  if (compareList.length === 0) return <Container className="py-5 text-center"><h3>Chưa có sản phẩm để so sánh</h3><Link to="/" className="btn btn-outline-success mt-2">Chọn sản phẩm</Link></Container>;

  return (
    <Container className="py-4">
      <h3 className="fw-bold text-primary mb-4">SO SÁNH SẢN PHẨM</h3>
      <div className="table-responsive">
        <Table bordered className="text-center align-middle bg-white shadow-sm">
          <thead>
            <tr className="bg-light">
              <th style={{width:'15%'}}>Tiêu chí</th>
              {compareList.map(sp => (
                <th key={sp.id} style={{width:`${85/compareList.length}%`}}>
                  <Button variant="outline-danger" size="sm" className="mb-2 border-0" onClick={()=>removeFromCompare(sp.id)}><i className="fa-solid fa-trash"></i> Xóa</Button>
                  <div className="fw-bold text-success">{sp.ten}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="fw-bold bg-light">Hình ảnh</td>
              {compareList.map(sp => <td key={sp.id}><img src={sp.anh} style={{width:'100px'}} alt="" /></td>)}
            </tr>
            <tr>
              <td className="fw-bold bg-light">Giá bán</td>
              {compareList.map(sp => <td key={sp.id} className="text-danger fw-bold">{sp.giaBan?.toLocaleString()} ¥</td>)}
            </tr>
            <tr>
              <td className="fw-bold bg-light">Trạng thái</td>
              {compareList.map(sp => <td key={sp.id}>{sp.soLuong > 0 ? <span className="text-success">Còn hàng</span> : <span className="text-danger">Hết hàng</span>}</td>)}
            </tr>
            <tr>
              <td className="fw-bold bg-light">Mô tả</td>
              {compareList.map(sp => <td key={sp.id}><div className="small text-start" dangerouslySetInnerHTML={{__html: sp.moTa?.substring(0, 150)+'...'}}></div></td>)}
            </tr>
            <tr>
              <td className="fw-bold bg-light">Hành động</td>
              {compareList.map(sp => <td key={sp.id}><Button variant="success" size="sm" onClick={()=>themVaoGio(sp)}>Thêm vào giỏ</Button></td>)}
            </tr>
          </tbody>
        </Table>
      </div>
    </Container>
  );
}
export default Compare;