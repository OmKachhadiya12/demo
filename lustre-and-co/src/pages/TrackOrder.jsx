import { useSearchParams } from "react-router-dom";
import { Package, Check, Truck, Home } from "lucide-react";
import { useState } from "react";
import PageIntro from "../components/PageIntro";
import { useStore } from "../context/StoreContext";

const stages = [
  { title: "Order placed", icon: Check },
  { title: "Processing", icon: Package },
  { title: "Shipped", icon: Truck },
  { title: "Delivered", icon: Home }
];

export default function TrackOrder() {
  const [searchParams] = useSearchParams();
  const { lastOrder } = useStore();

  const [orderNumber, setOrderNumber] = useState(
    searchParams.get("order") || lastOrder?.id || ""
  );
  const [email, setEmail] = useState("");
  const [searched, setSearched] = useState(Boolean(lastOrder));

  function submit(event) {
    event.preventDefault();
    setSearched(true);
  }

  const currentStage = lastOrder ? 0 : -1;

  return (
    <>
      <PageIntro
        eyebrow="Order updates"
        title="Track your order"
        description="Enter your details to see the latest movement of your Lustre & Co. order."
        breadcrumbs={[{ label: "Order Tracking" }]}
      />

      <section className="section tracking-section">
        <div className="container">
          <div className="tracking-search-card">
            <form onSubmit={submit} className="tracking-form">
              <label>
                Order number
                <input
                  value={orderNumber}
                  onChange={(event) => setOrderNumber(event.target.value)}
                  placeholder="Example: LST-12345678"
                  required
                />
              </label>

              <label>
                Email address
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  required={!lastOrder}
                />
              </label>

              <button type="submit" className="button button-dark">
                Track order
              </button>
            </form>
          </div>

          {searched && (
            <div className="tracking-result">
              <div className="tracking-result-header">
                <div>
                  <span className="eyebrow">Order found</span>
                  <h2>{orderNumber || "LST-00000000"}</h2>
                </div>
                <span className="status-pill">Order placed</span>
              </div>

              <div className="tracking-timeline">
                {stages.map((stage, index) => {
                  const Icon = stage.icon;
                  const active = index <= currentStage;

                  return (
                    <div
                      className={`tracking-stage ${active ? "is-active" : ""}`}
                      key={stage.title}
                    >
                      <div className="tracking-stage-icon">
                        <Icon size={17} />
                      </div>
                      <span>{stage.title}</span>
                    </div>
                  );
                })}
              </div>

              <div className="tracking-help">
                <p>
                  Your order is being prepared. You will receive tracking
                  information as soon as it leaves our studio.
                </p>
                <a href="mailto:hello@lustreandco.com" className="text-link">
                  Need help?
                </a>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}