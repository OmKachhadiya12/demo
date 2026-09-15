import { Link } from "react-router-dom";
import { ArrowRight, Truck, RotateCcw, ShieldCheck, Sparkles, Gift } from "lucide-react";
import { motion } from "framer-motion";

export default function PromotionalBanner({
  eyebrow = "Limited Time Offer",
  heading = "More Shine, More Savings",
  text = "Buy 2 jewelry pieces and get 1 free.",
  buttonText = "Shop the Offer",
  buttonLink = "/shop",
  image = "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1200&q=85",
  imageAlt = "Lustre & Co. Luxury Gold Jewelry Collection",
  className = ""
}) {
  return (
    <section className={`promo-banner-section ${className}`}>
      <div className="container">
        <motion.div
          className="promo-banner-container"
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Subtle Ambient Decorative Highlights */}
          <div className="promo-gold-glow promo-glow-left" aria-hidden="true" />
          <div className="promo-gold-glow promo-glow-right" aria-hidden="true" />

          <div className="promo-banner-split">
            {/* Left Column: Promotional Content & Value Badges */}
            <div className="promo-banner-content">
              {/* Eyebrow Pill */}
              <div className="promo-badge-pill">
                <Sparkles size={13} className="promo-sparkle-icon" />
                <span>{eyebrow}</span>
              </div>

              {/* Main Heading */}
              <h2 className="promo-banner-heading">
                More Shine, <em>More Savings</em>
              </h2>

              {/* Promotional Text */}
              <p className="promo-banner-text">{text}</p>

              {/* Primary Call to Action Button */}
              <div className="promo-banner-cta">
                <Link to={buttonLink} className="button promo-cta-btn">
                  <span>{buttonText}</span>
                  <ArrowRight size={16} />
                </Link>
                <span className="promo-cta-hint">
                  <Gift size={14} />
                  <span>Discount applies automatically at checkout</span>
                </span>
              </div>

              {/* 3 Core Value Propositions */}
              <div className="promo-perks-grid">
                <div className="promo-perk-item">
                  <div className="perk-icon-circle">
                    <Truck size={17} />
                  </div>
                  <div className="perk-text-group">
                    <strong>Free shipping</strong>
                    <span>On orders above $50</span>
                  </div>
                </div>

                <div className="promo-perk-item">
                  <div className="perk-icon-circle">
                    <RotateCcw size={17} />
                  </div>
                  <div className="perk-text-group">
                    <strong>Easy returns</strong>
                    <span>7-day hassle-free</span>
                  </div>
                </div>

                <div className="promo-perk-item">
                  <div className="perk-icon-circle">
                    <ShieldCheck size={17} />
                  </div>
                  <div className="perk-text-group">
                    <strong>Secure payments</strong>
                    <span>100% encrypted & certified</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: High-End Jewelry Imagery */}
            <div className="promo-banner-visual">
              <div className="promo-image-wrapper">
                <img
                  src={image}
                  alt={imageAlt}
                  className="promo-image"
                  loading="lazy"
                />

                {/* Floating Promotion Overlay Card */}
                <div className="promo-floating-tag">
                  <span className="floating-tag-badge">Special Edition</span>
                  <strong>Buy 2 Get 1 Free</strong>
                  <small>Mix & match across all categories</small>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
