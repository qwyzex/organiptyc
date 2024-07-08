import { ReactNode, useContext } from "react";

import styles from "@/styles/layouts/HomeLayout.module.sass";
import Image from "next/image";
import { UserContext } from "@/context/UserContext";

import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

type HomeLayoutProps = {
    children: ReactNode;
};

const HomeLayout = ({ children }: HomeLayoutProps) => {
    const { loading, authUser, userDoc } = useContext(UserContext);

    return (
        <div className={`${styles.container} root`}>
            <Header />
            <div className="sideAndMain">
                <Sidebar
                    list={[
                        {
                            title: "Homepage",
                            href: "/home",
                        },
                        {
                            title: "Organization",
                            href: "/organization",
                        },
                        {
                            title: "Message",
                            href: "/message",
                        },
                        {
                            title: "Notification",
                            href: "/notification",
                        },
                        {
                            title: "Settings",
                            href: "/settings",
                        },
                    ]}
                />
                <main className="mainLayout">{children}</main>
            </div>
        </div>
    );
};

export default HomeLayout;
