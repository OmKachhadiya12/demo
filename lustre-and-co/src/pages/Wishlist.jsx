import { Link } from "react-router-dom";
import PageIntro from "../components/PageIntro";
import ProductGrid from "../components/ProductGrid";
import { useStore } from "../context/StoreContext";
import { products } from "../data/products";

export default function Wishlist() {
  const { wishlist } = useStore();

  return (
    <>
      <PageIntro
        eyebrow="Saved for later"
        title="Your wishlist"
        description="Keep the pieces you love close until the moment feels right."
        breadcrumbs={[{ label: "Wishlist" }]}
      />

      <section className="section">
        <div className="container">
          {wishlist.length ? (
            <ProductGrid products={wishlist} />
          ) : (
            <div>
              <div className="empty-state">
                <span className="empty-icon" aria-hidden="true">♡</span>
                <h2>Your wishlist is waiting for a little lustre.</h2>
                <p>Save pieces here while you discover your next favorite handcrafted imitation jewelry.</p>
                <Link to="/new-arrivals" className="button button-dark">
                  Explore new arrivals
                </Link>
              </div>

              <div style={{ marginTop: "4rem", paddingTop: "3rem", borderTop: "1px solid var(--color-border)" }}>
                <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
                  <span className="eyebrow" style={{ color: "var(--color-gold-dark, #b8860b)", fontWeight: 600 }}>
                    Curated for You
                  </span>
                  <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.85rem", marginTop: "0.5rem", color: "var(--color-charcoal)" }}>
                    Trending Pieces You Might Love
                  </h3>
                  <p style={{ color: "var(--color-muted)", fontSize: "0.95rem", maxWidth: "520px", margin: "0.5rem auto 0" }}>
                    18k gold-plated, anti-tarnish, and hypoallergenic designs our customers adore
                  </p>
                </div>
                <ProductGrid products={products.slice(0, 4)} />
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}