import { Box, Button, Divider } from "@mui/material";
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
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase";
import createLog from "@/function/createLog";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "@/context/UserContext";

export default function ProgramSettings({ setRerenderer }: any) {
    const router = useRouter();
    const { orgId, programId } = router.query;
    const { enqueueSnackbar } = useSnackbar();

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

        if (programData?.name == programName) {
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
                    name: programName,
                });

                enqueueSnackbar("Program name changed", { variant: "info" });
                setRerenderer((prev: number) => prev + 1);
                setLocalRerender((prev: number) => prev + 1);
                await createLog(
                    orgId as string,
                    authUser.uid,
                    {
                        type: "change_program_name",
                        text: `${userDoc.firstName} changed ${programData?.name} to ${programName}`,
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

        if (programData?.description == programDescription) {
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
                    description: programDescription,
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
                    dateStart: dateStart,
                    dateEnd: dateEnd,
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
                            <form onSubmit={handleProgramRename}>
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
                                    />
                                    <Button className="btn-def" type="submit">
                                        Rename
                                    </Button>
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
                                    />
                                    <Button className="btn-def" type="submit">
                                        Update
                                    </Button>
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
                            <div>
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
                                                "xyz123"
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
                                <label htmlFor="dateStart">Start Date</label>
                                <div>
                                    <section>
                                        <input
                                            className="inp-form"
                                            type="date"
                                            aria-label="dateStart"
                                            value={dateStart}
                                            onChange={(e) =>
                                                setDateStart(e.target.value)
                                            }
                                        />
                                    </section>
                                    <Button className="btn-def" type="submit">
                                        Update Dates
                                    </Button>
                                </div>
                                <section>
                                    <label htmlFor="dateEnd">End Date</label>
                                    <input
                                        className="inp-form"
                                        type="date"
                                        aria-label="dateEnd"
                                        value={dateEnd}
                                        onChange={(e) =>
                                            setDateEnd(e.target.value)
                                        }
                                    />
                                </section>
                            </form>
                        </>
                    ) : (
                        <Loading />
                    )}
                </div>

                {/* Danger Zone */}
                <div className={`${styles.DangerZone} ${styles.optionSection}`}>
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

                    {/* TODO:
                    - Delete Program FUNCTION */}
                    <div>
                        <article>
                            <label htmlFor="">Delete Program</label>
                            <p className="dim">
                                Once you delete this program, it cannot be
                                recovered.
                            </p>
                        </article>
                        <Button
                            disabled={!programData}
                            className="btn-danger"
                            onClick={() =>
                                confirm(
                                    "Are you sure you want to delete the program?"
                                ) && alert("Program Deleted")
                            }
                        >
                            Delete Program
                        </Button>
                    </div>
                </div>
            </main>
        </div>
    );
}
