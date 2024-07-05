import Link from "next/link";

export default function Page404() {
    return (
        <>
            <h1>THIS PAGE DOES NOT EXISTS.</h1>
            <Link href={"/home"}>
                <p>Go back to homepage</p>
            </Link>{" "}
        </>
    );
}
