import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB7rIrzs1eCSKRumUI_qh-kWp186FcxQeE",
  authDomain: "daggerheart-gm-dashboard.firebaseapp.com",
  databaseURL: "https://daggerheart-gm-dashboard-default-rtdb.firebaseio.com",
  projectId: "daggerheart-gm-dashboard",
  storageBucket: "daggerheart-gm-dashboard.firebasestorage.app",
  messagingSenderId: "1075267270443",
  appId: "1:1075267270443:web:ff4b53d8783205b444f76e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database and get a reference to the service
export const database = getDatabase(app);

export default app;
