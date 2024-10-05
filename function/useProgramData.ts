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

/**
 * Fetches program data from the database and returns it in a format that can
 * be used directly in the component. The program data is fetched from the
 * "organizations/<orgId>/programs/<programId>" document and includes the
 * following subcollections:
 *
 * - committee: an array of committee members, each with a `name` and `role`
 *   property.
 * - tasks: an array of tasks, each with an `id` and `name` property.
 *
 * The function also returns three helper functions to update the committee
 * members:
 *
 * - addCommitteeMember: adds a new committee member with the given `name` and
 *   `role`.
 * - updateCommitteeMember: updates the committee member with the given `id`
 *   with the given `change` and `value`.
 * - deleteCommitteeMember: deletes the committee member with the given `id`.
 *
 * The function also returns a `loading` state and an `error` state, which can
 * be used to handle errors and loading states in the component.
 *
 * The function takes three parameters: `orgId`, `programId`, and `rerenderer`.
 * The `rerenderer` parameter is optional and defaults to `0`. It can be used
 * to force a re-render of the component when the value changes.
 *
 * @param {string} orgId The ID of the organization.
 * @param {string} programId The ID of the program.
 * @param {number} [rerenderer=0] An optional parameter to force a re-render of
 * the component when the value changes.
 * @returns {Object} An object with the program data, loading state, and error
 * state.
 */
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
