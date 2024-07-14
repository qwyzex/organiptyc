import React, {
    useState,
    useEffect,
    useRef,
    useContext,
    ChangeEvent,
    DragEventHandler,
} from "react";
import {
    getStorage,
    ref,
    listAll,
    getDownloadURL,
    getMetadata,
    uploadBytes,
    uploadBytesResumable,
} from "firebase/storage";
import { storage } from "@/firebase";
import { useRouter } from "next/router";
import FileFolderDetails from "@/components/FileFolderDetails";
import uploadFile from "@/function/uploadFile";
import { UserContext } from "@/context/UserContext";
import styles from "@/styles/organization/orgId/Files.module.sass";
import Link from "next/link";
import {
    Box,
    Breadcrumbs,
    Button,
    Divider,
    IconButton,
    LinearProgress,
    Modal,
    Typography,
} from "@mui/material";
import FolderIcon from "@mui/icons-material/Folder";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import InfoIcon from "@mui/icons-material/Info";

export interface FileItem {
    name: string;
    url: string;
    metadata: {
        size: number;
        contentType: string | undefined;
        timeCreated: string;
        updated: string;
        fullPath: string;
        [key: string]: any;
    };
}

export interface FolderItem {
    name: string;
    url?: string;
    metadata?: {
        [key: string]: any;
    };
}

// const FileDisplay: React.FC<{ orgId: string }> = ({ orgId }) => {
const FileDisplay = () => {
    const router = useRouter();
    const { orgId } = router.query;
    const { authUser, loading, userDoc } = useContext(UserContext);

    const [files, setFiles] = useState<FileItem[]>([]);
    const [folders, setFolders] = useState<FolderItem[]>([]);
    const [path, setPath] = useState("");
    const [rerenderer, setRerenderer] = useState<number>(0);
    const [filesLoading, setFilesLoading] = useState<boolean>(true);

    const [selectedItems, setSelectedItems] = useState<any>([]);
    const [selectedType, setSelectedType] = useState<"file" | "folder" | null>(null);
    const [openDetails, setOpenDetails] = useState(false);

    const itemListRef = useRef<HTMLTableElement>(null);
    const detailsPaneRef = useRef<HTMLDivElement>(null);
    // const detailsPaneToggleRef = useRef<HTMLSpanElement>(null);

    const [openUploadModal, setOpenUploadModal] = useState<boolean>(false);
    const handleOpenUploadModal = () => setOpenUploadModal(true);
    const handleCloseUploadModal = () => setOpenUploadModal(false);

    const clearSelection = () => {
        setSelectedItems([]);
        setSelectedType(null);
    };

    const handleClickOutside = (event: MouseEvent) => {
        if (
            itemListRef.current &&
            detailsPaneRef.current &&
            !itemListRef.current.contains(event.target as Node) &&
            !detailsPaneRef.current.contains(event.target as Node)
        ) {
            clearSelection();
        }
    };

    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
        // eslint-disable-next-line
    }, []);

    useEffect(() => {
        const fetchFilesAndFolders = async () => {
            const listRef = ref(storage, `organization/${orgId}/${path}`);
            const res = await listAll(listRef);

            const filePromises = res.items.map(async (itemRef) => {
                const url = await getDownloadURL(itemRef);
                const metadata = await getMetadata(itemRef);

                console.log("INDIVIDUAL ITEM : ", metadata);

                return {
                    name: itemRef.name,
                    url,
                    metadata: {
                        size: metadata.size,
                        contentType: metadata.contentType,
                        timeCreated: metadata.timeCreated,
                        updated: metadata.updated,
                        fullPath: metadata.fullPath,
                    },
                };
            });

            setFiles(await Promise.all(filePromises));
            setFolders(res.prefixes.map((folderRef) => ({ name: folderRef.name })));
            setFilesLoading(false);
            // console.log()
        };

        fetchFilesAndFolders();
    }, [orgId, authUser, path, rerenderer]);

    const handleItemClick = (item: FileItem | FolderItem, type: "file" | "folder") => {
        if (selectedItems.length == 1 && !selectedItems[0].url) {
            clearSelection();
        }
        setSelectedItems((prevSelectedItems: any) => {
            if (prevSelectedItems.includes(item)) {
                return prevSelectedItems.filter((i: any) => i !== item);
            } else {
                return [...prevSelectedItems, item];
            }
        });
        setSelectedType(type);
    };

    const navigateToFolder = (folderRef: FolderItem) => {
        setPath(`${path}${folderRef.name}/`);
    };

    const navigateBack = () => {
        const newPath = path.split("/").slice(0, -2).join("/");
        setPath(newPath ? `${newPath}/` : "");
    };

    const handleOpenDetailsPane = () => {
        if (openDetails == true) {
            setOpenDetails(false);
        } else {
            setOpenDetails(true);
        }
    };

    const Loading = () => {
        return (
            <>
                <svg
                    className="loadingContainer"
                    x="0px"
                    y="0px"
                    viewBox="0 0 37 37"
                    height="37"
                    width="37"
                    preserveAspectRatio="xMidYMid meet"
                >
                    <path
                        className="track"
                        fill="none"
                        strokeWidth="5"
                        pathLength="100"
                        d="M36.63 31.746 c0 -13.394 -7.3260000000000005 -25.16 -18.13 -31.375999999999998 C7.696 6.66 0.37 18.352 0.37 31.746 c5.328 3.108 11.544 4.8839999999999995 18.13 4.8839999999999995 S31.301999999999996 34.854 36.63 31.746z"
                    ></path>
                    <path
                        className="car"
                        fill="none"
                        strokeWidth="5"
                        pathLength="100"
                        d="M36.63 31.746 c0 -13.394 -7.3260000000000005 -25.16 -18.13 -31.375999999999998 C7.696 6.66 0.37 18.352 0.37 31.746 c5.328 3.108 11.544 4.8839999999999995 18.13 4.8839999999999995 S31.301999999999996 34.854 36.63 31.746z"
                    ></path>
                </svg>
            </>
        );
    };

    return (
        <div className={styles.container}>
            <header>
                <div>
                    <h2>Organization Files</h2>
                    <div>
                        <UploadFileModal
                            open={openUploadModal}
                            handleOpen={handleOpenUploadModal}
                            handleClose={handleCloseUploadModal}
                            orgId={orgId}
                            path={path}
                            authUser={authUser}
                            userDoc={userDoc}
                            setRerenderer={setRerenderer}
                        />
                        <Button className="btn-ref" onClick={handleOpenDetailsPane}>
                            <InfoIcon fontSize="small" />
                            File Info
                            {/* {openDetails ? "CLOSE" : "OPEN"} DETAILS PANE */}
                        </Button>
                    </div>
                </div>
                <section>
                    <IconButton onClick={navigateBack} disabled={!path}>
                        <ArrowUpwardIcon fontSize="small" />
                    </IconButton>
                    <Breadcrumbs maxItems={6}>
                        <p>{""}</p>
                        {path.split("/").map((address, index) => (
                            <a key={index}>{address}</a>
                        ))}
                    </Breadcrumbs>
                    {/* <p>{path}</p> */}
                </section>
                {/* <Button className="btn-def">UPLOAD FILE</Button> */}
            </header>
            <main className={styles.tableContainer}>
                <section ref={!openDetails ? detailsPaneRef : null}>
                    <table ref={itemListRef}>
                        <thead>
                            <tr>
                                <th>Name</th>
                                {!openDetails && (
                                    <>
                                        <th>Type</th>
                                        <th>Last Updated</th>
                                        <th>Size</th>
                                    </>
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {filesLoading && (
                                <tr>
                                    <td>
                                        <Loading />
                                    </td>
                                </tr>
                            )}
                            {folders.length === 0 &&
                                files.length === 0 &&
                                !filesLoading && (
                                    <tr>
                                        <td>
                                            <h4>This directory is empty</h4>
                                        </td>
                                    </tr>
                                )}
                            {folders.map((folder: FolderItem, index: number) => (
                                <tr
                                    onClick={() => {
                                        setSelectedItems([folder]);
                                        setSelectedType("folder");
                                    }}
                                    onDoubleClick={() => navigateToFolder(folder)}
                                    key={index}
                                    className={
                                        selectedItems.includes(folder)
                                            ? styles.selected
                                            : ""
                                    }
                                >
                                    <td>
                                        <div>
                                            <div className={styles.itemListIcon}>
                                                <FolderIcon fontSize="small" />
                                            </div>
                                            <a
                                                rel="noopener noreferrer"
                                                className={styles.itemListName}
                                            >
                                                {folder.name}/
                                            </a>
                                        </div>
                                    </td>
                                    {!openDetails && (
                                        <>
                                            <td>
                                                <p>Folder</p>
                                            </td>
                                            <td>
                                                <p>-</p>
                                            </td>
                                            <td>
                                                <p>-</p>
                                            </td>
                                        </>
                                    )}
                                </tr>
                            ))}
                            {files.map((file: FileItem, index: number) => (
                                <tr
                                    key={index}
                                    className={
                                        selectedItems.includes(file)
                                            ? styles.selected
                                            : ""
                                    }
                                    onClick={() => handleItemClick(file, "file")}
                                    onDoubleClick={() => {
                                        window.open(file.url, "_blank")?.focus();
                                    }}
                                >
                                    <td key={index}>
                                        <div>
                                            <div className={styles.itemListIcon}>
                                                <InsertDriveFileIcon fontSize="small" />
                                            </div>
                                            <a rel="noopener noreferrer">{file.name}</a>
                                        </div>
                                    </td>
                                    {!openDetails && (
                                        <>
                                            <td>
                                                <p>{file.metadata.contentType}</p>
                                            </td>
                                            <td>
                                                <p>
                                                    {new Date(
                                                        file.metadata.updated
                                                    ).toLocaleDateString()}
                                                </p>
                                            </td>
                                            <td>
                                                <p>
                                                    {(file.metadata.size / 1024).toFixed(
                                                        2
                                                    )}{" "}
                                                    KB
                                                </p>
                                            </td>
                                        </>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>

                {openDetails && (
                    <div
                        ref={detailsPaneRef}
                        className={`${styles.detailsPaneContainer} ${
                            openDetails ? styles.openDetailsPane : ""
                        }`}
                    >
                        <FileFolderDetails
                            items={selectedItems}
                            type={selectedType}
                            setrerenderer={setRerenderer}
                        />
                    </div>
                )}
            </main>
        </div>
    );
};

const UploadFileModal = ({
    open,
    handleOpen,
    handleClose,
    orgId,
    path,
    authUser,
    userDoc,
    setRerenderer,
}: any) => {
    const style = {
        position: "absolute" as "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: 500,
        bgcolor: "var(--background)",
        border: "2px solid #8A8FF8",
        borderRadius: 2,
        boxShadow: 24,
        p: 4,
    };

    const [dragging, setDragging] = useState(false);
    const [progress, setProgress] = useState(0);

    const handleFileUpload = async (files: any) => {
        const metadata: any = {
            uploadedByUID: authUser?.uid,
            uploadedByUSR: userDoc?.fullName,
            description: "",
            tags: "",
        };

        const totalFiles = files.length;
        let uploadedFiles = 0;

        for (const file of files) {
            const storageRef = ref(storage, `organization/${orgId}/${path}/${file.name}`);
            const uploadTask = uploadBytesResumable(storageRef, file, metadata);

            uploadTask.on(
                "state_changed",
                (snapshot: any) => {
                    const percentCompleted = Math.round(
                        (snapshot.bytesTransferred * 100) / snapshot.totalBytes
                    );
                    setProgress(
                        Math.round(
                            ((uploadedFiles + percentCompleted / 100) / totalFiles) * 100
                        )
                    );
                },
                (error: any) => {
                    console.error("Error uploading file:", error);
                },
                () => {
                    uploadedFiles++;
                    if (uploadedFiles === totalFiles) {
                        console.log("All files uploaded successfully.");
                        setRerenderer((prev: number) => prev + 1);
                        setProgress(100);
                        setTimeout(() => setProgress(0), 2000); // Reset progress after upload completion
                    }
                }
            );
        }
    };

    const handleDrop = (e: any) => {
        e.preventDefault();
        e.stopPropagation();
        setDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFileUpload(e.dataTransfer.files);
        }
    };

    const handleDragOver = (e: any) => {
        e.preventDefault();
        e.stopPropagation();
        if (!dragging) setDragging(true);
    };

    const handleDragLeave = (e: any) => {
        e.preventDefault();
        e.stopPropagation();
        setDragging(false);
    };

    const handleFileChange = (e: any) => {
        handleFileUpload(e.target.files);
    };

    return (
        <>
            <Button className="btn-def" onClick={handleOpen}>
                UPLOAD FILES
            </Button>
            <Modal open={open} onClose={progress > 0 ? undefined : handleClose}>
                <Box
                    sx={style}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                >
                    <div
                        style={{
                            border: dragging ? "2px dashed #8A8FF8" : "2px dashed #ccc",
                            padding: "20px",
                            textAlign: "center",
                        }}
                    >
                        {dragging ? (
                            <p>Drop files here...</p>
                        ) : (
                            <p>Drag and drop files here, or click to select files</p>
                        )}
                        <input
                            type="file"
                            multiple
                            onChange={handleFileChange}
                            style={{ display: "none" }}
                            id="fileInput"
                        />
                        <label htmlFor="fileInput" style={{ cursor: "pointer" }}>
                            <Button component="span">Select Files</Button>
                        </label>
                    </div>
                    {progress > 0 && (
                        <div style={{ marginTop: "20px" }}>
                            <Typography
                                variant="body2"
                                color="textSecondary"
                            >{`Upload Progress: ${progress}%`}</Typography>
                            <LinearProgress variant="determinate" value={progress} />
                        </div>
                    )}
                </Box>
            </Modal>
        </>
    );
};

export default FileDisplay;
