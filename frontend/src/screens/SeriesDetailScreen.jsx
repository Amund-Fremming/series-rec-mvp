import { useState } from 'react';
import StarRating from '../components/StarRating';
import RatingModal from '../components/RatingModal';
import { rateSeries } from '../client';
import { useUserId } from '../hooks/useUserId';

export default function SeriesDetailScreen({ series, onBack }) {
  const userId = useUserId();
  const [showModal, setShowModal] = useState(false);
  const [userRating, setUserRating] = useState(series.userRating ?? null);
  const [submitted, setSubmitted] = useState(userRating !== null);

  async function handleSubmit(data) {
    await rateSeries(userId, series.id, data);
    setUserRating(data.rating);
    setSubmitted(true);
    setShowModal(false);
  }

  return (
    <div className="screen">
      <button className="btn-back" onClick={onBack}>
        ← Back
      </button>

      <div className="detail-layout">
        <img
          className="detail-poster"
          src={series.poster}
          alt={series.title}
        />

        <div className="detail-info">
          <div className="detail-header">
            <h1 className="detail-title">{series.title}</h1>
            <span className="detail-year">{series.year}</span>
          </div>

          <div className="detail-meta">
            <span className="detail-meta-chip detail-meta-rating">★ {series.rating}</span>
            <span className="detail-meta-chip">
              {series.seasons} {series.seasons === 1 ? 'season' : 'seasons'}
            </span>
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
            >
              Rate this series
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
