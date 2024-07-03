import { collection, doc, getDocs, getDoc, query } from "firebase/firestore";
import { db } from "@/firebase";
import { SetStateAction, Dispatch } from "react";

const fetchUserOrgs = async (
    userId: string,
    setLoading: Dispatch<SetStateAction<boolean>>
) => {
    try {
        const orgRefs: Array<any> = [];

        // Fetching the user's organization IDs from their subcollection
        const userOrgCollectionRef = collection(db, `users/${userId}/organizations`);
        const userOrgSnapshot = await getDocs(userOrgCollectionRef);

        userOrgSnapshot.forEach((doc) => {
            orgRefs.push(doc.id); // Collect organization IDs
        });

        // Fetching the actual organization documents
        const orgPromises = orgRefs.map((orgId) =>
            getDoc(doc(db, "organizations", orgId))
        );
        const orgDocs = await Promise.all(orgPromises);

        // Filtering out any null documents and formatting the data
        const organizations = orgDocs
            .filter((orgDoc) => orgDoc.exists())
            .map((orgDoc) => ({
                ...orgDoc.data(),
            }));

        setLoading(false);
        return organizations;
    } catch (error) {
        console.error("Error fetching organizations:", error);
        throw error;
    }
};

export default fetchUserOrgs;
