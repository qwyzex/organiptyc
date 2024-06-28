import { useRouter } from "next/router";

export default function Organization() {
    const router = useRouter();

    return (
        <div>
            <div>
                <button onClick={() => router.back()}>
                    <h2>BACK</h2>
                </button>
            </div>
            <div>
                <button onClick={() => router.push("/organization/join")}>
                    <h2>JOIN</h2>
                </button>
            </div>
            <div>
                <button onClick={() => router.push("/organization/create")}>
                    <h2>CREATE</h2>
                </button>
            </div>
        </div>
    );
}
