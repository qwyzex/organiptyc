import { useState, useEffect, useContext } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase";
import { UserContext } from "@/context/UserContext";

/**
 * useIsAdmin hook
 * Checks if the currently logged in user is an admin of the given organization.
 *
 * @param {string} orgId - The ID of the organization to check.
 * @returns {Object} An object containing the following properties:
 *  - isAdmin: A boolean indicating if the user is an admin of the organization.
 *  - loading: A boolean indicating if the hook is currently loading.
 *  - error: An error object if an error occurred while checking the user's role.
 */
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
