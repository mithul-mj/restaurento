import UserNavbar from "../user/UserNavbar";
import { Outlet } from "react-router-dom";

const UserLayout = () => {
    return (
        <div>
            <UserNavbar />
            <Outlet />
        </div>


    );
};

export default UserLayout;