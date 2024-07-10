import { uploadBytes, ref, getDownloadURL } from "firebase/storage";
import { useRouter } from "next/router";
import { addDoc, collection, doc, setDoc, updateDoc } from "firebase/firestore";
import { useState } from "react";

import { storage, db, auth } from "@/firebase";

import { v4 as uuidv4 } from "uuid";

const CreateOrganizationForm = () => {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [type, setType] = useState("");
    const [website, setWebsite] = useState("");
    const [location, setLocation] = useState("");
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [adArtFile, setAdArtFile] = useState<File | null>(null);

    const [error, setError] = useState("");
    const router = useRouter();

    // const handleSubmit = async (e: React.FormEvent) => {
    //     e.preventDefault();
    //     setError("");

    //     try {
    //         const user = auth.currentUser;
    //         if (!user) {
    //             throw new Error("User not authenticated");
    //         }

    //         const orgId = uuidv4();

    //         const uploadFile = async (file: File, folder: string) => {
    //             const customFilename = `${folder}_${orgId}`;
    //             const storageRef = ref(
    //                 storage,
    //                 `organization/${orgId}/${folder}/${customFilename}`
    //             );
    //             await uploadBytes(storageRef, file);
    //             return getDownloadURL(storageRef);
    //         };

    //         const logoURL = logoFile ? await uploadFile(logoFile, "logo") : null;

    //         const adArtURL = adArtFile ? await uploadFile(adArtFile, "aoa") : null;

    //         const orgData = {
    //             name,
    //             description,
    //             type,
    //             website,
    //             location,
    //             logoURL,
    //             adArtURL,
    //             createdAt: new Date(),
    //         };

    //         const orgRef = doc(db, "organizations", orgId);
    //         await setDoc(orgRef, orgData);

    //         const memberRef = doc(db, `organizations/${orgId}/members`, user.uid);
    //         await setDoc(memberRef, {
    //             userId: user.uid,
    //             role: "admin",
    //             joinedAt: new Date(),
    //         });

    //         // Update user document to include the new organization
    //         const userRef = doc(db, "users", user.uid);
    //         await updateDoc(userRef, {
    //             organizations: {
    //                 [orgId]: {
    //                     role: "admin",
    //                     joinedAt: new Date(),
    //                 },
    //             },
    //         });

    //         router.push(`/organization/${orgId}`);
    //     } catch (err) {
    //         console.error("Error creating organization:", err);
    //         setError("Failed to create organization. Please try again.");
    //     }
    // };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        try {
            const user = auth.currentUser;
            if (!user) {
                throw new Error("User not authenticated");
            }

            const orgId = uuidv4();

            const orgData = {
                uid: orgId,
                name,
                description,
                type,
                website,
                location,
                logoURL: "",
                adArtURL: "",
                createdAt: new Date(),
            };

            const orgRef = doc(db, "organizations", orgId);
            await setDoc(orgRef, orgData);

            const memberRef = doc(db, `organizations/${orgId}/members`, user.uid);
            await setDoc(memberRef, {
                userId: user.uid,
                role: "admin",
                joinedAt: new Date(),
            });

            const userOrgRef = doc(db, `users/${user.uid}/organizations`, orgId);
            await setDoc(userOrgRef, {
                role: "admin",
                joinedAt: new Date(),
            });

            const uploadFile = async (file: File, folder: string) => {
                const fileExtension = file.name.substring(file.name.lastIndexOf(".") + 1);
                const customFilename = `${folder}_${orgId}`;
                const storageRef = ref(
                    storage,
                    `organization/${orgId}/${folder}/${customFilename}`
                );
                await uploadBytes(storageRef, file);
                return getDownloadURL(storageRef);
            };

            let logoURL = "";
            if (logoFile) {
                logoURL = await uploadFile(logoFile, "logo");
            }

            let adArtURL = "";
            if (adArtFile) {
                adArtURL = await uploadFile(adArtFile, "aoa");
            }

            await updateDoc(orgRef, { logoURL, adArtURL });

            router.push(`/organization/${orgId}`);
        } catch (err) {
            console.error("Error creating organization:", err);
            setError("Failed to create organization. Please try again.");
        }
    };

    return (
        <>
            <h1>Create Organization</h1>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Organization Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Description</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>
                <div>
                    <label>Type</label>
                    <select
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        required
                    >
                        <option value="" disabled>
                            Select type
                        </option>
                        <option value="nonprofit">Nonprofit</option>
                        <option value="student">Student</option>
                    </select>
                </div>
                <div>
                    <label>Website (optional)</label>
                    <input
                        type="url"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                    />
                </div>
                <div>
                    <label>Location (optional)</label>
                    <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                    />
                </div>
                <div>
                    <label>Logo (optional)</label>
                    <input
                        type="file"
                        onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                    />
                </div>
                <div>
                    <label>Articles of Association / Bylaws</label>
                    <input
                        type="file"
                        onChange={(e) => setAdArtFile(e.target.files?.[0] || null)}
                        required
                    />
                </div>
                <button type="submit">Create Organization</button>
            </form>
        </>
    );
};

export default CreateOrganizationForm;
