import { useRouter } from "next/router";
import { ReactNode } from "react";
import EmptyLayout from "./EmptyLayout";
import { ProgramDashboard } from "@/pages/organization/[orgId]/program/[programId]";

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
