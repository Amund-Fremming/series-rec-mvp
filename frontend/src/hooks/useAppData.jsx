import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useUserId } from './useUserId';
import {
  getSeriesPage,
  getUserReviews,
  getSeriesById,
  getStoredRecommendations,
  getLlmRecommendations,
} from '../client';

// Central store that pre-loads everything the app needs on first load, then hands
// cached data to each screen so navigation is instant (no per-screen refetch).
// The only thing NOT pre-loaded is generating fresh AI picks — that stays an
// explicit, on-demand action.

const AppDataContext = createContext(null);

async function loadEnrichedReviews(userId) {
  const reviews = await getUserReviews(userId);
  const enriched = await Promise.all(
    reviews.map(async (review) => {
      if (!review.tmdb_series_id) return null;
      try {
        const series = await getSeriesById(review.tmdb_series_id);
        return { review, series };
      } catch {
        return null;
      }
    }),
  );
  return enriched.filter(Boolean);
}

export function AppDataProvider({ children }) {
  const { userId } = useUserId();

  // ── Popular series (page cache; page 1 pre-loaded on first load) ──
  const [popularPages, setPopularPages] = useState({});
  const [popularError, setPopularError] = useState(null);
  const popularCache = useRef({}); // synchronous mirror of popularPages
  const pendingPages = useRef(new Set());

  const loadPopularPage = useCallback((page) => {
    if (popularCache.current[page] || pendingPages.current.has(page)) return;
    pendingPages.current.add(page);
    setPopularError(null);
    getSeriesPage(page)
      .then((data) => {
        popularCache.current = { ...popularCache.current, [page]: data };
        setPopularPages(popularCache.current);
      })
      .catch(() => setPopularError('Failed to load series. Please try again.'))
      .finally(() => pendingPages.current.delete(page));
  }, []);

  // Pre-load the first popular page once.
  useEffect(() => {
    loadPopularPage(1);
  }, [loadPopularPage]);

  // ── Rated reviews (enriched with series details) ──
  const [reviews, setReviews] = useState(null); // null = not loaded yet
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState(null);

  const refreshReviews = useCallback(() => {
    if (!userId) {
      setReviews(null);
      return Promise.resolve();
    }
    setReviewsLoading(true);
    setReviewsError(null);
    return loadEnrichedReviews(userId)
      .then((items) => setReviews(items))
      .catch(() => setReviewsError('Failed to load your reviews.'))
      .finally(() => setReviewsLoading(false));
  }, [userId]);

  // ── Stored recommendations ──
  const [recommendations, setRecommendations] = useState(null);
  const [recsLoading, setRecsLoading] = useState(false);
  const [recsError, setRecsError] = useState(null);
  const [generating, setGenerating] = useState(false);

  const refreshRecommendations = useCallback(() => {
    if (!userId) {
      setRecommendations(null);
      return Promise.resolve();
    }
    setRecsLoading(true);
    setRecsError(null);
    return getStoredRecommendations(userId)
      .then((items) => setRecommendations(items))
      .catch(() => setRecsError('Failed to load recommendations.'))
      .finally(() => setRecsLoading(false));
  }, [userId]);

  const generateRecommendations = useCallback(async () => {
    if (!userId || generating) return;
    setGenerating(true);
    setRecsError(null);
    try {
      await getLlmRecommendations(userId);
      const stored = await getStoredRecommendations(userId);
      setRecommendations(stored);
    } catch {
      setRecsError('Failed to generate recommendations. Please try again.');
    } finally {
      setGenerating(false);
    }
  }, [userId, generating]);

  // Pre-load (and reset on sign-in/out) the per-user data.
  useEffect(() => {
    if (!userId) {
      setReviews(null);
      setRecommendations(null);
      return;
    }
    refreshReviews();
    refreshRecommendations();
  }, [userId, refreshReviews, refreshRecommendations]);

  const value = useMemo(
    () => ({
      popular: {
        pages: popularPages,
        error: popularError,
        loadPage: loadPopularPage,
      },
      reviews: {
        items: reviews,
        loading: reviewsLoading || (userId != null && reviews === null),
        error: reviewsError,
        refresh: refreshReviews,
      },
      recommendations: {
        items: recommendations,
        loading: recsLoading || (userId != null && recommendations === null),
        error: recsError,
        generating,
        generate: generateRecommendations,
        refresh: refreshRecommendations,
      },
    }),
    [
      popularPages,
      popularError,
      loadPopularPage,
      reviews,
      reviewsLoading,
      reviewsError,
      refreshReviews,
      recommendations,
      recsLoading,
      recsError,
      generating,
      generateRecommendations,
      refreshRecommendations,
      userId,
    ],
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error('useAppData must be used within an AppDataProvider');
  return ctx;
}
