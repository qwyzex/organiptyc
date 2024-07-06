import { createContext, useState, useEffect, ReactNode } from "react";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase"; // Adjust the import based on your file structure

interface UserDocument {
    uid: string;
    firstName: string;
    lastName: string;
    fullName: string;
    dateOfBirth: string;
    email: string;
    photoURL: string;
    createdAt: string;
    updatedAt: string;
    organizations: {
        [orgId: string]: {
            role: string;
            joinedAt: string;
        };
    };
}

interface UserContextProps {
    loading: boolean;
    authUser: FirebaseUser | null;
    userDoc: UserDocument | null;
}

export const UserContext = createContext<UserContextProps>({
    loading: true,
    authUser: null,
    userDoc: null,
});

interface UserProviderProps {
    children: ReactNode;
}

export function UserProvider({ children }: UserProviderProps) {
    const [authUser, setAuthUser] = useState<FirebaseUser | null>(null);
    const [userDoc, setUserDoc] = useState<UserDocument | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setAuthUser(user);
            if (user) {
                const userDocRef = doc(db, "users", user.uid);
                const userDocSnap = await getDoc(userDocRef);
                if (userDocSnap.exists()) {
                    setUserDoc(userDocSnap.data() as UserDocument);
                } else {
                    setUserDoc(null);
                }
            } else {
                setUserDoc(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return (
        <UserContext.Provider value={{ loading, authUser, userDoc }}>
            {children}
        </UserContext.Provider>
    );
}
