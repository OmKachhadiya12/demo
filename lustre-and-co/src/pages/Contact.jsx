import { Mail, MessageCircle, Clock } from "lucide-react";
import { useState } from "react";
import PageIntro from "../components/PageIntro";

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);

  function submit(event) {
    event.preventDefault();
    setSubmitted(true);
    event.currentTarget.reset();
  }

  return (
    <>
      <PageIntro
        eyebrow="We’re here to help"
        title="Contact us"
        description="Have a question about an order, a piece, or choosing the perfect gift? We would love to hear from you."
        breadcrumbs={[{ label: "Contact Us" }]}
      />

      <section className="section contact-section">
        <div className="container contact-grid">
          <div className="contact-details">
            <span className="eyebrow">Get in touch</span>
            <h2>Let’s make your experience feel as beautiful as your jewelry.</h2>

            <div className="contact-detail-item">
              <Mail size={20} />
              <div>
                <strong>Email us</strong>
                <a href="mailto:hello@lustreandco.com">
                  hello@lustreandco.com
                </a>
              </div>
            </div>

            <div className="contact-detail-item">
              <MessageCircle size={20} />
              <div>
                <strong>WhatsApp support</strong>
                <a href="#whatsapp">Message us on WhatsApp</a>
              </div>
            </div>

            <div className="contact-detail-item">
              <Clock size={20} />
              <div>
                <strong>Support hours</strong>
                <span>Monday–Saturday · 10:00–18:00</span>
              </div>
            </div>
          </div>

          <form className="contact-form" onSubmit={submit}>
            <label>
              Name
              <input name="name" required placeholder="Your name" />
            </label>

            <label>
              Email address
              <input
                name="email"
                type="email"
                required
                placeholder="you@example.com"
              />
            </label>

            <label>
              Reason for contact
              <select name="reason">
                <option>Order status</option>
                <option>Product question</option>
                <option>Returns and exchanges</option>
                <option>Payment issue</option>
                <option>Other</option>
              </select>
            </label>

            <label>
              Message
              <textarea
                name="message"
                required
                placeholder="How can we help?"
              />
            </label>

            <button className="button button-dark" type="submit">
              Send message
            </button>

            {submitted && (
              <p className="form-success">
                Thank you. Your message has been received.
              </p>
            )}
          </form>
        </div>
      </section>
    </>
  );
}