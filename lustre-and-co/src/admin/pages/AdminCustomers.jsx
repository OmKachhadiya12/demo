import { Mail, MoreHorizontal, Search, UserPlus } from "lucide-react";
import { useMemo, useState } from "react";
import AdminTable from "../components/AdminTable";
import { adminCustomers, formatAdminPrice } from "../adminData";

export default function AdminCustomers() {
  const [query, setQuery] = useState("");

  const filteredCustomers = useMemo(() => {
    const normalizedQuery = query.toLowerCase();

    return adminCustomers.filter(
      (customer) =>
        customer.name.toLowerCase().includes(normalizedQuery) ||
        customer.email.toLowerCase().includes(normalizedQuery)
    );
  }, [query]);

  const columns = [
    {
      key: "name",
      label: "Customer",
      render: (row) => (
        <div className="admin-customer-cell">
          <span className="customer-initial customer-initial-large">
            {row.name.slice(0, 1)}
          </span>
          <div>
            <strong>{row.name}</strong>
            <small>{row.email}</small>
          </div>
        </div>
      )
    },
    {
      key: "orders",
      label: "Orders",
      render: (row) => <strong>{row.orders}</strong>
    },
    {
      key: "spent",
      label: "Total spent",
      render: (row) => <strong>{formatAdminPrice(row.spent)}</strong>
    },
    {
      key: "joined",
      label: "Joined"
    },
    {
      key: "status",
      label: "Status",
      render: (row) => (
        <span
          className={`admin-status-badge ${
            row.status === "New" ? "info" : "success"
          }`}
        >
          {row.status}
        </span>
      )
    },
    {
      key: "actions",
      label: "",
      render: () => (
        <div className="admin-row-actions">
          <button className="admin-action-button">
            <Mail size={15} />
          </button>
          <button className="admin-action-button">
            <MoreHorizontal size={15} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="admin-page">
      <div className="admin-page-heading">
        <div>
          <span className="admin-eyebrow">Customer relationships</span>
          <h1>Customers</h1>
          <p>Understand your customers and nurture your community.</p>
        </div>

        <button className="admin-button admin-button-dark">
          <UserPlus size={16} />
          Add customer
        </button>
      </div>

      <div className="admin-mini-stats">
        <div>
          <span>Total customers</span>
          <strong>892</strong>
          <small>+9.2% this month</small>
        </div>
        <div>
          <span>Returning customers</span>
          <strong>64%</strong>
          <small>+4.7% this month</small>
        </div>
        <div>
          <span>Average order value</span>
          <strong>₹1,685</strong>
          <small>+6.1% this month</small>
        </div>
      </div>

      <section className="admin-panel">
        <div className="admin-toolbar">
          <div className="admin-table-search">
            <Search size={16} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search customers..."
            />
          </div>
        </div>

        <AdminTable columns={columns} rows={filteredCustomers} />
      </section>
    </div>
  );
}