import styles from "@/styles/components/Sidebar.module.sass";
import Link from "next/link";
import { useRouter } from "next/router";
import { ReactNode, useEffect, useRef, useState } from "react";

import collapseIconLibrary from "@/utils/collapseIconLibrary";
import { Button, Divider, IconButton } from "@mui/material";

type SidebarListItem = {
    title: string;
    href: string;
    collapseIcon: ReactNode | any;
    selectedIcon: ReactNode | any;
};

type SidebarList = {
    list: Array<SidebarListItem>;
};

/**
 * A sidebar component that displays a list of links
 * @param {SidebarList} list The list of links to display
 * @returns {JSX.Element} The sidebar component
 * @example
 * <Sidebar list={[
 *     {
 *         title: "Homepage",
 *         href: "/home",
 *         collapseIcon: collapseIconLibrary.Homepage,
 *         selectedIcon: collapseIconLibrary.selectedHomepage,
 *     },
 *     {
 *         title: "Organization",
 *         href: "/organization",
 *         collapseIcon: collapseIconLibrary.Organization,
 *         selectedIcon: collapseIconLibrary.selectedOrganization,
 *     },
 * ]} />
 */
const Sidebar = ({ list }: SidebarList) => {
    const router = useRouter();
    const sidebarRef = useRef<HTMLDivElement>(null);

    const [collapse, setCollapse] = useState<boolean>(false);

    const defaultList = [
        {
            title: "Homepage",
            href: "/home",
            collapseIcon: collapseIconLibrary.Homepage,
            selectedIcon: collapseIconLibrary.selectedHomepage,
        },
        {
            title: "Organization",
            href: "/organization",
            collapseIcon: collapseIconLibrary.Organization,
            selectedIcon: collapseIconLibrary.selectedOrganization,
        },
        {
            title: "New",
            href: "/organization/new",
            collapseIcon: collapseIconLibrary.NewOrganization,
            selectedIcon: collapseIconLibrary.selectedNewOrganization,
        },
    ];

    const paths = [
        "/organization",
        "/organization/new",
        "/organization/join",
        "/organization/create",
    ];

    const itemList = paths.includes(router.pathname) ? defaultList : list;

    const handleCollapse = () => {
        setCollapse(!collapse);
    };

    useEffect(() => {
        if (sidebarRef.current) {
            sidebarRef.current.style.width = collapse ? "20em" : "320px";
        }
    }, [collapse]);

    return (
        <>
            <aside
                ref={sidebarRef}
                className={`${styles.sidebar} ${collapse && styles.collapse}`}
                // style={{ transition: "width 0.3s ease-in-out" }}
            >
                <Button
                    onClick={handleCollapse}
                    className={styles.collapseButton}
                >
                    {collapse ? (
                        <collapseIconLibrary.ClosedCollapseSidebar />
                    ) : (
                        <collapseIconLibrary.OpenedCollapseSidebar />
                    )}
                </Button>
                <ul>
                    {itemList.map((item, i) => {
                        return (
                            <>
                                {item.href === "divider" ? (
                                    <Divider />
                                ) : (
                                    <li
                                        key={i}
                                        className={`${
                                            item.href == router.asPath
                                                ? styles.yesThisIsMe
                                                : ""
                                        }`}
                                    >
                                        <Link href={item.href}>
                                            {collapse ? (
                                                <Button className="fadeIn">
                                                    {item.href ==
                                                    router.asPath ? (
                                                        <item.selectedIcon fontSize="small" />
                                                    ) : (
                                                        <item.collapseIcon fontSize="small" />
                                                    )}
                                                </Button>
                                            ) : (
                                                <p className="fadeIn">
                                                    {item.title}
                                                </p>
                                            )}
                                        </Link>
                                    </li>
                                )}
                            </>
                        );
                    })}
                </ul>
            </aside>
        </>
    );
};

export default Sidebar;
