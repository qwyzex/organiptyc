import { db } from "@/firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";

/**
 * Function to create a log entry for an organization
 * @param {string} orgId - The ID of the organization
 * @param {string} userId - The ID of the user performing the action
 * @param {string} action - A description of the action performed
 */
const createLog = async (
    orgId: string,
    userId: string,
    action: any,
    photoURL: string
) => {
    try {
        const logRef = collection(db, `organizations/${orgId}/logs`);
        await addDoc(logRef, {
            userId: userId,
            action: action,
            timestamp: Timestamp.now(),
            photoURL: photoURL,
        });
        console.log("Log entry created successfully.");
    } catch (error) {
        console.error("Error creating log entry: ", error);
    }
};

export default createLog;
