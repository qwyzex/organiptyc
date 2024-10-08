import { createContext, useContext, useState, useEffect } from "react";
import { db } from "@/firebase";
import {
    doc,
    getDoc,
    collection,
    getDocs,
    query,
    limit,
    DocumentData,
} from "firebase/firestore";
import { UserContext } from "@/context/UserContext";

interface OrganizationContextProps {
    orgData: DocumentData | null;
    isAdmin: boolean;
    loading: boolean;
    error: any;
    refetchOrganizationData: () => Promise<void>; // Exposing refetch method
}

const OrganizationContext = createContext<OrganizationContextProps | undefined>(
    undefined
);

export const OrganizationProvider = ({
    orgId,
    children,
}: {
    orgId: string;
    children: React.ReactNode;
}) => {
    const { authUser } = useContext(UserContext);
    const [orgData, setOrgData] = useState<any>(null);
    const [isAdmin, setIsAdmin] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<any>(null);

    const fetchOrganizationData = async () => {
        // PREQUIREMENTS
        if (!authUser) return;
        if (!orgId || !window.location.pathname.startsWith("/organization")) {
            setOrgData(null);
            return;
        }
        setLoading(true);

        // FUNCTION RUN
        try {
            // Root Document
            const orgRef = doc(db, "organizations", orgId);
            const orgSnap = await getDoc(orgRef);

            if (!orgSnap.exists()) {
                throw new Error("Organization does not exist.");
            }

            const orgData = orgSnap.data();

            // Subcollections
            const subcollections = ["members", "programs"];

            for (const subcollectionName of subcollections) {
                const subcollectionRef = collection(
                    db,
                    `organizations/${orgId}/${subcollectionName}`
                );
                const subcollectionSnap = await getDocs(
                    query(subcollectionRef, limit(1))
                ); // Check existence

                if (!subcollectionSnap.empty) {
                    const allDocsSnap = await getDocs(subcollectionRef);
                    orgData[subcollectionName] = await Promise.all(
                        allDocsSnap.docs.map(async (docu) => {
                            const data = docu.data();
                            if (subcollectionName === "members") {
                                const userRef = doc(db, "users", data.userId);
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
                    orgData[subcollectionName] = [];
                }
            }

            // Check if user is an admin
            const orgMemberRef = doc(
                db,
                `organizations/${orgId}/members`,
                authUser.uid
            );
            const orgMemberDoc = await getDoc(orgMemberRef);

            if (orgMemberDoc.exists()) {
                setIsAdmin(orgMemberDoc.data().admin);
            }

            // Final Data
            setOrgData(orgData);
        } catch (error) {
            setError(error);
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrganizationData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [orgId, authUser]);

    const refetchOrganizationData = async () => {
        await fetchOrganizationData(); // Exposing refetch function
    };

    return (
        <OrganizationContext.Provider
            value={{
                orgData,
                isAdmin,
                loading,
                error,
                refetchOrganizationData,
            }}
        >
            {children}
        </OrganizationContext.Provider>
    );
};

export const useOrganizationContext = () => {
    const context = useContext(OrganizationContext);
    if (!context)
        throw new Error(
            "useOrganizationContext must be used within a OrganizationProvider"
        );
    return context;
};
