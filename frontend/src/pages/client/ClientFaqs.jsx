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
    <section className="client-faqs" aria-labelledby="faqs-title">
      <h1 id="faqs-title">Frequently asked questions</h1>
      <p className="client-faqs-intro">Find answers to common rental questions.</p>
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
              <summary>{faq.question}</summary>
              <p>{faq.answer}</p>
            </details>
          ))}
        </div>
      )}
    </section>
  );
}
