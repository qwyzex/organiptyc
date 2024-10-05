import { auth, db } from "@/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

/**
 * Fetches the current user's document from the database, if they are logged in.
 *
 * @returns An object with the following properties:
 * - `authUser`: The FirebaseUser object for the current user, or null if the user is not logged in.
 * - `userDoc`: The user's document data from the database, or null if the user is not logged in.
 */
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
