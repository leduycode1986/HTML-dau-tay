import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { db } from './firebase'; 
import { collection, onSnapshot, doc, deleteDoc, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import Home from './Home';
import ProductDetail from './ProductDetail';
import Cart from './Cart';
import Admin from './Admin';

function App() {
  const navigate = useNavigate();
  const [dsSanPham, setDsSanPham] = useState([]);
  const [dsDanhMuc, setDsDanhMuc] = useState([]);
  const [dsDonHang, setDsDonHang] = useState([]);
  const [gioHang, setGioHang] = useState(() => JSON.parse(localStorage.getItem('cart') || '[]'));

  useEffect(() => {
    const unsubSP = onSnapshot(collection(db, "sanPham"), (sn) => setDsSanPham(sn.docs.map(d => ({id: d.id, ...d.data()}))));
    const unsubDM = onSnapshot(collection(db, "danhMuc"), (sn) => setDsDanhMuc(sn.docs.map(d => ({id: d.id, ...d.data()}))));
    const unsubDH = onSnapshot(collection(db, "donHang"), (sn) => setDsDonHang(sn.docs.map(d => ({id: d.id, ...d.data()}))));
    return () => { unsubSP(); unsubDM(); unsubDH(); };
  }, []);

  useEffect(() => localStorage.setItem('cart', JSON.stringify(gioHang)), [gioHang]);

  const themVaoGio = (sp) => {
    const check = gioHang.find(i => i.id === sp.id);
    if (check) setGioHang(gioHang.map(i => i.id === sp.id ? {...i, soLuong: i.soLuong + 1} : i));
    else setGioHang([...gioHang, {...sp, soLuong: 1}]);
  };

  const handleDatHang = async (khach) => {
    const tongTien = gioHang.reduce((t, s) => t + s.giaBan * s.soLuong, 0);
    await addDoc(collection(db, "donHang"), { khachHang: khach, gioHang, tongTien, trangThai: 'Mới đặt', ngayDat: serverTimestamp() });
    setGioHang([]); alert("Thành công!"); navigate('/');
  };

  return (
    <Routes>
      <Route path="/" element={<Home dsSanPham={dsSanPham} dsDanhMuc={dsDanhMuc} themVaoGio={themVaoGio} />} />
      <Route path="/product/:id" element={<ProductDetail dsSanPham={dsSanPham} themVaoGio={themVaoGio} />} />
      <Route path="/cart" element={<Cart gioHang={gioHang} setGioHang={setGioHang} handleDatHang={handleDatHang} />} />
      <Route path="/admin" element={<Admin dsSanPham={dsSanPham} dsDanhMuc={dsDanhMuc} dsDonHang={dsDonHang} 
        handleUpdateDS_SP={async (type, data) => type === 'DELETE' ? await deleteDoc(doc(db, "sanPham", data)) : (type === 'ADD' ? await addDoc(collection(db, "sanPham"), data) : await updateDoc(doc(db, "sanPham", data.id), data))}
        handleUpdateDS_DM={async (type, data) => type === 'DELETE' ? await deleteDoc(doc(db, "danhMuc", data)) : (type === 'ADD' ? await addDoc(collection(db, "danhMuc"), data) : await updateDoc(doc(db, "danhMuc", data.id), data))}
      />} />
    </Routes>
  );
}
export default App;