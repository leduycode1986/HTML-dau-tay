// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// --- DÁN MÃ CỦA BẠN VÀO ĐÂY ---
const firebaseConfig = {
  apiKey: "AIzaSyD...", // Copy từ Firebase console
  authDomain: "maivang-shop.firebaseapp.com",
  projectId: "maivang-shop",
  storageBucket: "maivang-shop.appspot.com",
  messagingSenderId: "...",
  appId: "..."
};
// ------------------------------

const app = initializeApp(firebaseConfig);
// Khởi tạo cơ sở dữ liệu
export const db = getFirestore(app);