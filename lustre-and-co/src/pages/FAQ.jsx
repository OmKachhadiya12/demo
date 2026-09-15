import PageIntro from "../components/PageIntro";

const faqGroups = [
  {
    title: "Orders",
    questions: [
      ["How do I place an order?", "Add your favorite pieces to your bag, proceed to checkout, add your delivery details, and select a payment method."],
      ["Can I modify my order?", "If your order has not entered processing, contact us as quickly as possible and we will do our best to help."],
      ["Can I cancel my order?", "Cancellation requests are handled before dispatch. Contact our support team with your order number."]
    ]
  },
  {
    title: "Products",
    questions: [
      ["What materials are used?", "Our pieces use imitation pearls, stones, and alloy bases with gold-tone, champagne-gold, rose-gold, or antique finishes."],
      ["Are the products waterproof?", "Our jewelry is not designed for prolonged exposure to water, perfumes, lotions, or harsh chemicals."],
      ["Is this fine jewelry?", "Lustre & Co. creates imitation jewelry. Product pages include the relevant finish and material details."]
    ]
  },
  {
    title: "Shipping and returns",
    questions: [
      ["How long does delivery take?", "Orders are usually dispatched within 1–2 business days and delivered within approximately 3–5 business days after dispatch."],
      ["What is the return period?", "Eligible items may be returned within 7 days of delivery in their original condition."],
      ["How can I track my order?", "Use the Track My Order page with your order number and email address."]
    ]
  },
  {
    title: "Payments",
    questions: [
      ["Which payment methods are available?", "We support UPI, cards, net banking, wallets, and cash on delivery for eligible locations."],
      ["Are online payments secure?", "Payments are processed through secure payment infrastructure. We do not store complete card details."]
    ]
  }
];

export default function FAQ() {
  return (
    <>
      <PageIntro
        eyebrow="Need a little clarity?"
        title="Frequently asked questions"
        description="Find helpful answers about products, orders, payments, shipping, and returns."
        breadcrumbs={[{ label: "FAQ" }]}
      />

      <section className="section faq-section">
        <div className="container faq-container">
          {faqGroups.map((group) => (
            <div className="faq-group" key={group.title}>
              <span className="eyebrow">{group.title}</span>
              <div className="faq-list">
                {group.questions.map(([question, answer]) => (
                  <details key={question}>
                    <summary>{question}</summary>
                    <p>{answer}</p>
                  </details>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}