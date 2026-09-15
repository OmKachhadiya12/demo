import { Link } from "react-router-dom";
import PageIntro from "../components/PageIntro";

export default function About() {
  return (
    <>
      <PageIntro
        eyebrow="The Lustre & Co. story"
        title="Beautiful details should feel effortless."
        description="We create approachable jewelry for the way modern women actually live, dress, celebrate, and give."
        breadcrumbs={[{ label: "About Us" }]}
        tone="dark"
      />

      <section className="section about-story-section">
        <div className="container about-story-grid">
          <div className="about-story-image">
            <img
              src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1200&q=85"
              alt="Lustre and Co. jewelry"
            />
          </div>

          <div className="about-story-copy">
            <span className="eyebrow">Our point of view</span>
            <h2>Jewelry is a small detail with a big feeling.</h2>
            <p>
              Lustre & Co. began with a simple belief: beautiful style should
              not need to feel distant or difficult to reach.
            </p>
            <p>
              Our collections bring together modern silhouettes, soft
              feminine details, and occasion-ready sparkle at accessible
              prices. Every piece is selected to be worn, enjoyed, gifted, and
              remembered.
            </p>
            <Link to="/shop" className="button button-dark">
              Explore the collection
            </Link>
          </div>
        </div>
      </section>

      <section className="section section-beige">
        <div className="container values-section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">What guides us</span>
              <h2>Simple values, thoughtfully applied.</h2>
            </div>
          </div>

          <div className="values-grid">
            <article>
              <span>01</span>
              <h3>Accessible elegance</h3>
              <p>
                Premium-looking pieces designed to make polished styling feel
                within reach.
              </p>
            </article>
            <article>
              <span>02</span>
              <h3>Thoughtful selection</h3>
              <p>
                We choose designs that feel current today and easy to wear
                again tomorrow.
              </p>
            </article>
            <article>
              <span>03</span>
              <h3>Human service</h3>
              <p>
                Clear communication, dependable support, and a shopping
                experience you can trust.
              </p>
            </article>
          </div>
        </div>
      </section>
    </>
  );
}