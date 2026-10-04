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
  Download,
  Lock,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import heroCarImage from "../../assets/rently.png";

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
  const navigate = useNavigate();
  const location = useLocation();
  const { login, signup } = useAuth();

  const [view, setView] = useState(initialMode === "signup" ? "signup" : "signin");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
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
        await login({ email: form.email, password: form.password });
        const redirectTo = location.state?.from?.pathname || "/admin";
        navigate(redirectTo, { replace: true });
      } else {
        await signup({ name: form.name, email: form.email, password: form.password });
        navigate("/verify-email", { state: { email: form.email }, replace: true });
      }
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
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
            <div className="gcard-nav-logo" />
          </li>

          <li>
            <button
              type="button"
              className={view === "signin" ? "active" : ""}
              onClick={() => switchView("signin")}
            >
              <LogIn size={18} strokeWidth={2} />
              <span>Sign In</span>
            </button>
          </li>

          <li>
            <button
              type="button"
              className={view === "signup" ? "active" : ""}
              onClick={() => switchView("signup")}
            >
              <UserPlus size={18} strokeWidth={2} />
              <span>Sign Up</span>
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
              <h2>Welcome back</h2>
              <p>Please enter your credentials</p>
              <a href="#" className="gcard-hero-terms">
                Terms &amp; Conditions
                <Download size={14} />
              </a>
            </div>

            <div className="gcard-hero-content signup">
              <h2>Join us today</h2>
              <p>Creating an account is quick</p>
              <a href="#" className="gcard-hero-terms">
                Terms &amp; Conditions
                <Download size={14} />
              </a>
            </div>
          </div>
        </div>

        {/* Form panel */}
        <div className="gcard-form">
          <div className="gcard-form-top">
            {view === "signin" ? (
              <span>
                Don't have an account?{" "}
                <button type="button" onClick={() => switchView("signup")}>Sign Up</button>
              </span>
            ) : (
              <span>
                Already have an account?{" "}
                <button type="button" onClick={() => switchView("signin")}>Sign In</button>
              </span>
            )}
          </div>

          {error && <div className="alert alert-error gcard-error">⚠️ {error}</div>}

          <div className="gcard-forms">
            {/* Formulaire de Connexion */}
            <form className="signin" onSubmit={handleSubmit}>
              <div className="gfield">
                <label htmlFor="email">Email</label>
                <div className="gfield-input">
                  <input
                    id="email"
                    type="email"
                    placeholder="youremail@gmail.com"
                    value={form.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    required
                  />
                  <Mail size={18} />
                </div>
              </div>

              <div className="gfield">
                <label htmlFor="password">Password</label>
                <div className="gfield-input">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
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
                  Forgot password?
                </Link>
              </div>

              <button type="submit" className="gcard-submit" disabled={loading}>
                {loading ? "Please wait..." : "Sign In"}
              </button>
            </form>

            {/* Formulaire d'Inscription */}
            <form className="signup" onSubmit={handleSubmit}>
              <div className="gfield">
                <label htmlFor="name">Username</label>
                <div className="gfield-input">
                  <input
                    id="name"
                    type="text"
                    placeholder="myusername"
                    value={form.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    required
                  />
                  <User size={18} />
                </div>
              </div>

              <div className="gfield">
                <label htmlFor="signup_email">Email</label>
                <div className="gfield-input">
                  <input
                    id="signup_email"
                    type="email"
                    placeholder="youremail@gmail.com"
                    value={form.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    required
                  />
                  <Mail size={18} />
                </div>
              </div>

              <div className="gfield">
                <label htmlFor="signup_password">Password</label>
                <div className="gfield-input">
                  <input
                    id="signup_password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
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
                <label htmlFor="confirm_password">Confirm Password</label>
                <div className="gfield-input">
                  <input
                    id="confirm_password"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
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
                  <PasswordRequirement met={passwordChecks.length} label="At least 8 characters" />
                  <PasswordRequirement met={passwordChecks.uppercase && passwordChecks.lowercase} label="Uppercase and lowercase letters" />
                  <PasswordRequirement met={passwordChecks.number && passwordChecks.special} label="One number and one special character" />
                </div>
              </div>

              <button type="submit" className="gcard-submit" disabled={loading}>
                {loading ? "Please wait..." : "Sign Up"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}