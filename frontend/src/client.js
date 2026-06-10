// TODO: Replace mock implementations with real API calls

const MOCK_SERIES = [
  {
    id: "1",
    title: "Breaking Bad",
    poster: "https://placehold.co/200x300/1a1a1a/ffffff?text=BB",
    rating: 9.5,
    seasons: 5,
    year: 2008,
    genre: ["Drama", "Crime"],
    description:
      "A high school chemistry teacher turned methamphetamine manufacturer partners with a former student to secure his family's future after being diagnosed with terminal cancer.",
  },
  {
    id: "2",
    title: "The Wire",
    poster: "https://placehold.co/200x300/2d2d2d/ffffff?text=TW",
    rating: 9.3,
    seasons: 5,
    year: 2002,
    genre: ["Drama", "Crime"],
    description:
      "The Baltimore drug scene is explored through the perspectives of dealers and detectives, revealing systemic issues across institutions from the police to schools.",
  },
  {
    id: "3",
    title: "Succession",
    poster: "https://placehold.co/200x300/3a1a1a/ffffff?text=SC",
    rating: 8.9,
    seasons: 4,
    year: 2018,
    genre: ["Drama", "Comedy"],
    description:
      "A dysfunctional media family competes for control of their empire as the ageing patriarch's health declines, exposing the dark side of wealth, loyalty, and ambition.",
  },
  {
    id: "4",
    title: "Dark",
    poster: "https://placehold.co/200x300/0d1a2d/ffffff?text=DK",
    rating: 8.7,
    seasons: 3,
    year: 2017,
    genre: ["Sci-Fi", "Thriller"],
    description:
      "A complex time-travel mystery spanning multiple generations unfolds in a small German town, connecting four families through decades of secrets and paradoxes.",
  },
  {
    id: "5",
    title: "Severance",
    poster: "https://placehold.co/200x300/1a2d1a/ffffff?text=SV",
    rating: 8.7,
    seasons: 2,
    year: 2022,
    genre: ["Sci-Fi", "Thriller"],
    description:
      "Employees at Lumon Industries have their work and personal memories surgically separated. One employee begins to question what the company is hiding.",
  },
  {
    id: "6",
    title: "The Bear",
    poster: "https://placehold.co/200x300/2d1a0d/ffffff?text=TB",
    rating: 8.6,
    seasons: 3,
    year: 2022,
    genre: ["Drama", "Comedy"],
    description:
      "A Michelin-starred chef returns to Chicago to run his late brother's chaotic sandwich shop, navigating grief, identity, and the brutal pressure of kitchen life.",
  },
  {
    id: "7",
    title: "Chernobyl",
    poster: "https://placehold.co/200x300/1c2a1c/ffffff?text=CH",
    rating: 9.4,
    seasons: 1,
    year: 2019,
    genre: ["Drama", "History"],
    description:
      "The true story of the 1986 nuclear disaster and the extraordinary individuals who made an incredible sacrifice to prevent a larger catastrophe.",
  },
  {
    id: "8",
    title: "Deadwood",
    poster: "https://placehold.co/200x300/2a1500/ffffff?text=DW",
    rating: 8.6,
    seasons: 3,
    year: 2004,
    genre: ["Western", "Drama"],
    description:
      "Set in the lawless gold-rush town of Deadwood, South Dakota, this gritty series follows the complicated power dynamics between outlaws, merchants, and new settlers.",
  },
];

const MOCK_RATINGS = [
  {
    id: "1",
    title: "Breaking Bad",
    poster: "https://placehold.co/200x300/1a1a1a/ffffff?text=BB",
    rating: 9.5,
    seasons: 5,
    year: 2008,
    genre: ["Drama", "Crime"],
    description:
      "A high school chemistry teacher turned methamphetamine manufacturer partners with a former student to secure his family's future after being diagnosed with terminal cancer.",
    userRating: 4.5,
    howFound: "Friend recommendation",
    thoughts: "Absolutely gripping. Best TV I've seen in years.",
  },
  {
    id: "3",
    title: "Succession",
    poster: "https://placehold.co/200x300/3a1a1a/ffffff?text=SC",
    rating: 8.9,
    seasons: 4,
    year: 2018,
    genre: ["Drama", "Comedy"],
    description:
      "A dysfunctional media family competes for control of their empire as the ageing patriarch's health declines, exposing the dark side of wealth, loyalty, and ambition.",
    userRating: 5,
    howFound: "Saw it trending on Twitter",
    thoughts: "Shiv, Kendall, Roman — all brilliant. Writing is exceptional.",
  },
];

export async function getFirstPage() {
  // TODO: GET /api/series?page=1
  return MOCK_SERIES;
}

export async function search(query) {
  // TODO: GET /api/series/search?q={query}
  const q = query.toLowerCase();
  return MOCK_SERIES.filter(
    (s) =>
      s.title.toLowerCase().includes(q) ||
      s.genre.some((g) => g.toLowerCase().includes(q))
  );
}

export async function rateSeries(userId, seriesId, { howFound, thoughts, rating }) {
  // TODO: POST /api/ratings { userId, seriesId, howFound, thoughts, rating }
  console.log("rateSeries", { userId, seriesId, howFound, thoughts, rating });
}

export async function getMyRatings(userId) {
  // TODO: GET /api/ratings?userId={userId}
  return MOCK_RATINGS;
}
