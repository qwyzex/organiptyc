import { useState, useEffect, useContext } from "react";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase";
import { UserContext } from "@/context/UserContext";
import { useRouter } from "next/router";
import fetchUserOrgs from "@/function/fetchUserOrgs";
import { Skeleton } from "@mui/material";
import styles from "@/styles/Organization.module.sass";
import Link from "next/link";
import { DocumentData } from "@google-cloud/firestore";

const Organization = () => {
    const [organizations, setOrganizations] = useState<any>([]);
    const [listLoading, setListLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>("");
    const [roles, setRoles] = useState<DocumentData>();
    const { userDoc, loading, authUser } = useContext(UserContext);
    const router = useRouter();

    useEffect(() => {
        const fetchUserRole = async (orgId: string) => {
            try {
                const orgMemberRef = doc(
                    db,
                    `organizations/${orgId}/members`,
                    authUser!.uid
                );
                const orgMemberDoc = await getDoc(orgMemberRef);

                if (orgMemberDoc.exists()) {
                    console.log("DATA DOCUMENT : ", orgMemberDoc.data());
                    return orgMemberDoc.data();
                }
            } catch (error) {
                console.error("Error fetching user role:", error);
            }
            return;
        };

        const fetchOrganizations = async () => {
            if (authUser) {
                try {
                    const orgs = await fetchUserOrgs(authUser.uid, setListLoading);
                    setOrganizations(orgs);
                    const roles: DocumentData = {};
                    for (const org of orgs) {
                        const role = await fetchUserRole(org.uid);
                        roles[org.uid] = role;
                    }
                    setRoles(roles);
                } catch (err) {
                    // setError(err.message);
                }
            }
        };

        fetchOrganizations();
    }, [authUser]);

    if (error) return <div>Error: {error}</div>;

    return (
        <div className={styles.container}>
            <h1>Your Organizations</h1>
            <ul>
                {1 === 0 + 1 && roles ? (
                    organizations.map((org: any) => (
                        <li key={org.uid} className="fadeIn">
                            <Link href={`organization/${org.uid}`}>
                                <h2>{org.name}</h2>
                            </Link>
                            <div>
                                <p className={styles.userStatus}>
                                    {userDoc?.firstName} {userDoc?.lastName} -{" "}
                                    {roles[org.uid].role} (Joined{" "}
                                    {roles[org.uid].joinedAt.toDate().toDateString()})
                                </p>
                                <p className={styles.orgDescription}>{org.description}</p>
                            </div>
                        </li>
                    ))
                ) : (
                    <>
                        <div className={styles.skeletonContainer}>
                            <Skeleton
                                variant="rounded"
                                sx={{ bgcolor: "grey.800" }}
                                animation="wave"
                                width={200}
                                height={20}
                            />
                            <Skeleton
                                variant="rounded"
                                sx={{ bgcolor: "grey.800" }}
                                animation="wave"
                                width={400}
                                height={10}
                            />
                            <Skeleton
                                variant="rounded"
                                sx={{ bgcolor: "grey.800" }}
                                animation="wave"
                                width={300}
                                height={10}
                            />
                            <Skeleton
                                variant="rounded"
                                sx={{ bgcolor: "grey.800" }}
                                animation="wave"
                                width={300}
                                height={10}
                            />
                        </div>
                        <div className={styles.skeletonContainer}>
                            <Skeleton
                                variant="rounded"
                                sx={{ bgcolor: "grey.800" }}
                                animation="wave"
                                width={200}
                                height={20}
                            />
                            <Skeleton
                                variant="rounded"
                                sx={{ bgcolor: "grey.800" }}
                                animation="wave"
                                width={400}
                                height={10}
                            />
                            <Skeleton
                                variant="rounded"
                                sx={{ bgcolor: "grey.800" }}
                                animation="wave"
                                width={300}
                                height={10}
                            />
                            <Skeleton
                                variant="rounded"
                                sx={{ bgcolor: "grey.800" }}
                                animation="wave"
                                width={300}
                                height={10}
                            />
                        </div>
                    </>
                )}
            </ul>
        </div>
    );
};

export default Organization;
