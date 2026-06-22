import StarRating from '../components/StarRating';
import { PosterImage } from '../components/SeriesCard';

export default function ReviewDetailScreen({ series, review, onBack, onViewSeries }) {
  const displayRating = review.rating / 2;

  const poster = series.poster
    ?? `https://placehold.co/200x300/1a1a1a/ffffff?text=${encodeURIComponent(series.title.slice(0, 2).toUpperCase())}`;

  return (
    <div className="screen">
      <button className="btn-back" onClick={onBack}>
        ← Back
      </button>

      <div className="detail-layout">
        <PosterImage src={poster} title={series.title} className="detail-poster" />

        <div className="detail-info">
          <div className="detail-header">
            <h1 className="detail-title">{series.title}</h1>
            {series.year && <span className="detail-year">{series.year}</span>}
          </div>

          <div className="detail-user-rating">
            <div className="muted-label">Your rating</div>
            <div className="detail-user-rating-row">
              <StarRating value={displayRating} readOnly size={24} />
              <span className="detail-user-rating-value">{displayRating} / 5</span>
            </div>

            {review.liked && (
              <div className="review-detail-section">
                <h3 className="review-detail-heading">Liked</h3>
                <p className="review-detail-body">{review.liked}</p>
              </div>
            )}

            {review.disliked && (
              <div className="review-detail-section">
                <h3 className="review-detail-heading">Disliked</h3>
                <p className="review-detail-body">{review.disliked}</p>
              </div>
            )}
          </div>

          <button className="btn btn-mt" onClick={onViewSeries}>
            View series →
          </button>
        </div>
      </div>
    </div>
  );
}
