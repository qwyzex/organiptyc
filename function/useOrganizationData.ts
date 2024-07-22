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
                const subcollections = ["members"]; // Add other subcollection names here

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
        // eslint-disable-next-line
    }, [orgId, rerenderer]);

    return { orgData, loading, error };
};

export default useOrganizationData;
