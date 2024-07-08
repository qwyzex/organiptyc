import { auth, db } from "@/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

const fetchCurrentUser = async () => {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            const userDoc = doc(db, `/users/${user.uid}`);
            const userDocSnap = await getDoc(userDoc);

            if (userDocSnap.exists()) {
                return { authUser: user, userDoc };
            }
        } else {
        }
    });
    return { authUser: null, userDoc: null };
};

export default fetchCurrentUser;
