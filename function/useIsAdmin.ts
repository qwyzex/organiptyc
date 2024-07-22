import { useState, useEffect, useContext } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase";
import { UserContext } from "@/context/UserContext";

const useIsAdmin = (orgId: string) => {
    const [isAdmin, setIsAdmin] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<any>(null);
    const { authUser } = useContext(UserContext);

    useEffect(() => {
        const checkAdminStatus = async () => {
            if (!authUser || !orgId) return;

            try {
                const orgMemberRef = doc(
                    db,
                    `organizations/${orgId}/members`,
                    authUser.uid
                );
                const orgMemberDoc = await getDoc(orgMemberRef);

                if (orgMemberDoc.exists()) {
                    setIsAdmin(orgMemberDoc.data().role === "admin");
                } else {
                    setIsAdmin(false);
                }
            } catch (error) {
                setError(error);
                console.error("Error fetching user role:", error);
            } finally {
                setLoading(false);
            }
        };

        checkAdminStatus();
    }, [authUser, orgId]);

    return { isAdmin, loading, error };
};

export default useIsAdmin;
