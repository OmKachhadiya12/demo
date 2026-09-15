import { useMemo, useState, useRef } from "react";
import {
  Heart,
  Minus,
  Plus,
  ShieldCheck,
  Truck,
  RotateCcw,
  Star,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ZoomIn,
  Loader2,
  Check,
  ShoppingBag,
  Sparkles,
  Calendar,
  MapPin,
  Award,
  PackageCheck
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getProductBySlug, formatPrice, products } from "../data/products";
import { useStore } from "../context/StoreContext";
import ProductCard from "../components/ProductCard";

export default function ProductDetails() {
  const { slug } = useParams();
  const navigate = useNavigate();

  // Find product or fallback to the flagship Aurora necklace
  const product =
    getProductBySlug(slug) ||
    getProductBySlug("aurora-gold-plated-necklace") ||
    products[0];

  const {
    addToCart,
    toggleWishlist,
    isWishlisted,
    showToast
  } = useStore();

  // Gallery state
  const [activeImage, setActiveImage] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const galleryRef = useRef(null);

  // Buy box state
  const [selectedColor, setSelectedColor] = useState(
    product?.color || product?.availableColors?.[0] || "Gold"
  );
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  // Delivery checker state
  const [pinCode, setPinCode] = useState("");
  const [pinStatus, setPinStatus] = useState(null); // { success: boolean, message: string }

  // Accordion state
  const [openAccordions, setOpenAccordions] = useState({
    details: true,
    material: false,
    shipping: false,
    returns: false,
    reviews: false
  });

  // Reviews state
  const [reviewsList, setReviewsList] = useState(product?.customerReviews || []);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewerName, setReviewerName] = useState("");
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  // "Complete the Look" Bundle state
  const bundleItems = useMemo(() => {
    const earring = products.find((p) => p.id === "p1") || products[1];
    const bracelet = products.find((p) => p.id === "p4") || products[4];
    const ring = products.find((p) => p.id === "p3") || products[3];
    return [earring, bracelet, ring].filter(Boolean);
  }, []);

  const [selectedBundleIds, setSelectedBundleIds] = useState(() =>
    bundleItems.map((item) => item.id)
  );
  const [isAddingBundle, setIsAddingBundle] = useState(false);

  // "You May Also Like" Related Products
  const relatedProducts = useMemo(() => {
    return products
      .filter((item) => item.id !== product?.id)
      .slice(0, 4);
  }, [product]);

  if (!product) {
    return (
      <section className="section">
        <div className="container empty-state">
          <span className="empty-icon">✦</span>
          <h1>Piece not found</h1>
          <p>The product you are looking for may have moved.</p>
          <Link to="/shop" className="button button-dark">
            Return to shop
          </Link>
        </div>
      </section>
    );
  }

  const wished = isWishlisted(product.id);
  const gallery = product.gallery && product.gallery.length > 0 ? product.gallery : [product.image];

  // Calculate discount percentage
  const discountPercent =
    product.oldPrice && product.oldPrice > product.price
      ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
      : 32;

  // Estimated delivery calculation (3 to 5 days from today)
  const deliveryStartDate = new Date();
  deliveryStartDate.setDate(deliveryStartDate.getDate() + 3);
  const deliveryEndDate = new Date();
  deliveryEndDate.setDate(deliveryEndDate.getDate() + 5);
  const options = { month: "short", day: "numeric" };
  const formattedDeliveryRange = `${deliveryStartDate.toLocaleDateString(
    "en-US",
    options
  )} – ${deliveryEndDate.toLocaleDateString("en-US", options)}`;

  // Gallery Navigation Handlers
  function prevImage() {
    setActiveImage((curr) => (curr - 1 + gallery.length) % gallery.length);
  }

  function nextImage() {
    setActiveImage((curr) => (curr + 1) % gallery.length);
  }

  function handleMouseMove(e) {
    if (!galleryRef.current) return;
    const rect = galleryRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    setZoomPos({ x, y });
  }

  // Add to Bag with realistic loading state
  async function handleAddToCart() {
    if (isAdding) return;
    setIsAdding(true);
    await new Promise((r) => setTimeout(r, 600));

    addToCart(
      {
        ...product,
        selectedColor
      },
      quantity
    );

    setIsAdding(false);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2200);
  }

  // Buy Now handler
  function handleBuyNow() {
    addToCart(
      {
        ...product,
        selectedColor
      },
      quantity
    );
    navigate("/checkout");
  }

  // Pin Code delivery check handler
  function handleCheckDelivery(e) {
    e.preventDefault();
    const trimmed = pinCode.trim();
    if (!/^\d{5,6}$/.test(trimmed)) {
      setPinStatus({
        success: false,
        message: "Please enter a valid 6-digit delivery PIN code."
      });
      return;
    }

    setPinStatus({
      success: true,
      message: `Delivery available to ${trimmed}! Estimated arrival by ${formattedDeliveryRange}. Free shipping & cash on delivery available.`
    });
  }

  // Accordion toggle helper
  function toggleAccordion(key) {
    setOpenAccordions((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  }

  // Review submission handler
  function handleReviewSubmit(e) {
    e.preventDefault();
    if (!reviewerName.trim() || !reviewComment.trim()) return;

    const newEntry = {
      id: Date.now(),
      author: reviewerName.trim(),
      rating: reviewRating,
      date: "Just now",
      verified: true,
      title: reviewTitle.trim() || "Stunning piece",
      comment: reviewComment.trim()
    };

    setReviewsList([newEntry, ...reviewsList]);
    setReviewSubmitted(true);
    setReviewerName("");
    setReviewTitle("");
    setReviewComment("");
    setTimeout(() => {
      setShowReviewForm(false);
      setReviewSubmitted(false);
    }, 2000);
  }

  // Complete the Look bundle toggle
  function toggleBundleItem(id) {
    setSelectedBundleIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }

  // Bundle pricing calculation
  const totalBundleOriginalPrice =
    product.price +
    bundleItems
      .filter((item) => selectedBundleIds.includes(item.id))
      .reduce((sum, item) => sum + item.price, 0);

  const bundleDiscount = Math.round(totalBundleOriginalPrice * 0.15);
  const finalBundlePrice = totalBundleOriginalPrice - bundleDiscount;

  async function handleAddBundleToBag() {
    if (isAddingBundle) return;
    setIsAddingBundle(true);

    // Add main product
    addToCart({ ...product, selectedColor }, 1);

    // Add selected bundle accessories
    bundleItems
      .filter((item) => selectedBundleIds.includes(item.id))
      .forEach((item) => {
        addToCart(item, 1);
      });

    await new Promise((r) => setTimeout(r, 700));
    setIsAddingBundle(false);
    showToast("Complete styling set added to bag with 15% bundle discount!", "success");
  }

  // Color swatch hex map
  const colorSwatchMap = {
    Gold: "#D4AF37",
    "Rose gold": "#E6A89B",
    Silver: "#C4C8CC"
  };

  return (
    <div className="product-details-page">
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
            <li>
              <Link to={`/category/${product.category}`}>{product.category}</Link>
            </li>
            <span className="pdp-breadcrumb-sep">/</span>
            <li className="active" aria-current="page">
              {product.name}
            </li>
          </ol>
        </div>
      </nav>

      {/* Main Product Showcase Section */}
      <section className="product-details-section">
        <div className="container">
          <div className="product-details-grid">
            {/* ==================================================== */}
            {/* LEFT SIDE: Large Image, Zoom, Arrows & Thumbnails   */}
            {/* ==================================================== */}
            <div className="pdp-gallery-column">
              <div
                className="pdp-main-image-container"
                ref={galleryRef}
                onMouseEnter={() => setIsZoomed(true)}
                onMouseLeave={() => setIsZoomed(false)}
                onMouseMove={handleMouseMove}
              >
                {/* Badge */}
                {product.badge && (
                  <span className={`pdp-badge badge-${product.badge.toLowerCase()}`}>
                    {product.badge}
                  </span>
                )}

                {/* Main Product Image with Zoom */}
                <div className="pdp-zoom-viewport">
                  <img
                    src={gallery[activeImage]}
                    alt={`${product.name} - View ${activeImage + 1}`}
                    className="pdp-main-image"
                    style={{
                      transform: isZoomed ? "scale(2.2)" : "scale(1)",
                      transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                      transition: isZoomed ? "transform 0.08s ease-out" : "transform 0.35s ease-out"
                    }}
                  />
                </div>

                {/* Hover to Zoom indicator */}
                <div className={`pdp-zoom-indicator ${isZoomed ? "active" : ""}`}>
                  <ZoomIn size={14} />
                  <span>{isZoomed ? "2.2x Lens Active" : "Hover image to zoom"}</span>
                </div>

                {/* Navigation Arrows */}
                <button
                  type="button"
                  className="pdp-gallery-arrow pdp-gallery-arrow-prev"
                  onClick={(e) => {
                    e.stopPropagation();
                    prevImage();
                  }}
                  aria-label="Previous product image"
                >
                  <ChevronLeft size={22} />
                </button>

                <button
                  type="button"
                  className="pdp-gallery-arrow pdp-gallery-arrow-next"
                  onClick={(e) => {
                    e.stopPropagation();
                    nextImage();
                  }}
                  aria-label="Next product image"
                >
                  <ChevronRight size={22} />
                </button>

                {/* Counter overlay */}
                <span className="pdp-gallery-counter">
                  {activeImage + 1} / {gallery.length}
                </span>
              </div>

              {/* Thumbnail Image Gallery */}
              <div className="pdp-thumbnails-row">
                {gallery.map((imgUrl, index) => (
                  <button
                    key={`${imgUrl}-${index}`}
                    type="button"
                    className={`pdp-thumbnail-button ${
                      activeImage === index ? "is-active" : ""
                    }`}
                    onClick={() => setActiveImage(index)}
                    aria-label={`View image thumbnail ${index + 1}`}
                  >
                    <img src={imgUrl} alt={`${product.name} thumbnail ${index + 1}`} />
                  </button>
                ))}
              </div>

              {/* Quality Guarantee Mini Badges */}
              <div className="pdp-trust-pills-row">
                <div className="pdp-trust-pill">
                  <Sparkles size={16} />
                  <span>18K Micro-Gold Micron Plated</span>
                </div>
                <div className="pdp-trust-pill">
                  <ShieldCheck size={16} />
                  <span>Hypoallergenic &amp; Nickel-Free</span>
                </div>
                <div className="pdp-trust-pill">
                  <Award size={16} />
                  <span>Anti-Tarnish Protective Shield</span>
                </div>
              </div>
            </div>

            {/* ==================================================== */}
            {/* RIGHT SIDE: Product Info, Options & Buy Box          */}
            {/* ==================================================== */}
            <div className="pdp-info-column">
              {/* Eyebrow / Tag */}
              <div className="pdp-eyebrow-row">
                <span className="pdp-eyebrow-category">{product.category}</span>
                <span className="pdp-eyebrow-divider">•</span>
                <span className="pdp-eyebrow-finish">{product.finish || "18K Gold Plated"}</span>
              </div>

              {/* Product Title */}
              <h1 className="pdp-title">{product.name}</h1>

              {/* Star Rating & Review Count */}
              <div className="pdp-rating-row">
                <div className="pdp-stars" aria-label={`Rated ${product.rating} out of 5 stars`}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={16}
                      className="pdp-star-icon"
                      fill={star <= Math.round(product.rating) ? "var(--gold)" : "none"}
                    />
                  ))}
                  <span className="pdp-rating-score">{product.rating}</span>
                </div>

                <span className="pdp-rating-dot">•</span>

                <button
                  type="button"
                  className="pdp-review-link"
                  onClick={() => {
                    setOpenAccordions((prev) => ({ ...prev, reviews: true }));
                    document.getElementById("pdp-reviews-section")?.scrollIntoView({
                      behavior: "smooth"
                    });
                  }}
                >
                  {product.reviews || reviewsList.length} reviews
                </button>

                <span className="pdp-rating-dot">•</span>

                <span className="pdp-in-stock-badge">
                  <Check size={13} /> In Stock &amp; Ready to Ship
                </span>
              </div>

              {/* Pricing Section */}
              <div className="pdp-pricing-box">
                <div className="pdp-price-line">
                  <span className="pdp-current-price">{formatPrice(product.price)}</span>
                  {product.oldPrice && (
                    <del className="pdp-original-price">{formatPrice(product.oldPrice)}</del>
                  )}
                  {discountPercent > 0 && (
                    <span className="pdp-discount-tag">{discountPercent}% OFF</span>
                  )}
                </div>
                <p className="pdp-tax-note">Inclusive of all taxes • Free express shipping over ₹1,999</p>
              </div>

              {/* Short Product Description */}
              <p className="pdp-short-description">{product.description}</p>

              {/* Divider */}
              <div className="pdp-divider" />

              {/* Color Selection */}
              <div className="pdp-option-group">
                <div className="pdp-option-header">
                  <span className="pdp-option-label">Color:</span>
                  <span className="pdp-option-selected-val">{selectedColor}</span>
                </div>

                <div className="pdp-swatches-row" role="radiogroup" aria-label="Select Color">
                  {(product.availableColors || ["Gold", "Rose gold", "Silver"]).map((colorName) => {
                    const isSelected = selectedColor.toLowerCase() === colorName.toLowerCase();
                    const swatchBg = colorSwatchMap[colorName] || "#D4AF37";

                    return (
                      <button
                        key={colorName}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        className={`pdp-swatch-btn ${isSelected ? "is-selected" : ""}`}
                        onClick={() => setSelectedColor(colorName)}
                        title={colorName}
                      >
                        <span
                          className="pdp-swatch-circle"
                          style={{ backgroundColor: swatchBg }}
                        />
                        <span className="pdp-swatch-text">{colorName}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quantity Selector & Main Action Buttons */}
              <div className="pdp-actions-container">
                <div className="pdp-qty-and-cart-row">
                  {/* Quantity Stepper */}
                  <div className="pdp-quantity-stepper" aria-label="Quantity Selector">
                    <button
                      type="button"
                      className="pdp-qty-btn"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      disabled={quantity <= 1}
                      aria-label="Decrease quantity"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="pdp-qty-value">{quantity}</span>
                    <button
                      type="button"
                      className="pdp-qty-btn"
                      onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                      disabled={quantity >= 10}
                      aria-label="Increase quantity"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  {/* Add to Bag Button with Loading State */}
                  <button
                    type="button"
                    className={`button pdp-add-bag-btn ${isAdded ? "is-added" : ""}`}
                    onClick={handleAddToCart}
                    disabled={isAdding}
                    id="pdp-add-to-bag-button"
                  >
                    {isAdding ? (
                      <>
                        <Loader2 size={18} className="pdp-spinner" />
                        <span>Adding to Bag...</span>
                      </>
                    ) : isAdded ? (
                      <>
                        <Check size={18} />
                        <span>Added to Bag!</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag size={18} />
                        <span>Add to Bag</span>
                      </>
                    )}
                  </button>

                  {/* Wishlist Button */}
                  <button
                    type="button"
                    className={`pdp-wishlist-toggle ${wished ? "is-wished" : ""}`}
                    onClick={() => toggleWishlist(product)}
                    aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
                    id="pdp-wishlist-button"
                  >
                    <Heart
                      size={20}
                      fill={wished ? "var(--rose)" : "none"}
                      stroke={wished ? "var(--rose)" : "currentColor"}
                    />
                  </button>
                </div>

                {/* Buy Now Button */}
                <button
                  type="button"
                  className="button button-gold pdp-buy-now-btn"
                  onClick={handleBuyNow}
                  id="pdp-buy-now-button"
                >
                  Buy Now — Express Checkout
                </button>
              </div>

              {/* Estimated Delivery Date & PIN Checker */}
              <div className="pdp-delivery-card">
                <div className="pdp-delivery-header">
                  <Truck size={18} className="pdp-delivery-truck-icon" />
                  <div className="pdp-delivery-title-box">
                    <strong>Estimated Delivery: {formattedDeliveryRange}</strong>
                    <span>Order within next 6 hours for same-day dispatch</span>
                  </div>
                </div>

                <form onSubmit={handleCheckDelivery} className="pdp-pin-checker-form">
                  <div className="pdp-pin-input-wrap">
                    <MapPin size={15} className="pdp-pin-icon" />
                    <input
                      type="text"
                      maxLength={6}
                      value={pinCode}
                      onChange={(e) => setPinCode(e.target.value.replace(/\D/g, ""))}
                      placeholder="Enter Delivery PIN Code"
                      aria-label="Enter PIN code for delivery estimate"
                      id="pdp-pin-input"
                    />
                  </div>
                  <button type="submit" className="pdp-pin-submit-btn" id="pdp-pin-check-btn">
                    Check
                  </button>
                </form>

                {pinStatus && (
                  <div
                    className={`pdp-pin-message ${
                      pinStatus.success ? "is-success" : "is-error"
                    }`}
                  >
                    {pinStatus.message}
                  </div>
                )}
              </div>

              {/* Expandable Sections (5 Accordions) */}
              <div className="pdp-accordions-group">
                {/* 1. Product Details */}
                <div className="pdp-accordion-item">
                  <button
                    type="button"
                    className={`pdp-accordion-header ${
                      openAccordions.details ? "is-open" : ""
                    }`}
                    onClick={() => toggleAccordion("details")}
                    aria-expanded={openAccordions.details}
                  >
                    <span className="pdp-accordion-title">Product Details</span>
                    <ChevronDown
                      size={18}
                      className={`pdp-accordion-chevron ${
                        openAccordions.details ? "rotate" : ""
                      }`}
                    />
                  </button>
                  {openAccordions.details && (
                    <div className="pdp-accordion-content">
                      <ul className="pdp-details-list">
                        {(
                          product.details || [
                            "Pendant: 14mm radiant sculpted drop motif",
                            "Chain: 16 inches + 2-inch extender chain for versatile styling",
                            "Finish: 18K micro-gold plating with anti-tarnish protective lacquer",
                            "Base Metal: Hypoallergenic lead-free and nickel-free brass",
                            "Clasp: Secure lobster claw closure with engraved brand charm",
                            "Weight: 8.5 grams (featherlight all-day comfort)",
                            "SKU: LST-AUR-NK01"
                          ]
                        ).map((detail, idx) => (
                          <li key={idx}>
                            <span className="pdp-bullet-dot">✦</span>
                            <span>{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* 2. Material and Care */}
                <div className="pdp-accordion-item">
                  <button
                    type="button"
                    className={`pdp-accordion-header ${
                      openAccordions.material ? "is-open" : ""
                    }`}
                    onClick={() => toggleAccordion("material")}
                    aria-expanded={openAccordions.material}
                  >
                    <span className="pdp-accordion-title">Material and Care</span>
                    <ChevronDown
                      size={18}
                      className={`pdp-accordion-chevron ${
                        openAccordions.material ? "rotate" : ""
                      }`}
                    />
                  </button>
                  {openAccordions.material && (
                    <div className="pdp-accordion-content">
                      <p className="pdp-care-intro">
                        Our pieces are handcrafted using premium, hypoallergenic jeweler&apos;s
                        brass coated in thick 18K micron gold with a proprietary anti-tarnish shield.
                      </p>
                      <ul className="pdp-care-list">
                        {(
                          product.care || [
                            "Avoid direct contact with perfumes, hairsprays, lotions, and harsh household chemicals.",
                            "Remove before swimming, exercising, bathing, or sleeping.",
                            "Gently wipe clean with the provided micro-fiber polishing cloth after each wear.",
                            "Store separately inside the signature velvet dust pouch to prevent scratches."
                          ]
                        ).map((tip, idx) => (
                          <li key={idx}>
                            <span className="pdp-bullet-dot">✦</span>
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* 3. Shipping Information */}
                <div className="pdp-accordion-item">
                  <button
                    type="button"
                    className={`pdp-accordion-header ${
                      openAccordions.shipping ? "is-open" : ""
                    }`}
                    onClick={() => toggleAccordion("shipping")}
                    aria-expanded={openAccordions.shipping}
                  >
                    <span className="pdp-accordion-title">Shipping Information</span>
                    <ChevronDown
                      size={18}
                      className={`pdp-accordion-chevron ${
                        openAccordions.shipping ? "rotate" : ""
                      }`}
                    />
                  </button>
                  {openAccordions.shipping && (
                    <div className="pdp-accordion-content">
                      <ul className="pdp-shipping-list">
                        {(
                          product.shipping || [
                            "Dispatched within 24 hours from our Mumbai studio.",
                            "Complimentary standard shipping on all orders over ₹1,999 ($50).",
                            "Standard delivery: 3–5 business days with live SMS tracking.",
                            "Express delivery available at checkout for next-day dispatch.",
                            "All pieces arrive in an unboxing-ready signature velvet box and gift bag."
                          ]
                        ).map((item, idx) => (
                          <li key={idx}>
                            <Truck size={15} className="pdp-list-icon" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* 4. Return Policy */}
                <div className="pdp-accordion-item">
                  <button
                    type="button"
                    className={`pdp-accordion-header ${
                      openAccordions.returns ? "is-open" : ""
                    }`}
                    onClick={() => toggleAccordion("returns")}
                    aria-expanded={openAccordions.returns}
                  >
                    <span className="pdp-accordion-title">Return Policy</span>
                    <ChevronDown
                      size={18}
                      className={`pdp-accordion-chevron ${
                        openAccordions.returns ? "rotate" : ""
                      }`}
                    />
                  </button>
                  {openAccordions.returns && (
                    <div className="pdp-accordion-content">
                      <ul className="pdp-returns-list">
                        {(
                          product.returns || [
                            "7-day doorstep return and exchange window from the date of delivery.",
                            "Free return pickup arranged directly from your shipping address.",
                            "Items must be in unworn condition with original tags and packaging intact.",
                            "Full refund processed within 48 hours of return receipt."
                          ]
                        ).map((item, idx) => (
                          <li key={idx}>
                            <RotateCcw size={15} className="pdp-list-icon" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* 5. Customer Reviews */}
                <div className="pdp-accordion-item" id="pdp-reviews-section">
                  <button
                    type="button"
                    className={`pdp-accordion-header ${
                      openAccordions.reviews ? "is-open" : ""
                    }`}
                    onClick={() => toggleAccordion("reviews")}
                    aria-expanded={openAccordions.reviews}
                  >
                    <span className="pdp-accordion-title">
                      Customer Reviews ({reviewsList.length})
                    </span>
                    <ChevronDown
                      size={18}
                      className={`pdp-accordion-chevron ${
                        openAccordions.reviews ? "rotate" : ""
                      }`}
                    />
                  </button>
                  {openAccordions.reviews && (
                    <div className="pdp-accordion-content pdp-reviews-content">
                      {/* Rating Score Card */}
                      <div className="pdp-rating-overview-card">
                        <div className="pdp-score-block">
                          <span className="pdp-big-score">{product.rating}</span>
                          <div className="pdp-stars">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star key={s} size={15} fill="var(--gold)" color="var(--gold)" />
                            ))}
                          </div>
                          <span className="pdp-total-count">
                            Based on {product.reviews || reviewsList.length} reviews
                          </span>
                        </div>

                        {/* Breakdown Bars */}
                        <div className="pdp-breakdown-bars">
                          {[
                            { stars: 5, pct: 88 },
                            { stars: 4, pct: 9 },
                            { stars: 3, pct: 2 },
                            { stars: 2, pct: 1 },
                            { stars: 1, pct: 0 }
                          ].map((bar) => (
                            <div key={bar.stars} className="pdp-bar-row">
                              <span className="pdp-bar-label">{bar.stars}★</span>
                              <div className="pdp-bar-track">
                                <div
                                  className="pdp-bar-fill"
                                  style={{ width: `${bar.pct}%` }}
                                />
                              </div>
                              <span className="pdp-bar-pct">{bar.pct}%</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Write a Review Button */}
                      <div className="pdp-review-actions-bar">
                        <button
                          type="button"
                          className="button button-outline"
                          onClick={() => setShowReviewForm((v) => !v)}
                        >
                          {showReviewForm ? "Cancel Review" : "Write a Review"}
                        </button>
                      </div>

                      {/* Review Form */}
                      {showReviewForm && (
                        <form onSubmit={handleReviewSubmit} className="pdp-review-form">
                          <h4>Share your experience with Lustre &amp; Co.</h4>

                          <div className="pdp-form-field">
                            <label>Rating</label>
                            <div className="pdp-star-picker">
                              {[1, 2, 3, 4, 5].map((val) => (
                                <button
                                  key={val}
                                  type="button"
                                  onClick={() => setReviewRating(val)}
                                  className="pdp-star-picker-btn"
                                >
                                  <Star
                                    size={20}
                                    fill={val <= reviewRating ? "var(--gold)" : "none"}
                                    color="var(--gold)"
                                  />
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="pdp-form-field">
                            <label>Your Name *</label>
                            <input
                              type="text"
                              required
                              value={reviewerName}
                              onChange={(e) => setReviewerName(e.target.value)}
                              placeholder="e.g. Shalini K."
                            />
                          </div>

                          <div className="pdp-form-field">
                            <label>Review Headline</label>
                            <input
                              type="text"
                              value={reviewTitle}
                              onChange={(e) => setReviewTitle(e.target.value)}
                              placeholder="e.g. Even more radiant in person!"
                            />
                          </div>

                          <div className="pdp-form-field">
                            <label>Your Review *</label>
                            <textarea
                              rows={3}
                              required
                              value={reviewComment}
                              onChange={(e) => setReviewComment(e.target.value)}
                              placeholder="Describe the fit, luster, and everyday wear..."
                            />
                          </div>

                          <button type="submit" className="button button-dark">
                            Submit Verified Review
                          </button>

                          {reviewSubmitted && (
                            <p className="pdp-form-success">
                              ✓ Thank you! Your review has been added.
                            </p>
                          )}
                        </form>
                      )}

                      {/* Review Cards List */}
                      <div className="pdp-reviews-list">
                        {reviewsList.map((rev) => (
                          <div key={rev.id} className="pdp-review-card">
                            <div className="pdp-rev-header">
                              <div className="pdp-rev-author-group">
                                <strong>{rev.author}</strong>
                                {rev.verified && (
                                  <span className="pdp-verified-badge">
                                    <Check size={11} /> Verified Buyer
                                  </span>
                                )}
                              </div>
                              <span className="pdp-rev-date">{rev.date}</span>
                            </div>

                            <div className="pdp-rev-stars">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star
                                  key={s}
                                  size={13}
                                  fill={s <= rev.rating ? "var(--gold)" : "none"}
                                  color="var(--gold)"
                                />
                              ))}
                            </div>

                            <h5 className="pdp-rev-title">{rev.title}</h5>
                            <p className="pdp-rev-text">{rev.comment}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================== */}
      {/* SECTION: Complete the Look (Curated Styling Bundle)  */}
      {/* ==================================================== */}
      <section className="section pdp-complete-look-section">
        <div className="container">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Curated Ensemble</span>
              <h2>Complete the Look</h2>
            </div>
            <p className="section-heading-sub">
              Carefully chosen pairings that mirror the radiance of your Aurora necklace.
            </p>
          </div>

          <div className="pdp-bundle-container">
            {/* Bundle Product Cards */}
            <div className="pdp-bundle-items-grid">
              {/* Primary Anchor item: Aurora Necklace */}
              <div className="pdp-bundle-card is-anchor">
                <div className="pdp-bundle-thumb">
                  <img src={product.gallery[0]} alt={product.name} />
                  <span className="pdp-bundle-tag">This Piece</span>
                </div>
                <div className="pdp-bundle-info">
                  <h4 className="pdp-bundle-item-name">{product.name}</h4>
                  <div className="pdp-bundle-item-price">
                    <strong>{formatPrice(product.price)}</strong>
                    {product.oldPrice && <del>{formatPrice(product.oldPrice)}</del>}
                  </div>
                  <span className="pdp-bundle-checked-indicator">
                    <Check size={14} /> Selected
                  </span>
                </div>
              </div>

              {/* Complementary Bundle items */}
              {bundleItems.map((item) => {
                const isSelected = selectedBundleIds.includes(item.id);

                return (
                  <div
                    key={item.id}
                    className={`pdp-bundle-card ${isSelected ? "is-selected" : "is-deselected"}`}
                    onClick={() => toggleBundleItem(item.id)}
                  >
                    <div className="pdp-bundle-thumb">
                      <img src={item.image} alt={item.name} />
                      <button
                        type="button"
                        className={`pdp-bundle-checkbox ${isSelected ? "checked" : ""}`}
                        aria-label={`Toggle ${item.name} in bundle`}
                      >
                        {isSelected && <Check size={12} />}
                      </button>
                    </div>
                    <div className="pdp-bundle-info">
                      <h4 className="pdp-bundle-item-name">{item.name}</h4>
                      <div className="pdp-bundle-item-price">
                        <strong>{formatPrice(item.price)}</strong>
                        {item.oldPrice && <del>{formatPrice(item.oldPrice)}</del>}
                      </div>
                      <span className="pdp-bundle-category-tag">{item.category}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bundle Checkout Box */}
            <div className="pdp-bundle-summary-card">
              <span className="pdp-bundle-savings-badge">
                Save 15% on Bundle Set
              </span>
              <div className="pdp-bundle-price-row">
                <div>
                  <span className="pdp-bundle-total-label">
                    Bundle for {1 + selectedBundleIds.length} pieces:
                  </span>
                  <div className="pdp-bundle-price-nums">
                    <strong className="pdp-bundle-final-price">
                      {formatPrice(finalBundlePrice)}
                    </strong>
                    <del className="pdp-bundle-old-price">
                      {formatPrice(totalBundleOriginalPrice)}
                    </del>
                  </div>
                </div>

                <span className="pdp-bundle-discount-amount">
                  Save {formatPrice(bundleDiscount)}
                </span>
              </div>

              <button
                type="button"
                className="button button-gold pdp-bundle-cta-btn"
                onClick={handleAddBundleToBag}
                disabled={isAddingBundle}
                id="pdp-add-bundle-button"
              >
                {isAddingBundle ? (
                  <>
                    <Loader2 size={16} className="pdp-spinner" />
                    <span>Adding Set to Bag...</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag size={16} />
                    <span>Add Complete Look to Bag</span>
                  </>
                )}
              </button>
              <p className="pdp-bundle-guarantee">
                Includes signature gift packaging &amp; 7-day doorstep exchange.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================== */}
      {/* SECTION: You May Also Like (Matching Recommendations)*/}
      {/* ==================================================== */}
      <section className="section pdp-recommendations-section">
        <div className="container">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Recommendations</span>
              <h2>You May Also Like</h2>
            </div>
            <Link to="/shop" className="pdp-see-all-link">
              Explore all jewelry →
            </Link>
          </div>

          <div className="product-grid" id="pdp-you-may-also-like-grid">
            {relatedProducts.map((relProduct, idx) => (
              <ProductCard
                key={relProduct.id}
                product={relProduct}
                index={idx}
                showQuickView={true}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ==================================================== */}
      {/* STICKY MOBILE ADD-TO-CART BAR (<768px)               */}
      {/* ==================================================== */}
      <aside className="pdp-sticky-mobile-bar" aria-label="Quick Add to Bag">
        <div className="sticky-bar-inner">
          <div className="sticky-product-info">
            <img
              src={gallery[0]}
              alt={product.name}
              className="sticky-product-thumb"
            />
            <div className="sticky-product-text">
              <span className="sticky-product-title">{product.name}</span>
              <div className="sticky-price-row">
                <span className="sticky-current-price">{formatPrice(product.price)}</span>
                {product.oldPrice && (
                  <span className="sticky-original-price">
                    {formatPrice(product.oldPrice)}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="sticky-actions">
            <button
              type="button"
              className={`button button-dark sticky-add-btn ${isAdded ? "is-added" : ""}`}
              onClick={handleAddToCart}
              disabled={isAdding}
              aria-label={`Add ${product.name} to bag`}
            >
              {isAdding ? (
                <>
                  <Loader2 size={16} className="pdp-spinner" />
                  <span>Adding...</span>
                </>
              ) : isAdded ? (
                <>
                  <Check size={16} />
                  <span>Added!</span>
                </>
              ) : (
                <>
                  <ShoppingBag size={16} />
                  <span>Add to Bag</span>
                </>
              )}
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}