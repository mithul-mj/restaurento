import { useSelector } from "react-redux";
import { Outlet, Navigate, useLocation } from "react-router-dom";

const RestaurantStatusGuard = () => {
    const { user } = useSelector((state) => state.auth);
    const location = useLocation();

    if (!user) return <Outlet />

    const status = user.verificationStatus;

    const path = location.pathname;

    if (status === 'new') {
        if (path !== '/restaurant/pre-approval') {
            return <Navigate to="/restaurant/pre-approval" replace />
        }
        return <Outlet />
    }

    if (status === 'pending') {
        if (path !== '/restaurant/verification-pending') {
            return <Navigate to="/restaurant/verification-pending" replace />
        }
        return <Outlet />
    }

    if (status === 'rejected') {
        if (path !== '/restaurant/verification-pending' && path !== '/restaurant/pre-approval') {
            return <Navigate to="/restaurant/verification-pending" replace />
        }
        return <Outlet />
    }

    if (status === 'approved') {
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

    return <Navigate to="/restaurant/login" replace />
};

export default RestaurantStatusGuard;