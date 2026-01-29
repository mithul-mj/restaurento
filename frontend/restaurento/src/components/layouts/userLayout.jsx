import UserNavbar from "../user/UserNavbar";
import { Outlet } from "react-router-dom";

const UserLayout = () => {
    return (
        <div className="flex flex-col h-screen overflow-hidden bg-gray-50">
            <div className="relative z-[100] flex-shrink-0">
                <UserNavbar />
            </div>
            <main className="flex-1 overflow-y-auto relative z-0">
                <Outlet />
            </main>
        </div>
    );
};

export default UserLayout;