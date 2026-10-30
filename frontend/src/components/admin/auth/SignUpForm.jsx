import { useI18n } from "../../../context/I18nContext";
import { Eye, EyeOff, User, Mail } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import PasswordRequirement from "./PasswordRequirement.jsx";
import api from "../../../services/api";

export default function SignUpForm({
  form,
  handleChange,
  handleSubmit,
  showPassword,
  setShowPassword,
  showConfirmPassword,
  setShowConfirmPassword,
  passwordChecks,
  loading,
}) {
  const { t } = useI18n();
  return (
    <form className="signup" onSubmit={handleSubmit}>
      <div className="gfield">
        <label htmlFor="name">{t("Username")}</label>
        <div className="gfield-input">
          <input
            id="name"
            type="text"
            placeholder={t("myusername")}
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value)}
            required
          />
          <User size={18} />
        </div>
      </div>

      <div className="gfield">
        <label htmlFor="signup_email">{t("Email")}</label>
        <div className="gfield-input">
          <input
            id="signup_email"
            type="email"
            placeholder={t("youremail@gmail.com")}
            value={form.email}
            onChange={(e) => handleChange("email", e.target.value)}
            required
          />
          <Mail size={18} />
        </div>
      </div>

      <div className="gfield">
        <label htmlFor="signup_password">{t("Password")}</label>
        <div className="gfield-input">
          <input
            id="signup_password"
            type={showPassword ? "text" : "password"}
            placeholder={t("Create a password")}
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

      <div className="gfield">
        <label htmlFor="confirm_password">{t("Confirm Password")}</label>
        <div className="gfield-input">
          <input
            id="confirm_password"
            type={showConfirmPassword ? "text" : "password"}
            placeholder={t("Confirm your password")}
            value={form.confirmPassword}
            onChange={(e) => handleChange("confirmPassword", e.target.value)}
            required
          />
          <button
            type="button"
            className="gfield-icon-btn"
            onClick={() => setShowConfirmPassword((s) => !s)}
            tabIndex={-1}
          >
            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <div className="password-requirements">
          <PasswordRequirement
            met={passwordChecks.length}
            label={t("At least 8 characters")}
          />
          <PasswordRequirement
            met={passwordChecks.uppercase && passwordChecks.lowercase}
            label={t("Uppercase and lowercase letters")}
          />
          <PasswordRequirement
            met={passwordChecks.number && passwordChecks.special}
            label={t("One number and one special character")}
          />
        </div>
      </div>

      <button type="submit" className="gcard-submit" disabled={loading}>
        {loading ? t("Please wait...") : t("Sign Up")}
      </button>

      <div className="gcard-divider">
        <span>{t("or")}</span>
      </div>
      <button
        type="button"
        className="gcard-google"
        disabled={loading}
        onClick={() => {
          window.location.href = `${api.defaults.baseURL}accounts/google/login/`;
        }}
      >
        <FcGoogle size={20} aria-hidden="true" />
        {t("Sign in with Google")}
      </button>
    </form>
  );
}
