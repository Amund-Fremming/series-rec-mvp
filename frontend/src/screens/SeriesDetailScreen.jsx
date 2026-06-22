import { useState, useEffect } from "react";
import StarRating from "../components/StarRating";
import RatingModal from "../components/RatingModal";
import { saveReview, updateReview, getUserReview } from "../client";
import { useUserId } from "../hooks/useUserId";
import { useAppData } from "../hooks/useAppData";

export default function SeriesDetailScreen({
  series,
  onBack,
  onAuth,
}) {
  const { userId, isLoggedIn } = useUserId();
  const { reviews } = useAppData();
  const [showModal, setShowModal] = useState(false);
  const [existingReview, setExistingReview] = useState(null);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Re-runs the moment the user logs in (isLoggedIn flips via the shared hook),
  // so the screen loads their review and swaps the call-to-action without a reload.
  useEffect(() => {
    if (!isLoggedIn) return;
    setReviewLoading(true);
    getUserReview(userId, series.id)
      .then((review) => {
        setExistingReview(review);
        setReviewLoading(false);
      })
      .catch(() => setReviewLoading(false));
  }, [isLoggedIn, userId, series.id]);

  async function handleSubmit(data) {
    setSubmitError(null);
    try {
      const rating = Math.max(1, Math.round(data.rating * 2));
      const liked = data.liked || undefined;
      const disliked = data.disliked || undefined;
      const saved = existingReview
        ? await updateReview(existingReview.id, { rating, liked, disliked })
        : await saveReview({
            series_id: crypto.randomUUID(),
            user_id: userId,
            tmdb_series_id: series.id,
            rating,
            liked,
            disliked,
          });
      setExistingReview(saved);
      setShowModal(false);
      // Keep the cached "My Ratings" list in sync with the new/updated review.
      reviews.refresh();
    } catch {
      setSubmitError("Failed to save rating. Please try again.");
    }
  }

  const poster =
    series.poster ??
    `https://placehold.co/200x300/1a1a1a/ffffff?text=${encodeURIComponent(series.title.slice(0, 2).toUpperCase())}`;

  const displayRating = existingReview ? existingReview.rating / 2 : null;

  return (
    <div className="screen">
      <button className="btn-back" onClick={onBack}>
        ← Back
      </button>

      <div className="detail-layout">
        <img className="detail-poster" src={poster} alt={series.title} />

        <div className="detail-info">
          <div className="detail-header">
            <h1 className="detail-title">{series.title}</h1>
            {series.year && <span className="detail-year">{series.year}</span>}
          </div>

          <div className="detail-meta">
            <span className="detail-meta-chip detail-meta-rating">
              ★ {series.rating.toFixed(1)}
            </span>
            {series.genre.map((g) => (
              <span key={g} className="detail-meta-chip">
                {g}
              </span>
            ))}
          </div>

          <p className="detail-description">{series.description}</p>

          {submitError && <p className="login-error">{submitError}</p>}

          {reviewLoading ? (
            <p className="muted-label">Loading your review…</p>
          ) : existingReview ? (
            <div className="detail-user-rating">
              <div className="muted-label">Your review</div>
              <div className="detail-user-rating-row">
                <StarRating value={displayRating} readOnly size={24} />
                <span className="detail-user-rating-value">
                  {displayRating} / 5
                </span>
              </div>
              {existingReview.liked && (
                <p className="review-sentiment">
                  <span className="review-label">Liked:</span>{" "}
                  {existingReview.liked}
                </p>
              )}
              {existingReview.disliked && (
                <p className="review-sentiment">
                  <span className="review-label">Disliked:</span>{" "}
                  {existingReview.disliked}
                </p>
              )}
              <button className="btn btn-mt" onClick={() => setShowModal(true)}>
                Update review
              </button>
            </div>
          ) : isLoggedIn ? (
            <button
              className="btn btn-primary btn-mt"
              onClick={() => setShowModal(true)}
            >
              Rate this series
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-primary btn-mt"
              onClick={() => onAuth?.("login")}
            >
              Log in to rate
            </button>
          )}
        </div>
      </div>

      {showModal && (
        <RatingModal
          series={series}
          initialData={
            existingReview
              ? {
                  rating: displayRating,
                  liked: existingReview.liked ?? "",
                  disliked: existingReview.disliked ?? "",
                }
              : undefined
          }
          onClose={() => setShowModal(false)}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}
