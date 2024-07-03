import { NextPage } from "next";
import { useRouter } from "next/router";
import { doc, getDoc } from "firebase/firestore";
import { useContext, useEffect, useState } from "react";
import { db } from "@/firebase";
import { UserContext } from "@/context/UserContext";

type OrganizationProps = {
    orgId: string;
};

const OrganizationPage: NextPage<OrganizationProps> = ({ orgId }) => {
    const [organization, setOrganization] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const { loading, authUser } = useContext(UserContext);

    useEffect(() => {
        const fetchOrganization = async () => {
            try {
                console.log(1)
                const orgRef = doc(db, "organizations", orgId);
                console.log(2)
                const orgDoc = await getDoc(orgRef);
                
                console.log(3)
                if (orgDoc.exists()) {
                    console.log(4)
                    setOrganization(orgDoc.data());
                } else {
                    setError("Organization not found.");
                }
            } catch (err) {
                setError(JSON.stringify(err));
            }
        };
        
        if (orgId && !loading && authUser) {
            console.log(orgId);
            console.log(authUser.uid);
            console.log(0)
            fetchOrganization();
            console.log(9)
        }
    }, [orgId, loading, authUser]);

    if (error) {
        return <div>{error}</div>;
    }

    if (!organization) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <h1>{organization.name}</h1>
            <p>{organization.description}</p>
            <p>
                Created At:{" "}
                {new Date(organization.createdAt.seconds * 1000).toLocaleDateString()}
            </p>
            {/* Display other organization details */}
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
