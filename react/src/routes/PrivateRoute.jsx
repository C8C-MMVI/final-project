// src/routes/PrivateRoute.jsx
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children, role, userRole }) => {
  // userRole comes from auth state
  if (role && role !== userRole) {
    return <Navigate to="/" replace />;
  }
  return children;
};

export default PrivateRoute;