import { db } from "@/firebase";
import {
    doc,
    setDoc,
    getDoc,
    updateDoc,
    collection,
    addDoc,
    query,
    getDocs,
    where,
} from "firebase/firestore";
import { useRouter } from "next/router";

/**
 * Handles an invite link and adds the user to the organization if the
 * invite link is valid and not expired. Throws an error if the invite
 * link is invalid or expired.
 * @param {string} inviteToken The invite link token.
 * @param {string} userId The user ID of the user to add to the organization.
 * @returns {string} The organization ID of the organization the user was added to.
 */
const handleInviteLink = async (inviteToken: string, userId: string) => {
    const inviteRef = collection(db, `invites`);
    const inviteQuery = query(inviteRef, where("token", "==", inviteToken));
    const inviteSnapshot = await getDocs(inviteQuery);

    if (inviteSnapshot.empty) {
        throw new Error("Invalid or expired invite link.");
    }

    const inviteDoc = inviteSnapshot.docs[0];
    const inviteData = inviteDoc.data();
    const orgId = inviteData.invitedToUID;

    if (inviteData.expiresAt.toDate() < new Date()) {
        throw new Error("Invite link has expired.");
    }

    const userRef = doc(db, "users", userId, "organizations", orgId as string);
    await setDoc(userRef, {
        role: "member",
        joinedAt: new Date(),
    });

    const orgMemberRef = doc(
        db,
        "organizations",
        orgId as string,
        "members",
        userId
    );
    await setDoc(orgMemberRef, {
        role: "member",
        joinedAt: new Date(),
        userId: userId,
    });

    return orgId;
};

export default handleInviteLink;
