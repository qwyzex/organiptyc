import React, { useState, useEffect, useRef, useContext, ChangeEvent } from "react";
import {
    getStorage,
    ref,
    listAll,
    getDownloadURL,
    getMetadata,
    uploadBytes,
} from "firebase/storage";
import { storage } from "@/firebase";
import { useRouter } from "next/router";
import FileFolderDetails from "@/components/FileFolderDetails";
import uploadFile from "@/function/uploadFile";
import { UserContext } from "@/context/UserContext";

export interface FileItem {
    name: string;
    url: string;
    metadata: {
        size: number;
        contentType: string | undefined;
        timeCreated: string;
        updated: string;
        [key: string]: any;
    };
}

export interface FolderItem {
    name: string;
}

// const FileDisplay: React.FC<{ orgId: string }> = ({ orgId }) => {
const FileDisplay = () => {
    const router = useRouter();
    const { orgId } = router.query;
    const { authUser, loading, userDoc } = useContext(UserContext);

    const [files, setFiles] = useState<FileItem[]>([]);
    const [folders, setFolders] = useState<FolderItem[]>([]);
    const [path, setPath] = useState("");

    const [selectedItem, setSelectedItem] = useState<FileItem | FolderItem | null>(null);
    const [selectedType, setSelectedType] = useState<"file" | "folder" | null>(null);

    const itemListRef = useRef<HTMLUListElement>(null);
    const detailsPaneRef = useRef<HTMLDivElement>(null);

    const clearSelection = () => {
        setSelectedItem(null);
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
    }, []);

    useEffect(() => {
        const fetchFilesAndFolders = async () => {
            const listRef = ref(storage, `organization/${orgId}/${path}`);
            const res = await listAll(listRef);

            const filePromises = res.items.map(async (itemRef) => {
                const url = await getDownloadURL(itemRef);
                const metadata = await getMetadata(itemRef);

                console.log("INDIVIDUAL ITE : ", metadata);

                return {
                    name: itemRef.name,
                    url,
                    metadata: {
                        size: metadata.size,
                        contentType: metadata.contentType,
                        timeCreated: metadata.timeCreated,
                        updated: metadata.updated,
                        // ...metadata.customMetadata, // Assuming you may have custom metadata
                    },
                };
            });

            setFiles(await Promise.all(filePromises));
            setFolders(res.prefixes.map((folderRef) => ({ name: folderRef.name })));
        };

        fetchFilesAndFolders();
    }, [orgId, path]);

    const handleItemClick = (item: FileItem | FolderItem, type: "file" | "folder") => {
        setSelectedItem(item);
        setSelectedType(type);
    };

    const navigateToFolder = (folderRef: FolderItem) => {
        setPath(`${path}${folderRef.name}/`);
    };

    const navigateBack = () => {
        const newPath = path.split("/").slice(0, -2).join("/");
        setPath(newPath ? `${newPath}/` : "");
    };

    const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
        event.preventDefault();

        const filesRAW: any = event.target.files;
        const files = Array.prototype.slice.call(filesRAW);
        console.log(Array.isArray(files), files)
        // const list = Array.from(files);

        if (!files) return;
        // const path = path; // Replace with your actual path

        // Example metadata
        const metadata = {
            uploadedByUID: authUser?.uid, // Replace with the actual user ID
            uploadedByUSR: userDoc?.fullName, // Replace with the actual user ID
            description: "",
            tags: "",
        };

        try {
            await uploadFile(files, orgId as string, path, metadata);
            console.log("File uploaded successfully.");
        } catch (error) {
            console.error("Error uploading file:", error);
        }
    };

    return (
        <div>
            <h2>Organization Files</h2>
            <p>/{path}</p>
            <button onClick={navigateBack} disabled={!path}>
                Back
            </button>
            <ul ref={itemListRef}>
                {folders.map((folder, index) => (
                    <li key={index} onClick={() => navigateToFolder(folder)}>
                        {folder.name}/
                    </li>
                ))}
                {files.map((file, index) => (
                    <li key={index} onClick={() => handleItemClick(file, "file")}>
                        <a rel="noopener noreferrer">{file.name}</a>
                    </li>
                ))}
            </ul>
            <div ref={detailsPaneRef}>
                <FileFolderDetails item={selectedItem} type={selectedType} />
            </div>
            <input
                type="file"
                // maxLength={10}
                multiple
                onChange={handleFileUpload}
            />
        </div>
    );
};

export default FileDisplay;
