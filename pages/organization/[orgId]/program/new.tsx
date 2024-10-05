import { ArrowBackIosNew, ManageAccountsOutlined } from "@mui/icons-material";
import { Button, Divider, Tooltip } from "@mui/material";
import Head from "next/head";
import { useRouter } from "next/router";
import { useState } from "react";
import styles from "@/styles/organization/orgId/programs/NewProgram.module.sass";
import { addDoc, collection, doc, setDoc, Timestamp } from "firebase/firestore";
import { db } from "@/firebase";
import useOrganizationData from "@/function/useOrganizationData";
import { useSnackbar } from "notistack";
import { v4 as uuidv4 } from "uuid";

const NewProgramCreation = () => {
    const router = useRouter();
    const { orgId } = router.query;
    const { enqueueSnackbar } = useSnackbar();

    const [loading, setLoading] = useState<boolean>(false);

    const [name, setName] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [dateStart, setDateStart] = useState<any>("");
    const [dateEnd, setDateEnd] = useState<any>("");
    const [currentStatus, setCurrentStatus] = useState<
        "upcoming" | "ongoing" | "completed" | "failed"
    >("upcoming");
    const [links, setLinks] = useState<{ name: string; url: string }[]>([]);
    const [committee, setCommittee] = useState<
        { name: string; position: string; chief: boolean }[]
    >([]);

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setName(e.target.value);
    };
    const handleDescriptionChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        setDescription(e.target.value);
    };
    const handleDateStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDateStart(e.target.value);
    };
    const handleDateEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDateEnd(e.target.value);
    };
    const handleCurrentStatusChange = (e: any) => {
        setCurrentStatus(e.target.value);
    };

    const handleAddLink = () => {
        setLinks((prev) => [...prev, { name: "", url: "" }]);
    };

    const handleLinkNameChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        index: number
    ) => {
        setLinks((prev) => {
            const newLinks = [...prev];
            newLinks[index].name = e.target.value;
            return newLinks;
        });
    };

    const handleLinkUrlChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        index: number
    ) => {
        setLinks((prev) => {
            const newLinks = [...prev];
            newLinks[index].url = e.target.value;
            return newLinks;
        });
    };

    const handleRemoveLink = (index: number) => {
        setLinks((prev) => {
            const updatedLinks = prev.filter((_, i) => i !== index);
            return updatedLinks.length > 0 ? updatedLinks : [];
        });
    };

    const handleAddCommittee = () => {
        setCommittee((prev) => [
            ...prev,
            { name: "", position: "", chief: committee.length === 0 },
        ]);
    };

    const handleCommitteeNameChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        index: number
    ) => {
        setCommittee((prev) => {
            const newCommittee = [...prev];
            newCommittee[index].name = e.target.value;
            return newCommittee;
        });
    };

    const handleCommitteePositionChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        index: number
    ) => {
        setCommittee((prev) => {
            const newCommittee = [...prev];
            newCommittee[index].position = e.target.value;
            return newCommittee;
        });
    };

    const handleRemoveCommittee = (index: number) => {
        setCommittee((prev) => {
            const newCommittee = prev.filter((_, i) => i !== index);
            if (newCommittee.length > 0 && !newCommittee[0].chief) {
                newCommittee[0].chief = true;
            }
            return newCommittee;
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setLoading(true);
        if (!orgId) return;
        if (
            !name ||
            !dateStart ||
            !dateEnd ||
            !currentStatus ||
            committee.length === 0
        )
            return;

        const programId = uuidv4();

        const programData = {
            // TODO: make the chief value to grab from the committee list and return the name of the item of which chief is true
            id: programId,
            name,
            description,
            dateStart: Timestamp.fromDate(new Date(dateStart)),
            dateEnd: Timestamp.fromDate(new Date(dateStart)),
            status: currentStatus,
            usefulLinks:
                (links.length == 1 && links[0].name == "") ||
                (links.length == 1 && links[0].url == "")
                    ? []
                    : links,
            chief: committee.find((member) => member.chief)?.name,
        };
        try {
            await setDoc(
                doc(
                    db,
                    "organizations",
                    orgId as string,
                    "programs",
                    programId
                ),
                programData
            );

            // Add committee members as subcollection
            const committeeRef = collection(
                db,
                "organizations",
                orgId as string,
                "programs",
                programId,
                "committee"
            );
            await Promise.all(
                committee.map(async (member) => {
                    await addDoc(committeeRef, {
                        name: member.name,
                        role: member.position,
                    });
                })
            );

            enqueueSnackbar(
                "Program created successfully! You will be redirected in 3 seconds",
                {
                    variant: "success",
                }
            );
            setLoading(false);
            setTimeout(() => {
                router.push(
                    `/organization/${orgId as string}/program/${programId}`
                );
            }, 3000);
        } catch (error) {
            console.error("Error creating program:", error);
            enqueueSnackbar("Failed to create program. Please try again.", {
                variant: "error",
            });
            setLoading(false);
        }
    };

    return (
        <>
            <Head>
                <title>New Program</title>
            </Head>
            <div className={styles.container}>
                <header className={styles.header}>
                    <Button
                        className="btn-compact"
                        onClick={() => {
                            router.back();
                        }}
                    >
                        <ArrowBackIosNew fontSize="small" />
                    </Button>
                    <h1>Create a new program</h1>
                    <p className="dim">
                        A program contains files storage, tasks list, committee
                        or volunteers management, and budget management.
                    </p>
                    <p className="italic bold dim">
                        Required values are marked with asterisks (*).
                    </p>
                </header>
                <Divider />
                <main className={styles.main}>
                    <form onSubmit={handleSubmit}>
                        <label>
                            <p>Name*</p>
                            <input
                                className="inp-form"
                                type="text"
                                value={name}
                                required
                                placeholder="Name of the program"
                                onChange={handleNameChange}
                            />
                        </label>
                        <label>
                            <p>Description</p>
                            <input
                                className="inp-form"
                                type="text"
                                value={description}
                                placeholder="Description of the program"
                                onChange={handleDescriptionChange}
                            />
                        </label>
                        <label>
                            <p>Date Start*</p>
                            <input
                                className="inp-form"
                                type="date"
                                value={dateStart}
                                required
                                onChange={handleDateStartChange}
                            />
                        </label>
                        <label>
                            <p>Date End*</p>
                            <input
                                className="inp-form"
                                type="date"
                                value={dateEnd}
                                required
                                onChange={handleDateEndChange}
                            />
                        </label>
                        <label>
                            <p>Current Status*</p>
                            <select
                                className="inp-form"
                                value={currentStatus}
                                required
                                onChange={handleCurrentStatusChange}
                            >
                                <option value="upcoming">Upcoming</option>
                                <option value="ongoing">Ongoing</option>
                                <option value="completed">Completed</option>
                                <option value="failed">Failed</option>
                            </select>
                        </label>
                        <label>
                            <p>Links</p>
                            <section>
                                <ul className={styles.links}>
                                    {links.map((link, index) => (
                                        <li key={index}>
                                            <input
                                                className="inp-form"
                                                type="text"
                                                value={link.name}
                                                onChange={(e) =>
                                                    handleLinkNameChange(
                                                        e,
                                                        index
                                                    )
                                                }
                                                placeholder="Name"
                                            />
                                            <input
                                                className="inp-form"
                                                type="text"
                                                value={link.url}
                                                onChange={(e) =>
                                                    handleLinkUrlChange(
                                                        e,
                                                        index
                                                    )
                                                }
                                                placeholder="URL"
                                            />
                                            <Button
                                                className="btn-danger"
                                                onClick={() =>
                                                    handleRemoveLink(index)
                                                }
                                            >
                                                Remove
                                            </Button>
                                        </li>
                                    ))}
                                </ul>
                                <Button
                                    className="btn-def"
                                    onClick={handleAddLink}
                                >
                                    Add Link
                                </Button>
                            </section>
                        </label>
                        <label>
                            <p>Committee*</p>
                            <section>
                                <ul className={styles.links}>
                                    {committee.map((member, index) => (
                                        <li key={index}>
                                            <input
                                                className="inp-form"
                                                type="text"
                                                value={member.name}
                                                required
                                                onChange={(e) =>
                                                    handleCommitteeNameChange(
                                                        e,
                                                        index
                                                    )
                                                }
                                                placeholder="Name"
                                            />
                                            <input
                                                className="inp-form"
                                                type="text"
                                                value={member.position}
                                                required
                                                onChange={(e) =>
                                                    handleCommitteePositionChange(
                                                        e,
                                                        index
                                                    )
                                                }
                                                placeholder="Position"
                                            />
                                            <Button
                                                className="btn-danger"
                                                onClick={() =>
                                                    handleRemoveCommittee(index)
                                                }
                                            >
                                                Remove
                                            </Button>
                                            <Tooltip
                                                title="Set Chief Executive"
                                                arrow
                                                placement="right"
                                                enterDelay={500}
                                                leaveDelay={300}
                                            >
                                                <Button
                                                    className="btn-compact"
                                                    onClick={() => {
                                                        setCommittee((prev) => {
                                                            // If the current index is a chief and the only chief, if user try to set it to no chief, dont let them
                                                            const newCommittee =
                                                                [...prev];
                                                            const chiefIndex =
                                                                newCommittee.findIndex(
                                                                    (c) =>
                                                                        c.chief
                                                                );
                                                            if (
                                                                chiefIndex ===
                                                                    index &&
                                                                newCommittee.filter(
                                                                    (c) =>
                                                                        c.chief
                                                                ).length === 1
                                                            ) {
                                                                return prev;
                                                            } else {
                                                                newCommittee[
                                                                    index
                                                                ].chief =
                                                                    !newCommittee[
                                                                        index
                                                                    ].chief;
                                                                if (
                                                                    newCommittee[
                                                                        index
                                                                    ].chief &&
                                                                    chiefIndex !==
                                                                        -1
                                                                ) {
                                                                    newCommittee[
                                                                        chiefIndex
                                                                    ].chief =
                                                                        false;
                                                                }
                                                                return newCommittee;
                                                            }
                                                        });
                                                    }}
                                                >
                                                    <ManageAccountsOutlined
                                                        color={
                                                            committee[index]
                                                                .chief
                                                                ? "primary"
                                                                : "disabled"
                                                        }
                                                        fontSize="small"
                                                    />
                                                </Button>
                                            </Tooltip>
                                        </li>
                                    ))}
                                </ul>
                                <Button
                                    className="btn-def"
                                    onClick={handleAddCommittee}
                                >
                                    Add Committee
                                </Button>
                            </section>
                        </label>
                        <Button className="btn-def" type="submit">
                            Create
                        </Button>
                    </form>
                </main>
            </div>
        </>
    );
};

export default NewProgramCreation;
