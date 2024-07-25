import { useState } from "react";
import { useRouter } from "next/router";
import { v4 as uuidv4 } from "uuid";
import { uploadBytes, ref, getDownloadURL } from "firebase/storage";
import { doc, setDoc, updateDoc } from "firebase/firestore";
import { storage, db, auth } from "@/firebase";
import {
    TextField,
    Button,
    MenuItem,
    FormControl,
    InputLabel,
    Select,
    Typography,
    Box,
    Grid,
} from "@mui/material";

const CreateOrganizationForm = () => {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [type, setType] = useState("");
    const [website, setWebsite] = useState("");
    const [location, setLocation] = useState("");
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [adArtFile, setAdArtFile] = useState<File | null>(null);
    const [logoFileName, setLogoFileName] = useState("");
    const [adArtFileName, setAdArtFileName] = useState("");

    const [error, setError] = useState("");
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const [uploadingAdArt, setUploadingAdArt] = useState(false);

    const router = useRouter();

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
                setUploadingLogo(true);
                logoURL = await uploadFile(logoFile, "logo");
                setUploadingLogo(false);
            }

            let adArtURL = "";
            if (adArtFile) {
                setUploadingAdArt(true);
                adArtURL = await uploadFile(adArtFile, "aoa");
                setUploadingAdArt(false);
            }

            await updateDoc(orgRef, { logoURL, adArtURL });

            router.push(`/organization/${orgId}`);
        } catch (err) {
            console.error("Error creating organization:", err);
            setError("Failed to create organization. Please try again.");
        }
    };

    const isFormIncomplete = !name || !description || !type || !logoFile || !adArtFile;

    return (
        <Box sx={{ maxWidth: 600, mx: "auto", mt: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Create Organization
            </Typography>
            <form onSubmit={handleSubmit}>
                <FormControl fullWidth margin="normal">
                    <TextField
                        variant="filled"
                        label="Organization Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </FormControl>
                <FormControl fullWidth margin="normal">
                    <TextField
                        label="Description"
                        variant="filled"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        multiline
                        rows={4}
                        required
                    />
                </FormControl>
                <FormControl fullWidth margin="normal" required>
                    <InputLabel>Type</InputLabel>
                    <Select
                        value={type}
                        variant="outlined"
                        label="Type"
                        onChange={(e) => setType(e.target.value)}
                        required
                    >
                        <MenuItem value="" disabled>
                            Select type
                        </MenuItem>
                        <MenuItem value="nonprofit">Nonprofit</MenuItem>
                        <MenuItem value="student">Student</MenuItem>
                    </Select>
                </FormControl>
                <FormControl fullWidth margin="normal">
                    <TextField
                        label="Website (optional)"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        type="url"
                    />
                </FormControl>
                <FormControl fullWidth margin="normal">
                    <TextField
                        label="Location (optional)"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                    />
                </FormControl>
                <Grid container spacing={2} margin="normal">
                    <Grid item xs={6}>
                        <FormControl fullWidth>
                            {logoFileName && (
                                <Typography variant="body2" gutterBottom>
                                    {logoFileName}
                                </Typography>
                            )}
                            <Button
                                variant="contained"
                                component="label"
                                disabled={uploadingLogo}
                            >
                                Upload Logo *
                                <input
                                    type="file"
                                    hidden
                                    required
                                    onChange={(e) => {
                                        const file =
                                            e.target.files?.[0] || null;
                                        setLogoFile(file);
                                        if (file) {
                                            setLogoFileName(file.name);
                                        } else {
                                            setLogoFileName("");
                                        }
                                    }}
                                />
                            </Button>
                        </FormControl>
                    </Grid>
                    <Grid item xs={6}>
                        <FormControl fullWidth>
                            {adArtFileName && (
                                <Typography variant="body2" gutterBottom>
                                    {adArtFileName}
                                </Typography>
                            )}
                            <Button
                                variant="contained"
                                component="label"
                                disabled={uploadingAdArt}
                            >
                                Upload Articles of Association / Bylaws *
                                <input
                                    type="file"
                                    hidden
                                    required
                                    onChange={(e) => {
                                        const file =
                                            e.target.files?.[0] || null;
                                        setAdArtFile(file);
                                        if (file) {
                                            setAdArtFileName(file.name);
                                        } else {
                                            setAdArtFileName("");
                                        }
                                    }}
                                />
                            </Button>
                        </FormControl>
                    </Grid>
                </Grid>
                {error && (
                    <Typography color="error" variant="body2">
                        {error}
                    </Typography>
                )}
                <Button
                    variant="contained"
                    color="primary"
                    type="submit"
                    fullWidth
                    disabled={isFormIncomplete}
                >
                    Create Organization
                </Button>
            </form>
        </Box>
    );
};

export default CreateOrganizationForm;
