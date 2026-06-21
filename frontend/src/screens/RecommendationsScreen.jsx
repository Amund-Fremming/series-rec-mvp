import { useState } from 'react';
import SeriesCard from '../components/SeriesCard';
import { generateRecommendations } from '../client';

export default function RecommendationsScreen({ userId, onSelectSeries, onLoginRequired }) {
  const [recs, setRecs] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    try {
      const results = await generateRecommendations(userId);
      setRecs(results);
    } catch (e) {
      setError('Failed to generate recommendations. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="screen">
      <h2 className="section-title">Recommendations</h2>
      <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.65, marginBottom: 20 }}>
        Rate series to help us understand your taste, then generate personalised recommendations.
      </p>

      {!userId ? (
        <div className="empty-state">
          <button className="btn btn-primary" onClick={onLoginRequired}>
            Log in to see recommendations
          </button>
        </div>
      ) : (
        <>
          <button
            className="btn btn-primary"
            onClick={handleGenerate}
            disabled={loading}
          >
            {loading ? 'Generating…' : 'Generate Recommendations'}
          </button>

          {error && (
            <p className="error-state" style={{ marginTop: 16 }}>{error}</p>
          )}

          {recs !== null && (
            recs.length === 0 ? (
              <div className="empty-state" style={{ marginTop: 32 }}>
                No recommendations found. Rate more series to improve suggestions.
              </div>
            ) : (
              <div className="series-list" style={{ marginTop: 28 }}>
                {recs.map((series) => (
                  <SeriesCard
                    key={series.id}
                    series={series}
                    onClick={() => onSelectSeries(series)}
                  />
                ))}
              </div>
            )
          )}
        </>
      )}
    </div>
  );
}
