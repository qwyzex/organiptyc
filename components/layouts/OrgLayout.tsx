import { ReactNode } from "react";
import { OrganizationProvider } from "@/context/OrganizationContext";

import Header from "../Header";
import Sidebar from "../Sidebar";
import { NextPage } from "next";
import { useRouter } from "next/router";

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
                            { title: "Homepage", href: "/home" },
                            { title: "Organization", href: "/organization" },
                            { title: "Dashboard", href: `/organization/${orgId}` },
                            { title: "Members", href: `/organization/${orgId}/members` },
                            {
                                title: "Programs",
                                href: `/organization/${orgId}/programs`,
                            },
                            { title: "Files", href: `/organization/${orgId}/files` },
                            { title: "Message", href: `/organization/${orgId}/message` },
                            {
                                title: "Settings",
                                href: `/organization/${orgId}/settings`,
                            },
                        ]}
                    />
                    <main className="mainLayout">{children}</main>
                </div>
            </div>
        </OrganizationProvider>
    );
};

// export const getServerSideProps = async (context: any) => {
//     console.log(0);
//     const { orgId } = context.params;
//     console.log(1);

//     return {
//         props: {
//             orgId,
//         },
//     };
// };

export default OrgLayout;
