import { useState } from 'react';
import StarRating from './StarRating';

const STEPS = [
  {
    label: 'Step 1 of 3',
    title: 'What did you especially like about this?',
    placeholder: 'It was mysterious, never knew what really happened... Very futuristic and cool... Nostalgic and calm...',
    field: 'liked',
  },
  {
    label: 'Step 2 of 3',
    title: 'What did you not like about it?',
    placeholder: 'It was mysterious, never knew what really happened... Very futuristic and cool... Nostalgic and calm...',
    field: 'disliked',
  },
];

export default function RatingModal({ series, onClose, onSubmit, initialData }) {
  const [step, setStep] = useState(1);
  const [liked, setLiked] = useState(initialData?.liked ?? '');
  const [disliked, setDisliked] = useState(initialData?.disliked ?? '');
  const [rating, setRating] = useState(initialData?.rating ?? 0);

  const values = { liked, disliked };
  const setters = { liked: setLiked, disliked: setDisliked };

  function handleNext() {
    if (step < 3) setStep((s) => s + 1);
  }

  function handleBack() {
    if (step > 1) setStep((s) => s - 1);
  }

  function handleSubmit() {
    onSubmit({ liked, disliked, rating });
  }

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-series-name">{series.title}</div>

        {step <= 2 && (() => {
          const s = STEPS[step - 1];
          return (
            <>
              <div className="modal-step-label">{s.label}</div>
              <h2 className="modal-title">{s.title}</h2>
              <textarea
                className="modal-input"
                placeholder={s.placeholder}
                value={values[s.field]}
                onChange={(e) => setters[s.field](e.target.value)}
                autoFocus
              />
              <div className="modal-actions">
                {step > 1 && (
                  <button className="btn" onClick={handleBack}>
                    Back
                  </button>
                )}
                <button className="btn" onClick={onClose}>
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={handleNext}>
                  Next
                </button>
              </div>
            </>
          );
        })()}

        {step === 3 && (
          <>
            <div className="modal-step-label">Step 3 of 3</div>
            <h2 className="modal-title">Rate this series</h2>
            <p className="modal-star-hint">Click a star to rate — half stars supported</p>
            <div className="modal-stars">
              <StarRating value={rating} onChange={setRating} size={44} />
            </div>
            <div className="modal-rating-display">
              {rating === 0 ? '—' : `${rating} / 5`}
            </div>
            <div className="modal-actions">
              <button className="btn" onClick={handleBack}>
                Back
              </button>
              <button className="btn" onClick={onClose}>
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleSubmit}
                disabled={rating === 0}
              >
                Submit
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
