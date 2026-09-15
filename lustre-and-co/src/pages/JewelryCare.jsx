import { Droplets, Gem, Heart, Package, Sparkles } from "lucide-react";
import PageIntro from "../components/PageIntro";

const careCards = [
  {
    icon: Droplets,
    title: "Keep it dry",
    text: "Remove jewelry before showering, swimming, exercising, or washing your hands."
  },
  {
    icon: Sparkles,
    title: "Apply products first",
    text: "Let perfume, lotion, sunscreen, and makeup settle before putting on your jewelry."
  },
  {
    icon: Package,
    title: "Store separately",
    text: "Keep each piece in its pouch or a separate compartment to reduce scratches and tangling."
  },
  {
    icon: Gem,
    title: "Clean gently",
    text: "Use a soft, dry microfiber cloth. Avoid abrasive cleaners and harsh chemicals."
  },
  {
    icon: Heart,
    title: "Put it on last",
    text: "Make jewelry the final touch after dressing and the first accessory you remove."
  }
];

export default function JewelryCare() {
  return (
    <>
      <PageIntro
        eyebrow="Keep your shine"
        title="Jewelry care guide"
        description="A little thoughtful care helps your favorite pieces stay beautiful for longer."
        breadcrumbs={[{ label: "Jewelry Care Guide" }]}
        tone="rose"
      />

      <section className="section care-intro-section">
        <div className="container care-intro">
          <span className="eyebrow">The everyday ritual</span>
          <h2>Treat your jewelry gently, and it will keep showing up beautifully.</h2>
          <p>
            Lustre & Co. imitation jewelry is made for enjoying. To help
            preserve its finish, protect it from moisture, cosmetics, friction,
            and harsh chemicals.
          </p>
        </div>
      </section>

      <section className="section section-beige">
        <div className="container">
          <div className="care-grid">
            {careCards.map(({ icon: Icon, title, text }) => (
              <article className="care-card" key={title}>
                <div className="care-card-icon">
                  <Icon size={21} />
                </div>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section care-type-section">
        <div className="container">
          <div className="section-heading">
            <div>
              <span className="eyebrow">By jewelry type</span>
              <h2>Small habits for every piece.</h2>
            </div>
          </div>

          <div className="care-type-grid">
            <article>
              <h3>Necklaces</h3>
              <p>
                Fasten clasps before storing and keep chains flat or hanging to
                reduce tangling.
              </p>
            </article>
            <article>
              <h3>Earrings</h3>
              <p>
                Wipe posts and backs gently after wearing, especially after
                long celebrations.
              </p>
            </article>
            <article>
              <h3>Rings</h3>
              <p>
                Remove rings before using cleaning products or applying hand
                cream.
              </p>
            </article>
            <article>
              <h3>Bracelets &amp; bangles</h3>
              <p>
                Store them separately and avoid stacking pieces that may rub
                against one another.
              </p>
            </article>
          </div>
        </div>
      </section>
    </>
  );
}