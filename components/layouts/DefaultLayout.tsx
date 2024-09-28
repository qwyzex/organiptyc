import { ReactNode, useEffect } from "react";
import Header from "../Header";
import Sidebar from "../Sidebar";
import { NextPage } from "next";
import { useRouter } from "next/router";
import collapseIconLibrary from "@/utils/collapseIconLibrary";

type LayoutProps = {
    children: ReactNode;
};

const DefaultLayout: NextPage<LayoutProps> = ({ children }) => {
    const router = useRouter();

    const { orgId } = router.query;
    const pathname = router.pathname;

    const sidebarListOrg: any = [
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
            title: "Divider",
            href: "divider",
            collapseIcon: "",
            selectedIcon: "",
        },
        {
            title: "Dashboard",
            href: `/organization/${orgId as string}`,
            collapseIcon: collapseIconLibrary.Dashboard,
            selectedIcon: collapseIconLibrary.selectedDashboard,
        },
        {
            title: "Members",
            href: `/organization/${orgId as string}/members`,
            collapseIcon: collapseIconLibrary.Members,
            selectedIcon: collapseIconLibrary.selectedMembers,
        },
        {
            title: "Programs",
            href: `/organization/${orgId as string}/programs`,
            collapseIcon: collapseIconLibrary.Programs,
            selectedIcon: collapseIconLibrary.selectedPrograms,
        },
        {
            title: "Files",
            href: `/organization/${orgId as string}/files`,
            collapseIcon: collapseIconLibrary.Files,
            selectedIcon: collapseIconLibrary.selectedFiles,
        },
        {
            title: "Message",
            href: `/organization/${orgId as string}/message`,
            collapseIcon: collapseIconLibrary.Messages,
            selectedIcon: collapseIconLibrary.selectedMessages,
        },
        {
            title: "Settings",
            href: `/organization/${orgId as string}/settings`,
            collapseIcon: collapseIconLibrary.Settings,
            selectedIcon: collapseIconLibrary.selectedSettings,
        },
    ];

    const sidebarListHome: any = [
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
            title: "Message",
            href: "/message",
            collapseIcon: collapseIconLibrary.Messages,
            selectedIcon: collapseIconLibrary.selectedMessages,
        },
        {
            title: "Notification",
            href: "/notification",
            collapseIcon: collapseIconLibrary.Notification,
            selectedIcon: collapseIconLibrary.selectedNotification,
        },
        {
            title: "Settings",
            href: "/settings",
            collapseIcon: collapseIconLibrary.Settings,
            selectedIcon: collapseIconLibrary.selectedSettings,
        },
    ];

    return (
        <div className="root">
            <Header />
            <div className="sideAndMain">
                <Sidebar
                    list={
                        router.pathname.startsWith("/home") ||
                        router.pathname.startsWith("/profile") ||
                        router.pathname.startsWith("/settings")
                            ? sidebarListHome
                            : router.pathname.startsWith("/org") &&
                              sidebarListOrg
                    }
                />
                <main className="mainLayout">{children}</main>
            </div>
        </div>
    );
};

export default DefaultLayout;
