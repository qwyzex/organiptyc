import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase";

export default async function fetchAnyUser(userId: string) {
    const anyUserRef = doc(db, "users", userId);
    const anyUserSnap = await getDoc(anyUserRef);

    if (anyUserSnap.exists()) {
        return anyUserSnap.data();
    } else {
        return null;
    }
}
