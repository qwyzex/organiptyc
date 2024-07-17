import { useRouter } from "next/router";
import {
    useState,
    useEffect,
    useContext,
    FormEvent,
    SetStateAction,
} from "react";
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
import { Box, Button, Divider, Modal, Skeleton } from "@mui/material";
import Snackbar from "@mui/material/Snackbar";

import { SnackbarProvider, VariantType, useSnackbar } from "notistack";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";

import InputLabel from "@mui/material/InputLabel";
import { WhisperSpinner } from "react-spinners-kit";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

import IconButton from "@mui/material/IconButton";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import Loading from "@/components/Loading";

export default function OrganizationMembers() {
    const router = useRouter();
    const [rerenderer, setRerenderer] = useState<number>(0);

    const { orgId } = router.query;
    const { orgData } = useOrganizationData(orgId as string, rerenderer);
    const { authUser, loading, userDoc } = useContext(UserContext);
    const { isAdmin, loading: isAdminLoading } = useIsAdmin(orgId as string);
    const yourStatus = orgData?.members.find(
        (member: any) => member.userId === authUser?.uid
    );

    const [sortBy, setSortBy] = useState<string>("role");
    const [sortIt, setSortIt] = useState<"asc" | "des">("asc");

    const [openInviteModal, setOpenInviteModal] = useState<boolean>(false);
    const handleOpenInviteModal = () => setOpenInviteModal(true);
    const handleCloseInviteModal = () => setOpenInviteModal(false);

    const handleChangeSort = (by: string) => {
        if (sortBy == by) {
            setSortIt(sortIt == "asc" ? "des" : "asc");
            return;
        }
        setSortBy(by);
        setSortIt("asc");
        return;
    };

    return (
        <div className={styles.container}>
            <header>
                <h1>MEMBERS</h1>
                <section>
                    {orgData?.members ? (
                        <p className="fadeIn">
                            Total Members : {orgData?.members.length}, including{" "}
                            {
                                orgData?.members.filter(
                                    (x: any) => x.role === "admin"
                                ).length
                            }{" "}
                            admin
                        </p>
                    ) : (
                        <Skeleton
                            variant="text"
                            sx={{ bgcolor: "var(--color-dimmer)" }}
                            height={20}
                            width={300}
                        />
                    )}
                    {!isAdminLoading && isAdmin && orgData ? (
                        <InvitationLink
                            open={openInviteModal}
                            handleOpen={handleOpenInviteModal}
                            handleClose={handleCloseInviteModal}
                            userDoc={userDoc}
                            orgId={orgId as string}
                            userId={authUser?.uid}
                        />
                    ) : isAdminLoading && !orgData ? (
                        <>
                            <Skeleton
                                variant="text"
                                sx={{ bgcolor: "var(--color-dimmer)" }}
                                height={40.5}
                                width={197.75}
                            />
                        </>
                    ) : (
                        <div style={{ height: 40.5 }}></div>
                    )}
                </section>
            </header>
            <main>
                <h2>Your Status</h2>
                <div className={styles.yourStatus}>
                    {yourStatus ? (
                        <>
                            <p className="fadeIn">
                                {yourStatus?.user.fullName}
                            </p>
                            <p className="fadeIn">
                                {yourStatus?.joinedAt.toDate().toDateString()}
                            </p>
                            <p className="fadeIn">
                                {yourStatus?.role == "admin"
                                    ? "Admin"
                                    : "Member"}
                            </p>
                        </>
                    ) : (
                        <>
                            <Skeleton
                                variant="text"
                                sx={{ bgcolor: "var(--color-dimmer" }}
                                width={100}
                            />
                            <Skeleton
                                variant="text"
                                sx={{ bgcolor: "var(--color-dimmer" }}
                                width={70}
                            />
                            <Skeleton
                                variant="text"
                                sx={{ bgcolor: "var(--color-dimmer" }}
                                width={60}
                            />
                        </>
                    )}
                </div>
                <hr />
                <header className={styles.memberListHeader}>
                    <h2>Other Members</h2>
                    <div
                        className={`${styles.memberListParam} ${
                            sortIt === "asc" && styles.asc
                        }`}
                    >
                        <p
                            className={
                                sortBy === "name" ? styles.sortBySelected : ""
                            }
                            onClick={() => handleChangeSort("name")}
                        >
                            Name
                        </p>
                        <p
                            className={
                                sortBy === "dateJoined"
                                    ? styles.sortBySelected
                                    : ""
                            }
                            onClick={() => handleChangeSort("dateJoined")}
                        >
                            Date Joined
                        </p>
                        <p
                            className={
                                sortBy === "role" ? styles.sortBySelected : ""
                            }
                            onClick={() => handleChangeSort("role")}
                        >
                            Role
                        </p>
                    </div>
                </header>
                <ul className={styles.otherMembers}>
                    {orgData && authUser && userDoc ? (
                        orgData.members
                            .sort((a: any, b: any) => {
                                if (sortBy === "name") {
                                    return sortIt === "asc"
                                        ? a.user.fullName.localeCompare(
                                              b.user.fullName
                                          )
                                        : b.user.fullName.localeCompare(
                                              a.user.fullName
                                          );
                                } else if (sortBy === "dateJoined") {
                                    return sortIt === "asc"
                                        ? Math.round(
                                              a.joinedAt.toDate() / 1000
                                          ) -
                                              Math.round(
                                                  b.joinedAt.toDate() / 1000
                                              )
                                        : Math.round(
                                              b.joinedAt.toDate() / 1000
                                          ) -
                                              Math.round(
                                                  a.joinedAt.toDate() / 1000
                                              );
                                } else if (sortBy === "role") {
                                    return sortIt === "asc"
                                        ? a.role.localeCompare(b.role)
                                        : b.role.localeCompare(a.role);
                                }
                            })
                            .map((member: any) => {
                                return !(member.userId === authUser.uid) ? (
                                    <li key={member.userId} className="fadeIn">
                                        <p>
                                            <Link
                                                href={`/profile/${member.userId}`}
                                            >
                                                {member.user.fullName}
                                            </Link>
                                        </p>
                                        <p>
                                            {member.joinedAt
                                                .toDate()
                                                .toDateString()}
                                        </p>
                                        {isAdmin &&
                                        !(member.userId === authUser.uid) ? (
                                            <FormControl size="small">
                                                <Select
                                                    defaultValue={member.role}
                                                    onChange={async (e) => {
                                                        e.preventDefault();
                                                        const newRole =
                                                            e.target.value;
                                                        const confirmChange =
                                                            window.confirm(
                                                                `ARE YOU SURE YOU WANT TO CHANGE ${member.user.fullName}'s ROLE FROM '${member.role}' to '${newRole}'`
                                                            );
                                                        if (confirmChange) {
                                                            try {
                                                                const userOrgDocRef =
                                                                    doc(
                                                                        db,
                                                                        `organizations/${orgId}/members`,
                                                                        member.userId
                                                                    );
                                                                const userDocRef =
                                                                    doc(
                                                                        db,
                                                                        `users/${member.userId}/organizations`,
                                                                        orgId as string
                                                                    );

                                                                const batch =
                                                                    writeBatch(
                                                                        db
                                                                    );

                                                                // Update role in organization document
                                                                batch.update(
                                                                    userOrgDocRef,
                                                                    {
                                                                        role: newRole,
                                                                    }
                                                                );

                                                                // Update role in user document (inside organizations field)
                                                                batch.update(
                                                                    userDocRef,
                                                                    {
                                                                        role: newRole,
                                                                    }
                                                                );

                                                                await batch.commit();

                                                                await createLog(
                                                                    orgId as string,
                                                                    member.userId,
                                                                    {
                                                                        type: "change_role",
                                                                        text: `${userDoc.firstName} changes ${member.user.firstName} role from ${member.role} to ${newRole}`,
                                                                    },
                                                                    userDoc.photoURL
                                                                );

                                                                alert(
                                                                    `${member.user.fullName}'s role has been updated to ${newRole}`
                                                                );

                                                                setRerenderer(
                                                                    rerenderer +
                                                                        1
                                                                );
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
                                                    <MenuItem
                                                        disabled={
                                                            member.role ==
                                                            "member"
                                                        }
                                                        value={"member"}
                                                    >
                                                        {"Member"}
                                                    </MenuItem>
                                                    <MenuItem
                                                        disabled={
                                                            member.role ==
                                                            "admin"
                                                        }
                                                        value={"admin"}
                                                    >
                                                        {"Admin"}
                                                    </MenuItem>
                                                </Select>
                                            </FormControl>
                                        ) : (
                                            <p>{member.role}</p>
                                        )}
                                    </li>
                                ) : (
                                    <></>
                                );
                            })
                    ) : (
                        <section>
                            <Loading />
                        </section>
                    )}
                </ul>
            </main>
        </div>
    );
}

const InvitationLink = ({
    open,
    handleOpen,
    handleClose,
    userDoc,
    orgId,
    userId,
}: any) => {
    const [newOldLink, setNewOldLink] = useState<string>("");
    const [inviteLink, setInviteLink] = useState<string>("");
    const [inviteExpiredAt, setInviteExpiredAt] = useState<string>("");
    const [loading, setLoading] = useState<boolean>();
    const [generateLoading, setGenerateLoading] = useState<boolean>();

    const [generateNew, setGenerateNew] = useState<boolean>(false);

    //////////////////////////////       1H  6H  1D   3D   1W    1M    3M
    const [expiry, setExpiry] = useState<1 | 6 | 24 | 72 | 168 | 720 | 2160>(
        24
    );

    const { enqueueSnackbar } = useSnackbar();

    const style = {
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

    const handleSuccessCopy = () => {
        enqueueSnackbar("Link Copied To Clipboard!!", { variant: "success" });
    };

    useEffect(() => {
        const checkExistingLinks = async () => {
            setGenerateNew(false);
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
                        setInviteExpiredAt(
                            data.expiresAt.toDate().toLocaleString()
                        );
                        setInviteLink(
                            `http://localhost:3000/organization/join/${data.token}`
                        );
                    }
                });
                setLoading(false);
            }
        };

        setExpiry(24);
        checkExistingLinks();
    }, [userDoc, orgId, open]);

    const handleGenerateLink = async () => {
        setGenerateLoading(true);
        if (userDoc) {
            const { link, expiresAt } = await generateInviteLink(
                orgId as string,
                expiry,
                userDoc
            );
            setNewOldLink("new");
            setInviteLink(link);
            setInviteExpiredAt(expiresAt.toDate().toLocaleString());
            setGenerateNew(false);
        } else {
            console.error("NO USER");
        }
        await createLog(
            orgId as string,
            userId,
            {
                type: "generate_invite_link",
                text: `${userDoc.firstName} generate a new Invite Link that will expires in ${inviteExpiredAt}`,
            },
            userDoc.photoURL
        );
        setGenerateLoading(false);
    };

    const handleChangeExpiry = (e: any) => {
        e.preventDefault();
        setExpiry(e.target.value);
    };

    return (
        <>
            <Button className="btn-def fadeIn" onClick={handleOpen}>
                <p>INVITE NEW MEMBER</p>
                <PersonAddIcon fontSize="small" />
            </Button>
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={style} className={styles.inviteLinkModal}>
                    <header>
                        <h2>INVITATION LINK</h2>
                        <IconButton onClick={handleClose}>
                            <CloseIcon />
                        </IconButton>
                    </header>
                    {loading ? (
                        <WhisperSpinner
                            size={50}
                            color="#8A8FF8"
                            frontColor="#8A8FF8"
                            backColor="#8A8FF8"
                        />
                    ) : inviteLink && newOldLink == "old" ? (
                        <div className={`${styles.linkContainer} fadeIn`}>
                            <p>
                                Existing Invite Link (Expires in{" "}
                                {inviteExpiredAt})
                            </p>
                            <div>
                                <input type="text" value={inviteLink} />
                                <IconButton
                                    onClick={() => {
                                        navigator.clipboard.writeText(
                                            inviteLink
                                        );
                                        // alert("Copied to clipboard!");
                                        handleSuccessCopy();
                                    }}
                                >
                                    <ContentCopyIcon />
                                </IconButton>
                            </div>
                        </div>
                    ) : inviteLink && newOldLink === "new" ? (
                        <div>
                            {inviteLink && (
                                <div
                                    className={`${styles.linkContainer} fadeIn`}
                                >
                                    <p>
                                        NEW LINK GENERATED (Expires in{" "}
                                        {inviteExpiredAt})
                                    </p>
                                    <div>
                                        <input
                                            className="inp-dis"
                                            type="text"
                                            value={inviteLink}
                                        />
                                        <IconButton
                                            onClick={() => {
                                                navigator.clipboard.writeText(
                                                    inviteLink
                                                );
                                                // alert("Copied to clipboard!");
                                                handleSuccessCopy();
                                            }}
                                        >
                                            <ContentCopyIcon />
                                        </IconButton>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div>
                            <p>
                                No invitation link exists for this organization
                            </p>
                        </div>
                    )}
                    <Divider />
                    {generateNew ? (
                        <div className={styles.generateNewContainer}>
                            <h2>GENERATE NEW INVITATION LINK</h2>
                            <div>
                                <FormControl fullWidth size="small">
                                    <InputLabel id="demo-simple-select-label">
                                        Token Expiry
                                    </InputLabel>
                                    <Select
                                        value={expiry}
                                        onChange={handleChangeExpiry}
                                        label="Token Expiry"
                                    >
                                        <MenuItem value={1}>1 Hour</MenuItem>
                                        <MenuItem value={6}>6 Hour</MenuItem>
                                        <MenuItem value={24}>1 Day</MenuItem>
                                        <MenuItem value={72}>3 Days</MenuItem>
                                        <MenuItem value={168}>7 Days</MenuItem>
                                        <MenuItem value={672}>30 Days</MenuItem>
                                        <MenuItem value={2016}>
                                            90 Days
                                        </MenuItem>
                                    </Select>
                                </FormControl>
                                <Button
                                    className="btn-def"
                                    onClick={handleGenerateLink}
                                    disabled={generateLoading}
                                >
                                    <p>GENERATE</p>{" "}
                                    <AddIcon fontSize={"small"} />
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <Button
                            className="btn-def"
                            onClick={() => setGenerateNew(true)}
                        >
                            <p>GENERATE NEW</p> <AddIcon fontSize={"small"} />
                        </Button>
                    )}
                </Box>
            </Modal>
        </>
    );
};
