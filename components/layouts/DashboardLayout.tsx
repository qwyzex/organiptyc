import { ReactNode } from "react";

type DashboardLayoutProps = {
    children: ReactNode;
};

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
    return (
        <div>
            <aside>Sidebar</aside>
            <div>
                <header>Dashboard Navbar</header>
                <main>{children}</main>
            </div>
        </div>
    );
};

export default DashboardLayout;
