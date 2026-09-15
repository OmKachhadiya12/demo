import { Link } from "react-router-dom";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import ThreeHero from "../components/ThreeHero";
import SectionHeading from "../components/SectionHeading";
import ProductGrid from "../components/ProductGrid";
import PromotionalBanner from "../components/PromotionalBanner";
import WhyShopWithUs from "../components/WhyShopWithUs";
import { products } from "../data/products";

const categories = [
  {
    title: "Necklaces",
    path: "/category/necklaces",
    image:
      "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=900&q=85"
  },
  {
    title: "Earrings",
    path: "/category/earrings",
    image:
      "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=900&q=85"
  },
  {
    title: "Rings",
    path: "/category/rings",
    image:
      "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=900&q=85"
  },
  {
    title: "Bracelets",
    path: "/category/bracelets",
    image:
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=900&q=85"
  }
];

export default function Home() {
  const newProducts = products.filter((product) =>
    product.tags.includes("new")
  );

  const bestProducts = products.filter((product) =>
    product.tags.includes("bestseller")
  );

  return (
    <>
      <section className="home-hero">
        <div className="home-hero-noise" />
        <div className="container home-hero-grid">
          <motion.div
            className="home-hero-copy"
            initial={{ opacity: 0, x: -25 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
          >
            <span className="eyebrow">The new everyday edit</span>
            <h1>
              Every day deserves a little <em>lustre.</em>
            </h1>
            <p>
              Modern imitation jewelry designed to bring polished style,
              thoughtful detail, and accessible sparkle to every moment.
            </p>

            <div className="hero-actions">
              <Link to="/new-arrivals" className="button button-dark">
                Shop new arrivals
                <ArrowUpRight size={17} />
              </Link>
              <Link to="/collections/bridal" className="text-link">
                Explore bridal
              </Link>
            </div>

            <div className="hero-proof">
              <div className="hero-proof-avatars">
                <span>R</span>
                <span>A</span>
                <span>M</span>
              </div>
              <div>
                <strong>4.9/5 from 500+ customers</strong>
                <small>Thoughtfully loved, beautifully worn.</small>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="home-hero-visual"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.15 }}
          >
            <div className="hero-visual-ring hero-ring-one" />
            <div className="hero-visual-ring hero-ring-two" />
            <div className="hero-visual-card">
              <span className="eyebrow">New season</span>
              <strong>Made to shine</strong>
              <small>Minimal pieces. Maximum mood.</small>
            </div>
            <ThreeHero />
          </motion.div>
        </div>
      </section>

      {/* Why Shop With Us - Five Benefit Cards */}
      <WhyShopWithUs />

      <section className="section home-section">
        <div className="container">
          <SectionHeading
            eyebrow="Find your style"
            title="Made for every mood"
            description="From quiet daily sparkle to statement pieces for your most memorable occasions."
            linkLabel="Shop all jewelry"
            linkTo="/shop"
          />

          <div className="category-card-grid">
            {categories.map((category, index) => (
              <motion.div
                key={category.path}
                className="category-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.06 }}
              >
                <Link to={category.path}>
                  <img src={category.image} alt={category.title} loading="lazy" />
                  <div className="category-card-overlay">
                    <h3>{category.title}</h3>
                    <span>Explore collection →</span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="section home-section section-beige">
        <div className="container">
          <SectionHeading
            eyebrow="Just in"
            title="New arrivals"
            description="Fresh pieces selected to make your everyday styling feel new again."
            linkLabel="View all new arrivals"
            linkTo="/new-arrivals"
          />
          <ProductGrid products={newProducts.slice(0, 4)} />
        </div>
      </section>

      <section className="editorial-banner">
        <div className="container editorial-banner-inner">
          <div className="editorial-banner-copy">
            <span className="eyebrow">The bridal edit</span>
            <h2>For the moments you will remember forever.</h2>
            <p>
              Discover statement jewelry designed for celebrations, ceremonies,
              and every beautiful detail in between.
            </p>
            <Link to="/collections/bridal" className="button button-light">
              Explore bridal
              <ArrowUpRight size={17} />
            </Link>
          </div>

          <div className="editorial-banner-image">
            <img
              src="https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=1300&q=85"
              alt="Bridal jewelry"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      <section className="section home-section">
        <div className="container">
          <SectionHeading
            eyebrow="Most loved"
            title="Best sellers"
            description="The pieces customers keep coming back to."
            linkLabel="Shop best sellers"
            linkTo="/best-sellers"
          />
          <ProductGrid products={bestProducts.slice(0, 4)} />
        </div>
      </section>

      {/* Promotional Split Banner */}
      <PromotionalBanner />

      <section className="testimonial-section">
        <div className="container testimonial-layout">
          <div>
            <span className="eyebrow">Kind words</span>
            <h2>
              “The little details are what make every piece feel so special.”
            </h2>
            <span className="testimonial-author">— Meera, verified customer</span>
          </div>

          <div className="testimonial-stats">
            <div>
              <strong>4.9</strong>
              <span>Average rating</span>
            </div>
            <div>
              <strong>500+</strong>
              <span>Happy customers</span>
            </div>
            <div>
              <strong>7 days</strong>
              <span>Easy returns</span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}