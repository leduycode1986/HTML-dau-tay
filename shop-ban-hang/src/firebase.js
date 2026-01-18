import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"; // 1. Thêm dòng này

const firebaseConfig = {
  // ... (Giữ nguyên các thông tin API Key cũ của bạn) ...
  apiKey: "AIzaSy...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "maivang-shop.appspot.com", // 2. Đảm bảo dòng này có
  messagingSenderId: "...",
  appId: "..."
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app); // 3. Xuất biến storage