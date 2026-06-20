import type { CreateUserRequest, DisplaySeries, RecommendationDto, ReviewDto, ReviewRequest, SeriesListItem, TmdbSeriesDetails } from './types';

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w300';

const GENRE_MAP: Record<number, string> = {
  10759: 'Action & Adventure',
  16: 'Animation',
  35: 'Comedy',
  80: 'Crime',
  99: 'Documentary',
  18: 'Drama',
  10751: 'Family',
  10762: 'Kids',
  9648: 'Mystery',
  10763: 'News',
  10764: 'Reality',
  10765: 'Sci-Fi & Fantasy',
  10766: 'Soap',
  10767: 'Talk',
  10768: 'War & Politics',
  37: 'Western',
};

function toDisplaySeries(item: SeriesListItem): DisplaySeries {
  const year = item.first_air_date ? parseInt(item.first_air_date.slice(0, 4), 10) : null;
  return {
    id: item.id,
    title: item.name,
    description: item.overview,
    year,
    rating: item.vote_average,
    genre: item.genre_ids.map((gid) => GENRE_MAP[gid]).filter(Boolean) as string[],
    poster: item.poster_path ? `${TMDB_IMAGE_BASE}${item.poster_path}` : null,
  };
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, init);
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json() as Promise<T>;
}

export async function login(username: string, passcode: string): Promise<string> {
  const res = await fetch('/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, passcode }),
  });
  if (!res.ok) throw new Error('Invalid username or passcode');
  const userId = (await res.json()) as string | null;
  if (!userId) throw new Error('Invalid username or passcode');
  return userId;
}

export async function getSeriesPage(page = 0): Promise<DisplaySeries[]> {
  const items = await apiFetch<SeriesListItem[]>(`/series?page=${page}`);
  return items.map(toDisplaySeries);
}

export async function searchSeries(query: string): Promise<DisplaySeries[]> {
  const items = await apiFetch<SeriesListItem[]>(`/series/search?q=${encodeURIComponent(query)}`);
  return items.map(toDisplaySeries);
}

export async function saveReview(payload: ReviewRequest): Promise<ReviewDto> {
  return apiFetch<ReviewDto>('/series/review', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export async function deleteReview(reviewId: string): Promise<void> {
  const res = await fetch(`/series/review/${reviewId}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(`API error ${res.status}`);
}

export async function createUser(payload: CreateUserRequest): Promise<string> {
  const res = await fetch('/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (res.status === 409) throw new Error('Username already taken');
  if (!res.ok) throw new Error('Failed to create account');
  return res.json() as Promise<string>;
}

export async function getUserReview(userId: string, tmdbSeriesId: number): Promise<ReviewDto | null> {
  return apiFetch<ReviewDto | null>(`/series/review?user_id=${userId}&tmdb_series_id=${tmdbSeriesId}`);
}

export async function getUserReviews(userId: string): Promise<ReviewDto[]> {
  return apiFetch<ReviewDto[]>(`/series/reviews/${userId}`);
}

export async function getSeriesById(tmdbId: number): Promise<TmdbSeriesDetails> {
  return apiFetch<TmdbSeriesDetails>(`/series/${tmdbId}`);
}

export async function getRecommendations(userId: string): Promise<RecommendationDto[]> {
  return apiFetch<RecommendationDto[]>(`/series/recommendations/${userId}`);
}

export async function generateRecommendations(userId: string): Promise<DisplaySeries[]> {
  const items = await apiFetch<SeriesListItem[]>(`/series/recommendations/${userId}`, {
    method: 'POST',
  });
  return items.map(toDisplaySeries);
}
