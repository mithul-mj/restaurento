import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

const PublicRoutes = () => {
    const { user, isAuthenticated } = useSelector((state) => state.auth);

    if (isAuthenticated) {
        if (user?.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
        if (user?.role === 'RESTAURANT') return <Navigate to="/restaurant/dashboard" replace />;
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default PublicRoutes;
