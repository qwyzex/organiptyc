import {
    getStorage,
    ref,
    uploadBytes,
    getDownloadURL,
    UploadMetadata,
} from "firebase/storage";
import { storage } from "@/firebase";

/**
 * Uploads the given files to Firebase Storage at the given location.
 * @param {File[]} files - The files to upload.
 * @param {string} orgId - The organization ID.
 * @param {string} path - The path to upload to.
 * @param {object} metadata - The metadata to attach to the file.
 */
const uploadFile = async (
    files: File[],
    orgId: string,
    path: string,
    metadata: object
) => {
    const uploadPromises = files.map((file) => {
        const storageRef = ref(
            storage,
            `organization/${orgId}/${path}/${file.name}`
        );

        return uploadBytes(storageRef, file, metadata);
    });

    try {
        const snapshots = await Promise.all(uploadPromises);
        console.log("Uploaded files!", snapshots);
    } catch (error) {
        console.error("Error uploading files:", error);
    }
};

export default uploadFile;
