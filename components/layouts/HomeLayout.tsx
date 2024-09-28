import { ReactNode, useContext } from "react";

import styles from "@/styles/layouts/HomeLayout.module.sass";
import Image from "next/image";
import { UserContext } from "@/context/UserContext";

import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

import collapseIconLibrary from "@/utils/collapseIconLibrary";

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
                            collapseIcon: collapseIconLibrary.Homepage,
                        },
                        {
                            title: "Organization",
                            href: "/organization",
                            collapseIcon: collapseIconLibrary.Organization,
                        },
                        {
                            title: "Message",
                            href: "/message",
                            collapseIcon: collapseIconLibrary.Messages,
                        },
                        {
                            title: "Notification",
                            href: "/notification",
                            collapseIcon: collapseIconLibrary.Notification,
                        },
                        {
                            title: "Settings",
                            href: "/settings",
                            collapseIcon: collapseIconLibrary.Settings,
                        },
                    ]}
                />
                <main className="mainLayout">{children}</main>
            </div>
        </div>
    );
};

export default HomeLayout;
