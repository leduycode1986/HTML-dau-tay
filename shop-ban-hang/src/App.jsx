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
    setGioHang([]); alert("Đặt hàng thành công!"); navigate('/');
  };

  return (
    <Routes>
      <Route path="/" element={<Home dsSanPham={dsSanPham} dsDanhMuc={dsDanhMuc} themVaoGio={themVaoGio} />} />
      <Route path="/product/:id" element={<ProductDetail dsSanPham={dsSanPham} themVaoGio={themVaoGio} />} />
      <Route path="/cart" element={<Cart gioHang={gioHang} handleDatHang={handleDatHang} chinhSuaSoLuong={(id, k) => setGioHang(gioHang.map(i => i.id === id ? {...i, soLuong: k==='tang'?i.soLuong+1:Math.max(1,i.soLuong-1)} : i))} xoaSanPham={(id) => setGioHang(gioHang.filter(i=>i.id!==id))} />} />
      <Route path="/admin" element={<Admin dsSanPham={dsSanPham} dsDanhMuc={dsDanhMuc} dsDonHang={dsDonHang} 
        handleUpdateDS_SP={async (t, d) => t==='DELETE'?await deleteDoc(doc(db,"sanPham",d)):(t==='ADD'?await addDoc(collection(db,"sanPham"),d):await updateDoc(doc(db,"sanPham",d.id),d))}
        handleUpdateDS_DM={async (t, d) => t==='DELETE'?await deleteDoc(doc(db,"danhMuc",d)):(t==='ADD'?await addDoc(collection(db,"danhMuc"),d):await updateDoc(doc(db,"danhMuc",d.id),d))}
        handleUpdateStatusOrder={async (id, s) => await updateDoc(doc(db,"donHang",id),{trangThai:s})}
        handleDeleteOrder={async (id) => await deleteDoc(doc(db,"donHang",id))}
      />} />
    </Routes>
  );
}
export default App;