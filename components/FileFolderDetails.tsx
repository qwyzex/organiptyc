import React, { Dispatch, LegacyRef, Reference, SetStateAction } from "react";
import { FileItem, FolderItem } from "@/pages/organization/[orgId]/files"; // adjust the import path as necessary
import styles from "@/styles/organization/orgId/Files.module.sass";
import { IconButton } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import DeleteIcon from "@mui/icons-material/Delete";
import { deleteObject, getBlob, getDownloadURL, ref } from "firebase/storage";
import { storage } from "@/firebase";
import DescriptionIcon from "@mui/icons-material/Description";
import AdminWrap from "./AdminWrap";
import { useRouter } from "next/router";
import { useOrganizationContext } from "@/context/OrganizationContext";

interface Props {
    items: FileItem[] | FolderItem[] | null;
    type: "file" | "folder" | null;
    setrerenderer: Dispatch<SetStateAction<number>>;
}

/**
 * Displays the details of a file or folder.
 * If the user has selected multiple files, it displays the total size of all the selected files.
 * If the user has selected a single file, it displays the details of that file.
 * If the user has selected a single folder, it displays the details of that folder.
 * If the user has not selected any items, it displays a message saying "No item selected.".
 * It also provides buttons to download the selected files or delete them.
 * @param {FileItem[] | FolderItem[] | null} items - The selected items.
 * @param {"file" | "folder" | null} type - The type of the selected items.
 * @param {Dispatch<SetStateAction<number>>} setrerenderer - A function to rerender the component with the new state.
 * @returns {JSX.Element} The component.
 */
const FileFolderDetails: React.FC<Props> = ({
    items,
    type,
    setrerenderer,
}: any) => {
    const { isAdmin } = useOrganizationContext();

    const handleDownload = async (item: FileItem) => {
        const fileRef = ref(storage, item.metadata.fullPath);
        try {
            const blob = await getBlob(fileRef);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", item.name);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url); // Clean up
        } catch (error) {
            console.error("Error downloading file:", error);
        }
    };

    const handleDelete = async (item: FileItem) => {
        if (isAdmin) {
            const fileRef = ref(storage, item.metadata.fullPath);
            try {
                await deleteObject(fileRef);
                alert("File deleted successfully.");
            } catch (error) {
                console.error("Error deleting file:", error);
            }
            setrerenderer((prev: number) => prev + 1);
        }
        return;
    };

    if (!items)
        return (
            <div className={styles.primitiveDetailsContainer}>
                <header>
                    <h3>Details</h3>
                </header>
                <section>
                    <DescriptionIcon />
                    <p>No item selected.</p>
                </section>
            </div>
        );

    if (type !== "file")
        return (
            <div className={styles.primitiveDetailsContainer}>
                <header>
                    <h3>Details</h3>
                </header>
                <section>
                    <DescriptionIcon />
                    <p>No item selected.</p>
                </section>
            </div>
        );

    if (items.length > 1) {
        let totalSize = 0;

        items.forEach((item: FileItem) => {
            totalSize += item.metadata?.size;
        });

        const handleMultipleDownload = () => {
            items.forEach((item: FileItem) => handleDownload(item));
        };

        const handleMultipleDelete = () => {
            items.forEach((item: FileItem) => handleDelete(item));
        };

        return (
            <div className={styles.primitiveDetailsContainer}>
                <div>
                    <header>
                        <h3>Details</h3>
                    </header>
                    <article>
                        <label>
                            <p>You selected {items.length} items.</p>
                            <p>
                                Total size:{" "}
                                {(totalSize / (1024 * 1024)).toFixed(2)} MB
                            </p>
                        </label>
                    </article>
                </div>
                <footer>
                    <IconButton onClick={handleMultipleDownload}>
                        <DownloadIcon />
                    </IconButton>
                    <AdminWrap>
                        <IconButton onClick={handleMultipleDelete}>
                            <DeleteIcon />
                        </IconButton>
                    </AdminWrap>
                </footer>
            </div>
        );
    }

    if (items.length == 1)
        return (
            <div className={styles.primitiveDetailsContainer}>
                <div>
                    <header>
                        <h3>Details</h3>
                    </header>
                    <article>
                        <label>
                            <h6>Name:</h6>
                            <input
                                readOnly
                                className="inp-dis"
                                value={items[0].name}
                            ></input>
                        </label>
                        <label>
                            <h6>URL:</h6>
                            <a
                                href={items[0].url}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Download Link
                            </a>
                        </label>
                        <label>
                            <h6>Size:</h6>{" "}
                            <p>
                                {(
                                    items[0].metadata?.size /
                                    (1024 * 1024)
                                ).toFixed(2)}{" "}
                                MB
                            </p>
                        </label>
                        <label>
                            <h6>Content Type:</h6>
                            <p>{items[0].metadata?.contentType}</p>
                        </label>
                        <label>
                            <h6>Created At:</h6>
                            <p>
                                {new Date(
                                    items[0].metadata?.timeCreated
                                ).toLocaleString()}
                            </p>
                        </label>
                        <label>
                            <h6>Last Updated:</h6>
                            <p>
                                {new Date(
                                    items[0].metadata?.updated
                                ).toLocaleString()}
                            </p>
                        </label>
                    </article>
                </div>
                <footer>
                    <IconButton onClick={() => handleDownload(items[0])}>
                        <DownloadIcon />
                    </IconButton>
                    <AdminWrap>
                        <IconButton onClick={() => handleDelete(items[0])}>
                            <DeleteIcon />
                        </IconButton>
                    </AdminWrap>
                </footer>
            </div>
        );

    // return <></>;
    return (
        <div className={styles.primitiveDetailsContainer}>
            <header>
                <h3>Details</h3>
            </header>
            <section>
                <DescriptionIcon />
                <p>No item selected.</p>
            </section>
        </div>
    );
};

export default FileFolderDetails;
