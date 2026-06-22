import SeriesCard from '../components/SeriesCard';
import { useAppData } from '../hooks/useAppData';

export default function RatedScreen({ userId, onSelectReview, onAuth }) {
  const { reviews } = useAppData();

  if (!userId) {
    return (
      <div className="screen">
        <div className="empty-state">
          <button type="button" className="inline-link" onClick={() => onAuth('login')}>
            Log in here
          </button>{' '}
          to see your reviews.
        </div>
      </div>
    );
  }

  const items = reviews.items ?? [];

  return (
    <div className="screen">
      {reviews.loading ? (
        <div className="empty-state">Loading...</div>
      ) : reviews.error ? (
        <div className="empty-state error-state">{reviews.error}</div>
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
              compact
              onClick={() => onSelectReview(series, review)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
