import { createContext, useState, useEffect, ReactNode } from "react";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { auth, db } from "../firebase"; // Adjust the import based on your file structure

export interface UserDocument {
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

/**
 * The UserProvider component wraps the application and provides the user data
 * to the entire app via the UserContext. It listens to the onAuthStateChanged
 * event and fetches the user document from the database when the user is
 * authenticated. If the user document does not exist, it sets the userDoc to
 * null. When the user is not authenticated, it also sets the userDoc to null.
 * The user data is then passed down to the entire app via the UserContext.
 */
export function UserProvider({ children }: UserProviderProps) {
    const [authUser, setAuthUser] = useState<FirebaseUser | null>(null);
    const [userDoc, setUserDoc] = useState<UserDocument | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setAuthUser(user);
                try {
                    const userDocRef = doc(db, "users", user.uid);
                    const userDocSnap = await getDoc(userDocRef);

                    if (userDocSnap.exists()) {
                        const userDocData = userDocSnap.data() as UserDocument;
                        const orgsCollectionRef = collection(
                            db,
                            `users/${user.uid}/organizations`
                        );
                        const orgsSnap = await getDocs(orgsCollectionRef);
                        const organizations = orgsSnap.docs.reduce(
                            (acc, doc) => ({
                                ...acc,
                                [doc.id]: doc.data(),
                            }),
                            {}
                        );
                        setUserDoc({ ...userDocData, organizations });
                    } else {
                        setUserDoc(null);
                    }
                } catch (error) {
                    console.error("Error fetching user data:", error);
                    setUserDoc(null); // Handle failure
                }
            } else {
                setAuthUser(null);
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
