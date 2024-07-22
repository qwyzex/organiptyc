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
import useOrganizationData from "@/function/useOrganizationData";
// import { logDoc } from "@/function/createLog";
import fetchLogs from "@/function/fetchLogs";
import fetchAnyUser from "@/function/fetchAnyUser";
import styles from "@/styles/organization/orgId/Dashboard.module.sass";
import useIsAdmin from "@/function/useIsAdmin";

type OrganizationProps = {
    orgId: string;
};

const OrganizationPage: NextPage<OrganizationProps> = ({ orgId }) => {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);

    const { isAdmin, error: isAdminError } = useIsAdmin(orgId);
    const { orgData, error: orgDataError } = useOrganizationData(orgId);

    const [logs, setLogs] = useState<Array<any> | null>(null);
    const [lastLog, setLastLog] = useState<QueryDocumentSnapshot<
        DocumentData,
        DocumentData
    > | null>(null);
    const [hasMoreLogs, setHasMoreLogs] = useState<boolean>(true);
    const [logIsLoading, setLogIsLoading] = useState<boolean>(false);

    const { loading, authUser, userDoc } = useContext(UserContext);

    const fetchLazyLogs = async (
        orgId: string,
        lastLog: QueryDocumentSnapshot<DocumentData, DocumentData> | null = null
    ) => {
        const logsRef = collection(db, `organizations/${orgId}/logs`);
        let logsQuery;

        if (lastLog) {
            logsQuery = query(
                logsRef,
                orderBy("timestamp", "desc"),
                startAfter(lastLog),
                limit(3)
            );
        } else {
            logsQuery = query(logsRef, orderBy("timestamp", "desc"), limit(3));
        }

        const logsSnapshot = await getDocs(logsQuery);
        const logs = logsSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));
        const lastVisible = logsSnapshot.docs[logsSnapshot.docs.length - 1];
        const hasMoreLogs = logs.length === 3;

        return { logs, lastVisible, hasMoreLogs };
    };

    const loadInitialLogs = async (orgId: string) => {
        setLogIsLoading(true);
        const { logs, lastVisible, hasMoreLogs } = await fetchLazyLogs(orgId);
        setLogs(logs);
        setLastLog(lastVisible);
        setHasMoreLogs(hasMoreLogs);
        setLogIsLoading(false);
    };

    const loadMoreLogs = async (orgId: string) => {
        if (!hasMoreLogs) return;

        setLogIsLoading(true);
        const {
            logs: newLogs,
            lastVisible,
            hasMoreLogs: newHasMoreLogs,
        } = await fetchLazyLogs(orgId, lastLog);
        setLogs((prevLogs: any) => [...prevLogs, ...newLogs]);
        setLastLog(lastVisible);
        setHasMoreLogs(newHasMoreLogs);
        setLogIsLoading(false);
    };

    useEffect(() => {
        if (orgId && authUser) {
            loadInitialLogs(orgId);
        }
        // eslint-disable-next-line
    }, []);

    if (isAdminError || orgDataError) {
        return <></>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    if (!orgData) {
        return <div>Loading...</div>;
    }

    return (
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
                        Created on : {orgData.createdAt.toDate().toDateString()}
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
                                (member: any) => member.userId === authUser?.uid
                            )
                            ?.joinedAt.toDate()
                            .toLocaleDateString()
                            .replaceAll("/", " / ")}
                    </p>
                </article>
            </header>
            <main className={styles.orgMain}>
                <LogContainer logs={logs} />
                <input
                    type="button"
                    disabled={!hasMoreLogs}
                    onClick={() => loadMoreLogs(orgId)}
                    value={logIsLoading ? "Loading" : "Load More"}
                />
            </main>
        </div>
    );
};

const LogContainer = ({ logs }: any) => {
    const containerRef = useRef(null);
    const [containerHeight, setContainerHeight] = useState("auto");

    useLayoutEffect(() => {
        if (containerRef.current) {
            setContainerHeight(containerRef.current.scrollHeight);
        }
    }, []); // Set initial height before first render

    useEffect(() => {
        if (containerRef.current) {
            const newHeight = containerRef.current.scrollHeight;
            setContainerHeight(newHeight);
        }
    }, [logs]); // Update height when logs change

    return (
        <div className={styles.logsCard}>
            <h3>Last Activities</h3>
            <ul ref={containerRef} style={{ height: containerHeight }}>
                {logs?.map((log: any) => {
                    return (
                        <li key={log.id}>
                            <Image
                                src={
                                    log.photoURL
                                        ? log.photoURL
                                        : "/placeholder/pfpPlaceholder.png"
                                }
                                alt=""
                                height={50}
                                width={50}
                            ></Image>
                            <div>
                                <p className={styles.logDate}>
                                    {log.timestamp.toDate().toLocaleString()}
                                </p>
                                <p className={styles.logAction}>
                                    {log.action.text}
                                </p>
                            </div>
                        </li>
                    );
                })}
            </ul>
        </div>
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
