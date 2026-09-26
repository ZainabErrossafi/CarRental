import { useEffect, useMemo, useState } from "react";
import { Trash2, Star } from "lucide-react";
import { getReviews, deleteReview } from "../../services/adminApi";

const RATING_TABS = ["All", "5", "4", "3", "2", "1"];

export default function AdminReviews() {
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

  const avgRatingNum = reviews.length
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;
  const avgRating = reviews.length ? avgRatingNum.toFixed(1) : "—";

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this review?")) return;
    await deleteReview(id);
    setReviews((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div>
      <div className="page-header">
        <h1>Reviews</h1>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-label">Total reviews</span>
          </div>
          <div className="stat-value-row">
            <span className="stat-value">{reviews.length}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-label">Average rating</span>
          </div>
          <div className="stat-value-row">
            <span className="stat-value">{avgRating}</span>
            <StarRow rating={Math.round(avgRatingNum)} size={14} />
          </div>
        </div>
      </div>

      <div className="pill-tabs">
        {RATING_TABS.map((t) => (
          <button
            key={t}
            className={`pill-tab ${tab === t ? "active" : ""}`}
            onClick={() => setTab(t)}
          >
            {t === "All" ? "All" : `${t} ★`}
          </button>
        ))}
      </div>

      <div className="table-card">
        <div className="table-card-header">
          Reviews
          <span className="count-pill">{filtered.length}</span>

          <div className="search-box" style={{ marginLeft: "auto" }}>
            <input
              placeholder="Search reviews"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{ border: "none", outline: "none", background: "none", width: "160px" }}
            />
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Vehicle</th>
              <th>User</th>
              <th>Rating</th>
              <th>Comment</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((r) => (
              <tr key={r.id}>
                <td>{r.vehicle}</td>
                <td>{r.user}</td>
                <td>
                  <StarRow rating={r.rating} />
                </td>
                <td className="review-comment">{r.comment}</td>
                <td>
                  <div className="row-actions">
                    <button onClick={() => handleDelete(r.id)} title="Delete" className="danger">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: "center", color: "var(--muted)", padding: "2rem" }}>
                  No reviews match this filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
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