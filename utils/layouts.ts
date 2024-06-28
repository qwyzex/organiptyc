import LandingLayout from "@/components/layouts/LandingLayout";
import AuthLayout from "@/components/layouts/AuthLayout";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import OrgLayout from "@/components/layouts/OrgLayout";

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

    if (pathname === "/" || pathname === "/signin" || pathname === "/signup") {
        return AuthLayout;
    }

    return LandingLayout;
};

export default getLayoutByRoute;
