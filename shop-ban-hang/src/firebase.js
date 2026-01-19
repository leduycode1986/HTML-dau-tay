import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"; // Thêm Storage (để up ảnh)
import { getAuth } from "firebase/auth";       // Thêm Auth (để đăng nhập)
const firebaseConfig = {
  apiKey: "AIzaSyABCDSgWbQU57dptEVjXtqboIKaodvUmnA",
  authDomain: "maivang-shop.firebaseapp.com",
  projectId: "maivang-shop",
  storageBucket: "maivang-shop.firebasestorage.app",
  messagingSenderId: "580874818222",
  appId: "1:580874818222:web:d895b6a48b21e9c235933f"
};

// 1. Khởi tạo App
const app = initializeApp(firebaseConfig);

// 2. Khởi tạo các dịch vụ
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

// 3. Xuất ra để các file khác dùng
export { db, auth, storage };