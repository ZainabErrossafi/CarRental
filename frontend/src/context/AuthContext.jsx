import { createContext, useContext, useEffect, useState } from "react";
import {
  getCurrentUser,
  login as loginApi,
  signup as signupApi,
  logout as logoutApi,
  verifyEmail as verifyEmailApi,
} from "../services/authApi";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUser(getCurrentUser());
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    const loggedInUser = await loginApi(credentials);
    setUser(loggedInUser);
    return loggedInUser;
  };

  const signup = async (details) => {
    // Account is created but not signed in until the email is verified.
    return signupApi(details);
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

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, verifyEmail, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}