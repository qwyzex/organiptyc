// contexts/OrganizationContext.tsx
import { createContext, useContext, ReactNode } from "react";

const OrganizationContext = createContext<{ orgId: string | null }>({ orgId: null });

export const OrganizationProvider = ({
    children,
    orgId,
}: {
    children: ReactNode;
    orgId: string;
}) => {
    return (
        <OrganizationContext.Provider value={{ orgId }}>
            {children}
        </OrganizationContext.Provider>
    );
};

export const useOrganization = () => useContext(OrganizationContext);
