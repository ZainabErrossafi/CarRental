import { useAuth } from "../../context/AuthContext";
import { useRef, useState } from "react";
import { UserRound, X, LockKeyhole, Save, ShieldCheck } from "lucide-react";
import api, { TOKEN_KEY } from "../../services/api.js";
import { sanitizeName } from "../../utils/name";

const passwordFields = [
  { name: "old", label: "Current password", autoComplete: "current-password" },
  { name: "next", label: "New password", autoComplete: "new-password", minLength: 8 },
  { name: "confirm", label: "Confirm new password", autoComplete: "new-password", minLength: 8 },
];

export default function AccountSettings({ overlay }) {
  const { user, refreshUser } = useAuth();
  const canChangePassword = user.canChangePassword !== false;
  const dialog = useRef(null);
  const [tab, setTab] = useState("profile");
  const [profile, setProfile] = useState({ username: "", first_name: "", last_name: "", phone: "" });
  const [password, setPassword] = useState({ old: "", next: "", confirm: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [twoFactorPassword, setTwoFactorPassword] = useState("");
  const settingKey = `rently_2fa_${user.id}`;
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(() => {
    if (typeof user.two_factor_enabled === "boolean") return user.two_factor_enabled;
    try { return localStorage.getItem(settingKey) === "true"; } catch { return false; }
  });
  const inFlight = useRef(false);

  const runUpdate = async (action, successMessage, errorMessage) => {
    if (inFlight.current) return;
    inFlight.current = true;
    setBusy(true);
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
    }
  };

  const toggleTwoFactor = (event) => {
    event.preventDefault();
    return runUpdate(async () => {
      const tokens = JSON.parse(localStorage.getItem(TOKEN_KEY) || "null");
      const { data } = await api.post("auth/2fa/toggle/", { enabled: !twoFactorEnabled, password: twoFactorPassword }, {
        headers: { Authorization: `Bearer ${tokens?.access}` },
      });
      setTwoFactorEnabled(data.two_factor_enabled);
      try { localStorage.setItem(settingKey, String(data.two_factor_enabled)); } catch { /* Optional display cache. */ }
      await refreshUser();
      setTwoFactorPassword("");
    }, "Two-factor authentication has been updated.", "Could not update two-factor authentication.");
  };
  const changeProfile = (field, value) => setProfile({ ...profile, [field]: value });
  const changePassword = (field, value) => setPassword({ ...password, [field]: value });
  const show = () => {
    setProfile({
      username: user.username || "",
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      phone: user.phone || "",
    });
    setPassword({ old: "", next: "", confirm: "" });
    setTwoFactorPassword("");
    setError("");
    setSuccess("");
    setTab("profile");
    dialog.current.showModal();
  };
  const switchTab = (value) => {
    setTwoFactorPassword("");
    setTab(value);
    setError("");
    setSuccess("");
  };
  const saveProfile = async (event) => {
    event.preventDefault();
    if (inFlight.current) return;
    if (!profile.username.trim() || !profile.first_name.trim() || !profile.last_name.trim() || !profile.phone.trim()) {
      setError("Please fill in your username, first name, last name and phone.");
      return;
    }
    return runUpdate(async () => {
      await api.patch(`users/${user.id}/`, {
        username: profile.username.trim(),
        first_name: profile.first_name.trim(),
        last_name: profile.last_name.trim(),
        phone: profile.phone.trim(),
      });
      await refreshUser();
    }, "Your information has been updated.", "Could not update your information.");
  };
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
    return runUpdate(async () => {
      await api.post("users/change-password/", { old_password: password.old, new_password: password.next });
      setPassword({ old: "", next: "", confirm: "" });
    }, "Your password has been changed.", "Could not change your password.");
  };
  return (
    <>
      <button
        type="button"
        title="Account settings"
        aria-label="Account settings"
        className={`client-reservations-link account-settings-trigger${overlay ? " is-overlay" : ""}`}
        onClick={show}
      >
        <UserRound size={19} aria-hidden="true" />
      </button>
      <dialog
        className="account-settings-dialog"
        ref={dialog}
        aria-labelledby="account-settings-title"
        onCancel={(event) => {
          if (busy) event.preventDefault();
        }}
        onClose={() => setPassword({ old: "", next: "", confirm: "" })}
      >
        <header>
          <div>
            <span>YOUR ACCOUNT</span>
            <h2 id="account-settings-title">Account settings</h2>
          </div>
          <button
            type="button"
            aria-label="Close account settings"
            disabled={busy}
            onClick={() => dialog.current.close()}
          >
            <X size={19} aria-hidden="true" />
          </button>
        </header>
        <div className="account-settings-tabs">
          <button
            type="button"
            disabled={busy}
            aria-pressed={tab === "profile"}
            onClick={() => switchTab("profile")}
          >
            <UserRound size={15} aria-hidden="true" />
            Personal information
          </button>
          {canChangePassword && (
            <button
              type="button"
              disabled={busy}
              aria-pressed={tab === "password"}
              onClick={() => switchTab("password")}
            >
              <LockKeyhole size={15} aria-hidden="true" />
              Password
            </button>
          )}
          <button type="button" disabled={busy} aria-pressed={tab === "two-factor"}
            onClick={() => switchTab("two-factor")}>
            <ShieldCheck size={15} aria-hidden="true" />
            2FA
          </button>
        </div>
        {tab === "profile" && (
          <form onSubmit={saveProfile}>
            <fieldset disabled={busy}>
              <label>
                Username
                <input
                  required
                  maxLength={150}
                  autoComplete="username"
                  pattern="[A-Za-z0-9_-]+"
                  autoCapitalize="none"
                  spellCheck={false}
                  value={profile.username}
                  onChange={(event) => changeProfile("username", event.target.value.replace(/[^A-Za-z0-9_-]/g, ""))}
                />
              </label>
              <div className="account-settings-names">
                <label>
                  First name
                  <input
                    required
                    maxLength={150}
                    autoComplete="given-name"
                    value={profile.first_name}
                    onChange={(event) => changeProfile("first_name", sanitizeName(event.target.value))}
                  />
                </label>
                <label>
                  Last name
                  <input
                    required
                    maxLength={150}
                    autoComplete="family-name"
                    value={profile.last_name}
                    onChange={(event) => changeProfile("last_name", sanitizeName(event.target.value))}
                  />
                </label>
              </div>
              <label>
                Email
                <input readOnly type="email" value={user.email || ""} autoComplete="email" />
                <small>Your account email cannot be changed here.</small>
              </label>
              <label>
                Phone
                <input
                  required
                  type="tel"
                  placeholder="+212691033189"
                  pattern="[+0-9]+"
                  maxLength={20}
                  autoComplete="tel"
                  value={profile.phone}
                  onChange={(event) => changeProfile("phone", event.target.value.replace(/[^0-9+]/g, ""))}
                />
              </label>
              <button className="account-settings-save" type="submit">
                <Save size={16} aria-hidden="true" />
                {busy ? "Saving…" : "Save changes"}
              </button>
            </fieldset>
          </form>
        )}
        {tab === "password" && canChangePassword && (
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
        )}
        {error && (
          <p className="account-settings-error" role="alert">{error}</p>
        )}
        {tab === "two-factor" && <form onSubmit={toggleTwoFactor}>
          <fieldset disabled={busy || !canChangePassword}>
            <div className="tw:rounded-xl tw:border tw:border-solid tw:border-[#e4e9ec] tw:bg-[#f7f9fa] tw:p-4">
              <div className="tw:flex tw:items-center tw:gap-3">
                <span className="tw:flex tw:size-10 tw:shrink-0 tw:items-center tw:justify-center tw:rounded-xl tw:bg-[#ffead7] tw:text-[#975326]">
                  <ShieldCheck size={22} aria-hidden="true" />
                </span>
                <h3 className="tw:m-0 tw:flex-1 tw:text-sm tw:font-bold tw:leading-snug">Two-factor authentication</h3>
                <span className={`tw:rounded-full tw:px-2.5 tw:py-1 tw:text-[10px] tw:font-semibold ${twoFactorEnabled ? "tw:bg-[#e6f3ea] tw:text-[#39734c]" : "tw:bg-[#e9edf0] tw:text-[#657582]"}`}>
                  {twoFactorEnabled ? "Enabled" : "Disabled"}
                </span>
              </div>
            </div>
            {canChangePassword ? (
              <>
                <label>Current password
                  <input type="password" autoComplete="current-password" placeholder="Enter your current password" required value={twoFactorPassword}
                    onChange={(event) => setTwoFactorPassword(event.target.value)} />
                </label>
                <small>Confirm your password to {twoFactorEnabled ? "disable" : "enable"} email verification.</small>
                <button className="account-settings-save" type="submit">
                  {busy ? "Saving…" : twoFactorEnabled ? "Disable 2FA" : "Enable 2FA"}
                </button>
              </>
            ) : <p>A local account password is required to change this setting.</p>}
          </fieldset>
        </form>}
        {success && (
          <p className="account-settings-success" role="status">
            {success}
          </p>
        )}
      </dialog>
    </>
  );
}
