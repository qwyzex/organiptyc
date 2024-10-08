import AdminWrap from "@/components/AdminWrap";
import Loading from "@/components/Loading";
import { UserContext } from "@/context/UserContext";
import { storage } from "@/firebase";
import createLog from "@/function/createLog";
import useProgramData from "@/function/useProgramData";
import styles from "@/styles/organization/orgId/programs/Budgets.module.sass";
import { FileDownload, UploadFileOutlined } from "@mui/icons-material";
import { Box, Button, LinearProgress, Typography } from "@mui/material";
import {
    deleteObject,
    getDownloadURL,
    ref,
    uploadBytesResumable,
} from "firebase/storage";
import { useRouter } from "next/router";
import { useSnackbar } from "notistack";
import {
    Dispatch,
    SetStateAction,
    useContext,
    useEffect,
    useState,
} from "react";
import { useDropzone } from "react-dropzone";
import * as XLSX from "xlsx";

type UploadBudgetProps = {
    orgId: string;
    programId: string;
    onUploadComplete: (url: string) => void; // Callback when upload is done
};

type DisplayBudgetProps = {
    orgId: string;
    programId: string;
    programName: string;
};

export default function ProgramBudgets() {
    const router = useRouter();
    const { orgId, programId } = router.query;

    const {
        programData,
        loading: programLoading,
        error: programError,
    } = useProgramData({
        orgId: orgId as string,
        programId: programId as string,
    });

    const [fileExists, setFileExists] = useState<boolean | null>(null);
    const budgetPath = `organization/${orgId}/programs/${programId}/${programId}_budgets.xlsx`;

    // Check if the file exists
    useEffect(() => {
        const checkFileExists = async () => {
            try {
                const fileRef = ref(storage, budgetPath);
                await getDownloadURL(fileRef);
                setFileExists(true); // If the URL is fetched successfully, file exists
            } catch (error) {
                setFileExists(null); // If error (like 404), file doesn't exist
            }
        };

        checkFileExists();

        // eslint-disable-next-line
    }, [orgId, programId]);

    return (
        <div className={styles.container}>
            <header>
                <h1>Budgets</h1>
                <p className="dim">Total: {programData?.budget}</p>
            </header>
            <main className={styles.main}>
                {fileExists == null && programData ? (
                    <UploadBudget
                        orgId={orgId as string}
                        programId={programId as string}
                        onUploadComplete={() => {}}
                    />
                ) : fileExists && programData ? (
                    <DisplayBudget
                        orgId={orgId as string}
                        programId={programId as string}
                        programName={programData.name}
                    />
                ) : (
                    <section>
                        <Loading />
                        <h4>Loading document...</h4>
                    </section>
                )}
            </main>
        </div>
    );
}

const UploadBudget = ({
    orgId,
    programId,
    onUploadComplete,
}: UploadBudgetProps) => {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [dragging, setDragging] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const onDrop = (acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (
            !file ||
            file.type !==
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        ) {
            setError("Please upload a valid .xlsx file");
            return;
        }
        setError(null);
        uploadFile(file);
    };

    const uploadFile = (file: File) => {
        const fileRef = ref(
            storage,
            `organization/${orgId}/programs/${programId}/${programId}_budgets.xlsx`
        );
        setUploading(true);
        const uploadTask = uploadBytesResumable(fileRef, file);

        uploadTask.on(
            "state_changed",
            (snapshot) => {
                const percentCompleted = Math.round(
                    (snapshot.bytesTransferred * 100) / snapshot.totalBytes
                );
                setProgress(percentCompleted);
            },
            (error) => {
                console.error("Upload failed:", error);
                setError("Upload failed. Please try again.");
                setUploading(false);
            },
            async () => {
                const downloadURL = await getDownloadURL(
                    uploadTask.snapshot.ref
                );
                setUploading(false);
                setProgress(100);
                onUploadComplete(downloadURL);
                setTimeout(() => setProgress(0), 2000); // Reset progress after completion
            }
        );
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
                [".xlsx"],
        },
        multiple: false,
    });

    return (
        <Box className={`fadeIn ${styles.uploadcontainer}`}>
            <div
                {...getRootProps()}
                className={`${styles.uploaddropzone} ${
                    dragging ? styles.uploadactive : ""
                }`}
                onDragEnter={() => setDragging(true)}
                onDragLeave={() => setDragging(false)}
            >
                <input {...getInputProps()} disabled={uploading} />
                {dragging ? (
                    <p>Drop files here...</p>
                ) : (
                    <p>
                        Drag and drop your .xlsx file here, or click to select a
                        file
                    </p>
                )}
                <Button className={`btn-def ${styles.uploaduploadBtn}`}>
                    Select Files
                </Button>
            </div>
            {progress > 0 && (
                <Box className={styles.uploadprogressContainer}>
                    <Typography variant="body2">{`Upload Progress: ${progress}%`}</Typography>
                    <LinearProgress variant="determinate" value={progress} />
                </Box>
            )}
            {error && (
                <Typography className={styles.uploaderror}>{error}</Typography>
            )}
        </Box>
    );
};

const DisplayBudget = ({
    orgId,
    programId,
    programName,
}: DisplayBudgetProps) => {
    const [budgetData, setBudgetData] = useState<any[][]>([]);
    const [uploadReplace, setUploadReplace] = useState<boolean>(false);
    const [rerenderer, setRerenderer] = useState<number>(0);

    const { authUser, userDoc } = useContext(UserContext);

    const { enqueueSnackbar } = useSnackbar();

    useEffect(() => {
        const fetchAndParseBudget = async () => {
            try {
                const fileRef = ref(
                    storage,
                    `organization/${orgId}/programs/${programId}/${programId}_budgets.xlsx`
                );
                const fileURL = await getDownloadURL(fileRef);

                // Fetch the file as a blob and parse it using SheetJS
                const response = await fetch(fileURL);
                const blob = await response.blob();
                const fileReader = new FileReader();

                fileReader.onload = (e: any) => {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: "array" });
                    const sheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[sheetName];
                    const jsonSheet: any = XLSX.utils.sheet_to_json(worksheet, {
                        header: 1,
                    });

                    setBudgetData(jsonSheet);
                };

                fileReader.readAsArrayBuffer(blob);
            } catch (error) {
                console.error("Error loading budget file:", error);
            }
        };

        fetchAndParseBudget();
    }, [orgId, programId, rerenderer]);

    const downloadBudget = async () => {
        const budgetPath = `organization/${orgId}/programs/${programId}/${programId}_budgets.xlsx`;
        const fileRef = ref(storage, budgetPath);

        try {
            const url = await getDownloadURL(fileRef);

            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `${programId}_budgets.xlsx`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error("Error downloading budget file:", error);
        }
    };

    const uploadAndReplaceBudget = async (
        orgId: string,
        programId: string,
        newFile: File
    ) => {
        const budgetPath = `organization/${orgId}/programs/${programId}/${programId}_budgets.xlsx`;
        const fileRef = ref(storage, budgetPath);

        setUploadReplace(true);

        if (authUser && userDoc) {
            try {
                // First, check if the old file exists by getting its URL
                await getDownloadURL(fileRef); // This will throw an error if the file doesn't exist

                // If the file exists, delete the old budget file
                await deleteObject(fileRef);
                console.log("Old budget file deleted successfully.");
            } catch (error: any) {
                if (error.code === "storage/object-not-found") {
                    console.log(
                        "No previous budget file found. Proceeding with new upload."
                    );
                } else {
                    console.error(
                        "Error checking or deleting old file:",
                        error
                    );
                    return; // Exit on unexpected errors
                }
            }

            // Upload the new file
            const uploadTask = uploadBytesResumable(fileRef, newFile);

            // Track progress of the upload
            uploadTask.on(
                "state_changed",
                (snapshot) => {
                    const percentCompleted = Math.round(
                        (snapshot.bytesTransferred * 100) / snapshot.totalBytes
                    );
                },
                (error) => {
                    enqueueSnackbar(`Error uploading files: ${error}`, {
                        variant: "error",
                    });
                },
                () => {
                    enqueueSnackbar("Successfully replaced the file", {
                        variant: "success",
                    });

                    createLog(
                        orgId,
                        authUser?.uid,
                        {
                            type: "replace_budget_file",
                            text: `${userDoc.firstName} has updated ${programName} budget file`,
                        },
                        userDoc?.photoURL
                    );

                    setUploadReplace(false);
                    setRerenderer((prev) => prev + 1); // Trigger rerender
                }
            );
        } else {
            enqueueSnackbar("No authenticated user found", {
                variant: "error",
            });
        }

        setUploadReplace(false);
    };

    const handleFileChange = (e: any) => {
        const newFile = e.target.files[0];
        if (newFile) {
            uploadAndReplaceBudget(orgId, programId, newFile);
        }
    };

    return (
        <div className={`fadeIn ${styles.displaycontainer}`}>
            <div>
                <Button
                    className={"btn-def"}
                    onClick={downloadBudget}
                    disabled={uploadReplace}
                >
                    <FileDownload fontSize="small" /> Download .XLSX file
                </Button>
                <AdminWrap>
                    <Button
                        className={`btn-ref ${styles.uploadAndReplaceButton}`}
                        disabled={uploadReplace}
                    >
                        <input
                            type="file"
                            accept=".xlsx"
                            onChange={handleFileChange}
                        />
                        <UploadFileOutlined fontSize="small" /> Upload new .XLSX
                        file
                    </Button>
                </AdminWrap>
            </div>
            <section>
                <table className={styles.displaybudgetTable}>
                    <thead>
                        <tr>
                            {budgetData[0]?.map((header, index) => (
                                <th className="fadeIn" key={index}>
                                    {header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {budgetData.slice(1).map((row, rowIndex) => (
                            <tr key={rowIndex} className="fadeIn">
                                {row.map((cell, cellIndex) => (
                                    <td key={cellIndex}>{cell}</td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>
        </div>
    );
};
