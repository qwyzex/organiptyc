import { UserContext } from "@/context/UserContext";
import { db } from "@/firebase";
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    DocumentData,
    getDoc,
    getDocs,
    limit,
    query,
    setDoc,
    updateDoc,
} from "firebase/firestore";
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
                const subcollections = ["committee", "tasks"];

                for (const subcollectionName of subcollections) {
                    const subcollectionRef = collection(
                        db,
                        `organizations/${orgId}/programs/${programId}/${subcollectionName}`
                    );
                    const subcollectionSnap = await getDocs(
                        query(subcollectionRef, limit(1))
                    ); // Fetch only 1 document to check existence
                    if (!subcollectionSnap.empty) {
                        const allDocsSnap = await getDocs(subcollectionRef); // Fetch all documents if the collection exists
                        snapData[subcollectionName] = await Promise.all(
                            allDocsSnap.docs.map(async (docu) => {
                                const data = docu.data();
                                return { id: docu.id, ...data };
                            })
                        );
                    } else {
                        snapData[subcollectionName] = []; // Initialize empty array if the collection doesn't exist
                    }
                }

                snapData["addCommitteeMember"] = async (
                    name: string,
                    role: string
                ) => {
                    const commitRef = collection(
                        db,
                        "organizations",
                        orgId,
                        "programs",
                        programId,
                        "committee"
                    );

                    await addDoc(commitRef, {
                        name,
                        role,
                    });
                };

                snapData["updateCommitteeMember"] = async (
                    id: string,
                    change: "name" | "role",
                    value: string
                ) => {
                    const commitRef = doc(
                        db,
                        "organizations",
                        orgId,
                        "programs",
                        programId,
                        "committee",
                        id
                    );

                    await updateDoc(
                        commitRef,
                        change == "name"
                            ? {
                                  name: value,
                              }
                            : { role: value }
                    );
                };

                snapData["deleteCommitteeMember"] = async (id: string) => {
                    const commitRef = doc(
                        db,
                        "organizations",
                        orgId,
                        "programs",
                        programId,
                        "committee",
                        id
                    );

                    await deleteDoc(commitRef);
                };

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
    }, [rerenderer, orgId, programId, authUser]);

    return { programData, loading, error };
};

export default useProgramData;
