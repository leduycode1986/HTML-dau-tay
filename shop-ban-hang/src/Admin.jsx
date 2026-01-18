// ... (Các import cũ)

// Nhận thêm props mới: dsDonHang, handleUpdateStatusOrder, handleDeleteOrder
function Admin({ dsSanPham, handleUpdateDS_SP, dsDanhMuc, handleUpdateDS_DM, dsDonHang, handleUpdateStatusOrder, handleDeleteOrder }) {
  
  // ... (Phần Login, Config, Sản phẩm, Menu GIỮ NGUYÊN) ...

  // HÀM HIỂN THỊ TRẠNG THÁI ĐƠN HÀNG ĐẸP MẮT
  const renderStatus = (status) => {
      switch(status) {
          case 'Mới đặt': return <Badge bg="primary">Mới đặt</Badge>;
          case 'Đang giao': return <Badge bg="warning" text="dark">Đang giao 🚚</Badge>;
          case 'Hoàn thành': return <Badge bg="success">Hoàn thành ✅</Badge>;
          case 'Hủy': return <Badge bg="secondary">Đã hủy ❌</Badge>;
          default: return <Badge bg="light" text="dark">{status}</Badge>;
      }
  };

  // ... (Phần UI Login giữ nguyên) ...

  return (
    <div style={{ padding: '20px', backgroundColor: '#fff', minHeight: '100vh' }}>
      
      {/* ... (Header Admin giữ nguyên) ... */}

      <Tabs defaultActiveKey="orders" className="mb-3">
        
        {/* --- TAB MỚI: QUẢN LÝ ĐƠN HÀNG (Đưa lên đầu cho dễ thấy) --- */}
        <Tab eventKey="orders" title={`📋 Đơn hàng (${dsDonHang ? dsDonHang.length : 0})`}>
            <Table striped bordered hover responsive>
                <thead style={{background: '#e3f2fd'}}>
                    <tr>
                        <th>Ngày đặt</th>
                        <th>Khách hàng</th>
                        <th>SĐT / Địa chỉ</th>
                        <th>Tổng tiền</th>
                        <th>Chi tiết mua</th>
                        <th>Trạng thái</th>
                        <th>Xử lý</th>
                    </tr>
                </thead>
                <tbody>
                    {dsDonHang && dsDonHang.map(dh => (
                        <tr key={dh.id}>
                            <td>{dh.ngayDat?.toDate().toLocaleString('vi-VN')}</td>
                            <td style={{fontWeight: 'bold'}}>{dh.khachHang.ten}</td>
                            <td style={{fontSize: '14px'}}>
                                0{dh.khachHang.sdt}<br/>
                                <span style={{color: '#666'}}>{dh.khachHang.diachi}</span>
                                {dh.khachHang.ghiChu && <div style={{fontStyle: 'italic', color: 'blue'}}>"{dh.khachHang.ghiChu}"</div>}
                            </td>
                            <td style={{color: 'red', fontWeight: 'bold'}}>{dh.tongTien.toLocaleString()} đ</td>
                            <td>
                                <ul style={{margin: 0, paddingLeft: '20px', fontSize: '13px'}}>
                                    {dh.gioHang.map((sp, idx) => (
                                        <li key={idx}>{sp.ten} (x{sp.soLuong})</li>
                                    ))}
                                </ul>
                            </td>
                            <td>{renderStatus(dh.trangThai)}</td>
                            <td>
                                <div style={{display: 'flex', flexDirection: 'column', gap: '5px'}}>
                                    <Button size="sm" variant="outline-primary" onClick={() => handleUpdateStatusOrder(dh.id, 'Đang giao')}>🚚 Giao</Button>
                                    <Button size="sm" variant="outline-success" onClick={() => handleUpdateStatusOrder(dh.id, 'Hoàn thành')}>✅ Xong</Button>
                                    <Button size="sm" variant="outline-secondary" onClick={() => handleUpdateStatusOrder(dh.id, 'Hủy')}>❌ Hủy</Button>
                                    <Button size="sm" variant="link" style={{color: 'red', textDecoration: 'none'}} onClick={() => handleDeleteOrder(dh.id)}>🗑 Xóa</Button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    {(!dsDonHang || dsDonHang.length === 0) && <tr><td colSpan="7" className="text-center">Chưa có đơn hàng nào!</td></tr>}
                </tbody>
            </Table>
        </Tab>

        {/* ... (Các Tab Sản Phẩm, Menu cũ GIỮ NGUYÊN) ... */}
        <Tab eventKey="products" title="📦 Sản phẩm">...</Tab>
        <Tab eventKey="menu" title="📂 Menu Danh Mục">...</Tab>

      </Tabs>

      {/* ... (Các Modal cũ GIỮ NGUYÊN) ... */}
    </div>
  );
}

export default Admin;