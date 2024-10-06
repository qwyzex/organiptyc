import { act, ReactNode, useEffect } from "react";
import Header from "../Header";
import Sidebar, { SidebarListItem } from "../Sidebar";
import { NextPage } from "next";
import { useRouter } from "next/router";
import collapseIconLibrary from "@/utils/collapseIconLibrary";

type LayoutProps = {
    children: ReactNode;
};

/**
 * The default layout for pages.
 *
 * This layout is used by pages that are not explicitly
 * assigned to a different layout.
 *
 * The layout consists of a header, a sidebar, and a main
 * content area.
 *
 * The sidebar is populated with a list of links to
 * different pages. The list is determined by the
 * current route.
 *
 * If the current route is a home route (e.g. /home,
 * /profile, /settings), the sidebar will contain links
 * to other home routes.
 *
 * If the current route is an organization route (e.g.
 * /organization/{orgId}, /organization/{orgId}/members),
 * the sidebar will contain links to other organization
 * routes.
 *
 * @param {ReactNode} children The content of the page.
 * @returns {JSX.Element} The layout component.
 */
const DefaultLayout: NextPage<LayoutProps> = ({
    children,
}: {
    children: ReactNode;
}) => {
    const router = useRouter();

    const { orgId } = router.query;
    const pathname = router.pathname;

    const sidebarListOrg: SidebarListItem[] = [
        {
            title: "Homepage",
            href: "/home",
            collapseIcon: collapseIconLibrary.Homepage,
            selectedIcon: collapseIconLibrary.selectedHomepage,
            activeLogic: /^\/home$/,
        },
        {
            title: "Organization",
            href: "/organization",
            collapseIcon: collapseIconLibrary.Organization,
            selectedIcon: collapseIconLibrary.selectedOrganization,
            activeLogic: /^\/organization$/,
        },
        {
            title: "Divider",
            href: "divider",
            collapseIcon: "",
            selectedIcon: "",
            activeLogic: /$/,
        },
        {
            title: "Dashboard",
            href: `/organization/${orgId as string}`,
            collapseIcon: collapseIconLibrary.Dashboard,
            selectedIcon: collapseIconLibrary.selectedDashboard,
            activeLogic: /^\/organization\/[A-Za-z0-9\-]+$/,
        },
        {
            title: "Members",
            href: `/organization/${orgId as string}/members`,
            collapseIcon: collapseIconLibrary.Members,
            selectedIcon: collapseIconLibrary.selectedMembers,
            activeLogic: /^\/organization\/[A-Za-z0-9\-]+\/members$/,
        },
        {
            title: "Programs",
            href: `/organization/${orgId as string}/program`,
            collapseIcon: collapseIconLibrary.Programs,
            selectedIcon: collapseIconLibrary.selectedPrograms,
            activeLogic: /^\/organization\/[A-Za-z0-9\-]+\/program(\/.*)?$/,
        },
        {
            title: "Files",
            href: `/organization/${orgId as string}/files`,
            collapseIcon: collapseIconLibrary.Files,
            selectedIcon: collapseIconLibrary.selectedFiles,
            activeLogic: /^\/organization\/[A-Za-z0-9\-]+\/files$/,
        },
        {
            title: "Message",
            href: `/organization/${orgId as string}/message`,
            collapseIcon: collapseIconLibrary.Messages,
            selectedIcon: collapseIconLibrary.selectedMessages,
            activeLogic: /^\/organization\/[A-Za-z0-9\-]+\/message$/,
        },
        {
            title: "Settings",
            href: `/organization/${orgId as string}/settings`,
            collapseIcon: collapseIconLibrary.Settings,
            selectedIcon: collapseIconLibrary.selectedSettings,
            activeLogic: /^\/organization\/[A-Za-z0-9\-]+\/settings$/,
        },
    ];

    const sidebarListHome: SidebarListItem[] = [
        {
            title: "Homepage",
            href: "/home",
            collapseIcon: collapseIconLibrary.Homepage,
            selectedIcon: collapseIconLibrary.selectedHomepage,
            activeLogic: /^\/home$/,
        },
        {
            title: "Organization",
            href: "/organization",
            collapseIcon: collapseIconLibrary.Organization,
            selectedIcon: collapseIconLibrary.selectedOrganization,
            activeLogic: /^\/organization$/,
        },
        {
            title: "Message",
            href: "/message",
            collapseIcon: collapseIconLibrary.Messages,
            selectedIcon: collapseIconLibrary.selectedMessages,
            activeLogic: /^\/message$/,
        },
        {
            title: "Notification",
            href: "/notification",
            collapseIcon: collapseIconLibrary.Notification,
            selectedIcon: collapseIconLibrary.selectedNotification,
            activeLogic: /^\/notification$/,
        },
        {
            title: "Settings",
            href: "/settings",
            collapseIcon: collapseIconLibrary.Settings,
            selectedIcon: collapseIconLibrary.selectedSettings,
            activeLogic: /^\/settings$/,
        },
    ];

    return (
        <div className="root">
            <Header />
            <div className="sideAndMain">
                <Sidebar
                    list={
                        // sidebarListHome
                        router.pathname.startsWith("/home") ||
                        router.pathname.startsWith("/profile") ||
                        router.pathname.startsWith("/settings")
                            ? sidebarListHome
                            : (router.pathname.startsWith("/org") &&
                                  sidebarListOrg) ||
                              []
                    }
                />
                <main className="mainLayout">{children}</main>
            </div>
        </div>
    );
};

export default DefaultLayout;
