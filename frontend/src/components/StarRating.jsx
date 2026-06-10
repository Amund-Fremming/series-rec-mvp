import { useState } from 'react';

const STAR_PATH =
  'M 50,5 L 61,35 L 95,35 L 68,57 L 79,91 L 50,70 L 21,91 L 32,57 L 5,35 L 39,35 Z';

function Star({ size, filled, half }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      style={{ display: 'block', flexShrink: 0 }}
    >
      <path d={STAR_PATH} fill="var(--star-empty, #ddd)" />
      {(filled || half) && (
        <path
          d={STAR_PATH}
          fill="var(--star-fill, currentColor)"
          style={half ? { clipPath: 'inset(0 50% 0 0)' } : undefined}
        />
      )}
    </svg>
  );
}

export default function StarRating({
  value = 0,
  onChange,
  readOnly = false,
  size = 32,
}) {
  const [hover, setHover] = useState(null);
  const display = hover !== null ? hover : value;

  return (
    <div
      style={{ display: 'flex', gap: Math.max(2, size * 0.1), alignItems: 'center' }}
      onMouseLeave={() => !readOnly && setHover(null)}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const isFull = display >= star;
        const isHalf = display >= star - 0.5 && display < star;

        return (
          <div
            key={star}
            style={{ cursor: readOnly ? 'default' : 'pointer' }}
            onMouseMove={
              readOnly
                ? undefined
                : (e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setHover(
                      e.clientX - rect.left < rect.width / 2
                        ? star - 0.5
                        : star
                    );
                  }
            }
            onClick={
              readOnly
                ? undefined
                : (e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    onChange(
                      e.clientX - rect.left < rect.width / 2
                        ? star - 0.5
                        : star
                    );
                  }
            }
          >
            <Star size={size} filled={isFull} half={isHalf} />
          </div>
        );
      })}
    </div>
  );
}
