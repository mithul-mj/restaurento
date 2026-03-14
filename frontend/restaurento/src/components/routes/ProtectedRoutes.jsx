import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ProtectedRoutes = ({ allowedRoles }) => {
    const { user, isAuthenticated } = useSelector((state) => state.auth);
    const role = user?.role;
    const location = useLocation();

    if (!isAuthenticated) {
        if (location.pathname.startsWith('/restaurant')) {
            return <Navigate to="/restaurant/login" state={{ from: location }} replace />;
        }
        if (location.pathname.startsWith('/admin')) {
            return <Navigate to="/admin/login" state={{ from: location }} replace />;
        }
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (allowedRoles && !allowedRoles.includes(role)) {
        if (role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
        if (role === 'RESTAURANT') return <Navigate to="/restaurant/dashboard" replace />;
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoutes;
