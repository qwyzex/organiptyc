import { NextPage } from "next";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import styles from "@/styles/organization/orgId/ProgramDashboard.module.sass";
import useOrganizationData from "@/function/useOrganizationData";
import Loading from "@/components/Loading";
import useProgramData from "@/function/useProgramData";
import { Divider, IconButton, Skeleton } from "@mui/material";
import { ArrowBackIos } from "@mui/icons-material";
import Head from "next/head";
import Link from "next/link";
import { ReactNode, useEffect, useState } from "react";

// Layout wrapper for program dashboard
export const ProgramDashboard = ({ children }: { children: ReactNode }) => {
    const router = useRouter();
    const { orgId, programId } = router.query;

    const { orgData, loading, error } = useOrganizationData(orgId as string);
    const {
        programData,
        loading: programLoading,
        error: programError,
    } = useProgramData({
        orgId: orgId as string,
        programId: programId as string,
    });

    const returnProgramStatus = (status: string) => {
        switch (status) {
            case "upcoming":
                return "Upcoming";
            case "ongoing":
                return "Ongoing";
            case "completed":
                return "Successfull";
            case "failed":
                return "Failed";
            default:
                "Unset";
                break;
        }
    };

    useEffect(() => {
        console.log(router.asPath.split("/"));
    }, [router.asPath]);

    return (
        <>
            <Head>
                <title>{programData?.name || "Loading..."}</title>
            </Head>
            <main className={styles.container}>
                <header className={styles.programHeader}>
                    <div>
                        <IconButton
                            onClick={() =>
                                router.push(`/organization/${orgId}/programs`)
                            }
                        >
                            <ArrowBackIos fontSize="small" />
                        </IconButton>
                        {programData ? (
                            <h1 className="fadeIn">{programData.name}</h1>
                        ) : (
                            <Skeleton animation="wave" width={140} />
                        )}
                        <div
                            className={
                                programData?.status == "upcoming"
                                    ? styles.upcoming
                                    : programData?.status == "ongoing"
                                    ? styles.ongoing
                                    : programData?.status == "completed"
                                    ? styles.completed
                                    : programData?.status == "failed"
                                    ? styles.failed
                                    : styles.unset
                            }
                        >
                            {returnProgramStatus(programData?.status)}
                        </div>
                    </div>
                    <div className={styles.programDates}>
                        {programData?.dateStart.toDate().toDateString()} -{" "}
                        {programData?.dateEnd.toDate().toDateString()}
                    </div>
                </header>
                <nav className={styles.tabs}>
                    <ul>
                        <li
                            className={
                                router.asPath.split("/").length == 5
                                    ? styles.selected
                                    : ""
                            }
                        >
                            <Link
                                href={
                                    programData
                                        ? `/organization/${orgId}/program/${programId}/`
                                        : ""
                                }
                            >
                                Overview
                            </Link>
                        </li>
                        <li
                            className={
                                router.asPath.split("/").includes("committee")
                                    ? styles.selected
                                    : ""
                            }
                        >
                            <Link
                                href={
                                    programData
                                        ? `/organization/${orgId}/program/${programId}/committee`
                                        : ""
                                }
                            >
                                Committee
                            </Link>
                        </li>
                        <li
                            className={
                                router.asPath.split("/").includes("tasks")
                                    ? styles.selected
                                    : ""
                            }
                        >
                            <Link
                                href={
                                    programData
                                        ? `/organization/${orgId}/program/${programId}/tasks`
                                        : ""
                                }
                            >
                                Tasks
                            </Link>
                        </li>
                        <li
                            className={
                                router.asPath.split("/").includes("budgets")
                                    ? styles.selected
                                    : ""
                            }
                        >
                            <Link
                                href={
                                    programData
                                        ? `/organization/${orgId}/program/${programId}/budgets`
                                        : ""
                                }
                            >
                                Budgets
                            </Link>
                        </li>
                        <li
                            className={
                                router.asPath.split("/").includes("files")
                                    ? styles.selected
                                    : ""
                            }
                        >
                            <Link
                                href={
                                    programData
                                        ? `/organization/${orgId}/program/${programId}/files`
                                        : ""
                                }
                            >
                                Files
                            </Link>
                        </li>
                        <li
                            className={
                                router.asPath.split("/").includes("settings")
                                    ? styles.selected
                                    : ""
                            }
                        >
                            <Link
                                href={
                                    programData
                                        ? `/organization/${orgId}/program/${programId}/settings`
                                        : ""
                                }
                            >
                                Settings
                            </Link>
                        </li>
                    </ul>
                </nav>
                <Divider />
                {!loading && !programLoading && programData ? (
                    <section className={`${styles.openTab} fadeIn`}>
                        {children}
                    </section>
                ) : (
                    <Loading />
                )}
            </main>
        </>
    );
};

const ProgramOverview = () => {
    const router = useRouter();
    const { orgId, programId } = router.query;
    const {
        programData,
        loading: programLoading,
        error: programError,
    } = useProgramData({
        orgId: orgId as string,
        programId: programId as string,
    });

    return (
        <div>
            <header>
                <h2>Program Overview</h2>
            </header>
            <section>
                <p>{programData?.description}</p>
                <div>
                    {programData?.usefulLinks.map((link: any, i: number) => (
                        <p key={i}>{link}</p>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default ProgramOverview;
