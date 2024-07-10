import "@/styles/globals.sass";

import { useRouter } from "next/router";
import { useEffect, useContext, useMemo } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/firebase";
import type { AppProps } from "next/app";
import { UserProvider } from "@/context/UserContext";
import getLayoutByRoute from "@/utils/layouts";
import { SnackbarProvider } from "notistack";
import { ThemeProvider, createTheme } from "@mui/material/styles";

import useMediaQuery from "@mui/material/useMediaQuery";

import Head from "next/head";

export default function App({ Component, pageProps }: AppProps) {
    const router = useRouter();
    const Layout = getLayoutByRoute(router.pathname);
    const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");

    const theme = useMemo(
        () =>
            createTheme({
                palette: {
                    mode: prefersDarkMode ? "dark" : "light",
                    primary: {
                        light: "#8A8FF8",
                        main: "#9fa4fa",
                        dark: "#787ee9",
                    },
                    secondary: {
                        light: "#8A8FF8",
                        main: "#9fa4fa",
                        dark: "#787ee9",
                    },
                },
            }),
        [prefersDarkMode]
    );

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
            <ThemeProvider theme={theme}>
                <SnackbarProvider maxSnack={4}>
                    <Layout {...pageProps}>
                        <Component {...pageProps} />
                    </Layout>
                </SnackbarProvider>
            </ThemeProvider>
        </UserProvider>
    );
}
