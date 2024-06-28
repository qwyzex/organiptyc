import { ReactNode } from "react";

type OrgLayoutProps = {
    children: ReactNode;
};

const OrgLayout = ({ children }: OrgLayoutProps) => {
    return (
        <div>
            <aside>Organization Sidebar</aside>
            <div>
                <header>Organization Navbar</header>
                <main>{children}</main>
            </div>
        </div>
    );
};

export default OrgLayout;
