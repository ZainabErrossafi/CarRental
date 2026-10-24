import LanguageSwitcher from "../../components/LanguageSwitcher.jsx";
import { useI18n } from "../../context/I18nContext";
import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Check,
  LogIn,
  UserPlus,
  User,
  Mail,
  ArrowUpRight,
  Lock,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import heroCarImage from "../../assets/rently.png";
import { FcGoogle } from "react-icons/fc";

function PasswordRequirement({ met, label }) {
  return (
    <div className={`password-requirement ${met ? "met" : ""}`}>
      <span className="password-requirement-icon">
        <Check size={11} strokeWidth={3} />
      </span>
      {label}
    </div>
  );
}

const HERO_IMAGE = heroCarImage;

export default function AdminAuth({ initialMode = "login" }) {
  const { t } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();
  const { login, signup } = useAuth();

  const [view, setView] = useState(initialMode === "signup" ? "signup" : "signin");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [form, setForm] = useState({ name: "", username: "", email: "", password: "", confirmPassword: "" });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const passwordChecks = {
    length: form.password.length >= 8,
    uppercase: /[A-Z]/.test(form.password),
    lowercase: /[a-z]/.test(form.password),
    number: /[0-9]/.test(form.password),
    special: /[!@#$%^&*(),.?":{}|<>_\-+=]/.test(form.password),
    noSpaces: !/\s/.test(form.password),
    maxLength: form.password.length <= 64,
    match: form.password.length > 0 && form.password === form.confirmPassword,
  };

  const switchView = (next) => {
    setView(next);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (view === "signup") {
      const isPasswordValid = Object.values(passwordChecks).every(Boolean);
      if (!isPasswordValid) {
        if (!passwordChecks.match) {
          setError("Passwords do not match.");
        } else {
          setError("Please meet all password requirements.");
        }
        return;
      }
    }

    setLoading(true);
    try {
      if (view === "signin") {
        await login({ username: form.username, password: form.password });
        const from = location.state?.from;
        const requestedPath = from?.pathname;
        const redirectTo = /^\/vehicles\/[^/]+$/.test(requestedPath || "")
          ? requestedPath + (from.search || "") + (from.hash || "") : "/";
        navigate(redirectTo, { replace: true });
      } else {
        const result = await signup({ name: form.name, email: form.email, password: form.password });
        navigate("/verify-email", { state: { email: result.email }, replace: true });
      }
    } catch (err) {
      if (view === "signin") {
        setError(err.response?.status === 401
          ? "Invalid username or password"
          : "Something went wrong. Please try again.");
      } else {
        setError(err.message || "Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page auth-page-full">
      <div className={`gcard ${view}`}>
        {/* Icon rail */}
        <ul className="gcard-nav">
          <li className="gcard-nav-brand">
            <Link to="/" className="gcard-nav-logo" aria-label={t("Back to home")} />
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

        {/* Photo hero */}
        <div className="gcard-hero">
          <img src={HERO_IMAGE} alt="" className="gcard-hero-img" />
          <div className="gcard-hero-scrim" />

          <div className="gcard-hero-inner">
            <div className="gcard-hero-content signin">
              <h2>{t("Welcome back")}</h2>
              <p>{t("Please enter your credentials")}</p>
              <Link to="/terms" className="gcard-hero-terms">
                {t("Terms & Conditions")}
                <ArrowUpRight size={14} />
              </Link>
            </div>

            <div className="gcard-hero-content signup">
              <h2>{t("Join us today")}</h2>
              <p>{t("Creating an account is quick")}</p>
              <Link to="/terms" className="gcard-hero-terms">
                {t("Terms & Conditions")}
                <ArrowUpRight size={14} />
              </Link>
            </div>
          </div>
        </div>

        {/* Form panel */}
        <div className="gcard-form">
          <div className="gcard-toolbar">
            <LanguageSwitcher />
          </div>
          <div className="gcard-form-top">
            {view === "signin" ? (
              <span>
                {t("Don't have an account?")}{" "}
                <button type="button" onClick={() => switchView("signup")}>{t("Sign Up")}</button>
              </span>
            ) : (
              <span>
                {t("Already have an account?")}{" "}
                <button type="button" onClick={() => switchView("signin")}>{t("Sign In")}</button>
              </span>
            )}
          </div>

          {error && <div className="alert alert-error gcard-error">⚠️ {t(error)}</div>}

          <div className="gcard-forms">
            {/* Formulaire de Connexion */}
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

              {/* Forgot Password Link */}
              <div className="gfield-forgot">
                <Link to="/forgot-password" className="forgot-password-link">
                  {t("Forgot password?")}
                </Link>
              </div>

              <button type="submit" className="gcard-submit" disabled={loading}>
                {loading ? t("Please wait...") : t("Sign In")}
              </button>

              <div className="gcard-divider"><span>{t("or")}</span></div>
              <button
                type="button"
                className="gcard-google"
                disabled={loading}
                onClick={() => {
                  const from = location.state?.from;
                  if (/^\/vehicles\/[^/]+$/.test(from?.pathname || "")) {
                    sessionStorage.setItem("rently_booking_return", from.pathname + (from.search || "") + (from.hash || ""));
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

            {/* Formulaire d'Inscription */}
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

              {/* Champ Confirm Password */}
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
                  <PasswordRequirement met={passwordChecks.length} label={t("At least 8 characters")} />
                  <PasswordRequirement met={passwordChecks.uppercase && passwordChecks.lowercase} label={t("Uppercase and lowercase letters")} />
                  <PasswordRequirement met={passwordChecks.number && passwordChecks.special} label={t("One number and one special character")} />
                </div>
              </div>

              <button type="submit" className="gcard-submit" disabled={loading}>
                {loading ? t("Please wait...") : t("Sign Up")}
              </button>

              <div className="gcard-divider"><span>{t("or")}</span></div>
              <button
                type="button"
                className="gcard-google"
                disabled={loading}
                onClick={() => {
                  window.location.href = "https://localhost:8443/api/accounts/google/login/";
                }}
              >
                <FcGoogle size={20} aria-hidden="true" />
                {t("Sign in with Google")}
              </button>
            </form>
          </div>
          <Link to="/terms" className="auth-terms-link">{t("Terms & Conditions")}</Link>
        </div>
      </div>
    </div>
  );
}
