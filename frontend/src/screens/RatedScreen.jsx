import { useState, useEffect } from 'react';
import StarRating from '../components/StarRating';
import { getUserReviews, getSeriesById } from '../client';

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w92';

export default function RatedScreen({ userId }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    getUserReviews(userId)
      .then(async (reviews) => {
        const enriched = await Promise.all(
          reviews.map(async (review) => {
            if (!review.tmdb_series_id) return { review, series: null };
            try {
              const series = await getSeriesById(review.tmdb_series_id);
              return { review, series };
            } catch {
              return { review, series: null };
            }
          })
        );
        setItems(enriched);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load your reviews.');
        setLoading(false);
      });
  }, [userId]);

  if (!userId) {
    return (
      <div className="screen">
        <h2 className="section-title">My Ratings</h2>
        <div className="empty-state">Log in to see your reviews.</div>
      </div>
    );
  }

  return (
    <div className="screen">
      <h2 className="section-title">My Ratings</h2>

      {loading ? (
        <div className="empty-state">Loading...</div>
      ) : error ? (
        <div className="empty-state error-state">{error}</div>
      ) : items.length === 0 ? (
        <div className="empty-state">
          No ratings yet. Find a series on the home screen and rate it.
        </div>
      ) : (
        <div className="review-list">
          {items.map(({ review, series }) => {
            const displayRating = review.rating / 2;
            const title = series?.name ?? `Series #${review.tmdb_series_id}`;
            const poster = series?.poster_path
              ? `${TMDB_IMAGE_BASE}${series.poster_path}`
              : null;

            return (
              <div key={review.id} className="review-card">
                {poster && (
                  <img className="review-card-poster" src={poster} alt={title} />
                )}
                <div className="review-card-body">
                  <div className="review-card-title">{title}</div>
                  <div className="review-card-rating">
                    <StarRating value={displayRating} readOnly size={18} />
                    <span className="review-card-rating-value">{displayRating} / 5</span>
                  </div>
                  {review.liked && (
                    <p className="review-sentiment">
                      <span className="review-label">Liked:</span> {review.liked}
                    </p>
                  )}
                  {review.disliked && (
                    <p className="review-sentiment">
                      <span className="review-label">Disliked:</span> {review.disliked}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
