import { useRouter } from "next/router";
import { ReactNode } from "react";
import EmptyLayout from "./EmptyLayout";
import { ProgramDashboard } from "@/pages/organization/[orgId]/program/[programId]";

/**
 * A layout component that renders either the ProgramDashboard or EmptyLayout
 * depending on the route.
 *
 * If the route matches the programPathPattern, it renders the ProgramDashboard.
 * Otherwise, it renders the EmptyLayout.
 *
 * @param children The children to be rendered inside the layout.
 */
export default function ProgramDashboardLayout({
    children,
}: {
    children: ReactNode;
}) {
    const router = useRouter();

    const programPathPattern =
        /^\/organization\/[^\/]+\/program\/(?!(?:new|foo)(?:\/|$))[^\/]+(\/.*)?$/;

    return (
        <>
            {programPathPattern.test(router.pathname) ? (
                <ProgramDashboard>{children}</ProgramDashboard>
            ) : (
                <EmptyLayout>{children}</EmptyLayout>
            )}
        </>
    );
}
