import { ReactNode } from "react";

import Header from "../Header";
import Sidebar from "../Sidebar";
import { NextPage } from "next";

type OrgLayoutProps = {
    children: ReactNode;
    orgId: string;
};

const OrgLayout: NextPage<OrgLayoutProps> = ({ children, orgId }) => {
    return (
        <div>
            <Header />
            <div className="sideAndMain">
                <Sidebar
                    list={[
                        { title: "Homepage", href: "/home" },
                        { title: "Organization", href: "/organization" },
                        { title: "Dashboard", href: `/organization/${orgId}` },
                        { title: "Members", href: `/organization/${orgId}/members` },
                        { title: "Programs", href: `/organization/${orgId}/programs` },
                        { title: "Files", href: `/organization/${orgId}/files` },
                        { title: "Message", href: `/organization/${orgId}/message` },
                        { title: "Settings", href: `/organization/${orgId}/settings` },
                    ]}
                />
                <main className="mainLayout">{children}</main>
            </div>
        </div>
    );
};

export const getServerSideProps = async (context: any) => {
    const { orgId } = context.params;

    return {
        props: {
            orgId,
        },
    };
};

export default OrgLayout;
