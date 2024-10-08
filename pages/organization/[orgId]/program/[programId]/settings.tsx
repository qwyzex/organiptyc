import { Box, Button, Divider, Icon, Modal } from "@mui/material";
import styles from "@/styles/organization/orgId/programs/Settings.module.sass";
import {
    DangerousOutlined,
    InfoOutlined,
    Settings,
    SettingsOutlined,
    WarningAmberOutlined,
    WarningAmberRounded,
} from "@mui/icons-material";
import useProgramData from "@/function/useProgramData";
import { useRouter } from "next/router";
import Loading from "@/components/Loading";
import { useSnackbar } from "notistack";
import {
    collection,
    deleteDoc,
    doc,
    getDocs,
    Timestamp,
    updateDoc,
} from "firebase/firestore";
import { db } from "@/firebase";
import createLog from "@/function/createLog";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "@/context/UserContext";
import useIsAdmin from "@/function/useIsAdmin";
import AdminWrap from "@/components/AdminWrap";
import Head from "next/head";

export default function ProgramSettings({ setRerenderer }: any) {
    const router = useRouter();
    const { orgId, programId } = router.query;
    const { enqueueSnackbar } = useSnackbar();
    const { isAdmin } = useIsAdmin(orgId as string);

    const [localRerender, setLocalRerender] = useState<number>(0);

    const { authUser, userDoc } = useContext(UserContext);
    const { programData } = useProgramData({
        orgId: orgId as string,
        programId: programId as string,
        rerenderer: localRerender,
    });

    const [programName, setProgramName] = useState<string>("");
    const [programDescription, setProgramDescription] = useState<string>("");
    const [dateStart, setDateStart] = useState<any>(null);
    const [dateEnd, setDateEnd] = useState<any>(null);

    useEffect(() => {
        setProgramName(programData?.name);
        setProgramDescription(programData?.description);
        setDateStart(programData?.dateStart);
        setDateEnd(programData?.dateEnd);
    }, [programData]);

    const handleProgramRename = async (e: any) => {
        e.preventDefault();

        if (!authUser || !userDoc) return;

        if (programData?.name == programName.trim()) {
            enqueueSnackbar("Program name unchanged", { variant: "warning" });
            return;
        } else {
            try {
                const docRef = doc(
                    db,
                    "organizations",
                    orgId as string,
                    "programs",
                    programId as string
                );

                await updateDoc(docRef, {
                    name: programName.trim(),
                });

                enqueueSnackbar("Program name changed", { variant: "info" });
                setRerenderer((prev: number) => prev + 1);
                setLocalRerender((prev: number) => prev + 1);
                await createLog(
                    orgId as string,
                    authUser.uid,
                    {
                        type: "change_program_name",
                        text: `${userDoc.firstName} changed ${
                            programData?.name
                        } to ${programName.trim()}`,
                    },
                    userDoc.photoURL
                );
            } catch (error) {
                enqueueSnackbar("Error renaming program, please try again", {
                    variant: "error",
                });
            }
        }
    };

    const handleProgramDescriptionUpdate = async (e: any) => {
        e.preventDefault();

        if (!authUser || !userDoc) return;

        if (programData?.description == programDescription.trim()) {
            enqueueSnackbar("Program description unchanged", {
                variant: "warning",
            });
            return;
        } else {
            try {
                const docRef = doc(
                    db,
                    "organizations",
                    orgId as string,
                    "programs",
                    programId as string
                );

                await updateDoc(docRef, {
                    description: programDescription.trim(),
                });

                enqueueSnackbar("Program description changed", {
                    variant: "info",
                });
                setRerenderer((prev: number) => prev + 1);
                setLocalRerender((prev: number) => prev + 1);
                await createLog(
                    orgId as string,
                    authUser.uid,
                    {
                        type: "change_program_description",
                        text: `${userDoc.firstName} changed ${programData?.name} description`,
                    },
                    userDoc.photoURL
                );
            } catch (error) {
                enqueueSnackbar(
                    "Error updating program description, please try again",
                    {
                        variant: "error",
                    }
                );
            }
        }
    };

    const deleteCollection = async (
        orgId: string,
        programId: string,
        collectionName: string
    ) => {
        const collectionRef = collection(
            db,
            "organizations",
            orgId,
            "programs",
            programId,
            collectionName
        );
        const snapshot = await getDocs(collectionRef);

        const deletePromises = snapshot.docs.map((doc) => deleteDoc(doc.ref));

        return Promise.all(deletePromises);
    };

    const dangerDeleteProgram = async () => {
        if (authUser && userDoc && isAdmin) {
            try {
                const docRef = doc(
                    db,
                    "organizations",
                    orgId as string,
                    "programs",
                    programId as string
                );

                // Delete the 'committee' subcollection first
                await deleteCollection(
                    orgId as string,
                    programId as string,
                    "committee"
                );

                // Now delete the main program document
                await deleteDoc(docRef);

                createLog(
                    orgId as string,
                    authUser.uid,
                    {
                        type: "delete_program",
                        text: `${userDoc.firstName} deleted ${programData?.name}`,
                    },
                    userDoc.photoURL
                );
                enqueueSnackbar(
                    "Program deleted successfully. You will be redirected in 5 seconds",
                    { variant: "info" }
                );
                setTimeout(() => {
                    router.replace(`/organization/${orgId}/program`);
                }, 5000);
            } catch (error) {
                console.error(error);
            }
        }
    };

    const handleProgramDatesUpdate = async (e: any) => {
        e.preventDefault();

        if (!authUser || !userDoc) return;

        if (
            programData?.dateStart == dateStart &&
            programData?.dateEnd == dateEnd
        ) {
            enqueueSnackbar("Program dates unchanged", { variant: "warning" });
            return;
        } else {
            try {
                const docRef = doc(
                    db,
                    "organizations",
                    orgId as string,
                    "programs",
                    programId as string
                );

                await updateDoc(docRef, {
                    dateStart,
                    dateEnd,
                });

                enqueueSnackbar("Program dates successfully changed", {
                    variant: "info",
                });
                setRerenderer((prev: number) => prev + 1);
                setLocalRerender((prev: number) => prev + 1);
                await createLog(
                    orgId as string,
                    authUser.uid,
                    {
                        type: "change_program_dates",
                        text: `${userDoc.firstName} changed ${programData?.name} dates`,
                    },
                    userDoc.photoURL
                );
            } catch (error) {
                enqueueSnackbar(
                    "Error updating program dates, please try again",
                    {
                        variant: "error",
                    }
                );
            }
        }
    };

    return (
        <>
            <Head>
                <title>{programData?.name} Settings</title>
            </Head>
            <div className={styles.container}>
                <main className={styles.main}>
                    {/* General Section */}
                    <div className={styles.optionSection}>
                        <article>
                            <Box>
                                <SettingsOutlined fontSize="small" />
                                <h2>General</h2>
                            </Box>
                            <Divider />
                        </article>
                        {programData ? (
                            <>
                                <form
                                    onSubmit={handleProgramRename}
                                    className="fadeIn"
                                >
                                    <label htmlFor="programName">
                                        Program Name
                                    </label>
                                    <div>
                                        <input
                                            className="inp-form"
                                            type="text"
                                            aria-label="programName"
                                            value={programName}
                                            onChange={(e) => {
                                                setProgramName(e.target.value);
                                            }}
                                            readOnly={!isAdmin}
                                        />
                                        <AdminWrap>
                                            <Button
                                                className="btn-def"
                                                type="submit"
                                            >
                                                Rename
                                            </Button>
                                        </AdminWrap>
                                    </div>
                                </form>
                                <form onSubmit={handleProgramDescriptionUpdate}>
                                    <label htmlFor="programDescription">
                                        Program Description
                                    </label>
                                    <div>
                                        <textarea
                                            spellCheck={false}
                                            className="inp-form"
                                            aria-label="programDescription"
                                            value={programDescription}
                                            onChange={(e) => {
                                                setProgramDescription(
                                                    e.target.value
                                                );
                                            }}
                                            readOnly={!isAdmin}
                                        />
                                        <AdminWrap>
                                            <Button
                                                className="btn-def"
                                                type="submit"
                                            >
                                                Update
                                            </Button>
                                        </AdminWrap>
                                    </div>
                                </form>
                            </>
                        ) : (
                            <Loading />
                        )}
                    </div>

                    {/* Program ID & Date Settings */}
                    <div className={styles.optionSection}>
                        <article>
                            <Box>
                                <InfoOutlined fontSize="small" />
                                <h2>Program Info</h2>
                            </Box>
                            <Divider />
                        </article>
                        {programData ? (
                            <>
                                <div className="fadeIn">
                                    <p>Program ID</p>
                                    <div>
                                        <input
                                            className="inp-form"
                                            type="text"
                                            value={programId as string}
                                            readOnly
                                        />
                                        <Button
                                            className="btn-def"
                                            onClick={() => {
                                                navigator.clipboard.writeText(
                                                    programId as string
                                                );
                                                enqueueSnackbar("Copied", {
                                                    variant: "success",
                                                });
                                            }}
                                        >
                                            Copy
                                        </Button>
                                    </div>
                                </div>
                                <form onSubmit={handleProgramDatesUpdate}>
                                    <label htmlFor="dateStart">
                                        Start Date
                                    </label>
                                    <div>
                                        <section>
                                            <input
                                                className="inp-form"
                                                type="date"
                                                aria-label="dateStart"
                                                value={
                                                    dateStart
                                                        ? dateStart
                                                              .toDate()
                                                              .toISOString()
                                                              .slice(0, 10)
                                                        : ""
                                                }
                                                onChange={(e) =>
                                                    setDateStart(
                                                        Timestamp.fromDate(
                                                            new Date(
                                                                e.target.value
                                                            )
                                                        )
                                                    )
                                                }
                                                readOnly={!isAdmin}
                                            />
                                        </section>
                                        <AdminWrap>
                                            <Button
                                                className="btn-def"
                                                type="submit"
                                            >
                                                Update Dates
                                            </Button>
                                        </AdminWrap>
                                    </div>
                                    <section>
                                        <label htmlFor="dateEnd">
                                            End Date
                                        </label>
                                        <input
                                            className="inp-form"
                                            type="date"
                                            aria-label="dateEnd"
                                            value={
                                                dateEnd
                                                    ? dateEnd
                                                          .toDate()
                                                          .toISOString()
                                                          .slice(0, 10)
                                                    : ""
                                            }
                                            onChange={(e) =>
                                                setDateEnd(
                                                    Timestamp.fromDate(
                                                        new Date(e.target.value)
                                                    )
                                                )
                                            }
                                            readOnly={!isAdmin}
                                            disabled={!isAdmin ? true : false}
                                        />
                                    </section>
                                </form>
                            </>
                        ) : (
                            <Loading />
                        )}
                    </div>

                    {/* Danger Zone */}
                    <AdminWrap>
                        <div
                            className={`fadeIn ${styles.DangerZone} ${styles.optionSection}`}
                        >
                            <article>
                                <Box>
                                    <WarningAmberRounded
                                        color="error"
                                        // fontSize="small"
                                    />
                                    <h2>Danger Zone</h2>
                                </Box>
                                <Divider />
                            </article>
                            <div>
                                <article>
                                    <label htmlFor="">Delete Program</label>
                                    <p className="dim">
                                        Once you delete this program, it cannot
                                        be recovered.
                                    </p>
                                </article>

                                <DeleteProgramModals
                                    programData={programData}
                                    deleteFunction={dangerDeleteProgram}
                                />
                            </div>
                        </div>
                    </AdminWrap>
                </main>
            </div>
        </>
    );
}

const DeleteProgramModals = ({ programData, deleteFunction }: any) => {
    const [loading, setLoading] = useState<boolean>(false);

    const [openDeleteModal, setOpenDeleteModal] = useState<boolean>(false);
    const handleOpenDeleteModal = () => setOpenDeleteModal(true);
    const handleCloseDeleteModal = () => setOpenDeleteModal(false);

    const { enqueueSnackbar } = useSnackbar();

    const [
        programIdForDeletionConfirmation,
        setProgramIdForDeletionConfirmation,
    ] = useState<string>("");

    const modalBoxStyle = {
        position: "absolute" as "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: "500",
        // height: 400,
        bgcolor: "var(--background)",
        border: "2px solid var(--danger)",
        borderRadius: 2,
        boxShadow: 24,
        p: 4,
    };
    return (
        <>
            <Button
                disabled={!programData}
                className="btn-danger"
                onClick={handleOpenDeleteModal}
            >
                Delete Program
            </Button>
            <Modal
                open={openDeleteModal}
                onClose={loading ? () => {} : handleCloseDeleteModal}
            >
                <Box sx={modalBoxStyle}>
                    {!programData ? (
                        <Loading />
                    ) : (
                        <div className={styles.modalContent}>
                            <div>
                                <WarningAmberRounded
                                    color="error"
                                    fontSize="large"
                                />
                                <h2 className="color-danger">Delete Program</h2>
                            </div>
                            <p className="">
                                Are you sure you want to delete the program{" "}
                                <b className="color-danger">
                                    {programData.name}
                                </b>
                                ? This action is irreversible.
                            </p>
                            <p>
                                Please enter the program ID to confirm the
                                action.
                            </p>
                            <form onSubmit={(e) => {}}>
                                <input
                                    className="inp-form inp-diff"
                                    type="text"
                                    placeholder="Program ID"
                                    disabled={loading}
                                    maxLength={100}
                                    value={programIdForDeletionConfirmation}
                                    onChange={(e) =>
                                        setProgramIdForDeletionConfirmation(
                                            e.target.value
                                        )
                                    }
                                />
                            </form>
                            <div className={styles.modalActions}>
                                <Button
                                    disabled={loading}
                                    onClick={handleCloseDeleteModal}
                                    className="btn-ref"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    disabled={
                                        !programIdForDeletionConfirmation ||
                                        loading
                                    }
                                    onClick={() => {
                                        if (!programData) return;

                                        setLoading(true);

                                        if (
                                            programIdForDeletionConfirmation !==
                                            programData.id
                                        ) {
                                            enqueueSnackbar(
                                                "Please enter the correct program ID",
                                                { variant: "error" }
                                            );
                                            setLoading(false);
                                            return;
                                        } else if (
                                            programIdForDeletionConfirmation ===
                                            programData.id
                                        ) {
                                            deleteFunction(programData.id);
                                            setLoading(false);
                                            handleCloseDeleteModal();
                                            setProgramIdForDeletionConfirmation(
                                                ""
                                            );
                                        }
                                    }}
                                    className="btn-danger"
                                >
                                    Delete
                                </Button>
                                {loading && <Loading />}
                            </div>
                        </div>
                    )}
                </Box>
            </Modal>
        </>
    );
};
