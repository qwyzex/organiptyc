import { ReactNode } from "react";

type AuthLayoutProps = {
    children: ReactNode;
};

const AuthLayout = ({ children }: AuthLayoutProps) => {
    return (
        <div className="root">
            <h2>AUTHENTICATION</h2>
            <main>{children}</main>
        </div>
    );
};

export default AuthLayout;
