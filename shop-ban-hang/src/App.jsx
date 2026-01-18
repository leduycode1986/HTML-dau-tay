import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { db } from './firebase'; 
import { collection, onSnapshot } from 'firebase/firestore';

import Home from './Home';
import ProductDetail from './ProductDetail';
import Cart from './Cart';
import Admin from './Admin';

function App() {
  const [dsSanPham, setDsSanPham] = useState([]);
  const [dsDanhMuc, setDsDanhMuc] = useState([]);
  const [gioHang, setGioHang] = useState(() => JSON.parse(localStorage.getItem('cart') || '[]'));

  useEffect(() => {
    onSnapshot(collection(db, "sanPham"), (sn) => setDsSanPham(sn.docs.map(d => ({id: d.id, ...d.data()}))));
    onSnapshot(collection(db, "danhMuc"), (sn) => setDsDanhMuc(sn.docs.map(d => ({id: d.id, ...d.data()}))));
  }, []);

  useEffect(() => localStorage.setItem('cart', JSON.stringify(gioHang)), [gioHang]);

  const themVaoGio = (sp) => {
    const check = gioHang.find(i => i.id === sp.id);
    if (check) setGioHang(gioHang.map(i => i.id === sp.id ? {...i, soLuong: i.soLuong + 1} : i));
    else setGioHang([...gioHang, {...sp, soLuong: 1}]);
  };

  return (
    <Routes>
      <Route path="/" element={<Home dsSanPham={dsSanPham} dsDanhMuc={dsDanhMuc} themVaoGio={themVaoGio} />} />
      <Route path="/product/:id" element={<ProductDetail dsSanPham={dsSanPham} themVaoGio={themVaoGio} />} />
      <Route path="/cart" element={<Cart gioHang={gioHang} setGioHang={setGioHang} />} />
      <Route path="/admin" element={<Admin dsSanPham={dsSanPham} dsDanhMuc={dsDanhMuc} />} />
    </Routes>
  );
}

export default App;