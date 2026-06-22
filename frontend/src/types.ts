// Mirrors backend models.rs
export interface Series {
  id: string;
  title: string;
  description: string;
  genre: string;
  year: number;
}

export interface ReviewRequest {
  series_id: string;
  user_id: string;
  tmdb_series_id: number;
  rating: number; // 1–10
  liked?: string;
  disliked?: string;
}

export interface ReviewDto {
  id: string;
  series_id: string;
  user_id: string;
  tmdb_series_id?: number;
  rating: number;
  liked?: string;
  disliked?: string;
  was_recommended: boolean;
  created_at: string;
}

export interface LoginRequest {
  username: string;
  passcode: string;
}

export interface CreateUserRequest {
  username: string;
  passcode: string;
}

// Mirrors api/handlers.rs StoredRecommendation (TmdbSeriesDetails fields flattened
// alongside the LLM confidence score and when the recommendation was stored).
export interface StoredRecommendation extends TmdbSeriesDetails {
  confidence: number;
  created_at: string;
}

// Mirrors adapters/tmdb/models.rs SeriesListItem
export interface SeriesListItem {
  id: number;
  name: string;
  overview: string;
  first_air_date: string | null;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  origin_country: string[];
  original_language: string;
  popularity: number;
  poster_path: string | null;
}

// Mirrors adapters/llm/models.rs
export interface LlmRecommendation {
  title: string;
  genre: string;
  confidence: number;
}

export interface SeriesRecommendations {
  recommendations: LlmRecommendation[];
  taste_summary: string;
}

export interface TmdbSeriesDetails {
  id: number;
  name: string;
  overview: string;
  first_air_date: string | null;
  vote_average: number;
  genres: { id: number; name: string }[];
  poster_path: string | null;
}

// Frontend display shape (normalised from SeriesListItem)
export interface DisplaySeries {
  id: number; // TMDB ID
  title: string;
  description: string;
  year: number | null;
  rating: number; // TMDB vote_average 0–10
  genre: string[];
  poster: string | null;
  confidence?: number; // LLM match score (0–100), present on stored recommendations
  createdAt?: string; // when the recommendation was stored; used to group by generation batch
}
