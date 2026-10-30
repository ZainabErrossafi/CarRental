import { useI18n } from "../../../context/I18nContext";
import { Link } from "react-router-dom";
import { LogIn, UserPlus } from "lucide-react";

export default function AuthNavigation({ view, switchView }) {
  const { t } = useI18n();
  return (
    <ul className="gcard-nav">
      <li className="gcard-nav-brand">
        <Link
          to="/"
          className="gcard-nav-logo"
          aria-label={t("Back to home")}
        />
      </li>

      <li>
        <button
          type="button"
          className={view === "signin" ? "active" : ""}
          onClick={() => switchView("signin")}
        >
          <LogIn size={18} strokeWidth={2} />
          <span>{t("Sign In")}</span>
        </button>
      </li>

      <li>
        <button
          type="button"
          className={view === "signup" ? "active" : ""}
          onClick={() => switchView("signup")}
        >
          <UserPlus size={18} strokeWidth={2} />
          <span>{t("Sign Up")}</span>
        </button>
      </li>

      <span className="gcard-nav-indicator" />
    </ul>
  );
}
