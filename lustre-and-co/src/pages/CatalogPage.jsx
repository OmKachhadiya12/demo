import { useMemo, useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  SlidersHorizontal,
  ChevronDown,
  X,
  Sparkles,
  ArrowUpDown,
  Home,
  ChevronRight,
  RotateCcw
} from "lucide-react";
import PageIntro from "../components/PageIntro";
import ProductGrid from "../components/ProductGrid";
import ProductFilters, { filterOptions } from "../components/ProductFilters";
import { products } from "../data/products";

const pageConfig = {
  shop: {
    title: "All Imitation Jewelry",
    eyebrow: "Curated Collection",
    description:
      "Explore handcrafted imitation jewelry designed for daily polish, bridal elegance, celebrations, and thoughtful gifts.",
    breadcrumbs: [{ label: "All Jewelry" }]
  },
  new: {
    title: "New Arrivals",
    eyebrow: "Fresh In",
    description:
      "Our newest designs featuring sculpted silhouettes, sparkling stones, and contemporary champagne gold finishes.",
    breadcrumbs: [{ label: "New Arrivals" }]
  },
  bestsellers: {
    title: "Best Sellers",
    eyebrow: "Most Coveted",
    description:
      "The signature pieces our community loves most and wears daily.",
    breadcrumbs: [{ label: "Best Sellers" }]
  },
  necklaces: {
    title: "Necklaces & Chokers",
    eyebrow: "Necklace Collection",
    description:
      "Layered chains, bridal chokers, and delicate pendants for every neckline.",
    breadcrumbs: [{ label: "Necklaces" }]
  },
  earrings: {
    title: "Earrings & Drops",
    eyebrow: "Earring Collection",
    description:
      "From understated studs to bridal chandbalis, discover the ideal pair.",
    breadcrumbs: [{ label: "Earrings" }]
  },
  rings: {
    title: "Rings & Bands",
    eyebrow: "Ring Collection",
    description:
      "Sculpted signets, adjustable statement bands, and cocktail rings.",
    breadcrumbs: [{ label: "Rings" }]
  },
  bracelets: {
    title: "Bracelets & Cuffs",
    eyebrow: "Bracelet Collection",
    description:
      "Luminous tennis bracelets, sculpted cuffs, and delicate pearl links.",
    breadcrumbs: [{ label: "Bracelets" }]
  },
  bangles: {
    title: "Bangles & Kadas",
    eyebrow: "Bangle Collection",
    description:
      "Festive stacks, antique temple kadas, and faceted single bangles.",
    breadcrumbs: [{ label: "Bangles" }]
  },
  bridal: {
    title: "Bridal Collection",
    eyebrow: "The Wedding Edit",
    description:
      "Royal kundan sets, ornate chokers, and heirloom-inspired designs for weddings and festivities.",
    breadcrumbs: [{ label: "Bridal Collection" }]
  },
  sale: {
    title: "Sale & Offers",
    eyebrow: "Special Pricing",
    description:
      "Exclusive discounts and bundled savings on select jewelry favorites.",
    breadcrumbs: [{ label: "Sale & Offers" }]
  }
};

const sortOptions = [
  { label: "Recommended", value: "recommended" },
  { label: "Newest", value: "newest" },
  { label: "Price: Low to High", value: "price-low" },
  { label: "Price: High to Low", value: "price-high" },
  { label: "Best Rated", value: "best-rated" },
  { label: "Most Popular", value: "most-popular" }
];

const INITIAL_PAGE_SIZE = 9;
const PAGE_INCREMENT = 6;

export default function CatalogPage({ type = "shop" }) {
  const config = pageConfig[type] || pageConfig.shop;
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("search") || "";

  // Initial filter state
  const initialCategory =
    ["necklaces", "earrings", "rings", "bracelets", "bangles"].includes(type)
      ? type
      : "all";

  const [filters, setFilters] = useState({
    category: initialCategory,
    price: "all",
    color: "all",
    material: "all",
    occasion: type === "bridal" ? "bridal" : "all",
    rating: "all",
    availability: "all",
    discount: type === "sale" ? "20" : "all",
    sort: "recommended"
  });

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(INITIAL_PAGE_SIZE);

  // Reset category/occasion filter when page type changes
  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      category: ["necklaces", "earrings", "rings", "bracelets", "bangles"].includes(type) ? type : "all",
      occasion: type === "bridal" ? "bridal" : prev.occasion,
      discount: type === "sale" ? "20" : prev.discount
    }));
    setVisibleCount(INITIAL_PAGE_SIZE);
  }, [type]);

  // Compute filtered & sorted products
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Page-type restrictions
    if (type === "new") {
      result = result.filter((p) => p.tags?.includes("new"));
    } else if (type === "bestsellers") {
      result = result.filter((p) => p.tags?.includes("bestseller"));
    } else if (type === "bridal") {
      result = result.filter((p) => p.occasion === "bridal" || p.tags?.includes("bridal"));
    } else if (type === "sale") {
      result = result.filter((p) => p.oldPrice && p.oldPrice > p.price);
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((p) =>
        `${p.name} ${p.category} ${p.finish} ${p.material} ${p.description}`
          .toLowerCase()
          .includes(q)
      );
    }

    // 1. Category Filter
    if (filters.category !== "all") {
      result = result.filter((p) => p.category === filters.category);
    }

    // 2. Price Range Filter
    if (filters.price === "under-1000") {
      result = result.filter((p) => p.price < 1000);
    } else if (filters.price === "1000-2000") {
      result = result.filter((p) => p.price >= 1000 && p.price <= 2000);
    } else if (filters.price === "2000-3500") {
      result = result.filter((p) => p.price > 2000 && p.price <= 3500);
    } else if (filters.price === "over-3500") {
      result = result.filter((p) => p.price > 3500);
    }

    // 3. Color Filter
    if (filters.color !== "all") {
      result = result.filter(
        (p) => p.color?.toLowerCase() === filters.color.toLowerCase()
      );
    }

    // 4. Material Filter
    if (filters.material !== "all") {
      result = result.filter((p) => p.material === filters.material);
    }

    // 5. Occasion Filter
    if (filters.occasion !== "all") {
      result = result.filter(
        (p) => p.occasion === filters.occasion || p.tags?.includes(filters.occasion)
      );
    }

    // 6. Rating Filter
    if (filters.rating !== "all") {
      const minRating = parseFloat(filters.rating);
      result = result.filter((p) => p.rating >= minRating);
    }

    // 7. Availability Filter
    if (filters.availability === "in-stock") {
      result = result.filter((p) => p.availability === "in-stock");
    }

    // 8. Discount Filter
    if (filters.discount !== "all") {
      const minDiscount = parseInt(filters.discount, 10);
      result = result.filter((p) => {
        if (!p.oldPrice || p.oldPrice <= p.price) return false;
        const discountPct = Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100);
        return discountPct >= minDiscount;
      });
    }

    // Sorting Options:
    // - Recommended
    // - Newest
    // - Price: Low to High
    // - Price: High to Low
    // - Best Rated
    // - Most Popular
    switch (filters.sort) {
      case "price-low":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        result.sort((a, b) => b.price - a.price);
        break;
      case "best-rated":
        result.sort((a, b) => b.rating - a.rating || b.reviews - a.reviews);
        break;
      case "newest":
        result.sort((a, b) => new Date(b.dateAdded || 0) - new Date(a.dateAdded || 0));
        break;
      case "most-popular":
        result.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
        break;
      case "recommended":
      default:
        // Weighted composite score (rating + popularity)
        result.sort((a, b) => (b.popularity || 80) * b.rating - (a.popularity || 80) * a.rating);
        break;
    }

    return result;
  }, [filters, searchQuery, type]);

  // Active filter chips list
  const activeChips = useMemo(() => {
    const chips = [];

    if (filters.category !== "all") {
      const opt = filterOptions.categories.find((c) => c.value === filters.category);
      chips.push({ key: "category", label: opt ? opt.label : filters.category });
    }
    if (filters.price !== "all") {
      const opt = filterOptions.priceRanges.find((p) => p.value === filters.price);
      chips.push({ key: "price", label: opt ? opt.label : filters.price });
    }
    if (filters.color !== "all") {
      chips.push({ key: "color", label: `Color: ${filters.color}` });
    }
    if (filters.material !== "all") {
      chips.push({ key: "material", label: filters.material });
    }
    if (filters.occasion !== "all") {
      const opt = filterOptions.occasions.find((o) => o.value === filters.occasion);
      chips.push({ key: "occasion", label: opt ? opt.label : filters.occasion });
    }
    if (filters.rating !== "all") {
      chips.push({ key: "rating", label: `★ ${filters.rating}+` });
    }
    if (filters.availability !== "all") {
      chips.push({ key: "availability", label: "In Stock" });
    }
    if (filters.discount !== "all") {
      chips.push({ key: "discount", label: `${filters.discount}% Off+` });
    }

    return chips;
  }, [filters]);

  function removeChip(key) {
    setFilters((prev) => ({ ...prev, [key]: "all" }));
  }

  function clearAllFilters() {
    setFilters({
      category: "all",
      price: "all",
      color: "all",
      material: "all",
      occasion: "all",
      rating: "all",
      availability: "all",
      discount: "all",
      sort: filters.sort
    });
  }

  // Paginated items to show
  const paginatedProducts = filteredProducts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredProducts.length;

  function loadMore() {
    setVisibleCount((prev) => Math.min(prev + PAGE_INCREMENT, filteredProducts.length));
  }

  return (
    <div className="catalog-page-container">
      {/* 1. BREADCRUMB NAVIGATION */}
      <nav className="catalog-breadcrumb-bar" aria-label="Breadcrumb">
        <div className="container">
          <ol className="breadcrumb-list">
            <li className="breadcrumb-item">
              <Link to="/" className="breadcrumb-link">
                <Home size={13} />
                <span>Home</span>
              </Link>
            </li>
            <ChevronRight size={13} className="breadcrumb-sep" />
            <li className="breadcrumb-item">
              <Link to="/shop" className="breadcrumb-link">
                Shop
              </Link>
            </li>
            {config.breadcrumbs && config.breadcrumbs.length > 0 && (
              <>
                <ChevronRight size={13} className="breadcrumb-sep" />
                <li className="breadcrumb-item is-active" aria-current="page">
                  <span>{config.breadcrumbs[0].label}</span>
                </li>
              </>
            )}
          </ol>
        </div>
      </nav>

      {/* 2. PAGE HEADER WITH TITLE & DESCRIPTION */}
      <header className="catalog-page-header">
        <div className="container">
          <div className="catalog-header-inner">
            <span className="eyebrow">{config.eyebrow}</span>
            <h1 className="catalog-main-title">{config.title}</h1>
            <p className="catalog-main-description">{config.description}</p>
          </div>
        </div>
      </header>

      {/* 3. MAIN CATALOG SECTION */}
      <section className="catalog-body-section section">
        <div className="container">
          {searchQuery && (
            <div className="search-result-banner">
              <span>Showing search results for: <strong>“{searchQuery}”</strong></span>
            </div>
          )}

          {/* CATALOG TOOLBAR: Mobile filter button, Product count, Sort dropdown */}
          <div className="catalog-top-toolbar">
            {/* Left: Product count & Mobile filter button */}
            <div className="toolbar-left-group">
              {/* Mobile Filter Button (opens slide-out drawer) */}
              <button
                type="button"
                className="mobile-filter-drawer-btn"
                onClick={() => setMobileFiltersOpen(true)}
                aria-label="Open filters drawer"
              >
                <SlidersHorizontal size={16} />
                <span>Filter &amp; Refine</span>
                {activeChips.length > 0 && (
                  <span className="filter-count-bubble">{activeChips.length}</span>
                )}
              </button>

              {/* Product Count Display */}
              <div className="catalog-product-counter">
                <span className="counter-num">{filteredProducts.length}</span>
                <span className="counter-label">
                  {filteredProducts.length === 1 ? "piece found" : "pieces available"}
                </span>
              </div>
            </div>

            {/* Right: Sort Dropdown */}
            <div className="toolbar-right-group">
              <label htmlFor="catalog-sort-select" className="sort-label">
                <ArrowUpDown size={14} />
                <span>Sort by:</span>
              </label>
              <div className="sort-select-wrapper">
                <select
                  id="catalog-sort-select"
                  className="catalog-sort-select"
                  value={filters.sort}
                  onChange={(e) => setFilters((prev) => ({ ...prev, sort: e.target.value }))}
                >
                  {sortOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className="sort-select-chevron" />
              </div>
            </div>
          </div>

          {/* ACTIVE FILTER CHIPS ROW */}
          {activeChips.length > 0 && (
            <div className="active-chips-bar" aria-label="Active filters">
              <span className="chips-title">Active Filters:</span>
              <div className="chips-list">
                {activeChips.map((chip) => (
                  <button
                    key={chip.key}
                    type="button"
                    className="filter-chip"
                    onClick={() => removeChip(chip.key)}
                    title={`Remove ${chip.label}`}
                  >
                    <span>{chip.label}</span>
                    <X size={12} />
                  </button>
                ))}

                <button
                  type="button"
                  className="clear-all-chips-btn"
                  onClick={clearAllFilters}
                >
                  Clear all
                </button>
              </div>
            </div>
          )}

          {/* 4. SPLIT LAYOUT: DESKTOP LEFT SIDEBAR + PRODUCT GRID */}
          <div className="catalog-main-layout">
            {/* Desktop Left Sidebar Filters */}
            <ProductFilters
              filters={filters}
              setFilters={setFilters}
              mobileOpen={mobileFiltersOpen}
              setMobileOpen={setMobileFiltersOpen}
              totalResults={filteredProducts.length}
              isSidebar={true}
            />

            {/* Results Grid Area */}
            <main className="catalog-results-area" id="catalog-products-results">
              {filteredProducts.length === 0 ? (
                /* Empty state */
                <div className="catalog-empty-state">
                  <div className="empty-icon-ring">✦</div>
                  <h3>No matching pieces found</h3>
                  <p>
                    Try adjusting your filters, clearing search terms, or exploring our full collection.
                  </p>
                  <button
                    type="button"
                    className="button button-dark reset-empty-btn"
                    onClick={clearAllFilters}
                  >
                    <RotateCcw size={15} />
                    <span>Reset all filters</span>
                  </button>
                </div>
              ) : (
                <>
                  {/* Responsive Product Grid */}
                  <ProductGrid products={paginatedProducts} />

                  {/* 5. PAGINATION / LOAD MORE BUTTON */}
                  <div className="catalog-pagination-container">
                    <div className="pagination-progress-info">
                      <span>
                        Showing {paginatedProducts.length} of {filteredProducts.length} pieces
                      </span>
                      <div className="pagination-progress-track">
                        <div
                          className="pagination-progress-fill"
                          style={{
                            width: `${(paginatedProducts.length / filteredProducts.length) * 100}%`
                          }}
                        />
                      </div>
                    </div>

                    {hasMore ? (
                      <button
                        type="button"
                        className="button button-dark load-more-button"
                        onClick={loadMore}
                      >
                        <span>Load More Pieces</span>
                      </button>
                    ) : (
                      <div className="pagination-complete-msg">
                        <Sparkles size={14} />
                        <span>You have viewed all {filteredProducts.length} pieces in this selection</span>
                      </div>
                    )}
                  </div>
                </>
              )}
            </main>
          </div>
        </div>
      </section>

      {/* Mobile Slide-Out Drawer (Rendered conditionally for mobile) */}
      <ProductFilters
        filters={filters}
        setFilters={setFilters}
        mobileOpen={mobileFiltersOpen}
        setMobileOpen={setMobileFiltersOpen}
        totalResults={filteredProducts.length}
        isSidebar={false}
      />
    </div>
  );
}