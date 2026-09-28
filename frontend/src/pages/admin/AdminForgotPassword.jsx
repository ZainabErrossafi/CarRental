import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, KeyRound, Check } from "lucide-react";

export default function AdminForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // No real backend yet — just simulate the request being sent.
    await new Promise((res) => setTimeout(res, 500));

    setLoading(false);
    setSent(true);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="logo-dot" />
        </div>

        <h1 className="auth-title">
          {sent ? "Check your email" : "Forgot password?"}
        </h1>
        <p className="auth-subtitle">
          {sent
            ? `We've sent password reset instructions to ${email}.`
            : "No worries, we'll send you reset instructions."}
        </p>

        {!sent && (
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
              {loading ? "Sending..." : "Reset password"}
            </button>
          </form>
        )}

        {sent && (
          <button
            type="button"
            className="btn btn-secondary auth-submit"
            onClick={() => setSent(false)}
          >
            <KeyRound size={16} />
            Try another email
          </button>
        )}

        <p className="auth-footer">
          <Link to="/login" className="auth-link" style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
            <ArrowLeft size={15} />
            Back to log in
          </Link>
        </p>
      </div>
    </div>
  );
}