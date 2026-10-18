import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { getNotifications } from "../services/adminApi";

const NotificationsContext = createContext(null);

export function NotificationsProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const requestVersion = useRef(0);
  const refreshNotifications = useCallback(async () => {
    const version = ++requestVersion.current;
    const items = await getNotifications();
    if (version === requestVersion.current) setNotifications(items);
  }, []);
  const updateNotifications = useCallback((update) => {
    // Ignore requests started before a local read/delete action.
    requestVersion.current += 1;
    setNotifications(update);
  }, []);

  useEffect(() => {
    const refresh = () => {
      if (document.visibilityState !== "hidden") {
        refreshNotifications().catch(() => {});
      }
    };
    refresh();
    const interval = window.setInterval(refresh, 10000);
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      requestVersion.current += 1;
      window.clearInterval(interval);
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [refreshNotifications]);

  return (
    <NotificationsContext.Provider value={{ notifications, setNotifications: updateNotifications, refreshNotifications }}>
      {children}
    </NotificationsContext.Provider>
  );
}

export const useNotifications = () => useContext(NotificationsContext);
