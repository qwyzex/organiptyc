import { useOrganizationContext } from "@/context/OrganizationContext";
import { ReactNode } from "react";

/**
 * AdminWrap
 *
 * A higher-order component that wraps the given component
 * and only renders it if the user is an admin of the organization
 * specified in the URL query parameter.
 *
 * @param {object} props
 * @param {ReactNode} props.children - The component to wrap
 */
export default function AdminWrap({ children }: { children: ReactNode }) {
    const { isAdmin } = useOrganizationContext();

    return <>{isAdmin ? children : <></>}</>;
}
