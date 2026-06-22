export default function Logo({ onClick }) {
  return (
    <button
      type="button"
      className="app-logo"
      onClick={onClick}
      aria-label="Go to home"
    >
      <svg
        className="app-logo-icon"
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <rect x="2" y="7" width="20" height="13" rx="2" />
        <polyline points="8 3 12 7 16 3" />
        <polygon
          points="10 11 15 13.5 10 16"
          fill="currentColor"
          stroke="none"
        />
      </svg>
    </button>
  );
}
