import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase";

/**
 * Fetches the user data for any user by their ID.
 *
 * @param {string} userId - The ID of the user to fetch
 * @returns {Promise<DocumentData | null>} The user data if the user exists, null otherwise
 */
export default async function fetchAnyUser(userId: string) {
    const anyUserRef = doc(db, "users", userId);
    const anyUserSnap = await getDoc(anyUserRef);

    if (anyUserSnap.exists()) {
        return anyUserSnap.data();
    } else {
        return null;
    }
}
