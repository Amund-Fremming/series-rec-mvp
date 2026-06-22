import { useState, useEffect } from 'react';
import SeriesCard from '../components/SeriesCard';
import { SkeletonCard } from '../components/RecPlaceholders';
import { searchSeries } from '../client';
import { useAppData } from '../hooks/useAppData';

const PAGE_SIZE = 20;

export default function HomeScreen({ onSelectSeries }) {
  const { popular } = useAppData();
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [searchResults, setSearchResults] = useState(null);
  const [searchError, setSearchError] = useState(null);

  const isSearching = query.trim() !== '';

  // Make sure the requested popular page is cached in the store. Page 1 is
  // pre-loaded at app start, so the first visit here is already populated.
  useEffect(() => {
    if (!isSearching) popular.loadPage(page);
  }, [page, isSearching, popular]);

  // Paging from the bottom of a long list should start the new page at the top.
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [page]);

  // Search is inherently dynamic, so it stays on-demand (debounced).
  useEffect(() => {
    if (!isSearching) {
      setSearchResults(null);
      setSearchError(null);
      return;
    }
    const timer = setTimeout(() => {
      searchSeries(query)
        .then(setSearchResults)
        .catch(() => setSearchError('Search failed. Please try again.'));
    }, 250);
    return () => clearTimeout(timer);
  }, [query, isSearching]);

  function handleQueryChange(e) {
    setQuery(e.target.value);
    if (e.target.value.trim() === '') setPage(1);
  }

  const series = isSearching ? searchResults : popular.pages[page];
  const error = isSearching ? searchError : popular.error;
  const loading = !error && series == null;
  const hasNextPage = (series?.length ?? 0) >= PAGE_SIZE;

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

      {error ? (
        <div className="empty-state error-state">{error}</div>
      ) : loading ? (
        // Same skeleton cards used on the recommendations screen, so initial
        // load and page navigation swap in/out without layout shift or glitch.
        <div className="series-list">
          {Array.from({ length: PAGE_SIZE }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
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
