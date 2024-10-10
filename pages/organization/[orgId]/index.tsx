import { NextPage } from "next";
import { useRouter } from "next/router";
import {
    doc,
    getDoc,
    DocumentData,
    collection,
    query,
    orderBy,
    startAfter,
    limit,
    getDocs,
    QueryDocumentSnapshot,
} from "firebase/firestore";
import {
    useContext,
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
} from "react";
import { db } from "@/firebase";
import { UserContext } from "@/context/UserContext";
import Image from "next/image";
// import { logDoc } from "@/function/createLog";
import fetchLogs from "@/function/fetchLogs";
import fetchAnyUser from "@/function/fetchAnyUser";
import styles from "@/styles/organization/orgId/Dashboard.module.sass";
import useIsAdmin from "@/function/useIsAdmin";
import { Button } from "@mui/material";
import Loading from "@/components/Loading";
import { useOrganizationContext } from "@/context/OrganizationContext";
import Head from "next/head";

type OrganizationProps = {
    orgId: string;
};

const OrganizationPage: NextPage<OrganizationProps> = ({ orgId }) => {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);

    const { loading, authUser, userDoc } = useContext(UserContext);
    const {
        orgData,
        error: orgDataError,
        refetchOrganizationData,
        isAdmin,
    } = useOrganizationContext();

    const handleEditOrg = () => {
        router.push(`/organization/${orgId}/edit`);
    };

    if (error) {
        return <div>{error}</div>;
    }

    if (!orgData) {
        return (
            <main className={styles.loadingContainer}>
                <Loading />
            </main>
        );
    }

    return (
        <>
            <Head>
                <title>{orgData?.name} Dashboard</title>
            </Head>
            <div className={styles.container}>
                <header className={styles.orgHeader}>
                    <Image
                        src={orgData.logoURL}
                        alt={`${orgData.name} logo`}
                        height={100}
                        width={100}
                        priority
                    ></Image>
                    <article>
                        <h1>{orgData.name}</h1>
                        <p>
                            Created on :{" "}
                            {orgData.createdAt.toDate().toDateString()}
                        </p>
                        <p>
                            <strong>{orgData.members.length} </strong>
                            members |<strong> You </strong>
                            are {isAdmin
                                ? "an admin and a member"
                                : "a member"}{" "}
                            since{" "}
                            {orgData.members
                                .find(
                                    (member: any) =>
                                        member.userId === authUser?.uid
                                )
                                ?.joinedAt.toDate()
                                .toLocaleDateString()
                                .replaceAll("/", " / ")}
                        </p>
                    </article>
                    <div>
                        <Button
                            className="btn-def fadeIn"
                            onClick={handleEditOrg}
                        >
                            <p>EDIT ORGANIZATION</p>
                        </Button>
                    </div>
                </header>
                <main className={styles.orgMain}>
                    <ul>
                        <li>APPLE JACK</li>
                        <li>APPLE JACK</li>
                        <li>APPLE JACK</li>
                        <li>APPLE JACK</li>
                        <li>APPLE JACK</li>
                        <li>APPLE JACK</li>
                        <li>APPLE JACK</li>
                        <li>APPLE JACK</li>
                        <li>APPLE JACK</li>
                        <li>APPLE JACK</li>
                        <li>APPLE JACK</li>
                        <li>APPLE JACK</li>
                        <li>APPLE JACK</li>
                        <li>APPLE JACK</li>
                        <li>APPLE JACK</li>
                        <li>APPLE JACK</li>
                        <li>APPLE JACK</li>
                        <li>APPLE JACK</li>
                        <li>APPLE JACK</li>
                        <li>APPLE JACK</li>
                        <li>APPLE JACK</li>
                        <li>APPLE JACK</li>
                        <li>APPLE JACK</li>
                        <li>APPLE JACK</li>
                        <li>APPLE JACK</li>
                        <li>APPLE JACK</li>
                        <li>APPLE JACK</li>
                        <li>APPLE JACK</li>
                        <li>APPLE JACK</li>
                        <li>APPLE JACK</li>
                        <li>APPLE JACK</li>
                        <li>APPLE JACK</li>
                        <li>APPLE JACK</li>
                        <li>APPLE JACK</li>
                        <li>APPLE JACK</li>
                        <li>APPLE JACK</li>
                        <li>APPLE JACK</li>
                        <li>APPLE JACK</li>
                        <li>APPLE JACK</li>
                        <li>APPLE JACK</li>
                        <li>APPLE JACK</li>
                        <li>APPLE JACK</li>
                        <li>APPLE JACK</li>
                        <li>APPLE JACK</li>
                        <li>APPLE JACK</li>
                        <li>APPLE JACK</li>
                        <li>APPLE JACK</li>
                        <li>APPLE JACK</li>
                        <li>APPLE JACK</li>
                        <li>APPLE JACK</li>
                        <li>APPLE JACK</li>
                        <li>APPLE JACK</li>
                        <li>APPLE JACK</li>
                        <li>APPLE JACK</li>
                        <li>APPLE JACK</li>
                        <li>APPLE JACK</li>
                        <li>APPLE JACK</li>
                        <li>APPLE JACK</li>
                        <li>APPLE JACK</li>
                        <li>APPLE JACK</li>
                        <li>APPLE JACK</li>
                        <li>APPLE JACK</li>
                        <li>APPLE JACK</li>
                        <li>APPLE JACK</li>
                        <li>APPLE JACK</li>
                        <li>APPLE JACK</li>
                        <li>APPLE JACK</li>
                        <li>APPLE JACK</li>
                        <li>APPLE JACK</li>
                        <li>APPLE JACK</li>
                        <li>APPLE JACK</li>
                        <li>APPLE JACK</li>
                        <li>APPLE JACK</li>
                        <li>APPLE JACK</li>
                        <li>APPLE JACK</li>
                        <li>APPLE JACK</li>
                        <li>APPLE JACK</li>
                        <li>APPLE JACK</li>
                        <li>APPLE JACK</li>
                        <li>APPLE JACK</li>
                        <li>APPLE JACK</li>
                        <li>APPLE JACK</li>
                        <li>APPLE JACK</li>
                        <li>APPLE JACK</li>
                        <li>APPLE JACK</li>
                        <li>APPLE JACK</li>
                        <li>APPLE JACK</li>
                        <li>APPLE JACK</li>
                        <li>APPLE JACK</li>
                        <li>APPLE JACK</li>
                        <li>APPLE JACK</li>
                        <li>APPLE JACK</li>
                        <li>APPLE JACK</li>
                        <li>APPLE JACK</li>
                        <li>APPLE JACK</li>
                        <li>APPLE JACK</li>
                        <li>APPLE JACK</li>
                        <li>APPLE JACK</li>
                        <li>APPLE JACK</li>
                        <li>APPLE JACK</li>
                    </ul>
                </main>
            </div>
        </>
    );
};

export const getServerSideProps = async (context: any) => {
    const { orgId } = context.params;

    return {
        props: {
            orgId,
        },
    };
};

export default OrganizationPage;
