import { createContext, useContext, useEffect, useState } from "react";
import {
  getCurrentUser,
  login as loginApi,
  googleLogin as googleLoginApi,
  signup as signupApi,
  logout as logoutApi,
  verifyEmail as verifyEmailApi,
} from "../services/authApi";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const onLogout = () => setUser(null);
    window.addEventListener('rently:logout', onLogout);
    getCurrentUser()
      .then((currentUser) => { if (active) setUser(currentUser); })
      .catch(() => { if (active) setUser(null); })
      .finally(() => { if (active) setLoading(false); });
    return () => {
      active = false;
      window.removeEventListener('rently:logout', onLogout);
    };
  }, []);

  const login = async (credentials) => {
    const loggedInUser = await loginApi(credentials);
    setUser(loggedInUser);
    return loggedInUser;
  };

  const signup = async (details) => {
    const registeredUser = await signupApi(details);
    setUser(registeredUser);
    return registeredUser;
  };

  const googleLogin = async (credentials) => {
    const loggedInUser = await googleLoginApi(credentials);
    setUser(loggedInUser);
    return loggedInUser;
  };

  const verifyEmail = async (payload) => {
    const verifiedUser = await verifyEmailApi(payload);
    setUser(verifiedUser);
    return verifiedUser;
  };

  const logout = async () => {
    await logoutApi();
    setUser(null);
  };
  const refreshUser = async () => {
    const currentUser = await getCurrentUser();
    setUser(currentUser);
    return currentUser;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, googleLogin, signup, verifyEmail, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
