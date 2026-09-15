import { Edit3, Plus, Tag, Trash2, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import AdminModal from "../components/AdminModal";
import { adminDiscounts as fallbackDiscounts } from "../adminData";
import api from "../../services/api";

const blankDiscount = {
  code: "",
  type: "Percentage",
  value: "",
  limit: "",
  expiry: "",
  status: "Active"
};

export default function AdminDiscounts() {
  const [discounts, setDiscounts] = useState(fallbackDiscounts);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState(null);
  const [form, setForm] = useState(blankDiscount);

  async function loadDiscounts() {
    setLoading(true);
    try {
      const { data } = await api.get("/admin/discounts");
      if (data && Array.isArray(data) && data.length > 0) {
        const normalized = data.map((d) => {
          const isPercentage = d.type === "percentage";
          const valueDisplay = isPercentage
            ? `${Math.round(d.value * 100)}%`
            : d.type === "free_shipping"
              ? "Free Shipping"
              : `₹${d.value}`;

          return {
            id: d._id || d.code,
            code: d.code,
            type: isPercentage ? "Percentage" : "Fixed amount",
            rawType: d.type,
            value: valueDisplay,
            numericValue: d.value,
            limit: d.minOrderAmount ? `₹${d.minOrderAmount}` : "None",
            uses: 12,
            expiry: d.expiresAt ? new Date(d.expiresAt).toLocaleDateString() : "No expiry",
            status: d.isActive ? "Active" : "Inactive"
          };
        });
        setDiscounts(normalized);
      }
    } catch (err) {
      console.warn("Using fallback discounts for admin:", err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDiscounts();
  }, []);

  function openCreate() {
    setEditingDiscount(null);
    setForm(blankDiscount);
    setModalOpen(true);
  }

  function openEdit(discount) {
    setEditingDiscount(discount);
    setForm({
      code: discount.code,
      type: discount.type,
      value: discount.numericValue ? (discount.type === "Percentage" ? discount.numericValue * 100 : discount.numericValue) : "",
      limit: discount.limit !== "None" ? discount.limit.replace("₹", "") : "",
      expiry: discount.expiry !== "No expiry" ? discount.expiry : "",
      status: discount.status
    });
    setModalOpen(true);
  }

  function updateForm(event) {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value
    }));
  }

  async function saveDiscount(event) {
    event.preventDefault();

    const normalizedCode = form.code.trim().toUpperCase();
    const isPercentage = form.type === "Percentage";
    const numericVal = Number(form.value);
    const backendVal = isPercentage ? numericVal / 100 : numericVal;

    try {
      await api.post("/admin/discounts", {
        code: normalizedCode,
        type: isPercentage ? "percentage" : "fixed",
        value: backendVal,
        minOrderAmount: Number(form.limit || 0),
        isActive: true,
      });
    } catch (err) {
      console.warn("Backend discount create notice:", err.message);
    }

    const nextDiscount = {
      id: `DISC-${Date.now()}`,
      code: normalizedCode,
      type: form.type,
      value: isPercentage ? `${numericVal}%` : `₹${numericVal}`,
      numericValue: backendVal,
      limit: form.limit ? `₹${form.limit}` : "None",
      uses: 0,
      expiry: form.expiry || "No expiry",
      status: "Active"
    };

    if (editingDiscount) {
      setDiscounts((current) =>
        current.map((discount) =>
          discount.id === editingDiscount.id
            ? { ...discount, ...nextDiscount }
            : discount
        )
      );
    } else {
      setDiscounts((current) => [nextDiscount, ...current]);
    }

    setModalOpen(false);
  }

  async function deleteDiscount(id) {
    const confirmed = window.confirm("Are you sure you want to delete this discount?");
    if (!confirmed) return;

    try {
      await api.delete(`/admin/discounts/${id}`);
    } catch (err) {
      console.warn("Backend delete discount notice:", err.message);
    }

    setDiscounts((current) =>
      current.filter((discount) => discount.id !== id && discount.code !== id)
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-page-heading">
        <div>
          <span className="admin-eyebrow">Promotions</span>
          <h1>Discounts</h1>
          <p>Create and manage promotional codes for your customers.</p>
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <button
            type="button"
            className="admin-button admin-button-light"
            onClick={loadDiscounts}
            title="Refresh coupons"
            disabled={loading}
          >
            <RefreshCw size={15} className={loading ? "spin-icon" : ""} />
            Refresh
          </button>
          <button className="admin-button admin-button-dark" onClick={openCreate}>
            <Plus size={16} />
            Create discount
          </button>
        </div>
      </div>

      <div className="admin-discount-grid">
        {discounts.map((discount) => (
          <article className="admin-discount-card" key={discount.id}>
            <div className="discount-card-top">
              <div className="discount-icon">
                <Tag size={18} />
              </div>
              <span className={`admin-status-badge ${
                discount.status === "Expiring soon" ? "warning" : "success"
              }`}>
                {discount.status}
              </span>
            </div>

            <strong className="discount-code">{discount.code}</strong>
            <span className="discount-value">{discount.value} off</span>

            <div className="discount-card-details">
              <span>
                Min Spend
                <b>{discount.limit}</b>
              </span>
              <span>
                Expires
                <b>{discount.expiry}</b>
              </span>
            </div>

            <div className="discount-card-actions">
              <button
                className="admin-action-button"
                onClick={() => openEdit(discount)}
              >
                <Edit3 size={15} />
                Edit
              </button>
              <button
                className="admin-action-button danger"
                onClick={() => deleteDiscount(discount.id)}
                title="Delete discount"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </article>
        ))}
      </div>

      <AdminModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingDiscount ? "Edit discount" : "Create discount"}
        subtitle="Set up a promotional code for your storefront."
      >
        <form id="discount-form" className="admin-form-grid" onSubmit={saveDiscount}>
          <label className="admin-form-field full-width">
            Discount code
            <input
              name="code"
              value={form.code}
              onChange={updateForm}
              placeholder="e.g. FESTIVE20"
              required
            />
          </label>

          <label className="admin-form-field">
            Discount type
            <select name="type" value={form.type} onChange={updateForm} className="admin-select">
              <option>Percentage</option>
              <option>Fixed amount</option>
            </select>
          </label>

          <label className="admin-form-field">
            Value ({form.type === "Percentage" ? "%" : "₹"})
            <input
              type="number"
              min="1"
              name="value"
              value={form.value}
              onChange={updateForm}
              placeholder={form.type === "Percentage" ? "20" : "250"}
              required
            />
          </label>

          <label className="admin-form-field">
            Min order subtotal (₹)
            <input
              type="number"
              min="0"
              name="limit"
              value={form.limit}
              onChange={updateForm}
              placeholder="1999"
            />
          </label>

          <div className="admin-form-actions full-width">
            <button
              type="button"
              className="admin-button admin-button-light"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="admin-button admin-button-dark">
              Save discount
            </button>
          </div>
        </form>
      </AdminModal>
    </div>
  );
}