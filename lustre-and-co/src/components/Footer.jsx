import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Clock,
  CreditCard,
  Facebook,
  Heart,
  Instagram,
  Lock,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Truck,
  Youtube
} from "lucide-react";
import { useStore } from "../context/StoreContext";

export default function Footer() {
  const { showToast } = useStore();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  function handleSubscribe(e) {
    e.preventDefault();
    if (!email.trim()) return;

    setSubscribed(true);
    if (showToast) {
      showToast("Welcome to Lustre & Co.! Use code SHINE10 for 10% off.", "success");
    }
  }

  function handleCopyPromo() {
    if (navigator.clipboard) {
      navigator.clipboard.writeText("SHINE10");
      setCopiedCode(true);
      if (showToast) {
        showToast("Coupon code SHINE10 copied to clipboard!", "success");
      }
      setTimeout(() => setCopiedCode(false), 3000);
    }
  }

  return (
    <footer className="luxury-footer" role="contentinfo">
      {/* 1. Newsletter Ribbon Section */}
      <div className="footer-newsletter-section">
        <div className="footer-container">
          <div className="footer-newsletter-card">
            <div className="newsletter-glow" aria-hidden="true" />

            <div className="newsletter-text-col">
              <span className="newsletter-kicker">
                <Sparkles size={13} />
                THE LUSTRE CLUB
              </span>
              <h2 className="newsletter-heading">
                Get <em>10% Off</em> Your First Order
              </h2>
              <p className="newsletter-description">
                Subscribe to receive early access to new jewelry drops, seasonal styling
                edits, and private VIP member events.
              </p>
            </div>

            <div className="newsletter-form-col">
              {!subscribed ? (
                <form className="newsletter-form" onSubmit={handleSubscribe} noValidate>
                  <div className="newsletter-input-group">
                    <Mail size={18} className="newsletter-mail-icon" />
                    <input
                      type="email"
                      required
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      aria-label="Email address for 10% discount newsletter"
                    />
                    <button type="submit" className="newsletter-submit-btn">
                      <span>Claim 10% Off</span>
                      <ArrowRight size={15} />
                    </button>
                  </div>
                  <span className="newsletter-disclaimer">
                    By signing up, you agree to our{" "}
                    <Link to="/privacy" className="footer-inline-link">
                      Privacy Policy
                    </Link>
                    . Unsubscribe anytime.
                  </span>
                </form>
              ) : (
                <div className="newsletter-success-box">
                  <div className="success-icon-wrap">
                    <CheckCircle2 size={24} />
                  </div>
                  <div className="success-text">
                    <strong>You’re on the VIP list!</strong>
                    <p>
                      Use code{" "}
                      <button
                        type="button"
                        className="promo-copy-tag"
                        onClick={handleCopyPromo}
                        title="Click to copy promo code"
                      >
                        SHINE10 {copiedCode ? "✓ Copied" : "📋 Copy"}
                      </button>{" "}
                      at checkout for 10% off.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Footer Links & Information Grid */}
      <div className="footer-main-section">
        <div className="footer-container">
          <div className="footer-columns-grid">
            {/* Column 1: Brand Logo, Description & Socials */}
            <div className="footer-col footer-col-brand">
              <Link to="/" className="footer-brand-logo" aria-label="Lustre and Co. Home">
                <span className="logo-word">Lustre</span>
                <span className="logo-amp">&amp;</span>
                <span className="logo-word">Co.</span>
              </Link>

              <p className="footer-brand-bio">
                Modern imitation jewelry crafted for everyday elegance, memorable celebrations,
                and timeless gifting. Designed with hypoallergenic materials, 18K gold tones,
                and enduring brilliance.
              </p>

              <div className="footer-badges-pill">
                <span>✦ Skin-Friendly</span>
                <span>✦ Anti-Tarnish</span>
                <span>✦ Nickel-Free</span>
              </div>

              {/* Social Media Icons */}
              <div className="footer-social-wrapper">
                <span className="social-label">Follow Our Journey</span>
                <div className="footer-social-links">
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Follow Lustre & Co. on Instagram"
                    className="social-icon-btn"
                  >
                    <Instagram size={17} />
                  </a>
                  <a
                    href="https://facebook.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Follow Lustre & Co. on Facebook"
                    className="social-icon-btn"
                  >
                    <Facebook size={17} />
                  </a>
                  <a
                    href="https://youtube.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Watch Lustre & Co. on YouTube"
                    className="social-icon-btn"
                  >
                    <Youtube size={17} />
                  </a>
                  <a
                    href="https://wa.me"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Chat with Lustre & Co. on WhatsApp"
                    className="social-icon-btn"
                  >
                    <MessageCircle size={17} />
                  </a>
                </div>
              </div>
            </div>

            {/* Column 2: Shopping Links */}
            <div className="footer-col">
              <h3 className="footer-col-title">Shopping</h3>
              <ul className="footer-links-list">
                <li>
                  <Link to="/shop">Shop All Jewelry</Link>
                </li>
                <li>
                  <Link to="/new-arrivals">New Arrivals</Link>
                </li>
                <li>
                  <Link to="/best-sellers">Best Sellers</Link>
                </li>
                <li>
                  <Link to="/category/necklaces">Necklaces &amp; Pendants</Link>
                </li>
                <li>
                  <Link to="/category/earrings">Earrings &amp; Studs</Link>
                </li>
                <li>
                  <Link to="/category/rings">Solitaire &amp; Eternity Rings</Link>
                </li>
                <li>
                  <Link to="/category/bracelets">Bracelets &amp; Bangles</Link>
                </li>
                <li>
                  <Link to="/collections/bridal">Bridal &amp; Festive Edit</Link>
                </li>
                <li>
                  <Link to="/collections/sale" className="footer-sale-link">
                    Sale &amp; Special Offers
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Customer Service */}
            <div className="footer-col">
              <h3 className="footer-col-title">Customer Service</h3>
              <ul className="footer-links-list">
                <li>
                  <Link to="/track-order">Track Your Order</Link>
                </li>
                <li>
                  <Link to="/shipping-returns">Shipping &amp; Delivery</Link>
                </li>
                <li>
                  <Link to="/shipping-returns#returns">Easy 7-Day Returns</Link>
                </li>
                <li>
                  <Link to="/jewelry-care">Jewelry Care Guide</Link>
                </li>
                <li>
                  <Link to="/faq">Frequently Asked Questions</Link>
                </li>
                <li>
                  <Link to="/account">My Account &amp; Orders</Link>
                </li>
                <li>
                  <Link to="/wishlist">Saved Wishlist</Link>
                </li>
                <li>
                  <Link to="/contact">Help &amp; Support</Link>
                </li>
              </ul>
            </div>

            {/* Column 4: About the Brand */}
            <div className="footer-col">
              <h3 className="footer-col-title">About the Brand</h3>
              <ul className="footer-links-list">
                <li>
                  <Link to="/about">Our Story &amp; Heritage</Link>
                </li>
                <li>
                  <Link to="/about#materials">Hypoallergenic Metals</Link>
                </li>
                <li>
                  <Link to="/about#craftsmanship">Artisanal Craftsmanship</Link>
                </li>
                <li>
                  <Link to="/about#sustainability">Sustainable Packaging</Link>
                </li>
                <li>
                  <Link to="/account">Lustre VIP Rewards</Link>
                </li>
                <li>
                  <Link to="/about#press">Press &amp; Editorial</Link>
                </li>
                <li>
                  <Link to="/contact">Studio Appointments</Link>
                </li>
              </ul>
            </div>

            {/* Column 5: Contact Information */}
            <div className="footer-col footer-col-contact">
              <h3 className="footer-col-title">Contact Us</h3>
              <div className="footer-contact-list">
                <div className="footer-contact-item">
                  <Mail size={16} className="contact-icon" />
                  <div>
                    <span className="contact-sub">Client Concierge</span>
                    <a href="mailto:concierge@lustreandco.com" className="contact-main">
                      concierge@lustreandco.com
                    </a>
                  </div>
                </div>

                <div className="footer-contact-item">
                  <Phone size={16} className="contact-icon" />
                  <div>
                    <span className="contact-sub">Phone Support</span>
                    <a href="tel:+15552345878" className="contact-main">
                      +1 (555) 234-LUSTRE
                    </a>
                  </div>
                </div>

                <div className="footer-contact-item">
                  <MapPin size={16} className="contact-icon" />
                  <div>
                    <span className="contact-sub">Design Studio</span>
                    <address className="contact-address">
                      742 Evergreen Terrace, Suite 4B
                      <br />
                      San Francisco, CA 94107
                    </address>
                  </div>
                </div>

                <div className="footer-contact-item">
                  <Clock size={16} className="contact-icon" />
                  <div>
                    <span className="contact-sub">Concierge Hours</span>
                    <span className="contact-hours">Mon – Sat: 9:00 AM – 7:00 PM EST</span>
                  </div>
                </div>

                <div className="concierge-live-badge">
                  <span className="live-pulse-dot" />
                  <span>Concierge Team Online</span>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Payment Methods & Security Trust Row */}
          <div className="footer-trust-row">
            <div className="footer-trust-security">
              <div className="trust-security-badge">
                <Lock size={15} />
                <span>256-Bit SSL Encrypted Checkout</span>
              </div>
              <div className="trust-security-badge">
                <ShieldCheck size={15} />
                <span>100% Quality Guaranteed</span>
              </div>
              <div className="trust-security-badge">
                <Truck size={15} />
                <span>Free Tracked Delivery over $50</span>
              </div>
              <div className="trust-security-badge">
                <RotateCcw size={15} />
                <span>7-Day Doorstep Returns</span>
              </div>
            </div>

            {/* Secure Payment Badges */}
            <div className="footer-payment-methods" aria-label="Accepted Payment Methods">
              <div className="payment-badge" title="Visa">
                <span className="payment-text">VISA</span>
              </div>
              <div className="payment-badge" title="Mastercard">
                <span className="payment-text">Mastercard</span>
              </div>
              <div className="payment-badge" title="American Express">
                <span className="payment-text">AMEX</span>
              </div>
              <div className="payment-badge" title="PayPal">
                <span className="payment-text">PayPal</span>
              </div>
              <div className="payment-badge" title="Apple Pay">
                <span className="payment-text">Apple Pay</span>
              </div>
              <div className="payment-badge" title="Google Pay">
                <span className="payment-text">G Pay</span>
              </div>
              <div className="payment-badge" title="UPI & Net Banking">
                <span className="payment-text">UPI / NetBanking</span>
              </div>
            </div>
          </div>

          {/* 4. Copyright & Legal Navigation Bar */}
          <div className="footer-bottom-bar">
            <div className="footer-copyright">
              © {new Date().getFullYear()} Lustre &amp; Co. All rights reserved.
            </div>

            <div className="footer-tagline">Everyday elegance, made to shine.</div>

            <div className="footer-legal-links">
              <Link to="/privacy" className="legal-link">
                Privacy Policy
              </Link>
              <span className="legal-dot">•</span>
              <Link to="/terms" className="legal-link">
                Terms and Conditions
              </Link>
              <span className="legal-dot">•</span>
              <Link to="/shipping-returns" className="legal-link">
                Shipping Policy
              </Link>
              <span className="legal-dot">•</span>
              <Link to="/faq" className="legal-link">
                Help &amp; FAQ
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}