import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { UserRound, X, LockKeyhole, Save } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import api from "../../services/api.js";

export default function AccountSettings({ overlay }) {
  const { user, refreshUser } = useAuth();
  const canChangePassword = user.canChangePassword !== false;
  const dialog = useRef(null);
  const [tab, setTab] = useState("profile");
  const [profile, setProfile] = useState({ first_name: "", last_name: "", phone: "" });
  const [password, setPassword] = useState({ old: "", next: "", confirm: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const inFlight = useRef(false);
  const show = () => {
    setProfile({ first_name: user.first_name || "", last_name: user.last_name || "", phone: user.phone || "" });
    setPassword({ old: "", next: "", confirm: "" }); setError(""); setSuccess(""); setTab("profile");
    dialog.current.showModal();
  };
  const switchTab = (value) => { setTab(value); setError(""); setSuccess(""); };
  const saveProfile = async (event) => {
    event.preventDefault();
    if (inFlight.current) return;
    if (!profile.first_name.trim() || !profile.last_name.trim() || !profile.phone.trim()) { setError("Please fill in your first name, last name and phone."); return; }
    inFlight.current = true; setBusy(true); setError(""); setSuccess("");
    try {
      await api.patch(`users/${user.id}/`, { first_name: profile.first_name.trim(), last_name: profile.last_name.trim(), phone: profile.phone.trim() });
      await refreshUser(); setSuccess("Your information has been updated.");
    } catch (err) { setError(err.message || "Could not update your information."); }
    finally { inFlight.current = false; setBusy(false); }
  };
  const savePassword = async (event) => {
    event.preventDefault();
    if (inFlight.current || !canChangePassword) return;
    if (password.next !== password.confirm) { setError("New passwords do not match."); return; }
    if (password.next === password.old) { setError("Choose a different password from your current one."); return; }
    inFlight.current = true; setBusy(true); setError(""); setSuccess("");
    try {
      await api.post("users/change-password/", { old_password: password.old, new_password: password.next });
      setPassword({ old: "", next: "", confirm: "" }); setSuccess("Your password has been changed.");
    } catch (err) { setError(err.message || "Could not change your password."); }
    finally { inFlight.current = false; setBusy(false); }
  };
  return <>
    <button type="button" title="Account settings" aria-label="Account settings" className={`client-reservations-link account-settings-trigger${overlay ? " is-overlay" : ""}`} onClick={show}><UserRound size={19} aria-hidden="true" /></button>
    {createPortal(<dialog className="account-settings-dialog" ref={dialog} aria-labelledby="account-settings-title" onCancel={(event) => { if (busy) event.preventDefault(); }} onClose={() => setPassword({ old: "", next: "", confirm: "" })}>
      <header><div><span>YOUR ACCOUNT</span><h2 id="account-settings-title">Account settings</h2></div><button type="button" aria-label="Close account settings" disabled={busy} onClick={() => dialog.current.close()}><X size={19} aria-hidden="true" /></button></header>
      <div className="account-settings-tabs"><button type="button" disabled={busy} aria-pressed={tab === "profile"} onClick={() => switchTab("profile")}><UserRound size={15} aria-hidden="true" />Personal information</button>{canChangePassword && <button type="button" disabled={busy} aria-pressed={tab === "password"} onClick={() => switchTab("password")}><LockKeyhole size={15} aria-hidden="true" />Password</button>}</div>
      {tab !== "password" || !canChangePassword ? <form onSubmit={saveProfile}><fieldset disabled={busy}><div className="account-settings-names"><label>First name<input required maxLength={150} autoComplete="given-name" value={profile.first_name} onChange={(event) => setProfile({ ...profile, first_name: event.target.value })} /></label><label>Last name<input required maxLength={150} autoComplete="family-name" value={profile.last_name} onChange={(event) => setProfile({ ...profile, last_name: event.target.value })} /></label></div><label>Email<input readOnly type="email" value={user.email || ""} autoComplete="email" /><small>Your account email cannot be changed here.</small></label><label>Phone<input required type="tel" maxLength={20} autoComplete="tel" value={profile.phone} onChange={(event) => setProfile({ ...profile, phone: event.target.value })} /></label><button className="account-settings-save" type="submit"><Save size={16} aria-hidden="true" />{busy ? "Saving…" : "Save changes"}</button></fieldset></form> : <form onSubmit={savePassword}><fieldset disabled={busy}><label>Current password<input required type="password" autoComplete="current-password" value={password.old} onChange={(event) => setPassword({ ...password, old: event.target.value })} /></label><label>New password<input required type="password" minLength={8} autoComplete="new-password" value={password.next} onChange={(event) => setPassword({ ...password, next: event.target.value })} /><small>Use at least 8 characters and avoid common passwords.</small></label><label>Confirm new password<input required type="password" minLength={8} autoComplete="new-password" value={password.confirm} onChange={(event) => setPassword({ ...password, confirm: event.target.value })} /></label><button className="account-settings-save" type="submit"><LockKeyhole size={16} aria-hidden="true" />{busy ? "Updating…" : "Change password"}</button></fieldset></form>}
      {error && <p className="account-settings-error" role="alert">{error}</p>}{success && <p className="account-settings-success" role="status">{success}</p>}
    </dialog>, document.body)}
  </>;
}