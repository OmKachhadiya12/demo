import {
  BarChart3,
  ChevronRight,
  CircleDollarSign,
  LayoutDashboard,
  Package,
  Percent,
  Settings,
  ShoppingBag,
  Users,
  X
} from "lucide-react";
import { NavLink, Link } from "react-router-dom";

const navigation = [
  {
    label: "Overview",
    items: [
      {
        label: "Dashboard",
        path: "/admin",
        icon: LayoutDashboard
      },
      {
        label: "Analytics",
        path: "/admin",
        icon: BarChart3
      }
    ]
  },
  {
    label: "Store management",
    items: [
      {
        label: "Products",
        path: "/admin/products",
        icon: Package
      },
      {
        label: "Orders",
        path: "/admin/orders",
        icon: ShoppingBag
      },
      {
        label: "Customers",
        path: "/admin/customers",
        icon: Users
      },
      {
        label: "Discounts",
        path: "/admin/discounts",
        icon: Percent
      }
    ]
  },
  {
    label: "Configuration",
    items: [
      {
        label: "Settings",
        path: "/admin/settings",
        icon: Settings
      }
    ]
  }
];

export default function AdminSidebar({ sidebarOpen, setSidebarOpen }) {
  return (
    <>
      <aside className={`admin-sidebar ${sidebarOpen ? "is-open" : ""}`}>
        <div className="admin-sidebar-brand">
          <Link to="/admin" onClick={() => setSidebarOpen(false)}>
            <span>Lustre</span>
            <b>&amp;</b>
            <span>Co.</span>
            <small>ADMIN STUDIO</small>
          </Link>

          <button
            className="admin-close-sidebar"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <X size={19} />
          </button>
        </div>

        <div className="admin-sidebar-scroll">
          {navigation.map((group) => (
            <div className="admin-nav-group" key={group.label}>
              <span className="admin-nav-label">{group.label}</span>

              {group.items.map(({ label, path, icon: Icon }, index) => (
                <NavLink
                  key={`${label}-${index}`}
                  to={path}
                  end={path === "/admin"}
                  className={({ isActive }) =>
                    `admin-nav-link ${isActive ? "active" : ""}`
                  }
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon size={17} />
                  <span>{label}</span>
                  <ChevronRight className="admin-nav-arrow" size={15} />
                </NavLink>
              ))}
            </div>
          ))}
        </div>

        <div className="admin-sidebar-footer">
          <div className="admin-user-mini">
            <div className="admin-avatar">TC</div>
            <div>
              <strong>Tanvi Chopra</strong>
              <span>Administrator</span>
            </div>
          </div>

          <Link to="/" className="view-store-link">
            View storefront →
          </Link>
        </div>
      </aside>

      {sidebarOpen && (
        <button
          className="admin-sidebar-backdrop"
          aria-label="Close sidebar"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </>
  );
}