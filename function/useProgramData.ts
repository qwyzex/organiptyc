import { UserContext } from "@/context/UserContext";
import { db } from "@/firebase";
import { doc, DocumentData, getDoc } from "firebase/firestore";
import { useContext, useEffect, useState } from "react";

type ProgramProps = {
    orgId: string;
    programId: string;
    rerenderer?: number;
};

const useProgramData = ({ orgId, programId, rerenderer = 0 }: ProgramProps) => {
    const { authUser } = useContext(UserContext);
    const [programData, setProgramData] = useState<DocumentData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<any>(null);

    useEffect(() => {
        const fetchProgramData = async () => {
            if (!authUser) return;

            try {
                const programRef = doc(
                    db,
                    "organizations",
                    orgId,
                    "programs",
                    programId
                );
                const programSnap = await getDoc(programRef);

                if (!programSnap.exists()) {
                    throw new Error("Program does not exist.");
                }

                const snapData = programSnap.data();

                setProgramData(snapData);
            } catch (error) {
                setError(error);
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchProgramData();

        // eslint-disable-next-line
    }, [rerenderer, orgId, programId]);

    return { programData, loading, error };
};

export default useProgramData;
