import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Eye, EyeOff, Check } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function AdminAuth({ initialMode = "login" }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, signup } = useAuth();

  const [mode, setMode] = useState(initialMode); // "login" | "signup"
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const passwordChecks = {
    length: form.password.length >= 8,
    special: /[!@#$%^&*(),.?":{}|<>_\-+=]/.test(form.password),
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (mode === "signup" && (!passwordChecks.length || !passwordChecks.special)) {
      setError("Please meet all password requirements.");
      return;
    }

    setLoading(true);

    try {
      if (mode === "login") {
        await login({ email: form.email, password: form.password });
        const redirectTo = location.state?.from?.pathname || "/admin";
        navigate(redirectTo, { replace: true });
      } else {
        await signup({ name: form.name, email: form.email, password: form.password });
        navigate("/verify-email", { replace: true, state: { email: form.email } });
      }
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="logo-dot" />
        </div>

        <h1 className="auth-title">
          {mode === "login" ? "Log in to your account" : "Create an account"}
        </h1>
        <p className="auth-subtitle">
          {mode === "login"
            ? "Welcome back! Please enter your details."
            : "Start managing your fleet in minutes."}
        </p>

        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab ${mode === "signup" ? "active" : ""}`}
            onClick={() => { setMode("signup"); setError(null); }}
          >
            Sign up
          </button>
          <button
            type="button"
            className={`auth-tab ${mode === "login" ? "active" : ""}`}
            onClick={() => { setMode("login"); setError(null); }}
          >
            Log in
          </button>
        </div>

        {error && <div className="alert alert-error mb-4">⚠️ {error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          {mode === "signup" && (
            <div className="form-field">
              <label htmlFor="name">Full name</label>
              <input
                id="name"
                type="text"
                placeholder="Enter your name"
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                required
              />
            </div>
          )}

          <div className="form-field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="password">Password</label>
            <div className="password-field">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder={mode === "signup" ? "Create a password" : "Enter your password"}
                value={form.password}
                onChange={(e) => handleChange("password", e.target.value)}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((s) => !s)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {mode === "signup" && (
              <div className="password-requirements">
                <PasswordRequirement
                  met={form.password.length >= 8}
                  label="Must be at least 8 characters"
                />
                <PasswordRequirement
                  met={/[!@#$%^&*(),.?":{}|<>_\-+=]/.test(form.password)}
                  label="Must contain one special character"
                />
              </div>
            )}
          </div>

          {mode === "login" && (
            <div className="auth-row">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                Remember for 30 days
              </label>
              <Link to="/forgot-password" className="auth-link">Forgot password</Link>
            </div>
          )}

          <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
            {loading ? "Please wait..." : mode === "login" ? "Sign in" : "Get started"}
          </button>

          <button type="button" className="btn btn-secondary auth-google">
            <GoogleIcon />
            {mode === "login" ? "Sign in with Google" : "Sign up with Google"}
          </button>
        </form>

        <p className="auth-footer">
          {mode === "login" ? (
            <>Don't have an account? <button className="auth-link" onClick={() => { setMode("signup"); setError(null); }}>Sign up</button></>
          ) : (
            <>Already have an account? <button className="auth-link" onClick={() => { setMode("login"); setError(null); }}>Log in</button></>
          )}
        </p>
      </div>
    </div>
  );
}

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

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M23.52 12.27c0-.85-.08-1.66-.22-2.45H12v4.64h6.48c-.28 1.5-1.13 2.77-2.4 3.62v3.01h3.88c2.27-2.09 3.56-5.17 3.56-8.82z"/>
      <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.95-2.91l-3.88-3.01c-1.08.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.27v3.11C3.25 21.3 7.31 24 12 24z"/>
      <path fill="#FBBC05" d="M5.27 14.27c-.24-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.62H1.27C.46 8.24 0 10.06 0 12s.46 3.76 1.27 5.38l4-3.11z"/>
      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.7 1.27 6.62l4 3.11c.95-2.85 3.6-4.98 6.73-4.98z"/>
    </svg>
  );
}