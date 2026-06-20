import { useState } from 'react';
import HamburgerMenu from './components/HamburgerMenu';
import HomeScreen from './screens/HomeScreen';
import RatedScreen from './screens/RatedScreen';
import SeriesDetailScreen from './screens/SeriesDetailScreen';
import LoginScreen from './screens/LoginScreen';

export default function App() {
  const [screen, setScreen] = useState('home');
  const [selectedSeries, setSelectedSeries] = useState(null);
  const [prevScreen, setPrevScreen] = useState('home');

  function navigateTo(newScreen) {
    setScreen(newScreen);
    setSelectedSeries(null);
  }

  function selectSeries(series) {
    setPrevScreen(screen);
    setSelectedSeries(series);
    setScreen('detail');
  }

  const headerTitle = screen === 'rated' ? 'My Ratings' : screen === 'login' ? 'Login' : '';

  return (
    <>
      <header className="app-header">
        <span className="app-title">{headerTitle}</span>
        <HamburgerMenu currentScreen={screen} onNavigate={navigateTo} />
      </header>

      {screen === 'home' && <HomeScreen onSelectSeries={selectSeries} />}
      {screen === 'rated' && <RatedScreen />}
      {screen === 'login' && <LoginScreen onSuccess={() => navigateTo('home')} />}
      {screen === 'detail' && selectedSeries && (
        <SeriesDetailScreen
          series={selectedSeries}
          onBack={() => navigateTo(prevScreen)}
        />
      )}
    </>
  );
}
