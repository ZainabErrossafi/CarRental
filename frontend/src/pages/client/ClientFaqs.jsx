import { useEffect, useState } from "react";
import { getList } from "../../services/api.js";

export default function ClientFaqs() {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    getList("faqs/")
      .then((items) => {
        if (active) setFaqs(items.filter((item) => item.active).sort((a, b) => a.order - b.order));
      })
      .catch(() => {
        if (active) setError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="client-faqs client-faqs-soft" aria-labelledby="faqs-title">
      <header className="client-faqs-heading">
        <h1 id="faqs-title">FAQs</h1>
      </header>
      {loading ? (
        <p role="status">Loading questions…</p>
      ) : error ? (
        <p role="alert">Questions are temporarily unavailable. Please try again later.</p>
      ) : !faqs.length ? (
        <p>No questions have been published yet.</p>
      ) : (
        <div className="client-faqs-list">
          {faqs.map((faq) => (
            <details key={faq.id}>
              <summary><span>{faq.question}</span><span className="client-faqs-toggle" aria-hidden="true" /></summary>
              <p>{faq.answer}</p>
            </details>
          ))}
        </div>
      )}
    </section>
  );
}
