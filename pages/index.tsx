import Head from "next/head";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/firebase";

import { onAuthStateChanged } from "firebase/auth";
import { useContext, useEffect, useState } from "react";
import { getUserData, redirect } from "@/function/";

import Image from "next/image";
import { Inter } from "next/font/google";
import styles from "@/styles/Home.module.css";
import { UserContext } from "@/context/UserContext";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
    const { loading } = useContext(UserContext);

    return (
        <>
            <Head>
                <title>Organiptyc</title>
                <meta name="description" content="Organiptyc" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
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
