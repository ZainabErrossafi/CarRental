import { sanitizeName, sanitizeUsername } from "../../../utils/name";
import { sanitizePhone } from "../../../utils/phone";
import { useI18n } from "../../../context/I18nContext";
import { Eye, EyeOff, User, Mail, Phone } from "lucide-react";
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
      <div className="signup-heading">
        <span className="signup-eyebrow">RENTLY</span>
        <h1>{t("Create your account")}</h1>
        <p>{t("Your next journey starts here.")}</p>
      </div>
      <div className="signup-fields">
      <div className="gfield">
        <label htmlFor="signup_first_name">{t("First name")}</label>
        <div className="gfield-input">
          <input
            id="signup_first_name"
            name="first_name"
            type="text"
            placeholder={t("First name")}
            autoComplete="given-name"
            maxLength={150}
            value={form.first_name}
            onChange={(e) => handleChange("first_name", sanitizeName(e.target.value))}
            required
          />
          <User size={18} />
        </div>
      </div>

      <div className="gfield">
        <label htmlFor="signup_last_name">{t("Last name")}</label>
        <div className="gfield-input">
          <input
            id="signup_last_name"
            name="last_name"
            type="text"
            placeholder={t("Last name")}
            autoComplete="family-name"
            maxLength={150}
            value={form.last_name}
            onChange={(e) => handleChange("last_name", sanitizeName(e.target.value))}
            required
          />
          <User size={18} />
        </div>
      </div>

      <div className="gfield signup-wide">
        <label htmlFor="name">{t("Username")}</label>
        <div className="gfield-input">
          <input
            id="name"
            autoComplete="username"
            type="text"
            placeholder={t("myusername")}
            value={form.name}
            onChange={(e) => handleChange("name", sanitizeUsername(e.target.value))}
            required
          />
          <User size={18} />
        </div>
      </div>

      <div className="gfield">
        <label htmlFor="signup_phone">{t("Phone")}</label>
        <div className="gfield-input">
          <input
            id="signup_phone"
            name="phone"
            type="tel"
            pattern="[+]?[0-9]+"
            autoComplete="tel"
            placeholder="+212600000000"
            maxLength={20}
            value={form.phone}
            onChange={(e) => handleChange("phone", sanitizePhone(e.target.value))}
            required
          />
          <Phone size={18} />
        </div>
      </div>

      <div className="gfield">
        <label htmlFor="signup_email">{t("Email")}</label>
        <div className="gfield-input">
          <input
            id="signup_email"
            autoComplete="email"
            type="email"
            placeholder={t("youremail@gmail.com")}
            value={form.email}
            onChange={(e) => handleChange("email", e.target.value)}
            required
          />
          <Mail size={18} />
        </div>
      </div>

      <div className="gfield signup-wide">
        <label htmlFor="signup_password">{t("Password")}</label>
        <div className="gfield-input">
          <input
            id="signup_password"
            autoComplete="new-password"
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
            aria-label={t("Show password")}
            aria-pressed={showPassword}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      <div className="gfield signup-wide">
        <label htmlFor="confirm_password">{t("Confirm Password")}</label>
        <div className="gfield-input">
          <input
            id="confirm_password"
            autoComplete="new-password"
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
            aria-label={t("Show password")}
            aria-pressed={showConfirmPassword}
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
        {t("Continue with Google")}
      </button>
    </form>
  );
}
