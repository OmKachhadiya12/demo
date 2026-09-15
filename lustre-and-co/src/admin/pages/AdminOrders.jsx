import { Download, Eye, Search, RefreshCw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AdminTable from "../components/AdminTable";
import { adminOrders as fallbackOrders, formatAdminPrice } from "../adminData";
import api from "../../services/api";

export default function AdminOrders() {
  const [orders, setOrders] = useState(fallbackOrders);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All statuses");

  async function loadOrders() {
    setLoading(true);
    try {
      const { data } = await api.get("/admin/orders?limit=100");
      if (data?.orders && data.orders.length > 0) {
        const normalized = data.orders.map((o) => {
          const created = o.createdAt ? new Date(o.createdAt) : new Date();
          const dateStr = created.toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric"
          });
          const paymentLabel =
            o.payment?.status === "paid"
              ? "Paid"
              : o.payment?.method === "cod"
                ? "COD Pending"
                : "Payment pending";

          return {
            id: o.orderId,
            rawId: o._id,
            customer: o.customer?.fullName || "Guest",
            email: o.customer?.email || "",
            date: dateStr,
            amount: o.total,
            payment: paymentLabel,
            status: o.status === "In Transit" ? "Shipped" : o.status,
            trackingNumber: o.trackingNumber,
            carrier: o.carrier,
            items: o.items || []
          };
        });
        setOrders(normalized);
      }
    } catch (err) {
      console.warn("Using fallback orders for admin:", err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    const normalizedQuery = query.toLowerCase();

    return orders.filter((order) => {
      const matchesQuery =
        order.id.toLowerCase().includes(normalizedQuery) ||
        order.customer.toLowerCase().includes(normalizedQuery) ||
        order.email.toLowerCase().includes(normalizedQuery);

      const matchesStatus =
        status === "All statuses" ||
        order.status === status ||
        (status === "Shipped" && order.status === "In Transit");

      return matchesQuery && matchesStatus;
    });
  }, [orders, query, status]);

  async function updateOrderStatus(orderId, nextStatus) {
    const targetStatus = nextStatus === "Shipped" ? "In Transit" : nextStatus;

    try {
      await api.patch(`/admin/orders/${orderId}/status`, {
        status: targetStatus
      });
    } catch (err) {
      console.warn("Backend status update notice:", err.message);
    }

    setOrders((current) =>
      current.map((order) =>
        order.id === orderId ? { ...order, status: nextStatus } : order
      )
    );
  }

  const columns = [
    {
      key: "id",
      label: "Order",
      render: (row) => (
        <div>
          <strong className="admin-table-link">#{row.id}</strong>
          <small className="admin-table-subtext">{row.date}</small>
        </div>
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
            <strong>{row.customer}</strong>
            <small>{row.email}</small>
          </div>
        </div>
      )
    },
    {
      key: "amount",
      label: "Amount",
      render: (row) => <strong>{formatAdminPrice(row.amount)}</strong>
    },
    {
      key: "payment",
      label: "Payment",
      render: (row) => (
        <span
          className={`payment-status ${
            row.payment.toLowerCase().includes("paid") ? "paid" : "pending"
          }`}
        >
          {row.payment}
        </span>
      )
    },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <select
          className="admin-status-select"
          value={row.status}
          onChange={(event) => updateOrderStatus(row.id, event.target.value)}
        >
          <option>Confirmed</option>
          <option>Processing</option>
          <option>Shipped</option>
          <option>Delivered</option>
          <option>Cancelled</option>
        </select>
      )
    },
    {
      key: "actions",
      label: "",
      render: (row) => (
        <Link
          to={`/track-order?order=${row.id}`}
          className="admin-action-button"
          title="Track shipment"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Eye size={15} />
        </Link>
      )
    }
  ];

  return (
    <div className="admin-page">
      <div className="admin-page-heading">
        <div>
          <span className="admin-eyebrow">Store management</span>
          <h1>Orders</h1>
          <p>Review orders, update delivery status, and manage fulfillment.</p>
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <button
            type="button"
            className="admin-button admin-button-light"
            onClick={loadOrders}
            title="Refresh order records"
            disabled={loading}
          >
            <RefreshCw size={15} className={loading ? "spin-icon" : ""} />
            Refresh
          </button>
          <button
            className="admin-button admin-button-light"
            onClick={() => {
              const csv = orders.map((o) => `${o.id},${o.customer},${o.amount},${o.status}`).join("\n");
              const blob = new Blob([`Order ID,Customer,Amount,Status\n${csv}`], { type: "text/csv" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `lustre-orders-${Date.now()}.csv`;
              a.click();
            }}
          >
            <Download size={16} />
            Export orders
          </button>
        </div>
      </div>

      <section className="admin-panel">
        <div className="admin-toolbar">
          <div className="admin-table-search">
            <Search size={16} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search orders or customers..."
            />
          </div>

          <select
            className="admin-select"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            <option>All statuses</option>
            <option>Confirmed</option>
            <option>Processing</option>
            <option>Shipped</option>
            <option>Delivered</option>
            <option>Cancelled</option>
          </select>
        </div>

        <AdminTable columns={columns} rows={filteredOrders} />
      </section>
    </div>
  );
}