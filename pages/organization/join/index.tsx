import Loading from "@/components/Loading";
import { db } from "@/firebase";
import styles from "@/styles/organization/Join.module.sass";
import {
    Button,
    Divider,
    FormControl,
    InputLabel,
    TextField,
} from "@mui/material";
import { doc, getDoc } from "firebase/firestore";
import Image from "next/image";
import Link from "next/link";
import { useContext, useEffect, useState } from "react";
import LaunchIcon from "@mui/icons-material/Launch";
import handleInviteLink from "@/function/handleInviteLink";
import { UserContext } from "@/context/UserContext";
import { useRouter } from "next/router";

export default function JoinOrganization() {
    const [inviteToken, setInviteToken] = useState<string>("");
    const [extractedToken, setExtractedToken] = useState<string | null>(null);

    const handleOnJoinOrganizationFormSubmit = (e: any) => {
        e.preventDefault();
        const parts = inviteToken.split("/");
        const token = parts[parts.length - 1];
        setExtractedToken(token);
    };

    const handleInviteTokenValueChange = (e: any) => {
        setInviteToken(e.target.value);
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1>Join Organization</h1>
            </header>
            <main className={styles.main}>
                <form
                    className={styles.inviteTokenForm}
                    onSubmit={handleOnJoinOrganizationFormSubmit}
                >
                    <article>
                        <p>Insert a full link of the invitation</p>
                        <code>
                            https://organiptyc.vercel.app/organization/join/
                            {`{invite_token}`}
                        </code>
                        <p>Or just insert the Invite Token</p>
                    </article>
                    <FormControl size="small">
                        <TextField
                            autoFocus
                            size="small"
                            variant="standard"
                            type="text"
                            required
                            value={inviteToken}
                            label="Invite Token"
                            onChange={handleInviteTokenValueChange}
                        />
                    </FormControl>
                    <input
                        className="btn-def"
                        disabled={!inviteToken}
                        type="submit"
                        value="Check Organization"
                    />
                </form>
                {extractedToken && (
                    <Invitee key={extractedToken} token={extractedToken} />
                )}
            </main>
        </div>
    );
}

export const Invitee = ({ token }: { token: string }) => {
    const router = useRouter();

    const [loading, setLoading] = useState<boolean>(false);
    const [orgData, setOrgData] = useState<any>(null);
    const [error, setError] = useState<string>("");

    const { authUser } = useContext(UserContext);

    useEffect(() => {
        const fetchOrgData = async () => {
            setLoading(true);
            setOrgData(null);
            setError("");

            try {
                const docRef = doc(db, "invites", token);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const orgId = docSnap.data().invitedToUID;

                    try {
                        const orgDocRef = doc(db, "organizations", orgId);
                        const orgDocSnap = await getDoc(orgDocRef);

                        if (orgDocSnap.exists()) {
                            setOrgData(orgDocSnap.data());
                        }
                    } catch (err) {
                        console.error(err);
                        setError(`Error fetching organization: ${err}`);
                    }
                } else {
                    setError("Invite token does not exist.");
                }
            } catch (err) {
                console.error(err);
                setError(`Error fetching invite: ${err}`);
            } finally {
                setLoading(false);
            }
        };

        fetchOrgData();
    }, [token]);

    return (
        <div className={styles.InviteeContainer}>
            {loading ? (
                <Loading />
            ) : (
                <>
                    {error && <p className="fadeIn">{error}</p>}
                    {orgData && (
                        <section className="fadeIn">
                            <header>
                                <h2>You are invited to...</h2>
                            </header>
                            <article>
                                <div>
                                    <Image
                                        src={orgData.logoURL}
                                        alt={`${orgData.name} organization logo`}
                                        height={70}
                                        width={70}
                                    />
                                </div>
                                <div>
                                    <h3>{orgData.name}</h3>
                                    <p>{orgData.description}</p>
                                    {orgData.website && (
                                        <code>
                                            <Link
                                                href={orgData.website}
                                                target="_blank"
                                            >
                                                Visit Site{" "}
                                                <LaunchIcon fontSize="small" />
                                            </Link>
                                        </code>
                                    )}
                                </div>
                                <Divider variant="fullWidth" flexItem />
                                <div>
                                    <Button
                                        disabled={loading}
                                        onClick={() => {
                                            setLoading(true)
                                            if (authUser)
                                                handleInviteLink(
                                                    token,
                                                    authUser.uid
                                                )
                                                    .then((orgId) =>
                                                        router.push(
                                                            `/organization/${orgId}`
                                                        )
                                                    )
                                                    .catch((error) =>
                                                        alert(error.message)
                                                    );
                                            setLoading(false)
                                        }}
                                        className="btn-def"
                                    >
                                        JOIN
                                    </Button>
                                </div>
                            </article>
                        </section>
                    )}
                </>
            )}
        </div>
    );
};
