import { useRouter } from "next/router";
import styles from "@/styles/organization/NewOrg.module.sass";
import { Button } from "@mui/material";
import {
    ArrowBackIosNew,
    ArrowForwardIos,
    Create,
    DomainAdd,
    JoinFull,
} from "@mui/icons-material";
import Head from "next/head";

export default function New() {
    const router = useRouter();

    return (
        <>
            <Head>
                <title>New Organization</title>
            </Head>
            <div className={styles.container}>
                <header>
                    <Button
                        className="btn-compact"
                        onClick={() => router.replace(`/organization`)}
                    >
                        <ArrowBackIosNew />
                    </Button>
                    <h1>Engage in an Organization</h1>
                </header>
                <main>
                    <div onClick={() => router.push("/organization/join")}>
                        <JoinFull />
                        <h2>Join</h2>
                        <p className="dim">
                            Join an existing organization, trough invite link.
                        </p>
                        <div className={styles.arrowContainer}>
                            <ArrowForwardIos fontSize="small" />
                        </div>
                    </div>
                    <div onClick={() => router.push("/organization/create")}>
                        <DomainAdd />
                        <h2>Create</h2>
                        <p className="dim">
                            Create an organization to get started. You can
                            manage everything in it.
                        </p>
                        <div className={styles.arrowContainer}>
                            <ArrowForwardIos fontSize="small" />
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}
