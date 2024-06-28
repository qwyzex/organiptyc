import "@/styles/globals.css";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/firebase";
import type { AppProps } from "next/app";
import { UserProvider } from "@/context/UserContext";
import getLayoutByRoute from "@/utils/layouts";

export default function App({ Component, pageProps }: AppProps) {
    const router = useRouter();
    const Layout = getLayoutByRoute(router.pathname);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            const strangerPage = ["/", "/signin", "/signup"];

            if (user && strangerPage.includes(router.pathname)) {
                router.push("/dashboard"); // Redirect to dashboard page if authenticated and accessing a public route
            } else if (!user && !strangerPage.includes(router.pathname)) {
                router.push("/signin"); // Redirect to signin page if not authenticated and accessing a private route
            }
        });

        return () => unsubscribe();
    }, [router]);

    return (
        <UserProvider>
            <Layout>
                <Component {...pageProps} />
            </Layout>
        </UserProvider>
    );
}
