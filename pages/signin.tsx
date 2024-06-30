import React, { useState, useEffect, useContext } from "react";
import { auth } from "@/firebase";
import { onAuthStateChanged, signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/router";
import { UserContext } from "@/context/UserContext";

export default function SigninPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { loading, authUser } = useContext(UserContext);

    const router = useRouter();

    useEffect(() => {
        if (authUser) {
            router.push("/dashboard");
            return;
        }
    });

    const handleLoginSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const result = await signInWithEmailAndPassword(auth, email, password);
            console.log("Logged in:", result.user);
            // Redirect to dashboard or home page
            // history.push("/dashboard");
        } catch (error) {
            setError("error");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            {!loading && !authUser ? (
                <>
                    <form onSubmit={handleLoginSubmit}>
                        <h2>Sign In</h2>
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
                        <button type="submit" disabled={isLoading}>
                            {isLoading ? "Signing in..." : "Next"}
                        </button>
                        {error && <p>{error}</p>}
                    </form>

                    <div>
                        <button onClick={() => router.push("/signup")}>Sign Up</button>
                    </div>
                </>
            ) : (
                <></>
            )}
        </div>
    );
}
