import Head from "next/head";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/firebase";

import { onAuthStateChanged } from "firebase/auth";
import { useContext, useEffect, useState } from "react";
import { getUserData, redirect } from "@/function/";

import Image from "next/image";
import styles from "@/styles/Home.module.css";
import { UserContext } from "@/context/UserContext";
import { useRouter } from "next/router";

export default function Home() {
    const { loading, authUser } = useContext(UserContext);

    const router = useRouter();

    useEffect(() => {
        if (authUser) {
            router.push("/home");
            return;
        }
    });

    return (
        <>
            <Head>
                <title>Organiptyc</title>
                <meta name="description" content="Organiptyc" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
            </Head>
            <main>
                {loading ? (
                    <>LOADING...</>
                ) : (
                    <>
                        <div>WELCOME TO ORGANIPTYC!</div>
                        <button onClick={() => redirect("/signup")}>SIGN UP</button>
                        <button onClick={() => redirect("/signin")}>SIGN IN</button>
                    </>
                )}
            </main>
        </>
    );
}
