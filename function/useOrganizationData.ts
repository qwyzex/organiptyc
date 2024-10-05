import { useState, useEffect, useContext } from "react";
import {
    doc,
    getDoc,
    collection,
    getDocs,
    DocumentData,
    query,
    limit,
} from "firebase/firestore";
import { db } from "@/firebase";
import { UserContext } from "@/context/UserContext";

/**
 * Fetches data for an organization given its ID.
 * The data includes the organization itself, and all documents in its
 * subcollections. The subcollections currently fetched are "members" and "programs"
 *
 * The fetched data is stored in the component's state and returned as an object
 * with three properties: orgData (the organization data), loading (a boolean
 * indicating whether the data is being fetched), and error (an error object if
 * something went wrong during the fetch).
 *
 * The function takes two parameters: orgId, the ID of the organization to fetch,
 * and rerenderer, a number that, when changed, causes the function to refetch the
 * data. This can be used to force a refetch when the user logs in or out.
 *
 * @param {string} orgId - The ID of the organization to fetch.
 * @param {number} rerenderer - A number that, when changed, causes the function to
 * refetch the data.
 * @returns {object} An object with three properties: orgData (the organization
 * data), loading (a boolean indicating whether the data is being fetched), and
 * error (an error object if something went wrong during the fetch).
 */
const useOrganizationData = (orgId: string, rerenderer: number = 0) => {
    const { authUser } = useContext(UserContext);
    const [orgData, setOrgData] = useState<DocumentData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<any>(null);

    useEffect(() => {
        const fetchOrganizationData = async () => {
            if (!authUser) return;
            try {
                const orgRef = doc(db, "organizations", orgId);
                const orgSnap = await getDoc(orgRef);

                if (!orgSnap.exists()) {
                    throw new Error("Organization does not exist.");
                }

                const orgData = orgSnap.data();
                const subcollections = ["members", "programs"]; // Add other subcollection names here

                for (const subcollectionName of subcollections) {
                    const subcollectionRef = collection(
                        db,
                        `organizations/${orgId}/${subcollectionName}`
                    );
                    const subcollectionSnap = await getDocs(
                        query(subcollectionRef, limit(1))
                    ); // Fetch only 1 document to check existence
                    if (!subcollectionSnap.empty) {
                        const allDocsSnap = await getDocs(subcollectionRef); // Fetch all documents if the collection exists
                        orgData[subcollectionName] = await Promise.all(
                            allDocsSnap.docs.map(async (docu) => {
                                const data = docu.data();
                                if (subcollectionName === "members") {
                                    const userRef = doc(
                                        db,
                                        "users",
                                        data.userId
                                    );
                                    const userSnap = await getDoc(userRef);
                                    return {
                                        ...data,
                                        user: userSnap.exists()
                                            ? userSnap.data()
                                            : null,
                                    };
                                }
                                return { id: docu.id, ...data };
                            })
                        );
                    } else {
                        orgData[subcollectionName] = []; // Initialize empty array if the collection doesn't exist
                    }
                }

                setOrgData(orgData);
            } catch (error) {
                setError(error);
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrganizationData();
    }, [orgId, rerenderer, authUser]);

    return { orgData, loading, error };
};

export default useOrganizationData;
