import { useRouter } from "next/router";
import { useState, useEffect, useContext, FormEvent } from "react";
import { doc, DocumentData, updateDoc } from "firebase/firestore";
import useOrganizationData from "@/function/useOrganizationData";
import { UserContext } from "@/context/UserContext";
import useIsAdmin from "@/function/useIsAdmin";
import { db } from "@/firebase";

export default function OrganizationMembers() {
    const router = useRouter();
    const { orgId } = router.query;
    const { orgData } = useOrganizationData(orgId as string);
    const { authUser, loading, userDoc } = useContext(UserContext);
    const { isAdmin } = useIsAdmin(orgId as string);

    return (
        <div>
            <header>
                <h1>MEMBERS</h1>
            </header>
            <main>
                <ul>
                    {orgData && authUser ? (
                        orgData.members.map((member: any) => {
                            return !(member.userId === authUser.uid) ? (
                                <li key={member.userId}>
                                    <p>{member.user.fullName}</p>
                                    <p>{member.joinedAt.toDate().toDateString()}</p>
                                    {isAdmin && !(member.userId === authUser.uid) ? (
                                        // && !(member.userId === authUser.uid)
                                        <select
                                            defaultValue={member.role}
                                            onChange={async (e) => {
                                                e.preventDefault();
                                                const newRole = e.target.value;
                                                const confirmChange = window.confirm(
                                                    `ARE YOU SURE YOU WANT TO CHANGE ${member.user.fullName}'s ROLE FROM '${member.role}' to '${newRole}'`
                                                );
                                                if (confirmChange) {
                                                    try {
                                                        const memberRef = doc(
                                                            db,
                                                            `organizations/${orgId}/members/${member.userId}`
                                                        );
                                                        const userRef = doc(
                                                            db,
                                                            `users/${member.userId}/organizations/${orgId}`
                                                        );

                                                        await updateDoc(memberRef, {
                                                            role: newRole,
                                                        });
                                                        await updateDoc(userRef, {
                                                            role: newRole,
                                                        });
                                                        
                                                        alert(
                                                            `${member.user.fullName}'s role has been updated to ${newRole}`
                                                        );
                                                    } catch (error) {
                                                        console.error(
                                                            "Error updating role: ",
                                                            error
                                                        );
                                                        alert(
                                                            "Failed to update role. Please try again."
                                                        );
                                                    }
                                                }
                                            }}
                                        >
                                            <option value={"member"}>{"Member"}</option>
                                            <option value={"admin"}>{"Admin"}</option>
                                        </select>
                                    ) : (
                                        <>{member.role}</>
                                    )}
                                </li>
                            ) : (
                                null
                            );
                        })
                    ) : (
                        <></>
                    )}
                </ul>
            </main>
        </div>
    );
}
