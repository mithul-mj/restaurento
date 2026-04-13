import UserNavbar from "../user/UserNavbar";
import { useSelector } from "react-redux";
import MobileBottomNav from "../user/MobileBottomNav";
import { Outlet, useLocation } from "react-router-dom";
import { ErrorBoundary } from "react-error-boundary";
import ErrorFallback from "../ErrorFallback";

const UserLayout = () => {
    const location = useLocation();
    const { user } = useSelector((state) => state.auth);

    return (
        <div className="flex flex-col h-[100dvh] overflow-hidden bg-[#fcfcfc]">
            <div className="relative z-[100] flex-shrink-0">
                <UserNavbar />
            </div>
            <main className={`flex-1 overflow-y-auto relative z-0 md:pb-0 ${user ? 'pb-20' : ''}`}>
                <ErrorBoundary
                    FallbackComponent={ErrorFallback}
                    resetKeys={[location.pathname]}
                >
                    <Outlet />
                </ErrorBoundary>
            </main>
            <MobileBottomNav />
        </div>
    );
};

export default UserLayout;
