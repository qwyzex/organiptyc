import { ReactNode } from "react";

type LandingLayoutProps = {
    children: ReactNode;
};

const LandingLayout = ({ children }: LandingLayoutProps) => {
    return (
        <div className="root">
            <header>Landing Header</header>
            <main>{children}</main>
            <footer>Landing Footer</footer>
        </div>
    );
};

export default LandingLayout;
