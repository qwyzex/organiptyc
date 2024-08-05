import { UserContext } from "@/context/UserContext";
import removeMember from "@/function/removeMember";
import useIsAdmin from "@/function/useIsAdmin";
import useOrganizationData from "@/function/useOrganizationData";
import { Button } from "@mui/material";
import { useRouter } from "next/router";
import { useContext } from "react";

const OrgSettings = () => {
    const router = useRouter();

    const { orgId } = router.query;

    const { loading, authUser, userDoc } = useContext(UserContext);

    const { isAdmin, error: isAdminError } = useIsAdmin(orgId as string);
    const { orgData, error: orgDataError } = useOrganizationData(
        orgId as string
    );

    const handleQuitOrganization = async () => {
        if (!loading && authUser && userDoc && orgData) {
            console.log(orgData);
            const confirmQuitOrganization = window.confirm(
                `Are you sure you want to quit ${orgData.name}?`
            );

            if (confirmQuitOrganization) {
                try {
                    removeMember({
                        orgId: orgId as string,
                        perpetrator: { ...userDoc },
                        memberList: [
                            {
                                uid: authUser.uid,
                                fullName: userDoc.fullName,
                                firstName: userDoc.firstName,
                                lastName: userDoc.lastName,
                                photoURL: userDoc.photoURL,
                            },
                        ],
                    });
                } catch (err) {
                    console.log(err);
                } finally {
                    alert("Finished Quitting Organization!");
                    router.push("/organization");
                }
            }
        }
    };

    return (
        <>
            <h1>SETTINGS</h1>
            <Button onClick={handleQuitOrganization} className="btn-danger">
                QUIT ORGANIZATIOn
            </Button>
            {isAdmin == true && <p>ADMIN OPTIONS</p>}
        </>
    );
};

export default OrgSettings;
