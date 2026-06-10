import { useState } from 'react';
import StarRating from './StarRating';

const STEPS = [
  {
    label: 'Step 1 of 3',
    title: 'How did you hear about this series?',
    placeholder: 'Friend recommendation, social media, saw it trending...',
    field: 'howFound',
  },
  {
    label: 'Step 2 of 3',
    title: 'What did you think of it?',
    placeholder: 'Share your thoughts, what stood out, would you recommend it...',
    field: 'thoughts',
  },
];

export default function RatingModal({ series, onClose, onSubmit }) {
  const [step, setStep] = useState(1);
  const [howFound, setHowFound] = useState('');
  const [thoughts, setThoughts] = useState('');
  const [rating, setRating] = useState(0);

  const values = { howFound, thoughts };
  const setters = { howFound: setHowFound, thoughts: setThoughts };

  function handleNext() {
    if (step < 3) setStep((s) => s + 1);
  }

  function handleBack() {
    if (step > 1) setStep((s) => s - 1);
  }

  function handleSubmit() {
    onSubmit({ howFound, thoughts, rating });
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
