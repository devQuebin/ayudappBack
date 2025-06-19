import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import * as dotenv from "dotenv";
dotenv.config();

const firebaseConfig = {
  apiKey: "AIzaSyDywIoxZCA2-kTFf9SpASZ5CzI5t9WiyB4",
  authDomain: "ayudapp-33096.firebaseapp.com",
  projectId: "ayudapp-33096",
  storageBucket: "ayudapp-33096.firebasestorage.app",
  messagingSenderId: "379168550297",
  appId: "1:379168550297:web:ecde20154b608f79333708",
  measurementId: "G-HC0WMBWXE7",
};


const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);
const auth = getAuth(firebaseApp);

export { auth, db };
