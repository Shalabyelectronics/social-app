import React, { useContext } from "react";
import { Navigate } from "react-router";
import { AuthContext } from "../AuthContext/AuthContextProvider";

// Login and register pages; logged-in users go to the feed instead
export default function AuthProtextedRoutes({ children }) {
  const { token } = useContext(AuthContext);

  if (token) return <Navigate to="/" replace />;
  return children;
}
