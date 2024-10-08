import { NextPage } from "next";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import styles from "@/styles/organization/orgId/ProgramDashboard.module.sass";
import Loading from "@/components/Loading";
import useProgramData from "@/function/useProgramData";
import {
    Box,
    Button,
    Divider,
    FormControl,
    IconButton,
    MenuItem,
    Modal,
    Select,
    Skeleton,
} from "@mui/material";
import { ArrowBackIos, ArrowBackIosNew, Close } from "@mui/icons-material";
import Head from "next/head";
import Link from "next/link";
import {
    Children,
    cloneElement,
    ReactNode,
    useContext,
    useEffect,
    useState,
} from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase";
import createLog from "@/function/createLog";
import { UserContext } from "@/context/UserContext";
import { useSnackbar } from "notistack";
import useIsAdmin from "@/function/useIsAdmin";
import { useOrganizationContext } from "@/context/OrganizationContext";

// Layout wrapper for program dashboard
export const ProgramDashboard = ({ children }: { children: ReactNode }) => {
    const router = useRouter();
    const { orgId, programId } = router.query;
    const [rerenderer, setRerenderer] = useState<number>(0);

    const { orgData, loading, error } = useOrganizationContext();
    const {
        programData,
        loading: programLoading,
        error: programError,
    } = useProgramData({
        orgId: orgId as string,
        programId: programId as string,
        rerenderer,
    });

    // STATUS UPDATE MODALS
    const [openStatusModal, setOpenStatusModal] = useState<boolean>(false);
    const handleOpenStatusModal = () => setOpenStatusModal(true);
    const handleCloseStatusModal = () => setOpenStatusModal(false);

    return (
        <>
            <Head>
                <title>{programData?.name || "Loading..."}</title>
            </Head>
            <main className={styles.container}>
                <header className={styles.programHeader}>
                    <div>
                        <Button
                            className="btn-compact"
                            onClick={() =>
                                router.push(`/organization/${orgId}/program`)
                            }
                        >
                            <ArrowBackIosNew fontSize="small" />
                        </Button>
                        {programData ? (
                            <h1 className="fadeIn">{programData.name}</h1>
                        ) : (
                            <Skeleton animation="wave" width={140} />
                        )}
                        <ProgramStatusModal
                            open={openStatusModal}
                            handleOpen={handleOpenStatusModal}
                            handleClose={handleCloseStatusModal}
                            currentStatus={programData?.status}
                            programName={programData?.name}
                            setRender={setRerenderer}
                        />
                    </div>
                    <div className={styles.programDates}>
                        Dates : {programData?.dateStart.toDate().toDateString()}{" "}
                        - {programData?.dateEnd.toDate().toDateString()}
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
                        {Children.map(children, (child: ReactNode | any) =>
                            cloneElement(child, { setRerenderer })
                        )}
                    </section>
                ) : (
                    <Loading />
                )}
            </main>
        </>
    );
};

const ProgramOverview = () => {
    return (
        <div>
            <h1>Overview</h1>
        </div>
    );
};

const ProgramStatusModal = ({
    open,
    handleOpen,
    handleClose,
    currentStatus,
    programName,
    setRender,
}: any) => {
    const router = useRouter();
    const { orgId, programId } = router.query;
    const { authUser, userDoc } = useContext(UserContext);
    const { isAdmin } = useOrganizationContext();

    const { enqueueSnackbar } = useSnackbar();
    const [localStatus, setLocalStatus] = useState<any>(currentStatus);

    const handleUpdateStatus = async (e: any) => {
        e.preventDefault();

        if (authUser && userDoc && isAdmin) {
            const docRef = doc(
                db,
                "organizations",
                orgId as string,
                "programs",
                programId as string
            );

            await updateDoc(docRef, {
                status: localStatus,
            })
                .then(() => {
                    createLog(
                        orgId as string,
                        authUser.uid,
                        {
                            type: "update_program_status",
                            text: `${userDoc.firstName} changes ${programName} program status from ${currentStatus} to ${localStatus}`,
                        },
                        userDoc.photoURL
                    );
                    setRender((prev: number) => prev + 1);
                    enqueueSnackbar("Successfully update program status!", {
                        variant: "success",
                    });
                })
                .catch((err: any) => {
                    console.log(err);
                });
        }
    };

    const modalBoxStyle = {
        position: "absolute" as "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: "500",
        // height: 400,
        bgcolor: "var(--background)",
        border: "2px solid #8A8FF8",
        borderRadius: 2,
        boxShadow: 24,
        p: 4,
    };

    useEffect(() => {
        setLocalStatus(currentStatus);
    }, [currentStatus]);

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

    return (
        <>
            <div
                onClick={isAdmin ? handleOpen : () => {}}
                className={
                    currentStatus == "upcoming"
                        ? styles.upcoming
                        : currentStatus == "ongoing"
                        ? styles.ongoing
                        : currentStatus == "completed"
                        ? styles.completed
                        : currentStatus == "failed"
                        ? styles.failed
                        : styles.unset
                }
            >
                {currentStatus ? (
                    returnProgramStatus(currentStatus)
                ) : (
                    <Loading />
                )}
            </div>
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={modalBoxStyle}>
                    <div className={styles.statusModalBox}>
                        <header>
                            <h2>Change Status</h2>
                            <IconButton onClick={handleClose}>
                                <Close />
                            </IconButton>
                        </header>
                        <div>
                            <FormControl size="small">
                                <Select
                                    value={localStatus}
                                    onChange={(e) => {
                                        e.preventDefault();

                                        setLocalStatus(e.target.value);
                                    }}
                                >
                                    <MenuItem
                                        disabled={currentStatus == "upcoming"}
                                        value={"upcoming"}
                                    >
                                        Upcoming
                                    </MenuItem>
                                    <MenuItem
                                        disabled={currentStatus == "ongoing"}
                                        value={"ongoing"}
                                    >
                                        Ongoing
                                    </MenuItem>
                                    <MenuItem
                                        disabled={currentStatus == "completed"}
                                        value={"completed"}
                                    >
                                        Completed
                                    </MenuItem>
                                    <MenuItem
                                        disabled={currentStatus == "failed"}
                                        value={"failed"}
                                    >
                                        Failed
                                    </MenuItem>
                                    <MenuItem
                                        disabled={currentStatus == ""}
                                        value={""}
                                    >
                                        Unset
                                    </MenuItem>
                                </Select>
                            </FormControl>
                        </div>
                        <Button
                            disabled={localStatus == currentStatus}
                            onClick={handleUpdateStatus}
                            className="btn-def"
                        >
                            SAVE
                        </Button>
                    </div>
                </Box>
            </Modal>
        </>
    );
};

export default ProgramOverview;
