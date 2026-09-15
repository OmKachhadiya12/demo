import { useMemo, useState } from "react";
import {
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  Facebook,
  Heart,
  Instagram,
  LockKeyhole,
  Mail,
  Sparkles,
  UserRound
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useStore } from "../context/StoreContext";

const benefits = [
  "Save your favorite pieces",
  "Track orders effortlessly",
  "Enjoy a faster checkout"
];

function getPasswordStrength(password) {
  if (!password) {
    return {
      label: "",
      level: 0,
      className: ""
    };
  }

  let score = 0;

  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  if (score <= 1) {
    return {
      label: "Weak password",
      level: 1,
      className: "weak"
    };
  }

  if (score === 2) {
    return {
      label: "Fair password",
      level: 2,
      className: "fair"
    };
  }

  if (score === 3) {
    return {
      label: "Good password",
      level: 3,
      className: "good"
    };
  }

  return {
    label: "Strong password",
    level: 4,
    className: "strong"
  };
}

function FloatingJewelryScene() {
  return (
    <div className="auth-visual-scene" aria-hidden="true">
      <div className="auth-glow auth-glow-one" />
      <div className="auth-glow auth-glow-two" />

      <motion.div
        className="auth-orbit auth-orbit-one"
        animate={{ rotate: 360 }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: "linear"
        }}
      />

      <motion.div
        className="auth-orbit auth-orbit-two"
        animate={{ rotate: -360 }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "linear"
        }}
      />

      <motion.div
        className="auth-floating-pearl pearl-one"
        animate={{ y: [0, -15, 0], rotate: [0, 12, 0] }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      <motion.div
        className="auth-floating-pearl pearl-two"
        animate={{ y: [0, 18, 0], rotate: [0, -18, 0] }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.7
        }}
      />

      <motion.div
        className="auth-floating-pearl pearl-three"
        animate={{ y: [0, -10, 0], x: [0, 8, 0] }}
        transition={{
          duration: 4.5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1.2
        }}
      />

      <motion.div
        className="auth-jewelry-card"
        animate={{
          y: [0, -8, 0],
          rotateZ: [-2, 2, -2]
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <div className="auth-card-shine" />

        <div className="auth-card-chain auth-chain-one" />
        <div className="auth-card-chain auth-chain-two" />

        <div className="auth-card-jewel">
          <div className="auth-card-jewel-core" />
        </div>

        <div className="auth-card-label">
          <span>THE LUSTRE EDIT</span>
          <strong>Made to shine.</strong>
        </div>
      </motion.div>

      <div className="auth-scene-caption">
        <Sparkles size={16} />
        <span>Everyday elegance, made personal.</span>
      </div>
    </div>
  );
}

function InputField({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  icon: Icon,
  error,
  children
}) {
  return (
    <label className={`auth-field ${error ? "has-error" : ""}`}>
      <span>{label}</span>

      <div className="auth-input-wrap">
        {Icon && <Icon size={17} className="auth-input-icon" />}

        <input
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={name}
        />

        {children}
      </div>

      {error && <small className="auth-field-error">{error}</small>}
    </label>
  );
}

export default function Auth({ mode = "login" }) {
  const isLogin = mode === "login";
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register, showToast } = useStore();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    remember: true
  });

  const [touched, setTouched] = useState({});

  const strength = useMemo(
    () => getPasswordStrength(form.password),
    [form.password]
  );

  const errors = useMemo(() => {
    const next = {};

    if (!isLogin && !form.name.trim()) {
      next.name = "Please enter your name.";
    }

    if (!form.email.trim()) {
      next.email = "Please enter your email address.";
    } else if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      next.email = "Please enter a valid email address.";
    }

    if (!form.password) {
      next.password = "Please enter your password.";
    } else if (!isLogin && form.password.length < 8) {
      next.password = "Use at least 8 characters.";
    }

    if (!isLogin && form.confirmPassword !== form.password) {
      next.confirmPassword = "Passwords do not match.";
    }

    return next;
  }, [form, isLogin]);

  function updateField(event) {
    const { name, value, type, checked } = event.target;

    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value
    }));

    setFormError("");
  }

  function markTouched(field) {
    setTouched((current) => ({
      ...current,
      [field]: true
    }));
  }

  async function submit(event) {
    event.preventDefault();

    setTouched({
      name: true,
      email: true,
      password: true,
      confirmPassword: true
    });

    if (Object.keys(errors).length > 0) {
      setFormError("Please review the highlighted fields.");
      return;
    }

    setIsSubmitting(true);

    try {
      if (isLogin) {
        await login({
          email: form.email,
          password: form.password,
        });
      } else {
        await register({
          name: form.name,
          email: form.email,
          password: form.password,
        });
      }

      setIsSubmitting(false);
      navigate(location.state?.from || "/account", { replace: true });
    } catch (err) {
      setIsSubmitting(false);
      setFormError(err.userMessage || "Authentication failed. Please check your credentials.");
    }
  }

  function socialLogin(provider) {
    login({
      name: "Lustre Member",
      email: `${provider.toLowerCase()}@example.com`
    });

    showToast(`Signed in with ${provider}.`, "success");
    navigate("/account");
  }

  return (
    <main className="auth-page">
      <div className="auth-page-background">
        <span className="auth-bg-shape auth-bg-shape-one" />
        <span className="auth-bg-shape auth-bg-shape-two" />
        <span className="auth-bg-shape auth-bg-shape-three" />
      </div>

      <section className="auth-layout">
        <motion.div
          className="auth-brand-panel"
          initial={{ opacity: 0, x: -28 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.65, ease: "easeOut" }}
        >
          <Link to="/" className="auth-logo">
            Lustre <b>&amp;</b> Co.
          </Link>

          <div className="auth-brand-copy">
            <span className="auth-kicker">
              <Sparkles size={14} />
              The Lustre experience
            </span>

            <h1>
              Your style,
              <br />
              <em>your shine.</em>
            </h1>

            <p>
              Save the pieces that make you feel beautiful, follow every order,
              and make your next moment shine a little brighter.
            </p>

            <div className="auth-benefit-list">
              {benefits.map((benefit) => (
                <div key={benefit}>
                  <span>
                    <Check size={13} />
                  </span>
                  {benefit}
                </div>
              ))}
            </div>
          </div>

          <FloatingJewelryScene />

          <div className="auth-brand-footer">
            <span>© 2026 Lustre &amp; Co.</span>
            <span>Everyday elegance, made to shine.</span>
          </div>
        </motion.div>

        <motion.div
          className="auth-form-panel"
          initial={{ opacity: 0, x: 28 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.65, delay: 0.1, ease: "easeOut" }}
        >
          <div className="auth-form-panel-top">
            <Link to="/" className="auth-mobile-logo">
              Lustre <b>&amp;</b> Co.
            </Link>

            <div className="auth-form-switch">
              <span>{isLogin ? "New here?" : "Already a member?"}</span>
              <Link to={isLogin ? "/account/signup" : "/account/login"}>
                {isLogin ? "Create an account" : "Sign in"}
              </Link>
            </div>
          </div>

          <div className="auth-form-content">
            <div className="auth-form-heading">
              <span className="auth-form-eyebrow">
                {isLogin ? "Welcome back" : "Join the community"}
              </span>

              <h2>{isLogin ? "Sign in to your world." : "Create your account."}</h2>

              <p>
                {isLogin
                  ? "Access your saved pieces, orders, and personal details."
                  : "Keep your favorite pieces close and make checkout effortless."}
              </p>
            </div>

            <div className="auth-social-row">
              <button
                type="button"
                className="auth-social-button"
                onClick={() => socialLogin("Google")}
              >
                <span className="google-mark">G</span>
                Google
              </button>

              <button
                type="button"
                className="auth-social-button"
                onClick={() => socialLogin("Facebook")}
              >
                <Facebook size={16} />
                Facebook
              </button>
            </div>

            <div className="auth-divider">
              <span>or continue with email</span>
            </div>

            <form className="auth-modern-form" onSubmit={submit} noValidate>
              {!isLogin && (
                <InputField
                  label="Full name"
                  name="name"
                  value={form.name}
                  onChange={updateField}
                  placeholder="Your full name"
                  icon={UserRound}
                  error={touched.name ? errors.name : ""}
                />
              )}

              <InputField
                label="Email address"
                name="email"
                type="email"
                value={form.email}
                onChange={updateField}
                placeholder="you@example.com"
                icon={Mail}
                error={touched.email ? errors.email : ""}
              />

              <InputField
                label="Password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={updateField}
                onBlur={() => markTouched("password")}
                placeholder="Enter your password"
                icon={LockKeyhole}
                error={touched.password ? errors.password : ""}
              >
                <button
                  type="button"
                  className="auth-password-toggle"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </InputField>

              {!isLogin && (
                <div className="auth-password-area">
                  <InputField
                    label="Confirm password"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={form.confirmPassword}
                    onChange={updateField}
                    onBlur={() => markTouched("confirmPassword")}
                    placeholder="Repeat your password"
                    icon={LockKeyhole}
                    error={
                      touched.confirmPassword ? errors.confirmPassword : ""
                    }
                  >
                    <button
                      type="button"
                      className="auth-password-toggle"
                      onClick={() =>
                        setShowConfirmPassword((visible) => !visible)
                      }
                      aria-label={
                        showConfirmPassword
                          ? "Hide confirm password"
                          : "Show confirm password"
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={17} />
                      ) : (
                        <Eye size={17} />
                      )}
                    </button>
                  </InputField>

                  {form.password && (
                    <div className={`password-strength ${strength.className}`}>
                      <div className="password-strength-bars">
                        {[1, 2, 3, 4].map((bar) => (
                          <span
                            key={bar}
                            className={bar <= strength.level ? "filled" : ""}
                          />
                        ))}
                      </div>
                      <small>{strength.label}</small>
                    </div>
                  )}
                </div>
              )}

              {isLogin && (
                <div className="auth-options-row">
                  <label className="auth-checkbox">
                    <input
                      type="checkbox"
                      name="remember"
                      checked={form.remember}
                      onChange={updateField}
                    />
                    <span>Remember me</span>
                  </label>

                  <Link to="/account/forgot-password">
                    Forgot password?
                  </Link>
                </div>
              )}

              {!isLogin && (
                <label className="auth-checkbox auth-terms-checkbox">
                  <input type="checkbox" required />
                  <span>
                    I agree to the <a href="#terms">Terms</a> and{" "}
                    <a href="#privacy">Privacy Policy</a>.
                  </span>
                </label>
              )}

              {formError && <p className="auth-form-error">{formError}</p>}

              <button
                className="auth-submit-button"
                type="submit"
                disabled={isSubmitting}
              >
                <span>
                  {isSubmitting
                    ? "Preparing your account..."
                    : isLogin
                      ? "Sign in"
                      : "Create account"}
                </span>
                {!isSubmitting && <ArrowRight size={17} />}
              </button>
            </form>

            <p className="auth-bottom-note">
              {isLogin ? (
                <>
                  New to Lustre &amp; Co.?{" "}
                  <Link to="/account/signup">Create an account</Link>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <Link to="/account/login">Sign in here</Link>
                </>
              )}
            </p>
          </div>

          <div className="auth-form-footer">
            <span>Secure account access</span>
            <span className="auth-footer-icons">
              <LockKeyhole size={13} />
              <Heart size={13} />
              <Instagram size={13} />
            </span>
          </div>
        </motion.div>
      </section>
    </main>
  );
}