import SignUpForm from "../../components/admin/auth/SignUpForm.jsx";
import SignInForm from "../../components/admin/auth/SignInForm.jsx";
import AuthHero from "../../components/admin/auth/AuthHero.jsx";
import AuthNavigation from "../../components/admin/auth/AuthNavigation.jsx";
import { useAuth } from "../../context/AuthContext";
import { useI18n } from "../../context/I18nContext";
import LanguageSwitcher from "../../components/LanguageSwitcher.jsx";
import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";

import heroCarImage from "../../assets/rently.png";

const HERO_IMAGE = heroCarImage;

export default function AdminAuth({ initialMode = "login" }) {
  const { t } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();
  const { login, signup } = useAuth();

  const [view, setView] = useState(
    initialMode === "signup" ? "signup" : "signin",
  );
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
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
          ? requestedPath + (from.search || "") + (from.hash || "")
          : "/";
        navigate(redirectTo, { replace: true });
      } else {
        const result = await signup({
          name: form.name,
          email: form.email,
          password: form.password,
        });
        navigate("/verify-email", {
          state: { email: result.email },
          replace: true,
        });
      }
    } catch (err) {
      if (view === "signin") {
        setError(
          err.response?.status === 401
            ? "Invalid username or password"
            : "Something went wrong. Please try again.",
        );
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
        <AuthNavigation view={view} switchView={switchView} />

        {/* Photo hero */}
        <AuthHero image={HERO_IMAGE} />

        {/* Form panel */}
        <div className="gcard-form">
          <div className="gcard-toolbar">
            <LanguageSwitcher />
          </div>
          <div className="gcard-form-top">
            {view === "signin" ? (
              <span>
                {t("Don't have an account?")}{" "}
                <button type="button" onClick={() => switchView("signup")}>
                  {t("Sign Up")}
                </button>
              </span>
            ) : (
              <span>
                {t("Already have an account?")}{" "}
                <button type="button" onClick={() => switchView("signin")}>
                  {t("Sign In")}
                </button>
              </span>
            )}
          </div>

          {error && (
            <div className="alert alert-error gcard-error">⚠️ {t(error)}</div>
          )}

          <div className="gcard-forms">
            {/* Formulaire de Connexion */}
            <SignInForm
              form={form}
              handleChange={handleChange}
              handleSubmit={handleSubmit}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              loading={loading}
              location={location}
            />

            {/* Formulaire d'Inscription */}
            <SignUpForm
              form={form}
              handleChange={handleChange}
              handleSubmit={handleSubmit}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              showConfirmPassword={showConfirmPassword}
              setShowConfirmPassword={setShowConfirmPassword}
              passwordChecks={passwordChecks}
              loading={loading}
            />
          </div>
          <Link to="/terms" className="auth-terms-link">
            {t("Terms & Conditions")}
          </Link>
        </div>
      </div>
    </div>
  );
}
