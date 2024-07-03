import styles from "@/styles/components/Sidebar.module.sass";
import { useRouter } from "next/router";
import { useEffect } from "react";

type SidebarListItem = {
    title: string;
    href: string;
};

type SidebarList = {
    list: Array<SidebarListItem>;
};

const Sidebar = ({ list }: SidebarList) => {
    const router = useRouter();

    const defaultList = [
        {
            title: "Homepage",
            href: "/home",
        },
        {
            title: "Organization",
            href: "/organization",
        },
        {
            title: "New",
            href: "/organization/new",
        },
    ];

    const paths = [
        "/organization",
        "/organization/new",
        "/organization/join",
        "/organization/create",
    ];

    const itemList = paths.includes(router.pathname) ? defaultList : list;

    return (
        <>
            <aside className={styles.sidebar}>
                <ul>
                    {itemList.map((item, i) => {
                        return (
                            <li
                                key={i}
                                className={`${
                                    item.href == router.asPath ? styles.yesThisIsMe : ""
                                }`}
                                onClick={() => {
                                    if (item.href != router.pathname) {
                                        router.push(item.href);
                                    }
                                }}
                            >
                                {item.title}
                            </li>
                        );
                    })}
                </ul>
            </aside>
        </>
    );
};

export default Sidebar;
