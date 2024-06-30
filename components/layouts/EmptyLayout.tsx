import { ReactNode } from "react";

type EmptyLayoutProps = {
    children: ReactNode;
};

const EmptyLayout = ({ children }: EmptyLayoutProps) => {
    return (
        <div>
            empty
            {children}

        </div>
    );
};

export default EmptyLayout;
