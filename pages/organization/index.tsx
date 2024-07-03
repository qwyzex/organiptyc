import { useState, useEffect, useContext } from "react";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase";
import { UserContext } from "@/context/UserContext";
import { useRouter } from "next/router";
import fetchUserOrgs from "@/function/fetchUserOrgs";

const Organization = () => {
    const [organizations, setOrganizations] = useState<any>([]);
    const [listLoading, setListLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>("");
    const { userDoc, loading, authUser } = useContext(UserContext);
    const router = useRouter();

    useEffect(() => {
        if (authUser) {
            fetchUserOrgs(authUser.uid, setListLoading)
                .then(setOrganizations)
                .catch(setError);
        }
    }, [authUser]);

    if (error) return <div>Error: {error}</div>;

    return (
        <div>
            <h1>Your Organizations</h1>
            <ul>
                {!listLoading ? (
                    organizations.map((org: any) => (
                        <li
                            key={org.uid}
                            onClick={() => router.push(`/organization/${org.uid}`)}
                        >
                            <h2>{org.name}</h2>
                            <p>{org.description}</p>
                        </li>
                    ))
                ) : (
                    <>Loading...</>
                )}
            </ul>
        </div>
    );
};

export default Organization;
