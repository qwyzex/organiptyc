import { onAuthStateChanged } from "firebase/auth";
import {
    collection,
    CollectionReference,
    doc,
    DocumentData,
    DocumentReference,
    DocumentSnapshot,
    getDoc,
} from "firebase/firestore";
import Router from "next/router";
import { Dispatch, SetStateAction, useEffect } from "react";
import { auth, db } from "@/firebase";

export function redirect(href: string) {
    Router.replace(href);
}

export function redirectNoUser() {
    onAuthStateChanged(auth, (user) => {
        if (!user) {
            redirect("/signin");
        }
    });
}

/**
 * Returns the user's data from the database.
 * @param {setUserDataVariables} setUserDataVariables The function to set the user's data.
 */
export const getUserData = (
    setUserDataVariables: Dispatch<SetStateAction<DocumentData>>
) => {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            const usersRef: CollectionReference = collection(db, "users");
            const docRef: DocumentReference = doc(usersRef, user!.uid);
            const docSnap: DocumentSnapshot = await getDoc(docRef);

            // @ts-ignore
            setUserDataVariables(docSnap.data());
        }
    });
};

export const useEmailVerified = () => {
    onAuthStateChanged(auth, async (user) => {
        if (user) return user.emailVerified;
    });
    return false;
};
