import { Navigate } from "react-router-dom";
import authService from "../services/auth/authService"; 

function PrivateRoute({ children }) {
  if (!authService.isAuthenticated()) {
    return <Navigate to="/" />;
  }
  return children;
}

export default PrivateRoute;
