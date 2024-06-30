import "@/styles/globals.sass";
import { useRouter } from "next/router";
import { useEffect, useContext } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/firebase";
import type { AppProps } from "next/app";
import { UserProvider } from "@/context/UserContext";
import getLayoutByRoute from "@/utils/layouts";
import { UserContext } from "@/context/UserContext";

import Head from "next/head";

export default function App({ Component, pageProps }: AppProps) {
    const router = useRouter();
    const Layout = getLayoutByRoute(router.pathname);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            const strangerPage = ["/", "/signin", "/signup"];

            if (!user && !strangerPage.includes(router.pathname)) {
                router.push("/signin");
            }
        });

        return () => unsubscribe();
    }, [router]);

    return (
        <UserProvider>
            <Head>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/logo.ico" />
            </Head>
            <Layout>
                <Component {...pageProps} />
            </Layout>
        </UserProvider>
    );
}
