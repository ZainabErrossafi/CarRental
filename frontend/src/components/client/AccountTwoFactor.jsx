import { useRef, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import api, { TOKEN_KEY } from "../../services/api.js";

export default function AccountTwoFactor({ onBusy }) {
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

  const { user, refreshUser } = useAuth();
  const canChangePassword = user.canChangePassword !== false;
  const [twoFactorPassword, setTwoFactorPassword] = useState("");
  const settingKey = `rently_2fa_${user.id}`;
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(() => {
    if (typeof user.two_factor_enabled === "boolean") return user.two_factor_enabled;
    try {
      return localStorage.getItem(settingKey) === "true";
    } catch {
      return false;
    }
  });
  const toggleTwoFactor = (event) => {
    event.preventDefault();
    return runUpdate(
      async () => {
        const tokens = JSON.parse(localStorage.getItem(TOKEN_KEY) || "null");
        const { data } = await api.post(
          "auth/2fa/toggle/",
          { enabled: !twoFactorEnabled, password: twoFactorPassword },
          {
            headers: { Authorization: `Bearer ${tokens?.access}` },
          },
        );
        setTwoFactorEnabled(data.two_factor_enabled);
        try {
          localStorage.setItem(settingKey, String(data.two_factor_enabled));
        } catch {
        }
        await refreshUser();
        setTwoFactorPassword("");
      },
      "Two-factor authentication has been updated.",
      "Could not update two-factor authentication.",
    );
  };
  return (
    <>
      <form onSubmit={toggleTwoFactor}>
        <fieldset disabled={busy || !canChangePassword}>
          <div className="account-settings-security">
            <div>
              <h3>Two-factor authentication</h3>
              <small>Verify your sign-in by email.</small>
            </div>
            <span className={`account-settings-status${twoFactorEnabled ? " is-enabled" : ""}`}>
              {twoFactorEnabled ? "Enabled" : "Disabled"}
            </span>
          </div>
          {canChangePassword ? (
            <>
              <label>
                Current password
                <input
                  type="password"
                  autoComplete="current-password"
                  placeholder="Enter your current password"
                  required
                  value={twoFactorPassword}
                  onChange={(event) => setTwoFactorPassword(event.target.value)}
                />
              </label>
              <small>Confirm your password to {twoFactorEnabled ? "disable" : "enable"} email verification.</small>
              <button className="account-settings-save" type="submit">
                {busy ? "Saving…" : twoFactorEnabled ? "Disable 2FA" : "Enable 2FA"}
              </button>
            </>
          ) : (
            <p>A local account password is required to change this setting.</p>
          )}
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
