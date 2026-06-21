import StarRating from '../components/StarRating';

export default function ReviewDetailScreen({ series, review, onBack }) {
  const displayRating = review.rating / 2;

  const poster = series.poster
    ?? `https://placehold.co/200x300/1a1a1a/ffffff?text=${encodeURIComponent(series.title.slice(0, 2).toUpperCase())}`;

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
            <span className="detail-meta-chip detail-meta-rating">★ {series.rating.toFixed(1)}</span>
            {series.genre.map((g) => (
              <span key={g} className="detail-meta-chip">{g}</span>
            ))}
          </div>

          <p className="detail-description">{series.description}</p>

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
        </div>
      </div>
    </div>
  );
}
