import { initializeApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
// import { getAnalytics, Analytics } from "firebase/analytics";
import { FirebaseStorage, getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyAbOHbnGy_H3ak9kJo4oKk7icPpiGfEBuA",
    authDomain: "organiptyc.firebaseapp.com",
    projectId: "organiptyc",
    storageBucket: "organiptyc.appspot.com",
    messagingSenderId: "741015929286",
    appId: "1:741015929286:web:004888001005c9b576f2c7",
    measurementId: "G-RZ2GV6WXGV",
};

const app: FirebaseApp = initializeApp(firebaseConfig);
// const analytics: Analytics = getAnalytics(app);
const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);
const storage: FirebaseStorage = getStorage(app);

export { auth, db, storage };
