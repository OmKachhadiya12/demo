import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import {
  PackageCheck,
  ArrowRight,
  ShoppingBag,
  Truck,
  Calendar,
  MapPin,
  CreditCard,
  Gift,
  ShieldCheck,
  Sparkles,
  ExternalLink,
  Clock
} from "lucide-react";
import { formatPrice, products } from "../data/products";
import { useStore } from "../context/StoreContext";

export default function OrderConfirmation() {
  const { orderId } = useParams();
  const { lastOrder } = useStore();

  // Resolve order details from store or realistic fallback if refreshed/directly navigated
  const order = useMemo(() => {
    if (lastOrder && (lastOrder.id === orderId || !orderId)) {
      return lastOrder;
    }

    // Default fallback order for direct URL inspection
    const today = new Date();
    const estStart = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000);
    const estEnd = new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000);
    const dateOpts = { month: "short", day: "numeric" };
    const deliveryRange = `${estStart.toLocaleDateString("en-US", dateOpts)} – ${estEnd.toLocaleDateString("en-US", dateOpts)}, ${today.getFullYear()}`;

    const flagship = products.find((p) => p.id === "p0") || products[0];

    return {
      id: orderId || "LST-89421056",
      createdAt: today.toISOString(),
      orderDate: today.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      estimatedDeliveryDate: deliveryRange,
      status: "Confirmed",
      items: [
        {
          id: "p0-gold",
          quantity: 1,
          selectedColor: "Gold",
          selectedSize: 'Standard (16" + 2")',
          product: flagship
        }
      ],
      subtotal: 1499,
      discount: 0,
      shippingFee: 0,
      tax: 45,
      total: 1499,
      shipping: {
        fullName: "Eleanor Vance",
        email: "eleanor.vance@example.com",
        phone: "+91 98765 43210",
        address: "42 Heritage Boulevard, Colaba",
        city: "Mumbai",
        state: "Maharashtra",
        postalCode: "400001",
        country: "India"
      },
      payment: {
        method: "card",
        cardLast4: "8892"
      }
    };
  }, [lastOrder, orderId]);

  const items = order.items && order.items.length > 0 ? order.items : [];
  const shippingInfo = order.shipping || order.customer || {};

  return (
    <div className="order-confirmation-page">
      <section className="section order-confirmation-section">
        <div className="container">
          <div className="confirmation-main-card">
            {/* Success Checkmark Animation */}
            <div className="confirmation-badge-container">
              <div className="confirmation-aura" />
              <div className="confirmation-circle">
                <svg
                  className="confirmation-checkmark-svg"
                  viewBox="0 0 52 52"
                  aria-hidden="true"
                >
                  <circle
                    className="checkmark-circle"
                    cx="26"
                    cy="26"
                    r="23"
                    fill="none"
                  />
                  <path
                    className="checkmark-check"
                    fill="none"
                    d="M14.1 27.2l7.1 7.2 16.7-16.8"
                  />
                </svg>
              </div>
            </div>

            {/* Reassuring Headings */}
            <span className="confirmation-eyebrow">Payment Successful</span>
            <h1 className="confirmation-title">Thank You for Your Order!</h1>
            <p className="confirmation-friendly-message">
              Your jewelry is being prepared with care.
            </p>
            <p className="confirmation-email-notice">
              A confirmation email with invoice and tracking details has been sent to{" "}
              <strong>{shippingInfo.email || "your email address"}</strong>.
            </p>

            {/* Key Order Details Bar */}
            <div className="confirmation-meta-strip">
              <div className="meta-strip-cell">
                <span className="meta-label">Order Number</span>
                <strong className="meta-value order-id" id="confirmation-order-id">
                  {order.id}
                </strong>
              </div>

              <div className="meta-strip-divider" />

              <div className="meta-strip-cell">
                <span className="meta-label">Order Date</span>
                <strong className="meta-value">
                  {order.orderDate || "Today"}
                </strong>
              </div>

              <div className="meta-strip-divider" />

              <div className="meta-strip-cell">
                <span className="meta-label">Estimated Delivery</span>
                <strong className="meta-value estimated-date">
                  <Clock size={14} className="inline-clock" />
                  {order.estimatedDeliveryDate || "3–5 Business Days"}
                </strong>
              </div>

              <div className="meta-strip-divider" />

              <div className="meta-strip-cell">
                <span className="meta-label">Status</span>
                <strong className="meta-value status-confirmed">
                  <span className="status-dot" /> Confirmed
                </strong>
              </div>
            </div>

            {/* 2-Column Details Layout */}
            <div className="confirmation-grid">
              {/* LEFT COLUMN: Purchased Product Summary */}
              <div className="confirmation-card-panel">
                <div className="panel-header">
                  <div className="panel-header-title">
                    <ShoppingBag size={18} />
                    <h3>Purchased Product Summary</h3>
                  </div>
                  <span className="panel-count-pill">
                    {items.length} {items.length === 1 ? "Piece" : "Pieces"}
                  </span>
                </div>

                <div className="confirmation-items-list">
                  {items.map((item, idx) => {
                    const prod = item.product || {};
                    const unitPrice = prod.price || 0;
                    const lineTotal = unitPrice * item.quantity;
                    const variantColor = item.selectedColor || prod.selectedColor || "Gold";
                    const variantSize = item.selectedSize || prod.selectedSize || 'Standard (16" + 2")';

                    return (
                      <div className="confirmation-item-row" key={`${item.id}-${idx}`}>
                        <div className="item-image-frame">
                          <img
                            src={prod.image || prod.gallery?.[0]}
                            alt={prod.name}
                          />
                          <span className="item-quantity-pill">×{item.quantity}</span>
                        </div>

                        <div className="item-details-box">
                          <h4 className="item-title">
                            <Link to={`/product/${prod.slug || "aurora-gold-plated-necklace"}`}>
                              {prod.name}
                            </Link>
                          </h4>
                          <span className="item-metadata">
                            Color: <strong>{variantColor}</strong> • Size: {variantSize}
                          </span>
                          <span className="item-unit-price">
                            {formatPrice(unitPrice)} each
                          </span>
                        </div>

                        <div className="item-total-col">
                          <strong>{formatPrice(lineTotal)}</strong>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Total Breakdown inside panel */}
                <div className="confirmation-pricing-breakdown">
                  <div className="price-line-row">
                    <span>Subtotal</span>
                    <span>{formatPrice(order.subtotal || order.total)}</span>
                  </div>

                  {order.discount > 0 && (
                    <div className="price-line-row discount">
                      <span>Promotional Discount</span>
                      <span>-{formatPrice(order.discount)}</span>
                    </div>
                  )}

                  <div className="price-line-row">
                    <span>Shipping</span>
                    <span>
                      {order.shippingFee === 0 || !order.shippingFee
                        ? "FREE (Express Courier)"
                        : formatPrice(order.shippingFee)}
                    </span>
                  </div>

                  {order.deliverySurcharge > 0 && (
                    <div className="price-line-row">
                      <span>Priority Dispatch</span>
                      <span>{formatPrice(order.deliverySurcharge)}</span>
                    </div>
                  )}

                  <div className="price-line-row">
                    <span>Taxes &amp; Duties</span>
                    <span>Included in price (3% GST)</span>
                  </div>

                  <div className="price-breakdown-divider" />

                  <div className="price-line-row total">
                    <div>
                      <strong className="total-label">Total Amount</strong>
                      <span className="total-sub">Paid in full via {order.payment?.method?.toUpperCase() || "CARD"}</span>
                    </div>
                    <strong className="total-val" id="confirmation-total-amount">
                      {formatPrice(order.total)}
                    </strong>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: Shipping Address & Security Recap */}
              <div className="confirmation-right-column">
                {/* Shipping Address Card */}
                <div className="confirmation-card-panel">
                  <div className="panel-header">
                    <div className="panel-header-title">
                      <MapPin size={18} />
                      <h3>Shipping Address</h3>
                    </div>
                  </div>

                  <div className="shipping-address-body">
                    <strong className="recipient-name">
                      {shippingInfo.fullName || "Customer"}
                    </strong>
                    <p className="address-line">
                      {shippingInfo.address || "Street Address"}
                    </p>
                    <p className="address-line">
                      {shippingInfo.city || "City"}, {shippingInfo.state || "State"} -{" "}
                      {shippingInfo.postalCode || "000000"}
                    </p>
                    <p className="address-line country-line">
                      {shippingInfo.country || "India"}
                    </p>

                    <div className="address-contact-details">
                      <div>
                        <span>Phone:</span>
                        <strong>{shippingInfo.phone || "Not provided"}</strong>
                      </div>
                      <div>
                        <span>Email:</span>
                        <strong>{shippingInfo.email || "Not provided"}</strong>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Delivery Perks Box */}
                <div className="confirmation-perks-card">
                  <div className="perk-row">
                    <Gift size={20} className="perk-icon" />
                    <div>
                      <strong>Signature Unboxing Box</strong>
                      <span>Hand-wrapped in luxury velvet jewelry pouch and protective gift box.</span>
                    </div>
                  </div>

                  <div className="perk-row">
                    <Truck size={20} className="perk-icon" />
                    <div>
                      <strong>Live SMS &amp; WhatsApp Tracking</strong>
                      <span>Real-time milestone notifications dispatched when parcel leaves our studio.</span>
                    </div>
                  </div>

                  <div className="perk-row">
                    <ShieldCheck size={20} className="perk-icon" />
                    <div>
                      <strong>7-Day Doorstep Replacement</strong>
                      <span>Hassle-free exchanges with free return pickup at your doorstep.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons Row */}
            <div className="confirmation-actions-row">
              <Link
                to={`/track-order?order=${order.id}`}
                className="button button-dark confirmation-track-btn"
                id="confirmation-track-order-btn"
              >
                <span>Track Order</span>
                <ArrowRight size={16} />
              </Link>

              <Link
                to="/shop"
                className="button button-gold confirmation-continue-btn"
                id="confirmation-continue-shopping-btn"
              >
                <span>Continue Shopping</span>
                <ShoppingBag size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}