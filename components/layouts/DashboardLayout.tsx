import { ReactNode, useContext } from "react";

import styles from "@/styles/DashboardLayout.module.sass";
import Image from "next/image";
import { UserContext } from "@/context/UserContext";

type DashboardLayoutProps = {
    children: ReactNode;
};

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
    const { loading, authUser, userDoc } = useContext(UserContext);

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1>Organiptyc</h1>
                <div className={styles.profile}>
                    <div>{!loading && userDoc ? `${userDoc.firstName} ${userDoc.lastName}` : "..."}</div>

                    <Image
                        src="https://www.gravatar.com/avatar/2c7d99fe281ecd3bcd65ab915bac6dd5?s=250"
                        alt="User Avatar"
                        width={50}
                        height={50}
                    />
                </div>
            </header>
            <div className={styles.box}>
                <aside className={styles.sidebar}>
                    <ul>
                        <li>Homepage</li>
                        <li>Organization</li>
                        <li>Message</li>
                        <li>Notification</li>
                        <li>Settings</li>
                    </ul>
                </aside>
                <main>{children}</main>
            </div>
        </div>
    );
};

export default DashboardLayout;
