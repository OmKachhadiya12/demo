import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Trash2,
  Heart,
  ArrowLeft,
  LockKeyhole,
  Truck,
  ShieldCheck,
  Tag,
  Check,
  Sparkles,
  ShoppingBag,
  Plus,
  Minus,
  X,
  CreditCard,
  Gift
} from "lucide-react";
import { formatPrice, products } from "../data/products";
import { useStore } from "../context/StoreContext";
import ProductCard from "../components/ProductCard";

export default function Cart() {
  const navigate = useNavigate();
  const {
    cart,
    cartCount,
    cartSubtotal,
    appliedPromo,
    discountAmount,
    shipping,
    estimatedTax,
    cartTotal,
    updateQuantity,
    removeFromCart,
    moveToWishlist,
    applyPromoCode,
    removePromoCode,
    addToCart
  } = useStore();

  const [promoInput, setPromoInput] = useState("");
  const [promoMessage, setPromoMessage] = useState(null);

  // Free shipping threshold
  // Standard threshold: ₹1,999 ($50 USD equivalent)
  const FREE_SHIPPING_THRESHOLD = 1999;
  const isFreeShippingUnlocked = cartSubtotal >= FREE_SHIPPING_THRESHOLD || appliedPromo?.freeShipping;
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - cartSubtotal);
  const freeShippingProgress = Math.min(
    100,
    Math.round((cartSubtotal / FREE_SHIPPING_THRESHOLD) * 100)
  );

  // Recommended products (excluding items currently in cart)
  const cartProductIds = useMemo(
    () => new Set(cart.map((item) => item.product?.id || item.id)),
    [cart]
  );

  const recommendedProducts = useMemo(() => {
    return products
      .filter((product) => !cartProductIds.has(product.id))
      .slice(0, 4);
  }, [cartProductIds]);

  // Color swatch hex map
  const colorSwatchMap = {
    Gold: "#D4AF37",
    "Rose gold": "#E6A89B",
    Silver: "#C4C8CC"
  };

  // Promo code submission handler
  function handleApplyPromo(e) {
    e.preventDefault();
    if (!promoInput.trim()) return;

    const res = applyPromoCode(promoInput);
    setPromoMessage(res);
    if (res.success) {
      setPromoInput("");
    }
  }

  // Quick starter helper for demonstration if cart was cleared
  function handleAddSampleItem() {
    const flagship = products.find((p) => p.id === "p0") || products[0];
    addToCart({ ...flagship, selectedColor: "Gold", selectedSize: 'Standard (16" + 2")' }, 1);
  }

  return (
    <div className="cart-page">
      {/* Breadcrumb Navigation Bar */}
      <nav className="pdp-breadcrumbs-bar" aria-label="Breadcrumb">
        <div className="container">
          <ol className="pdp-breadcrumbs-list">
            <li>
              <Link to="/">Home</Link>
            </li>
            <span className="pdp-breadcrumb-sep">/</span>
            <li>
              <Link to="/shop">Shop</Link>
            </li>
            <span className="pdp-breadcrumb-sep">/</span>
            <li className="active" aria-current="page">
              Shopping Bag ({cartCount})
            </li>
          </ol>
        </div>
      </nav>

      <section className="section cart-section">
        <div className="container">
          {/* Page Header */}
          <div className="cart-header-row">
            <div>
              <span className="eyebrow">Your Selections</span>
              <h1 className="cart-page-title">Shopping Bag</h1>
            </div>
            {cart.length > 0 && (
              <span className="cart-header-count">
                {cartCount} {cartCount === 1 ? "item" : "items"}
              </span>
            )}
          </div>

          {cart.length === 0 ? (
            /* Empty State */
            <div className="cart-empty-container">
              <div className="cart-empty-icon-wrap">
                <ShoppingBag size={42} strokeWidth={1.2} />
              </div>
              <h2>Your shopping bag is empty</h2>
              <p>
                Explore our fine imitation jewelry collection crafted with 18K micro-gold
                finish and anti-tarnish protection.
              </p>
              <div className="cart-empty-actions">
                <Link to="/shop" className="button button-dark">
                  Explore Catalog
                </Link>
                <button
                  type="button"
                  className="button button-outline"
                  onClick={handleAddSampleItem}
                  id="add-sample-cart-button"
                >
                  <Sparkles size={16} />
                  Add Aurora Necklace (Demo)
                </button>
              </div>
            </div>
          ) : (
            /* Active Cart Layout */
            <>
              {/* Free-Shipping Progress Bar */}
              <div className="free-shipping-card" id="free-shipping-progress-banner">
                <div className="free-shipping-header">
                  <div className="free-shipping-msg-wrap">
                    <Truck size={18} className="free-shipping-truck-icon" />
                    <span className="free-shipping-message">
                      {isFreeShippingUnlocked ? (
                        <>
                          <strong>Congratulations!</strong> You have unlocked{" "}
                          <span className="free-shipping-highlight">FREE Express Shipping</span>!
                        </>
                      ) : (
                        <>
                          You are <strong>$15 away from free shipping.</strong>{" "}
                          <span className="free-shipping-sub">
                            (Add {formatPrice(remainingForFreeShipping)} more to qualify)
                          </span>
                        </>
                      )}
                    </span>
                  </div>
                  <span className="free-shipping-pct-tag">
                    {freeShippingProgress}%
                  </span>
                </div>

                {/* Visual Progress Bar Track */}
                <div className="free-shipping-track" role="progressbar" aria-valuenow={freeShippingProgress} aria-valuemin={0} aria-valuemax={100}>
                  <div
                    className={`free-shipping-fill ${isFreeShippingUnlocked ? "is-unlocked" : ""}`}
                    style={{ width: `${freeShippingProgress}%` }}
                  />
                </div>
              </div>

              {/* Main 2-Column Split Cart Layout */}
              <div className="cart-layout">
                {/* ==================================================== */}
                {/* LEFT COLUMN: Cart Items List                         */}
                {/* ==================================================== */}
                <div className="cart-items-column">
                  <div className="cart-items-table-header">
                    <span>Product &amp; Details</span>
                    <span className="cart-header-align-right">Total Price</span>
                  </div>

                  <div className="cart-items-list">
                    {cart.map((item) => {
                      const prod = item.product || {};
                      const itemColor =
                        item.selectedColor || prod.selectedColor || prod.color || "Gold";
                      const itemSize =
                        item.selectedSize || prod.selectedSize || 'Standard (16" + 2")';
                      const itemUnitPrice = prod.price || 0;
                      const itemTotalPrice = itemUnitPrice * item.quantity;
                      const swatchColor = colorSwatchMap[itemColor] || "#D4AF37";

                      return (
                        <article className="cart-item-card" key={item.id} id={`cart-item-${item.id}`}>
                          {/* Product Image */}
                          <Link
                            to={`/product/${prod.slug || "aurora-gold-plated-necklace"}`}
                            className="cart-item-image-wrap"
                          >
                            <img
                              src={prod.image || prod.gallery?.[0]}
                              alt={prod.name}
                              className="cart-item-image"
                            ></img>
                          </Link>

                          {/* Product Details & Actions */}
                          <div className="cart-item-content">
                            <div className="cart-item-top-row">
                              <div>
                                <span className="cart-item-category">
                                  {prod.category || "Jewelry"} • {prod.finish || "18K Gold Plated"}
                                </span>
                                <h3 className="cart-item-title">
                                  <Link to={`/product/${prod.slug || "aurora-gold-plated-necklace"}`}>
                                    {prod.name}
                                  </Link>
                                </h3>
                              </div>

                              {/* Item Total Price (Desktop View) */}
                              <div className="cart-item-total-price">
                                <strong>{formatPrice(itemTotalPrice)}</strong>
                              </div>
                            </div>

                            {/* Selected Color & Size Metadata */}
                            <div className="cart-item-attributes">
                              <div className="cart-item-badge-pill">
                                <span
                                  className="cart-swatch-dot"
                                  style={{ backgroundColor: swatchColor }}
                                />
                                <span>Color: <strong>{itemColor}</strong></span>
                              </div>

                              <div className="cart-item-badge-pill">
                                <span>Size: <strong>{itemSize}</strong></span>
                              </div>
                            </div>

                            {/* Unit Price Display */}
                            <div className="cart-item-unit-price">
                              <span>Unit Price: <strong>{formatPrice(itemUnitPrice)}</strong> each</span>
                              {prod.oldPrice && (
                                <del className="cart-item-unit-old-price">
                                  {formatPrice(prod.oldPrice)}
                                </del>
                              )}
                            </div>

                            {/* Controls Row: Stepper & Action Buttons */}
                            <div className="cart-item-controls-row">
                              {/* Quantity Stepper */}
                              <div className="cart-quantity-stepper" aria-label="Adjust quantity">
                                <button
                                  type="button"
                                  className="cart-qty-btn"
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                  aria-label="Decrease quantity"
                                  disabled={item.quantity <= 1}
                                >
                                  <Minus size={13} />
                                </button>
                                <span className="cart-qty-value">{item.quantity}</span>
                                <button
                                  type="button"
                                  className="cart-qty-btn"
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                  aria-label="Increase quantity"
                                  disabled={item.quantity >= 10}
                                >
                                  <Plus size={13} />
                                </button>
                              </div>

                              {/* Move to Wishlist Action Button */}
                              <button
                                type="button"
                                className="cart-action-btn cart-wishlist-btn"
                                onClick={() => moveToWishlist(item)}
                                aria-label={`Move ${prod.name} to wishlist`}
                                id={`move-wishlist-${item.id}`}
                              >
                                <Heart size={15} />
                                <span>Move to Wishlist</span>
                              </button>

                              {/* Remove Item Action Button */}
                              <button
                                type="button"
                                className="cart-action-btn cart-remove-btn"
                                onClick={() => removeFromCart(item.id)}
                                aria-label={`Remove ${prod.name} from cart`}
                                id={`remove-item-${item.id}`}
                              >
                                <Trash2 size={15} />
                                <span>Remove</span>
                              </button>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>

                  {/* Return to Shop Link */}
                  <div className="cart-bottom-nav">
                    <Link to="/shop" className="back-shopping-link">
                      <ArrowLeft size={16} />
                      <span>Continue Shopping</span>
                    </Link>
                  </div>
                </div>

                {/* ==================================================== */}
                {/* RIGHT COLUMN: Order Summary (Sticky)                 */}
                {/* ==================================================== */}
                <aside className="order-summary-sidebar">
                  <div className="order-summary-card">
                    <div className="order-summary-header">
                      <span className="eyebrow">Order Breakdown</span>
                      <h2 className="order-summary-title">Order Summary</h2>
                    </div>

                    {/* Breakdown Lines */}
                    <div className="summary-breakdown-list">
                      {/* Subtotal */}
                      <div className="summary-row">
                        <span className="summary-label">Subtotal ({cartCount} items)</span>
                        <strong className="summary-value" id="cart-summary-subtotal">
                          {formatPrice(cartSubtotal)}
                        </strong>
                      </div>

                      {/* Promo Code Discount */}
                      {appliedPromo && discountAmount > 0 && (
                        <div className="summary-row summary-discount-row">
                          <div className="summary-discount-label">
                            <Tag size={14} />
                            <span>Promo ({appliedPromo.code})</span>
                            <button
                              type="button"
                              className="remove-promo-btn"
                              onClick={removePromoCode}
                              title="Remove coupon"
                              aria-label="Remove promo code"
                            >
                              <X size={12} />
                            </button>
                          </div>
                          <span className="summary-discount-amount" id="cart-summary-discount">
                            -{formatPrice(discountAmount)}
                          </span>
                        </div>
                      )}

                      {/* Shipping Fee */}
                      <div className="summary-row">
                        <span className="summary-label">Shipping Fee</span>
                        <span className="summary-value" id="cart-summary-shipping">
                          {shipping === 0 ? (
                            <span className="free-shipping-tag">FREE</span>
                          ) : (
                            formatPrice(shipping)
                          )}
                        </span>
                      </div>

                      {/* Tax */}
                      <div className="summary-row">
                        <span className="summary-label">Estimated Tax (3% GST)</span>
                        <span className="summary-value" id="cart-summary-tax">
                          {formatPrice(estimatedTax)}
                        </span>
                      </div>
                    </div>

                    {/* Promo Code Input Field */}
                    <div className="promo-code-container">
                      <form onSubmit={handleApplyPromo} className="promo-code-form">
                        <div className="promo-input-wrap">
                          <Tag size={15} className="promo-input-icon" />
                          <input
                            type="text"
                            value={promoInput}
                            onChange={(e) => setPromoInput(e.target.value)}
                            placeholder="Promo code (e.g. SHINE10)"
                            aria-label="Enter promotional discount code"
                            id="promo-code-input"
                          />
                        </div>
                        <button
                          type="submit"
                          className="promo-apply-button"
                          id="apply-promo-button"
                        >
                          Apply
                        </button>
                      </form>

                      {promoMessage && (
                        <div
                          className={`promo-feedback ${
                            promoMessage.success ? "is-success" : "is-error"
                          }`}
                        >
                          {promoMessage.message}
                        </div>
                      )}

                      {!appliedPromo && (
                        <p className="promo-hint-note">
                          ✦ Use code <strong>SHINE10</strong> for 10% off or <strong>LUSTRE20</strong> for 20% off.
                        </p>
                      )}
                    </div>

                    <div className="summary-divider" />

                    {/* Final Total */}
                    <div className="summary-final-total-row">
                      <div>
                        <span className="final-total-label">Final Total</span>
                        <span className="final-total-sub">Includes all taxes &amp; duties</span>
                      </div>
                      <strong className="final-total-amount" id="cart-summary-total">
                        {formatPrice(cartTotal)}
                      </strong>
                    </div>

                    {/* Proceed to Checkout CTA */}
                    <button
                      type="button"
                      className="button button-gold summary-checkout-cta"
                      onClick={() => navigate("/checkout")}
                      id="proceed-to-checkout-button"
                    >
                      Proceed to Checkout
                    </button>

                    {/* Secure Checkout Message */}
                    <div className="secure-checkout-card">
                      <div className="secure-checkout-header">
                        <ShieldCheck size={18} className="secure-shield-icon" />
                        <div>
                          <strong>Guaranteed Safe &amp; Secure Checkout</strong>
                          <span>256-Bit Bank-Grade SSL Encryption</span>
                        </div>
                      </div>

                      <div className="payment-badges-row">
                        <span className="payment-badge">UPI</span>
                        <span className="payment-badge">VISA</span>
                        <span className="payment-badge">Mastercard</span>
                        <span className="payment-badge">RuPay</span>
                        <span className="payment-badge">NetBanking</span>
                      </div>
                    </div>

                    {/* Unboxing & Guarantee perk */}
                    <div className="cart-perks-box">
                      <div className="cart-perk-item">
                        <Gift size={15} />
                        <span>Signature gift packaging included</span>
                      </div>
                      <div className="cart-perk-item">
                        <Sparkles size={15} />
                        <span>7-Day doorstep replacement guarantee</span>
                      </div>
                    </div>
                  </div>
                </aside>
              </div>
            </>
          )}
        </div>
      </section>

      {/* ==================================================== */}
      {/* SECTION: Recommended Products Below Cart             */}
      {/* ==================================================== */}
      <section className="section cart-recommended-section">
        <div className="container">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Curated Complements</span>
              <h2>You May Also Love</h2>
            </div>
            <Link to="/shop" className="pdp-see-all-link">
              Explore all jewelry →
            </Link>
          </div>

          <div className="product-grid" id="cart-recommended-grid">
            {recommendedProducts.map((recProduct, idx) => (
              <ProductCard
                key={recProduct.id}
                product={recProduct}
                index={idx}
                showQuickView={true}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}