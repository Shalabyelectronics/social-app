import React, { useEffect, useState, createContext } from "react";
import { getUserProfileService } from "../../services/authServices";

export const AuthContext = createContext();
export default function AuthContextProvider({ children }) {
  const [token, setTokenState] = useState(() =>
    localStorage.getItem("userToken"),
  );
  const [user, setUser] = useState(null);
  const [userPhoto, setUserPhoto] = useState(null);

  // Logging out (or swapping accounts) clears the old profile right away
  const setToken = (nextToken) => {
    setTokenState(nextToken);
    if (!nextToken) {
      setUser(null);
      setUserPhoto(null);
    }
  };

  const applyProfile = (profileUser) => {
    setUser(profileUser);
    setUserPhoto(profileUser.photo);
  };

  const fetchUserProfile = async () => {
    if (!token) return;

    try {
      const response = await getUserProfileService(token);
      applyProfile(response.data.data.user);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      setUser(null);
    }
  };

  // Fetch user data when token changes; ignore a late response for an old token
  useEffect(() => {
    if (!token) return;
    let ignore = false;

    getUserProfileService(token)
      .then((response) => {
        if (!ignore) applyProfile(response.data.data.user);
      })
      .catch((error) => {
        if (ignore) return;
        console.error("Error fetching user profile:", error);
        setUser(null);
      });

    return () => {
      ignore = true;
    };
  }, [token]);

  // Keep the token in localStorage so the session survives a reload
  useEffect(() => {
    if (token) {
      localStorage.setItem("userToken", token);
    } else {
      localStorage.removeItem("userToken");
    }
  }, [token]);

  return (
    <AuthContext.Provider
      value={{
        token,
        setToken,
        user,
        setUser,
        userPhoto,
        setUserPhoto,
        refreshUserProfile: fetchUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
