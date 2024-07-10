import { db } from "@/firebase";
import { addDoc, collection, Timestamp, doc, setDoc, query, where, getDocs, deleteDoc, DocumentData } from "firebase/firestore";
import { nanoid } from "nanoid";

const generateInviteLink = async (orgId: string, expiresIn: number, userDoc: DocumentData) => {
    const inviteToken = nanoid(); // Generate a unique token
    const expiresAt = Timestamp.fromDate(
        new Date(Date.now() + expiresIn * 60 * 60 * 1000)
    ); // Set expiration time

    const invitesRef = collection(db, `invites`);
    const invitesQuery = query(invitesRef, where("invitedToUID", "==", orgId));
    const querySnapshot = await getDocs(invitesQuery);

    // Delete existing invite tokens for the same organization
    querySnapshot.forEach(async (doc) => {
        await deleteDoc(doc.ref);
    });

    const inviteLinkRef = doc(invitesRef, inviteToken);
    await setDoc(inviteLinkRef, {
        token: inviteToken,
        expiresAt: expiresAt,
        invitedBy: userDoc.fullName,
        inviterPFP: userDoc.photoURL,
        invitedToUID: orgId,
    });

    return {link:`http://localhost:3000/organization/join/${inviteToken}`, expiresAt};
};

export default generateInviteLink;
