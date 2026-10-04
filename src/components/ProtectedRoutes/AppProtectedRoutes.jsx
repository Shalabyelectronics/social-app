import React, { useContext } from "react";
import { Navigate } from "react-router";
import { AuthContext } from "../AuthContext/AuthContextProvider";

// Pages that need a logged-in user; everyone else goes to /login
export default function AppProtectedRoutes({ children }) {
  const { token } = useContext(AuthContext);

  if (!token) return <Navigate to="/login" replace />;
  return children;
}
