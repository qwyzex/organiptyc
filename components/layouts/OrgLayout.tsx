import { ReactNode } from "react";
import { OrganizationProvider } from "@/context/OrganizationContext";

import Header from "../Header";
import Sidebar from "../Sidebar";
import { NextPage } from "next";
import { useRouter } from "next/router";
import collapseIconLibrary from "@/utils/collapseIconLibrary";

type OrgLayoutProps = {
    children: ReactNode;
    // orgId: string;
};

const OrgLayout: NextPage<OrgLayoutProps> = ({ children }) => {
    const router = useRouter();
    const { orgId } = router.query;

    return (
        <OrganizationProvider orgId={orgId as string}>
            <div className="root">
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
                                title: "Dashboard",
                                href: `/organization/${orgId}`,
                                collapseIcon: collapseIconLibrary.Dashboard,
                            },
                            {
                                title: "Members",
                                href: `/organization/${orgId}/members`,
                                collapseIcon: collapseIconLibrary.Members,
                            },
                            {
                                title: "Programs",
                                href: `/organization/${orgId}/programs`,
                                collapseIcon: collapseIconLibrary.Programs,
                            },
                            {
                                title: "Files",
                                href: `/organization/${orgId}/files`,
                                collapseIcon: collapseIconLibrary.Files,
                            },
                            {
                                title: "Message",
                                href: `/organization/${orgId}/message`,
                                collapseIcon: collapseIconLibrary.Messages,
                            },
                            {
                                title: "Settings",
                                href: `/organization/${orgId}/settings`,
                                collapseIcon: collapseIconLibrary.Settings,
                            },
                        ]}
                    />
                    <main className="mainLayout">{children}</main>
                </div>
            </div>
        </OrganizationProvider>
    );
};

export default OrgLayout;
