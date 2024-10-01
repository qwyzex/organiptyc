import useProgramData from "@/function/useProgramData";
import { ProgramDashboard } from ".";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import {
    Box,
    Button,
    Collapse,
    IconButton,
    Input,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Modal,
} from "@mui/material";
import {
    Add,
    AddTask,
    Check,
    CheckCircle,
    Circle,
    CircleOutlined,
    DeleteForever,
    Done,
    ExpandLess,
    ExpandMore,
    Star,
    StarBorder,
    StarOutline,
    Task,
} from "@mui/icons-material";
import modalBoxStyle from "@/utils/modalBoxStyle";
import styles from "@/styles/organization/orgId/programs/Tasks.module.sass";
import Delete from "@mui/icons-material/Delete";
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    updateDoc,
} from "firebase/firestore";
import { db } from "@/firebase";
import { useSnackbar } from "notistack";
import Loading from "@/components/Loading";

export default function ProgramTasks() {
    const router = useRouter();
    const { orgId, programId } = router.query;
    const { enqueueSnackbar } = useSnackbar();

    const [rerenderer, setRerenderer] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);
    const [newTaskLoading, setNewTaskLoading] = useState<boolean>(false);

    const { programData, error } = useProgramData({
        orgId: orgId as string,
        programId: programId as string,
        rerenderer: rerenderer,
    });

    const [openTasksList, setOpenTasksList] = useState<boolean>(true);
    const [openHPTasksList, setOpenHPTasksList] = useState<boolean>(false);

    const [newTaskContent, setNewTaskContent] = useState<string>("");
    const [newTaskHP, setNewTaskHP] = useState<boolean>(false);

    const handleNewTaskSubmit = async (e: any) => {
        e.preventDefault();

        setNewTaskLoading(true);

        try {
            const docRef = collection(
                db,
                "organizations",
                orgId as string,
                "programs",
                programId as string,
                "tasks"
            );

            await addDoc(docRef, {
                content: newTaskContent,
                priority: newTaskHP,
                status: false,
                dateCreated: new Date(),
            });
        } catch (err: any) {
            enqueueSnackbar(`Error creating task: ${err.message}`, {
                variant: "error",
            });
        } finally {
            setNewTaskLoading(false);
            setRerenderer((prev: number) => prev + 1);
            setNewTaskContent("");
            setNewTaskHP(false);
        }
    };

    useEffect(() => {
        console.log(programData);
    }, [programData]);

    return (
        <section className={styles.container}>
            <header className={styles.tasksHeader}>
                <h2>Tasks</h2>
            </header>
            <main className={styles.main}>
                <div>
                    <ListItemButton
                        onClick={() => {
                            setOpenTasksList(!openTasksList);
                        }}
                    >
                        <ListItemIcon>
                            <AddTask />
                        </ListItemIcon>
                        <ListItemText primary="Active Tasks" />
                        <ExpandLess
                            className={openTasksList ? styles.open : ""}
                        />
                    </ListItemButton>
                    <Collapse in={openTasksList} timeout="auto" unmountOnExit>
                        <ul className={styles.tasksList}>
                            {programData &&
                            programData.tasks.filter(
                                (item: any) => item.status == false
                            ).length > 0 ? (
                                programData.tasks
                                    .filter((item: any) => item.status == false)
                                    .sort(
                                        (a: any, b: any) =>
                                            a.dateCreated - b.dateCreated
                                    )
                                    .sort(
                                        (a: any, b: any) =>
                                            b.priority - a.priority
                                    )
                                    .map((item: any, i: number) => (
                                        <li key={i}>
                                            <TaskItemModal
                                                taskContent={item.content}
                                                priority={item.priority}
                                                status={item.status}
                                                uid={item.id}
                                                orgId={orgId as string}
                                                programId={programId as string}
                                                setRerenderer={setRerenderer}
                                            />
                                        </li>
                                    ))
                            ) : (
                                <div>
                                    <p>No active tasks</p>
                                </div>
                            )}
                        </ul>
                    </Collapse>
                </div>
                <div>
                    <ListItemButton
                        onClick={() => {
                            setOpenHPTasksList(!openHPTasksList);
                        }}
                    >
                        <ListItemIcon>
                            <Done />
                        </ListItemIcon>
                        <ListItemText primary="Completed Tasks" />
                        <ExpandLess
                            className={openHPTasksList ? styles.open : ""}
                        />
                    </ListItemButton>
                    <Collapse in={openHPTasksList} timeout="auto" unmountOnExit>
                        <ul className={styles.tasksList}>
                            {programData &&
                            programData.tasks.filter(
                                (item: any) => item.status == true
                            ).length > 0 ? (
                                programData.tasks
                                    .filter((item: any) => item.status == true)
                                    .sort(
                                        (a: any, b: any) =>
                                            a.dateCreated - b.dateCreated
                                    )
                                    .map((item: any, i: number) => (
                                        <li key={i}>
                                            <TaskItemModal
                                                taskContent={item.content}
                                                priority={item.priority}
                                                status={item.status}
                                                uid={item.id}
                                                orgId={orgId as string}
                                                programId={programId as string}
                                                setRerenderer={setRerenderer}
                                            />
                                        </li>
                                    ))
                            ) : (
                                <div>
                                    <p>No completed tasks</p>
                                </div>
                            )}
                        </ul>
                    </Collapse>
                </div>
            </main>
            <footer className={styles.footer}>
                <form onSubmit={handleNewTaskSubmit}>
                    <input
                        className={styles.inputForm}
                        placeholder="Add new task"
                        type="text"
                        value={newTaskContent}
                        disabled={newTaskLoading}
                        onChange={(e) => {
                            e.preventDefault();

                            setNewTaskContent(e.target.value);
                        }}
                    />
                    <Button
                        className="btn-ref"
                        onClick={() => setNewTaskHP(!newTaskHP)}
                        disabled={!newTaskContent.trim() || newTaskLoading}
                    >
                        {newTaskHP ? (
                            <Star fontSize="small" />
                        ) : (
                            <StarOutline fontSize="small" />
                        )}
                    </Button>
                    <Button
                        className="btn-def"
                        type="submit"
                        disabled={!newTaskContent.trim() || newTaskLoading}
                    >
                        {newTaskLoading ? (
                            <div>
                                <Loading className={styles.loadingComp} />
                            </div>
                        ) : (
                            <Add fontSize="small" />
                        )}
                    </Button>
                </form>
            </footer>
        </section>
    );
}

type taskItemModalParam = {
    taskContent: string;
    priority: boolean;
    status: boolean;
    uid: string;
    orgId: string;
    programId: string;
    setRerenderer: any;
};

/**
 * A TaskItemModal component.
 *
 * It displays a list item with a button, a circle and a text.
 * When the button is clicked, a modal opens with the text inside.
 *
 * @param {object} props - The component props.
 * @param {string} props.taskContent - The content of the task.
 * @param {boolean} [props.priority] - The priority of the task.
 * @param {boolean} [props.status] - The status of the task.
 * @returns {ReactElement} - A React element.
 */
const TaskItemModal = ({
    taskContent,
    priority,
    status,
    uid,
    orgId,
    programId,
    setRerenderer,
}: taskItemModalParam) => {
    const [open, setOpen] = useState<boolean>(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const [editableTaskContent, setEditableTaskContent] =
        useState<string>(taskContent);

    const { enqueueSnackbar } = useSnackbar();

    const [localRender, setLocalRender] = useState<number>(0);
    const [localChecked, setLocalChecked] = useState<boolean>(status);
    const [localPriority, setLocalPriority] = useState<boolean>(priority);

    useEffect(() => {
        setLocalChecked(status);
        setLocalPriority(priority);
    }, [status, priority, localRender]);

    const rerender = () => {
        setLocalRender((prev: number) => prev + 1);
    };

    const handleRerender = () => {
        setRerenderer((prev: number) => prev + 1);
    };

    const handleCheckItem = async (e: React.MouseEvent) => {
        e.stopPropagation();

        setLocalChecked(!localChecked);
        try {
            await updateDoc(
                doc(
                    db,
                    "organizations",
                    orgId,
                    "programs",
                    programId,
                    "tasks",
                    uid
                ),
                {
                    status: !status,
                }
            );
        } catch (error: any) {
            enqueueSnackbar(`Error checking item: ${error.message}`, {
                variant: "error",
            });
            setLocalChecked(!localChecked);
        } finally {
            handleRerender();
            rerender();
        }
    };

    const handleDeleteItem = async (e: React.MouseEvent) => {
        e.stopPropagation();

        try {
            await deleteDoc(
                doc(
                    db,
                    "organizations",
                    orgId,
                    "programs",
                    programId,
                    "tasks",
                    uid
                )
            );
        } catch (error: any) {
            enqueueSnackbar(`Error deleting item: ${error.message}`, {
                variant: "error",
            });
        } finally {
            handleRerender();
            enqueueSnackbar("Successfully deleted a task", {
                variant: "info",
            });
            rerender();
        }
    };

    const handleSetItemPriority = async (e: React.MouseEvent) => {
        e.stopPropagation();

        setLocalPriority(!localPriority);
        try {
            await updateDoc(
                doc(
                    db,
                    "organizations",
                    orgId,
                    "programs",
                    programId,
                    "tasks",
                    uid
                ),
                {
                    priority: !priority,
                }
            );
        } catch (error: any) {
            enqueueSnackbar(`Error prioritizing item: ${error.message}`, {
                variant: "error",
            });
            setLocalPriority(!localPriority);
        } finally {
            handleRerender();
            rerender();
        }
    };

    const handleUpdateTaskContent = async () => {
        try {
            await updateDoc(
                doc(
                    db,
                    "organizations",
                    orgId,
                    "programs",
                    programId,
                    "tasks",
                    uid
                ),
                {
                    content: editableTaskContent,
                }
            );
            handleRerender();
            rerender();
        } catch (error: any) {
            enqueueSnackbar(`Error updating task: ${error.message}`, {
                variant: "error",
            });
        }
    };

    return (
        <>
            <div className={styles.listItem} onClick={handleOpen}>
                <section>
                    <Button onClick={handleCheckItem}>
                        {localChecked == true ? (
                            <CheckCircle fontSize="small" />
                        ) : (
                            <CircleOutlined fontSize="small" />
                        )}
                    </Button>
                    <p
                        className={`${
                            localChecked == true ? styles.completedString : ""
                        } ${localChecked == true ? "dim" : ""}`}
                    >
                        {taskContent}
                    </p>
                </section>
                <section>
                    <Button onClick={handleDeleteItem} className="fadeIn">
                        <Delete fontSize="small" />
                    </Button>
                    <Button onClick={handleSetItemPriority}>
                        {localPriority == true ? (
                            <Star fontSize="small" color="warning" />
                        ) : (
                            <StarBorder fontSize="small" />
                        )}
                    </Button>
                </section>
            </div>
            <Modal open={open} onClose={handleClose}>
                <Box sx={modalBoxStyle} className={styles.modalBox}>
                    <p>Edit Task</p>
                    <input
                        className={styles.inputForm}
                        value={editableTaskContent}
                        onChange={(e) => setEditableTaskContent(e.target.value)} // Update state when input changes
                        onBlur={handleUpdateTaskContent}
                    />
                    <div>
                        <Button
                            className={"btn-def"}
                            onClick={handleSetItemPriority}
                        >
                            {localPriority == true ? (
                                <Star fontSize="small" color="warning" />
                            ) : (
                                <StarBorder fontSize="small" />
                            )}
                        </Button>
                        <Button
                            className={"btn-def"}
                            onClick={handleDeleteItem}
                        >
                            <Delete fontSize="small" />
                        </Button>
                    </div>
                </Box>
            </Modal>
        </>
    );
};
