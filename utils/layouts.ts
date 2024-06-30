import LandingLayout from "@/components/layouts/LandingLayout";
import AuthLayout from "@/components/layouts/AuthLayout";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import OrgLayout from "@/components/layouts/OrgLayout";
import EmptyLayout from "@/components/layouts/EmptyLayout";
import { useContext } from "react";
import { UserContext } from "@/context/UserContext";

import { useEffect } from "react";

const getLayoutByRoute = (pathname: string) => {
    if (
        pathname.startsWith("/dashboard") ||
        pathname.startsWith("/profile") ||
        pathname.startsWith("/settings")
    ) {
        return DashboardLayout;
    }

    if (pathname.startsWith("/org")) {
        return OrgLayout;
    }

    if (pathname.startsWith("/")) {
        return LandingLayout;
    }

    if (pathname === "/" || pathname === "/signin" || pathname === "/signup") {
        return AuthLayout;
    }

    return EmptyLayout;
};

export default getLayoutByRoute;
