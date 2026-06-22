import { useState } from "react";
import SeriesCard from "../components/SeriesCard";
import { MysterySlot, SkeletonCard } from "../components/RecPlaceholders";
import { useAppData } from "../hooks/useAppData";

const SLOT_COUNT = 5;

export default function RecommendationsScreen({
  userId,
  onSelectSeries,
  onAuth,
}) {
  const { recommendations } = useAppData();
  // Pre-loaded at app start, so navigating here is instant (no refetch).
  const recs = userId ? recommendations.items : null;
  const generating = recommendations.generating;
  const error = recommendations.error;

  // True once the user has generated during this visit. Until then — and again
  // after navigating away and back — the top zone shows the "?" invite slots.
  const [generatedThisSession, setGeneratedThisSession] = useState(false);

  async function handleGenerate() {
    await recommendations.generate();
    setGeneratedThisSession(true);
  }

  // Split stored recs into the most recent generation batch and everything
  // older. Since items in a batch are saved sequentially with slightly different
  // timestamps, we group items created within 60 seconds of the newest as one batch.
  let newest = [];
  let previous = [];
  if (recs && recs.length > 0) {
    const latestTime = new Date(recs[0].createdAt).getTime();
    const BATCH_THRESHOLD_MS = 60_000; // 60 seconds
    for (const r of recs) {
      const recTime = new Date(r.createdAt).getTime();
      (latestTime - recTime < BATCH_THRESHOLD_MS ? newest : previous).push(r);
    }
  }

  if (!userId) {
    return (
      <div className="screen">
        <div className="empty-state">
          <button
            type="button"
            className="inline-link"
            onClick={() => onAuth("login")}
          >
            Log in here
          </button>{" "}
          to see recommendations.
        </div>
      </div>
    );
  }

  const slots = Array.from({ length: SLOT_COUNT });

  // ── Top "generate" zone ────────────────────────────────────────────
  // First load: shimmer skeletons. Generating: pulsing "?" slots. Just
  // generated this session: the fresh picks fill the slots. Otherwise: the
  // static "?" invite that the user clicks Generate to reveal.
  let topContent;
  if (recs === null) {
    topContent = slots.map((_, i) => <SkeletonCard key={i} />);
  } else if (generating) {
    topContent = slots.map((_, i) => (
      <MysterySlot key={i} index={i} generating />
    ));
  } else if (generatedThisSession && newest.length > 0) {
    topContent = newest.map((series) => (
      <SeriesCard
        key={series.id}
        series={series}
        onClick={() => onSelectSeries(series)}
      />
    ));
  } else {
    topContent = slots.map((_, i) => <MysterySlot key={i} index={i} />);
  }

  // ── Cards below the separator ───────────────────────────────────────
  // While generating, the prior picks immediately drop down here. Once a fresh
  // batch has been revealed this session, only the older batches stay below.
  let belowCards;
  if (recs === null)
    belowCards = null; // loading → skeletons below
  else if (generating) belowCards = recs;
  else if (generatedThisSession) belowCards = previous;
  else belowCards = recs;

  const showBelow = belowCards === null || belowCards.length > 0;

  return (
    <div className="screen">
      <p className="recs-hero-subtitle">Generate your AI picks</p>

      <button
        className="btn btn-primary"
        onClick={handleGenerate}
        disabled={generating}
      >
        {generating ? "Generating…" : "Generate Recommendations"}
      </button>

      {error && (
        <p className="error-state" style={{ marginTop: 16 }}>
          {error}
        </p>
      )}

      <div className="series-list" style={{ marginTop: 24 }}>
        {topContent}
      </div>

      {showBelow && (
        <>
          <div className="recs-separator">
            <span>Previous recommendations</span>
          </div>
          <div className="series-list">
            {belowCards === null
              ? slots.map((_, i) => <SkeletonCard key={i} />)
              : belowCards.map((series) => (
                  <SeriesCard
                    key={series.id}
                    series={series}
                    onClick={() => onSelectSeries(series)}
                  />
                ))}
          </div>
        </>
      )}
    </div>
  );
}
