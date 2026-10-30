import { useI18n } from "./I18nContext";
import { createContext, useContext, useRef, useState } from "react";
import { AlertTriangle } from "lucide-react";

const ConfirmContext = createContext(null);

export function ConfirmProvider({ children }) {
  const { t } = useI18n();
  const [dialog, setDialog] = useState(null);
  const resolver = useRef(null);

  const confirm = (message, options = {}) => {
    setDialog({
      message,
      confirmLabel: options.confirmLabel || "Confirm",
      cancelLabel: options.cancelLabel || "Cancel",
      danger: options.danger ?? false,
    });
    return new Promise((resolve) => {
      resolver.current = resolve;
    });
  };

  const handle = (result) => {
    setDialog(null);
    resolver.current?.(result);
    resolver.current = null;
  };

  const confirmationDialog = dialog && (
    <div className="modal-overlay" onClick={() => handle(false)}>
      <div className="confirm-card" onClick={(e) => e.stopPropagation()}>
        <div className={`confirm-icon ${dialog.danger ? "danger" : ""}`}>
          <AlertTriangle size={20} />
        </div>
        <p className="confirm-message">{t(dialog.message)}</p>
        <div className="confirm-actions">
          <button className="btn btn-secondary" onClick={() => handle(false)}>
            {t(dialog.cancelLabel)}
          </button>
          <button
            className={`btn ${dialog.danger ? "btn-danger" : "btn-primary"}`}
            onClick={() => handle(true)}
            autoFocus
          >
            {t(dialog.confirmLabel)}
          </button>
        </div>
      </div>
    </div>
  );
  return <ConfirmContext.Provider value={confirm}>{children}{confirmationDialog}</ConfirmContext.Provider>;
}

export function useConfirm() {
  const value = useContext(ConfirmContext);
  if (!value) throw new Error("useConfirm must be used within ConfirmProvider");
  return value;
}
