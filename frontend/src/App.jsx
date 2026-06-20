import { useState } from 'react';
import { useUserId } from './hooks/useUserId';
import HamburgerMenu from './components/HamburgerMenu';
import HomeScreen from './screens/HomeScreen';
import RatedScreen from './screens/RatedScreen';
import SeriesDetailScreen from './screens/SeriesDetailScreen';
import LoginScreen from './screens/LoginScreen';
import CreateUserScreen from './screens/CreateUserScreen';

export default function App() {
  const [screen, setScreen] = useState('home');
  const [selectedSeries, setSelectedSeries] = useState(null);
  const [prevScreen, setPrevScreen] = useState('home');
  const [userId, setUserId] = useUserId();

  function navigateTo(newScreen) {
    setScreen(newScreen);
    setSelectedSeries(null);
  }

  function selectSeries(series) {
    setPrevScreen(screen);
    setSelectedSeries(series);
    setScreen('detail');
  }

  function handleLogin(id) {
    setUserId(id);
    navigateTo('home');
  }

  function handleLogout() {
    setUserId(null);
    navigateTo('home');
  }

  const headerTitle =
    screen === 'rated' ? 'My Ratings' :
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
      {screen === 'rated' && <RatedScreen />}
      {screen === 'login' && <LoginScreen onLogin={handleLogin} />}
      {screen === 'create-user' && <CreateUserScreen onLogin={handleLogin} />}
      {screen === 'detail' && selectedSeries && (
        <SeriesDetailScreen
          series={selectedSeries}
          onBack={() => navigateTo(prevScreen)}
        />
      )}
    </>
  );
}
