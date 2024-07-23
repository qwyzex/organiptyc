import { db } from "@/firebase";
import { deleteDoc, doc } from "firebase/firestore";
import createLog from "./createLog";

const removeMember = async ({ orgId, perpetrator, memberList }: any) => {
    if (memberList) {
        try {
            memberList.forEach(
                async (member: { uid: string; fullName: string }) => {
                    const orgRefInUsr = doc(
                        db,
                        "users",
                        member.uid,
                        "organizations",
                        orgId
                    );
                    const usrRefInOrg = doc(
                        db,
                        "organizations",
                        orgId,
                        "members",
                        member.uid
                    );

                    const logAction =
                        memberList.length == 1 &&
                        memberList[0].uid == perpetrator.uid
                            ? {
                                type: "remove_self",
                                text: `${perpetrator.firstName} quit from the organization.`,
                            }
                            : {
                                  type: "remove_member",
                                  text: `${perpetrator.firstName} removed ${
                                      memberList.length > 1
                                          ? memberList.length +
                                            "(" +
                                            memberList.map(
                                                (member: any) =>
                                                    `${member.fullName},`
                                            ) +
                                            ")"
                                          : memberList.map(
                                                (member: any) => member.fullName
                                            )
                                  }.`,
                              };

                    await deleteDoc(orgRefInUsr);
                    await deleteDoc(usrRefInOrg);

                    await createLog(
                        orgId,
                        perpetrator.firstName,
                        logAction,
                        perpetrator.photoURL
                    );
                }
            );
        } catch (err: any) {
            console.log(err);
        } finally {
            alert("SUCCESSFULLY REMOVED!");
        }
    }
};

export default removeMember;
