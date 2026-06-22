// "?" slot shown where AI picks will appear: a dark card with a big question
// mark and its rating/info hidden behind a blur. Pulses dark→light while
// recommendations are being generated, with staggered animation from top to bottom.
export function MysterySlot({ generating = false, index = 0 }) {
  const animationDelay = generating ? `${index * 0.15}s` : undefined;

  return (
    <div
      className={`series-card mystery-slot ${generating ? "is-generating" : ""}`}
      aria-hidden="true"
    >
      <div className="mystery-slot-poster" style={{ animationDelay }}>
        ?
      </div>
      <div className="series-card-info mystery-slot-info">
        <div
          className="mystery-slot-line"
          style={{ width: "70%", animationDelay }}
        />
        <div
          className="mystery-slot-line"
          style={{ width: "42%", animationDelay }}
        />
        <div
          className="mystery-slot-line"
          style={{ width: "90%", animationDelay }}
        />
        <div
          className="mystery-slot-line"
          style={{ width: "80%", animationDelay }}
        />
      </div>
    </div>
  );
}

// Instagram-style shimmer skeleton used while stored recommendations load.
export function SkeletonCard() {
  return (
    <div className="series-card skeleton-card" aria-hidden="true">
      <div className="skeleton-poster skeleton-shimmer" />
      <div className="series-card-info">
        <div
          className="skeleton-line skeleton-shimmer"
          style={{ width: "70%" }}
        />
        <div
          className="skeleton-line skeleton-shimmer"
          style={{ width: "40%" }}
        />
        <div
          className="skeleton-line skeleton-shimmer"
          style={{ width: "92%" }}
        />
        <div
          className="skeleton-line skeleton-shimmer"
          style={{ width: "85%" }}
        />
      </div>
    </div>
  );
}
