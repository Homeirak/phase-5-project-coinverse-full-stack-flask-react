import { useContext } from "react";
import { UserContext } from "../context/UserContext";
import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }) {
  const { user, loading } = useContext(UserContext);

  if (loading) return null;

  return user ? children : <Navigate to="/login" />;
}

export default ProtectedRoute;