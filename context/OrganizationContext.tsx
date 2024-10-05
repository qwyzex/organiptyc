// contexts/OrganizationContext.tsx
import { createContext, useContext, ReactNode } from "react";

const OrganizationContext = createContext<{ orgId: string | null }>({
    orgId: null,
});

/**
 * OrganizationProvider
 *
 * @description A context provider for the organization context. This is used
 * to provide the orgId to all the components in the app.
 *
 * @param {ReactNode} children - The children of the component.
 * @param {string} orgId - The id of the organization.
 * @returns {JSX.Element} The provider component.
 */
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
