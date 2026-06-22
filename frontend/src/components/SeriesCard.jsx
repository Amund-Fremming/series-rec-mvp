import StarRating from './StarRating';

export default function SeriesCard({ series, onClick, userRating, compact = false }) {
  const poster = series.poster
    ?? `https://placehold.co/200x300/1a1a1a/ffffff?text=${encodeURIComponent(series.title.slice(0, 2).toUpperCase())}`;

  return (
    <div className="series-card" onClick={onClick} role="button" tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.()}>
      <PosterImage src={poster} title={series.title} />
      <div className="series-card-info">
        <div className="series-card-header">
          <h3 className="series-card-title">{series.title}</h3>
          {series.year && <span className="series-card-year">{series.year}</span>}
        </div>
        {series.confidence !== undefined && (
          <span className="series-card-confidence" title="AI match confidence">
            {series.confidence}% match
          </span>
        )}
        {!compact && (
          <>
            <div className="series-card-meta">
              <span className="series-card-rating">★ {series.rating.toFixed(1)}</span>
              {series.genre.length > 0 && (
                <>
                  <span className="series-card-dot">·</span>
                  <span>{series.genre.slice(0, 3).join(', ')}</span>
                </>
              )}
            </div>
            <p className="series-card-description">{series.description}</p>
          </>
        )}
        {userRating !== undefined && (
          <div className="series-card-user-rating">
            <span className="muted-label">Your rating</span>
            <StarRating value={userRating} readOnly size={16} />
            <span className="series-card-rating">{userRating}/5</span>
          </div>
        )}
      </div>
    </div>
  );
}

export function PosterImage({ src, title, className = '', style = {} }) {
  return (
    <img
      className={`poster-img ${className}`}
      src={src}
      alt={title}
      style={style}
      onError={(e) => {
        e.currentTarget.style.display = 'none';
        e.currentTarget.nextElementSibling?.style.setProperty('display', 'flex');
      }}
    />
  );
}
