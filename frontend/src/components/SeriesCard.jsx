import StarRating from './StarRating';

export default function SeriesCard({ series, onClick, userRating }) {
  return (
    <div className="series-card" onClick={onClick} role="button" tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.()}>
      <PosterImage src={series.poster} title={series.title} />
      <div className="series-card-info">
        <div className="series-card-header">
          <h3 className="series-card-title">{series.title}</h3>
          <span className="series-card-year">{series.year}</span>
        </div>
        <div className="series-card-meta">
          <span className="series-card-rating">★ {series.rating}</span>
          <span className="series-card-dot">·</span>
          <span>
            {series.seasons} {series.seasons === 1 ? 'season' : 'seasons'}
          </span>
          <span className="series-card-dot">·</span>
          <span>{series.genre.join(', ')}</span>
        </div>
        <p className="series-card-description">{series.description}</p>
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
