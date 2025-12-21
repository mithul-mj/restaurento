import { Navigate, Outlet } from "react-router-dom";
import { useLocation } from "react-router-dom";

const ProtectedRoute = ()=>{
  const isAuth = localStorage.getItem('token');
  const location = useLocation();
  return isAuth ? <Outlet/> : <Navigate to='/login' state={{ from: location }} replace/>
}
export default ProtectedRoute
