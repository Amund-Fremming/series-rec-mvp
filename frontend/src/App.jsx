import { useState } from 'react';
import { useUserId } from './hooks/useUserId';
import HamburgerMenu from './components/HamburgerMenu';
import LoginModal from './components/LoginModal';
import HomeScreen from './screens/HomeScreen';
import RatedScreen from './screens/RatedScreen';
import SeriesDetailScreen from './screens/SeriesDetailScreen';
import ReviewDetailScreen from './screens/ReviewDetailScreen';
import LoginScreen from './screens/LoginScreen';
import CreateUserScreen from './screens/CreateUserScreen';
import RecommendationsScreen from './screens/RecommendationsScreen';

export default function App() {
  const [screen, setScreen] = useState('home');
  const [selectedSeries, setSelectedSeries] = useState(null);
  const [selectedReview, setSelectedReview] = useState(null);
  const [prevScreen, setPrevScreen] = useState('home');
  const [userId, setUserId] = useUserId();
  const [showLoginModal, setShowLoginModal] = useState(false);

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
    setScreen('detail');
  }

  function selectReview(series, review) {
    setPrevScreen(screen);
    setSelectedSeries(series);
    setSelectedReview(review);
    setScreen('review-detail');
  }

  function handleLogin(id) {
    setUserId(id);
    setShowLoginModal(false);
    navigateTo('home');
  }

  function handleModalLogin(id) {
    setUserId(id);
    setShowLoginModal(false);
  }

  function handleLogout() {
    setUserId(null);
    navigateTo('home');
  }

  function handleLoginRequired() {
    setShowLoginModal(true);
  }

  const headerTitle =
    screen === 'rated' ? 'My Ratings' :
    screen === 'recommendations' ? 'Recommendations' :
    screen === 'login' ? 'Login' :
    screen === 'create-user' ? 'Create Account' : '';

  return (
    <>
      <header className="app-header">
        <span className="app-title">{headerTitle}</span>
        <HamburgerMenu
          currentScreen={screen}
          onNavigate={navigateTo}
          userId={userId}
          onLogout={handleLogout}
        />
      </header>

      {screen === 'home' && <HomeScreen onSelectSeries={selectSeries} />}
      {screen === 'rated' && (
        <RatedScreen userId={userId} onSelectReview={selectReview} />
      )}
      {screen === 'recommendations' && (
        <RecommendationsScreen
          userId={userId}
          onSelectSeries={selectSeries}
          onLoginRequired={handleLoginRequired}
        />
      )}
      {screen === 'login' && <LoginScreen onLogin={handleLogin} />}
      {screen === 'create-user' && <CreateUserScreen onLogin={handleLogin} />}
      {screen === 'detail' && selectedSeries && (
        <SeriesDetailScreen
          series={selectedSeries}
          userId={userId}
          onBack={goBack}
          onLoginRequired={handleLoginRequired}
        />
      )}
      {screen === 'review-detail' && selectedSeries && selectedReview && (
        <ReviewDetailScreen
          series={selectedSeries}
          review={selectedReview}
          onBack={goBack}
          onViewSeries={() => selectSeries(selectedSeries)}
        />
      )}

      {showLoginModal && (
        <LoginModal
          onLogin={handleModalLogin}
          onClose={() => setShowLoginModal(false)}
          onRegister={() => { setShowLoginModal(false); navigateTo('create-user'); }}
        />
      )}
    </>
  );
}
