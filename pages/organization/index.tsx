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
import Image from "next/image";

const Organization = () => {
    const [organizations, setOrganizations] = useState<any | null>(null);
    const [listLoading, setListLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>("");
    const [roles, setRoles] = useState<DocumentData | null>(null);
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
                    setError(JSON.stringify(err));
                }
            }
        };

        fetchOrganizations();
        // console.log(roles)
    }, [authUser, roles]);

    if (error) return <div>Error: {error}</div>;

    return (
        <div className={styles.container}>
            <h1>Your Organizations</h1>
            <ul>
                {roles !== null && !listLoading && organizations.length > 0 ? (
                    organizations.map((org: any) => (
                        <li key={org.uid} className="fadeIn">
                            <div className={styles.titleHeader}>
                                <div>
                                    <Link href={`organization/${org.uid}`}>
                                        <Image
                                            src={org.logoURL}
                                            alt={`${org.name} logo`}
                                            width={75}
                                            height={75}
                                        />
                                    </Link>
                                </div>
                                <div>
                                    <Link href={`organization/${org.uid}`}>
                                        <h2>{org.name}</h2>
                                    </Link>
                                    <div className={styles.userStatus}>
                                        <p>
                                            {userDoc?.firstName} {userDoc?.lastName} -{" "}
                                            {roles[org.uid].role}
                                        </p>
                                        <p>
                                            Joined{" "}
                                            {roles[org.uid].joinedAt
                                                .toDate()
                                                .toDateString()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <p className={styles.orgDescription}>{org.description}</p>
                        </li>
                    ))
                ) : roles !== null && !listLoading && organizations.length < 1 ? (
                    <div className={`fadeIn ${styles.noOrganizations}`}>
                        You have no organizations.{" "}
                        <Link href="/organization/new">Join</Link> now!
                    </div>
                ) : (
                    <>
                        <div className={styles.skeletonContainer}>
                            <Skeleton
                                variant="circular"
                                sx={{ bgcolor: "grey.800" }}
                                animation="wave"
                                width={75}
                                height={75}
                            />
                            <div>
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
                        </div>
                        <div className={styles.skeletonContainer}>
                            <Skeleton
                                variant="circular"
                                sx={{ bgcolor: "grey.800" }}
                                animation="wave"
                                width={75}
                                height={75}
                            />
                            <div>
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
                        </div>
                    </>
                )}
            </ul>
        </div>
    );
};

export default Organization;
