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

const app = initializeApp(firebaseConfig);

// Khởi tạo các dịch vụ
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

// Xuất ra để dùng ở các file khác
export { db, auth, storage };