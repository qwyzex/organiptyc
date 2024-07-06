import { db } from "@/firebase";
import { collection, query, orderBy, getDocs } from "firebase/firestore";

/**
 * Function to fetch log entries for an organization
 * @param {string} orgId - The ID of the organization
 * @returns {Promise<Array>} - An array of log entries
 */
const fetchLogs = async (orgId: string) => {
    try {
        const logsRef = collection(db, `organizations/${orgId}/logs`);
        const q = query(logsRef, orderBy("timestamp", "desc"));
        const querySnapshot = await getDocs(q);
        const logs: any = [];
        querySnapshot.forEach((doc) => {
            logs.push({ id: doc.id, ...doc.data() });
        });
        return logs;
    } catch (error) {
        console.error("Error fetching log entries: ", error);
        return [];
    }
};

export default fetchLogs;
