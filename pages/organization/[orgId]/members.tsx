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
import {
    Box,
    Button,
    Divider,
    Modal,
    Skeleton,
    styled,
    Tooltip,
    Typography,
} from "@mui/material";
import Snackbar from "@mui/material/Snackbar";

import { SnackbarProvider, VariantType, useSnackbar } from "notistack";
import { default as MaterialMenuItem } from "@mui/material/MenuItem";
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
import { Dropdown } from "@mui/base/Dropdown";
import { MenuButton as BaseMenuButton } from "@mui/base/MenuButton";
import { Menu } from "@mui/base/Menu";
import { MenuItem as BaseMenuItem, menuItemClasses } from "@mui/base/MenuItem";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import removeMember from "@/function/removeMember";
import RefreshIcon from "@mui/icons-material/Refresh";

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

export default function OrganizationMembers() {
    const router = useRouter();
    const [rerenderer, setRerenderer] = useState<number>(0);

    const handleRerender = () => {
        setRerenderer((r) => r + 1);
    };

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

    const [membersToRemove, setMembersToRemove] = useState([]);
    const [openRemoveMemberModal, setOpenRemoveMemberModal] =
        useState<boolean>(false);
    const handleOpenRemoveMemberModal = () => setOpenRemoveMemberModal(true);
    const handleCloseRemoveMemberModal = () => setOpenRemoveMemberModal(false);

    const handleChangeSort = (by: string) => {
        if (sortBy == by) {
            setSortIt(sortIt == "asc" ? "des" : "asc");
            return;
        }
        setSortBy(by);
        setSortIt("asc");
        return;
    };

    const handleRemoveUser = (memberList: any) => {
        if (isAdmin) {
            setMembersToRemove(memberList);
            handleOpenRemoveMemberModal();
        }
        return;
    };

    const Listbox = styled("ul")(
        ({ theme }) => `
        box-sizing: border-box;
        padding: 0.5rem;

        margin: 12px 0;
        border: 1px solid var(--color-dimmer);
        border-radius: 5px;
        overflow: auto;
        outline: 0px;
        list-style: none;
        background-color: var(--background);
        box-shadow: 0px 4px 6px ${
            theme.palette.mode === "dark"
                ? "rgba(0,0,0, 0.50)"
                : "rgba(0,0,0, 0.05)"
        };
        z-index: 1000;
        cursor: pointer;
        `
    );

    const StyledBaseMenuItem: any = styled(BaseMenuItem)(
        ({ theme }) => `
        list-style: none;
        padding: 0.5rem 0.8rem;
        border-radius: 3px;
        cursor: default;
        user-select: none;
        transition: background-color 0.2s ease, color 0.2s ease;
        font-weight: 600;
      
        &:last-of-type {
          border-bottom: none;
        }

        &:hover {
            background-color: var(--hover-background);
            color: var(--danger);
            cursor: pointer;
        }
    
        &.${menuItemClasses.disabled} {
            background-color: var(--transparent-background);
            color: var(--color-dimmed);
            cursor: disable;
        }
        `
    );

    const StyledMenuButton = styled(BaseMenuButton)(
        ({ theme }) => `
        border-radius: 3px;
        width: 35px;
        height: 35px;
        color: white;
        border: 1px solid var(--color-dimmer);
        transition: all 150ms ease;
        cursor: pointer;
        background-color: var(--highlight-button);

        display: flex;
        justify-content: center;
        align-items: center;

        &:hover {
            background-color: var(--hover-highlight-button);
        }
        `
    );

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
                                sx={{ bgcolor: "var(--color-dimmer)" }}
                                width={100}
                                height={20.8}
                            />
                            <Skeleton
                                variant="text"
                                sx={{ bgcolor: "var(--color-dimmer)" }}
                                width={70}
                                height={20.8}
                            />
                            <Skeleton
                                variant="text"
                                sx={{ bgcolor: "var(--color-dimmer)" }}
                                width={60}
                                height={20.8}
                            />
                        </>
                    )}
                </div>
                <hr />
                <header className={styles.memberListHeader}>
                    <div className={styles.memberListTitle}>
                        <h2>Other Members</h2>
                        <IconButton onClick={handleRerender}>
                            {/* <Tooltip
                                title={"Refresh"}
                            > */}
                            <RefreshIcon fontSize="small" />
                            {/* </Tooltip> */}
                        </IconButton>
                    </div>
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
                        <p></p>
                    </div>
                </header>
                <ul className={styles.otherMembers}>
                    {orgData &&
                    authUser &&
                    userDoc &&
                    orgData.members.length < 2 ? (
                        <section className="fadeIn">
                            <h3 className="dim italic">
                                Whoa... It&apos;s lonely down here!
                            </h3>
                            {isAdmin && (
                                <p className="dim italic">
                                    <a
                                        className="pointer dim bold"
                                        onClick={handleOpenInviteModal}
                                    >
                                        Invite
                                    </a>{" "}
                                    other people.
                                </p>
                            )}
                        </section>
                    ) : orgData && authUser && userDoc ? (
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

                                                                handleRerender();
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
                                                    <MaterialMenuItem
                                                        disabled={
                                                            member.role ==
                                                            "member"
                                                        }
                                                        value={"member"}
                                                    >
                                                        {"Member"}
                                                    </MaterialMenuItem>
                                                    <MaterialMenuItem
                                                        disabled={
                                                            member.role ==
                                                            "admin"
                                                        }
                                                        value={"admin"}
                                                    >
                                                        {"Admin"}
                                                    </MaterialMenuItem>
                                                </Select>
                                            </FormControl>
                                        ) : (
                                            <p>{member.role}</p>
                                        )}
                                        <Dropdown>
                                            {/* <Tooltip title={"More"}> */}
                                            <StyledMenuButton>
                                                <MoreVertIcon fontSize="small" />
                                            </StyledMenuButton>
                                            {/* </Tooltip> */}
                                            <Menu slots={{ listbox: Listbox }}>
                                                <StyledBaseMenuItem
                                                    disabled={!isAdmin}
                                                    onClick={() => {
                                                        handleRemoveUser([
                                                            {
                                                                uid: member.userId,
                                                                fullName:
                                                                    member.user
                                                                        .fullName,
                                                                firstName:
                                                                    member.user
                                                                        .firstName,
                                                                lastName:
                                                                    member.user
                                                                        .lastName,
                                                                photoURL:
                                                                    member.user
                                                                        .photoURL,
                                                            },
                                                        ]);
                                                    }}
                                                >
                                                    <p>Remove Member</p>
                                                </StyledBaseMenuItem>
                                            </Menu>
                                        </Dropdown>
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
                <Modal
                    open={openRemoveMemberModal}
                    onClose={handleCloseRemoveMemberModal}
                    aria-labelledby="modal-modal-title"
                    aria-describedby="modal-modal-description"
                >
                    <Box sx={modalBoxStyle}>
                        <Typography variant="h6" component="h2">
                            Are you sure you want to remove this member?
                        </Typography>
                        <Button
                            className="btn-def btn-danger"
                            onClick={() => {
                                if (membersToRemove) {
                                    removeMember({
                                        orgId: orgId as string,
                                        perpetrator: {
                                            uid: authUser?.uid,
                                            ...userDoc,
                                        },
                                        memberList: membersToRemove,
                                    });
                                    handleRerender();
                                }
                                handleCloseRemoveMemberModal();
                            }}
                        >
                            <p>Yes, Remove Member</p>
                        </Button>
                        <Button
                            className="btn-ref"
                            onClick={() => handleCloseRemoveMemberModal()}
                        >
                            <p>Cancel</p>
                        </Button>
                    </Box>
                </Modal>
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

    const handleSuccessCopy = () => {
        enqueueSnackbar("Link Copied To Clipboard!", { variant: "success" });
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
                <Box sx={modalBoxStyle} className={styles.inviteLinkModal}>
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
                                <input
                                    readOnly
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
                                            readOnly
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
                                        <MaterialMenuItem value={1}>
                                            1 Hour
                                        </MaterialMenuItem>
                                        <MaterialMenuItem value={6}>
                                            6 Hour
                                        </MaterialMenuItem>
                                        <MaterialMenuItem value={24}>
                                            1 Day
                                        </MaterialMenuItem>
                                        <MaterialMenuItem value={72}>
                                            3 Days
                                        </MaterialMenuItem>
                                        <MaterialMenuItem value={168}>
                                            7 Days
                                        </MaterialMenuItem>
                                        <MaterialMenuItem value={672}>
                                            30 Days
                                        </MaterialMenuItem>
                                        <MaterialMenuItem value={2016}>
                                            90 Days
                                        </MaterialMenuItem>
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
