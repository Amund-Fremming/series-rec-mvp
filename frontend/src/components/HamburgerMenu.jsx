import { useState, useEffect, useRef } from 'react';

export default function HamburgerMenu({ currentScreen, onNavigate, userId, onLogout, onAuth }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  function navigate(screen) {
    setOpen(false);
    onNavigate(screen);
  }

  return (
    <div className="hamburger-menu" ref={ref}>
      <button
        className="hamburger-btn"
        onClick={() => setOpen((o) => !o)}
        aria-label="Menu"
        aria-expanded={open}
      >
        <span />
        <span />
        <span />
      </button>

      {open && (
        <div className="hamburger-dropdown">
          <button
            className={currentScreen === 'home' ? 'active' : ''}
            onClick={() => navigate('home')}
          >
            Home
          </button>
          <button
            className={currentScreen === 'rated' ? 'active' : ''}
            onClick={() => navigate('rated')}
          >
            My Ratings
          </button>
          <button
            className={currentScreen === 'recommendations' ? 'active' : ''}
            onClick={() => navigate('recommendations')}
          >
            Recommendations
          </button>
          {userId ? (
            <button onClick={() => { setOpen(false); onLogout(); }}>
              Log out
            </button>
          ) : (
            <>
              <button onClick={() => { setOpen(false); onAuth('login'); }}>
                Login
              </button>
              <button onClick={() => { setOpen(false); onAuth('register'); }}>
                Create Account
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
