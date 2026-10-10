import { useI18n } from "../../context/I18nContext";
import Pagination from "../../components/Pagination.jsx";
import usePagination from "../../hooks/usePagination.js";
import { useEffect, useMemo, useState } from "react";
import { Trash2, Star } from "lucide-react";
import { getReviews, deleteReview } from "../../services/adminApi";
import { useConfirm } from "../../context/Confirmcontext";

const RATING_TABS = ["All", "5", "4", "3", "2", "1"];

export default function AdminReviews() {
  const { t } = useI18n();
  const confirm = useConfirm();
  const [reviews, setReviews] = useState([]);
  const [tab, setTab] = useState("All");
  const [query, setQuery] = useState("");

  useEffect(() => {
    getReviews().then(setReviews);
  }, []);

  const filtered = useMemo(() => {
    return reviews
      .filter((r) => tab === "All" || r.rating === Number(tab))
      .filter((r) =>
        `${r.vehicle} ${r.user} ${r.comment}`.toLowerCase().includes(query.toLowerCase())
      );
  }, [reviews, tab, query]);

  const pagination = usePagination(filtered, JSON.stringify([tab, query]));

  const avgRatingNum = reviews.length
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;
  const avgRating = reviews.length ? avgRatingNum.toFixed(1) : "—";

  const handleDelete = async (id) => {
    if (!(await confirm("Are you sure you want to delete this review?", { danger: true, confirmLabel: "Delete" }))) return;
    await deleteReview(id);
    setReviews((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div>
      <div className="page-header">
        <h1>{t("Reviews")}</h1>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-label">{t("Total reviews")}</span>
          </div>
          <div className="stat-value-row">
            <span className="stat-value">{reviews.length}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-label">{t("Average rating")}</span>
          </div>
          <div className="stat-value-row">
            <span className="stat-value">{avgRating}</span>
            <StarRow rating={Math.round(avgRatingNum)} size={14} />
          </div>
        </div>
      </div>

      <div className="pill-tabs">
        {RATING_TABS.map((tabLabel) => (
          <button
            key={tabLabel}
            className={`pill-tab ${tab === tabLabel ? "active" : ""}`}
            onClick={() => setTab(tabLabel)}
          >
            {tabLabel === "All" ? t("All") : `${t(tabLabel)} ★`}
          </button>
        ))}
      </div>

      <div className="table-card">
        <div className="table-card-header">
          {t("Reviews")}
          <span className="count-pill">{filtered.length}</span>

          <div className="search-box" style={{ marginInlineStart: "auto" }}>
            <input
              placeholder={t("Search reviews")}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{ border: "none", outline: "none", background: "none", width: "160px" }}
            />
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>{t("Vehicle")}</th>
              <th>{t("User")}</th>
              <th>{t("Rating")}</th>
              <th>{t("Comment")}</th>
              <th>{t("Actions")}</th>
            </tr>
          </thead>

          <tbody>
            {pagination.pageItems.map((r) => (
              <tr key={r.id}>
                <td>{r.vehicle}</td>
                <td>{r.user}</td>
                <td>
                  <StarRow rating={r.rating} />
                </td>
                <td className="review-comment">{r.comment}</td>
                <td>
                  <div className="row-actions">
                    <button onClick={() => handleDelete(r.id)} title={t("Delete")} className="danger">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: "center", color: "var(--muted)", padding: "2rem" }}>
                  {t("No reviews match this filter.")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <Pagination {...pagination} />
      </div>
    </div>
  );
}

function StarRow({ rating, size = 15 }) {
  return (
    <div className="star-row">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={size}
          fill={i < rating ? "#FBBF24" : "none"}
          stroke={i < rating ? "#FBBF24" : "#D1D5DB"}
        />
      ))}
    </div>
  );
}