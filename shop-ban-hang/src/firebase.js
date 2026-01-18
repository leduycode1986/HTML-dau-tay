import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"; // 1. Thêm dòng này

const firebaseConfig = {
  apiKey: "AIzaSyABCDSgWbQU57dptEVjXtqboIKaodvUmnA",
  authDomain: "maivang-shop.firebaseapp.com",
  projectId: "maivang-shop",
  storageBucket: "maivang-shop.firebasestorage.app",
  messagingSenderId: "580874818222",
  appId: "1:580874818222:web:d895b6a48b21e9c235933f"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app); // 3. Xuất biến storage