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
import styles from "@/styles/organization/orgId/Programs.module.sass";
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
import Head from "next/head";

export default function OrganizationPrograms() {
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

    // name, timeofexecution (toex), chief
    const [sortBy, setSortBy] = useState<string>("toex");
    const [sortIt, setSortIt] = useState<"asc" | "des">("asc");

    const handleChangeSort = (by: string) => {
        if (sortBy == by) {
            setSortIt(sortIt == "asc" ? "des" : "asc");
            return;
        }
        setSortBy(by);
        setSortIt("asc");
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
        <>
            <Head>
                <title>{orgData?.name} Programs</title>
            </Head>
            <div className={styles.container}>
                <header>
                    <h1>PROGRAMS</h1>
                    <section></section>
                </header>
                <main>
                    <header className={styles.memberListHeader}>
                        <div className={styles.memberListTitle}>
                            <h2>List of programs</h2>
                            <IconButton onClick={handleRerender}>
                                <RefreshIcon fontSize="small" />
                            </IconButton>
                        </div>
                        <div
                            className={`${styles.memberListParam} ${
                                sortIt === "asc" && styles.asc
                            }`}
                        >
                            <p
                                className={
                                    sortBy === "name"
                                        ? styles.sortBySelected
                                        : ""
                                }
                                onClick={() => handleChangeSort("name")}
                            >
                                Name
                            </p>
                            <p
                                className={
                                    sortBy === "toex"
                                        ? styles.sortBySelected
                                        : ""
                                }
                                onClick={() => handleChangeSort("toex")}
                            >
                                Time of Execution
                            </p>
                            <p
                                className={
                                    sortBy === "chief"
                                        ? styles.sortBySelected
                                        : ""
                                }
                                onClick={() => handleChangeSort("chief")}
                            >
                                Chief Executive
                            </p>
                            <p></p>
                        </div>
                    </header>
                    <ul className={styles.otherMembers}>
                        {orgData &&
                        authUser &&
                        userDoc &&
                        orgData.programs.length < 1 ? (
                            <section className="fadeIn">
                                <h3 className="dim italic">
                                    Hmmm... It&apos;s empty!
                                </h3>
                            </section>
                        ) : orgData &&
                          authUser &&
                          userDoc &&
                          orgData.programs ? (
                            orgData.programs
                                .sort((a: any, b: any) => {
                                    if (sortBy === "name") {
                                        return sortIt === "asc"
                                            ? a.name.localeCompare(b.name)
                                            : b.name.localeCompare(a.name);
                                    } else if (sortBy === "toex") {
                                        return sortIt === "asc"
                                            ? Math.round(
                                                  a.dateStart.toDate() / 1000
                                              ) -
                                                  Math.round(
                                                      b.dateStart.toDate() /
                                                          1000
                                                  )
                                            : Math.round(
                                                  b.dateStart.toDate() / 1000
                                              ) -
                                                  Math.round(
                                                      a.dateStart.toDate() /
                                                          1000
                                                  );
                                    } else if (sortBy === "chief") {
                                        return sortIt === "asc"
                                            ? a.chief.localeCompare(b.chief)
                                            : b.chief.localeCompare(a.chief);
                                    }
                                })
                                .map((program: any) => (
                                    <li key={program.id} className="fadeIn">
                                        <p>
                                            <Link
                                                href={`/organization/${orgId}/program/${program.id}`}
                                            >
                                                {program.name}
                                            </Link>
                                        </p>
                                        <p>
                                            {program.dateStart
                                                .toDate()
                                                .toDateString()}
                                        </p>
                                        <p>{program.chief}</p>

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
                                                        console.log(
                                                            "I DONT KNOW THAT THIS DOES"
                                                        );
                                                    }}
                                                >
                                                    <p>Manage Program</p>
                                                </StyledBaseMenuItem>
                                            </Menu>
                                        </Dropdown>
                                    </li>
                                ))
                        ) : (
                            <section>
                                <Loading />
                            </section>
                        )}
                    </ul>
                </main>
            </div>
        </>
    );
}
