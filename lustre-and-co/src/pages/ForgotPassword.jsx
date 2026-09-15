import { useState } from "react";
import { ArrowLeft, ArrowRight, Mail, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function submit(event) {
    event.preventDefault();

    if (!email.trim()) return;

    setSubmitted(true);
  }

  return (
    <main className="auth-page">
      <section className="auth-layout">
        <div className="auth-brand-panel">
          <Link to="/" className="auth-logo">
            Lustre <b>&amp;</b> Co.
          </Link>

          <div className="auth-brand-copy">
            <span className="auth-kicker">
              <Sparkles size={14} />
              A little help
            </span>

            <h1>
              Find your way
              <br />
              <em>back to shine.</em>
            </h1>

            <p>
              Enter the email connected to your account and we’ll send you a
              secure link to reset your password.
            </p>
          </div>

          <div className="auth-brand-footer">
            <span>© 2026 Lustre &amp; Co.</span>
            <span>Secure account access.</span>
          </div>
        </div>

        <div className="auth-form-panel">
          <div className="auth-form-panel-top">
            <Link to="/" className="auth-mobile-logo">
              Lustre <b>&amp;</b> Co.
            </Link>

            <Link to="/account/login" className="auth-form-switch">
              Return to sign in
            </Link>
          </div>

          <div className="auth-form-content">
            {!submitted ? (
              <>
                <div className="auth-form-heading">
                  <span className="auth-form-eyebrow">Reset password</span>
                  <h2>Let’s get you back in.</h2>
                  <p>
                    We’ll send a password-reset link to your registered email
                    address.
                  </p>
                </div>

                <form className="auth-modern-form" onSubmit={submit}>
                  <label className="auth-field">
                    <span>Email address</span>
                    <div className="auth-input-wrap">
                      <Mail size={17} className="auth-input-icon" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder="you@example.com"
                      />
                    </div>
                  </label>

                  <button className="auth-submit-button" type="submit">
                    <span>Send reset link</span>
                    <ArrowRight size={17} />
                  </button>
                </form>
              </>
            ) : (
              <div className="auth-success-state">
                <div className="auth-success-icon">✓</div>
                <span className="auth-form-eyebrow">Check your inbox</span>
                <h2>Reset link sent.</h2>
                <p>
                  If an account exists for <strong>{email}</strong>, you’ll
                  receive a password reset link shortly.
                </p>

                <Link to="/account/login" className="button button-dark">
                  <ArrowLeft size={16} />
                  Return to sign in
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
