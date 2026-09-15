import { Link } from "react-router-dom";
import PageIntro from "../components/PageIntro";

export default function ShippingReturns() {
  return (
    <>
      <PageIntro
        eyebrow="The useful details"
        title="Shipping & returns"
        description="Everything you need to know about delivery, returns, exchanges, and refunds."
        breadcrumbs={[{ label: "Shipping and Returns" }]}
      />

      <section className="section policy-section">
        <div className="container policy-layout">
          <aside className="policy-sidebar">
            <a href="#shipping">Shipping</a>
            <a href="#returns">Returns</a>
            <a href="#exchange">Exchanges</a>
            <a href="#refunds">Refunds</a>
          </aside>

          <article className="policy-content">
            <section id="shipping">
              <span className="eyebrow">01 · Delivery</span>
              <h2>Shipping</h2>
              <p>
                Orders are generally processed within 1–2 business days. Once
                dispatched, delivery usually takes approximately 3–5 business
                days, depending on your location.
              </p>

              <ul>
                <li>Free shipping on orders above ₹1,999.</li>
                <li>Delivery estimates are shown at checkout.</li>
                <li>Tracking details are shared after dispatch.</li>
                <li>Please provide an accurate phone number and address.</li>
              </ul>
            </section>

            <section id="returns">
              <span className="eyebrow">02 · Eligibility</span>
              <h2>Returns</h2>
              <p>
                Eligible items can be returned within 7 days of delivery. Items
                must be unworn, unused, and in their original packaging.
              </p>

              <ul>
                <li>Return requests should include your order number.</li>
                <li>Items must pass a quality inspection.</li>
                <li>Products damaged after use may not qualify.</li>
                <li>Sale items may have special return conditions.</li>
              </ul>
            </section>

            <section id="exchange">
              <span className="eyebrow">03 · Replacement</span>
              <h2>Exchanges</h2>
              <p>
                If you receive a damaged, incorrect, or defective item, contact
                support as soon as possible with photographs and your order
                details.
              </p>
            </section>

            <section id="refunds">
              <span className="eyebrow">04 · Refunds</span>
              <h2>Refunds</h2>
              <p>
                Approved refunds are processed to the original payment method.
                The time taken for the amount to appear can vary by bank or
                payment provider.
              </p>
            </section>

            <Link to="/contact" className="button button-dark">
              Contact support
            </Link>
          </article>
        </div>
      </section>
    </>
  );
}