import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  Lock,
  Check,
  ChevronRight,
  ChevronDown,
  CreditCard,
  Wallet,
  Banknote,
  Landmark,
  Truck,
  ArrowLeft,
  AlertCircle,
  Sparkles,
  ShoppingBag,
  Loader2,
  FileText,
  HelpCircle
} from "lucide-react";
import { formatPrice, products } from "../data/products";
import { useStore } from "../context/StoreContext";
import api from "../services/api";

export default function Checkout() {
  const navigate = useNavigate();
  const {
    cart,
    cartSubtotal,
    appliedPromo,
    discountAmount,
    shipping,
    estimatedTax,
    cartTotal,
    placeOrder,
    addToCart,
    user
  } = useStore();

  // Step state: 1 = Shipping, 2 = Payment, 3 = Order Review
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mobileSummaryOpen, setMobileSummaryOpen] = useState(false);

  // Step 1: Shipping form data
  const [shippingData, setShippingData] = useState({
    fullName: user?.name || "Eleanor Vance",
    email: user?.email || "eleanor.vance@example.com",
    phone: "9876543210",
    country: "India",
    city: "Mumbai",
    state: "Maharashtra",
    postalCode: "400001",
    address: "42 Heritage Boulevard, Colaba",
    isGuest: !user,
    saveAddress: true
  });

  // Step 2: Payment form data
  const [paymentData, setPaymentData] = useState({
    method: "card", // "card" | "wallet" | "cod" | "netbanking"
    cardNumber: "4532 •••• •••• 8892",
    cardName: "ELEANOR VANCE",
    cardExpiry: "08/29",
    cardCvv: "882",
    selectedWallet: "applepay",
    selectedBank: "hdfc"
  });

  // Step 3: Review form data
  const [reviewData, setReviewData] = useState({
    deliveryOption: "standard", // "standard" (Free) | "express" (₹199)
    agreedToTerms: false,
    orderNotes: ""
  });

  const [errors, setErrors] = useState({});

  // Calculate express delivery surcharge if selected
  const deliverySurcharge = reviewData.deliveryOption === "express" ? 199 : 0;
  const grandTotal = cartTotal + deliverySurcharge;

  // Handle shipping input changes
  function handleShippingChange(e) {
    const { name, value, type, checked } = e.target;
    setShippingData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));

    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  }

  // Handle payment input changes
  function handlePaymentChange(e) {
    const { name, value } = e.target;
    setPaymentData((prev) => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  }

  // Validate Step 1 (Shipping Information)
  function validateShipping() {
    const newErrors = {};

    if (!shippingData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!shippingData.email.trim()) {
      newErrors.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shippingData.email.trim())) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!shippingData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (shippingData.phone.replace(/\D/g, "").length < 10) {
      newErrors.phone = "Enter a valid 10-digit phone number";
    }

    if (!shippingData.country.trim()) {
      newErrors.country = "Country is required";
    }

    if (!shippingData.city.trim()) {
      newErrors.city = "City is required";
    }

    if (!shippingData.state.trim()) {
      newErrors.state = "State / Province is required";
    }

    if (!shippingData.postalCode.trim()) {
      newErrors.postalCode = "Postal code is required";
    } else if (shippingData.postalCode.trim().length < 5) {
      newErrors.postalCode = "Enter a valid postal code (5–6 digits)";
    }

    if (!shippingData.address.trim()) {
      newErrors.address = "Complete address is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  // Validate Step 2 (Payment Information)
  function validatePayment() {
    const newErrors = {};

    if (paymentData.method === "card") {
      if (!paymentData.cardNumber.trim()) {
        newErrors.cardNumber = "Card number is required";
      }
      if (!paymentData.cardName.trim()) {
        newErrors.cardName = "Cardholder name is required";
      }
      if (!paymentData.cardExpiry.trim()) {
        newErrors.cardExpiry = "Expiry date is required";
      }
      if (!paymentData.cardCvv.trim()) {
        newErrors.cardCvv = "CVV is required";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  // Step progression handlers
  function proceedToPayment(e) {
    e.preventDefault();
    if (validateShipping()) {
      setStep(2);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function proceedToReview(e) {
    e.preventDefault();
    if (validatePayment()) {
      setStep(3);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  // Final Order Submission Handler
  async function handlePlaceOrder(e) {
    e.preventDefault();

    if (!reviewData.agreedToTerms) {
      setErrors({
        terms: "You must accept the Terms and Privacy Policy to place your order"
      });
      return;
    }

    setIsSubmitting(true);

    // Realistic secure processing animation
    await new Promise((resolve) => setTimeout(resolve, 1200));

    const orderPayload = {
      shipping: shippingData,
      payment: {
        method: paymentData.method,
        cardLast4:
          paymentData.method === "card"
            ? paymentData.cardNumber.slice(-4)
            : undefined
      },
      deliveryOption: reviewData.deliveryOption,
      notes: reviewData.orderNotes,
      total: grandTotal
    };

    try {
      const createdOrder = await placeOrder(orderPayload);
      const orderId = createdOrder?.orderId || createdOrder?.id;

      if (orderId && paymentData.method === "cod") {
        await api.post("/payments/cod", { orderId });
      } else if (orderId) {
        await api.post("/payments/create-intent", { orderId, currency: "INR" });
      }

      setIsSubmitting(false);
      const targetId = orderId || "LST-89421056";
      navigate(`/order-confirmation/${targetId}`);
    } catch {
      setIsSubmitting(false);
    }
  }

  // Sample order fallback for testing if cart was cleared
  function handleAddSampleCart() {
    const flagship = products.find((p) => p.id === "p0") || products[0];
    addToCart({ ...flagship, selectedColor: "Gold" }, 1);
  }

  return (
    <div className="checkout-page">
      {/* Breadcrumbs Navigation */}
      <nav className="pdp-breadcrumbs-bar" aria-label="Breadcrumb">
        <div className="container">
          <ol className="pdp-breadcrumbs-list">
            <li>
              <Link to="/">Home</Link>
            </li>
            <span className="pdp-breadcrumb-sep">/</span>
            <li>
              <Link to="/cart">Cart</Link>
            </li>
            <span className="pdp-breadcrumb-sep">/</span>
            <li className="active" aria-current="page">
              Secure Checkout
            </li>
          </ol>
        </div>
      </nav>

      <section className="section checkout-section">
        <div className="container">
          {/* Empty Cart Notice */}
          {cart.length === 0 ? (
            <div className="cart-empty-container">
              <div className="cart-empty-icon-wrap">
                <ShoppingBag size={42} strokeWidth={1.2} />
              </div>
              <h2>Your bag is currently empty</h2>
              <p>
                Add pieces to your bag before checking out. You can also populate a demo piece
                to test this checkout flow instantly.
              </p>
              <div className="cart-empty-actions">
                <Link to="/shop" className="button button-dark">
                  Explore Shop
                </Link>
                <button
                  type="button"
                  className="button button-gold"
                  onClick={handleAddSampleCart}
                  id="checkout-demo-item-btn"
                >
                  <Sparkles size={16} />
                  Add Aurora Necklace (Demo)
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Mobile Collapsible Order Summary Bar */}
              <div className="checkout-mobile-summary-bar">
                <button
                  type="button"
                  className="checkout-mobile-summary-toggle"
                  onClick={() => setMobileSummaryOpen(!mobileSummaryOpen)}
                  aria-expanded={mobileSummaryOpen}
                  aria-controls="mobile-order-summary-panel"
                  id="checkout-mobile-summary-toggle"
                >
                  <div className="checkout-mobile-toggle-left">
                    <ShoppingBag size={18} />
                    <span>
                      {mobileSummaryOpen ? "Hide order summary" : "Show order summary"}
                    </span>
                    <ChevronDown
                      size={16}
                      className={`checkout-chevron-icon ${
                        mobileSummaryOpen ? "rotate" : ""
                      }`}
                    />
                  </div>
                  <strong className="checkout-mobile-total-price">
                    {formatPrice(grandTotal)}
                  </strong>
                </button>

                {/* Collapsible drawer */}
                {mobileSummaryOpen && (
                  <div
                    className="checkout-mobile-summary-drawer"
                    id="mobile-order-summary-panel"
                  >
                    <div className="checkout-summary-items-list">
                      {cart.map((item) => (
                        <div key={item.id} className="checkout-mini-item">
                          <img
                            src={item.product?.image || item.product?.gallery?.[0]}
                            alt={item.product?.name}
                          />
                          <div className="checkout-mini-item-info">
                            <h5>{item.product?.name}</h5>
                            <span>
                              Color: {item.selectedColor || "Gold"} • Qty: {item.quantity}
                            </span>
                          </div>
                          <strong>
                            {formatPrice(
                              (item.product?.price || 0) * item.quantity
                            )}
                          </strong>
                        </div>
                      ))}
                    </div>

                    <div className="checkout-mini-totals">
                      <div className="checkout-mini-row">
                        <span>Subtotal</span>
                        <span>{formatPrice(cartSubtotal)}</span>
                      </div>
                      {appliedPromo && discountAmount > 0 && (
                        <div className="checkout-mini-row discount">
                          <span>Discount ({appliedPromo.code})</span>
                          <span>-{formatPrice(discountAmount)}</span>
                        </div>
                      )}
                      <div className="checkout-mini-row">
                        <span>Shipping</span>
                        <span>{shipping === 0 ? "FREE" : formatPrice(shipping)}</span>
                      </div>
                      <div className="checkout-mini-row">
                        <span>Estimated Tax (3% GST)</span>
                        <span>{formatPrice(estimatedTax)}</span>
                      </div>
                      <div className="checkout-mini-row total">
                        <strong>Total</strong>
                        <strong>{formatPrice(grandTotal)}</strong>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Main 2-Column Split: Wizard (Left) & Order Summary (Right) */}
              <div className="checkout-grid-layout">
                <div className="checkout-main-column">
                  {/* Three-Step Progress Header */}
                  <div className="checkout-step-progress" aria-label="Checkout Progress">
                    <button
                      type="button"
                      className={`checkout-step-tab ${step === 1 ? "is-active" : ""} ${
                        step > 1 ? "is-completed" : ""
                      }`}
                      onClick={() => setStep(1)}
                    >
                      <span className="step-number">
                        {step > 1 ? <Check size={14} /> : "1"}
                      </span>
                      <span className="step-title">Shipping Information</span>
                    </button>

                    <span className="step-arrow-divider">
                      <ChevronRight size={16} />
                    </span>

                    <button
                      type="button"
                      className={`checkout-step-tab ${step === 2 ? "is-active" : ""} ${
                        step > 2 ? "is-completed" : ""
                      }`}
                      onClick={() => {
                        if (validateShipping()) setStep(2);
                      }}
                      disabled={step < 2}
                    >
                      <span className="step-number">
                        {step > 2 ? <Check size={14} /> : "2"}
                      </span>
                      <span className="step-title">Payment Information</span>
                    </button>

                    <span className="step-arrow-divider">
                      <ChevronRight size={16} />
                    </span>

                    <button
                      type="button"
                      className={`checkout-step-tab ${step === 3 ? "is-active" : ""}`}
                      onClick={() => {
                        if (validateShipping() && validatePayment()) setStep(3);
                      }}
                      disabled={step < 3}
                    >
                      <span className="step-number">3</span>
                      <span className="step-title">Order Review</span>
                    </button>
                  </div>

                  {/* ==================================================== */}
                  {/* STEP 1: SHIPPING INFORMATION                         */}
                  {/* ==================================================== */}
                  {step === 1 && (
                    <div className="checkout-step-content" id="step-shipping-section">
                      <div className="checkout-step-heading">
                        <h2>1. Shipping Information</h2>
                        <p className="checkout-step-sub">
                          Please enter the delivery address where your pieces will be sent.
                        </p>
                      </div>

                      {/* Guest Checkout Option Banner */}
                      <div className="checkout-guest-banner">
                        <div className="checkout-guest-info">
                          <strong>Checkout as Guest</strong>
                          <span>No account or password required. Track anytime with your email.</span>
                        </div>
                        <span className="checkout-guest-badge">Guest Mode Active</span>
                      </div>

                      <form onSubmit={proceedToPayment} noValidate className="checkout-form-body">
                        <div className="checkout-form-grid">
                          {/* Full Name */}
                          <div className="checkout-field-wrap">
                            <label htmlFor="fullName">
                              Full Name <span className="required-star">*</span>
                            </label>
                            <input
                              type="text"
                              id="fullName"
                              name="fullName"
                              value={shippingData.fullName}
                              onChange={handleShippingChange}
                              placeholder="e.g. Eleanor Vance"
                              className={errors.fullName ? "has-error" : ""}
                              required
                            />
                            {errors.fullName && (
                              <span className="field-error-msg" role="alert">
                                <AlertCircle size={13} /> {errors.fullName}
                              </span>
                            )}
                          </div>

                          {/* Email Address */}
                          <div className="checkout-field-wrap">
                            <label htmlFor="email">
                              Email Address <span className="required-star">*</span>
                            </label>
                            <input
                              type="email"
                              id="email"
                              name="email"
                              value={shippingData.email}
                              onChange={handleShippingChange}
                              placeholder="e.g. eleanor@example.com"
                              className={errors.email ? "has-error" : ""}
                              required
                            />
                            {errors.email && (
                              <span className="field-error-msg" role="alert">
                                <AlertCircle size={13} /> {errors.email}
                              </span>
                            )}
                          </div>

                          {/* Phone Number */}
                          <div className="checkout-field-wrap">
                            <label htmlFor="phone">
                              Phone Number <span className="required-star">*</span>
                            </label>
                            <input
                              type="tel"
                              id="phone"
                              name="phone"
                              value={shippingData.phone}
                              onChange={handleShippingChange}
                              placeholder="10-digit mobile number"
                              className={errors.phone ? "has-error" : ""}
                              required
                            />
                            {errors.phone && (
                              <span className="field-error-msg" role="alert">
                                <AlertCircle size={13} /> {errors.phone}
                              </span>
                            )}
                          </div>

                          {/* Country */}
                          <div className="checkout-field-wrap">
                            <label htmlFor="country">
                              Country <span className="required-star">*</span>
                            </label>
                            <select
                              id="country"
                              name="country"
                              value={shippingData.country}
                              onChange={handleShippingChange}
                              className={errors.country ? "has-error" : ""}
                              required
                            >
                              <option value="India">India</option>
                              <option value="United States">United States</option>
                              <option value="United Kingdom">United Kingdom</option>
                              <option value="Canada">Canada</option>
                              <option value="Australia">Australia</option>
                              <option value="United Arab Emirates">United Arab Emirates</option>
                              <option value="Singapore">Singapore</option>
                            </select>
                            {errors.country && (
                              <span className="field-error-msg" role="alert">
                                <AlertCircle size={13} /> {errors.country}
                              </span>
                            )}
                          </div>

                          {/* Complete Address */}
                          <div className="checkout-field-wrap full-width">
                            <label htmlFor="address">
                              Complete Address (Flat, House no., Street, Area){" "}
                              <span className="required-star">*</span>
                            </label>
                            <textarea
                              id="address"
                              name="address"
                              rows={2}
                              value={shippingData.address}
                              onChange={handleShippingChange}
                              placeholder="e.g. Flat 402, Radiant Towers, Linking Road"
                              className={errors.address ? "has-error" : ""}
                              required
                            />
                            {errors.address && (
                              <span className="field-error-msg" role="alert">
                                <AlertCircle size={13} /> {errors.address}
                              </span>
                            )}
                          </div>

                          {/* City */}
                          <div className="checkout-field-wrap">
                            <label htmlFor="city">
                              City <span className="required-star">*</span>
                            </label>
                            <input
                              type="text"
                              id="city"
                              name="city"
                              value={shippingData.city}
                              onChange={handleShippingChange}
                              placeholder="e.g. Mumbai"
                              className={errors.city ? "has-error" : ""}
                              required
                            />
                            {errors.city && (
                              <span className="field-error-msg" role="alert">
                                <AlertCircle size={13} /> {errors.city}
                              </span>
                            )}
                          </div>

                          {/* State */}
                          <div className="checkout-field-wrap">
                            <label htmlFor="state">
                              State <span className="required-star">*</span>
                            </label>
                            <input
                              type="text"
                              id="state"
                              name="state"
                              value={shippingData.state}
                              onChange={handleShippingChange}
                              placeholder="e.g. Maharashtra"
                              className={errors.state ? "has-error" : ""}
                              required
                            />
                            {errors.state && (
                              <span className="field-error-msg" role="alert">
                                <AlertCircle size={13} /> {errors.state}
                              </span>
                            )}
                          </div>

                          {/* Postal Code */}
                          <div className="checkout-field-wrap">
                            <label htmlFor="postalCode">
                              Postal Code <span className="required-star">*</span>
                            </label>
                            <input
                              type="text"
                              id="postalCode"
                              name="postalCode"
                              value={shippingData.postalCode}
                              onChange={handleShippingChange}
                              placeholder="e.g. 400001"
                              className={errors.postalCode ? "has-error" : ""}
                              required
                            />
                            {errors.postalCode && (
                              <span className="field-error-msg" role="alert">
                                <AlertCircle size={13} /> {errors.postalCode}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Save Address Checkbox */}
                        <div className="checkout-checkbox-row">
                          <label className="checkout-checkbox-label">
                            <input
                              type="checkbox"
                              name="saveAddress"
                              checked={shippingData.saveAddress}
                              onChange={handleShippingChange}
                              id="save-address-checkbox"
                            />
                            <span>Save this address for future purchases</span>
                          </label>
                        </div>

                        {/* Step 1 Actions */}
                        <div className="checkout-step-footer">
                          <Link to="/cart" className="checkout-back-link">
                            <ArrowLeft size={16} /> Return to Cart
                          </Link>

                          <button
                            type="submit"
                            className="button button-dark checkout-continue-btn"
                            id="continue-to-payment-btn"
                          >
                            <span>Continue to Payment</span>
                            <ChevronRight size={16} />
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* ==================================================== */}
                  {/* STEP 2: PAYMENT INFORMATION                          */}
                  {/* ==================================================== */}
                  {step === 2 && (
                    <div className="checkout-step-content" id="step-payment-section">
                      <div className="checkout-step-heading">
                        <h2>2. Payment Information</h2>
                        <p className="checkout-step-sub">
                          All transactions are encrypted and secured with bank-grade protocols.
                        </p>
                      </div>

                      {/* Shipping Summary Pill */}
                      <div className="checkout-summary-pill">
                        <div className="pill-content">
                          <span className="pill-label">Ship to:</span>
                          <span className="pill-val">
                            {shippingData.fullName}, {shippingData.address}, {shippingData.city},{" "}
                            {shippingData.postalCode}
                          </span>
                        </div>
                        <button
                          type="button"
                          className="pill-edit-btn"
                          onClick={() => setStep(1)}
                        >
                          Change
                        </button>
                      </div>

                      <form onSubmit={proceedToReview} className="checkout-form-body">
                        {/* 4 Payment Options */}
                        <div className="payment-options-grid">
                          {/* Option 1: Credit or Debit Card */}
                          <label
                            className={`payment-method-card ${
                              paymentData.method === "card" ? "is-selected" : ""
                            }`}
                          >
                            <div className="payment-method-top">
                              <input
                                type="radio"
                                name="method"
                                value="card"
                                checked={paymentData.method === "card"}
                                onChange={handlePaymentChange}
                                id="payment-method-card"
                              />
                              <div className="payment-method-info">
                                <span className="payment-method-name">Credit or Debit Card</span>
                                <span className="payment-method-desc">
                                  Visa, Mastercard, RuPay, American Express
                                </span>
                              </div>
                              <CreditCard size={20} className="payment-method-icon" />
                            </div>

                            {paymentData.method === "card" && (
                              <div className="payment-card-subfields">
                                <div className="checkout-field-wrap">
                                  <label htmlFor="cardNumber">Card Number</label>
                                  <input
                                    type="text"
                                    id="cardNumber"
                                    name="cardNumber"
                                    value={paymentData.cardNumber}
                                    onChange={handlePaymentChange}
                                    placeholder="4532 •••• •••• 8892"
                                  />
                                </div>

                                <div className="checkout-field-wrap">
                                  <label htmlFor="cardName">Name on Card</label>
                                  <input
                                    type="text"
                                    id="cardName"
                                    name="cardName"
                                    value={paymentData.cardName}
                                    onChange={handlePaymentChange}
                                    placeholder="ELEANOR VANCE"
                                  />
                                </div>

                                <div className="payment-two-cols">
                                  <div className="checkout-field-wrap">
                                    <label htmlFor="cardExpiry">Expiry Date</label>
                                    <input
                                      type="text"
                                      id="cardExpiry"
                                      name="cardExpiry"
                                      value={paymentData.cardExpiry}
                                      onChange={handlePaymentChange}
                                      placeholder="MM/YY"
                                    />
                                  </div>

                                  <div className="checkout-field-wrap">
                                    <label htmlFor="cardCvv">CVV</label>
                                    <input
                                      type="password"
                                      id="cardCvv"
                                      name="cardCvv"
                                      maxLength={4}
                                      value={paymentData.cardCvv}
                                      onChange={handlePaymentChange}
                                      placeholder="•••"
                                    />
                                  </div>
                                </div>
                              </div>
                            )}
                          </label>

                          {/* Option 2: Digital Wallet */}
                          <label
                            className={`payment-method-card ${
                              paymentData.method === "wallet" ? "is-selected" : ""
                            }`}
                          >
                            <div className="payment-method-top">
                              <input
                                type="radio"
                                name="method"
                                value="wallet"
                                checked={paymentData.method === "wallet"}
                                onChange={handlePaymentChange}
                                id="payment-method-wallet"
                              />
                              <div className="payment-method-info">
                                <span className="payment-method-name">Digital Wallet / UPI</span>
                                <span className="payment-method-desc">
                                  Apple Pay, Google Pay, PhonePe, Paytm
                                </span>
                              </div>
                              <Wallet size={20} className="payment-method-icon" />
                            </div>

                            {paymentData.method === "wallet" && (
                              <div className="wallet-options-subrow">
                                {["applepay", "googlepay", "phonepe", "paytm"].map((w) => (
                                  <button
                                    key={w}
                                    type="button"
                                    className={`wallet-sub-btn ${
                                      paymentData.selectedWallet === w ? "active" : ""
                                    }`}
                                    onClick={() =>
                                      setPaymentData((prev) => ({ ...prev, selectedWallet: w }))
                                    }
                                  >
                                    {w === "applepay" && " Apple Pay"}
                                    {w === "googlepay" && "Google Pay"}
                                    {w === "phonepe" && "PhonePe / UPI"}
                                    {w === "paytm" && "Paytm Wallet"}
                                  </button>
                                ))}
                              </div>
                            )}
                          </label>

                          {/* Option 3: Cash on Delivery */}
                          <label
                            className={`payment-method-card ${
                              paymentData.method === "cod" ? "is-selected" : ""
                            }`}
                          >
                            <div className="payment-method-top">
                              <input
                                type="radio"
                                name="method"
                                value="cod"
                                checked={paymentData.method === "cod"}
                                onChange={handlePaymentChange}
                                id="payment-method-cod"
                              />
                              <div className="payment-method-info">
                                <span className="payment-method-name">Cash on Delivery (COD)</span>
                                <span className="payment-method-desc">
                                  Pay via Cash or QR code when your parcel arrives
                                </span>
                              </div>
                              <Banknote size={20} className="payment-method-icon" />
                            </div>

                            {paymentData.method === "cod" && (
                              <p className="cod-notice">
                                ✓ Cash on delivery is available for your PIN code. Keep exact change or
                                scan courier QR code upon arrival.
                              </p>
                            )}
                          </label>

                          {/* Option 4: Online Bank Payment (Net Banking) */}
                          <label
                            className={`payment-method-card ${
                              paymentData.method === "netbanking" ? "is-selected" : ""
                            }`}
                          >
                            <div className="payment-method-top">
                              <input
                                type="radio"
                                name="method"
                                value="netbanking"
                                checked={paymentData.method === "netbanking"}
                                onChange={handlePaymentChange}
                                id="payment-method-netbanking"
                              />
                              <div className="payment-method-info">
                                <span className="payment-method-name">Online Bank Payment</span>
                                <span className="payment-method-desc">
                                  Direct net banking transfer via all major Indian &amp; Global banks
                                </span>
                              </div>
                              <Landmark size={20} className="payment-method-icon" />
                            </div>

                            {paymentData.method === "netbanking" && (
                              <div className="bank-select-wrap">
                                <label htmlFor="selectedBank">Choose Your Bank</label>
                                <select
                                  id="selectedBank"
                                  name="selectedBank"
                                  value={paymentData.selectedBank}
                                  onChange={handlePaymentChange}
                                >
                                  <option value="hdfc">HDFC Bank</option>
                                  <option value="icici">ICICI Bank</option>
                                  <option value="sbi">State Bank of India (SBI)</option>
                                  <option value="axis">Axis Bank</option>
                                  <option value="kotak">Kotak Mahindra Bank</option>
                                  <option value="other">Other National &amp; Global Banks</option>
                                </select>
                              </div>
                            )}
                          </label>
                        </div>

                        {/* Secure Payment Icons Row */}
                        <div className="checkout-security-badges-card">
                          <div className="security-badges-header">
                            <ShieldCheck size={18} className="shield-icon" />
                            <strong>100% Secure &amp; Protected Payment</strong>
                          </div>
                          <div className="security-badges-list">
                            <span className="security-badge-item">256-Bit SSL Encryption</span>
                            <span className="security-badge-item">PCI-DSS Compliant</span>
                            <span className="security-badge-item">Verified by Visa</span>
                            <span className="security-badge-item">Mastercard Identity Check</span>
                          </div>
                        </div>

                        {/* Step 2 Actions */}
                        <div className="checkout-step-footer">
                          <button
                            type="button"
                            className="checkout-back-link"
                            onClick={() => setStep(1)}
                          >
                            <ArrowLeft size={16} /> Back to Shipping
                          </button>

                          <button
                            type="submit"
                            className="button button-dark checkout-continue-btn"
                            id="continue-to-review-btn"
                          >
                            <span>Continue to Order Review</span>
                            <ChevronRight size={16} />
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* ==================================================== */}
                  {/* STEP 3: ORDER REVIEW & PLACE ORDER                   */}
                  {/* ==================================================== */}
                  {step === 3 && (
                    <div className="checkout-step-content" id="step-review-section">
                      <div className="checkout-step-heading">
                        <h2>3. Order Review</h2>
                        <p className="checkout-step-sub">
                          Please review your order details, shipping address, and payment method
                          before placing your order.
                        </p>
                      </div>

                      {/* Recaps Container */}
                      <div className="checkout-recaps-grid">
                        {/* Shipping Recap */}
                        <div className="checkout-recap-box">
                          <div className="recap-header">
                            <span className="recap-title">Shipping Address</span>
                            <button
                              type="button"
                              className="recap-edit-btn"
                              onClick={() => setStep(1)}
                            >
                              Edit
                            </button>
                          </div>
                          <div className="recap-body">
                            <strong>{shippingData.fullName}</strong>
                            <p>{shippingData.address}</p>
                            <p>
                              {shippingData.city}, {shippingData.state} - {shippingData.postalCode}
                            </p>
                            <p>{shippingData.country}</p>
                            <span className="recap-sub">
                              Phone: {shippingData.phone} • Email: {shippingData.email}
                            </span>
                          </div>
                        </div>

                        {/* Payment Recap */}
                        <div className="checkout-recap-box">
                          <div className="recap-header">
                            <span className="recap-title">Payment Method</span>
                            <button
                              type="button"
                              className="recap-edit-btn"
                              onClick={() => setStep(2)}
                            >
                              Edit
                            </button>
                          </div>
                          <div className="recap-body">
                            {paymentData.method === "card" && (
                              <>
                                <strong>Credit / Debit Card</strong>
                                <p>Card ending in {paymentData.cardNumber.slice(-4)}</p>
                                <span className="recap-sub">Expires {paymentData.cardExpiry}</span>
                              </>
                            )}
                            {paymentData.method === "wallet" && (
                              <>
                                <strong>Digital Wallet</strong>
                                <p>Authorized via {paymentData.selectedWallet.toUpperCase()}</p>
                                <span className="recap-sub">Instant One-Touch Payment</span>
                              </>
                            )}
                            {paymentData.method === "cod" && (
                              <>
                                <strong>Cash on Delivery</strong>
                                <p>Pay upon delivery at your doorstep</p>
                                <span className="recap-sub">Eligible for cash or UPI scan</span>
                              </>
                            )}
                            {paymentData.method === "netbanking" && (
                              <>
                                <strong>Online Bank Payment</strong>
                                <p>Bank: {paymentData.selectedBank.toUpperCase()}</p>
                                <span className="recap-sub">Encrypted Bank Portal Gateway</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Delivery Speed Options */}
                      <div className="checkout-delivery-speed-box">
                        <h4>Select Delivery Speed</h4>
                        <div className="delivery-speed-options">
                          <label
                            className={`delivery-speed-label ${
                              reviewData.deliveryOption === "standard" ? "active" : ""
                            }`}
                          >
                            <input
                              type="radio"
                              name="deliveryOption"
                              value="standard"
                              checked={reviewData.deliveryOption === "standard"}
                              onChange={(e) =>
                                setReviewData((prev) => ({
                                  ...prev,
                                  deliveryOption: e.target.value
                                }))
                              }
                            />
                            <div>
                              <strong>Standard Delivery (3–5 Business Days)</strong>
                              <span>Complimentary tracked shipping with SMS notifications</span>
                            </div>
                            <span className="speed-price">FREE</span>
                          </label>

                          <label
                            className={`delivery-speed-label ${
                              reviewData.deliveryOption === "express" ? "active" : ""
                            }`}
                          >
                            <input
                              type="radio"
                              name="deliveryOption"
                              value="express"
                              checked={reviewData.deliveryOption === "express"}
                              onChange={(e) =>
                                setReviewData((prev) => ({
                                  ...prev,
                                  deliveryOption: e.target.value
                                }))
                              }
                            />
                            <div>
                              <strong>Priority Express (1–2 Business Days)</strong>
                              <span>Guaranteed fast track dispatch with priority packing</span>
                            </div>
                            <span className="speed-price">{formatPrice(199)}</span>
                          </label>
                        </div>
                      </div>

                      {/* Order Items Table in Review */}
                      <div className="checkout-review-items-table">
                        <h4>Items in Your Order ({cart.length})</h4>
                        <div className="review-items-list">
                          {cart.map((item) => (
                            <div key={item.id} className="review-item-row">
                              <img
                                src={item.product?.image || item.product?.gallery?.[0]}
                                alt={item.product?.name}
                              />
                              <div className="review-item-details">
                                <h5>{item.product?.name}</h5>
                                <span>
                                  Color: {item.selectedColor || "Gold"} • Qty: {item.quantity}
                                </span>
                              </div>
                              <div className="review-item-price">
                                <strong>
                                  {formatPrice(
                                    (item.product?.price || 0) * item.quantity
                                  )}
                                </strong>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <form onSubmit={handlePlaceOrder} className="checkout-place-order-form">
                        {/* Terms and Privacy Checkbox */}
                        <div className="checkout-terms-card">
                          <label className="checkout-terms-label">
                            <input
                              type="checkbox"
                              checked={reviewData.agreedToTerms}
                              onChange={(e) => {
                                setReviewData((prev) => ({
                                  ...prev,
                                  agreedToTerms: e.target.checked
                                }));
                                if (errors.terms) {
                                  setErrors((prev) => {
                                    const next = { ...prev };
                                    delete next.terms;
                                    return next;
                                  });
                                }
                              }}
                              id="terms-privacy-checkbox"
                              required
                            />
                            <span>
                              I agree to the{" "}
                              <Link to="/shipping-returns" target="_blank">
                                Terms of Service
                              </Link>{" "}
                              and{" "}
                              <Link to="/shipping-returns" target="_blank">
                                Privacy Policy
                              </Link>
                              . <span className="required-star">*</span>
                            </span>
                          </label>
                          {errors.terms && (
                            <span className="field-error-msg" role="alert">
                              <AlertCircle size={13} /> {errors.terms}
                            </span>
                          )}
                        </div>

                        {/* Place Order CTA Button */}
                        <div className="checkout-final-action-row">
                          <button
                            type="button"
                            className="checkout-back-link"
                            onClick={() => setStep(2)}
                          >
                            <ArrowLeft size={16} /> Back to Payment
                          </button>

                          <button
                            type="submit"
                            className="button button-gold checkout-place-order-btn"
                            disabled={isSubmitting}
                            id="place-order-button"
                          >
                            {isSubmitting ? (
                              <>
                                <Loader2 size={18} className="checkout-spinner" />
                                <span>Securing Your Order...</span>
                              </>
                            ) : (
                              <>
                                <Lock size={16} />
                                <span>Place Order • {formatPrice(grandTotal)}</span>
                              </>
                            )}
                          </button>
                        </div>
                      </form>
                    </div>
                  )}
                </div>

                {/* ==================================================== */}
                {/* DESKTOP ORDER SUMMARY SIDEBAR                        */}
                {/* ==================================================== */}
                <aside className="checkout-sidebar-column">
                  <div className="checkout-order-summary-card">
                    <div className="summary-header">
                      <h3>Order Summary</h3>
                      <span className="summary-count-badge">
                        {cart.length} {cart.length === 1 ? "Piece" : "Pieces"}
                      </span>
                    </div>

                    {/* Cart Items List */}
                    <div className="checkout-sidebar-items">
                      {cart.map((item) => (
                        <div key={item.id} className="checkout-sidebar-item">
                          <div className="item-thumb-wrap">
                            <img
                              src={item.product?.image || item.product?.gallery?.[0]}
                              alt={item.product?.name}
                            />
                            <span className="item-qty-badge">{item.quantity}</span>
                          </div>
                          <div className="item-info">
                            <h4 className="item-name">{item.product?.name}</h4>
                            <span className="item-variant">
                              Color: {item.selectedColor || "Gold"}
                            </span>
                          </div>
                          <strong className="item-price">
                            {formatPrice((item.product?.price || 0) * item.quantity)}
                          </strong>
                        </div>
                      ))}
                    </div>

                    {/* Price Breakdown */}
                    <div className="summary-breakdown">
                      <div className="summary-line">
                        <span>Subtotal</span>
                        <strong>{formatPrice(cartSubtotal)}</strong>
                      </div>

                      {appliedPromo && discountAmount > 0 && (
                        <div className="summary-line discount">
                          <span>Promo ({appliedPromo.code})</span>
                          <span>-{formatPrice(discountAmount)}</span>
                        </div>
                      )}

                      <div className="summary-line">
                        <span>Shipping Fee</span>
                        <strong>
                          {shipping === 0 ? "FREE" : formatPrice(shipping)}
                        </strong>
                      </div>

                      {deliverySurcharge > 0 && (
                        <div className="summary-line">
                          <span>Priority Dispatch</span>
                          <strong>{formatPrice(deliverySurcharge)}</strong>
                        </div>
                      )}

                      <div className="summary-line">
                        <span>Estimated Tax (3% GST)</span>
                        <strong>{formatPrice(estimatedTax)}</strong>
                      </div>

                      <div className="summary-divider" />

                      <div className="summary-total-line">
                        <span>Total Due</span>
                        <strong className="summary-grand-total" id="checkout-sidebar-grand-total">
                          {formatPrice(grandTotal)}
                        </strong>
                      </div>
                    </div>

                    {/* Security Badge in Sidebar */}
                    <div className="checkout-sidebar-security">
                      <Lock size={15} />
                      <span>256-Bit SSL Encrypted Checkout</span>
                    </div>

                    <div className="checkout-guarantee-note">
                      ✦ Complimentary unboxing gift box &amp; 7-day doorstep exchange.
                    </div>
                  </div>
                </aside>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}