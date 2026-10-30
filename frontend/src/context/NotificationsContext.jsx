import { useAuth } from "./AuthContext";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { getNotifications } from "../services/adminApi";
import { TOKEN_KEY } from "../services/api";

const NotificationsContext = createContext(null);

export function NotificationsProvider({ children }) {
  const { user, loading } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const requestVersion = useRef(0);
  const refreshNotifications = async () => {
    if (loading || !user || !localStorage.getItem(TOKEN_KEY)) return;
    const version = ++requestVersion.current;
    const items = await getNotifications();
    if (version === requestVersion.current && localStorage.getItem(TOKEN_KEY)) setNotifications(items);
  };
  const updateNotifications = (update) => {

    requestVersion.current += 1;
    setNotifications(update);
  };

  useEffect(() => {
    if (loading || !user) {
      requestVersion.current += 1;
      setNotifications([]);
      return;
    }
    const refresh = () => {
      if (document.visibilityState !== "hidden") {
        refreshNotifications().catch(() => {});
      }
    };
    refresh();
    const interval = window.setInterval(refresh, 20000);
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      requestVersion.current += 1;
      window.clearInterval(interval);
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [user, loading]);

  return <NotificationsContext.Provider value={{ notifications, setNotifications: updateNotifications, refreshNotifications }}>{children}</NotificationsContext.Provider>;
}

export function useNotifications() {
  const value = useContext(NotificationsContext);
  if (!value) throw new Error("useNotifications must be used within NotificationsProvider");
  return value;
}
