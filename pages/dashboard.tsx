import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/firebase";
import { UserContext } from "@/context/UserContext";
import { useContext } from "react";
import { useRouter } from "next/router";

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
            {!loading && authUser ? (
                <div>
                    <p>Email: {userDoc?.email}</p>
                    <p>
                        Name: {userDoc?.firstName} {userDoc?.lastName}
                    </p>
                    {authUser.emailVerified ? (
                        <p>Email is verified</p>
                    ) : (
                        <p>Email is not verified</p>
                    )}
                    <button onClick={newOrganization}>New Organization</button>
                    <button onClick={logout}>Logout</button>
                </div>
            ) : (
                <p>No user logged in</p>
            )}
        </div>
    );
};

export default Dashboard;
