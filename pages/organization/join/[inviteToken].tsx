import React, { useEffect, useContext } from "react";
import { useRouter } from "next/router";
import handleInviteLink from "@/function/handleInviteLink";
import { UserContext } from "@/context/UserContext";
import Head from "next/head";

const InviteJoin = () => {
    const router = useRouter();
    const { inviteToken } = router.query;
    const { loading, authUser } = useContext(UserContext);

    useEffect(() => {
        if (authUser && inviteToken) {
            handleInviteLink(inviteToken as string, authUser.uid)
                .then((orgId) => router.push(`/organization/${orgId}`))
                .catch((error) => alert(error.message));
        }
        // eslint-disable-next-line
    }, [authUser, inviteToken]);

    if (!loading && !authUser) {
        return <div>NO USER. PLEASE LOG IN FIRST</div>;
    }

    return (
        <>
            <Head>
                <title>Joining...</title>
            </Head>
            <div>Joining organization...</div>
        </>
    );
};

export default InviteJoin;
