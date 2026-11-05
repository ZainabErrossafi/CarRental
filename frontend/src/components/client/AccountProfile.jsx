import { useRef, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api.js";
import { Save } from "lucide-react";
import { sanitizeName } from "../../utils/name";

export default function AccountProfile({ onBusy }) {
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
  const [profile, setProfile] = useState({
    username: user.username || "",
    first_name: user.first_name || "",
    last_name: user.last_name || "",
    phone: user.phone || "",
  });
  const changeProfile = (field, value) => setProfile({ ...profile, [field]: value });
  const saveProfile = async (event) => {
    event.preventDefault();
    if (inFlight.current) return;
    if (!profile.username.trim() || !profile.first_name.trim() || !profile.last_name.trim() || !profile.phone.trim()) {
      setError("Please fill in your username, first name, last name and phone.");
      return;
    }
    return runUpdate(
      async () => {
        await api.patch(`users/${user.id}/`, {
          username: profile.username.trim(),
          first_name: profile.first_name.trim(),
          last_name: profile.last_name.trim(),
          phone: profile.phone.trim(),
        });
        await refreshUser();
      },
      "Your information has been updated.",
      "Could not update your information.",
    );
  };
  return (
    <>
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
