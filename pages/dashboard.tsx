import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/firebase";
import { UserContext } from "@/context/UserContext";
import { useContext } from "react";
import { useRouter } from "next/router";

import styles from "@/styles/Dashboard.module.sass";

import Head from "next/head";

const Dashboard = () => {
    const router = useRouter();
    const { loading, authUser, userDoc } = useContext(UserContext);

    function logout() {
        signOut(auth);
    }

    const newOrganization = () => {
        router.push("/organization");
    };

    return (
        <div>
            <Head>
                <title>Dashboard</title>
                <meta name="description" content="Organiptyc" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
            </Head>
            {!loading && authUser ? (
                <div className={styles.container}>

                    <p>
                        Email: {userDoc?.email}, {authUser.uid}
                    </p>
                    <p>
                        Name: {userDoc?.firstName} {userDoc?.lastName}
                    </p>
                    {authUser.emailVerified ? (
                        <p>Email is verified</p>
                    ) : (
                        <p>Email is not verified</p>
                    )}
                    <button className="btn-def" onClick={newOrganization}>
                        New Organization
                    </button>
                    <button className="btn-ref" onClick={logout}>
                        Logout
                    </button>
                </div>
            ) : (
                <p>Loading...</p>
            )}
        </div>
    );
};

export default Dashboard;
