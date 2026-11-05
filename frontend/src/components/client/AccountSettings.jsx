import { useRef, useState } from "react";
import { UserRound, X, LockKeyhole, ShieldCheck, KeyRound } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import AccountProfile from "./AccountProfile.jsx";
import AccountPassword from "./AccountPassword.jsx";
import AccountTwoFactor from "./AccountTwoFactor.jsx";
import AccountPublicApi from "./AccountPublicApi.jsx";

const tabs = [
  { id: "profile", label: "Profile", Icon: UserRound },
  { id: "password", label: "Password", Icon: LockKeyhole },
  { id: "two-factor", label: "2FA", Icon: ShieldCheck },
  { id: "public-api", label: "Public API", Icon: KeyRound },
];

export default function AccountSettings({ overlay }) {
  const { user } = useAuth();
  const dialog = useRef(null);
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("profile");
  const [busy, setBusy] = useState(false);
  const canChangePassword = user.canChangePassword !== false;

  const show = () => {
    setTab("profile");
    setOpen(true);
    dialog.current.showModal();
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
        ref={dialog}
        className="account-settings-dialog"
        aria-labelledby="account-settings-title"
        onCancel={(event) => {
          if (busy) event.preventDefault();
        }}
        onClose={() => setOpen(false)}
      >
        <header>
          <div>
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
          {tabs
            .filter((item) => item.id !== "password" || canChangePassword)
            .map(({ id, label, Icon }) => (
              <button key={id} type="button" disabled={busy} aria-pressed={tab === id} onClick={() => setTab(id)}>
                <Icon size={15} aria-hidden="true" />
                {label}
              </button>
            ))}
        </div>
        {open && tab === "profile" && <AccountProfile onBusy={setBusy} />}
        {open && tab === "password" && canChangePassword && <AccountPassword onBusy={setBusy} />}
        {open && tab === "two-factor" && <AccountTwoFactor onBusy={setBusy} />}
        {open && tab === "public-api" && <AccountPublicApi onBusy={setBusy} />}
      </dialog>
    </>
  );
}
