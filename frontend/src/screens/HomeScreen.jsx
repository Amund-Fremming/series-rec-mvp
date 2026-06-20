import { useState, useEffect } from 'react';
import SeriesCard from '../components/SeriesCard';
import { getSeriesPage, searchSeries } from '../client';

export default function HomeScreen({ onSelectSeries }) {
  const [query, setQuery] = useState('');
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSeriesPage().then((data) => {
      setSeries(data);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (query.trim() === '') {
      getSeriesPage().then(setSeries);
      return;
    }
    const timer = setTimeout(() => {
      searchSeries(query).then(setSeries);
    }, 250);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="screen">
      <input
        className="search-bar"
        type="search"
        placeholder="Search series..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        autoComplete="off"
      />

      {loading ? (
        <div className="empty-state">Loading...</div>
      ) : series.length === 0 ? (
        <div className="empty-state">No series found.</div>
      ) : (
        <div className="series-list">
          {series.map((s) => (
            <SeriesCard key={s.id} series={s} onClick={() => onSelectSeries(s)} />
          ))}
        </div>
      )}
    </div>
  );
}
