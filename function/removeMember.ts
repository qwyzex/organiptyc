import { db } from "@/firebase";
import { deleteDoc, doc } from "firebase/firestore";
import createLog from "./createLog";

/**
 * Removes the given members from an organization
 * @param {object} options an object containing the following properties
 * @param {string} options.orgId the ID of the organization to remove members from
 * @param {object} options.perpetrator an object containing the following properties
 * @param {string} options.perpetrator.firstName the first name of the user who initiated the removal
 * @param {string} options.perpetrator.photoURL the URL of the user who initiated the removal's photo
 * @param {object} options.memberList an array of objects containing the following properties
 * @param {string} options.memberList.uid the ID of the user to remove from the organization
 * @param {string} options.memberList.fullName the full name of the user to remove from the organization
 * @returns {undefined}
 */
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
        }
    }
};

export default removeMember;
