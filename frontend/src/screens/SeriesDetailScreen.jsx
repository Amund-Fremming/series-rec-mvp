import { useState } from 'react';
import StarRating from '../components/StarRating';
import RatingModal from '../components/RatingModal';
import { saveReview } from '../client';
import { useUserId } from '../hooks/useUserId';

export default function SeriesDetailScreen({ series, onBack }) {
  const [userId] = useUserId();
  const [showModal, setShowModal] = useState(false);
  const [userRating, setUserRating] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(data) {
    await saveReview({
      series_id: crypto.randomUUID(),
      user_id: userId,
      tmdb_series_id: series.id,
      // scale 0–5 star rating to 1–10 backend range
      rating: Math.max(1, Math.round(data.rating * 2)),
      liked: data.liked || undefined,
      disliked: data.disliked || undefined,
    });
    setUserRating(data.rating);
    setSubmitted(true);
    setShowModal(false);
  }

  const poster = series.poster
    ?? `https://placehold.co/200x300/1a1a1a/ffffff?text=${encodeURIComponent(series.title.slice(0, 2).toUpperCase())}`;

  return (
    <div className="screen">
      <button className="btn-back" onClick={onBack}>
        ← Back
      </button>

      <div className="detail-layout">
        <img
          className="detail-poster"
          src={poster}
          alt={series.title}
        />

        <div className="detail-info">
          <div className="detail-header">
            <h1 className="detail-title">{series.title}</h1>
            {series.year && <span className="detail-year">{series.year}</span>}
          </div>

          <div className="detail-meta">
            <span className="detail-meta-chip detail-meta-rating">★ {series.rating.toFixed(1)}</span>
            {series.genre.map((g) => (
              <span key={g} className="detail-meta-chip">
                {g}
              </span>
            ))}
          </div>

          <p className="detail-description">{series.description}</p>

          {submitted && userRating !== null ? (
            <div className="detail-user-rating">
              <div className="muted-label">Your rating</div>
              <div className="detail-user-rating-row">
                <StarRating value={userRating} readOnly size={24} />
                <span className="detail-user-rating-value">{userRating} / 5</span>
              </div>
              <button
                className="btn btn-mt"
                onClick={() => setShowModal(true)}
              >
                Update rating
              </button>
            </div>
          ) : (
            <button
              className="btn btn-primary btn-mt"
              onClick={() => setShowModal(true)}
              disabled={!userId}
            >
              {userId ? 'Rate this series' : 'Log in to rate'}
            </button>
          )}
        </div>
      </div>

      {showModal && (
        <RatingModal
          series={series}
          onClose={() => setShowModal(false)}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}
