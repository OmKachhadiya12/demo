import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { ShieldCheck, FileText, Lock, RefreshCw, Mail, CheckCircle2 } from "lucide-react";
import PageIntro from "../components/PageIntro";

export default function Legal({ tab = "privacy" }) {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(
    location.pathname === "/terms" ? "terms" : tab
  );

  useEffect(() => {
    if (location.pathname === "/terms") {
      setActiveTab("terms");
    } else if (location.pathname === "/privacy") {
      setActiveTab("privacy");
    }
  }, [location.pathname]);

  return (
    <>
      <PageIntro
        eyebrow="Trust & Transparency"
        title={activeTab === "privacy" ? "Privacy Policy" : "Terms & Conditions"}
        description="We believe in complete transparency regarding your personal information, orders, and jewelry care guarantees."
        breadcrumbs={[
          { label: "Legal", path: "/privacy" },
          { label: activeTab === "privacy" ? "Privacy Policy" : "Terms of Service" }
        ]}
      />

      <section className="section legal-page-section">
        <div className="container">
          <div className="legal-layout-grid">
            {/* Left Tab Switcher */}
            <aside className="legal-sidebar">
              <div className="legal-nav-box">
                <button
                  type="button"
                  className={`legal-nav-btn ${activeTab === "privacy" ? "active" : ""}`}
                  onClick={() => setActiveTab("privacy")}
                >
                  <Lock size={16} />
                  <span>Privacy Policy</span>
                </button>

                <button
                  type="button"
                  className={`legal-nav-btn ${activeTab === "terms" ? "active" : ""}`}
                  onClick={() => setActiveTab("terms")}
                >
                  <FileText size={16} />
                  <span>Terms &amp; Conditions</span>
                </button>
              </div>

              <div className="legal-help-card">
                <ShieldCheck size={20} className="legal-shield-icon" />
                <h4>Questions or Concerns?</h4>
                <p>
                  Our client concierge is ready to assist with any legal, privacy, or order inquiries.
                </p>
                <a href="mailto:privacy@lustreandco.com" className="button button-outline-dark button-sm">
                  <Mail size={14} /> Contact Privacy Officer
                </a>
              </div>
            </aside>

            {/* Main Content Article */}
            <main className="legal-content-article">
              {activeTab === "privacy" ? (
                <article className="legal-document">
                  <div className="document-header">
                    <span className="eyebrow">Effective Date: January 1, 2026</span>
                    <h2>Privacy Policy &amp; Data Security</h2>
                    <p className="lead-text">
                      At Lustre &amp; Co., your privacy is paramount. This policy outlines how we collect, protect, and handle your personal information when you shop with us.
                    </p>
                  </div>

                  <div className="legal-section-block">
                    <h3>1. Information We Collect</h3>
                    <p>
                      When you browse our catalog, create an account, or complete a checkout, we collect necessary details to fulfill your orders, including:
                    </p>
                    <ul>
                      <li>Contact details: Name, email address, phone number, and delivery address.</li>
                      <li>Payment details: Encrypted transaction identifiers processed securely via PCI-DSS certified gateways (we never store raw card numbers).</li>
                      <li>Device and browsing data: IP address, device viewport, and preference cookies to optimize your shopping experience.</li>
                    </ul>
                  </div>

                  <div className="legal-section-block">
                    <h3>2. How We Protect Your Data</h3>
                    <p>
                      All checkout communications and data exchanges are safeguarded using industry-standard 256-Bit SSL encryption. Access to customer records is restricted to authorized fulfillment and concierge personnel.
                    </p>
                  </div>

                  <div className="legal-section-block">
                    <h3>3. Cookies &amp; Personalization</h3>
                    <p>
                      We utilize first-party cookies to remember your bag contents, wishlist preferences, and recently viewed jewelry items. You may adjust cookie preferences anytime in your browser settings.
                    </p>
                  </div>

                  <div className="legal-section-block">
                    <h3>4. Your Rights</h3>
                    <p>
                      You hold the right to access, rectify, or request deletion of your personal account information at any time. Simply reach out to{" "}
                      <a href="mailto:privacy@lustreandco.com" className="footer-inline-link">
                        privacy@lustreandco.com
                      </a>.
                    </p>
                  </div>
                </article>
              ) : (
                <article className="legal-document">
                  <div className="document-header">
                    <span className="eyebrow">Last Updated: January 1, 2026</span>
                    <h2>Terms &amp; Conditions of Sale</h2>
                    <p className="lead-text">
                      Welcome to Lustre &amp; Co. By accessing our platform or purchasing our imitation jewelry pieces, you agree to the following terms and guidelines.
                    </p>
                  </div>

                  <div className="legal-section-block">
                    <h3>1. Product Descriptions &amp; Materials</h3>
                    <p>
                      Lustre &amp; Co. specializes in high-grade imitation jewelry crafted with brass/copper alloy cores, premium 18K gold and rhodium plating, and AAA cubic zirconia stones. While we make every effort to display accurate colors and finishes, subtle variations may occur due to monitor calibration.
                    </p>
                  </div>

                  <div className="legal-section-block">
                    <h3>2. Pricing &amp; Orders</h3>
                    <p>
                      All prices are listed in local currency and include applicable statutory taxes. We reserve the right to modify prices or cancel orders in cases of pricing typographical errors or stock exhaustion.
                    </p>
                  </div>

                  <div className="legal-section-block">
                    <h3>3. Delivery &amp; 7-Day Returns</h3>
                    <p>
                      Orders typically dispatch within 1–2 business days. Unused, unworn jewelry in its original luxury box packaging qualifies for our 7-day doorstep replacement or refund guarantee. Please consult our{" "}
                      <Link to="/shipping-returns" className="footer-inline-link">
                        Shipping &amp; Returns Policy
                      </Link>{" "}
                      for full instructions.
                    </p>
                  </div>

                  <div className="legal-section-block">
                    <h3>4. Jewelry Care &amp; Warranty</h3>
                    <p>
                      Imitation jewelry requires proper care to maintain brilliance. Avoid direct exposure to perfume, harsh sanitizers, chlorinated pool water, and abrasive chemicals. Consult our{" "}
                      <Link to="/jewelry-care" className="footer-inline-link">
                        Jewelry Care Guide
                      </Link>{" "}
                      for detailed recommendations.
                    </p>
                  </div>
                </article>
              )}
            </main>
          </div>
        </div>
      </section>
    </>
  );
}
