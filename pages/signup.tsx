import { useContext, useEffect, useState } from "react";
import {
    createUserWithEmailAndPassword,
    onAuthStateChanged,
    sendEmailVerification,
} from "firebase/auth";
import { auth, db, storage } from "@/firebase";
import { redirect } from "@/function/";
import {
    collection,
    query,
    where,
    getDocs,
    addDoc,
    doc,
    setDoc,
    Timestamp,
} from "firebase/firestore";
import { ref, uploadBytes } from "firebase/storage";

import { useRouter } from "next/router";
import { UserContext } from "@/context/UserContext";
const Signup = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [dateOfBirth, setDateOfBirth] = useState("");

    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);

    const [error, setError] = useState<string | null>(null);
    const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null);

    const { loading, authUser } = useContext(UserContext);

    const router = useRouter();

    useEffect(() => {
        if (authUser) {
            router.push("/home");
            return;
        }
    });

    const checkEmailAvailability = async (email: string) => {
        try {
            const usersRef = collection(db, "users");
            const q = query(usersRef, where("email", "==", email));
            const querySnapshot = await getDocs(q);
            return querySnapshot.empty;
        } catch (error) {
            console.error("Error checking email availability:", error);
            return false;
        }
    };

    const handleStep1Submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            setIsLoading(false);
            return;
        }

        try {
            const available = await checkEmailAvailability(email);
            setEmailAvailable(available);

            if (available) {
                setStep(2);
            } else {
                setError("Email is already in use");
            }
        } catch (error) {
            setError("Error checking email availability");
        } finally {
            setIsLoading(false);
        }
    };

    const handleStep2Submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );
            const user = userCredential.user;

            if (user) {
                const userRef = doc(db, "users", user.uid);
                await setDoc(userRef, {
                    uid: user.uid,
                    email,
                    firstName,
                    lastName,
                    fullName: firstName + " " + lastName,
                    dateOfBirth: Timestamp.fromDate(new Date(dateOfBirth)),
                    photoURL: null,
                    createdAt: Timestamp.fromDate(new Date()),
                    updatedAt: Timestamp.fromDate(new Date()),
                });
                await sendEmailVerification(user);
            }

            router.push("/organization");
        } catch (error) {
            setError("Error creating user");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            {!loading && !authUser ? (
                <div>
                    {step === 1 && (
                        <form onSubmit={handleStep1Submit}>
                            <h2>Step 1: Email and Password</h2>
                            <input
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <input
                                type="password"
                                placeholder="Confirm Password"
                                value={confirmPassword}
                                onChange={(e) =>
                                    setConfirmPassword(e.target.value)
                                }
                                required
                            />
                            <button type="submit" disabled={isLoading}>
                                {isLoading ? "Checking..." : "Next"}
                            </button>
                            {error && <p>{error}</p>}
                        </form>
                    )}

                    {step === 2 && (
                        <form onSubmit={handleStep2Submit}>
                            <h2>Step 2: Personal Information</h2>
                            <input
                                type="text"
                                placeholder="Firstname"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                required
                            />
                            <input
                                type="text"
                                placeholder="Lastname"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                required
                            />
                            <input
                                type="date"
                                placeholder="Date of birth"
                                value={dateOfBirth}
                                onChange={(e) => setDateOfBirth(e.target.value)}
                                required
                            />
                            <button type="submit" disabled={isLoading}>
                                {isLoading ? "Creating Account..." : "Sign Up"}
                            </button>
                            {error && <p>{error}</p>}
                        </form>
                    )}
                    <div>
                        <button onClick={() => router.push("/signin")}>
                            Sign In
                        </button>
                    </div>
                </div>
            ) : (
                <></>
            )}
        </div>
    );
};

export default Signup;
