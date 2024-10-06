import { uploadBytes, ref, getDownloadURL } from "firebase/storage";
import { useRouter } from "next/router";
import { addDoc, collection, doc, setDoc, updateDoc } from "firebase/firestore";
import { useState } from "react";
import styles from "@/styles/organization/Create.module.sass";

import { storage, db, auth } from "@/firebase";

import { v4 as uuidv4 } from "uuid";
import { Button } from "@mui/material";
import { ArrowBackIosNew, DomainAdd } from "@mui/icons-material";

const CreateOrganizationForm = () => {
    const [name, setName] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [type, setType] = useState<any>("");
    const [website, setWebsite] = useState<string>("");
    const [location, setLocation] = useState<string>("");
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [adArtFile, setAdArtFile] = useState<File | null>(null);

    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

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

            const memberRef = doc(
                db,
                `organizations/${orgId}/members`,
                user.uid
            );
            await setDoc(memberRef, {
                userId: user.uid,
                role: "admin",
                joinedAt: new Date(),
            });

            const userOrgRef = doc(
                db,
                `users/${user.uid}/organizations`,
                orgId
            );
            await setDoc(userOrgRef, {
                role: "admin",
                joinedAt: new Date(),
            });

            const uploadFile = async (file: File, folder: string) => {
                const fileExtension = file.name.substring(
                    file.name.lastIndexOf(".") + 1
                );
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
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className={styles.container}>
            <header>
                <Button
                    className="btn-compact"
                    onClick={() => router.replace(`/organization/new`)}
                >
                    <ArrowBackIosNew />
                </Button>
                <h1>Create Organization</h1>
            </header>
            <form onSubmit={handleSubmit}>
                <label>
                    <p>Organization Name</p>
                    <input
                        className="inp-form"
                        type="text"
                        value={name}
                        placeholder="Organization name"
                        onChange={(e) => setName(e.target.value)}
                        required
                        disabled={loading}
                    />
                </label>
                <label>
                    <p>Description</p>
                    <textarea
                        className="inp-form"
                        value={description}
                        placeholder="Organization description"
                        onChange={(e) => setDescription(e.target.value)}
                        disabled={loading}
                    />
                </label>
                <label>
                    <p>Type</p>
                    <select
                        className="inp-form"
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        required
                        disabled={loading}
                    >
                        <option value="" disabled>
                            Select type
                        </option>
                        <option value="nonprofit">Nonprofit</option>
                        <option value="student">Student</option>
                    </select>
                </label>
                <label>
                    <p>Website (optional)</p>
                    <input
                        className="inp-form"
                        type="url"
                        value={website}
                        placeholder="https://example.com"
                        onChange={(e) => setWebsite(e.target.value)}
                        disabled={loading}
                    />
                </label>{" "}
                <label>
                    <p>Location (optional)</p>
                    <input
                        className="inp-form"
                        type="text"
                        value={location}
                        placeholder="City, State, Country"
                        onChange={(e) => setLocation(e.target.value)}
                        disabled={loading}
                    />
                </label>
                <label>
                    <p>Logo</p>
                    <input
                        className="inp-form"
                        type="file"
                        onChange={(e) =>
                            setLogoFile(e.target.files?.[0] || null)
                        }
                        required
                        disabled={loading}
                    />
                </label>
                <label>
                    <p>Articles of Association / Bylaws</p>
                    <input
                        className="inp-form"
                        type="file"
                        onChange={(e) =>
                            setAdArtFile(e.target.files?.[0] || null)
                        }
                        required
                        disabled={loading}
                    />
                </label>{" "}
                <label>
                    <p></p>
                    <Button
                        className="btn-def"
                        type="submit"
                        disabled={loading}
                    >
                        <DomainAdd />
                        Create Organization
                    </Button>
                </label>
            </form>
        </main>
    );
};

export default CreateOrganizationForm;
