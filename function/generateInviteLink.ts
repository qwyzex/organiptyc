import { db } from "@/firebase";
import {
    addDoc,
    collection,
    Timestamp,
    doc,
    setDoc,
    query,
    where,
    getDocs,
    deleteDoc,
    DocumentData,
} from "firebase/firestore";
import { nanoid } from "nanoid";

/**
 * Generates a new invite link for an organization that expires in the specified time frame.
 * The invite link is a random token that is stored in the invites collection with the organization ID it is for.
 * The invite link can be used to join the organization and will be deleted after the specified time frame.
 * If there are any existing invite tokens for the same organization, they will be deleted.
 * @param orgId The ID of the organization to generate the invite link for.
 * @param expiresIn The time frame for which the invite link is valid in hours.
 * @param userDoc The user document of the person generating the invite link.
 * @returns An object with the invite link and the expiration time.
 */
const generateInviteLink = async (
    orgId: string,
    expiresIn: number,
    userDoc: DocumentData
) => {
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

    return {
        link:
            process.env.NODE_ENV === "production"
                ? `http://organiptyc.vercel.app/organization/join/${inviteToken}`
                : `https://localhost:3000/organization/join/${inviteToken}`,
        expiresAt,
    };
};

export default generateInviteLink;
