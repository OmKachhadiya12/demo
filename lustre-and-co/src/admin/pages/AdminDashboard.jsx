import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  CircleDollarSign,
  Package,
  ShoppingBag,
  Users,
  RefreshCw
} from "lucide-react";
import { Link } from "react-router-dom";
import StatCard from "../components/StatCard";
import SalesChart from "../components/SalesChart";
import AdminTable from "../components/AdminTable";
import {
  adminOrders as fallbackOrders,
  adminProducts as fallbackProducts,
  formatAdminPrice
} from "../adminData";
import api from "../../services/api";

function StatusBadge({ children, tone }) {
  return <span className={`admin-status-badge ${tone}`}>{children}</span>;
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalRevenue: 468240,
    totalOrders: 1284,
    averageOrderValue: 2450,
    totalCustomers: 892,
    totalProducts: 19
  });
  const [lowStockProducts, setLowStockProducts] = useState(() =>
    fallbackProducts.filter((p) => p.stock <= 15).slice(0, 4)
  );
  const [recentOrders, setRecentOrders] = useState(() => fallbackOrders.slice(0, 5));
  const [salesTrend, setSalesTrend] = useState([]);

  async function loadDashboardData() {
    setLoading(true);
    try {
      const { data } = await api.get("/admin/dashboard");
      if (data?.metrics) {
        setMetrics(data.metrics);
      }
      if (data?.lowStockAlerts) {
        setLowStockProducts(data.lowStockAlerts);
      }
      if (data?.recentOrders && data.recentOrders.length > 0) {
        setRecentOrders(data.recentOrders);
      }
      if (data?.salesTrend) {
        setSalesTrend(data.salesTrend);
      }
    } catch (err) {
      console.warn("Could not fetch live admin dashboard metrics, using fallback:", err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboardData();
  }, []);

  const orderColumns = [
    {
      key: "id",
      label: "Order",
      render: (row) => (
        <Link className="admin-table-link" to="/admin/orders">
          #{row.id}
        </Link>
      )
    },
    {
      key: "customer",
      label: "Customer",
      render: (row) => (
        <div className="admin-customer-cell">
          <span className="customer-initial">
            {(row.customer || "G").slice(0, 1)}
          </span>
          <div>
            <strong>{row.customer || "Guest"}</strong>
            <small>{row.email || "No email"}</small>
          </div>
        </div>
      )
    },
    {
      key: "date",
      label: "Date"
    },
    {
      key: "amount",
      label: "Amount",
      render: (row) => <strong>{formatAdminPrice(row.amount)}</strong>
    },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <StatusBadge
          tone={
            row.status === "Delivered"
              ? "success"
              : row.status === "Cancelled"
                ? "danger"
                : row.status === "In Transit" || row.status === "Shipped"
                  ? "info"
                  : "warning"
          }
        >
          {row.status}
        </StatusBadge>
      )
    }
  ];

  return (
    <div className="admin-page">
      <div className="admin-page-heading">
        <div>
          <span className="admin-eyebrow">
            {new Date().toLocaleDateString("en-GB", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric"
            })}
          </span>
          <h1>Good morning, Tanvi.</h1>
          <p>Here’s what is happening across your store today.</p>
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <button
            type="button"
            className="admin-button admin-button-light"
            onClick={loadDashboardData}
            title="Refresh dashboard metrics"
            disabled={loading}
          >
            <RefreshCw size={15} className={loading ? "spin-icon" : ""} />
            Refresh
          </button>
          <Link to="/admin/products" className="admin-button admin-button-dark">
            Add new product
            <ArrowUpRight size={16} />
          </Link>
        </div>
      </div>

      <div className="admin-stats-grid">
        <StatCard
          label="Total revenue"
          value={formatAdminPrice(metrics.totalRevenue)}
          change="+18.4%"
          icon={CircleDollarSign}
          tone="gold"
        />

        <StatCard
          label="Orders"
          value={metrics.totalOrders.toLocaleString()}
          change="+12.8%"
          icon={ShoppingBag}
          tone="rose"
        />

        <StatCard
          label="Customers"
          value={metrics.totalCustomers.toLocaleString()}
          change="+9.2%"
          icon={Users}
          tone="beige"
        />

        <StatCard
          label="Products"
          value={metrics.totalProducts.toLocaleString()}
          change="Catalog live"
          trend="up"
          icon={Package}
          tone="dark"
        />
      </div>

      <div className="admin-dashboard-grid">
        <section className="admin-panel admin-sales-panel">
          <div className="admin-panel-heading">
            <div>
              <span className="admin-eyebrow">Performance</span>
              <h2>Revenue overview</h2>
            </div>

            <select className="admin-select-small" defaultValue="7">
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
            </select>
          </div>

          <div className="revenue-highlight">
            <strong>{formatAdminPrice(metrics.totalRevenue)}</strong>
            <span>Average Order Value: {formatAdminPrice(metrics.averageOrderValue)}</span>
          </div>

          <SalesChart data={salesTrend} />
        </section>

        <section className="admin-panel">
          <div className="admin-panel-heading">
            <div>
              <span className="admin-eyebrow">Inventory attention</span>
              <h2>Low stock</h2>
            </div>

            <Link to="/admin/products" className="admin-inline-link">
              View all →
            </Link>
          </div>

          <div className="low-stock-list">
            {lowStockProducts.length === 0 ? (
              <p style={{ color: "#8a8177", padding: "16px 0", fontSize: "0.9rem" }}>
                All inventory items are well-stocked.
              </p>
            ) : (
              lowStockProducts.map((product) => (
                <div className="low-stock-item" key={product.id || product.slug}>
                  <img src={product.image} alt={product.name} />
                  <div>
                    <strong>{product.name}</strong>
                    <span>{product.stock ?? product.stockQuantity} units remaining</span>
                  </div>
                  <span
                    className={`stock-level ${
                      (product.stock ?? product.stockQuantity) === 0 ? "out" : ""
                    }`}
                  >
                    {(product.stock ?? product.stockQuantity) === 0 ? "Out" : "Low"}
                  </span>
                </div>
              ))
            )}
          </div>

          <Link to="/admin/products" className="admin-panel-bottom-link">
            Manage inventory <ArrowUpRight size={15} />
          </Link>
        </section>
      </div>

      <section className="admin-panel admin-orders-panel">
        <div className="admin-panel-heading">
          <div>
            <span className="admin-eyebrow">Store activity</span>
            <h2>Recent orders</h2>
          </div>

          <Link to="/admin/orders" className="admin-inline-link">
            View all orders →
          </Link>
        </div>

        <AdminTable columns={orderColumns} rows={recentOrders} />
      </section>
    </div>
  );
}