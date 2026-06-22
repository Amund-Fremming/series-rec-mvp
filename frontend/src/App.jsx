import { useState } from "react";
import { useUserId } from "./hooks/useUserId";
import HamburgerMenu from "./components/HamburgerMenu";
import Logo from "./components/Logo";
import AuthModal from "./components/AuthModal";
import HomeScreen from "./screens/HomeScreen";
import RatedScreen from "./screens/RatedScreen";
import SeriesDetailScreen from "./screens/SeriesDetailScreen";
import ReviewDetailScreen from "./screens/ReviewDetailScreen";
import RecommendationsScreen from "./screens/RecommendationsScreen";

export default function App() {
  const [screen, setScreen] = useState("home");
  const [selectedSeries, setSelectedSeries] = useState(null);
  const [selectedReview, setSelectedReview] = useState(null);
  const [prevScreen, setPrevScreen] = useState("home");
  const { userId, setUserId } = useUserId();
  const [authMode, setAuthMode] = useState(null);

  function navigateTo(newScreen) {
    setScreen(newScreen);
    setSelectedSeries(null);
    setSelectedReview(null);
  }

  function goBack() {
    setScreen(prevScreen);
  }

  function selectSeries(series) {
    setPrevScreen(screen);
    setSelectedSeries(series);
    setScreen("detail");
  }

  function selectReview(series, review) {
    setPrevScreen(screen);
    setSelectedSeries(series);
    setSelectedReview(review);
    setScreen("review-detail");
  }

  function handleAuthLogin(id) {
    setUserId(id);
    setAuthMode(null);
  }

  function handleLogout() {
    setUserId(null);
    navigateTo("home");
  }

  function openAuth(mode = "login") {
    setAuthMode(mode);
  }

  const headerTitle =
    screen === "rated"
      ? "My Ratings"
      : screen === "recommendations"
        ? "Recommendations"
        : screen === "home"
          ? "Popular"
          : "";

  return (
    <>
      <header className="app-header">
        <div className="app-header-left">
          <Logo onClick={() => navigateTo("home")} />
          {headerTitle && <h1 className="app-title">{headerTitle}</h1>}
        </div>
        <HamburgerMenu
          currentScreen={screen}
          onNavigate={navigateTo}
          userId={userId}
          onLogout={handleLogout}
          onAuth={openAuth}
        />
      </header>

      {screen === "home" && <HomeScreen onSelectSeries={selectSeries} />}
      {screen === "rated" && (
        <RatedScreen
          userId={userId}
          onSelectReview={selectReview}
          onAuth={openAuth}
        />
      )}
      {screen === "recommendations" && (
        <RecommendationsScreen
          userId={userId}
          onSelectSeries={selectSeries}
          onAuth={openAuth}
        />
      )}
      {screen === "detail" && selectedSeries && (
        <SeriesDetailScreen
          series={selectedSeries}
          onBack={goBack}
          onAuth={openAuth}
        />
      )}
      {screen === "review-detail" && selectedSeries && selectedReview && (
        <ReviewDetailScreen
          series={selectedSeries}
          review={selectedReview}
          onBack={goBack}
          onViewSeries={() => selectSeries(selectedSeries)}
        />
      )}

      {authMode && (
        <AuthModal
          initialMode={authMode}
          onLogin={handleAuthLogin}
          onClose={() => setAuthMode(null)}
        />
      )}
    </>
  );
}
