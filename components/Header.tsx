import Image from "next/image";
import { useContext } from "react";
import { UserContext } from "@/context/UserContext";

import styles from "@/styles/components/Header.module.sass";

export default function Header() {
    const { loading, authUser, userDoc } = useContext(UserContext);

    return (
        <>
            <header className={styles.header}>
                <h1>Organiptyc</h1>
                <div className={styles.profile}>
                    <div>
                        {!loading && userDoc
                            ? `${userDoc.firstName} ${userDoc.lastName}`
                            : "..."}
                    </div>

                    <Image
                        src="https://www.gravatar.com/avatar/2c7d99fe281ecd3bcd65ab915bac6dd5?s=250"
                        alt="User Avatar"
                        width={50}
                        height={50}
                    />
                </div>
            </header>
        </>
    );
}
