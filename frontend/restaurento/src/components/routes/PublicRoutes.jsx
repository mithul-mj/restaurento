import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

const PublicRoutes = () => {
    const { isAuthenticated, user } = useSelector((state) => state.auth);
    const role = user?.role;

    if (isAuthenticated) {
        if (role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
        if (role === 'RESTAURANT') return <Navigate to="/restaurant/dashboard" replace />;
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default PublicRoutes;
