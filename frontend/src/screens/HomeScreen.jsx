import { useState, useEffect } from 'react';
import SeriesCard from '../components/SeriesCard';
import { getSeriesPage, searchSeries } from '../client';

const PAGE_SIZE = 20;

export default function HomeScreen({ onSelectSeries }) {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isSearching = query.trim() !== '';

  useEffect(() => {
    setError(null);

    if (!isSearching) {
      setLoading(true);
      getSeriesPage(page)
        .then((data) => { setSeries(data); setLoading(false); })
        .catch(() => { setError('Failed to load series. Please try again.'); setLoading(false); });
      return;
    }

    const timer = setTimeout(() => {
      searchSeries(query)
        .then((data) => { setSeries(data); })
        .catch(() => setError('Search failed. Please try again.'));
    }, 250);
    return () => clearTimeout(timer);
  }, [query, page]);

  function handleQueryChange(e) {
    setQuery(e.target.value);
    if (e.target.value.trim() === '') setPage(1);
  }

  const hasNextPage = series.length >= PAGE_SIZE;

  return (
    <div className="screen">
      <input
        className="search-bar"
        type="search"
        placeholder="Search series..."
        value={query}
        onChange={handleQueryChange}
        autoComplete="off"
      />

      {loading ? (
        <div className="empty-state">Loading...</div>
      ) : error ? (
        <div className="empty-state error-state">{error}</div>
      ) : series.length === 0 ? (
        <div className="empty-state">No series found.</div>
      ) : (
        <div className="series-list">
          {series.map((s) => (
            <SeriesCard key={s.id} series={s} onClick={() => onSelectSeries(s)} />
          ))}
        </div>
      )}

      {!isSearching && !error && (
        <div className="pagination">
          <button
            className="btn"
            onClick={() => setPage((p) => p - 1)}
            disabled={page === 1 || loading}
          >
            ← Back
          </button>
          <span className="pagination-page">Page {page}</span>
          <button
            className="btn"
            onClick={() => setPage((p) => p + 1)}
            disabled={!hasNextPage || loading}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
