import { useI18n } from "../../../context/I18nContext";
import { Link } from "react-router-dom";
import { Eye, EyeOff, User } from "lucide-react";
import { FcGoogle } from "react-icons/fc";

export default function SignInForm({
  form,
  handleChange,
  handleSubmit,
  showPassword,
  setShowPassword,
  loading,
  location,
}) {
  const { t } = useI18n();
  return (
    <form className="signin" onSubmit={handleSubmit}>
      <div className="gfield">
        <label htmlFor="username">{t("Username")}</label>
        <div className="gfield-input">
          <input
            id="username"
            type="text"
            autoComplete="username"
            placeholder={t("myusername")}
            value={form.username}
            onChange={(e) => handleChange("username", e.target.value)}
            required
          />
          <User size={18} />
        </div>
      </div>

      <div className="gfield">
        <label htmlFor="password">{t("Password")}</label>
        <div className="gfield-input">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder={t("Enter your password")}
            value={form.password}
            onChange={(e) => handleChange("password", e.target.value)}
            required
          />
          <button
            type="button"
            className="gfield-icon-btn"
            onClick={() => setShowPassword((s) => !s)}
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      <div className="gfield-forgot">
        <Link to="/forgot-password" className="forgot-password-link">
          {t("Forgot password?")}
        </Link>
      </div>

      <button type="submit" className="gcard-submit" disabled={loading}>
        {loading ? t("Please wait...") : t("Sign In")}
      </button>

      <div className="gcard-divider">
        <span>{t("or")}</span>
      </div>
      <button
        type="button"
        className="gcard-google"
        disabled={loading}
        onClick={() => {
          const from = location.state?.from;
          if (/^\/vehicles\/[^/]+$/.test(from?.pathname || "")) {
            sessionStorage.setItem(
              "rently_booking_return",
              from.pathname + (from.search || "") + (from.hash || ""),
            );
          } else {
            sessionStorage.removeItem("rently_booking_return");
          }
          window.location.href = "/api/accounts/google/login/";
        }}
      >
        <FcGoogle size={20} aria-hidden="true" />
        {t("Sign in with Google")}
      </button>
    </form>
  );
}
