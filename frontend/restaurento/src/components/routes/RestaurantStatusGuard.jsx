import { useSelector, useDispatch } from "react-redux";
import { Outlet, Navigate, useLocation } from "react-router-dom";
import { logout } from "../../redux/slices/authSlice";

const RestaurantStatusGuard = () => {
    const { user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const location = useLocation();

    if (!user) return <Outlet />

    const status = user.verificationStatus;
    const path = location.pathname;

    if (status === 'new') {
        if (path !== '/restaurant/pre-approval') {
            return <Navigate to="/restaurant/pre-approval" replace />
        }
        return <Outlet />
    } else if (status === 'pending') {
        if (path !== '/restaurant/verification-pending') {
            return <Navigate to="/restaurant/verification-pending" replace />
        }
        return <Outlet />
    } else if (status === 'rejected') {
        if (path !== '/restaurant/verification-pending' && path !== '/restaurant/pre-approval') {
            return <Navigate to="/restaurant/verification-pending" replace />
        }
        return <Outlet />
    } else if (status === 'banned') {
        if (path !== '/restaurant/verification-pending') {
            return <Navigate to="/restaurant/verification-pending" replace />
        }
        return <Outlet />
    } else if (status === 'approved') {
        if (!user.isOnboardingCompleted) {
            if (path !== '/restaurant/onboarding') {
                return <Navigate to="/restaurant/onboarding" replace />
            }
            return <Outlet />
        }

        if (
            path === '/restaurant/onboarding' ||
            path === '/restaurant/verification-pending' ||
            path === '/restaurant/pre-approval'
        ) {
            return <Navigate to="/restaurant/dashboard" replace />
        }

        return <Outlet />
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
            <p className="text-gray-500">Unknown account status: {status}</p>
            <button
                onClick={() => dispatch(logout())}
                className="mt-4 text-red-500 hover:underline"
            >
                Sign Out
            </button>
        </div>
    );
};

export default RestaurantStatusGuard;