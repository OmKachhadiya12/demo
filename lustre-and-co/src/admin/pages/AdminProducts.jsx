import { Edit3, Plus, Search, Trash2, RefreshCw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import AdminModal from "../components/AdminModal";
import { adminProducts as fallbackProducts, formatAdminPrice } from "../adminData";
import api from "../../services/api";

function ProductStatus({ status }) {
  const tone =
    status === "Active" || status === "in-stock"
      ? "success"
      : status === "Low stock"
        ? "warning"
        : "danger";

  return (
    <span className={`admin-status-badge ${tone}`}>
      {status === "in-stock" ? "Active" : status === "out-of-stock" ? "Out of stock" : status}
    </span>
  );
}

const blankProduct = {
  name: "",
  sku: "",
  category: "Earrings",
  price: "",
  stock: "",
  status: "Active",
  image:
    "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=500&q=85"
};

export default function AdminProducts() {
  const [products, setProducts] = useState(fallbackProducts);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All categories");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState(blankProduct);

  async function loadCatalog() {
    setLoading(true);
    try {
      const { data } = await api.get("/products?limit=100");
      if (data?.items && data.items.length > 0) {
        const normalized = data.items.map((p) => {
          const stock = p.stockQuantity !== undefined ? p.stockQuantity : 50;
          return {
            id: p._id || p.slug,
            slug: p.slug,
            name: p.name,
            sku: "LC-" + p.slug.slice(0, 7).toUpperCase(),
            category: p.category.charAt(0).toUpperCase() + p.category.slice(1),
            price: p.price,
            stock,
            sales: p.reviews || 0,
            status: stock === 0 ? "Out of stock" : stock <= 15 ? "Low stock" : "Active",
            image: p.image,
          };
        });
        setProducts(normalized);
      }
    } catch (err) {
      console.warn("Using fallback catalog for admin:", err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCatalog();
  }, []);

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.toLowerCase();

    return products.filter((product) => {
      const matchesQuery =
        product.name.toLowerCase().includes(normalizedQuery) ||
        (product.sku && product.sku.toLowerCase().includes(normalizedQuery));

      const matchesCategory =
        category === "All categories" ||
        product.category.toLowerCase() === category.toLowerCase();

      return matchesQuery && matchesCategory;
    });
  }, [products, query, category]);

  function openCreate() {
    setEditingProduct(null);
    setForm(blankProduct);
    setModalOpen(true);
  }

  function openEdit(product) {
    setEditingProduct(product);
    setForm({
      name: product.name,
      sku: product.sku || "",
      category: product.category,
      price: product.price,
      stock: product.stock,
      status: product.status,
      image: product.image
    });
    setModalOpen(true);
  }

  function updateForm(event) {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value
    }));
  }

  async function saveProduct(event) {
    event.preventDefault();

    const numericPrice = Number(form.price);
    const numericStock = Number(form.stock);

    const status =
      numericStock === 0
        ? "Out of stock"
        : numericStock <= 15
          ? "Low stock"
          : "Active";

    if (editingProduct) {
      const identifier = editingProduct.slug || editingProduct.id;
      try {
        await api.put(`/admin/products/${identifier}`, {
          name: form.name,
          price: numericPrice,
          stockQuantity: numericStock,
          category: form.category.toLowerCase(),
          image: form.image
        });
      } catch (err) {
        console.warn("Backend update notice:", err.message);
      }

      setProducts((current) =>
        current.map((product) =>
          product.id === editingProduct.id
            ? {
                ...product,
                name: form.name,
                category: form.category,
                price: numericPrice,
                stock: numericStock,
                image: form.image,
                status
              }
            : product
        )
      );
    } else {
      let createdFromApi = null;
      try {
        const { data } = await api.post("/admin/products", {
          name: form.name,
          category: form.category.toLowerCase(),
          price: numericPrice,
          stockQuantity: numericStock,
          image: form.image
        });
        createdFromApi = data;
      } catch (err) {
        console.warn("Backend create notice:", err.message);
      }

      const newId = createdFromApi?._id || createdFromApi?.slug || `p-${Date.now()}`;
      setProducts((current) => [
        {
          id: newId,
          slug: createdFromApi?.slug || `piece-${Date.now()}`,
          name: form.name,
          sku: "LC-" + form.category.slice(0, 3).toUpperCase() + "-" + Math.floor(100 + Math.random() * 900),
          category: form.category,
          price: numericPrice,
          stock: numericStock,
          sales: 0,
          status,
          image: form.image
        },
        ...current
      ]);
    }

    setModalOpen(false);
  }

  async function removeProduct(product) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${product.name}"?`
    );

    if (!confirmed) return;

    const identifier = product.slug || product.id;
    try {
      await api.delete(`/admin/products/${identifier}`);
    } catch (err) {
      console.warn("Backend delete notice:", err.message);
    }

    setProducts((current) => current.filter((p) => p.id !== product.id));
  }

  return (
    <div className="admin-page">
      <div className="admin-page-heading">
        <div>
          <span className="admin-eyebrow">Store management</span>
          <h1>Products</h1>
          <p>Manage your catalog, pricing, and inventory levels.</p>
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <button
            type="button"
            className="admin-button admin-button-light"
            onClick={loadCatalog}
            title="Refresh product catalog"
            disabled={loading}
          >
            <RefreshCw size={15} className={loading ? "spin-icon" : ""} />
            Refresh
          </button>
          <button className="admin-button admin-button-dark" onClick={openCreate}>
            <Plus size={16} />
            Add product
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
              placeholder="Search products or SKU..."
            />
          </div>

          <select
            className="admin-select"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            <option>All categories</option>
            <option>Necklaces</option>
            <option>Earrings</option>
            <option>Rings</option>
            <option>Bracelets</option>
            <option>Bangles</option>
          </select>
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table product-admin-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>

            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.id}>
                  <td>
                    <div className="admin-product-cell">
                      <img src={product.image} alt={product.name} />
                      <div>
                        <strong>{product.name}</strong>
                        <small>{product.sales || 0} sales recorded</small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <code>{product.sku}</code>
                  </td>
                  <td>{product.category}</td>
                  <td>
                    <strong>{formatAdminPrice(product.price)}</strong>
                  </td>
                  <td>
                    <strong>{product.stock}</strong> units
                  </td>
                  <td>
                    <ProductStatus status={product.status} />
                  </td>
                  <td>
                    <div className="admin-row-actions">
                      <button
                        className="admin-icon-button"
                        onClick={() => openEdit(product)}
                        aria-label={`Edit ${product.name}`}
                        title="Edit product"
                      >
                        <Edit3 size={15} />
                      </button>
                      <button
                        className="admin-icon-button danger"
                        onClick={() => removeProduct(product)}
                        aria-label={`Delete ${product.name}`}
                        title="Delete product"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <AdminModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingProduct ? "Edit Product" : "New Product"}
        subtitle="Catalog changes update pricing, warehouse inventory, and live visibility."
      >
        <form onSubmit={saveProduct} className="admin-form-grid">
          <label className="admin-form-field">
            Product name
            <input
              name="name"
              value={form.name}
              onChange={updateForm}
              placeholder="e.g. Royal Emerald Choker"
              required
            />
          </label>

          <label className="admin-form-field">
            SKU
            <input
              name="sku"
              value={form.sku}
              onChange={updateForm}
              placeholder="e.g. LC-NEC-045"
            />
          </label>

          <label className="admin-form-field">
            Category
            <select
              name="category"
              value={form.category}
              onChange={updateForm}
              className="admin-select"
            >
              <option>Earrings</option>
              <option>Necklaces</option>
              <option>Rings</option>
              <option>Bracelets</option>
              <option>Bangles</option>
            </select>
          </label>

          <label className="admin-form-field">
            Price (₹)
            <input
              type="number"
              min="0"
              name="price"
              value={form.price}
              onChange={updateForm}
              placeholder="e.g. 1499"
              required
            />
          </label>

          <label className="admin-form-field">
            Stock quantity
            <input
              type="number"
              min="0"
              name="stock"
              value={form.stock}
              onChange={updateForm}
              placeholder="e.g. 25"
              required
            />
          </label>

          <label className="admin-form-field full-width">
            Image URL
            <input
              name="image"
              value={form.image}
              onChange={updateForm}
              placeholder="https://images.unsplash.com/..."
              required
            />
          </label>

          <div className="admin-form-actions">
            <button
              type="button"
              className="admin-button admin-button-light"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </button>
            <button type="submit" className="admin-button admin-button-dark">
              {editingProduct ? "Save changes" : "Create piece"}
            </button>
          </div>
        </form>
      </AdminModal>
    </div>
  );
}