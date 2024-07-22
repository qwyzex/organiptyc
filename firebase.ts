import { initializeApp, FirebaseApp, getApps } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAnalytics, Analytics } from "firebase/analytics";
import { FirebaseStorage, getStorage } from "firebase/storage";

console.log("PROCESS API KEY:", process.env.NEXT_PUBLIC_FIREBASE_API_KEY);

const firebaseConfig = {
    apiKey:
        process.env.NODE_ENV === "development"
            ? process.env.NEXT_PUBLIC_FIREBASE_API_KEY
            : process.env.FIREBASE_API_KEY,
    authDomain:
        process.env.NODE_ENV === "development"
            ? process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
            : process.env.FIREBASE_AUTH_DOMAIN,
    projectId:
        process.env.NODE_ENV === "development"
            ? process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
            : process.env.FIREBASE_PROJECT_ID,
    storageBucket:
        process.env.NODE_ENV === "development"
            ? process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
            : process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId:
        process.env.NODE_ENV === "development"
            ? process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
            : process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId:
        process.env.NODE_ENV === "development"
            ? process.env.NEXT_PUBLIC_FIREBASE_APP_ID
            : process.env.FIREBASE_APP_ID,
    measurementId:
        process.env.NODE_ENV === "development"
            ? process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
            : process.env.FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);

// let app = initializeApp(firebaseConfig);
// if (!getApps().length) {
//     app = initializeApp(firebaseConfig);
// } else {
//     app = getApps()[0];
// }

const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);
const storage: FirebaseStorage = getStorage(app);

let analytics;
if (typeof window !== "undefined") {
    analytics = getAnalytics(app);
}

export { auth, db, storage, analytics };
