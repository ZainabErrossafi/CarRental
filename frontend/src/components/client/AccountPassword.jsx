import { useRef, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api.js";
import { LockKeyhole } from "lucide-react";

const passwordFields = [
  { name: "old", label: "Current password", autoComplete: "current-password" },
  { name: "next", label: "New password", autoComplete: "new-password", minLength: 8 },
  { name: "confirm", label: "Confirm new password", autoComplete: "new-password", minLength: 8 },
];

export default function AccountPassword({ onBusy }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const inFlight = useRef(false);
  const runUpdate = async (action, successMessage, errorMessage) => {
    if (inFlight.current) return;
    inFlight.current = true;
    setBusy(true);
    onBusy(true);
    setError("");
    setSuccess("");
    try {
      await action();
      setSuccess(successMessage);
    } catch (err) {
      setError(err.message || errorMessage);
    } finally {
      inFlight.current = false;
      setBusy(false);
      onBusy(false);
    }
  };

  const { user } = useAuth();
  const canChangePassword = user.canChangePassword !== false;
  const [password, setPassword] = useState({ old: "", next: "", confirm: "" });
  const changePassword = (field, value) => setPassword({ ...password, [field]: value });
  const savePassword = async (event) => {
    event.preventDefault();
    if (inFlight.current || !canChangePassword) return;
    if (password.next !== password.confirm) {
      setError("New passwords do not match.");
      return;
    }
    if (password.next === password.old) {
      setError("Choose a different password from your current one.");
      return;
    }
    return runUpdate(
      async () => {
        await api.post("users/change-password/", { old_password: password.old, new_password: password.next });
        setPassword({ old: "", next: "", confirm: "" });
      },
      "Your password has been changed.",
      "Could not change your password.",
    );
  };
  return (
    <>
      <form onSubmit={savePassword}>
        <fieldset disabled={busy}>
          {passwordFields.map(({ name, label, autoComplete, minLength }) => (
            <label key={name}>
              {label}
              <input
                required
                type="password"
                minLength={minLength}
                autoComplete={autoComplete}
                value={password[name]}
                onChange={(event) => changePassword(name, event.target.value)}
              />
              {name === "next" && <small>Use at least 8 characters and avoid common passwords.</small>}
            </label>
          ))}
          <button className="account-settings-save" type="submit">
            <LockKeyhole size={16} aria-hidden="true" />
            {busy ? "Updating…" : "Change password"}
          </button>
        </fieldset>
      </form>
      {error && (
        <p className="account-settings-error" role="alert">
          {error}
        </p>
      )}
      {success && (
        <p className="account-settings-success" role="status">
          {success}
        </p>
      )}
    </>
  );
}
