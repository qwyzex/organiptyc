import { NextPage } from "next";
import { useRouter } from "next/router";
import { doc, getDoc, DocumentData } from "firebase/firestore";
import { useContext, useEffect, useState } from "react";
import { db } from "@/firebase";
import { UserContext } from "@/context/UserContext";
import Image from "next/image";
import useOrganizationData from "@/function/useOrganizationData";
// import { logDoc } from "@/function/createLog";
import fetchLogs from "@/function/fetchLogs";
import fetchAnyUser from "@/function/fetchAnyUser";

type OrganizationProps = {
    orgId: string;
};

const OrganizationPage: NextPage<OrganizationProps> = ({ orgId }) => {
    const [error, setError] = useState<string | null>(null);
    const [logs, setLogs] = useState<Array<any> | null>(null);
    const { orgData } = useOrganizationData(orgId);
    const router = useRouter();

    const { loading, authUser } = useContext(UserContext);

    useEffect(() => {
        if (orgId) {
            fetchLogs(orgId).then(setLogs).catch(setError);
        }
    }, [orgId]);


    if (error) {
        return <div>{error}</div>;
    }

    if (!orgData) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <header>
                <Image
                    src={orgData.logoURL}
                    alt={`${orgData.name} logo`}
                    height={100}
                    width={100}
                    priority
                ></Image>
                <article>
                    <p>Created on : {orgData.createdAt.toDate().toDateString()}</p>

                    <h1>{orgData.name}</h1>
                    <p></p>
                </article>
            </header>
            <main>
                {logs?.map((log) => {
                    return (
                        <div key={log.id}>
                            <Image
                                src={log.photoURL}
                                alt=""
                                height={50}
                                width={50}
                            ></Image>
                            <p>{log.timestamp.toDate().toDateString()}</p>
                            <p>{log.action}</p>
                        </div>
                    );
                })}
            </main>
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
