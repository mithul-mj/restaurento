import UserNavbar from "../user/UserNavbar";
import { Outlet, useLocation } from "react-router-dom";
import { ErrorBoundary } from "react-error-boundary";
import ErrorFallback from "../ErrorFallback";

const UserLayout = () => {
    const location = useLocation();

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-gray-50">
            <div className="relative z-[100] flex-shrink-0">
                <UserNavbar />
            </div>
            <main className="flex-1 overflow-y-auto relative z-0">
                <ErrorBoundary
                    FallbackComponent={ErrorFallback}
                    resetKeys={[location.pathname]}
                >
                    <Outlet />
                </ErrorBoundary>
            </main>
        </div>
    );
};

export default UserLayout;