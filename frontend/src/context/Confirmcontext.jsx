import { createContext, useCallback, useContext, useRef, useState } from "react";
import { AlertTriangle } from "lucide-react";

const ConfirmContext = createContext(null);

export function ConfirmProvider({ children }) {
  const [dialog, setDialog] = useState(null); // { message, confirmLabel, cancelLabel, danger }
  const resolver = useRef(null);

  // Returns a Promise<boolean> — true if the user clicked confirm, false otherwise.
  // Drop-in replacement for `if (!confirm("...")) return;` → `if (!(await confirm("..."))) return;`
  const confirm = useCallback((message, options = {}) => {
    setDialog({
      message,
      confirmLabel: options.confirmLabel || "Confirm",
      cancelLabel: options.cancelLabel || "Cancel",
      danger: options.danger ?? false,
    });
    return new Promise((resolve) => {
      resolver.current = resolve;
    });
  }, []);

  const handle = (result) => {
    setDialog(null);
    resolver.current?.(result);
    resolver.current = null;
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}

      {dialog && (
        <div className="modal-overlay" onClick={() => handle(false)}>
          <div className="confirm-card" onClick={(e) => e.stopPropagation()}>
            <div className={`confirm-icon ${dialog.danger ? "danger" : ""}`}>
              <AlertTriangle size={20} />
            </div>
            <p className="confirm-message">{dialog.message}</p>
            <div className="confirm-actions">
              <button className="btn btn-secondary" onClick={() => handle(false)}>
                {dialog.cancelLabel}
              </button>
              <button
                className={`btn ${dialog.danger ? "btn-danger" : "btn-primary"}`}
                onClick={() => handle(true)}
                autoFocus
              >
                {dialog.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error("useConfirm must be used within a ConfirmProvider");
  return ctx;
}