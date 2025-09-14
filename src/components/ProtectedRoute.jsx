import { Navigate } from "react-router-dom";
import { UserAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { session } = UserAuth();
  if (session === undefined) {
    return <p>Loading...</p>;
  }
  if (session) {
    return <>{children}</>;
  } else {
    return <Navigate to="/signup" />;
  }
};

export default ProtectedRoute;
