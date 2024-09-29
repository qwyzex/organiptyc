import { totalmem } from "os";
import { ProgramDashboard } from ".";
import { useRouter } from "next/router";
import useProgramData from "@/function/useProgramData";
import Loading from "@/components/Loading";
import styles from "@/styles/organization/orgId/programs/Committee.module.sass";
import { Button, Divider, IconButton, Skeleton } from "@mui/material";
import { useEffect, useState } from "react";
import useIsAdmin from "@/function/useIsAdmin";
import { Delete } from "@mui/icons-material";

type CommitteeMember = {
    name: string;
};

type CommitteeData = {
    [role: string]: CommitteeMember[];
};

export default function ProgramCommittee() {
    const router = useRouter();
    const { orgId, programId } = router.query;
    const { isAdmin } = useIsAdmin(orgId as string);

    const [rerenderer, setRerenderer] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(false);
    const [editMode, setEditMode] = useState<boolean>(false);

    const [addNewCommittee, setAddNewCommittee] = useState<boolean>(false);
    const [newCommitName, setNewCommitName] = useState<string>("");
    const [newCommitRole, setNewCommitRole] = useState<string>("");

    const {
        programData,
        loading: programLoading,
        error: programError,
    } = useProgramData({
        orgId: orgId as string,
        programId: programId as string,
        rerenderer: rerenderer,
    });

    const handleEnterEditMode = () => {
        if (editMode) {
            setEditMode(false);
            setRerenderer((prev) => prev + 1);

            if (addNewCommittee) setAddNewCommittee(false);
        } else {
            setEditMode(true);
        }
    };

    const clearNewMemberFields = () => {
        setNewCommitName("");
        setNewCommitRole("");
    };

    const handleAddNewCommitMember = (e: any) => {
        e.preventDefault();

        if (newCommitName && newCommitRole) {
            setLoading(true);
            programData
                ?.addCommitteeMember(newCommitName.trim(), newCommitRole.trim())
                .then(() => {
                    setLoading(false);
                    setRerenderer((prev) => prev + 1);
                    clearNewMemberFields();
                    setAddNewCommittee(false);
                })
                .catch((error: any) => {
                    console.error(error);
                    setLoading(false);
                });
        }
        return;
    };

    const handleUpdateCommitMember = (
        e: any,
        id: string,
        type: "name" | "role"
    ) => {
        e.preventDefault();
        setLoading(true);

        programData
            ?.updateCommitteeMember(id, type, e.target.value.trim())
            .then(() => {
                setLoading(false);
            })
            .catch((error: any) => {
                console.error(error);
                setLoading(false);
            });
    };

    return (
        <div className={styles.container}>
            <header className={editMode ? styles.displayBg : ""}>
                <h2>
                    <p>Committee</p>
                    {programData ? (
                        <p className="fadeIn">
                            {programData.committee.length} members
                        </p>
                    ) : (
                        <Skeleton width={90} height={40} />
                    )}
                </h2>
                {isAdmin && (
                    <div>
                        {loading && (
                            <span className="fadeIn">
                                <p>Saving...</p>
                                {"  "}
                                <Loading />
                            </span>
                        )}
                        <Button
                            onClick={handleEnterEditMode}
                            className={editMode ? "btn-def" : "btn-ref"}
                        >
                            EDIT MODE
                        </Button>
                    </div>
                )}
            </header>
            <ul className={!programData ? styles.centered : ""}>
                {programData ? (
                    programData.committee.map((person: any, i: number) => (
                        <>
                            {i != 0 && <Divider key={i} />}
                            <li
                                key={person.id}
                                className={`${styles.committeeItem} fadeIn`}
                            >
                                {editMode ? (
                                    <>
                                        <div>
                                            <input
                                                defaultValue={person.name}
                                                onBlur={(e) => {
                                                    if (
                                                        e.target.value !==
                                                        person.name
                                                    ) {
                                                        handleUpdateCommitMember(
                                                            e,
                                                            person.id,
                                                            "name"
                                                        );
                                                    }
                                                }}
                                            />
                                            <input
                                                defaultValue={person.role}
                                                onBlur={(e) => {
                                                    if (
                                                        e.target.value !==
                                                        person.role
                                                    ) {
                                                        handleUpdateCommitMember(
                                                            e,
                                                            person.id,
                                                            "role"
                                                        );
                                                    }
                                                }}
                                            />
                                        </div>
                                        <IconButton
                                            onClick={() => {
                                                if (
                                                    confirm(
                                                        "Are you sure you want to remove this person?"
                                                    )
                                                ) {
                                                    programData
                                                        ?.deleteCommitteeMember(
                                                            person.id
                                                        )
                                                        .then(() => {
                                                            setRerenderer(
                                                                (prev) =>
                                                                    prev + 1
                                                            );
                                                        })
                                                        .catch((error: any) => {
                                                            console.error(
                                                                error
                                                            );
                                                        });
                                                }
                                            }}
                                        >
                                            <Delete fontSize="small" />
                                        </IconButton>
                                    </>
                                ) : (
                                    <div>
                                        <h4>{person.name}</h4>
                                        <p>{person.role}</p>
                                    </div>
                                )}
                            </li>
                        </>
                    ))
                ) : (
                    <Loading />
                )}
                {addNewCommittee && (
                    <>
                        <Divider />
                        <li className={styles.committeeItem}>
                            <div>
                                <input
                                    autoFocus
                                    type="text"
                                    value={newCommitName}
                                    placeholder="Name"
                                    onChange={(e) => {
                                        e.preventDefault();
                                        setNewCommitName(e.target.value);
                                    }}
                                    onBlur={handleAddNewCommitMember}
                                />
                                <input
                                    type="text"
                                    value={newCommitRole}
                                    placeholder="Role"
                                    onChange={(e) => {
                                        e.preventDefault();
                                        setNewCommitRole(e.target.value);
                                    }}
                                    onBlur={handleAddNewCommitMember}
                                />
                            </div>
                        </li>
                    </>
                )}
            </ul>
            {editMode && isAdmin && (
                <Button
                    className="btn-ref"
                    onClick={() => {
                        setAddNewCommittee(!addNewCommittee);
                    }}
                >
                    Add new person
                </Button>
            )}
        </div>
    );
}
