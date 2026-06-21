import { useState, useEffect } from 'react';
import SeriesCard from '../components/SeriesCard';
import { getUserReviews, getSeriesById } from '../client';

export default function RatedScreen({ userId, onSelectReview }) {
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
            if (!review.tmdb_series_id) return null;
            try {
              const series = await getSeriesById(review.tmdb_series_id);
              return { review, series };
            } catch {
              return null;
            }
          })
        );
        setItems(enriched.filter(Boolean));
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
        <div className="series-list">
          {items.map(({ review, series }) => (
            <SeriesCard
              key={review.id}
              series={series}
              userRating={review.rating / 2}
              onClick={() => onSelectReview(series, review)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
