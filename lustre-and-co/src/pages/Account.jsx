import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Clock,
  Compass,
  Copy,
  CreditCard,
  Edit3,
  ExternalLink,
  Eye,
  Heart,
  LayoutDashboard,
  LogOut,
  MapPin,
  Package,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  Settings,
  Shield,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Trash2,
  Truck,
  User,
  UserCog,
  UserRound,
  X
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import PageIntro from "../components/PageIntro";
import { useStore } from "../context/StoreContext";
import { formatPrice, products } from "../data/products";
import api from "../services/api";

const DEFAULT_ORDERS = [
  {
    id: "LST-89421056",
    date: "Sep 13, 2026",
    deliveryDate: "Sep 16, 2026",
    status: "In Transit",
    statusType: "transit",
    total: 3998,
    carrier: "Bluedart Air Express",
    trackingNumber: "BD-982144701",
    items: [
      {
        name: "Aurora Gold-Plated Necklace",
        color: "18K Gold Plated",
        quantity: 1,
        price: 1899,
        image:
          "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80"
      },
      {
        name: "Celestial Pearl Drop Earrings",
        color: "Pearl / Gold",
        quantity: 1,
        price: 1499,
        image:
          "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=600&q=80"
      }
    ]
  },
  {
    id: "LST-74120932",
    date: "Aug 28, 2026",
    deliveryDate: "Aug 31, 2026",
    status: "Delivered",
    statusType: "delivered",
    total: 2499,
    carrier: "FedEx Priority",
    trackingNumber: "FX-664192083",
    items: [
      {
        name: "Solstice Diamond Solitaire Ring",
        color: "Yellow Gold",
        quantity: 1,
        price: 2499,
        image:
          "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=600&q=80"
      }
    ]
  },
  {
    id: "LST-61093481",
    date: "Jul 14, 2026",
    deliveryDate: "Jul 18, 2026",
    status: "Delivered",
    statusType: "delivered",
    total: 1799,
    carrier: "Delhivery Surface",
    trackingNumber: "DL-339210085",
    items: [
      {
        name: "Elysian Twisted Gold Bangle",
        color: "Gold",
        quantity: 1,
        price: 1799,
        image:
          "https://images.unsplash.com/photo-1611591475888-eb287e07a3c3?auto=format&fit=crop&w=600&q=80"
      }
    ]
  }
];

function normalizeAddress(addr) {
  return {
    id: addr._id || addr.id || `addr-${Date.now()}`,
    tag: addr.isDefault ? "DEFAULT SHIPPING" : "SAVED ADDRESS",
    isDefault: Boolean(addr.isDefault),
    name: addr.fullName || addr.name || "Customer",
    street: addr.address || addr.street || "",
    city: addr.city || "",
    state: addr.state || "",
    postalCode: addr.postalCode || "",
    country: addr.country || "India",
    phone: addr.phone || ""
  };
}

export default function Account() {
  const navigate = useNavigate();
  const { user, setUser, lastOrder, wishlist, addToCart, logout, showToast } = useStore();

  const [activeTab, setActiveTab] = useState("overview");
  const [profile, setProfile] = useState({
    name: user?.name || "Sophia Montgomery",
    email: user?.email || "sophia.montgomery@example.com",
    phone: user?.phone || "+1 (555) 234-5678",
    memberSince: "October 2024",
    tier: user?.role === "admin" ? "Store Administrator" : "Gold Concierge",
    points: 1250,
    nextTierPoints: 2000
  });

  const [addresses, setAddresses] = useState([
    {
      id: "addr-1",
      tag: "DEFAULT SHIPPING",
      isDefault: true,
      name: user?.name || "Sophia Montgomery",
      street: "742 Evergreen Terrace, Suite 4B",
      city: "San Francisco",
      state: "California",
      postalCode: "94107",
      country: "United States",
      phone: "+1 (555) 234-5678"
    },
    {
      id: "addr-2",
      tag: "BILLING ADDRESS",
      isDefault: false,
      name: user?.name || "Sophia Montgomery",
      street: "500 Howard Street, Floor 12",
      city: "San Francisco",
      state: "California",
      postalCode: "94105",
      country: "United States",
      phone: "+1 (555) 234-9988"
    }
  ]);

  const [payments, setPayments] = useState([
    {
      id: "pm-1",
      type: "Visa",
      last4: "4242",
      exp: "08/28",
      holder: user?.name || "Sophia Montgomery",
      isDefault: true
    },
    {
      id: "pm-2",
      type: "Mastercard",
      last4: "8890",
      exp: "11/27",
      holder: user?.name || "Sophia Montgomery",
      isDefault: false
    }
  ]);

  const [liveOrders, setLiveOrders] = useState([]);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [showAddAddressModal, setShowAddAddressModal] = useState(false);
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
    isDefault: false
  });
  const [trackingInput, setTrackingInput] = useState("");

  // 1. Fetch live Profile & Addresses & Orders from NestJS Backend
  useEffect(() => {
    let isMounted = true;

    async function loadAccountData() {
      const stored = localStorage.getItem("lustre-user");
      const token = user?.token || localStorage.getItem("lustre_token") || (stored ? JSON.parse(stored)?.token : null);

      if (!token) return;

      setIsLoadingProfile(true);

      // Fetch profile and saved addresses
      try {
        const { data } = await api.get("/users/profile");
        if (isMounted && data) {
          setProfile((prev) => ({
            ...prev,
            name: data.name || prev.name,
            email: data.email || prev.email,
            phone: data.phone || prev.phone,
            tier: data.role === "admin" ? "Store Administrator" : "Gold Concierge",
            memberSince: data.createdAt
              ? new Date(data.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })
              : prev.memberSince
          }));

          if (data.addresses && Array.isArray(data.addresses) && data.addresses.length > 0) {
            setAddresses(data.addresses.map(normalizeAddress));
          }
        }
      } catch (err) {
        console.warn("Could not fetch live profile:", err.message);
      } finally {
        if (isMounted) setIsLoadingProfile(false);
      }

      // Fetch customer past orders
      try {
        const { data: ordersData } = await api.get("/orders/my-orders");
        if (isMounted && Array.isArray(ordersData) && ordersData.length > 0) {
          const mapped = ordersData.map((ord) => ({
            id: ord.orderId,
            date: new Date(ord.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric"
            }),
            deliveryDate: ord.estimatedDeliveryDate || "In 3–5 days",
            status: ord.status,
            statusType:
              ord.status === "Delivered"
                ? "delivered"
                : ord.status === "In Transit"
                ? "transit"
                : "processing",
            total: ord.total,
            carrier: ord.shippingCarrier || "Bluedart Air Express",
            trackingNumber: ord.trackingNumber || `BD-${ord.orderId.replace(/\D/g, "").slice(-8)}`,
            items: (ord.items || []).map((i) => ({
              name: i.name || "Fine Jewelry Piece",
              color: i.color || "Gold",
              quantity: i.quantity || 1,
              price: i.price,
              image:
                i.image ||
                "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80"
            }))
          }));
          setLiveOrders(mapped);
        }
      } catch (err) {
        console.warn("Could not fetch live customer orders:", err.message);
      }
    }

    loadAccountData();

    return () => {
      isMounted = false;
    };
  }, [user]);

  // Merge live orders or lastOrder from checkout into orders list
  const orders = useMemo(() => {
    if (liveOrders && liveOrders.length > 0) {
      return liveOrders;
    }

    if (!lastOrder) return DEFAULT_ORDERS;
    const exists = DEFAULT_ORDERS.some((o) => o.id === lastOrder.id);
    if (exists) return DEFAULT_ORDERS;

    const formatted = {
      id: lastOrder.id,
      date: lastOrder.orderDate || "Today",
      deliveryDate: lastOrder.estimatedDeliveryDate || "In 3–5 days",
      status: lastOrder.status || "Processing",
      statusType:
        lastOrder.status === "Delivered"
          ? "delivered"
          : lastOrder.status === "In Transit"
            ? "transit"
            : "processing",
      total: lastOrder.total || 3899,
      carrier: "Express Air Delivery",
      trackingNumber: `LST-TRK-${lastOrder.id.replace("LST-", "")}`,
      items:
        lastOrder.items?.map((i) => ({
          name: i.product?.name || i.name || "Aurora Gold-Plated Necklace",
          color: i.selectedColor || i.color || "Gold",
          quantity: i.quantity || 1,
          price: i.product?.price || i.price || 1899,
          image:
            i.product?.images?.[0] ||
            i.image ||
            "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80"
        })) || DEFAULT_ORDERS[0].items
    };

    return [formatted, ...DEFAULT_ORDERS];
  }, [liveOrders, lastOrder]);

  // Wishlist preview items
  const wishlistItems = useMemo(() => {
    if (wishlist && wishlist.length > 0) {
      return wishlist.slice(0, 4);
    }
    // Fallback curated preview items
    return products.slice(0, 4);
  }, [wishlist]);

  const stats = useMemo(() => {
    const transitCount = orders.filter((o) => o.statusType === "transit").length;
    const deliveredCount = orders.filter((o) => o.statusType === "delivered").length;
    return {
      totalOrders: orders.length,
      inTransit: transitCount || 1,
      delivered: deliveredCount || 2,
      wishlistCount: wishlist.length || 4,
      points: profile.points
    };
  }, [orders, wishlist.length, profile.points]);

  function handleLogout() {
    logout();
    showToast("You have been signed out.", "info");
    navigate("/");
  }

  function copyTracking(trackingNumber) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(trackingNumber);
      showToast(`Tracking code ${trackingNumber} copied to clipboard!`, "success");
    }
  }

  function handleTrackSubmit(e) {
    e.preventDefault();
    if (!trackingInput.trim()) return;
    navigate(`/track-order?order=${encodeURIComponent(trackingInput.trim())}`);
  }

  // Live profile updater
  async function handleSaveProfile(e) {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      const { data: updated } = await api.put("/users/profile", {
        name: profile.name.trim(),
        phone: profile.phone?.trim()
      });
      if (updated) {
        setProfile((prev) => ({
          ...prev,
          name: updated.name || prev.name,
          phone: updated.phone || prev.phone
        }));
        if (user && setUser) {
          setUser({ ...user, name: updated.name || profile.name, phone: updated.phone || profile.phone });
        }
      }
      showToast("Profile changes saved successfully!", "success");
    } catch (err) {
      if (user && setUser) {
        setUser({ ...user, name: profile.name, phone: profile.phone });
      }
      showToast(err.userMessage || "Profile updated locally.", "info");
    } finally {
      setIsSavingProfile(false);
    }
  }

  // Live address adder
  async function handleAddAddress(e) {
    e.preventDefault();
    setIsSavingAddress(true);
    try {
      const payload = {
        fullName: newAddress.fullName.trim() || profile.name,
        phone: newAddress.phone.trim() || profile.phone,
        address: newAddress.address.trim(),
        city: newAddress.city.trim(),
        state: newAddress.state.trim(),
        postalCode: newAddress.postalCode.trim(),
        country: newAddress.country?.trim() || "India",
        isDefault: Boolean(newAddress.isDefault)
      };

      const { data: updatedAddrs } = await api.post("/users/addresses", payload);
      if (Array.isArray(updatedAddrs)) {
        setAddresses(updatedAddrs.map(normalizeAddress));
      } else {
        setAddresses((prev) => [...prev, normalizeAddress({ ...payload, id: `addr-${Date.now()}` })]);
      }
      showToast("New address saved successfully!", "success");
      setShowAddAddressModal(false);
      setNewAddress({
        fullName: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        postalCode: "",
        country: "India",
        isDefault: false
      });
    } catch (err) {
      const local = normalizeAddress({
        id: `addr-${Date.now()}`,
        ...newAddress
      });
      setAddresses((prev) => [...prev, local]);
      showToast("Address added.", "info");
      setShowAddAddressModal(false);
    } finally {
      setIsSavingAddress(false);
    }
  }

  // Live address remover
  async function handleDeleteAddress(addressId) {
    try {
      const { data: updatedAddrs } = await api.delete(`/users/addresses/${addressId}`);
      if (Array.isArray(updatedAddrs)) {
        setAddresses(updatedAddrs.map(normalizeAddress));
      } else {
        setAddresses((prev) => prev.filter((a) => a.id !== addressId));
      }
      showToast("Address deleted successfully.", "success");
    } catch (err) {
      setAddresses((prev) => prev.filter((a) => a.id !== addressId));
      showToast("Address removed.", "info");
    }
  }

  const sidebarNav = [
    { key: "overview", label: "Overview", icon: LayoutDashboard },
    { key: "orders", label: "My Orders", icon: Package, badge: orders.length },
    { key: "track", label: "Track Order", icon: Compass },
    { key: "wishlist", label: "Wishlist", icon: Heart, badge: wishlist.length || 4 },
    { key: "addresses", label: "Saved Addresses", icon: MapPin },
    { key: "payments", label: "Payment Methods", icon: CreditCard },
    { key: "profile", label: "Profile Settings", icon: UserCog },
    { key: "returns", label: "Returns and Refunds", icon: RotateCcw },
    { key: "logout", label: "Logout", icon: LogOut, isAction: true }
  ];

  return (
    <>
      <PageIntro
        eyebrow="My Account"
        title="Customer Dashboard"
        description="Manage your jewelry collection, track incoming orders, and personalize your preferences."
        breadcrumbs={[{ label: "Dashboard" }]}
      />

      <section className="account-dashboard-page">
        <div className="account-container">
          {/* Main Dashboard Layout */}
          <div className="account-layout-grid">
            {/* Left Sidebar Navigation */}
            <aside className="account-sidebar">
              {/* User Profile Mini Card */}
              <div className="account-sidebar-profile">
                <div className="account-avatar-wrap">
                  <div className="account-avatar-initials">
                    {profile.name
                      .split(" ")
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join("")}
                  </div>
                  <span className="account-vip-badge-ring">
                    <Sparkles size={11} />
                  </span>
                </div>
                <div className="account-sidebar-info">
                  <h3 className="account-user-name">{profile.name}</h3>
                  <p className="account-user-email">{profile.email}</p>
                  <span className="account-tier-pill">
                    <Star size={11} fill="currentColor" />
                    {profile.tier}
                  </span>
                </div>
              </div>

              {/* Sidebar Navigation Links */}
              <nav className="account-sidebar-nav" aria-label="Account Navigation">
                {sidebarNav.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.key;

                  if (item.isAction) {
                    return (
                      <button
                        key={item.key}
                        type="button"
                        className="account-nav-button account-logout-button"
                        onClick={handleLogout}
                      >
                        <Icon size={18} className="account-nav-icon" />
                        <span className="account-nav-label">{item.label}</span>
                      </button>
                    );
                  }

                  return (
                    <button
                      key={item.key}
                      type="button"
                      className={`account-nav-button ${isActive ? "active" : ""}`}
                      onClick={() => setActiveTab(item.key)}
                    >
                      <Icon size={18} className="account-nav-icon" />
                      <span className="account-nav-label">{item.label}</span>
                      {item.badge !== undefined && (
                        <span className="account-nav-badge">{item.badge}</span>
                      )}
                    </button>
                  );
                })}
              </nav>

              {/* Sidebar Luxury Perks Note */}
              <div className="account-sidebar-concierge">
                <div className="account-concierge-icon">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <h4>Lustre Concierge</h4>
                  <p>Private personal stylist and priority assistance.</p>
                  <a href="mailto:concierge@lustreandco.com" className="account-concierge-link">
                    Contact Concierge →
                  </a>
                </div>
              </div>

              {/* Admin Portal Quick Access */}
              {user?.role === "admin" && (
                <div
                  className="account-admin-portal-card"
                  style={{
                    padding: "16px",
                    borderRadius: "12px",
                    background: "linear-gradient(135deg, rgba(214, 181, 109, 0.16), rgba(34, 34, 34, 0.04))",
                    border: "1px solid rgba(214, 181, 109, 0.4)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Shield size={16} color="#8c6b24" />
                    <strong style={{ fontSize: "12.5px", color: "#222" }}>Store Administrator</strong>
                  </div>
                  <p style={{ fontSize: "11px", color: "#666", margin: 0 }}>
                    Manage catalog pieces, fulfill customer orders & view analytics.
                  </p>
                  <Link
                    to="/admin"
                    className="button button-gold button-sm"
                    style={{ width: "100%", justifyContent: "center", textDecoration: "none", marginTop: "4px" }}
                  >
                    Open Admin Panel →
                  </Link>
                </div>
              )}
            </aside>

            {/* Main Content Area */}
            <main className="account-main-content">
              {/* TAB: OVERVIEW */}
              {activeTab === "overview" && (
                <div className="account-tab-view account-overview-view">
                  {/* 1. Welcome Message Banner */}
                  <div className="account-welcome-banner">
                    <div className="account-welcome-text">
                      <span className="account-welcome-kicker">
                        <Sparkles size={13} />
                        Lustre Member Space
                      </span>
                      <h2>
                        Welcome back, <em>{profile.name.split(" ")[0]}</em>.
                      </h2>
                      <p>
                        Your personal haven for fine jewelry curation, active deliveries, and
                        exclusive member benefits.
                      </p>
                    </div>

                    <div className="account-welcome-actions">
                      <Link to="/shop" className="button button-gold">
                        <ShoppingBag size={15} />
                        Explore New Arrivals
                      </Link>
                      <button
                        type="button"
                        className="button button-outline-dark"
                        onClick={() => setActiveTab("orders")}
                      >
                        View All Orders
                      </button>
                    </div>
                  </div>

                  {/* 2. Order Status Metric Cards */}
                  <div className="account-metrics-grid">
                    <div className="account-metric-card" onClick={() => setActiveTab("orders")}>
                      <div className="metric-header">
                        <span className="metric-label">ACTIVE DELIVERIES</span>
                        <div className="metric-icon transit-icon">
                          <Truck size={18} />
                        </div>
                      </div>
                      <div className="metric-value">{stats.inTransit} In Transit</div>
                      <div className="metric-subtext">Estimated delivery by Sep 16</div>
                    </div>

                    <div className="account-metric-card" onClick={() => setActiveTab("orders")}>
                      <div className="metric-header">
                        <span className="metric-label">TOTAL ORDERS</span>
                        <div className="metric-icon orders-icon">
                          <Package size={18} />
                        </div>
                      </div>
                      <div className="metric-value">{stats.totalOrders} Orders</div>
                      <div className="metric-subtext">Lifetime luxury purchases</div>
                    </div>

                    <div className="account-metric-card" onClick={() => setActiveTab("wishlist")}>
                      <div className="metric-header">
                        <span className="metric-label">WISHLIST PIECES</span>
                        <div className="metric-icon wishlist-icon">
                          <Heart size={18} />
                        </div>
                      </div>
                      <div className="metric-value">{stats.wishlistCount} Saved</div>
                      <div className="metric-subtext">Handpicked pieces you love</div>
                    </div>

                    <div className="account-metric-card" onClick={() => setActiveTab("profile")}>
                      <div className="metric-header">
                        <span className="metric-label">LUSTRE REWARDS</span>
                        <div className="metric-icon vip-icon">
                          <Star size={18} fill="currentColor" />
                        </div>
                      </div>
                      <div className="metric-value">{profile.points} Pts</div>
                      <div className="metric-subtext">750 pts to Platinum Tier</div>
                    </div>
                  </div>

                  {/* 3. Recent Orders Section */}
                  <div className="account-card account-recent-orders-card">
                    <div className="account-card-header">
                      <div>
                        <span className="account-card-eyebrow">ORDER HISTORY</span>
                        <h3 className="account-card-title">Recent Orders</h3>
                      </div>
                      <button
                        type="button"
                        className="account-card-action-link"
                        onClick={() => setActiveTab("orders")}
                      >
                        View all ({orders.length}) →
                      </button>
                    </div>

                    <div className="account-orders-list">
                      {orders.slice(0, 2).map((order) => (
                        <div key={order.id} className="account-order-item">
                          <div className="order-meta-header">
                            <div className="order-identity">
                              <span className="order-id-label">ORDER #{order.id}</span>
                              <span className="order-date-label">Placed on {order.date}</span>
                            </div>

                            <div className="order-status-badge-wrap">
                              <span className={`order-status-badge ${order.statusType}`}>
                                {order.statusType === "transit" && <Truck size={13} />}
                                {order.statusType === "delivered" && <CheckCircle2 size={13} />}
                                {order.statusType === "processing" && <Clock size={13} />}
                                {order.status}
                              </span>
                            </div>
                          </div>

                          <div className="order-items-row">
                            <div className="order-thumbnails-group">
                              {order.items.map((item, idx) => (
                                <div key={idx} className="order-thumb-wrap" title={item.name}>
                                  <img src={item.image} alt={item.name} />
                                  {item.quantity > 1 && (
                                    <span className="order-qty-pill">x{item.quantity}</span>
                                  )}
                                </div>
                              ))}
                            </div>

                            <div className="order-summary-details">
                              <p className="order-names-list">
                                {order.items.map((i) => i.name).join(", ")}
                              </p>
                              <div className="order-price-and-carrier">
                                <span className="order-total-amount">
                                  {formatPrice(order.total)}
                                </span>
                                <span className="order-carrier-note">
                                  via {order.carrier} (Est. {order.deliveryDate})
                                </span>
                              </div>
                            </div>

                            <div className="order-actions-group">
                              <Link
                                to={`/track-order?order=${order.id}`}
                                className="button button-dark button-sm"
                              >
                                Track Package
                              </Link>
                              <button
                                type="button"
                                className="button button-outline-dark button-sm"
                                onClick={() =>
                                  showToast(
                                    `Invoice for ${order.id} generated and sent to ${profile.email}.`,
                                    "success"
                                  )
                                }
                              >
                                View Invoice
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 4. Two-Column Row: Wishlist Preview + Saved Address Preview */}
                  <div className="account-split-cards-row">
                    {/* Wishlist Preview */}
                    <div className="account-card account-wishlist-preview-card">
                      <div className="account-card-header">
                        <div>
                          <span className="account-card-eyebrow">FAVORITES</span>
                          <h3 className="account-card-title">Wishlist Preview</h3>
                        </div>
                        <Link to="/wishlist" className="account-card-action-link">
                          See all →
                        </Link>
                      </div>

                      <div className="account-wishlist-grid">
                        {wishlistItems.map((piece) => (
                          <div key={piece.id} className="account-wishlist-item">
                            <div className="wishlist-thumb-box">
                              <img
                                src={piece.images ? piece.images[0] : piece.image}
                                alt={piece.name}
                              />
                            </div>
                            <div className="wishlist-item-meta">
                              <h4 className="wishlist-piece-name">{piece.name}</h4>
                              <span className="wishlist-piece-price">
                                {formatPrice(piece.price)}
                              </span>
                            </div>
                            <button
                              type="button"
                              className="wishlist-add-bag-btn"
                              onClick={() => {
                                addToCart(piece, 1);
                                showToast(`${piece.name} added to your bag!`, "success");
                              }}
                              title="Add to Bag"
                            >
                              <ShoppingBag size={14} />
                              Add
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Saved Address Preview */}
                    <div className="account-card account-address-preview-card">
                      <div className="account-card-header">
                        <div>
                          <span className="account-card-eyebrow">DELIVERY</span>
                          <h3 className="account-card-title">Saved Addresses</h3>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <button
                            type="button"
                            className="account-card-action-link"
                            onClick={() => setShowAddAddressModal(true)}
                            style={{ color: "var(--gold, #d6b56d)", fontWeight: 600 }}
                          >
                            + Add New
                          </button>
                          <button
                            type="button"
                            className="account-card-action-link"
                            onClick={() => setActiveTab("addresses")}
                          >
                            Manage →
                          </button>
                        </div>
                      </div>

                      <div className="account-address-preview-list">
                        {addresses.map((addr) => (
                          <div
                            key={addr.id}
                            className={`account-address-box ${addr.isDefault ? "is-default" : ""}`}
                          >
                            <div className="address-box-head">
                              <span className="address-tag-badge">{addr.tag}</span>
                              {addr.isDefault && (
                                <span className="address-default-badge">
                                  <CheckCircle2 size={12} /> Default
                                </span>
                              )}
                            </div>
                            <h4 className="address-recipient-name">{addr.name}</h4>
                            <p className="address-street-line">{addr.street}</p>
                            <p className="address-city-line">
                              {addr.city}, {addr.state} {addr.postalCode}, {addr.country}
                            </p>
                            <p className="address-phone-line">Phone: {addr.phone}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 5. Account Details Summary Card */}
                  <div className="account-card account-details-card">
                    <div className="account-card-header">
                      <div>
                        <span className="account-card-eyebrow">PERSONAL DETAILS</span>
                        <h3 className="account-card-title">Account Details</h3>
                      </div>
                      <button
                        type="button"
                        className="button button-outline-dark button-sm"
                        onClick={() => setActiveTab("profile")}
                      >
                        <Edit3 size={14} />
                        Edit Profile
                      </button>
                    </div>

                    <div className="account-details-grid">
                      <div className="detail-field">
                        <span className="detail-label">Full Name</span>
                        <span className="detail-value">{profile.name}</span>
                      </div>
                      <div className="detail-field">
                        <span className="detail-label">Email Address</span>
                        <span className="detail-value">
                          {profile.email}{" "}
                          <span className="verified-badge">
                            <CheckCircle2 size={12} /> Verified
                          </span>
                        </span>
                      </div>
                      <div className="detail-field">
                        <span className="detail-label">Phone Number</span>
                        <span className="detail-value">{profile.phone}</span>
                      </div>
                      <div className="detail-field">
                        <span className="detail-label">Member Since</span>
                        <span className="detail-value">{profile.memberSince}</span>
                      </div>
                      <div className="detail-field">
                        <span className="detail-label">Password & Security</span>
                        <span className="detail-value">
                          •••••••••••• (Updated 2 months ago)
                        </span>
                      </div>
                      <div className="detail-field">
                        <span className="detail-label">Preferred Currency</span>
                        <span className="detail-value">INR (₹) / International Tracked</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: MY ORDERS */}
              {activeTab === "orders" && (
                <div className="account-tab-view account-orders-view">
                  <div className="account-tab-header">
                    <h2>My Orders ({orders.length})</h2>
                    <p>Track shipments, review previous purchases, and download receipts.</p>
                  </div>

                  <div className="account-orders-list">
                    {orders.map((order) => (
                      <div key={order.id} className="account-card account-order-full-item">
                        <div className="order-meta-header">
                          <div className="order-identity">
                            <span className="order-id-label">ORDER #{order.id}</span>
                            <span className="order-date-label">Placed on {order.date}</span>
                          </div>

                          <div className="order-status-badge-wrap">
                            <span className={`order-status-badge ${order.statusType}`}>
                              {order.statusType === "transit" && <Truck size={13} />}
                              {order.statusType === "delivered" && <CheckCircle2 size={13} />}
                              {order.statusType === "processing" && <Clock size={13} />}
                              {order.status}
                            </span>
                          </div>
                        </div>

                        <div className="order-full-items-table">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="order-item-row">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="order-item-thumb"
                              />
                              <div className="order-item-info">
                                <h4>{item.name}</h4>
                                <span className="order-item-variant">
                                  Color: {item.color} | Qty: {item.quantity}
                                </span>
                              </div>
                              <div className="order-item-price">
                                {formatPrice(item.price * item.quantity)}
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="order-full-footer">
                          <div className="order-tracking-info">
                            <span>Carrier: {order.carrier}</span>
                            <span className="tracking-code-wrap">
                              Tracking Code: <strong>{order.trackingNumber}</strong>
                              <button
                                type="button"
                                className="copy-btn"
                                onClick={() => copyTracking(order.trackingNumber)}
                                title="Copy Tracking Code"
                              >
                                <Copy size={13} />
                              </button>
                            </span>
                          </div>

                          <div className="order-actions-wrap">
                            <Link
                              to={`/track-order?order=${order.id}`}
                              className="button button-dark button-sm"
                            >
                              Track Live Order
                            </Link>
                            <button
                              type="button"
                              className="button button-outline-dark button-sm"
                              onClick={() => setActiveTab("returns")}
                            >
                              Return / Exchange
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB: TRACK ORDER */}
              {activeTab === "track" && (
                <div className="account-tab-view account-track-view">
                  <div className="account-tab-header">
                    <h2>Track Your Order</h2>
                    <p>Enter your order confirmation number to receive live courier updates.</p>
                  </div>

                  <div className="account-card track-card">
                    <form onSubmit={handleTrackSubmit} className="track-form">
                      <label className="track-label">
                        <span>Order Number / Tracking ID</span>
                        <div className="track-input-wrap">
                          <Search size={18} className="track-icon" />
                          <input
                            type="text"
                            placeholder="e.g. LST-89421056"
                            value={trackingInput}
                            onChange={(e) => setTrackingInput(e.target.value)}
                            required
                          />
                          <button type="submit" className="button button-dark">
                            Track Now
                          </button>
                        </div>
                      </label>
                    </form>

                    <div className="active-shipment-preview">
                      <span className="shipment-kicker">LATEST SHIPMENT</span>
                      <h3>Order #{orders[0].id}</h3>
                      <p>
                        Status: <strong>{orders[0].status}</strong> (Carrier: {orders[0].carrier})
                      </p>
                      <Link
                        to={`/track-order?order=${orders[0].id}`}
                        className="button button-gold button-sm"
                      >
                        View Full Live Timeline →
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: WISHLIST */}
              {activeTab === "wishlist" && (
                <div className="account-tab-view account-wishlist-view">
                  <div className="account-tab-header">
                    <h2>My Wishlist ({wishlist.length || 4})</h2>
                    <p>Your curated collection of lustrous pieces saved for later.</p>
                  </div>

                  <div className="account-full-wishlist-grid">
                    {wishlistItems.map((piece) => (
                      <div key={piece.id} className="account-card wishlist-full-card">
                        <img
                          src={piece.images ? piece.images[0] : piece.image}
                          alt={piece.name}
                          className="wishlist-card-img"
                        />
                        <div className="wishlist-card-body">
                          <h4>{piece.name}</h4>
                          <span className="wishlist-card-price">
                            {formatPrice(piece.price)}
                          </span>
                          <button
                            type="button"
                            className="button button-dark button-sm"
                            onClick={() => {
                              addToCart(piece, 1);
                              showToast(`${piece.name} added to your bag!`, "success");
                            }}
                          >
                            <ShoppingBag size={14} /> Add to Bag
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB: SAVED ADDRESSES */}
              {activeTab === "addresses" && (
                <div className="account-tab-view account-addresses-view">
                  <div
                    className="account-tab-header"
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      flexWrap: "wrap",
                      gap: "16px"
                    }}
                  >
                    <div>
                      <h2>Saved Addresses ({addresses.length})</h2>
                      <p>Manage multiple shipping destinations for seamless checkout.</p>
                    </div>
                    <button
                      type="button"
                      className="button button-gold button-sm"
                      onClick={() => setShowAddAddressModal(true)}
                    >
                      <Plus size={15} /> Add New Address
                    </button>
                  </div>

                  <div className="account-addresses-grid">
                    {addresses.map((addr) => (
                      <div key={addr.id} className="account-card address-full-card">
                        <div className="address-box-head">
                          <span className="address-tag-badge">{addr.tag}</span>
                          {addr.isDefault && (
                            <span className="address-default-badge">
                              <CheckCircle2 size={12} /> Default Shipping
                            </span>
                          )}
                        </div>
                        <h3>{addr.name}</h3>
                        <p>{addr.street}</p>
                        <p>
                          {addr.city}, {addr.state} {addr.postalCode}
                        </p>
                        <p>{addr.country}</p>
                        <p className="addr-phone">Phone: {addr.phone}</p>

                        <div className="address-card-actions">
                          {!addr.isDefault && (
                            <button
                              type="button"
                              className="text-link"
                              onClick={() => {
                                setAddresses((prev) =>
                                  prev.map((a) => ({
                                    ...a,
                                    isDefault: a.id === addr.id,
                                    tag: a.id === addr.id ? "DEFAULT SHIPPING" : "SAVED ADDRESS"
                                  }))
                                );
                                showToast("Default address updated.", "success");
                              }}
                            >
                              Set as Default
                            </button>
                          )}
                          <button
                            type="button"
                            className="text-link"
                            style={{
                              color: "#a8564e",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                              marginLeft: "auto"
                            }}
                            onClick={() => handleDeleteAddress(addr.id)}
                            title="Delete Address"
                          >
                            <Trash2 size={13} /> Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB: PAYMENT METHODS */}
              {activeTab === "payments" && (
                <div className="account-tab-view account-payments-view">
                  <div className="account-tab-header">
                    <h2>Payment Methods</h2>
                    <p>Saved payment cards and accounts for encrypted 1-click purchases.</p>
                  </div>

                  <div className="account-payments-grid">
                    {payments.map((pm) => (
                      <div key={pm.id} className="account-card payment-method-card">
                        <div className="payment-card-top">
                          <div className="payment-brand-badge">
                            <CreditCard size={18} />
                            <span>{pm.type}</span>
                          </div>
                          {pm.isDefault && (
                            <span className="payment-default-badge">Default</span>
                          )}
                        </div>
                        <div className="payment-card-number">•••• •••• •••• {pm.last4}</div>
                        <div className="payment-card-meta">
                          <div>
                            <span className="meta-label">CARD HOLDER</span>
                            <span className="meta-val">{pm.holder}</span>
                          </div>
                          <div>
                            <span className="meta-label">EXPIRES</span>
                            <span className="meta-val">{pm.exp}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB: PROFILE SETTINGS */}
              {activeTab === "profile" && (
                <div className="account-tab-view account-profile-view">
                  <div className="account-tab-header">
                    <h2>Profile & Security Settings</h2>
                    <p>Keep your contact information and password up to date.</p>
                  </div>

                  <div className="account-card profile-settings-form-card">
                    <form onSubmit={handleSaveProfile} className="profile-form">
                      <div className="form-row-2">
                        <label className="auth-field">
                          <span>Full Name</span>
                          <input
                            type="text"
                            value={profile.name}
                            onChange={(e) =>
                              setProfile({ ...profile, name: e.target.value })
                            }
                            required
                          />
                        </label>

                        <label className="auth-field">
                          <span>Email Address (Primary Identity)</span>
                          <input
                            type="email"
                            value={profile.email}
                            disabled
                            style={{ opacity: 0.7, cursor: "not-allowed", background: "rgba(0,0,0,0.03)" }}
                          />
                        </label>
                      </div>

                      <div className="form-row-2">
                        <label className="auth-field">
                          <span>Phone Number</span>
                          <input
                            type="tel"
                            value={profile.phone}
                            onChange={(e) =>
                              setProfile({ ...profile, phone: e.target.value })
                            }
                          />
                        </label>

                        <label className="auth-field">
                          <span>Member Tier</span>
                          <input type="text" value={profile.tier} disabled style={{ opacity: 0.8 }} />
                        </label>
                      </div>

                      <button type="submit" className="button button-gold" disabled={isSavingProfile}>
                        {isSavingProfile ? "Saving Changes..." : "Save Profile Changes"}
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* TAB: RETURNS AND REFUNDS */}
              {activeTab === "returns" && (
                <div className="account-tab-view account-returns-view">
                  <div className="account-tab-header">
                    <h2>Returns & Refunds</h2>
                    <p>Hassle-free 7-day doorstep returns and exchange requests.</p>
                  </div>

                  <div className="account-card returns-policy-card">
                    <div className="returns-badge-row">
                      <div className="returns-perk">
                        <RotateCcw size={20} className="returns-perk-icon" />
                        <div>
                          <h4>7-Day Doorstep Returns</h4>
                          <p>Items can be returned within 7 days of delivery.</p>
                        </div>
                      </div>

                      <div className="returns-perk">
                        <ShieldCheck size={20} className="returns-perk-icon" />
                        <div>
                          <h4>100% Refund Guarantee</h4>
                          <p>Funds returned directly to original payment method.</p>
                        </div>
                      </div>
                    </div>

                    <div className="eligible-orders-box">
                      <h3>Orders Eligible for Return</h3>
                      <div className="eligible-order-row">
                        <div>
                          <strong>{orders[0].id}</strong>
                          <p>{orders[0].items[0].name}</p>
                        </div>
                        <button
                          type="button"
                          className="button button-dark button-sm"
                          onClick={() =>
                            showToast(
                              `Return request for order ${orders[0].id} submitted. Courier pickup scheduled within 24h.`,
                              "success"
                            )
                          }
                        >
                          Request Return Pickup
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </main>
          </div>
        </div>
      </section>

      {/* Add Address Modal */}
      {showAddAddressModal && (
        <div
          className="account-modal-backdrop"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.65)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "20px"
          }}
          onClick={() => setShowAddAddressModal(false)}
        >
          <div
            className="account-modal-content"
            style={{
              background: "#ffffff",
              borderRadius: "18px",
              maxWidth: "520px",
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              padding: "28px",
              boxShadow: "0 24px 48px rgba(0, 0, 0, 0.25)",
              position: "relative"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowAddAddressModal(false)}
              style={{
                position: "absolute",
                top: "18px",
                right: "18px",
                background: "transparent",
                border: 0,
                cursor: "pointer",
                color: "#777",
                padding: "4px"
              }}
              aria-label="Close modal"
            >
              <X size={20} />
            </button>

            <h3
              style={{
                fontFamily: "var(--serif, serif)",
                fontSize: "22px",
                margin: "0 0 6px",
                color: "#222"
              }}
            >
              Add Shipping Destination
            </h3>
            <p style={{ color: "#777", fontSize: "12.5px", margin: "0 0 20px" }}>
              Save a new delivery address for fast 1-click order checkout.
            </p>

            <form
              onSubmit={handleAddAddress}
              style={{ display: "flex", flexDirection: "column", gap: "14px" }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px"
                }}
              >
                <label className="auth-field">
                  <span>Recipient Name *</span>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sophia Montgomery"
                    value={newAddress.fullName}
                    onChange={(e) =>
                      setNewAddress({ ...newAddress, fullName: e.target.value })
                    }
                  />
                </label>
                <label className="auth-field">
                  <span>Contact Phone *</span>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 9876543210"
                    value={newAddress.phone}
                    onChange={(e) =>
                      setNewAddress({ ...newAddress, phone: e.target.value })
                    }
                  />
                </label>
              </div>

              <label className="auth-field">
                <span>Street Address / Suite / Apartment *</span>
                <input
                  type="text"
                  required
                  placeholder="e.g. 742 Evergreen Terrace, Suite 4B"
                  value={newAddress.address}
                  onChange={(e) =>
                    setNewAddress({ ...newAddress, address: e.target.value })
                  }
                />
              </label>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px"
                }}
              >
                <label className="auth-field">
                  <span>City *</span>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mumbai"
                    value={newAddress.city}
                    onChange={(e) =>
                      setNewAddress({ ...newAddress, city: e.target.value })
                    }
                  />
                </label>
                <label className="auth-field">
                  <span>State / Province *</span>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Maharashtra"
                    value={newAddress.state}
                    onChange={(e) =>
                      setNewAddress({ ...newAddress, state: e.target.value })
                    }
                  />
                </label>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px"
                }}
              >
                <label className="auth-field">
                  <span>Postal / ZIP Code *</span>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 400001"
                    value={newAddress.postalCode}
                    onChange={(e) =>
                      setNewAddress({
                        ...newAddress,
                        postalCode: e.target.value
                      })
                    }
                  />
                </label>
                <label className="auth-field">
                  <span>Country</span>
                  <input
                    type="text"
                    placeholder="India"
                    value={newAddress.country}
                    onChange={(e) =>
                      setNewAddress({ ...newAddress, country: e.target.value })
                    }
                  />
                </label>
              </div>

              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "12.5px",
                  cursor: "pointer",
                  marginTop: "4px"
                }}
              >
                <input
                  type="checkbox"
                  checked={newAddress.isDefault}
                  onChange={(e) =>
                    setNewAddress({
                      ...newAddress,
                      isDefault: e.target.checked
                    })
                  }
                />
                <span>Set as default shipping address</span>
              </label>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "10px",
                  marginTop: "12px"
                }}
              >
                <button
                  type="button"
                  className="button button-outline-dark button-sm"
                  onClick={() => setShowAddAddressModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="button button-gold button-sm"
                  disabled={isSavingAddress}
                >
                  {isSavingAddress ? "Saving..." : "Save Address"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}