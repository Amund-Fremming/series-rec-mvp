import { useState, useEffect } from 'react';
import SeriesCard from '../components/SeriesCard';
import { getMyRatings } from '../client';
import { useUserId } from '../hooks/useUserId';

export default function RatedScreen({ onSelectSeries }) {
  const [userId] = useUserId();
  const [rated, setRated] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyRatings(userId).then((data) => {
      setRated(data);
      setLoading(false);
    });
  }, [userId]);

  return (
    <div className="screen">
      <h2 className="section-title">My Ratings</h2>

      {loading ? (
        <div className="empty-state">Loading...</div>
      ) : rated.length === 0 ? (
        <div className="empty-state">
          You haven't rated any series yet.
          <br />
          Find one on the home screen to get started.
        </div>
      ) : (
        <div className="series-list">
          {rated.map((s) => (
            <SeriesCard
              key={s.id}
              series={s}
              userRating={s.userRating}
              onClick={() => onSelectSeries(s)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
