import { useRouter } from "next/router";
import { useState, useEffect, useContext, FormEvent, SetStateAction } from "react";
import {
    collection,
    doc,
    DocumentData,
    getDocs,
    query,
    updateDoc,
    where,
    writeBatch,
} from "firebase/firestore";
import useOrganizationData from "@/function/useOrganizationData";
import { UserContext } from "@/context/UserContext";
import useIsAdmin from "@/function/useIsAdmin";
import { db } from "@/firebase";
import createLog from "@/function/createLog";
import styles from "@/styles/organization/orgId/Members.module.sass";
import Link from "next/link";
import generateInviteLink from "@/function/generateInviteLink";
import { Box, Modal } from "@mui/material";
import Snackbar from "@mui/material/Snackbar";

import { SnackbarProvider, VariantType, useSnackbar } from "notistack";

export default function OrganizationMembers() {
    const router = useRouter();
    const [rerenderer, setRerenderer] = useState<number>(0);

    const { orgId } = router.query;
    const { orgData } = useOrganizationData(orgId as string, rerenderer);
    const { authUser, loading, userDoc } = useContext(UserContext);
    const { isAdmin } = useIsAdmin(orgId as string);
    const yourStatus = orgData?.members.find(
        (member: any) => member.userId === authUser?.uid
    );

    const [openInviteModal, setOpenInviteModal] = useState<boolean>(false);
    const handleOpenInviteModal = () => setOpenInviteModal(true);
    const handleCloseInviteModal = () => setOpenInviteModal(false);

    return (
        <div className={styles.container}>
            <header>
                <h1>MEMBERS</h1>
                <section>
                    <p>TOTAL MEMBERS : {orgData?.members.length}</p>
                    <p>
                        TOTAL ADMIN :{" "}
                        {orgData?.members.filter((x: any) => x.role === "admin").length}
                    </p>
                    <InvitationLink
                        open={openInviteModal}
                        handleOpen={handleOpenInviteModal}
                        handleClose={handleCloseInviteModal}
                        userDoc={userDoc}
                        orgId={orgId as string}
                    />
                </section>
            </header>
            <main>
                <h2>Your Status</h2>
                <div className={styles.yourStatus}>
                    <p>{yourStatus?.user.fullName}</p>
                    <p>{yourStatus?.joinedAt.toDate().toDateString()}</p>
                    <p>{yourStatus?.role == "admin" ? "Admin" : "Member"}</p>
                </div>
                <hr />
                <header className={styles.memberListHeader}>
                    <h2>Other Members</h2>
                    <div className={styles.memberListParam}>
                        <p>Name</p>
                        <p>Date Joined</p>
                        <p>Role</p>
                    </div>
                </header>
                <ul className={styles.otherMembers}>
                    {orgData && authUser && userDoc ? (
                        orgData.members.map((member: any) => {
                            return !(member.userId === authUser.uid) ? (
                                <li key={member.userId}>
                                    <p>
                                        <Link href={`/profile/${member.userId}`}>
                                            {member.user.fullName}
                                        </Link>
                                    </p>
                                    <p>{member.joinedAt.toDate().toDateString()}</p>
                                    {isAdmin && !(member.userId === authUser.uid) ? (
                                        // && !(member.userId === authUser.uid)
                                        <select
                                            defaultValue={member.role}
                                            onChange={async (e) => {
                                                e.preventDefault();
                                                const newRole = e.target.value;
                                                const confirmChange = window.confirm(
                                                    `ARE YOU SURE YOU WANT TO CHANGE ${member.user.fullName}'s ROLE FROM '${member.role}' to '${newRole}'`
                                                );
                                                if (confirmChange) {
                                                    try {
                                                        const userOrgDocRef = doc(
                                                            db,
                                                            `organizations/${orgId}/members`,
                                                            member.userId
                                                        );
                                                        const userDocRef = doc(
                                                            db,
                                                            `users/${member.userId}/organizations`,
                                                            orgId as string
                                                        );

                                                        const batch = writeBatch(db);

                                                        // Update role in organization document
                                                        batch.update(userOrgDocRef, {
                                                            role: newRole,
                                                        });

                                                        // Update role in user document (inside organizations field)
                                                        batch.update(userDocRef, {
                                                            role: newRole,
                                                        });

                                                        await batch.commit();

                                                        await createLog(
                                                            orgId as string,
                                                            member.userId,
                                                            `${userDoc.firstName} changes ${member.user.firstName} role from ${member.role} to ${newRole}`,
                                                            userDoc.photoURL
                                                        );

                                                        alert(
                                                            `${member.user.fullName}'s role has been updated to ${newRole}`
                                                        );

                                                        setRerenderer(rerenderer + 1);
                                                    } catch (error) {
                                                        console.error(
                                                            "Error updating role: ",
                                                            error
                                                        );
                                                        alert(
                                                            "Failed to update role. Please try again."
                                                        );
                                                    }
                                                }
                                            }}
                                        >
                                            <option
                                                disabled={member.role == "member"}
                                                value={"member"}
                                            >
                                                {"Member"}
                                            </option>
                                            <option
                                                disabled={member.role == "admin"}
                                                value={"admin"}
                                            >
                                                {"Admin"}
                                            </option>
                                        </select>
                                    ) : (
                                        <p>{member.role}</p>
                                    )}
                                </li>
                            ) : null;
                        })
                    ) : (
                        <></>
                    )}
                </ul>
            </main>
        </div>
    );
}

const InvitationLink = ({ open, handleOpen, handleClose, userDoc, orgId }: any) => {
    const [newOldLink, setNewOldLink] = useState<string>("");
    const [inviteLink, setInviteLink] = useState<string>("");
    const [loading, setLoading] = useState<boolean>();
    const { enqueueSnackbar } = useSnackbar();

    const style = {
        position: "absolute" as "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: '500',
        // height: 400,
        bgcolor: "var(--background)",
        border: "2px solid #8A8FF8",
        borderRadius: 2,
        boxShadow: 24,
        p: 4,
    };

    const handleSuccessCopy = () => {
        enqueueSnackbar('Link Copied To Clipboard!!', { variant: 'success' });
    };

    useEffect(() => {
        const checkExistingLinks = async () => {
            if (userDoc) {
                const invitesRef = collection(db, `invites`);
                const now = new Date();
                const invitesQuery = query(
                    invitesRef,
                    where("invitedToUID", "==", orgId)
                );
                const querySnapshot = await getDocs(invitesQuery);

                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    if (data.expiresAt.toDate() > now) {
                        setNewOldLink("old");
                        setInviteLink(
                            `http://localhost:3000/organization/join/${data.token}`
                        );
                    }
                });
                setLoading(false);
            }
        };

        checkExistingLinks();
    }, [userDoc, orgId, open]);

    const handleGenerateLink = async () => {
        if (userDoc) {
            const link = await generateInviteLink(orgId as string, 60 * 6, userDoc);
            setNewOldLink("new");
            setInviteLink(link);
        } else {
            console.error("NO USER");
        }
    };

    return (
        <>
            <button onClick={handleOpen}>INVITE YOUR FRIEND</button>
            <Modal
                open={open}
                // onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={style}>
                    <h2>INVITATION LINK</h2>
                    {loading ? (
                        <p>Loading...</p>
                    ) : inviteLink && newOldLink == "old" ? (
                        <div>
                            <p>Existing Invite Link: {inviteLink}</p>
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(inviteLink);
                                    // alert("Copied to clipboard!");
                                    handleSuccessCopy();
                                }}
                            >
                                COPY
                            </button>
                            <button onClick={handleGenerateLink}>REGENERATE</button>
                        </div>
                    ) : inviteLink && newOldLink === "new" ? (
                        <div>
                            <a>LINK : {inviteLink}</a>
                            <button onClick={handleGenerateLink}>GENERATE</button>
                        </div>
                    ) : (
                        <button onClick={handleGenerateLink}>GENERATE</button>
                    )}
                    <button onClick={handleClose}>CLOSE</button>
                </Box>
            </Modal>
        </>
    );
};
