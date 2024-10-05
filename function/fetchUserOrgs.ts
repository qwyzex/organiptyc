import { collection, doc, getDocs, getDoc, query } from "firebase/firestore";
import { db } from "@/firebase";
import { SetStateAction, Dispatch } from "react";
import fetchLogs from "./fetchLogs"; // Assuming fetchLogs is a function that fetches logs for an organization

/**
 * Fetches organizations for a given user ID and returns an array of organization documents and their logs.
 * @param {string} userId - The ID of the user to fetch the organizations for.
 * @param {Dispatch<SetStateAction<boolean>>} setLoading - A function to update the loading state.
 * @returns {Promise<Array>} - An array of organization documents and their logs.
 */
const fetchUserOrgs = async (
    userId: string,
    setLoading: Dispatch<SetStateAction<boolean>>
) => {
    try {
        const orgRefs: Array<any> = [];

        // Fetching the user's organization IDs from their subcollection
        const userOrgCollectionRef = collection(
            db,
            `users/${userId}/organizations`
        );
        const userOrgSnapshot = await getDocs(userOrgCollectionRef);

        userOrgSnapshot.forEach((doc) => {
            orgRefs.push(doc.id); // Collect organization IDs
        });

        // Fetching the actual organization documents and their logs
        const orgPromises = orgRefs.map(async (orgId) => {
            const orgDoc = await getDoc(doc(db, "organizations", orgId));
            if (orgDoc.exists()) {
                const logs = await fetchLogs(orgId); // Fetch logs for the organization
                return {
                    uid: orgId,
                    ...orgDoc.data(),
                    logs, // Include logs in the organization data
                };
            }
            return null;
        });

        const orgDocs = await Promise.all(orgPromises);

        // Filtering out any null documents
        const organizations = orgDocs.filter((orgDoc) => orgDoc !== null);

        setLoading(false);
        return organizations;
    } catch (error) {
        console.error("Error fetching organizations:", error);
        setLoading(false); // Ensure loading state is reset in case of error
        throw error;
    }
};

export default fetchUserOrgs;
