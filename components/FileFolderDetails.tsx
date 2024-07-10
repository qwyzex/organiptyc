import React from "react";
import { FileItem, FolderItem } from "@/pages/organization/[orgId]/files"; // adjust the import path as necessary

interface Props {
    items: FileItem[] | FolderItem[] | null;
    type: "file" | "folder" | null;
}

const FileFolderDetails: React.FC<Props> = ({ items, type }) => {
    if (!items || !type)
        return (
            <div>
                <p>No item selected.</p>
            </div>
        );

    if (type == "folder")
        return (
            <div>
                <p>No item selected.</p>
            </div>
        );

    if (items.length > 1) {
        let totalSize = 0;

        items.forEach((item) => {
            totalSize += item.metadata?.size;
        });

        return (
            <div>
                <p>
                    You selected {items.length} items. Total size:{" "}
                    {(totalSize / 1024).toFixed(2)} KB
                </p>
            </div>
        );
    }

    if (items.length == 1)
        return (
            <div>
                <h3>Details</h3>
                <p>
                    <strong>Name:</strong> {items[0].name}
                </p>
                {type === "file" && (
                    <>
                        <p>
                            <strong>URL:</strong>{" "}
                            <a
                                href={items[0].url}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                {items[0].url}
                            </a>
                        </p>
                        <p>
                            <strong>Size:</strong> {items[0].metadata?.size} bytes
                        </p>
                        <p>
                            <strong>Content Type:</strong>{" "}
                            {items[0].metadata?.contentType}
                        </p>
                        <p>
                            <strong>Created At:</strong>{" "}
                            {new Date(items[0].metadata?.timeCreated).toLocaleString()}
                        </p>
                        <p>
                            <strong>Last Updated:</strong>{" "}
                            {new Date(items[0].metadata?.updated).toLocaleString()}
                        </p>
                    </>
                )}
            </div>
        );

    // return <></>;
    return (
        <div>
            <p>No item selected.</p>
        </div>
    )
};

export default FileFolderDetails;
