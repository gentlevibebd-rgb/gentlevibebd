import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB_D_D6ARvF8axAF-wzX5vCiurO6fiZ9k8",
  authDomain: "gentlevibebd-orders-asia-f47b7.firebaseapp.com",
  projectId: "gentlevibebd-orders-asia-f47b7",
  storageBucket: "gentlevibebd-orders-asia-f47b7.firebasestorage.app",
  messagingSenderId: "150186116103",
  appId: "1:150186116103:web:07b42cc88f3c37835d16a2",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);

export { app, db };
