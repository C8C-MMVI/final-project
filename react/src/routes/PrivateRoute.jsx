import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children, role, userRole, loading }) => {
  if (loading) return null;

  if (!userRole) return <Navigate to="/login" replace />;

  if (role && role !== userRole) return <Navigate to="/" replace />;

  return children;
};

export default PrivateRoute;