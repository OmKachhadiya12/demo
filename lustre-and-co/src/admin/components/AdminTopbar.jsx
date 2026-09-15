import {
  Bell,
  Menu,
  Search,
  ExternalLink,
  ChevronDown
} from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

export default function AdminTopbar({ onMenuClick }) {
  const [search, setSearch] = useState("");
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  return (
    <header className="admin-topbar">
      <div className="admin-topbar-left">
        <button className="admin-menu-toggle" onClick={onMenuClick}>
          <Menu size={20} />
        </button>

        <div className="admin-search">
          <Search size={17} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search products, orders, customers..."
          />
          <kbd>⌘ K</kbd>
        </div>
      </div>

      <div className="admin-topbar-actions">
        <Link to="/" className="admin-view-store">
          <ExternalLink size={15} />
          <span>View store</span>
        </Link>

        <div className="admin-notification-wrap">
          <button
            className="admin-topbar-icon"
            onClick={() => setNotificationsOpen((open) => !open)}
            aria-label="Notifications"
          >
            <Bell size={18} />
            <span className="admin-notification-dot" />
          </button>

          {notificationsOpen && (
            <div className="admin-notification-panel">
              <div>
                <strong>Notifications</strong>
                <span>3 new updates</span>
              </div>

              <a href="#low-stock">
                <span className="notification-dot notification-gold" />
                2 products are low in stock
              </a>

              <a href="#order">
                <span className="notification-dot notification-rose" />
                New order received
              </a>

              <a href="#review">
                <span className="notification-dot notification-green" />
                New customer review
              </a>
            </div>
          )}
        </div>

        <button className="admin-profile">
          <span className="admin-avatar">TC</span>
          <span className="admin-profile-copy">
            <strong>Tanvi Chopra</strong>
            <small>Admin</small>
          </span>
          <ChevronDown size={15} />
        </button>
      </div>
    </header>
  );
}